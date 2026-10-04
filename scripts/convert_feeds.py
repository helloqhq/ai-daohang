#!/usr/bin/env python3
"""Run once: official pages/API -> private RSS XML + import manifest, no daemon."""
import argparse
import datetime as dt
import gzip
import json
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from collector.adapters import HTTP, SourceError
from collector.storage import digest, now_iso, parse_time, read_json, write_json
from converters.official import SOURCES, convert, rss_xml

class Fetch:
    def __init__(self,cache,timeout,offline=False):
        self.http=HTTP(cache,timeout);self.offline=offline;self.requests=0;self.cache_hits=0
    def __call__(self,url,data=None):
        signature=url if data is None else url+'\n'+json.dumps(data,sort_keys=True)
        path=self.http.cache_dir/(digest(signature)+'.json')
        if self.offline:
            saved=read_json(path)
            if not saved:raise SourceError('离线转换缓存缺少原始页面：'+url)
            self.cache_hits+=1;return saved['body']
        self.requests+=1
        if data is None:return self.http.get(url)[0]
        request=urllib.request.Request(url,data=json.dumps(data).encode(),headers={'User-Agent':'AI-Daohang/1.0 RSS converter','Content-Type':'application/json','Accept':'application/json'})
        try:
            with urllib.request.urlopen(request,context=self.http.context,timeout=self.http.timeout) as response:
                raw=response.read()
                if response.headers.get('Content-Encoding')=='gzip':raw=gzip.decompress(raw)
                body=raw.decode('utf-8')
        except urllib.error.HTTPError as exc:raise SourceError('转换入口 HTTP '+str(exc.code),'blocked' if exc.code in (401,403,429) else 'failed') from exc
        write_json(path,{'url':url,'body':body});return body

def main():
    parser=argparse.ArgumentParser(description='独立按需转换官方页面为本地 RSS；不推进在线覆盖，不发布')
    parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]));parser.add_argument('--sources',nargs='+',choices=SOURCES)
    parser.add_argument('--since');parser.add_argument('--until');parser.add_argument('--offline',action='store_true',help='只重放原始页面缓存，不联网')
    args=parser.parse_args();root=Path(args.root).resolve();config=read_json(root/'config/collection.json');sources=read_json(root/'config/sources.json')['sources']
    state=read_json(root/'.collector/state.json',{'sources':{}});materials=read_json(root/'.collector/materials.json',{})
    pending_path=root/'.collector/pending.jsonl'
    pending_ids={json.loads(line)['id'] for line in pending_path.read_text(encoding='utf-8').splitlines() if line.strip()} if pending_path.exists() else set()
    until=parse_time(args.until) if args.until else dt.datetime.now(dt.timezone.utc)
    if not until:parser.error('--until 时间无效')
    output=root/'.collector/converted';output.mkdir(parents=True,exist_ok=True)
    fetch=Fetch(root/'.collector/conversion-cache',config.get('request_timeout_seconds',18),args.offline)
    results=[]
    for source in sources:
        if not source.get('enabled') or source['id'] not in (args.sources or SOURCES):continue
        if not args.sources and not source.get('offline_conversion'):continue
        old=state['sources'].get(source['id'],{})
        since=parse_time(args.since) if args.since else parse_time(old.get('uncovered_from')) or parse_time(old.get('fetched_through')) or until-dt.timedelta(days=config.get('first_lookback_days',3))
        if not since or since>until:parser.error('--since 时间无效')
        result={'source_id':source['id'],'source_url':source['url'],'since':since.isoformat(),'until':until.isoformat(),'generated_at':now_iso()}
        try:
            if source.get('verification')!='verified':raise SourceError('来源身份待核实')
            reconcile={m['url'] for m in materials.values() if m['source_id']==source['id'] and (m['id'] in pending_ids or not m.get('published_at') or m.get('material_scope')=='metadata_only')}
            rows=convert(source,fetch,since,until,reconcile)
            xml=rss_xml(source,rows);path=output/(source['id']+'.xml');path.write_text(xml,encoding='utf-8')
            result.update(status='partial',file=str(path.relative_to(root)),sha256=digest(xml),entries=len(rows),dated=sum(bool(x['published_at']) for x in rows),full_text=sum(x['full'] for x in rows),latest=max((x['published_at'] for x in rows if x['published_at']),default=None))
        except (SourceError,ValueError,KeyError,TypeError,OSError,urllib.error.URLError,ET.ParseError) as exc:
            result.update(status=getattr(exc,'status','failed'),note=str(exc),note_en='Offline conversion failed; the original source window remains unconfirmed.')
        results.append(result);print(json.dumps(result,ensure_ascii=False),flush=True)
    manifest={'schema_version':'1','generated_at':now_iso(),'requests':fetch.requests,'cache_hits':fetch.cache_hits,'sources':results}
    write_json(output/'manifest.json',manifest)
    print(json.dumps({'manifest':str(output/'manifest.json'),'converted':sum(bool(r.get('file')) for r in results),'failed':sum(not r.get('file') for r in results),'requests':fetch.requests,'cache_hits':fetch.cache_hits},ensure_ascii=False))
    return 1 if any(not r.get('file') for r in results) else 0

if __name__=='__main__':raise SystemExit(main())
