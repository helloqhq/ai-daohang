"""Regressions for observed upstream layouts and offline coverage boundaries."""
import datetime as dt
import json
import subprocess
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from converters.official import convert, rss_xml, date_text, article_text
from converters.html import parse_html
from collector.adapters import parse_feed, SourceError
from collector.storage import digest, read_json, write_json
import test_pipeline as pipeline_tests
from collector.validation import ValidationError

START=dt.datetime(2026,9,30,tzinfo=dt.timezone.utc)
END=dt.datetime(2026,10,3,tzinfo=dt.timezone.utc)

class ConversionTests(unittest.TestCase):
    def source(self,sid,url='https://example.com/changelog',platform='web'):
        return {'id':sid,'url':url,'name':sid,'platform':platform}
    def test_duplicate_date_anchors_keep_distinct_qoder_versions(self):
        body=''.join('<div class="update-container" id="october-1-2026"><h3>Qoder '+v+'</h3><p>October 1, 2026</p><p>Change '+v+'</p></div>' for v in ('0.1.0','0.1.1'))
        source=self.source('qoder-official');rows=convert(source,lambda *a:body,START,END)
        parsed,_,_=parse_feed(rss_xml(source,rows),source,START,END)
        self.assertEqual(len(parsed),2);self.assertNotEqual(parsed[0]['content_id'],parsed[1]['content_id'])
        self.assertEqual(parsed[0]['url'],parsed[1]['url'])
        self.assertEqual(parsed[0]['published_at'],'2026-10-01')
    def test_chinese_dates_and_trae_sections_do_not_mix_versions(self):
        body='<div><h2 id="one">2026 年 10 月 01 日（功能）</h2><p>Version 1</p><h2 id="two">2026 年 09 月 29 日</h2><p>Version 2</p></div>'
        rows=convert(self.source('trae-official'),lambda *a:body,START,END)
        self.assertEqual(rows[0]['published_at'],'2026-10-01');self.assertNotIn('Version 2',rows[0]['text'])
        self.assertIsNone(date_text('January 2026'))
    def test_kimi_overlay_links_beat_navigation_and_deduplicate(self):
        body='<nav><a href="/en/blog/post">Nav title</a></nav><div><a href="/en/blog/post"></a><p>Research title</p><p>2026-09-15</p></div><div><a href="/en/blog/post"></a><p>Research title</p><p>2026-09-15</p></div>'
        rows=convert(self.source('moonshot-official','https://example.com/en/blog/'),lambda *a:body,START,END)
        self.assertEqual(len(rows),1);self.assertEqual(rows[0]['title'],'Research title');self.assertEqual(rows[0]['published_at'],'2026-09-15')
    def test_x_hydration_is_data_and_does_not_attribute_quoted_text(self):
        body='<script>tweet_results:$R[1]={id:"x",rest_id:"123",result:$R[2]={core:{screen_name:"OpenAI"},details:$R[3]={created_at_ms:1790881200000,full_text:"Our post"},quote:{screen_name:"other",full_text:"Not our text"}}};throw Error("must never execute");</script>'
        source=self.source('openai-x','https://x.com/OpenAI','x');rows=convert(source,lambda *a:body,START,END)
        self.assertEqual(len(rows),1);self.assertEqual(rows[0]['text'],'Our post');self.assertTrue(rows[0]['url'].endswith('/123'))
        with self.assertRaises(SourceError):convert(source,lambda *a:body.replace('screen_name:"OpenAI"','screen_name:"someone"'),START,END)
    def test_x_quoted_long_note_never_replaces_authors_short_comment(self):
        body='<script>tweet_results:$R[1]={id:"x",rest_id:"123",result:$R[2]={core:{screen_name:"elonmusk"},details:$R[3]={created_at_ms:1790881200000,full_text:"Exactly"},quote:{core:{screen_name:"other"},note_tweet:{note_tweet_results:$R[4]={result:{text:"Someone else long essay"}}}}}};</script>'
        source=self.source('elon-musk-x','https://x.com/elonmusk','x')
        rows=convert(source,lambda *a:body,START,END)
        self.assertEqual(rows[0]['text'],'Exactly')
        own=body.replace('quote:{core:', 'note_tweet:{note_tweet_results:$R[8]={result:{text:"Own long post"}}},quote:{core:')
        self.assertEqual(convert(source,lambda *a:own,START,END)[0]['text'],'Own long post')

    def test_login_shell_and_empty_tiktok_do_not_become_successful_feeds(self):
        for sid,platform in [('openai-tiktok','tiktok'),('mark-zuckerberg-threads','threads')]:
            with self.assertRaises(SourceError) as error:convert(self.source(sid,platform=platform),lambda *a:'<html>Log in<script type="application/json">{"itemList":[]}</script></html>',START,END)
            self.assertEqual(error.exception.status,'blocked')
    def test_month_only_dates_remain_unknown_and_original_label_is_preserved(self):
        source=self.source('dario-blog');rows=[{'title':'Essay','url':'https://example.com/essay','text':'Article text','full':True,'published_at':None,'date_label':'January 2026'}]
        parsed,complete,_=parse_feed(rss_xml(source,rows),source,START,END)
        self.assertIsNone(parsed[0]['published_at']);self.assertEqual(parsed[0]['date_label'],'January 2026');self.assertFalse(complete)

    def test_anthropic_hero_does_not_replace_article_body(self):
        tree=parse_html('<article><div class="PostDetail__hero">Title and date</div><div class="Body-module__body"><p>Actual article details</p></div></article>')
        self.assertEqual(article_text(tree,'anthropic-official'),'Actual article details')

