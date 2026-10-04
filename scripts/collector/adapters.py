"""One RSS/Atom reader for every platform; no upstream-site scraping."""
import datetime as dt
import email.utils
import gzip
import html
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from .storage import digest, parse_time, read_json, write_json

class SourceError(Exception):
    def __init__(self,message,status='failed'):
        super().__init__(message);self.status=status

class HTTP:
    def __init__(self,cache_dir,timeout=18):
        self.cache_dir=Path(cache_dir);self.timeout=timeout;self.hits=0
        ca=Path('/etc/ssl/cert.pem')
        self.context=ssl.create_default_context(cafile=str(ca)) if ca.exists() else ssl.create_default_context()
    def get(self,url,refresh=True):
        if urllib.parse.urlparse(url).scheme not in ('http','https'):
            raise SourceError('订阅必须是公开 HTTP(S) 地址')
        path=self.cache_dir/(digest(url)+'.json');cached=read_json(path,{})
        if cached and not refresh:
            self.hits+=1;return cached['body'],cached.get('headers',{})
        headers={'User-Agent':'AI-Daohang/1.0 RSS reader','Accept':'application/atom+xml,application/rss+xml,application/xml,text/xml','Accept-Encoding':'gzip'}
        for key,name in [('etag','If-None-Match'),('last-modified','If-Modified-Since')]:
            if cached.get('headers',{}).get(key):headers[name]=cached['headers'][key]
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=headers),context=self.context,timeout=self.timeout) as response:
                raw=response.read()
                if response.headers.get('Content-Encoding')=='gzip':raw=gzip.decompress(raw)
                body=raw.decode(response.headers.get_content_charset() or 'utf-8',errors='replace')
                response_headers={k.lower():v for k,v in response.headers.items()}
        except urllib.error.HTTPError as exc:
            if exc.code==304 and cached:
                self.hits+=1;return cached['body'],cached.get('headers',{})
            raise SourceError(f'RSS HTTP {exc.code}','blocked' if exc.code in (401,403,429) else 'failed') from exc
        except (urllib.error.URLError,TimeoutError,OSError) as exc:
            raise SourceError('RSS 无法读取：'+type(exc).__name__) from exc
        # Keep raw XML locally. Validation follows before source progress is recorded.
        write_json(path,{'url':url,'body':body,'headers':response_headers})
        return body,response_headers

class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.parts=[];self.skip=0
    def handle_starttag(self,tag,attrs):
        tag=tag.rsplit(':',1)[-1]
        if tag in ('script','style'):self.skip+=1
        if tag in ('p','div','li','br','h1','h2','h3','pre','section'):self.parts.append('\n')
    def handle_endtag(self,tag):
        tag=tag.rsplit(':',1)[-1]
        if tag in ('script','style') and self.skip:self.skip-=1
    def handle_data(self,text):
        if not self.skip:self.parts.append(text)
    def value(self):return re.sub(r'\n[ \t]*\n+','\n\n',''.join(self.parts)).strip()

def clean_text(value):
    parser=Text();parser.feed(value);return parser.value()

def local(tag):return tag.rsplit('}',1)[-1]

def in_window(value,since,until):
    parsed=parse_time(value)
    if not parsed:return True
    if len(value)==10:return since.date()<=parsed.date()<=until.date()
    return since<=parsed<=until

def feed_address(source,config):
    if source.get('feed_provider')=='offline':return None
    if source.get('feed_url'):return source['feed_url']
    if source.get('rsshub_route') and config.get('rsshub_base_url'):
        return config['rsshub_base_url'].rstrip('/')+'/'+source['rsshub_route'].lstrip('/')
    return None

