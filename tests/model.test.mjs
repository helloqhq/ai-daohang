import test from 'node:test';
import assert from 'node:assert/strict';
import {filterEvents,relevantMonths,dateKey,coverageSummary} from '../public/assets/model.js';
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