class OfflineImportTests(unittest.TestCase):
    setUp=pipeline_tests.PipelineTests.setUp
    def test_cached_conversion_keeps_pending_full_text_outside_new_window(self):
        source={**self.source,'id':'google-official','platform':'web','url':'https://deepmind.google/blog/','feed_url':'https://deepmind.google/blog/rss.xml'}
        write_json(self.root/'config/sources.json',{'sources':[source]})
        write_json(self.root/'.collector/state.json',{'sources':{source['id']:{'fetched_through':'2026-10-02T00:00:00Z'}}})
        article='https://deepmind.google/blog/entry/'
        write_json(self.root/'.collector/materials.json',{'pending':{'id':'pending','source_id':source['id'],'url':article,'published_at':'2026-09-30T10:00:00Z','material_scope':'full_text'}})
        (self.root/'.collector/pending.jsonl').write_text(json.dumps({'id':'pending'})+'\n')
        cache=self.root/'.collector/conversion-cache';cache.mkdir()
        for url,body in [(source['url'],'<main/>'),(source['feed_url'],'<rss><channel><item><title>Entry</title><link>'+article+'</link><pubDate>2026-09-30T10:00:00Z</pubDate><description>Summary</description></item></channel></rss>'),(article,'<article class="article__body">Complete article text</article>')]:
            write_json(cache/(digest(url)+'.json'),{'body':body})
        result=subprocess.run([sys.executable,str(Path(__file__).resolve().parents[1]/'scripts/convert_feeds.py'),'--root',str(self.root),'--sources','google-official','--offline','--until',END.isoformat()],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        xml=(self.root/'.collector/converted/google-official.xml').read_text()
        rows,_,_=parse_feed(xml,source,START,END)
        self.assertEqual(rows[0]['text'],'Complete article text');self.assertEqual(rows[0]['material_scope'],'full_text')

    def test_offline_import_is_partial_and_fetch_preserves_import_status(self):
        self.source['feed_provider']='offline';self.source['feed_url']=None
        row={'title':'New release','url':'https://github.com/a/b/releases/tag/v1','text':'Details','published_at':'2026-10-01','full':True}
        self.p.import_feed(self.source['id'],rss_xml(self.source,[row]),START,END)
        before=self.p.store.state()['sources'][self.source['id']]
        self.assertEqual(before['status'],'partial');self.assertIsNone(before['fetched_through'])
        self.p.collect(now=END.isoformat());after=self.p.store.state()['sources'][self.source['id']]
        self.assertEqual(after['offline_import_at'],before['offline_import_at']);self.assertEqual(after['status'],'partial')
        self.p.refresh();self.assertIsNone(self.p.store.snapshot()[2]['sources'][0]['reviewed_through'])
    def test_wrong_feed_identity_and_changed_xml_are_rejected(self):
        self.source['feed_provider']='offline';other={**self.source,'id':'wrong'}
        with self.assertRaises(ValidationError):self.p.import_feed(self.source['id'],rss_xml(other,[]),START,END)
        path=self.root/'.collector/converted/feed.xml';path.parent.mkdir();path.write_text(rss_xml(self.source,[]))
        entry={'source_id':self.source['id'],'source_url':self.source['url'],'file':'.collector/converted/feed.xml','sha256':'wrong','since':START.isoformat(),'until':END.isoformat()}
        with self.assertRaises(ValidationError):self.p.import_converted({'sources':[entry]})
        self.assertEqual(self.p.store.materials(),{})

    def test_manifest_hashes_crlf_bytes_and_validates_all_files_before_import(self):
        self.source['feed_provider']='offline'
        row={'title':'Release','url':'https://github.com/a/b/releases/tag/v1','text':'First\r\nsecond','published_at':'2026-10-01','full':True}
        xml=rss_xml(self.source,[row]).replace('\n','\r\n');path=self.root/'.collector/converted/feed.xml';path.parent.mkdir();path.write_bytes(xml.encode())
        entry={'source_id':self.source['id'],'source_url':self.source['url'],'file':'.collector/converted/feed.xml','sha256':digest(xml),'since':START.isoformat(),'until':END.isoformat()}
        with self.assertRaises(ValidationError):self.p.import_converted({'sources':[entry,{**entry,'sha256':'wrong'}]})
        self.assertEqual(self.p.store.materials(),{})
        self.p.import_converted({'sources':[entry]})
        self.assertEqual(len(self.p.store.materials()),1)

if __name__=='__main__':unittest.main()
