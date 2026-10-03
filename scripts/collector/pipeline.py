"""Collect materials, resume decisions, publish validated static snapshots."""
import concurrent.futures
import datetime as dt
import json
import xml.etree.ElementTree as ET
from collections import defaultdict
from .adapters import ADAPTERS, HTTP, SourceError, in_window, feed_address, parse_feed
from .storage import Store, RULES_VERSION, digest, now_iso, parse_time, read_json, write_json
from .validation import ValidationError, require, validate_events

class Pipeline:
    def __init__(self, root):
        self.store = Store(root)
        self.root = self.store.root
        self.config = read_json(self.root/'config/collection.json', {})
        self.rules_version = str(self.config.get('rules_version', RULES_VERSION))
        self.entities = read_json(self.root/'config/entities.json')['entities']
        source_config = read_json(self.root/'config/sources.json')
        self.sources, self.people = source_config['sources'], source_config.get('people', [])
        self.platforms = read_json(self.root/'config/platforms.json', {'platforms': []})['platforms']
        self.schema = read_json(self.root/'schemas/event.schema.json')
        self.validate_config()

    def validate_config(self):
        entity_ids = [e['id'] for e in self.entities]
        source_ids = [s['id'] for s in self.sources]
        require(len(entity_ids)==len(set(entity_ids)), '关注对象标识重复')
        require(len(source_ids)==len(set(source_ids)), '来源标识重复')
        for source in self.sources:
            require(set(source['entity_ids']) <= set(entity_ids), '来源引用不存在的对象')
            require(source['adapter']=='rss', '信息获取统一使用 RSS/Atom')

    def catalog(self):
        return {'entities': self.entities, 'sources': [{**s,'feed_url':feed_address(s,self.config)} for s in self.sources], 'people': self.people, 'platforms': self.platforms}

    def collect(self, entity_ids=None, now=None, since_override=None):
        until = parse_time(now) if now else dt.datetime.now(dt.timezone.utc)
        require(until is not None, '采集时间无效')
        state, materials = self.store.state(), self.store.materials()
        active={e['id'] for e in self.entities if e.get('enabled')}
        selected = [s for s in self.sources if s.get('enabled') and set(s['entity_ids']).intersection(active) and (not entity_ids or set(s['entity_ids']).intersection(entity_ids))]
        def one(source):
            old = dict(state['sources'].get(source['id'], {}))
            address=feed_address(source,self.config)
            signature=digest(address or 'unconfigured')
            if old.get('subscription_fingerprint')!=signature:
                previous=parse_time(old.get('fetched_through'))
                if previous:
                    gap=previous-dt.timedelta(hours=self.config.get('overlap_hours',48))
                    old['uncovered_from']=min(gap,parse_time(old.get('uncovered_from')) or gap).isoformat()
                old.pop('fetched_through',None);old.pop('reviewed_through',None)
            old['subscription_fingerprint']=signature
            since = parse_time(old.get('fetched_through')) or until-dt.timedelta(days=self.config.get('first_lookback_days',3))
            if old.get('fetched_through'):
                since -= dt.timedelta(hours=self.config.get('overlap_hours',48))
            if old.get('uncovered_from'):
                since = min(since, parse_time(old['uncovered_from']))
            if since_override:
                since = parse_time(since_override)
                require(since is not None and since <= until, '采集起始时间无效')
            result = {**old, 'source_id': source['id'], 'last_attempt_at': until.isoformat(), 'attempted_from': since.isoformat(), 'attempted_to': until.isoformat()}
            if source.get('verification') != 'verified':
                return source, [], {**result, 'status':'not_attempted','note':'账号或来源身份待核实','uncovered_from':old.get('uncovered_from',since.isoformat())}, 0
            if not address:
                if source.get('feed_provider')=='offline':
                    return source,[],{**old,'source_id':source['id'],'status':old.get('status','not_attempted'),
                                     'note':old.get('note','离线转换待运行'),'uncovered_from':old.get('uncovered_from',since.isoformat())},0
                return source,[],{**result,'status':'not_attempted','note':'RSS 订阅待配置','uncovered_from':old.get('uncovered_from',since.isoformat())},0
            http = HTTP(self.store.work/'cache', self.config.get('request_timeout_seconds',18))
            try:
                records, complete, note = ADAPTERS['rss']({**source,'feed_address':address},http,since,until)
                result.update(status='success' if complete else 'partial', note=note)
                if complete:
                    result.update(fetched_through=until.isoformat(), fetched_from=since.isoformat())
                    result.pop('uncovered_from',None)
                else:
                    result['uncovered_from']=old.get('uncovered_from',since.isoformat())
                return source,records,result,http.hits
            except (SourceError, ValueError, KeyError) as exc:
                result.update(status=getattr(exc,'status','failed'),note=str(exc),uncovered_from=old.get('uncovered_from',since.isoformat()))
                return source,[],result,http.hits
        with self.store.lock():
            cutoff=dt.datetime.now(dt.timezone.utc).timestamp()-self.config.get('cache_retention_days',14)*86400
            for path in (self.store.work/'cache').glob('*.json'):
                if path.stat().st_mtime<cutoff:path.unlink()
            # State was read before locking only for read-only initialization; reload for transaction.
            state, materials = self.store.state(), self.store.materials()
            results = []
            with concurrent.futures.ThreadPoolExecutor(max_workers=self.config.get('workers',6)) as pool:
                for source, records, status, hits in pool.map(one, selected):
                    for record in records:
                        material = self.store.save_material(source,record)
                        materials[material['id']] = material
                    state['sources'][source['id']] = status
                    results.append({'source_id':source['id'],'status':status['status'],'materials':len(records),'cache_hits':hits,'note':status['note']})
            write_json(self.store.work/'materials.json',materials)
            write_json(self.store.work/'state.json',state)
            self.store.save_pending(self.rules_version)
            report={'at':until.isoformat(),'sources':results,'pending':len(self.store.pending(entity_ids,self.rules_version))}
            write_json(self.store.work/'runs'/('collect-'+until.strftime('%Y%m%dT%H%M%S')+'.json'),report)
            return report

    def ingest(self, records):
        """Store parsed offline RSS evidence. Never advances online coverage."""
        with self.store.lock():
            materials=self.store.materials()
            source_map={s['id']:s for s in self.sources}
            ids=[]
            for record in records:
                record=dict(record)
                source_id=record.pop('source_id')
                require(source_id in source_map,'导入来源未登记')
                require(source_map[source_id].get('verification')=='verified','请先核实来源身份')
                require(all(record.get(k) for k in ['title','url','content_id','text']),'导入材料缺少原文')
                require(record.get('material_scope','partial_text') in ('metadata_only','partial_text','full_text'),'材料范围无效')
                require(record['url'].startswith(('https://','http://')),'原文必须为 HTTP(S) 链接')
                published=record.get('published_at')
                require(not published or parse_time(published),'材料时间无效')
                record.setdefault('date_precision','datetime' if published and 'T' in published else 'date' if published else 'unknown')
                record.setdefault('material_scope','partial_text')
                material=self.store.save_material(source_map[source_id],record)
                materials[material['id']]=material
                ids.append(material['id'])
            write_json(self.store.work/'materials.json',materials)
            self.store.save_pending(self.rules_version)
            return {'imported':ids,'coverage':'离线订阅导入未推进在线订阅完整覆盖进度'}

    def import_feed(self,source_id,body,since,until,reconcile=False):
        source=next((s for s in self.sources if s['id']==source_id),None)
        require(source is not None,'订阅来源不存在')
        root=ET.fromstring(body)
        if source.get('feed_provider')=='offline':
            require(root.findtext('channel/{urn:ai-daohang:offline-feed}source_id')==source_id,'转换 RSS 来源标识不匹配')
            require(root.findtext('channel/link')==source['url'],'转换 RSS 原始入口不匹配')
        records,_,note=parse_feed(body,source,since,until,feed_address(source,self.config))
        if reconcile:
            existing={m['content_id'] for m in self.store.pending(rules_version=self.rules_version) if m['source_id']==source_id}
            all_records,_,_=parse_feed(body,source,dt.datetime.min.replace(tzinfo=dt.timezone.utc),until,feed_address(source,self.config))
            merged={r['content_id']:r for r in records}
            merged.update({r['content_id']:r for r in all_records if r['content_id'] in existing})
            records=list(merged.values())
        result=self.ingest([{**r,'source_id':source_id} for r in records])
        if source.get('feed_provider')=='offline':
            with self.store.lock():
                state=self.store.state();old=state['sources'].get(source_id,{})
                state['sources'][source_id]={**old,'subscription_fingerprint':digest('unconfigured'),
                    'status':'partial','last_attempt_at':now_iso(),'offline_import_at':now_iso(),
                    'fetched_through':None,'reviewed_through':None,'uncovered_from':old.get('uncovered_from') or since.isoformat(),
                    'note':'离线 RSS 已导入，在线覆盖未确认','note_en':'Offline RSS imported; online coverage remains unconfirmed.'}
                write_json(self.store.work/'state.json',state)
        result['note']='本地订阅导入；'+note
        return result

    def import_converted(self,manifest):
        results=[];prepared=[]
        for entry in manifest['sources']:
            source=next((s for s in self.sources if s['id']==entry['source_id']),None)
            require(source is not None and source['url']==entry['source_url'],'转换清单来源不匹配')
            require(source.get('verification')=='verified','转换来源身份未核实')
            since,until=parse_time(entry['since']),parse_time(entry['until'])
            require(since is not None and until is not None and since<=until,'转换时间窗无效')
            if entry.get('file'):
                path=(self.root/entry['file']).resolve()
                require(path.is_relative_to(self.store.work.resolve()),'转换文件必须位于本地采集目录')
                # Hash the emitted bytes before XML's newline normalization.
                body=path.read_bytes().decode('utf-8');require(digest(body)==entry['sha256'],'转换 RSS 已变化，请重新生成清单')
                parsed=ET.fromstring(body)
                require(parsed.findtext('channel/{urn:ai-daohang:offline-feed}source_id')==source['id'],'转换 RSS 来源标识不匹配')
                require(parsed.findtext('channel/link')==source['url'],'转换 RSS 原始入口不匹配')
                parse_feed(body,source,since,until)
                prepared.append((source,entry,body,since,until))
            else:
                require(entry.get('status') in ('failed','blocked'),'转换失败状态无效')
                require(parse_time(entry.get('generated_at')) is not None and bool(entry.get('note')) and bool(entry.get('note_en')),'转换失败记录缺少时间或双语说明')
                prepared.append((source,entry,None,None,None))
        # Validate the whole manifest before importing any source.
        for source,entry,body,since,until in prepared:
            if body is not None:
                result=self.import_feed(source['id'],body,since,until,True)
                results.append({'source_id':source['id'],'imported':len(result['imported'])})
            elif source.get('feed_provider')=='offline':
                with self.store.lock():
                    state=self.store.state();old=state['sources'].get(source['id'],{})
                    state['sources'][source['id']]={**old,'subscription_fingerprint':digest('unconfigured'),
                        'status':entry['status'],'last_attempt_at':entry['generated_at'],
                        'fetched_through':None,'reviewed_through':None,'uncovered_from':old.get('uncovered_from') or entry['since'],
                        'note':entry['note'],'note_en':entry['note_en']}
                    write_json(self.store.work/'state.json',state)
                results.append({'source_id':source['id'],'status':entry['status'],'note':entry['note']})
        self.refresh()
        return {'sources':results,'coverage':'离线转换不推进在线完整覆盖'}

    def make_snapshot(self, events, decisions=None, state=None):
        catalog=self.catalog()
        validate_events(events,catalog,self.schema)
        state=state if state is not None else self.store.state()
        decisions=decisions if decisions is not None else self.store.decisions()
        materials=self.store.materials()
        stamp=now_iso()
        snapshot_id=digest(json.dumps(events,sort_keys=True,ensure_ascii=False)+stamp)[:16]
        common={'schema_version':'1.1','snapshot_id':snapshot_id}
        months=defaultdict(list)
        locations={}
        old_locations=self.store.snapshot()[1].get('event_locations',{})
        for event in events:
            month=old_locations.get(event['id'],(event['published_at'] or event['first_collected_at'])[:7])
            months[month].append(event)
            locations[event['id']]=month
        opml=ET.Element('opml',version='2.0');head=ET.SubElement(opml,'head');ET.SubElement(head,'title').text='AI 简报 · AI 信息订阅';body=ET.SubElement(opml,'body')
        for source in catalog['sources']:
            if source.get('enabled') and source.get('feed_url'):
                ET.SubElement(body,'outline',text=source['name'],title=source['name'],type='rss',xmlUrl=source['feed_url'],htmlUrl=source['url'],category=source['platform'])
        ET.indent(opml)
        files={'catalog.json':{**common,**catalog},'subscriptions.opml':ET.tostring(opml,encoding='unicode',xml_declaration=True)}
        month_index=[]
        for month,items in sorted(months.items(),reverse=True):
            items.sort(key=lambda e:e['published_at'] or '',reverse=True)
            known=[e['published_at'] for e in items if e['published_at']]
            path=f'events/{month}.json'
            files[path]={**common,'events':items}
            month_index.append({'month':month,'path':path,'count':len(items),'min_date':min(known) if known else None,'max_date':max(known) if known else None})
        coverage=[]
        for source in self.sources:
            old=state['sources'].get(source['id'],{})
            if old.get('subscription_fingerprint')!=digest(feed_address(source,self.config) or 'unconfigured'):
                old={**old,'status':'not_attempted','note':'离线转换待运行' if source.get('feed_provider')=='offline' else '订阅地址已变更，待重新检查' if feed_address(source,self.config) else 'RSS 订阅待配置','fetched_through':None,'reviewed_through':None}
            pending=[m for m in materials.values() if m['source_id']==source['id'] and not self.decision_current(m,decisions.get(m['id']))]
            summary={'source_id':source['id'],'status':old.get('status','not_attempted'),'verification':source.get('verification','pending'),
                     'last_attempt_at':old.get('last_attempt_at'),'fetched_through':old.get('fetched_through'),
                     'reviewed_through':old.get('reviewed_through'),'uncovered_from':old.get('uncovered_from'),'pending_count':len(pending),'note':old.get('note','尚未采集')}
            coverage.append(summary)
            if old.get('note_en'):summary['note_en']=old['note_en']
            if old.get('offline_import_at'):summary['offline_import_at']=old['offline_import_at']
        files['coverage.json']={**common,'sources':coverage}
        files['index.json']={**common,'generated_at':stamp,'months':month_index,'event_locations':locations,'total_events':len(events)}
        return files

    def decision_current(self, material, decision):
        return bool(decision and decision.get('action') in ('keep','reject') and decision.get('fingerprint')==material['fingerprint']
                    and decision.get('rules_version')==self.rules_version and decision.get('parser_version')==material['parser_version'])

    def refresh(self):
        with self.store.lock():
            events=self.store.snapshot()[3]
            self.store.replace_snapshot(self.make_snapshot(events))
        return {'events':len(events),'snapshot':'public/data/index.json'}

    def apply(self, packet):
        with self.store.lock():
            materials,decisions,state=self.store.materials(),self.store.decisions(),self.store.state()
            events={e['id']:e for e in self.store.snapshot()[3]}
            updates={e['id']:e for e in packet.get('events',[])}
            require(len(updates)==len(packet.get('events',[])), '提交包含重复事件标识')
            for event_id,event in updates.items():
                if event_id in events:
                    require(event['first_collected_at']==events[event_id]['first_collected_at'],'修订不能改变首次采集时间')
                if event_id in events:
                    old=events[event_id]
                    changed=any(event.get(k)!=old.get(k) for k in ('title_zh','summary_zh','key_points_zh','importance_reason_zh','translation_zh','published_at','kind'))
                    changed=changed or any(old.get(k) is not None and event.get(k)!=old.get(k) for k in ('title_en','summary_en','key_points_en','importance_reason_en','translation_en'))
                    if changed:
                        require(len(event.get('corrections',[]))>len(old.get('corrections',[])),'实质更正必须记录原因与依据')
                for evidence in event['sources']:
                    matching=next((m for m in materials.values() if m['source_id']==evidence['source_id'] and m['content_id']==evidence.get('content_id') and m['url']==evidence['url']),None)
                    inherited=any(evidence==s for s in events.get(event_id,{}).get('sources',[]))
                    require(matching or inherited,'事件依据没有对应原始材料')
                events[event_id]=event
            for item in packet.get('decisions',[]):
                material=materials.get(item['material_id'])
                require(material is not None,'候选材料不存在')
                require(item.get('fingerprint')==material['fingerprint'],'候选已变化，请重新读取')
                require(item.get('action') in ('keep','reject','defer'),'处置动作无效')
                require(bool(item.get('reason_zh')),'每项判断需要理由')
                if item['action']=='keep':
                    event=events.get(item.get('event_id'))
                    require(event is not None,'保留内容必须关联事件')
                    require(any(s['source_id']==material['source_id'] and s.get('content_id')==material['content_id'] for s in event['sources']),'事件必须引用该材料原始依据')
                    require(parse_time(material.get('published_at')) is not None,'发布时间未知，先核查时间窗')
                    require(not material.get('prerelease') or event['kind']=='preview','预览版本必须标为预告')
                decisions[material['id']]={**item,'rules_version':self.rules_version,'parser_version':material['parser_version'],'at':now_iso()}
            # Do not fabricate source-wide reviewed progress for partial acquisition or deferred candidates.
            for source_id,info in state['sources'].items():
                pending=[m for m in materials.values() if m['source_id']==source_id and not self.decision_current(m,decisions.get(m['id']))]
                if not pending and info.get('fetched_through'):
                    info['reviewed_through']=info['fetched_through']
            for event_id in updates:
                if event_id not in {e['id'] for e in self.store.snapshot()[3]}:
                    require(any(d.get('action')=='keep' and d.get('event_id')==event_id and self.decision_current(materials.get(mid,{}),d) for mid,d in decisions.items()),'新事件需要保留判断')
            values=list(events.values())
            files=self.make_snapshot(values,decisions,state)
            self.store.replace_snapshot(files,{'decisions.json':decisions,'state.json':state})
            self.store.save_pending(self.rules_version)
            return {'events':len(values),'remaining':len(self.store.pending(rules_version=self.rules_version))}

    def validate(self):
        catalog,index,coverage,events=self.store.snapshot()
        validate_events(events,catalog,self.schema)
        snapshot=index.get('snapshot_id')
        require(snapshot and catalog.get('snapshot_id')==snapshot and coverage.get('snapshot_id')==snapshot,'数据快照版本不一致')
        require(len(events)==index['total_events'],'事件总数不一致')
        require(set(index.get('event_locations',{}))=={e['id'] for e in events},'事件索引不一致')
        for month in index['months']:
            value=read_json(self.root/'public/data'/month['path'])
            require(value['snapshot_id']==snapshot,'月份快照版本不一致')
            require(len(value['events'])==month['count'],'月份数量不一致')
        return {'valid':True,'events':len(events),'sources':len(catalog['sources']),'entities':len(catalog['entities'])}
