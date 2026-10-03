#!/usr/bin/env python3
"""RSS/Atom -> compact queue -> read evidence -> validated static JSON."""
import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from collector.pipeline import Pipeline
from collector.adapters import feed_address,parse_feed
from collector.storage import read_json,parse_time
from collector.validation import ValidationError

def main():
    parser=argparse.ArgumentParser(description='统一 RSS/Atom 采集；无 token 预算或模型 API 依赖')
    parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]))
    sub=parser.add_subparsers(dest='command',required=True)
    fetch=sub.add_parser('fetch');fetch.add_argument('--entities',nargs='+');fetch.add_argument('--now');fetch.add_argument('--since')
    queue=sub.add_parser('queue');queue.add_argument('--entities',nargs='+');queue.add_argument('--offset',type=int,default=0);queue.add_argument('--count',type=int,default=20)
    read=sub.add_parser('read');read.add_argument('material_id');read.add_argument('--offset',type=int,default=0);read.add_argument('--characters',type=int)
    apply=sub.add_parser('apply');apply.add_argument('file')
    feeds=sub.add_parser('feeds');feeds.add_argument('--opml')
    imp=sub.add_parser('import-feed');imp.add_argument('source_id');imp.add_argument('file');imp.add_argument('--since',required=True);imp.add_argument('--until',required=True)
    sub.add_parser('refresh');sub.add_parser('validate')
    args=parser.parse_args();pipeline=Pipeline(args.root)
    if args.command=='fetch':result=pipeline.collect(args.entities,args.now,args.since)
    elif args.command=='feeds':
        values=[{'source_id':s['id'],'name':s['name'],'enabled':s['enabled'],'platform':s['platform'],'feed_url':feed_address(s,pipeline.config),'provider':s['feed_provider']} for s in pipeline.sources]
        if args.opml:
            root=ET.Element('opml',version='2.0');head=ET.SubElement(root,'head');ET.SubElement(head,'title').text='知更 · AI 信息订阅'
            body=ET.SubElement(root,'body')
            for item in values:
                if item['enabled'] and item['feed_url']:ET.SubElement(body,'outline',text=item['name'],title=item['name'],type='rss',xmlUrl=item['feed_url'],category=item['platform'])
            ET.indent(root);ET.ElementTree(root).write(args.opml,encoding='utf-8',xml_declaration=True)
            result={'exported':args.opml,'subscriptions':sum(bool(s['feed_url'] and s['enabled']) for s in values)}
        else:result={'total':len(values),'configured':sum(bool(s['feed_url']) for s in values),'subscriptions':values}
    elif args.command=='queue':
        values=pipeline.store.pending(args.entities,pipeline.rules_version);start=max(0,args.offset);count=max(1,args.count);page=values[start:start+count]
        result={'total':len(values),'offset':start,'next_offset':start+len(page) if start+len(page)<len(values) else None,'items':[{k:v for k,v in m.items() if k in ('id','source_id','entity_ids','title','published_at','date_precision','url','material_scope','fingerprint','prerelease')} for m in page]}
    elif args.command=='read':
        material=pipeline.store.materials().get(args.material_id)
        if not material:raise ValidationError('材料不存在')
        text=(pipeline.root/material['text_path']).read_text(encoding='utf-8');start=max(0,args.offset);end=None if args.characters is None else start+max(1,args.characters)
        result={**material,'text':text[start:end],'total_characters':len(text),'next_offset':end if end and end<len(text) else None}
    elif args.command=='import-feed':
        source=next((s for s in pipeline.sources if s['id']==args.source_id),None)
        if not source:raise ValidationError('订阅来源不存在')
        since,until=parse_time(args.since),parse_time(args.until)
        if not since or not until or since>until:raise ValidationError('导入时间窗无效')
        records,complete,note=parse_feed(Path(args.file).read_text(encoding='utf-8'),source,since,until,feed_address(source,pipeline.config))
        result=pipeline.ingest([{**r,'source_id':source['id']} for r in records]);result['note']='本地订阅导入；'+note
    elif args.command=='apply':result=pipeline.apply(read_json(args.file))
    elif args.command=='refresh':result=pipeline.refresh()
    else:result=pipeline.validate()
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    try:main()
    except (ValidationError,OSError,ValueError,KeyError) as exc:
        print(json.dumps({'error':str(exc)},ensure_ascii=False),file=sys.stderr);sys.exit(1)
