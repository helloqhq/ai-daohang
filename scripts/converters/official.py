"""Official pages -> local RSS. This module never writes collector state."""
import datetime as dt
import html
import json
import re
import urllib.parse
import xml.etree.ElementTree as ET
from .html import Node, parse_html
from collector.adapters import clean_text, in_window, SourceError
from collector.storage import parse_time

CONTENT='http://purl.org/rss/1.0/modules/content/'
AUDIT='urn:ai-daohang:offline-feed'
ET.register_namespace('content',CONTENT);ET.register_namespace('audit',AUDIT)
SOURCES=('anthropic-official','deepseek-official','qwen-official','meta-official',
         'zhipu-official','moonshot-official','minimax-official','tencent-official',
         'grok-official','qoder-official','trae-official','zcode-official','dario-blog',
         'google-official','openai-x','zcode-x','elon-musk-x','demis-hassabis-x',
         'jeff-dean-x','tibo-x','openai-tiktok','mark-zuckerberg-threads',
         'devin-changelog','cognition-blog','glm-coding-notices','minimax-plan-notices',
         'google-developers-blog')


def date_text(text):
    m=re.search(r'\b(20\d{2})\s*[-年]\s*(\d{1,2})\s*[-月]\s*(\d{1,2})(?:\s*日)?',text)
    if m:
        try:return dt.date(*map(int,m.groups())).isoformat()
        except ValueError:return None
    m=re.search(r'\b([A-Z][a-z]{2,8})\s+(\d{1,2}),\s*(20\d{2})',text)
    if m:
        for fmt in ('%b %d, %Y','%B %d, %Y'):
            try:return dt.datetime.strptime(m.group(),fmt).date().isoformat()
            except ValueError:pass
    return None


def item(title,url,text,date=None,full=False,date_kind='published'):
    return {'title':title.strip(),'url':url,'text':text.strip(),'published_at':date,
            'full':full,'date_kind':date_kind if date else 'unknown'}


def absolute(base,href):
    url=urllib.parse.urljoin(base,href)
    if urllib.parse.urlparse(url).scheme not in ('http','https'):raise SourceError('转换条目链接无效')
    return url


def nearby(link,base):
    """Use only a card containing one canonical article, never a whole list's date."""
    n=link
    while n.parent and n.tag not in ('body','main','nav'):
        urls={absolute(base,a.attrs['href']).split('#')[0] for a in n.nodes('a') if a.attrs.get('href') and not a.attrs['href'].startswith('#')}
        if n is not link and len(urls)>1:break
        text=n.text();date=date_text(text)
        if date and len(text)<3000:return n,date
        n=n.parent
    return link,None


def sections(tree,source):
    sid=source['id'];base=source['url'];out=[]
    if sid in ('zhipu-official','qoder-official','devin-changelog'):
        for n in tree.nodes('div'):
            if 'update-container' not in n.attrs.get('class','').split():continue
            text=n.text().replace('\u200b','');date=date_text(n.attrs.get('id','').replace('-',' ')) or date_text(n.attrs.get('id','')) or date_text(text)
            if sid=='devin-changelog':
                label=n.attrs.get('id','').replace('-',' ').title()
                for fmt in ('%B %d %Y','%b %d %Y'):
                    try:date=dt.datetime.strptime(label,fmt).date().isoformat();break
                    except ValueError:pass
            # Duplicate date anchors on Mintlify need the version to distinguish releases.
            title=next((h.text() for tag in ('h3','h4') for h in n.nodes(tag) if h.text()),None)
            if not title:
                lines=[x.strip() for x in text.splitlines() if x.strip()];title=next((x for x in lines if not date_text(x)),source['name'])
            version=re.search(r'\b\d+\.\d+\.\d+\b',text)
            anchor=n.attrs.get('id')
            if not anchor:raise SourceError('更新段落缺少原文锚点')
            if sid=='devin-changelog':title=source['name']+' · '+(date or anchor)
            out.append(item(title,base+'#'+anchor,text,date,True))
            if version and sid!='devin-changelog':out[-1]['content_id']=base+'#'+anchor+'::'+version.group()
    elif sid in ('trae-official','deepseek-official'):
        heads=[h for h in tree.nodes('h2') if date_text(h.text())]
        for h in heads:
            siblings=h.parent.children;start=siblings.index(h);block=[]
            for n in siblings[start:]:
                if isinstance(n,Node) and n is not h and n.tag=='h2' and date_text(n.text()):break
                block.append(n.text() if isinstance(n,Node) else n)
            text='\n'.join(block).replace('\u200b','');anchor=h.attrs.get('id')
            if not anchor:raise SourceError('更新段落缺少原文锚点')
            out.append(item(h.text().replace('\u200b',''),base+'#'+anchor,text,date_text(h.text()),True))
    elif sid=='zcode-official':
        for article in tree.nodes('article'):
            card=article.parent.parent;text=card.text();version=re.search(r'Release v([\d.]+)',text)
            if version:out.append(item('ZCode '+version.group(1),base,article.text(),date_text(text),True))
            if version:out[-1]['content_id']=base+'::'+version.group(1)
    return out


