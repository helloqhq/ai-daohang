import copy
import datetime as dt
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from collector.pipeline import Pipeline
from collector.storage import read_json, write_json
from collector.adapters import SourceError, parse_feed, feed_address
from collector.validation import ValidationError
ROOT=Path(__file__).resolve().parents[1]

class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        for folder in ('config','schemas'):
            shutil.copytree(ROOT/folder,self.root/folder)
        sources=read_json(self.root/'config/sources.json')
        sources['sources']=[next(s for s in sources['sources'] if s['id']=='pi-releases')]
        write_json(self.root/'config/sources.json',sources)
        self.p=Pipeline(self.root)
        self.source=self.p.sources[0]
        self.record={'title':'1.0','url':'https://github.com/earendil-works/pi/releases/tag/v1','text':'new useful feature','content_id':'123','published_at':'2026-10-01T01:00:00Z','date_precision':'datetime','material_scope':'full_text'}
    def candidate(self):
        self.p.ingest([{**self.record,'source_id':self.source['id']}])
        return next(m for m in self.p.store.materials().values() if m['content_id']==self.record['content_id'])
    def packet(self,m):
        event={'id':'pi-v1','entity_ids':['pi'],'kind':'update','topics':['feature'],'title_zh':'新增重要功能','summary_zh':'变更影响实际使用。','key_points_zh':['保留限制条件'],'importance_reason_zh':'影响工作流程','published_at':m['published_at'],'date_precision':'datetime','first_collected_at':m['collected_at'],'updated_at':m['collected_at'],'sources':[{k:m[k] for k in ('source_id','url','content_id','material_scope','collected_at')}]}
        event.update(title_en='Important new feature',summary_en='A change that affects everyday use.',key_points_en=['Preserves limitations'],importance_reason_en='Affects the workflow')
        return {'events':[event],'decisions':[{'material_id':m['id'],'fingerprint':m['fingerprint'],'action':'keep','event_id':event['id'],'reason_zh':'重要功能'}]}
    def test_first_window_failure_gap_and_recovery(self):
        windows=[]
        def fail(s,h,start,end):windows.append((start,end));raise SourceError('network')
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':fail}):self.p.collect(now='2026-10-03T00:00:00Z')
        self.assertEqual(windows[0][0].isoformat(),'2026-09-30T00:00:00+00:00')
        self.assertNotIn('fetched_through',self.p.store.state()['sources'][self.source['id']])
        def recover(s,h,start,end):windows.append((start,end));return [],True,'checked'
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':recover}):self.p.collect(now='2026-10-08T00:00:00Z')
        self.assertEqual(windows[-1][0],windows[0][0])
        self.assertEqual(self.p.store.state()['sources'][self.source['id']]['fetched_through'],'2026-10-08T00:00:00+00:00')
        self.assertNotIn('uncovered_from',self.p.store.state()['sources'][self.source['id']])
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':recover}):self.p.collect(now='2026-10-09T00:00:00Z')
        self.assertEqual(windows[-1][0].isoformat(),'2026-10-06T00:00:00+00:00')
    def test_feed_change_rechecks_coverage_without_losing_gap(self):
        windows=[]
        def scan(source,http,start,end):windows.append(start);return [],True,'checked'
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':scan}):self.p.collect(now='2026-10-03T00:00:00Z')
        self.p.sources[0]['feed_url']='https://example.com/replacement.xml'
        self.p.refresh()
        self.assertEqual(self.p.store.snapshot()[2]['sources'][0]['status'],'not_attempted')
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':scan}):self.p.collect(now='2026-10-10T00:00:00Z')
        self.assertEqual(windows[-1].isoformat(),'2026-10-01T00:00:00+00:00')
    def test_opml_is_part_of_every_valid_snapshot(self):
        self.p.refresh()
        import xml.etree.ElementTree as ET
        opml=ET.parse(self.root/'public/data/subscriptions.opml')
        self.assertEqual(opml.getroot().find('body/outline').attrib['xmlUrl'],self.source['feed_url'])
    def test_unchanged_reuses_decision_changed_content_reopens(self):
        m=self.candidate();packet=self.packet(m);self.p.apply(packet)
        self.candidate();self.assertEqual(self.p.store.pending(),[])
        self.record['text']='changed important conditions';self.candidate()
        self.assertEqual(len(self.p.store.pending()),1)
        with self.assertRaises(ValidationError):self.p.apply(packet)
        self.assertEqual(self.p.validate()['events'],1)
    def test_unknown_time_preview_and_invalid_json_preserve_snapshot(self):
        m=self.candidate();packet=self.packet(m);self.p.apply(packet)
        old=(self.root/'public/data/index.json').read_bytes()
        packet['events'][0]['related_event_ids']=['missing']
        with self.assertRaises(ValidationError):self.p.apply(packet)
        self.assertEqual((self.root/'public/data/index.json').read_bytes(),old)
        self.record['content_id']='456';self.record['published_at']=None;self.record['date_precision']='unknown';m=self.candidate()
        with self.assertRaises(ValidationError):self.p.apply(self.packet(m))
        self.record.update(published_at='2026-10-02T01:00:00Z',date_precision='datetime',prerelease=True);m=self.candidate()
        with self.assertRaises(ValidationError):self.p.apply(self.packet(m))
    def test_history_and_correction_keep_id_and_original_month(self):
        m=self.candidate();packet=self.packet(m);self.p.apply(packet)
        event=copy.deepcopy(packet['events'][0]);event['published_at']='2026-11-01T00:00:00Z';event['title_zh']='更正标题'
        with self.assertRaises(ValidationError):self.p.apply({'events':[event]})
        event['corrections']=[{'at':'2026-11-02T00:00:00Z','reason_zh':'更正来源日期','reason_en':'Correct the source date','url':m['url']}]
        self.p.apply({'events':[event]});self.p.apply({'events':[],'decisions':[]})
        self.assertEqual(self.p.validate()['events'],1)
        self.assertEqual(self.p.store.snapshot()[1]['event_locations']['pi-v1'],'2026-10')
    def test_bilingual_content_is_required_and_invalid_updates_preserve_snapshot(self):
        m=self.candidate();packet=self.packet(m);self.p.apply(packet)
        original=(self.root/'public/data/index.json').read_bytes()
        for mutate in (
            lambda e:e.pop('title_en'),
            lambda e:e.update(summary_en='  '),
            lambda e:e.update(key_points_en=['One','Two']),
            lambda e:e.update(key_points_en=['  ']),
            lambda e:e.update(translation_zh='只有中文译文'),
            lambda e:e.update(corrections=[{'at':'2026-10-03T00:00:00Z','reason_zh':'更正','url':m['url']}]),
        ):
            invalid=copy.deepcopy(packet);mutate(invalid['events'][0])
            with self.assertRaises(ValidationError):self.p.apply(invalid)
            self.assertEqual((self.root/'public/data/index.json').read_bytes(),original)
    def test_english_corrections_require_evidence_and_refresh_preserves_both_languages(self):
        m=self.candidate();packet=self.packet(m);self.p.apply(packet)
        event=copy.deepcopy(packet['events'][0]);event['summary_en']='Corrected English summary.'
        with self.assertRaises(ValidationError):self.p.apply({'events':[event]})
        event['corrections']=[{'at':'2026-10-03T00:00:00Z','reason_zh':'更正英文摘要','reason_en':'Correct the English summary','url':m['url']}]
        self.p.apply({'events':[event]});self.p.refresh()
        snapshot=self.p.store.snapshot()
        self.assertEqual(snapshot[3][0]['summary_en'],'Corrected English summary.')
        self.assertEqual(snapshot[3][0]['summary_zh'],event['summary_zh'])
        self.assertEqual(snapshot[0]['sources'][0]['name_en'],self.source['name_en'])
    def test_no_false_source_progress_from_link_import_or_partial(self):
        self.candidate();self.assertEqual(self.p.store.state()['sources'],{})
        with patch.dict('collector.pipeline.ADAPTERS',{'rss':lambda *args:([self.record.copy()],False,'partial')}):self.p.collect(now='2026-10-03T00:00:00Z')
        m=next(iter(self.p.store.materials().values()));self.p.apply(self.packet(m))
        state=self.p.store.state()['sources'][self.source['id']]
        self.assertNotIn('fetched_through',state);self.assertNotIn('reviewed_through',state)
    def test_transaction_rolls_back_public_and_private_on_disk_error(self):
        m=self.candidate();self.p.apply(self.packet(m));old=self.p.store.snapshot();decisions=self.p.store.decisions()
        import collector.storage as storage
        original=storage.write_json
        def fail(path,value):
            if Path(path).name=='state.json':raise OSError('disk full')
            original(path,value)
        with patch('collector.storage.write_json',side_effect=fail):
            with self.assertRaises(OSError):self.p.store.replace_snapshot({'index.json':{'bad':True}},{'decisions.json':{},'state.json':{}})
        self.assertEqual(self.p.store.snapshot(),old);self.assertEqual(self.p.store.decisions(),decisions)
    def test_initial_transaction_failure_removes_uncommitted_snapshot(self):
        with patch('collector.storage.write_json',side_effect=lambda path,value: (_ for _ in ()).throw(OSError('disk')) if Path(path).name=='state.json' else write_json(path,value)):
            with self.assertRaises(OSError):self.p.store.replace_snapshot({'index.json':{}},{'state.json':{}})
        self.assertFalse((self.root/'public/data').exists())

