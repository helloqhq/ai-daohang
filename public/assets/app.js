import {dateKey,daysAgo,filterEvents,relevantMonths,coverageSummary,KIND_LABELS,TOPIC_LABELS,PLATFORM_LABELS} from './model.js';
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => {try {const u = new URL(value);return ['http:','https:'].includes(u.protocol) ? u.href : '#';} catch {return '#';}};
const color = value => /^#[a-f\d]{6}$/i.test(value || '') ? value : '#1d463a';
const formatDate = value => {const d = dateKey(value);return d ? d.replaceAll('-','.') : '日期待核实';};
const state = {catalog:null,index:null,coverage:null,events:new Map(),loaded:new Set(),filters:{category:'all',entity:'',kind:'',query:'',from:daysAgo(6),to:daysAgo(0)},visible:18,request:0,view:'feed'};
async function json(path, suffix='') {
  const response = await fetch(new URL(`data/${path}${suffix}`,document.baseURI),{cache:'no-cache'});
  if (!response.ok) throw new Error(`数据读取失败（${response.status}）`);
  return response.json();
}
function checkSnapshot(value) {if (value.snapshot_id !== state.index.snapshot_id) throw new Error('数据正在更新，请刷新后重试。');}
function error(message) {$('error-box').hidden=false;$('error-box').textContent=message;}
function tags(event) {return event.entity_ids.map(id=>{const e=state.catalog.entities.find(x=>x.id===id);return e ? `<span class="entity-tag"><i style="background:${color(e.color)}"></i>${escape(e.name)}</span>`:'';}).join('<span class="meta-divider">/</span>');}
function sourceName(sourceId) {return state.catalog.sources.find(s=>s.id===sourceId)?.name || sourceId;}
function card(event) {
  const first=event.sources[0];
  return `<article class="event-card" data-event-id="${escape(event.id)}"><div class="card-meta">${tags(event)}<span class="meta-divider">·</span><span class="kind-tag ${escape(event.kind)}">${KIND_LABELS[event.kind]}</span>${event.corrections?.length?'<span class="corrected-tag">已更正</span>':''}<span class="card-time">${escape(formatDate(event.published_at))}</span></div><h3 class="event-title"><button data-detail="${escape(event.id)}">${escape(event.title_zh)}</button></h3><p class="event-summary">${escape(event.summary_zh)}</p><ul class="key-points">${event.key_points_zh.map(p=>`<li>${escape(p)}</li>`).join('')}</ul><div class="card-bottom"><div class="topics">${event.topics.map(t=>`<span class="topic">${escape(TOPIC_LABELS[t] || t)}</span>`).join('')}</div><a class="source-link" href="${escape(safeURL(first.url))}" target="_blank" rel="noopener noreferrer"><span>${event.sources.length>1?event.sources.length+' 个原始来源':escape(PLATFORM_LABELS[state.catalog.sources.find(s=>s.id===first.source_id)?.platform] || '原始来源')}</span>阅读原文 ↗</a></div></article>`;
}
async function loadMonths(from,to) {
  const requested=relevantMonths(state.index,from,to);
  for (const month of requested) {
    if(state.loaded.has(month.month)) continue;
    const value=await json(month.path,`?v=${encodeURIComponent(state.index.snapshot_id)}`);
    checkSnapshot(value);
    for(const event of value.events) state.events.set(event.id,event);
    state.loaded.add(month.month);
  }
}
function updateCounts() {
  const all=[...state.events.values()];
  for(const [id,category] of [['count-all','all'],['count-model','model'],['count-agent','agent']]) {
    $(id).textContent=filterEvents(all,state.catalog,{...state.filters,category,entity:'',kind:'',query:''}).length;
  }
}
function renderFeed() {
  const events=filterEvents([...state.events.values()],state.catalog,state.filters);
  $('result-count').textContent=events.length ? String(events.length).padStart(2,'0') : '00';
  updateCounts();
  let lastDate='',out='';
  for(const event of events.slice(0,state.visible)) {
    const d=dateKey(event.published_at);
    if(d!==lastDate){out+=`<div class="date-heading">${escape(formatDate(d))}</div>`;lastDate=d;}
    out+=card(event);
  }
  if(!out){
    const filtered=state.filters.query || state.filters.entity || state.filters.kind || state.filters.category!=='all';
    out=`<div class="empty-state"><div class="empty-mark" aria-hidden="true">∅</div><h3>${filtered?'这个范围里，暂时没有动态。':'没有新消息，也是一种消息。'}</h3><p>${filtered?'可以调整筛选、搜索词或日期范围。':'当前日期范围没有已入选的重要信息。来源是否检查完成，请查看采集覆盖；读取受限和待审阅会分别记录。'}</p><button id="empty-reset">${filtered?'重置筛选':'查看采集覆盖'} ↗</button></div>`;
  }
  $('feed-list').innerHTML=out;$('feed-list').setAttribute('aria-busy','false');
  $('more-button').hidden=events.length<=state.visible;
  $('empty-reset')?.addEventListener('click',()=>{
    if(state.filters.query || state.filters.entity || state.filters.kind || state.filters.category!=='all') resetFilters();else switchView('sources');
  });
}
async function refreshFeed() {
  const request=++state.request;
  $('feed-list').setAttribute('aria-busy','true');
  try {await loadMonths(state.filters.from,state.filters.to);if(request===state.request) renderFeed();}
  catch(e){if(request===state.request){error(e.message);$('feed-list').setAttribute('aria-busy','false');}}
}
function fillEntities() {
  const selected=state.filters.entity;
  const values=state.catalog.entities.filter(e=>e.enabled && (state.filters.category==='all'||e.category===state.filters.category));
  $('entity-filter').innerHTML='<option value="">全部关注对象</option>'+values.map(e=>`<option value="${escape(e.id)}">${escape(e.name)}</option>`).join('');
  $('entity-filter').value=values.some(e=>e.id===selected)?selected:'';
  state.filters.entity=$('entity-filter').value;
}
function resetFilters() {
  Object.assign(state.filters,{category:'all',entity:'',kind:'',query:''});
  $('search-input').value='';$('kind-filter').value='';
  document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('selected',b.dataset.category==='all'));
  fillEntities();state.visible=18;refreshFeed();
}
function switchView(view) {
  state.view=view;$('feed-view').hidden=view!=='feed';$('sources-view').hidden=view!=='sources';
  for(const [id,name] of [['feed-nav','feed'],['sources-nav','sources']]){$(id).classList.toggle('selected',view===name);if(view===name)$(id).setAttribute('aria-current','page');else $(id).removeAttribute('aria-current');}
  if(view==='sources') renderSources();
}
function sourceStatus(info) {
  if(info.verification!=='verified') return ['待核实账号','limited'];
  if(['failed','blocked'].includes(info.status)) return ['读取受限','failed'];
  if(info.pending_count) return [`${info.pending_count} 条待审阅`,'limited'];
  if(info.status==='success' && info.reviewed_through) return ['已检查',''];
  if(info.status==='partial') return ['部分覆盖','limited'];
  return [info.note==='RSS 订阅待配置'?'订阅待配置':'尚未采集','limited'];
}
function renderSources() {
  const query=$('source-search').value.trim().toLowerCase();
  const coverage=new Map(state.coverage.sources.map(s=>[s.source_id,s]));
  $('source-list').innerHTML=state.catalog.sources.filter(s=>!query || [s.name,...s.entity_ids].join(' ').toLowerCase().includes(query)).map(s=>{
    const info=coverage.get(s.id)||{status:'not_attempted',verification:s.verification,pending_count:0};
    const [label,cls]=sourceStatus(info);
    return `<article class="source-card"><div class="source-platform">${escape(PLATFORM_LABELS[s.platform]||s.platform)}</div><h3>${escape(s.name)}</h3><span class="source-state ${cls}">● ${escape(label)}</span><p>${escape(info.note||'尚未采集')}</p>${s.subscription_note?`<p>${escape(s.subscription_note)}</p>`:''}<p>最近尝试：${escape(info.last_attempt_at?formatDate(info.last_attempt_at):'—')}<br>完成审阅：${escape(info.reviewed_through?formatDate(info.reviewed_through):'尚未完整确认')}</p><a href="${escape(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">原始来源 ↗</a>${s.feed_url?` · <a href="${escape(safeURL(s.feed_url))}" target="_blank" rel="noopener noreferrer">RSS 订阅 ↗</a>`:' · <span class="source-platform">RSS 待配置</span>'}</article>`;
  }).join('') || '<p class="range-note">没有匹配的信息源。</p>';
  $('platform-notes').innerHTML=state.catalog.platforms.map(p=>{
    const count=state.catalog.sources.filter(s=>s.platform===p.id && s.verification==='verified').length;
    return `<span class="platform-note">${escape(p.name)} · ${count?count+' 个已核实入口':'账号待登记 / 核实'}</span>`;
  }).join('');
}
async function detail(id) {
  try {
    let event=state.events.get(id);
    if(!event){const month=state.index.event_locations[id];if(!month)throw new Error('关联事件暂不可用');const file=state.index.months.find(m=>m.month===month);if(!file)throw new Error('关联事件索引不完整');const value=await json(file.path,`?v=${encodeURIComponent(state.index.snapshot_id)}`);checkSnapshot(value);value.events.forEach(e=>state.events.set(e.id,e));event=state.events.get(id);}
    $('dialog-content').innerHTML=`<div class="card-meta">${tags(event)}<span class="kind-tag ${escape(event.kind)}">${KIND_LABELS[event.kind]}</span></div><h2 id="dialog-title" class="dialog-title">${escape(event.title_zh)}</h2><p class="event-summary">${escape(event.summary_zh)}</p><ul class="key-points">${event.key_points_zh.map(p=>`<li>${escape(p)}</li>`).join('')}</ul><div class="dialog-reason"><strong>为什么值得关注</strong><br>${escape(event.importance_reason_zh)}</div>${event.translation_zh?`<h3>中文译文</h3><p class="event-summary">${escape(event.translation_zh)}</p>`:''}${(event.corrections||[]).map(c=>`<div class="correction">${escape(formatDate(c.at))} 更正：${escape(c.reason_zh)} <a href="${escape(safeURL(c.url))}" target="_blank" rel="noopener noreferrer">依据 ↗</a></div>`).join('')}<div class="related-links">${(event.related_event_ids||[]).map(related=>`<button data-detail="${escape(related)}">查看关联事件 ↗</button>`).join('')}</div><div class="dialog-sources"><h3>原始依据 · ${escape(formatDate(event.published_at))}</h3>${event.sources.map(s=>`<a href="${escape(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${escape(sourceName(s.source_id))} ↗<small>${s.material_scope==='metadata_only'?'依据标题 / 简介':s.material_scope==='partial_text'?'依据已取得的正文片段':'依据原始文字内容'}${s.evidence_locator?.start_seconds!=null?' · '+escape(s.evidence_locator.start_seconds)+' 秒起':''}</small></a>`).join('')}</div>`;
    if(!$('event-dialog').open) $('event-dialog').showModal();
  }catch(e){error(e.message);}
}
function bind() {
  $('feed-nav').addEventListener('click',()=>switchView('feed'));for(const id of ['sources-nav','coverage-link'])$(id).addEventListener('click',()=>switchView('sources'));
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{state.filters.category=button.dataset.category;document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('selected',b===button));fillEntities();state.visible=18;refreshFeed();}));
  for(const [id,key] of [['entity-filter','entity'],['kind-filter','kind']])$(id).addEventListener('change',e=>{state.filters[key]=e.target.value;state.visible=18;refreshFeed();});
  let debounce; $('search-input').addEventListener('input',e=>{clearTimeout(debounce);debounce=setTimeout(()=>{state.filters.query=e.target.value;state.visible=18;refreshFeed();},160);});
  document.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>{const days=button.dataset.days;state.filters.from=days==='all'?'':daysAgo(Number(days)-1);state.filters.to=days==='all'?'':daysAgo(0);document.querySelectorAll('[data-days]').forEach(b=>b.classList.toggle('selected',b===button));$('date-from').value=state.filters.from;$('date-to').value=state.filters.to;state.visible=18;refreshFeed();}));
  $('custom-date').addEventListener('click',()=>{$('custom-range').hidden=!$('custom-range').hidden;$('custom-date').setAttribute('aria-expanded',String(!$('custom-range').hidden));});
  $('date-apply').addEventListener('click',()=>{const from=$('date-from').value,to=$('date-to').value;if(from&&to&&from>to){error('开始日期应早于结束日期。');return;}$('error-box').hidden=true;state.filters.from=from;state.filters.to=to;document.querySelectorAll('[data-days]').forEach(b=>b.classList.remove('selected'));state.visible=18;refreshFeed();});
  $('more-button').addEventListener('click',()=>{state.visible+=18;renderFeed();});
  $('source-search').addEventListener('input',renderSources);
  document.addEventListener('click',e=>{const button=e.target.closest('[data-detail]');if(button) detail(button.dataset.detail);});
  $('dialog-close').addEventListener('click',()=>$('event-dialog').close());
  $('event-dialog').addEventListener('click',e=>{if(e.target===$('event-dialog')){const r=$('event-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('event-dialog').close();}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();switchView('feed');$('search-input').focus();}});
}
async function init() {
  bind();$('date-from').value=state.filters.from;$('date-to').value=state.filters.to;
  for(let attempt=0;attempt<2;attempt++){
    try {
      const suffix=attempt?`?refresh=${Date.now()}`:'';
      [state.index,state.catalog,state.coverage]=await Promise.all([json('index.json',suffix),json('catalog.json',suffix),json('coverage.json',suffix)]);
      checkSnapshot(state.catalog);checkSnapshot(state.coverage);break;
    }catch(e){if(attempt===1){error(e.message);$('coverage-status').textContent='数据暂不可用';$('feed-list').textContent='请刷新重试。';$('feed-list').setAttribute('aria-busy','false');return;}}
  }
  $('issue-date').textContent=daysAgo(0).replaceAll('-','.');
  $('snapshot-time').textContent='数据生成于 '+new Date(state.index.generated_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false});
  $('entity-count').textContent=state.catalog.entities.length;$('source-count').textContent=state.catalog.sources.length;
  const summary=coverageSummary(state.coverage.sources);
  const stale=Date.now()-new Date(state.index.generated_at).getTime()>48*3600000;
  $('coverage-status').textContent=stale?'数据较旧，请留意采集日期':summary.failed||summary.pending||summary.complete<summary.total?'部分来源仍待核查':'当前来源已检查';
  document.querySelector('.status-strip').classList.toggle('pending',stale||summary.failed>0||summary.pending>0||summary.complete<summary.total);
  $('coverage-description').textContent=`${summary.checked} / ${summary.total} 个来源取得内容 · ${summary.failed} 个读取受限${summary.pending?' · '+summary.pending+' 条待审阅':''}`;
  fillEntities();await refreshFeed();
}
init().catch(e=>error(e.message));