def parse_feed(body,source,since,until,feed_url=None):
    try:root=ET.fromstring(body)
    except ET.ParseError as exc:raise SourceError('订阅内容不是有效 RSS/Atom XML') from exc
    if local(root.tag) not in ('rss','RDF','feed'):
        raise SourceError('返回页面不是 RSS/Atom 订阅')
    records,dates=[],[]
    valid_links=0
    entries=[e for e in root.iter() if local(e.tag) in ('item','entry')]
    for entry in entries:
        def field(*names):return next((c for c in entry if local(c.tag) in names),None)
        title=field('title');date=field('published','pubDate')
        date_kind='published'
        if date is None:date=field('updated','date')
        if date is not None and local(date.tag)=='updated':date_kind='updated'
        declared_kind=entry.find('{urn:ai-daohang:offline-feed}date_kind')
        if declared_kind is not None and declared_kind.text in ('published','updated'):
            date_kind=declared_kind.text
        published=date.text.strip() if date is not None and date.text else None
        if published and not parse_time(published):
            try:published=email.utils.parsedate_to_datetime(published).isoformat()
            except (ValueError,TypeError):published=None
        if published and source.get('feed_date_precision')=='date':
            published=parse_time(published).date().isoformat()
        if published and parse_time(published):dates.append(parse_time(published))
        else:published=None
        links=[c for c in entry if local(c.tag)=='link']
        link=next((c for c in links if c.attrib.get('rel','alternate')=='alternate'),None)
        url=(link.attrib.get('href') or link.text or '').strip() if link is not None else ''
        if not url and source.get('platform')=='youtube':
            video=next((n.text for n in entry.iter() if local(n.tag)=='videoId'),None)
            if video:url='https://www.youtube.com/watch?v='+video
        if urllib.parse.urlparse(url).scheme not in ('http','https'):
            continue
        valid_links+=1
        if not in_window(published,since,until):continue
        # Media RSS content describes an attachment, not article text.
        body_tags=('{http://purl.org/rss/1.0/modules/content/}encoded',
                   '{http://www.w3.org/2005/Atom}content','content')
        content=next((c for c in entry if c.tag in body_tags),None)
        full=False;text=''
        for candidate,is_full in ((content,True),(field('description','summary'),False)):
            if candidate is None:continue
            raw=''.join(candidate.itertext())
            # XHTML Atom content uses real XML children rather than escaped HTML.
            if list(candidate):raw=''.join(ET.tostring(c,encoding='unicode') for c in candidate)
            text=clean_text(raw)
            if text:full=is_full;break
        scope='full_text' if full else 'partial_text'
        if source.get('platform') in ('youtube','tiktok'):scope='metadata_only'
        name=html.unescape(''.join(title.itertext()).strip()) if title is not None else url
        if not text or text==name:scope='metadata_only';text=name
        declared_id=entry.find('{urn:ai-daohang:offline-feed}content_id')
        content_id=declared_id.text if declared_id is not None and declared_id.text else url
        records.append({'title':name or url,'url':url,'content_id':content_id,'text':text,
                        'published_at':published,'date_precision':'datetime' if published and 'T' in published else 'date' if published else 'unknown',
                        'date_kind':date_kind if published else 'unknown',
                        'material_scope':scope,'feed_url':feed_url,
                        'prerelease':bool(source.get('platform')=='github' and re.search(r'alpha|beta|nightly|preview|canary|(?:^|[.-])rc[.\d-]',name,re.I))})
        label=entry.findtext('{urn:ai-daohang:offline-feed}date_label')
        if label:records[-1]['date_label']=label
    # Empty feed or undated entries cannot establish historical coverage.
    complete=bool(dates and min(dates)<=since and len(dates)==len(entries) and valid_links==len(entries))
    if source.get('platform') in ('x','threads','tiktok'):
        complete=False
        note='账号订阅仅提供有限帖子列表，完整时间窗尚未确认'
    elif not entries:note='订阅没有条目，无法确认历史时间窗'
    elif complete:note='订阅条目覆盖查询起点，已读取该订阅时间窗'
    else:note='订阅历史有限或存在未知日期，完整时间窗尚未确认'
    if source.get('feed_provider')=='community':
        built=root.findtext('channel/lastBuildDate')
        try:generated=parse_time(built) or parse_time(email.utils.parsedate_to_datetime(built).isoformat())
        except (ValueError,TypeError):generated=None
        if not generated or not until-dt.timedelta(days=1)<=generated<=until+dt.timedelta(minutes=5):
            complete=False;note='社区订阅生成时间缺失或过旧，完整时间窗尚未确认'
    return records,complete,note

def rss(source,http,since,until):
    body,_=http.get(source['feed_address'])
    records,complete,note=parse_feed(body,source,since,until,source['feed_address'])
    address=urllib.parse.urlparse(source['feed_address'])
    # GitHub ignores page= on Atom feeds; after= the last tag supplies older entries.
    if address.hostname!='github.com' or not address.path.endswith('/releases.atom'):
        return records,complete,note
    history=ET.fromstring(body)
    seen=set();merged={r['content_id']:r for r in records}
    while not complete:
        root=ET.fromstring(body)
        entries=[e for e in root if local(e.tag)=='entry']
        if not entries:break
        links=[c for c in entries[-1] if local(c.tag)=='link' and c.attrib.get('rel','alternate')=='alternate']
        last=urllib.parse.urlparse(links[0].attrib.get('href','')) if links else None
        prefix=address.path.removesuffix('.atom')+'/tag/'
        if not last or last.hostname!=address.hostname or not last.path.startswith(prefix):break
        tag=urllib.parse.unquote(last.path[len(prefix):])
        if not tag or tag in seen:
            note='订阅历史分页重复，完整时间窗尚未确认';break
        seen.add(tag)
        query=dict(urllib.parse.parse_qsl(address.query));query.pop('page',None);query['after']=tag
        next_url=urllib.parse.urlunparse(address._replace(query=urllib.parse.urlencode(query)))
        try:
            body,_=http.get(next_url)
            page=ET.fromstring(body)
            history.extend(e for e in page if local(e.tag)=='entry')
            older,complete,note=parse_feed(ET.tostring(history,encoding='unicode'),source,since,until,source['feed_address'])
        except (SourceError,ET.ParseError):
            note='订阅历史分页读取失败，已保留取得的条目';break
        merged.update({r['content_id']:r for r in older})
    return list(merged.values()),complete,note

ADAPTERS={'rss':rss}
