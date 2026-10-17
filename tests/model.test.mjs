import test from 'node:test';
import assert from 'node:assert/strict';
import {filterEvents,relevantMonths,dateKey,coverageSummary,followingObjects,formatEventTime,formatClock,daysAgo,zoneAbbreviation} from '../public/assets/model.js';
const catalog={entities:[{id:'pi',name:'Pi',aliases:['pi agent harness'],category:'agent'},{id:'openai',name:'OpenAI',aliases:[],category:'model'}]};
const event=(id,date,entity,kind='update')=>({id,published_at:date,entity_ids:[entity],kind,title_zh:'测试',summary_zh:'支持 MCP',key_points_zh:['权限控制'],topics:['critical_fix']});
const events=[event('a','2026-09-30T20:00:00Z','pi'),event('b','2026-10-02','openai','preview')];
const filters={category:'all',from:'',to:''};
test('Shanghai dates and combined filters retain correct events',()=>{
 assert.equal(dateKey(events[0].published_at),'2026-10-01');
 assert.deepEqual(filterEvents(events,catalog,{...filters,from:'2026-10-01',to:'2026-10-01',category:'agent',query:'HARNESS'}).map(e=>e.id),['a']);
 assert.deepEqual(filterEvents(events,catalog,{...filters,kind:'preview',entity:'openai'}).map(e=>e.id),['b']);
 assert.equal(filterEvents(events,catalog,{...filters,query:'关键修复'}).length,2);
 assert.equal(filterEvents(events,catalog,{...filters,query:'不存在'}).length,0);
});
test('cross-month corrected events are still discoverable by their actual date',()=>{
 const index={months:[{month:'2026-09',min_date:'2026-09-30T20:00:00Z',max_date:'2026-10-02'}]};
 assert.equal(relevantMonths(index,'2026-10-01','2026-10-03').length,1);
 assert.equal(relevantMonths(index,'2026-11-01','2026-11-02').length,0);
});
test('partial coverage and deferred review are never counted as complete',()=>{
 const result=coverageSummary([{status:'partial',pending_count:0},{status:'success',pending_count:1},{status:'success',pending_count:0,reviewed_through:'2026-10-01'},{status:'blocked',pending_count:0}]);
 assert.deepEqual(result,{total:4,checked:3,complete:1,failed:1,pending:1});
});

test('following groups separate platforms and match people by their own sources',()=>{
 const grouped={entities:[
  {id:'openai',name:'OpenAI',aliases:[],category:'model',kind:'vendor',enabled:true},
  {id:'codex',name:'Codex',aliases:[],category:'agent',kind:'application',enabled:true},
  {id:'openrouter',name:'OpenRouter',aliases:[],category:'model',kind:'api_platform',enabled:true},
 ],people:[{id:'tibo',name:'Tibo',aliases:['thsottiaux'],entity_ids:['openai','codex']}],sources:[{id:'official',entity_ids:['openai']},{id:'tibo-x',person_id:'tibo',entity_ids:['openai','codex']}]};
 const input=[
  {...event('official','2026-10-03T00:00:00Z','openai'),sources:[{source_id:'official'}]},
  {...event('personal','2026-10-03T01:00:00Z','codex','preview'),sources:[{source_id:'tibo-x'}]},
  {...event('platform','2026-10-03T02:00:00Z','openrouter'),sources:[]},
 ];
 assert.deepEqual(followingObjects(grouped).map(o=>[o.id,o.category]),[['openai','model'],['codex','agent'],['openrouter','platform'],['person:tibo','person']]);
 assert.deepEqual(filterEvents(input,grouped,{...filters,category:'model'}).map(e=>e.id),['official']);
 assert.deepEqual(filterEvents(input,grouped,{...filters,category:'platform'}).map(e=>e.id),['platform']);
 assert.deepEqual(filterEvents(input,grouped,{...filters,category:'person',entity:'person:tibo',kind:'preview',from:'2026-10-03',to:'2026-10-03'}).map(e=>e.id),['personal']);
 assert.deepEqual(filterEvents(input,grouped,{...filters,category:'person',query:'thsottiaux'}).map(e=>e.id),['personal']);
 assert.equal(filterEvents(input,grouped,{...filters,category:'platform',entity:'codex'}).length,0);
});

test('hour display follows the interface zone without inventing hours for date-only sources',()=>{
 assert.equal(formatEventTime('2026-10-02T16:09:17Z','datetime','zh'),'2026-10-03 00时');
 assert.equal(formatEventTime('2026-10-03T06:42:19Z','datetime','en'),'2026-10-02 23h');
 assert.equal(formatEventTime('2026-11-01T08:30:00Z','datetime','en'),'2026-11-01 01h');
 assert.equal(formatEventTime('2026-11-01T08:30:00Z','datetime','zh'),'2026-11-01 16时');
 assert.equal(formatEventTime('2026-10-03','date','zh'),'2026-10-03');
 assert.equal(formatEventTime('2026-10-03T00:00:00Z','date','zh'),'2026-10-03');
 assert.equal(formatEventTime(null,'unknown','zh'),'日期待核实');
});
test('Pacific abbreviations track the DST transition',()=>{
 assert.equal(zoneAbbreviation('America/Los_Angeles',new Date('2026-10-17T06:32:00Z')),'PDT');
 assert.equal(zoneAbbreviation('America/Los_Angeles',new Date('2026-11-01T09:00:00Z')),'PST');
 assert.equal(zoneAbbreviation('Asia/Shanghai',new Date('2026-10-17T06:32:00Z')),'GMT+8');
});
test('interface zone shifts dates, preset ranges and month routing together',()=>{
 const instant='2026-10-01T02:00:00Z'; // 10-01 10:00 Beijing / 09-30 19:00 Pacific
 assert.equal(dateKey(instant,'Asia/Shanghai'),'2026-10-01');
 assert.equal(dateKey(instant,'America/Los_Angeles'),'2026-09-30');
 assert.equal(daysAgo(0,new Date(instant),'America/Los_Angeles'),'2026-09-30');
 const list=[event('a',instant,'pi')];
 assert.deepEqual(filterEvents(list,catalog,{...filters,from:'2026-09-30',to:'2026-09-30'},'America/Los_Angeles').map(e=>e.id),['a']);
 assert.deepEqual(filterEvents(list,catalog,{...filters,from:'2026-10-01',to:'2026-10-01'},'America/Los_Angeles').map(e=>e.id),[]);
 const index={months:[{month:'2026-09',min_date:instant,max_date:instant}]};
 assert.equal(relevantMonths(index,'2026-09-30','2026-09-30','America/Los_Angeles').length,1);
 assert.equal(relevantMonths(index,'2026-10-01','2026-10-02','America/Los_Angeles').length,0);
});
test('footer clock combines month-day and HH:mm per zone across midnight and DST',()=>{
 assert.equal(formatClock('2026-10-17T06:32:00Z','Asia/Shanghai'),'10-17 14:32');
 assert.equal(formatClock('2026-10-17T06:32:00Z','America/Los_Angeles'),'10-16 23:32');
 assert.equal(formatClock('2026-10-17T07:00:00Z','America/Los_Angeles'),'10-17 00:00');
 assert.equal(formatClock('2026-11-01T08:59:00Z','America/Los_Angeles'),'11-01 01:59');
 assert.equal(formatClock('2026-11-01T09:00:00Z','America/Los_Angeles'),'11-01 01:00');
 assert.equal(formatClock(null,'Asia/Shanghai'),'');
});
