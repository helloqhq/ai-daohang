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
    entries=[e for e in root.iter() if local(e.tag) in ('item','entry')]
    for entry in entries:
        def field(*names):return next((c for c in entry if local(c.tag) in names),None)
        title=field('title');date=field('published','pubDate')
        if date is None:date=field('updated','date')
        published=date.text.strip() if date is not None and date.text else None
        if published and not parse_time(published):
            try:published=email.utils.parsedate_to_datetime(published).isoformat()
            except (ValueError,TypeError):published=None
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
        if not in_window(published,since,until):continue
        content=field('encoded','content')
        full=content is not None
        if content is None:content=field('description','summary')
        raw=''.join(content.itertext()) if content is not None else ''
        # XHTML Atom content uses real XML children rather than escaped HTML.
        if content is not None and list(content):
            raw=''.join(ET.tostring(c,encoding='unicode') for c in content)
        text=clean_text(raw)
        scope='full_text' if full else 'partial_text'
        if source.get('platform') in ('youtube','tiktok'):scope='metadata_only'
        name=html.unescape(''.join(title.itertext()).strip()) if title is not None else url
        if not text:scope='metadata_only';text=name
        records.append({'title':name or url,'url':url,'content_id':url,'text':text,
                        'published_at':published,'date_precision':'datetime' if published and 'T' in published else 'date' if published else 'unknown',
                        'material_scope':scope,'feed_url':feed_url,
                        'prerelease':bool(source.get('platform')=='github' and re.search(r'alpha|beta|nightly|preview|canary|(?:^|[.-])rc[.\d-]',name,re.I))})
    # Empty feed or undated entries cannot establish historical coverage.
    complete=bool(dates and min(dates)<=since and len(dates)==len(entries))
    if not entries:note='订阅没有条目，无法确认历史时间窗'
    elif complete:note='订阅条目覆盖查询起点，已读取该订阅时间窗'
    else:note='订阅历史有限或存在未知日期，完整时间窗尚未确认'
    return records,complete,note

def rss(source,http,since,until):
    body,_=http.get(source['feed_address'])
    return parse_feed(body,source,since,until,source['feed_address'])

ADAPTERS={'rss':rss}
