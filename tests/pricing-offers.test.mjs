import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterPlans,validatePricing,renderPricing} from '../public/assets/pricing.js';
import {offerStatus,offerSavings,renderOfferPanels,pricingStatus} from '../public/assets/pricing-offers.js';
import {pricingGUID,renderPricingRSS} from '../scripts/build-pricing.mjs';
import {maintenanceReport} from '../scripts/maintain-catalog.mjs';
const read=async path=>JSON.parse(await readFile(new URL(`../${path}`,import.meta.url),'utf8'));
const snapshot=await read('public/data/pricing.json');
const now=new Date('2026-10-16T04:00:00Z');
const free=snapshot.plans.find(plan=>plan.id==='kiro-free');
const discount=snapshot.plans.find(plan=>plan.id==='deepseek-v4-1-flash');

test('free access distinguishes inference allowances from free clients and stopped access',()=>{
  const reviewed=new Date('2026-10-21T14:00:00Z');
  const ids=filterPlans(snapshot.plans,{offer:'free'},reviewed).map(plan=>plan.id);
  for(const id of ['kiro-free','codex-free','cursor-x-free','opencode-free','kilo-free']) assert.ok(ids.includes(id));
  for(const id of ['pi-free','cline-free','aider-free','gemini-cli-free']) assert.ok(!ids.includes(id));
  assert.ok(filterPlans(snapshot.plans,{offer:'free',includeUnavailable:true},reviewed).some(plan=>plan.id==='gemini-cli-free'));
  const limited=filterPlans(snapshot.plans,{offer:'free',offerKind:'limited-time'},reviewed);
  assert.deepEqual(limited.map(plan=>plan.id).sort(),['kilo-free','opencode-free']);
  assert.ok(limited.find(plan=>plan.id==='opencode-free').offers[0].models.includes('DeepSeek V4.1 Flash Free'));
  assert.deepEqual(limited.find(plan=>plan.id==='kilo-free').offers[0].models,['MiniMax M3.1 Flash']);
});
test('shared chat and agent subscriptions appear once and work with other filters',()=>{
  const shared=snapshot.plans.find(plan=>plan.id==='cursor-x-free');
  const chat=filterPlans(snapshot.plans,{category:'chat',offer:'free',provider:'Cursor',query:'Grok'},now);
  assert.deepEqual(chat,[shared]);
  assert.deepEqual(filterPlans(chat,{category:'agent',offer:'free'},now),[shared]);
  assert.equal((renderPricing(chat,'en',now).match(/data-pricing-plan=/g)||[]).length,1);
  const standalone={...structuredClone(free),id:'chat-only',category:'chat',product_id:'chat-only',use_cases:['chat']};
  assert.doesNotThrow(()=>validatePricing({...snapshot,plans:[standalone]}));
  assert.equal(filterPlans([standalone],{category:'agent'}).length,0);
});
test('explicit free API inference uses token units and combines with model filters',()=>{
  const plan=structuredClone(discount);
  plan.id='test-free-api';plan.price={input:0,output:0,cached:null,cache_write:null};
  plan.offers=[{...structuredClone(free.offers[0]),models:[plan.name],price:{input:0,output:0}}];
  assert.doesNotThrow(()=>validatePricing({...snapshot,plans:[plan]}));
  assert.deepEqual(filterPlans([plan],{category:'api',offer:'free',currency:'USD'},now),[plan]);
  const html=renderPricing([plan],'en',now);
  assert.ok(html.includes('million tokens'));assert.ok(html.includes('$0'));assert.ok(!html.includes('No subscription fee'));
});
test('one plan with multiple offers is counted once in quick panels',()=>{
  const plan=structuredClone(free);plan.offers.push({...plan.offers[0],id:'second',kind:'trial'});
  assert.equal(filterPlans([plan],{offer:'free'},now).length,1);
  assert.match(renderOfferPanels([plan],'en','free',now),/>1<span class="pricing-panel-unit"> plans/);
});
test('free allowances and discounts require dated, bilingual, explicit evidence',()=>{
  const data={...snapshot,plans:[structuredClone(free)]};
  for(const mutate of [
    p=>p.offers[0].models=[],p=>p.offers[0].quota_en='',p=>p.offers[0].conditions_en='',
    p=>p.offers[0].eligibility_zh='',p=>p.offers[0].card_required=true,
    p=>p.offers[0].source_url='javascript:alert(1)',p=>p.offers[0].checked_at='2026-02-30',
    p=>p.offers[0].checked_at='9999-01-01',p=>p.offers[0].price={amount:1},
    p=>p.offers[0].starts_at='2026-10-16T00:00:00',
    p=>p.offers[0].ends_at='2026-02-30T00:00:00Z',
    p=>p.offers[0].kind='client-free',p=>p.use_cases=['chat','chat'],
    p=>p.offers.push(p.offers[0]),
  ]) {
    const invalid=structuredClone(data);mutate(invalid.plans[0]);assert.throws(()=>validatePricing(invalid));
  }
  for(const kind of ['recurring','signup','trial','limited-time']) {
    const valid=structuredClone(data);valid.plans[0].offers[0].kind=kind;assert.doesNotThrow(()=>validatePricing(valid));
  }
});
test('discount comparisons preserve dimensions and reject currencies or invented rates',()=>{
  const offer=discount.offers[0];
  assert.deepEqual(offerSavings(discount,offer),{input:50,output:50,cached:50});
  for(const mutate of [
    o=>o.reference.currency='CNY',o=>o.reference.billing='monthly',
    o=>o.reference.price={input:0.1},o=>o.price={input:0.5},
    o=>o.reference.comparison_en='',o=>o.reference.source_url='http://example.com',
    o=>o.price={amount:0.1},o=>o.reference.checked_at='9999-01-01',
  ]) {
    const plan=structuredClone(discount);mutate(plan.offers[0]);assert.throws(()=>validatePricing({...snapshot,plans:[plan]}));
  }
  const official=snapshot.plans.find(plan=>plan.id==='minimax-m3');
  assert.deepEqual(offerSavings(official,official.offers[0]),{});
  assert.ok(!renderPricing([official],'en',now).includes('−50%'));
});
test('offer windows display in the interface time zone per language',()=>{
  const plan=structuredClone(discount);plan.offers[0].starts_at='2026-09-25T15:00:00+08:00';
  const zh=renderPricing([plan],'zh',now);
  assert.ok(zh.includes('2026/9/25 15:00:00 UTC+8'));
  const en=renderPricing([plan],'en',now);
  assert.ok(en.includes('25/09/2026, 00:00:00 PDT'));
});
test('offer windows use absolute timestamps without expiring the parent subscription',()=>{
  const plan=structuredClone(free),offer=plan.offers[0];
  offer.starts_at='2026-10-16T12:00:00+08:00';offer.ends_at='2026-10-17T00:00:00+08:00';
  assert.equal(offerStatus(plan,offer,new Date('2026-10-16T03:59:59Z')),'scheduled');
  assert.equal(offerStatus(plan,offer,now),'verified');
  assert.equal(offerStatus(plan,offer,new Date('2026-10-16T15:59:59Z')),'verified');
  assert.equal(offerStatus(plan,offer,new Date('2026-10-16T16:00:00Z')),'expired');
  assert.equal(pricingStatus(plan,new Date('2026-10-16T16:00:00Z')),'verified');
  assert.equal(filterPlans([plan],{offer:'free'},new Date('2026-10-16T16:00:00Z')).length,0);
  offer.ends_at=offer.starts_at;assert.throws(()=>validatePricing({...snapshot,plans:[plan]}));
});
test('every evidence date participates in freshness, including reference and model access',()=>{
  for(const mutate of [
    p=>p.checked_at='2026-09-01',p=>p.models_checked_at='2026-09-01',p=>p.offers[0].checked_at='2026-09-01',
  ]) {
    const plan=structuredClone(free);mutate(plan);
    assert.equal(offerStatus(plan,plan.offers[0],now),'stale');
    assert.equal(filterPlans([plan],{offer:'free'},now).length,0);
    assert.equal(filterPlans([plan],{offer:'free',includeUnavailable:true},now).length,1);
  }
  const plan=structuredClone(discount);plan.offers[0].reference.checked_at='2026-09-01';
  assert.equal(offerStatus(plan,plan.offers[0],now),'stale');
  assert.equal(filterPlans([plan],{offer:'discount'},now).length,0);
});
test('an ambiguous published end label remains pending and is not called unpublished',()=>{
  const plan=structuredClone(discount),offer=plan.offers[0];
  offer.status='pending';offer.ends_at=null;
  offer.end_note_zh='10月14日，官方未注明年份';offer.end_note_en='October 14; the official page omits the year';
  assert.doesNotThrow(()=>validatePricing({...snapshot,plans:[plan]}));
  assert.equal(filterPlans([plan],{offer:'discount'},now).length,0);
  const html=renderPricing([plan],'en',now);
  assert.ok(html.includes(offer.end_note_en));assert.ok(!html.includes('No published end date'));
  assert.ok(renderPricingRSS({...snapshot,plans:[plan]}).includes(offer.end_note_en));
  delete offer.end_note_zh;assert.throws(()=>validatePricing({...snapshot,plans:[plan]}));
});
test('offer conditions, model scope, sources, prices and unknown requirements render safely',()=>{
  const plan=structuredClone(free);plan.offers[0].conditions_en='<img src=x onerror=alert(1)>';
  plan.offers[0].source_url='javascript:alert(1)';
  const html=renderPricing([plan],'en',now);
  assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('javascript:'));
  assert.ok(html.includes('Card requirement unverified'));assert.ok(html.includes('No published end date'));
  assert.ok(!html.includes('undefined'));assert.ok(!html.includes('免费额度'));
  const discounted=renderPricing([discount],'en',now);
  assert.ok(discounted.includes('−50%'));assert.ok(discounted.includes('$0.15'));assert.ok(discounted.includes('Reference source'));
});
test('RSS includes offer conditions and ignores recheck-only nested changes in GUIDs',()=>{
  const plan=structuredClone(discount),guid=pricingGUID(plan);
  plan.offers[0].checked_at='2026-10-15';plan.offers[0].reference.checked_at='2026-10-15';
  assert.equal(pricingGUID(plan),guid);
  plan.offers[0].price.input=0.1;assert.notEqual(pricingGUID(plan),guid);
  const rss=renderPricingRSS({...snapshot,plans:[free,discount]});
  assert.ok(rss.includes(free.offers[0].quota_en));assert.ok(rss.includes(discount.offers[0].reference.source_url));
  assert.ok(rss.includes('No published end date'));assert.ok(!rss.includes('undefined'));
});
test('maintenance reports missing mappings, old evidence and exact reused source URLs without claiming network verification',async()=>{
  const entities=(await read('config/entities.json')).entities;
  const {sources,people}=await read('config/sources.json');
  const report=maintenanceReport({pricing:snapshot,entities,sources,people},now);
  assert.equal(report.network_verified,false);assert.deepEqual(report.missing_pricing_mappings,[]);
  assert.equal(new Set(report.pricing_sources.map(source=>source.url)).size,report.pricing_sources.length);
  assert.ok(report.pricing_review.some(item=>item.plan_id==='gemini-cli-free'));
  const missing=maintenanceReport({pricing:{...snapshot,plans:[discount]},entities:[],sources:[],people:[]},now);
  assert.equal(missing.missing_pricing_mappings[0].missing,'object');
  const stale=structuredClone(discount);stale.offers[0].reference.checked_at='2026-09-01';
  const reviewed=maintenanceReport({pricing:{...snapshot,plans:[stale]},entities,sources,people},now);
  assert.ok(reviewed.pricing_review[0].issues.includes('offer:off-peak:stale'));
});