def article_text(tree,sid):
    # Only known article containers. A layout change must not import navigation as full text.
    markers={'anthropic-official':('rich-text','Body-module'),
             'google-official':('rich-text','article__body','article-body','blog-detail__body'),
             'google-developers-blog':('inner-block-content',),
             'dario-blog':('rich-text','w-richtext','essay-content'),
             'grok-official':('prose',), 'moonshot-official':('prose','blog-content'),
             'minimax-official':('prose','blog-content'), 'meta-official':('article-body',)}
    candidates=[n for n in tree.nodes() if n.tag in ('div','section','article') and any(m in n.attrs.get('class','') for m in markers.get(sid,())) and n.text()]
    # Outer containers include all rich-text blocks; exclude nested duplicates.
    selected=[n for n in candidates if not any(n is child for p in candidates if p is not n for child in p.nodes())]
    if selected:return '\n\n'.join(n.text() for n in selected)
    article=tree.first('article')
    return article.text() if article else ''


def page_date(tree):
    for n in tree.nodes('meta'):
        if n.attrs.get('property')=='article:published_time':
            value=n.attrs.get('content');return value if parse_time(value) else None
    for n in tree.nodes('time'):
        value=n.attrs.get('datetime') or date_text(n.text())
        if parse_time(value):return value
    for n in tree.nodes():
        if 'post-date' in n.attrs.get('class','').split():
            value=date_text(n.text())
            if value:return value
    for n in tree.nodes('script'):
        if n.attrs.get('type')!='application/ld+json':continue
        try:data=json.loads(n.raw_text())
        except ValueError:continue
        for obj in objects(data):
            value=obj.get('datePublished')
            if parse_time(value):return value
    return None


def objects(value):
    if isinstance(value,dict):
        yield value
        for child in value.values():yield from objects(child)
    elif isinstance(value,list):
        for child in value:yield from objects(child)


def balanced(text,start):
    """Read a serialized object as data; never execute hydration JavaScript."""
    depth=0;quoted=False;escape=False
    for i in range(start,len(text)):
        c=text[i]
        if quoted:
            if escape:escape=False
            elif c=='\\':escape=True
            elif c=='"':quoted=False
        elif c=='"':quoted=True
        elif c=='{':depth+=1
        elif c=='}':
            depth-=1
            if depth==0:return text[start:i+1]
    raise SourceError('公开帖子数据不完整')


def js_string(text,key):
    m=re.search(r'\b'+re.escape(key)+r':("(?:\\.|[^"\\])*")',text)
    return json.loads(m.group(1)) if m else None


def js_object(text,key):
    """Read only a direct object property, excluding quoted/retweeted descendants."""
    depth=0;quoted=False;escape=False
    for i,c in enumerate(text):
        if quoted:
            if escape:escape=False
            elif c=='\\':escape=True
            elif c=='"':quoted=False
            continue
        if c=='"':quoted=True;continue
        if depth==1 and text.startswith(key+':',i) and text[:i].rstrip()[-1:] in ('{',','):
            match=re.match(re.escape(key)+r':(?:\$R\[\d+\]=)?',text[i:])
            start=i+match.end()
            return balanced(text,start) if text[start:start+1]=='{' else None
        if c in '{[':depth+=1
        elif c in '}]':depth-=1
    return None


def x_posts(tree,source):
    username=urllib.parse.urlparse(source['url']).path.strip('/');out=[]
    for script in tree.nodes('script'):
        text=script.raw_text()
        for m in re.finditer(r'tweet_results:\$R\[\d+\]=\{id:"[^"]*",rest_id:"(\d+)",result:\$R\[\d+\]=',text):
            start=m.end()
            if text[start:start+1]!='{':continue
            tweet=balanced(text,start)
            core=js_object(tweet,'core')
            if not core or (js_string(core,'screen_name') or '').lower()!=username.lower():continue
            payload=js_object(tweet,'details')
            if not payload:continue
            date=re.search(r'created_at_ms:(\d+)',payload);body=js_string(payload,'full_text')
            if not date or not body:continue
            # Long-form posts have their own text; do not substitute a quoted post's text.
            note=js_object(tweet,'note_tweet') or js_object(tweet,'note_tweet_results')
            if note:body=js_string(note,'text') or body
            timestamp=dt.datetime.fromtimestamp(int(date.group(1))/1000,dt.timezone.utc).isoformat()
            out.append(item(username+' · '+body.splitlines()[0][:110],f'https://x.com/{username}/status/{m.group(1)}',body,timestamp,False))
    if not out:raise SourceError('X 公开页未提供可核实正文和日期的帖子','blocked')
    return out


