"""Small read-only HTML tree for the separate, on-demand feed converter."""
from html.parser import HTMLParser
import re

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag=tag;self.attrs=dict(attrs);self.parent=parent;self.children=[]
    def nodes(self, tag=None):
        for child in self.children:
            if isinstance(child,Node):
                if tag is None or child.tag==tag:yield child
                yield from child.nodes(tag)
    def text(self):
        if self.tag in ('script','style','svg','nav','button'):return ''
        parts=[]
        for child in self.children:
            if isinstance(child,Node):
                value=child.text()
                if child.tag in ('p','div','li','br','section','tr','h1','h2','h3','h4'):value='\n'+value+'\n'
                parts.append(value)
            else:parts.append(child)
        return re.sub(r'[ \t]+',' ',re.sub(r'\n\s*\n+','\n\n',''.join(parts))).strip()
    def raw_text(self):
        return ''.join(c.raw_text() if isinstance(c,Node) else c for c in self.children)
    def first(self,tag=None,**attrs):
        return next((n for n in self.nodes(tag) if all(n.attrs.get(k)==v for k,v in attrs.items())),None)

class Tree(HTMLParser):
    void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self,body):
        super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root;self.feed(body)
    def handle_starttag(self,tag,attrs):
        n=Node(tag,attrs,self.current);self.current.children.append(n)
        if tag not in self.void:self.current=n
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in self.void:self.handle_endtag(tag)
    def handle_endtag(self,tag):
        n=self.current
        while n.parent:
            if n.tag==tag:self.current=n.parent;return
            n=n.parent
    def handle_data(self,data):self.current.children.append(data)

def parse_html(body):return Tree(body).root
