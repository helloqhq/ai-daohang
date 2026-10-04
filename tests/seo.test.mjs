import test from 'node:test';
import assert from 'node:assert/strict';
import {renderInitialFeed} from '../scripts/prerender.mjs';
import {createEventRenderer} from '../public/assets/render.js';

const catalog={entities:[{id:'agent',name:'工具',name_en:'Agent',category:'agent'}],sources:[{id:'official',name:'官方',name_en:'Official'}]};
const event={id:'one',entity_ids:['agent'],kind:'update',topics:[],title_zh:'更新 <script>',summary_zh:'摘要 & 说明',key_points_zh:['修复'],title_en:'Update',summary_en:'Summary',key_points_en:['Fix'],importance_reason_zh:'重要修复',importance_reason_en:'Important fix',published_at:'2026-10-03T08:00:00Z',date_precision:'datetime',sources:[{source_id:'official',url:'https://example.com/update',material_scope:'full_text'}]};

test('initial HTML contains the same first-page cards, grouping and seven-day range as the client',()=>{
  const events=Array.from({length:20},(_,i)=>({...event,id:`item-${i}`}));
  events.push({...event,id:'old',published_at:'2026-09-26T00:00:00Z'});
  events.push({...event,id:'future',published_at:'2026-10-05T00:00:00Z'});
  const html=renderInitialFeed(events,catalog,new Date('2026-10-04T00:00:00Z'));
  assert.equal((html.match(/<article /g)||[]).length,18);
  assert.equal((html.match(/class="date-heading"/g)||[]).length,1);
  assert.ok(html.includes(createEventRenderer(catalog,'zh').card(events[0])));
  assert.ok(html.includes('摘要 &amp; 说明'));
  assert.ok(html.includes('href="https://example.com/update"'));
  assert.ok(!html.includes('data-event-id="old"'));
  assert.ok(!html.includes('data-event-id="future"'));
  assert.ok(!html.includes('<script>'));
});

test('shared card rendering preserves language, expanded state and unsafe-link protection',()=>{
  const html=createEventRenderer(catalog,'en',new Set(['one'])).card({...event,sources:[{...event.sources[0],url:'javascript:alert(1)'}]});
  assert.ok(html.includes('data-event-id="one" open'));
  assert.ok(html.includes('lang="en">Update'));
  assert.ok(html.includes('href="#"'));
  assert.ok(!html.includes('javascript:'));
});

test('an empty current range renders the existing empty state without stale news',()=>{
  const html=renderInitialFeed([event],catalog,new Date('2026-11-01T00:00:00Z'));
  assert.ok(html.includes('class="empty-state"'));
  assert.ok(!html.includes('<article'));
  assert.ok(!html.includes('loading-state'));
});