def social_json(tree,source):
    out=[];sid=source['id']
    for script in tree.nodes('script'):
        if script.attrs.get('type')!='application/json':continue
        try:data=json.loads(script.raw_text())
        except ValueError:continue
        for obj in objects(data):
            if sid=='openai-tiktok' and obj.get('createTime') and obj.get('desc') and obj.get('author',{}).get('uniqueId','').lower()=='openai':
                date=dt.datetime.fromtimestamp(int(obj['createTime']),dt.timezone.utc).isoformat()
                out.append(item(obj['desc'][:110],f"https://www.tiktok.com/@openai/video/{obj['id']}",obj['desc'],date))
            elif sid=='mark-zuckerberg-threads' and obj.get('taken_at') and obj.get('user',{}).get('username')=='zuck' and obj.get('code'):
                body=(obj.get('caption') or {}).get('text')
                if body:out.append(item(body[:110],f"https://www.threads.com/@zuck/post/{obj['code']}",body,dt.datetime.fromtimestamp(obj['taken_at'],dt.timezone.utc).isoformat()))
    if not out:raise SourceError('公开账号页未提供帖子列表，需要可读取的登录态或订阅服务','blocked')
    return out


def convert(source,fetch,since,until,reconcile=()):
    sid=source['id'];base=source['url']
    if sid=='qwen-official':
        data=json.loads(fetch('https://qwen.ai/api/v2/article/retrieval?language=zh-CN&type=qwen_ai'))
        return [item(x['title'],'https://qwen.ai/blog?id='+x['path'],clean_text(x.get('content') or x['extra'].get('introduction') or ''),x['extra'].get('date'),bool(x.get('content'))) for x in data['data']['articles']]
    if sid=='tencent-official':
        out=[];page=1
        while True:
            data=json.loads(fetch('https://api.hunyuan.tencent.com/api/blog/publicList',{'pageNum':page,'pageSize':100,'needFilter':True}))
            if data.get('code')!=0:raise SourceError('混元公开文章接口未返回成功结果')
            rows=data['data']['list']
            for x in rows:
                slug=x.get('customUrl') or str(x['id']);date=x.get('displayPublishTime')
                # The website displays a date in China, rather than createdAt/updatedAt.
                day=dt.datetime.fromtimestamp(date,dt.timezone(dt.timedelta(hours=8))).date().isoformat() if date else None
                out.append(item(x['title'],'https://hunyuan.tencent.com/research/'+slug,x.get('content') or x.get('desc') or '',day,bool(x.get('content'))))
            if len(out)>=data['data']['totalNum']:return out
            if not rows:raise SourceError('混元文章列表分页不完整')
            page+=1
    tree=parse_html(fetch(base))
    if sid in ('glm-coding-notices','minimax-plan-notices'):
        paths=('/devpack/notice/','/devpack/transition') if sid=='glm-coding-notices' else ('/docs/m-plan/',)
        links={absolute(base,a.attrs['href']) for a in tree.nodes('a') if a.attrs.get('href') and any(p in a.attrs['href'] for p in paths)}
        if sid=='minimax-plan-notices':
            links={u for u in links if any(p in u for p in ('notice','discount'))}
        out=[]
        for url in sorted(links):
            detail=parse_html(fetch(url));body=next((n.text() for n in detail.nodes() if n.attrs.get('id')=='content'),None)
            if not body:raise SourceError('官方通知缺少正文容器')
            # Campaign windows and migration deadlines are not publication dates.
            label=re.search(r'Publication date:\s*([^\n]+)',body,re.I)
            date=page_date(detail) or (date_text(label.group(1)) if label else None)
            heading=detail.first('h1')
            out.append(item(heading.text() if heading else source['name'],url,body,date,True))
        if not out:raise SourceError('未找到官方套餐通知链接')
        return out
    if sid=='cognition-blog':
        out=[]
        for card in tree.nodes('li'):
            link=next((a for a in card.nodes('a') if a.attrs.get('href','').startswith('/blog/')),None)
            label=next((match for n in card.nodes() if (match:=re.fullmatch(r'(\d{2})\.(\d{2})\.(\d{2})',n.text()))),None)
            if not link or not label:continue
            month,day,year=map(int,label.groups());date=dt.date(2000+year,month,day).isoformat();url=absolute(base,link.attrs['href'])
            title=next((h.text() for tag in ('h2','h3') for h in card.nodes(tag)),None) or link.text().splitlines()[0]
            row=item(title,url,card.text(),date)
            if in_window(date,since,until) or url in reconcile:
                detail=parse_html(fetch(url));body=article_text(detail,sid)
                if body:row.update(text=body,full=True)
            out.append(row)
        if not out:raise SourceError('未找到带日期的 Cognition 官方文章列表')
        return out
    if source['platform']=='x':return x_posts(tree,source)
    if sid in ('openai-tiktok','mark-zuckerberg-threads'):return social_json(tree,source)
    out=sections(tree,source)
    if sid in ('zhipu-official','qoder-official','trae-official','deepseek-official','zcode-official','devin-changelog'):
        if not out:raise SourceError('未找到带日期的官方更新段落，转换规则需要复核')
        return out
    if sid in ('google-official','google-developers-blog'):
        xml=ET.fromstring(fetch(source['feed_url']))
        from collector.adapters import parse_feed
        all_records,_,_=parse_feed(ET.tostring(xml,encoding='unicode'),source,dt.datetime.min.replace(tzinfo=dt.timezone.utc),until)
        links=[item(x['title'],x['url'],x['text'],x['published_at']) for x in all_records]
    else:
        links=[]
        paths={'anthropic-official':'/news/','moonshot-official':'/en/blog/','minimax-official':'/blog/','grok-official':'/news/','meta-official':'/blog/','dario-blog':('/essay/','/post/')}
        wanted=paths[sid];wanted=(wanted,) if isinstance(wanted,str) else wanted
        for a in tree.nodes('a'):
            href=a.attrs.get('href','')
            if not any(p in urllib.parse.urlparse(href).path and urllib.parse.urlparse(href).path.rstrip('/')!=p.rstrip('/') for p in wanted):continue
            card,date=nearby(a,base);title=next((h.text() for tag in ('h2','h3','h4') for h in card.nodes(tag) if h.text()),None) or a.text()
            if not title and date:title=next((line.strip() for line in card.text().splitlines() if line.strip() and not date_text(line)),None)
            if not title:continue
            if sid=='moonshot-official' and not date:continue
            url=absolute(base,href)
            if urllib.parse.urlparse(url).hostname.removeprefix('www.')!=urllib.parse.urlparse(base).hostname.removeprefix('www.'):continue
            if sid=='dario-blog':url=url.replace('https://www.darioamodei.com/','https://darioamodei.com/')
            links.append(item(title,url,card.text(),date))
    # Prefer the dated article card over a duplicate navigation link.
    links.sort(key=lambda row:bool(row['published_at']),reverse=True)
    seen=set()
    for row in links:
        url=row['url']
        if url in seen:continue
        seen.add(url)
        if in_window(row['published_at'],since,until) or url in reconcile:
            detail=parse_html(fetch(url));body=article_text(detail,sid);date=page_date(detail)
            if sid=='google-developers-blog':
                label=next((n.text() for n in detail.nodes() if 'published-date' in n.attrs.get('class','').split()),None)
                if label:date=date_text(label.title().replace('Sept.','Sep').replace('.',''))
            if body:row.update(text=body,full=True)
            if sid=='anthropic-official' and detail.first('h1'):
                row['title']=detail.first('h1').text()
            if date and not row['published_at']:row.update(published_at=date,date_kind='published')
            if sid=='dario-blog':
                label=next((n.text() for n in detail.nodes() if 'post-date' in n.attrs.get('class','').split()),None)
                if label:row['date_label']=label
            if row['text']==row['title']:row['full']=False
        out.append(row)
    if not out:raise SourceError('未找到官方文章列表，转换规则需要复核')
    return out


