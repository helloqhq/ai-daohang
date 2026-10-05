import {createEventRenderer,escape,safeURL} from './render.js';
import {dateKey,daysAgo,filterEvents,relevantMonths,coverageSummary,formatEventTime,followingObjects} from './model.js';
import {resolveLanguage,translate,LABELS,eventContent,coverageNote} from './i18n.js';
import {createPrivacyPreferences,initCookieControls} from './privacy.js';
import {createPricingView} from './pricing.js';
const preferences=createPrivacyPreferences();
const showSources=new URLSearchParams(location.search).get('showSources')==='1';
let language=resolveLanguage(location.search,preferences.language());
const cookieControls=initCookieControls(preferences,()=>language);
const t=(key,values)=>translate(language,key,values);
const name=record=>language==='en' ? record.name_en || record.name : record.name;
const labels=()=>LABELS[language];
const failure=(key,values)=>Object.assign(new Error(key),{key,values});
const $ = id => document.getElementById(id);
const pricingView=createPricingView(()=>language);
const formatDate = value => {const d = dateKey(value);return d ? d.replaceAll('-','.') : t('dateUnknown');};
const eventTime = event => formatEventTime(event.published_at,event.date_precision,language);
const state = {expanded:new Set(),catalog:null,index:null,coverage:null,events:new Map(),loaded:new Set(),filters:{category:'all',entity:'',kind:'',query:'',from:daysAgo(6),to:daysAgo(0)},visible:18,request:0,view:'feed',detailId:null,error:null,ready:false,unavailable:false};
async function json(path, suffix='') {
  const response = await fetch(new URL(`data/${path}${suffix}`,document.baseURI),{cache:'no-cache'});
  if (!response.ok) throw failure('httpError',{status:response.status});
  return response.json();
}
function checkSnapshot(value) {if (value.snapshot_id !== state.index.snapshot_id) throw failure('snapshotError');}
function error(value) {state.error=value;$('error-box').hidden=false;$('error-box').textContent=t(value.key || 'loadError',value.values);}
function tags(event) {return createEventRenderer(state.catalog,language).tags(event);}
function eventDetails(event) {return createEventRenderer(state.catalog,language).eventDetails(event);}
function card(event) {return createEventRenderer(state.catalog,language,state.expanded).card(event);}
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
  for(const [id,category] of [['count-all','all'],['count-model','model'],['count-agent','agent'],['count-platform','platform'],['count-person','person']]) {
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
    out=`<div class="empty-state"><div class="empty-mark" aria-hidden="true">∅</div><h3>${t(filtered?'noMatchesTitle':'noUpdatesTitle')}</h3><p>${t(filtered?'noMatchesCopy':'noUpdatesCopy')}</p>${filtered||showSources?`<button id="empty-reset">${t(filtered?'reset':'coverageLink')} ↗</button>`:''}</div>`;
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
  catch(e){if(request===state.request){error(e);$('feed-list').setAttribute('aria-busy','false');}}
}
function fillEntities() {
  const values=followingObjects(state.catalog).filter(e=>e.category===state.filters.category);
  if(!values.some(e=>e.id===state.filters.entity)) state.filters.entity='';
  $('entity-filter').hidden=state.filters.category==='all';
  $('entity-filter').innerHTML=[{id:'',name:t('allEntities'),name_en:t('allEntities')},...values].map(e=>`<button type="button" data-entity="${escape(e.id)}" aria-pressed="${e.id===state.filters.entity}">${escape(name(e))}</button>`).join('');
}
function resetFilters() {
  Object.assign(state.filters,{category:'all',entity:'',kind:'',query:''});
  $('search-input').value='';$('kind-filter').value='';
  document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b.dataset.category==='all');b.setAttribute('aria-pressed',String(b.dataset.category==='all'));});
  fillEntities();state.visible=18;refreshFeed();
}
function switchView(view) {
  if(view==='sources'&&!showSources) return;
  state.view=view;$('feed-view').hidden=view!=='feed';$('sources-view').hidden=view!=='sources';$('pricing-view').hidden=view!=='pricing';
  const url=new URL(location.href);url.hash=view==='pricing'?'pricing':view==='sources'?'sources':'';history.replaceState(null,'',url);
  for(const [id,name] of [['feed-nav','feed'],['pricing-nav','pricing'],['sources-nav','sources']]){$(id).classList.toggle('selected',view===name);if(view===name)$(id).setAttribute('aria-current','page');else $(id).removeAttribute('aria-current');}
  if(view==='pricing') pricingView.load();
  if(view==='sources') renderSources();
}
function sourceStatus(info) {
  if(info.verification!=='verified') return [t('unverified'),'limited'];
  if(['failed','blocked'].includes(info.status)) return [t('restricted'),'failed'];
  if(info.pending_count) return [t('pendingCount',{count:info.pending_count}),'limited'];
  if(info.status==='success' && info.reviewed_through) return [t('reviewed'),''];
  if(info.status==='partial') return [t('partial'),'limited'];
  return [t(info.note==='RSS 订阅待配置'?'feedPending':'notCollected'),'limited'];
}
function renderSources() {
  const query=$('source-search').value.trim().toLowerCase();
  const coverage=new Map(state.coverage.sources.map(s=>[s.source_id,s]));
  $('source-list').innerHTML=state.catalog.sources.filter(s=>!query || [s.name,s.name_en,...s.entity_ids.flatMap(id=>{const entity=state.catalog.entities.find(e=>e.id===id);return entity?[entity.name,entity.name_en,...entity.aliases]:[id];})].join(' ').toLowerCase().includes(query)).map(s=>{
    const info=coverage.get(s.id)||{status:'not_attempted',verification:s.verification,pending_count:0};
    const [label,cls]=sourceStatus(info);
    return `<article class="source-card"><div class="source-platform">${escape(labels().platform[s.platform]||s.platform)}</div><h3>${escape(name(s))}</h3><span class="source-state ${cls}">● ${escape(label)}</span><p>${escape(coverageNote(info,language))}</p>${s.subscription_note?`<p>${escape(language==='en'?s.subscription_note_en || t('noteUnavailable'):s.subscription_note)}</p>`:''}<p>${t('lastAttempt')}: ${escape(info.last_attempt_at?formatDate(info.last_attempt_at):'—')}<br>${t('reviewCompleted')}: ${escape(info.reviewed_through?formatDate(info.reviewed_through):t('unconfirmed'))}</p><a href="${escape(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${t('original')} ↗</a>${s.feed_url?` · <a href="${escape(safeURL(s.feed_url))}" target="_blank" rel="noopener noreferrer">${t('rss')} ↗</a>`:` · <span class="source-platform">${t(s.feed_provider==='offline'?'offlineRSS':'rssPending')}</span>`}</article>`;
  }).join('') || `<p class="range-note">${t('noSources')}</p>`;
  $('platform-notes').innerHTML=state.catalog.platforms.map(p=>{
    const count=state.catalog.sources.filter(s=>s.platform===p.id && s.verification==='verified').length;
    return `<span class="platform-note">${escape(name(p))} · ${count?t('verifiedCount',{count}):t('accountsPending')}</span>`;
  }).join('');
}
async function detail(id) {
  try {
    let event=state.events.get(id);
    if(!event){const month=state.index.event_locations[id];if(!month)throw failure('relatedUnavailable');const file=state.index.months.find(m=>m.month===month);if(!file)throw failure('relatedIncomplete');const value=await json(file.path,`?v=${encodeURIComponent(state.index.snapshot_id)}`);checkSnapshot(value);value.events.forEach(e=>state.events.set(e.id,e));event=state.events.get(id);}
    if(!event) throw failure('relatedUnavailable');
    state.detailId=id;
    const content=eventContent(event,language);
    $('dialog-content').innerHTML=`<div class="card-meta">${tags(event)}<span class="kind-tag ${escape(event.kind)}">${labels().kind[event.kind]}</span></div><h2 id="dialog-title" class="dialog-title" lang="${content.lang}">${escape(content.title)}</h2>${eventDetails(event)}`;
    if(!$('event-dialog').open) $('event-dialog').showModal();
  }catch(e){error(e);}
}
function applyLanguage() {
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  document.title=t('seoTitle');
  document.querySelector('meta[name="description"]').content=t('description');
  document.querySelector('meta[property="og:title"]').content=t('seoTitle');
  document.querySelector('meta[property="og:description"]').content=t('description');
  document.querySelector('meta[property="og:locale"]').content=language==='zh'?'zh_CN':'en_US';
  document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
  for(const attribute of ['aria-label','placeholder']) document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(el=>el.setAttribute(attribute,t(el.getAttribute(`data-i18n-${attribute}`))));
  document.querySelectorAll('[data-i18n-kind]').forEach(el=>el.textContent=labels().kind[el.dataset.i18nKind]);
  document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
  document.querySelectorAll('.brand-name').forEach(el=>el.textContent=language==='en'?'AI Brief':'AI 简报');
  cookieControls.refresh();
  if(state.view==='pricing') pricingView.render();
  if(state.error && !$('error-box').hidden) error(state.error);
  if(state.unavailable){$('snapshot-time').textContent=t('unavailable');$('feed-list').textContent=t('retry');}
}
function renderSnapshot() {
  $('snapshot-time').textContent=t('snapshot',{time:formatEventTime(state.index.generated_at,'datetime',language)});
  $('source-count').textContent=state.catalog.sources.length;
  const summary=coverageSummary(state.coverage.sources);
  const stale=Date.now()-new Date(state.index.generated_at).getTime()>48*3600000;
  const incomplete=summary.failed||summary.pending||summary.complete<summary.total;
  $('coverage-status').textContent=t(stale?'stale':incomplete?'incomplete':'complete');
  $('coverage-description').textContent=t('coverageSummary',summary)+(summary.pending?t('pendingSuffix',{count:summary.pending}):'');
}
function setLanguage(next) {
  if(next===language) return;
  const scrollY=window.scrollY,dialogScroll=$('event-dialog').scrollTop;
  language=next;
  preferences.rememberLanguage(language);
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  applyLanguage();
  if(state.ready){fillEntities();renderSnapshot();renderFeed();if(state.view==='sources')renderSources();}
  if($('event-dialog').open&&state.detailId){detail(state.detailId);$('event-dialog').scrollTop=dialogScroll;}
  window.scrollTo(0,scrollY);
}
function bind() {
  $('sources-nav').hidden=!showSources;
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
  $('event-dialog').addEventListener('close',()=>{state.detailId=null;});
  $('feed-nav').addEventListener('click',()=>switchView('feed'));$('sources-nav').addEventListener('click',()=>switchView('sources'));
  $('pricing-nav').addEventListener('click',()=>switchView('pricing'));
  window.addEventListener('hashchange',()=>switchView(location.hash==='#pricing'?'pricing':location.hash==='#sources'&&showSources&&state.ready?'sources':'feed'));
  $('filter-reset').addEventListener('click',resetFilters);
  document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{state.filters.category=button.dataset.category;state.filters.entity='';document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});fillEntities();state.visible=18;refreshFeed();}));
  $('entity-filter').addEventListener('click',e=>{const button=e.target.closest('[data-entity]');if(!button)return;state.filters.entity=button.dataset.entity;$('entity-filter').querySelectorAll('[data-entity]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));state.visible=18;refreshFeed();});
  $('kind-filter').addEventListener('change',e=>{state.filters.kind=e.target.value;state.visible=18;refreshFeed();});
  $('feed-list').addEventListener('toggle',e=>{if(!e.target.matches('details[data-event-id]'))return;const id=e.target.dataset.eventId;if(e.target.open)state.expanded.add(id);else state.expanded.delete(id);},true);
  let debounce; $('search-input').addEventListener('input',e=>{clearTimeout(debounce);debounce=setTimeout(()=>{state.filters.query=e.target.value;state.visible=18;refreshFeed();},160);});
  document.querySelectorAll('[data-days]').forEach(button=>button.addEventListener('click',()=>{const days=button.dataset.days;state.filters.from=days==='all'?'':daysAgo(Number(days)-1);state.filters.to=days==='all'?'':daysAgo(0);document.querySelectorAll('[data-days]').forEach(b=>b.classList.toggle('selected',b===button));$('date-from').value=state.filters.from;$('date-to').value=state.filters.to;state.visible=18;refreshFeed();}));
  $('custom-date').addEventListener('click',()=>{$('custom-range').hidden=!$('custom-range').hidden;$('custom-date').setAttribute('aria-expanded',String(!$('custom-range').hidden));});
  $('date-apply').addEventListener('click',()=>{const from=$('date-from').value,to=$('date-to').value;if(from&&to&&from>to){error(failure('dateError'));return;}$('error-box').hidden=true;state.filters.from=from;state.filters.to=to;document.querySelectorAll('[data-days]').forEach(b=>b.classList.remove('selected'));state.visible=18;refreshFeed();});
  $('more-button').addEventListener('click',()=>{state.visible+=18;renderFeed();});
  $('source-search').addEventListener('input',renderSources);
  document.addEventListener('click',e=>{const button=e.target.closest('[data-detail]');if(button) detail(button.dataset.detail);});
  $('dialog-close').addEventListener('click',()=>$('event-dialog').close());
  $('event-dialog').addEventListener('click',e=>{if(e.target===$('event-dialog')){const r=$('event-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('event-dialog').close();}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!document.querySelector('dialog[open]')&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();if(state.view==='pricing')$('pricing-search').focus();else{switchView('feed');$('search-input').focus();}}});
}
async function init() {
  bind();applyLanguage();$('date-from').value=state.filters.from;$('date-to').value=state.filters.to;
  if(location.hash==='#pricing') switchView('pricing');
  for(let attempt=0;attempt<2;attempt++){
    try {
      const suffix=attempt?`?refresh=${Date.now()}`:'';
      [state.index,state.catalog,state.coverage]=await Promise.all([json('index.json',suffix),json('catalog.json',suffix),json('coverage.json',suffix)]);
      checkSnapshot(state.catalog);checkSnapshot(state.coverage);break;
    }catch(e){if(attempt===1){error(e);state.unavailable=true;$('snapshot-time').textContent=t('unavailable');$('feed-list').textContent=t('retry');$('feed-list').setAttribute('aria-busy','false');return;}}
  }
  state.ready=true;renderSnapshot();
  fillEntities();await refreshFeed();
}
init().catch(e=>error(e));
