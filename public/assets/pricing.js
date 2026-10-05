import {escape,safeURL} from './render.js';
import {translate} from './i18n.js';
import {dateKey} from './model.js';

export const PRICING_CATEGORIES=['api','token-plan','agent'];
const categoryKey={'api':'pricingAPI','token-plan':'pricingTokenPlan','agent':'pricingAgent'};
const text=(plan,key,language)=>plan[`${key}_${language}`];
const amount=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(value);
export function priceLabel(value,currency) {
  return value===null || value===undefined ? '—' : `${currency==='CNY'?'¥':'$'}${amount(value)}`;
}
export function pricingStatus(plan,now=new Date()) {
  const today=dateKey(now);
  if(plan.valid_until && today>plan.valid_until) return 'expired';
  if(plan.status!=='verified') return plan.status;
  const checked=plan.models_checked_at && plan.models_checked_at<plan.checked_at?plan.models_checked_at:plan.checked_at;
  return now-new Date(`${checked}T00:00:00+08:00`)>30*86400000 ? 'stale' : 'verified';
}
export function filterPlans(plans,{category='all',provider='',currency='',query=''}={}) {
  const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return plans.filter(plan=> (category==='all'||plan.category===category) && (!provider||plan.provider===provider) && (!currency||plan.currency===currency) && terms.every(term=>[plan.name,plan.provider,plan.category,plan.product_name,plan.tier_name,...(plan.supported_models||[]),plan.scope_zh,plan.scope_en,plan.note_zh,plan.note_en].join(' ').toLowerCase().includes(term)));
}
export function groupPricing(plans) {
  const providers=new Map();
  for(const plan of plans) {
    if(!providers.has(plan.provider)) providers.set(plan.provider,{provider:plan.provider,groups:new Map()});
    const groups=providers.get(plan.provider).groups;
    const key=`${plan.category}:${plan.category==='api'?'api':plan.product_id}`;
    if(!groups.has(key)) groups.set(key,{category:plan.category,product_id:plan.product_id,name:plan.product_name,plans:[]});
    groups.get(key).plans.push(plan);
  }
  return [...providers.values()].map(provider=>({...provider,groups:[...provider.groups.values()].sort((a,b)=>PRICING_CATEGORIES.indexOf(a.category)-PRICING_CATEGORIES.indexOf(b.category))}));
}
export function validatePricing(data) {
  const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'') && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)===value;
  if(data.version!==1 || !validDate(data.checked_at) || !Array.isArray(data.plans) || !data.plans.length) throw new Error('Invalid pricing snapshot');
  const ids=new Set(),products=new Map();
  for(const plan of data.plans) {
    if(!/^[a-z0-9-]+$/.test(plan.id)||ids.has(plan.id)) throw new Error('Invalid or duplicate plan ID');
    ids.add(plan.id);
    if(!PRICING_CATEGORIES.includes(plan.category)||!['USD','CNY'].includes(plan.currency)||!['verified','pending','paused'].includes(plan.status)) throw new Error(`Invalid category, currency or status: ${plan.id}`);
    if(!['token','monthly','monthly-from','seat-monthly'].includes(plan.billing)||(plan.category==='api')!==(plan.billing==='token')) throw new Error(`Invalid billing unit: ${plan.id}`);
    for(const key of ['provider','name','scope_zh','scope_en','note_zh','note_en']) if(typeof plan[key]!=='string'||!plan[key].trim()) throw new Error(`Missing ${key}: ${plan.id}`);
    if(!validDate(plan.checked_at)||!validDate(plan.updated_at)||plan.updated_at>plan.checked_at||plan.checked_at>data.checked_at||plan.valid_until&&!validDate(plan.valid_until)) throw new Error(`Invalid dates: ${plan.id}`);
    if(!plan.price||safeURL(plan.source_url)==='#'||new URL(plan.source_url).protocol!=='https:') throw new Error(`Missing price or HTTPS source: ${plan.id}`);
    if(plan.category!=='api') {
      for(const key of ['product_id','product_name','tier_name','models_note_zh','models_note_en']) if(typeof plan[key]!=='string'||!plan[key].trim()) throw new Error(`Missing ${key}: ${plan.id}`);
      if(!/^[a-z0-9-]+$/.test(plan.product_id)||!Array.isArray(plan.supported_models)||!plan.supported_models.length||plan.supported_models.some(model=>typeof model!=='string'||!model.trim())||new Set(plan.supported_models).size!==plan.supported_models.length) throw new Error(`Invalid product or supported models: ${plan.id}`);
      if(!Array.isArray(plan.models_source_urls)||!plan.models_source_urls.length||plan.models_source_urls.some(url=>safeURL(url)==='#'||new URL(url).protocol!=='https:')||!validDate(plan.models_checked_at)||plan.models_checked_at>data.checked_at) throw new Error(`Invalid model rights source or date: ${plan.id}`);
      const key=JSON.stringify([plan.provider,plan.category,plan.product_id]);
      if(products.has(key)&&products.get(key)!==plan.product_name) throw new Error(`Inconsistent product name: ${plan.id}`);
      products.set(key,plan.product_name);
    }
    const keys=plan.category==='api'?['input','output','cached','cache_write']:['amount'];
    for(const key of keys) {
      const value=plan.price[key];
      if(value!==null && (typeof value!=='number'||!Number.isFinite(value)||value<0)) throw new Error(`Invalid price: ${plan.id}/${key}`);
      if((key==='input'||key==='output'||key==='amount')&&value===null&&plan.status!=='pending') throw new Error(`Unverified price: ${plan.id}`);
    }
  }
  return data;
}
export function renderPricing(plans,language='zh',now=new Date()) {
  const t=(key,values)=>translate(language,key,values);
  if(!plans.length) return `<div class="empty-state"><div class="empty-mark" aria-hidden="true">∅</div><h3>${t('pricingEmpty')}</h3><p>${t('pricingEmptyCopy')}</p><button type="button" data-pricing-reset>${t('reset')}</button></div>`;
  return groupPricing(plans).map((provider,providerIndex)=>{
    const sections=provider.groups.map((group,groupIndex)=>{
    const {category,plans:records}=group;
    const api=category==='api';
    const title=api?t(categoryKey[category]):escape(group.name);
    const headingID=`pricing-heading-${providerIndex}-${groupIndex}`;
    const headings=api?['pricingProduct','pricingInput','pricingOutput','pricingCache','pricingTerms']:['pricingTier','pricingPrice','pricingModels','pricingQuota','pricingTerms'];
    const rows=records.map(plan=>{
      const status=pricingStatus(plan,now);
      const statusHTML=status==='verified'?'':`<span class="pricing-status ${status}">${t(`pricingStatus_${status}`)}</span>`;
      const source=`<a href="${escape(safeURL(plan.source_url))}" target="_blank" rel="noopener noreferrer">${t('pricingOfficial')} ↗<span class="sr-only"> · ${escape(plan.name)}</span></a><span class="pricing-checked">${t('pricingChecked')} <time datetime="${plan.checked_at}">${plan.checked_at}</time></span>`;
      const terms=`<details class="pricing-details"><summary>${t('pricingDetails')}</summary><p>${escape(text(plan,'note',language))}</p>${api?`<p>${t('pricingCacheWrite')}: ${priceLabel(plan.price.cache_write,plan.currency)} ${t('pricingPerMillion')}</p>`:''}</details>${source}`;
      const price=api?['input','output','cached'].map(key=>`<td class="pricing-number">${priceLabel(plan.price[key],plan.currency)}</td>`).join(''):`<td class="pricing-number">${plan.price.amount===null?`<span class="pricing-unknown">${t('pricingCheckout')}</span>`:priceLabel(plan.price.amount,plan.currency)}<small>${t(plan.billing==='monthly-from'?'pricingFrom':plan.billing==='seat-monthly'?'pricingPerSeat':'pricingPerMonth')}</small></td>`;
      let models='';
      if(!api) {
        const list=items=>`<ul class="pricing-model-list">${items.map(model=>`<li>${escape(model)}</li>`).join('')}</ul>`;
        const rest=plan.supported_models.slice(6);
        models=`<td class="pricing-models">${list(plan.supported_models.slice(0,6))}${rest.length?`<details class="pricing-models-more"><summary>${t('pricingMoreModels',{count:rest.length})}</summary>${list(rest)}</details>`:''}<p>${escape(text(plan,'models_note',language))}</p>${plan.models_source_urls.map((url,index)=>`<a href="${escape(safeURL(url))}" target="_blank" rel="noopener noreferrer">${t('pricingModelSource')}${plan.models_source_urls.length>1?` ${index+1}`:''} ↗<span class="sr-only"> · ${escape(plan.name)}</span></a>`).join(' · ')}<span class="pricing-checked">${t('pricingChecked')} <time datetime="${plan.models_checked_at}">${plan.models_checked_at}</time></span></td>`;
      }
      return `<tr data-pricing-plan="${escape(plan.id)}"><th scope="row"><strong>${escape(api?plan.name:plan.tier_name)}</strong>${statusHTML}${api?`<span class="pricing-scope">${escape(text(plan,'scope',language))}</span>`:''}</th>${price}${models}${api?'':`<td class="pricing-quota">${escape(text(plan,'scope',language))}</td>`}<td class="pricing-terms">${terms}</td></tr>`;
    }).join('');
    return `<section class="pricing-section" data-pricing-product="${escape(api?'api':group.product_id)}" aria-labelledby="${headingID}"><div class="pricing-section-heading"><h4 id="${headingID}">${title} <span>${api?'':t(categoryKey[category])+' · '}${t('pricingResults',{count:records.length})}</span></h4><span>${t(api?'pricingAPIUnit':'pricingPlanUnit')}</span></div><p class="pricing-scroll-hint">${t('pricingScroll')}</p><div class="pricing-table-wrap" tabindex="0" role="region" aria-labelledby="${headingID}"><table class="pricing-table ${api?'pricing-api-table':'pricing-plan-table'}"><caption class="sr-only">${escape(provider.provider)} · ${title} · ${t(api?'pricingAPIUnit':'pricingPlanUnit')}</caption><thead><tr>${headings.map(key=>`<th scope="col">${t(key)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
    }).join('');
    return `<section class="pricing-vendor" data-pricing-provider="${escape(provider.provider)}" aria-labelledby="pricing-vendor-${providerIndex}"><div class="pricing-vendor-heading"><h3 id="pricing-vendor-${providerIndex}">${escape(provider.provider)}</h3><span>${t('pricingResults',{count:provider.groups.reduce((count,group)=>count+group.plans.length,0)})}</span></div>${sections}</section>`;
  }).join('');
}

export function createPricingView(getLanguage) {
  const $=id=>document.getElementById(id);
  const filters={category:'all',provider:'',currency:'',query:''};
  let data=null,loading=false,failed=false;
  const t=(key,values)=>translate(getLanguage(),key,values);
  function render() {
    if(!data) {
      $('pricing-list').innerHTML=failed?`<div class="empty-state" role="alert"><h3>${t('pricingLoadError')}</h3><button type="button" data-pricing-retry>${t('pricingRetry')}</button></div>`:`<div class="loading-state">${t('pricingLoading')}</div>`;
      return;
    }
    const plans=filterPlans(data.plans,filters);
    $('pricing-list').innerHTML=renderPricing(plans,getLanguage());
    $('pricing-result-count').textContent=t('pricingResults',{count:plans.length});
    $('pricing-snapshot').textContent=t('pricingSnapshot',{date:data.checked_at,providers:new Set(data.plans.map(plan=>plan.provider)).size,count:data.plans.length});
    for(const button of document.querySelectorAll('[data-pricing-category]')) {
      const selected=button.dataset.pricingCategory===filters.category;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
      button.querySelector('[data-pricing-count]').textContent=button.dataset.pricingCategory==='all'?data.plans.length:data.plans.filter(plan=>plan.category===button.dataset.pricingCategory).length;
    }
    $('pricing-provider').innerHTML=`<option value="">${t('pricingAllProviders')}</option>`+[...new Set(data.plans.map(plan=>plan.provider))].sort().map(provider=>`<option value="${escape(provider)}">${escape(provider)}</option>`).join('');
    $('pricing-provider').value=filters.provider;
  }
  async function load() {
    if(data||loading) return;
    loading=true;failed=false;$('pricing-list').setAttribute('aria-busy','true');render();
    try {
      const response=await fetch(new URL('data/pricing.json',document.baseURI),{cache:'no-cache'});
      if(!response.ok) throw new Error('Pricing unavailable');
      data=validatePricing(await response.json());
    } catch {failed=true;}
    finally {loading=false;$('pricing-list').setAttribute('aria-busy','false');render();}
  }
  function reset() {
    Object.assign(filters,{category:'all',provider:'',currency:'',query:''});
    $('pricing-search').value='';$('pricing-currency').value='';render();
  }
  document.querySelectorAll('[data-pricing-category]').forEach(button=>button.addEventListener('click',()=>{filters.category=button.dataset.pricingCategory;render();}));
  for(const key of ['provider','currency']) $(`pricing-${key}`).addEventListener('change',event=>{filters[key]=event.target.value;render();});
  $('pricing-search').addEventListener('input',event=>{filters.query=event.target.value;render();});
  $('pricing-reset').addEventListener('click',reset);
  $('pricing-list').addEventListener('click',event=>{if(event.target.closest('[data-pricing-reset]'))reset();if(event.target.closest('[data-pricing-retry]'))load();});
  return {load,render};
}