def rss_xml(source,rows):
    root=ET.Element('rss',version='2.0');channel=ET.SubElement(root,'channel')
    ET.SubElement(channel,'title').text=source['name'];ET.SubElement(channel,'link').text=source['url']
    ET.SubElement(channel,'description').text='On-demand offline conversion of the registered official source.'
    ET.SubElement(channel,'{'+AUDIT+'}source_id').text=source['id']
    seen=set()
    for row in rows:
        content_id=row.get('content_id',row['url'])
        if content_id in seen:continue
        seen.add(content_id);entry=ET.SubElement(channel,'item')
        for key,value in [('title',row['title']),('link',row['url']),('guid',content_id)]:ET.SubElement(entry,key).text=value
        ET.SubElement(entry,'{'+AUDIT+'}content_id').text=content_id
        if row.get('date_label'):ET.SubElement(entry,'{'+AUDIT+'}date_label').text=row['date_label']
        date=row.get('published_at')
        if date:
            if not parse_time(date):raise SourceError('转换条目日期格式无效')
            ET.SubElement(entry,'pubDate').text=date
            ET.SubElement(entry,'{'+AUDIT+'}date_kind').text=row.get('date_kind','published')
        body=html.escape(row['text']).replace('\n','<br>')
        ET.SubElement(entry,'{'+CONTENT+'}encoded' if row['full'] else 'description').text=body
    ET.indent(root)
    return ET.tostring(root,encoding='unicode',xml_declaration=True)
