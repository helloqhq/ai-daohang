import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveLanguage,translate,eventContent,coverageNote} from '../public/assets/i18n.js';
import {filterEvents} from '../public/assets/model.js';

test('explicit URL language wins over preference; invalid values keep a safe default',()=>{
  assert.equal(resolveLanguage('?lang=en','zh'),'en');
  assert.equal(resolveLanguage('?lang=zh','en'),'zh');
  assert.equal(resolveLanguage('?lang=unknown','en'),'en');
  assert.equal(resolveLanguage('','en'),'en');
  assert.equal(resolveLanguage('','unknown'),'zh');
});
test('partial translations fall back as a complete article',()=>{
  const event={title_zh:'中文标题',summary_zh:'中文摘要',key_points_zh:['关键点'],importance_reason_zh:'入选理由',title_en:'English title'};
  assert.equal(eventContent(event,'en').lang,'zh');
  Object.assign(event,{summary_en:'Summary',key_points_en:['Key point'],importance_reason_en:'Impact'});
  assert.equal(eventContent(event,'en').title,'English title');
  assert.equal(eventContent(event,'zh').title,'中文标题');
  event.key_points_en=['  '];
  assert.equal(eventContent(event,'en').lang,'zh');
});
test('search finds both languages and translated topic labels without duplicating events',()=>{
  const catalog={entities:[{id:'moonshot',name:'月之暗面',name_en:'Moonshot AI',aliases:['kimi'],category:'model'}]};
  const event={id:'kimi-update',published_at:'2026-10-03',entity_ids:['moonshot'],kind:'update',topics:['critical_fix'],title_zh:'重要更新',summary_zh:'修复问题',key_points_zh:['授权'],title_en:'Important update',summary_en:'Fixes authentication',key_points_en:['OAuth']};
  for(const query of ['重要','authentication','OAuth','Moonshot','月之暗面','Critical fix','关键修复']) {
    assert.deepEqual(filterEvents([event],catalog,{category:'all',query}).map(e=>e.id),['kimi-update']);
  }
});
test('counts and source coverage notes use the selected language',()=>{
  assert.equal(translate('en','coverageSummary',{checked:2,total:3,failed:1}),'2 / 3 sources retrieved · 1 restricted');
  assert.equal(coverageNote({note:'RSS 订阅待配置'},'en'),'RSS feed not configured.');
  assert.equal(coverageNote({note:'RSS HTTP 403'},'en'),'RSS HTTP 403');
  assert.equal(coverageNote({note:'新的说明',note_en:'New note'},'en'),'New note');
});
