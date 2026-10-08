import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterPlans,groupPricing,validatePricing,renderPricing,pricingStatus,priceLabel} from '../public/assets/pricing.js';
import {pricingGUID,renderPricingRSS} from '../scripts/build-pricing.mjs';
const snapshot=JSON.parse(await readFile(new URL('../public/data/pricing.json',import.meta.url),'utf8'));
const now=new Date('2026-10-05T08:00:00Z');

test('the published snapshot has bilingual, dated prices with explicit units and sources',()=>{
  assert.equal(validatePricing(snapshot),snapshot);
  for(const category of ['api','token-plan','agent']) assert.ok(snapshot.plans.some(plan=>plan.category===category));
  for(const change of [p=>p.price.input=-1,p=>p.currency='EUR',p=>p.source_url='javascript:alert(1)',p=>p.billing='monthly',p=>p.checked_at='2026-02-30',p=>p.note_en='',p=>p.price.output=null]) {
    const invalid=structuredClone(snapshot);change(invalid.plans[0]);assert.throws(()=>validatePricing(invalid));
  }
  const duplicate=structuredClone(snapshot);duplicate.plans.push(duplicate.plans[0]);assert.throws(()=>validatePricing(duplicate));
  const invalid=structuredClone(snapshot);invalid.plans[0].updated_at='9999-01-01';assert.throws(()=>validatePricing(invalid));
});
test('combined filters search both languages and keep original currency and category',()=>{
  const filters={category:'token-plan',currency:'CNY',provider:'Kimi',query:'code 共享'};
  assert.equal(filterPlans(snapshot.plans,filters).length,4);
  assert.equal(filterPlans(snapshot.plans,{...filters,currency:'USD'}).length,0);
  assert.equal(filterPlans(snapshot.plans,{query:'No such product'}).length,0);
  assert.equal(filterPlans(snapshot.plans,{query:'  gPt-6.1   Standard '})[0].id,'gpt-6-1-sol');
  assert.equal(priceLabel(0,'USD'),'$0');assert.equal(priceLabel(null,'USD'),'—');assert.equal(priceLabel(.003,'USD'),'$0.003');assert.equal(priceLabel(49,'CNY'),'¥49');
});
test('provider and product aggregation keeps all tiers without merging distinct products',()=>{
  const vendors=groupPricing(snapshot.plans);
  assert.equal(vendors.length,new Set(snapshot.plans.map(plan=>plan.provider)).size);
  assert.deepEqual(vendors.find(v=>v.provider==='OpenAI').groups.map(group=>group.category),['api','agent']);
  assert.equal(vendors.find(v=>v.provider==='Kimi').groups.find(group=>group.product_id==='kimi-code').plans.length,4);
  const plan=snapshot.plans.find(p=>p.id==='kimi-plan-andante');
  const distinct=[plan,{...plan,id:'other',product_id:'other'},{...plan,id:'other-vendor',provider:'Other'},{...plan,id:'other-category',category:'agent'}];
  const groups=groupPricing(distinct);
  assert.equal(groups.length,2);assert.equal(groups[0].groups.length,3);
  const html=renderPricing(snapshot.plans,'zh',now);
  assert.equal((html.match(/data-pricing-provider=/g)||[]).length,vendors.length);
  assert.equal((html.match(/data-pricing-plan=/g)||[]).length,snapshot.plans.length);
  assert.equal((html.match(/data-pricing-product="kimi-code"/g)||[]).length,1);
});
test('model access is validated, searchable and tier-specific',()=>{
  const index=snapshot.plans.findIndex(p=>p.id==='kimi-plan-andante');
  for(const change of [p=>p.supported_models=[],p=>p.supported_models=['K3','K3'],p=>p.supported_models=[null],p=>p.product_id='Bad ID',p=>p.tier_name='',p=>p.models_note_en='',p=>p.models_source_urls=[],p=>p.models_source_urls=['javascript:alert(1)'],p=>p.models_checked_at='9999-01-01']) {
    const invalid=structuredClone(snapshot);change(invalid.plans[index]);assert.throws(()=>validatePricing(invalid));
  }
  const inconsistent=structuredClone(snapshot);inconsistent.plans[index+1].product_name='Different';assert.throws(()=>validatePricing(inconsistent));
  assert.deepEqual(filterPlans(snapshot.plans,{provider:'Kimi',category:'token-plan',query:'K3'}).map(p=>p.tier_name),['Moderato','Allegretto','Allegro']);
  assert.deepEqual(filterPlans(snapshot.plans,{provider:'Kimi',category:'token-plan',query:'Highspeed'}).filter(p=>p.supported_models.includes('Kimi K2.7 Code Highspeed')).map(p=>p.tier_name),['Allegretto','Allegro']);
  assert.deepEqual(filterPlans(snapshot.plans,{provider:'GitHub',category:'agent',query:'GPT-6.1 Sol'}).map(p=>p.tier_name),['Pro+','Max']);
  const oldRights={...snapshot.plans[index],models_checked_at:'2026-08-01'};
  assert.equal(pricingStatus(oldRights,now),'stale');
});
test('pricing status flags stale quotes, paused sales and expired offers in Shanghai time',()=>{
  const verified={...snapshot.plans[0],checked_at:'2026-10-05'};
  assert.equal(pricingStatus(verified,now),'verified');
  assert.equal(pricingStatus(verified,new Date('2026-11-06T00:00:00Z')),'stale');
  const promo={...verified,valid_until:'2026-12-31'};
  assert.equal(pricingStatus(promo,new Date('2026-12-31T16:00:00Z')),'expired');
  assert.notEqual(pricingStatus(promo,new Date('2026-12-31T15:59:59Z')),'expired');
  assert.equal(pricingStatus({...verified,status:'paused'},now),'paused');
});
test('rendering preserves units, pending prices, English copy and safe links',()=>{
  const english=renderPricing(snapshot.plans,'en',now);
  assert.ok(english.includes('million tokens'));assert.ok(english.includes('Price pending'));assert.ok(english.includes('starting at'));assert.ok(english.includes('Cache write'));
  assert.ok(renderPricing([{...snapshot.plans[0],status:'paused'}],'en',now).includes('New sign-ups paused'));
  assert.ok(!english.includes('undefined'));assert.ok(!english.includes('计费条件'));
  const malicious={...snapshot.plans[0],name:'<script>alert(1)</script>',source_url:'javascript:alert(1)'};
  const html=renderPricing([malicious],'zh',now);
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('<script>'));
  assert.ok(renderPricing([]).includes('data-pricing-reset'));
  const subscription={...snapshot.plans.find(p=>p.id==='cursor-pro'),product_name:'<script>Product</script>',tier_name:'<script>Tier</script>',supported_models:['<img src=x onerror=alert(1)>'],models_source_urls:['javascript:alert(1)']};
  const modelHTML=renderPricing([subscription],'en',now);
  assert.ok(!modelHTML.includes('<script>'));assert.ok(!modelHTML.includes('<img'));assert.ok(!modelHTML.includes('javascript:'));assert.ok(modelHTML.includes('&lt;img'));
  const cursor=snapshot.plans.find(p=>p.id==='cursor-pro');
  assert.ok(english.includes(`Show ${cursor.supported_models.length-6} more models`));assert.ok(english.includes('Official model access'));
});
test('RSS GUIDs stay stable on rechecks and key reordering, and change with commercial terms',()=>{
  const plan=snapshot.plans[0],guid=pricingGUID(plan);
  assert.equal(pricingGUID({...plan,checked_at:'2026-10-10',updated_at:'2026-10-10'}),guid);
  assert.equal(pricingGUID({...plan,price:Object.fromEntries(Object.entries(plan.price).reverse())}),guid);
  assert.notEqual(pricingGUID({...plan,price:{...plan.price,input:999}}),guid);
  assert.notEqual(pricingGUID({...plan,status:'paused'}),guid);
  const rss=renderPricingRSS(snapshot);
  assert.equal((rss.match(/<item>/g)||[]).length,snapshot.plans.length);
  assert.ok(rss.includes('rel="self"'));assert.ok(rss.includes('isPermaLink="false"'));assert.ok(!rss.includes('undefined'));
  const subscription=snapshot.plans.find(p=>p.id==='kimi-plan-andante');
  assert.equal(pricingGUID({...subscription,models_checked_at:'2026-10-10'}),pricingGUID(subscription));
  assert.notEqual(pricingGUID({...subscription,supported_models:[...subscription.supported_models,'New model']}),pricingGUID(subscription));
  assert.notEqual(pricingGUID({...subscription,models_note_en:'Changed entitlement'}),pricingGUID(subscription));
  assert.ok(rss.includes('Supported models:'));assert.ok(rss.includes('Kimi K2.8 Preview'));assert.ok(rss.includes(subscription.models_source_urls[0]));
});
test('free agent clients keep model costs separate from subscription prices in HTML and RSS',()=>{
  const pi=snapshot.plans.find(p=>p.id==='pi-free');
  assert.equal(pi.billing,'free');assert.equal(pi.price.amount,0);
  const english=renderPricing([pi],'en',now),chinese=renderPricing([pi],'zh',now);
  assert.ok(english.includes('No subscription fee'));assert.ok(!english.includes('/ month'));
  assert.ok(chinese.includes('无订阅费'));assert.ok(!chinese.includes('/ 月'));
  assert.ok(english.includes('bill separately'));
  const rss=renderPricingRSS({...snapshot,plans:[pi]});
  assert.ok(rss.includes('$0 · 无订阅费 / No subscription fee'));assert.ok(!rss.includes('$0/月'));
  for(const change of [p=>p.price.amount=10,p=>p.price.amount=null,p=>p.category='token-plan']) {
    const invalid=structuredClone(snapshot);const record=invalid.plans.find(p=>p.id===pi.id);change(record);
    assert.throws(()=>validatePricing(invalid));
  }
});
test('expanded agent catalog retains requested products, tiers and the Windsurf successor',()=>{
  for(const product_id of ['opencode','opencode-go','pi','devin','gemini-cli','cline','aider','kilo-code','kilo-pass','kiro']) {
    assert.ok(filterPlans(snapshot.plans,{category:'agent'}).some(p=>p.product_id===product_id));
  }
  assert.deepEqual(filterPlans(snapshot.plans,{category:'agent',query:'Windsurf'}).map(p=>p.id),['devin-free','devin-pro','devin-max','devin-teams']);
  assert.deepEqual(filterPlans(snapshot.plans,{query:'opencode go'}).filter(p=>p.product_id==='opencode-go').map(p=>p.price.amount),[10,40]);
  assert.equal(snapshot.plans.find(p=>p.id==='devin-teams').price.amount,120);
  assert.ok(!snapshot.plans.find(p=>p.id==='kiro-free').supported_models.includes('Claude Opus 5.5'));
});