class ExtractionTests(unittest.TestCase):
    def setUp(self):
        self.start=dt.datetime(2026,10,1,tzinfo=dt.timezone.utc);self.end=dt.datetime(2026,10,3,tzinfo=dt.timezone.utc)
    def test_atom_uses_alternate_link_and_marks_preview(self):
        xml='<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>v1.0-alpha.1</title><link rel="self" href="https://api.example.com"/><link rel="alternate" href="https://github.com/a/b/releases/tag/v1.0-alpha.1"/><published>2026-10-02T01:00:00Z</published><content type="html">&lt;p&gt;Useful change&lt;/p&gt;</content></entry></feed>'
        items,complete,_=parse_feed(xml,{'platform':'github'},self.start,self.end)
        self.assertEqual(items[0]['url'],'https://github.com/a/b/releases/tag/v1.0-alpha.1');self.assertTrue(items[0]['prerelease']);self.assertFalse(complete);self.assertEqual(items[0]['text'],'Useful change')
    def test_rss_namespace_content_date_boundary_and_partial_description(self):
        xml='<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item><title>old</title><link>https://example.com/old</link><pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate></item><item><title>new</title><link>https://example.com/new</link><pubDate>Fri, 02 Oct 2026 01:00:00 GMT</pubDate><content:encoded>&lt;p&gt;Full details&lt;/p&gt;</content:encoded></item><item><title>brief</title><link>https://example.com/brief</link><pubDate>Fri, 02 Oct 2026 02:00:00 GMT</pubDate><description>Only a snippet</description></item></channel></rss>'
        items,complete,_=parse_feed(xml,{'platform':'web'},self.start,self.end)
        self.assertEqual(len(items),2);self.assertTrue(complete);self.assertEqual(items[0]['material_scope'],'full_text');self.assertEqual(items[1]['material_scope'],'partial_text')
    def test_empty_unknown_date_invalid_feed_do_not_claim_coverage(self):
        for xml in ('<rss><channel/></rss>','<rss><channel><item><title>Unknown</title><link>https://example.com</link></item></channel></rss>'):
            items,complete,_=parse_feed(xml,{'platform':'web'},self.start,self.end);self.assertFalse(complete)
        with self.assertRaises(SourceError):parse_feed('<html>denied</html>',{'platform':'web'},self.start,self.end)
    def test_videos_remain_metadata_only(self):
        xml='<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Video</title><link href="https://youtube.com/watch?v=123"/><published>2026-10-02T00:00:00Z</published><content>Only text, no video viewing</content></entry></feed>'
        items,_,_=parse_feed(xml,{'platform':'youtube'},self.start,self.end);self.assertEqual(items[0]['material_scope'],'metadata_only')
    def test_shared_rsshub_provider_and_native_override(self):
        self.assertEqual(feed_address({'rsshub_route':'/cursor/changelog'},{'rsshub_base_url':'https://rss.example.com/'}),'https://rss.example.com/cursor/changelog')
        self.assertEqual(feed_address({'feed_url':'https://native.example.com/rss','rsshub_route':'/unused'},{}),'https://native.example.com/rss')
        self.assertIsNone(feed_address({},{}))

if __name__=='__main__':unittest.main()
