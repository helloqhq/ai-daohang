import {escape,safeURL} from './render.js';
import {translate} from './i18n.js';
import {pricingStatus,validDate,validateOffers,matchingOffers,renderOffers,renderOfferPanels,OFFER_KINDS} from './pricing-offers.js';
export {pricingStatus} from './pricing-offers.js';

export const PRICING_CATEGORIES=['api','token-plan','agent','chat'];
const categoryKey={'api':'pricingAPI','token-plan':'pricingTokenPlan','agent':'pricingAgent',chat:'pricingChat'};
const text=(plan,key,language)=>plan[`${key}_${language}`];
const amount=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(value);
export function priceLabel(value,currency) {
  return value===null || value===undefined ? '—' : currency==='CREDITS' ? `${amount(value)} Credits` : `${currency==='CNY'?'¥':'$'}${amount(value)}`;
}
export function billingLabel(billing,language='zh') {
  return translate(language,{'monthly-from':'pricingFrom','seat-monthly':'pricingPerSeat',free:'pricingNoSubscription'}[billing]||'pricingPerMonth');
}
export function filterPlans(plans,{category='all',provider='',currency='',query='',offer='all',offerKind='',includeUnavailable=false}={},now=new Date()) {
  const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return plans.filter(plan=> (category==='all'||plan.category===category||plan.use_cases?.includes(category)) && (!provider||plan.provider===provider) && (!currency||plan.currency===currency) && (offer==='all'||matchingOffers(plan,{offer,offerKind,includeUnavailable},now).length) && terms.every(term=>[plan.name,plan.provider,plan.category,plan.product_name,plan.tier_name,...(plan.use_cases||[]),...(plan.supported_models||[]),plan.scope_zh,plan.scope_en,plan.note_zh,plan.note_en,...(plan.offers||[]).flatMap(item=>[...item.models,item.conditions_zh,item.conditions_en,item.quota_zh,item.quota_en,item.eligibility_zh,item.eligibility_en])].join(' ').toLowerCase().includes(term)));
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
  if(data.version!==1 || !validDate(data.checked_at) || !Array.isArray(data.plans) || !data.plans.length) throw new Error('Invalid pricing snapshot');
  const ids=new Set(),products=new Map();
  for(const plan of data.plans) {
    if(!/^[a-z0-9-]+$/.test(plan.id)||ids.has(plan.id)) throw new Error('Invalid or duplicate plan ID');
    ids.add(plan.id);
    if(!PRICING_CATEGORIES.includes(plan.category)||!['USD','CNY','CREDITS'].includes(plan.currency)||!['verified','pending','paused'].includes(plan.status)) throw new Error(`Invalid category, currency or status: ${plan.id}`);
    if(!['token','monthly','monthly-from','seat-monthly','free'].includes(plan.billing)||(plan.category==='api')!==(plan.billing==='token')) throw new Error(`Invalid billing unit: ${plan.id}`);
    if(plan.billing==='free'&&(!['agent','chat'].includes(plan.category)||plan.price?.amount!==0)) throw new Error(`Invalid free plan price: ${plan.id}`);
    for(const key of ['provider','name','scope_zh','scope_en','note_zh','note_en']) if(typeof plan[key]!=='string'||!plan[key].trim()) throw new Error(`Missing ${key}: ${plan.id}`);
    if(!validDate(plan.checked_at)||!validDate(plan.updated_at)||plan.updated_at>data.checked_at||plan.checked_at>data.checked_at||plan.valid_until&&!validDate(plan.valid_until)) throw new Error(`Invalid dates: ${plan.id}`);
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
    validateOffers(plan,data);
  }
  return data;
}
export function renderPricing(plans,language='zh',now=new Date(),filters={offer:'all'}) {
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
      const terms=`${renderOffers(plan,language,now,filters,priceLabel)}<details class="pricing-details"><summary>${t('pricingDetails')}</summary><p>${escape(text(plan,'note',language))}</p>${api?`<p>${t('pricingCacheWrite')}: ${priceLabel(plan.price.cache_write,plan.currency)} ${t('pricingPerMillion')}</p>`:''}</details>${source}`;
      const price=api?['input','output','cached'].map(key=>`<td class="pricing-number">${priceLabel(plan.price[key],plan.currency)}</td>`).join(''):`<td class="pricing-number">${plan.price.amount===null?`<span class="pricing-unknown">${t('pricingCheckout')}</span>`:priceLabel(plan.price.amount,plan.currency)}<small>${billingLabel(plan.billing,language)}</small></td>`;
      let models='';
      if(!api) {
        const list=items=>`<ul class="pricing-model-list">${items.map(model=>`<li>${escape(model)}</li>`).join('')}</ul>`;
        const rest=plan.supported_models.slice(6);
        models=`<td class="pricing-models">${list(plan.supported_models.slice(0,6))}${rest.length?`<details class="pricing-models-more"><summary>${t('pricingMoreModels',{count:rest.length})}</summary>${list(rest)}</details>`:''}<p>${escape(text(plan,'models_note',language))}</p>${plan.models_source_urls.map((url,index)=>`<a href="${escape(safeURL(url))}" target="_blank" rel="noopener noreferrer">${t('pricingModelSource')}${plan.models_source_urls.length>1?` ${index+1}`:''} ↗<span class="sr-only"> · ${escape(plan.name)}</span></a>`).join(' · ')}<span class="pricing-checked">${t('pricingChecked')} <time datetime="${plan.models_checked_at}">${plan.models_checked_at}</time></span></td>`;
      }
      const uses=(plan.use_cases||[]).map(value=>t(`pricingUse_${value}`)).join(' · ');
      return `<tr data-pricing-plan="${escape(plan.id)}"><th scope="row"><strong>${escape(api?plan.name:plan.tier_name)}</strong>${statusHTML}${uses?`<span class="pricing-use-cases">${uses}</span>`:''}${api?`<span class="pricing-scope">${escape(text(plan,'scope',language))}</span>`:''}</th>${price}${models}${api?'':`<td class="pricing-quota">${escape(text(plan,'scope',language))}</td>`}<td class="pricing-terms">${terms}</td></tr>`;
    }).join('');
    return `<section class="pricing-section" data-pricing-product="${escape(api?'api':group.product_id)}" aria-label="${escape(provider.provider)} · ${title}"><div class="pricing-section-heading"><h4 id="${headingID}">${title} <span>${api?'':t(categoryKey[category])+' · '}${t('pricingResults',{count:records.length})}</span></h4><span>${t(api?'pricingAPIUnit':'pricingPlanUnit')}</span></div><div class="pricing-table-wrap" tabindex="0" role="region" aria-label="${escape(provider.provider)} · ${title} · ${t('pricingTable')}"><table class="pricing-table ${api?'pricing-api-table':'pricing-plan-table'}"><caption class="sr-only">${escape(provider.provider)} · ${title} · ${t(api?'pricingAPIUnit':'pricingPlanUnit')}</caption><thead><tr>${headings.map(key=>`<th scope="col">${t(key)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
    }).join('');
    return `<section class="pricing-vendor" data-pricing-provider="${escape(provider.provider)}" aria-labelledby="pricing-vendor-${providerIndex}"><div class="pricing-vendor-heading"><h3 id="pricing-vendor-${providerIndex}">${escape(provider.provider)}</h3><span>${t('pricingResults',{count:provider.groups.reduce((count,group)=>count+group.plans.length,0)})}</span></div>${sections}</section>`;
  }).join('');
}

export function createPricingView(getLanguage) {
  const $=id=>document.getElementById(id);
  const defaults={category:'all',provider:'',currency:'',query:'',offer:'all',offerKind:'',includeUnavailable:false};
  const filters={...defaults};
  let data=null,loading=false,failed=false;
  const t=(key,values)=>translate(getLanguage(),key,values);
  function updateScrollHints() {
    const tables=[...$('pricing-list').querySelectorAll('.pricing-table-wrap')].map(wrap=>({wrap,overflow:wrap.scrollWidth>wrap.clientWidth+1}));
    for(const {wrap,overflow} of tables) wrap.classList.toggle('is-scrollable',overflow);
    $('pricing-scroll-hint').hidden=!tables.some(table=>table.overflow);
  }
  new ResizeObserver(updateScrollHints).observe($('pricing-list'));
  function render() {
    if(!data) {
      $('pricing-list').innerHTML=failed?`<div class="empty-state" role="alert"><h3>${t('pricingLoadError')}</h3><button type="button" data-pricing-retry>${t('pricingRetry')}</button></div>`:`<div class="loading-state">${t('pricingLoading')}</div>`;
      return;
    }
    const now=new Date();
    const focusedOffer=document.activeElement?.dataset.pricingOffer;
    $('pricing-offer-panels').innerHTML=renderOfferPanels(data.plans,getLanguage(),filters.offer,now);
    if(focusedOffer) $('pricing-offer-panels').querySelector(`[data-pricing-offer="${focusedOffer}"]`)?.focus({preventScroll:true});
    $('pricing-offer-controls').hidden=filters.offer==='all';
    $('pricing-include-unavailable').checked=filters.includeUnavailable;
    $('pricing-offer-kind').innerHTML=`<option value="">${t('pricingOfferAllKinds')}</option>`+(OFFER_KINDS[filters.offer]||[]).map(kind=>`<option value="${kind}">${t(`pricingOfferKind_${kind}`)}</option>`).join('');
    $('pricing-offer-kind').value=filters.offerKind;
    const plans=filterPlans(data.plans,filters,now);
    $('pricing-list').innerHTML=renderPricing(plans,getLanguage(),now,filters);
    updateScrollHints();
    $('pricing-result-count').textContent=t('pricingResults',{count:plans.length});
    for(const button of document.querySelectorAll('[data-pricing-category]')) {
      const selected=button.dataset.pricingCategory===filters.category;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
      button.querySelector('[data-pricing-count]').textContent=filterPlans(data.plans,{...filters,category:button.dataset.pricingCategory},now).length;
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
    Object.assign(filters,defaults);
    $('pricing-search').value='';$('pricing-currency').value='';render();
  }
  document.querySelectorAll('[data-pricing-category]').forEach(button=>button.addEventListener('click',()=>{filters.category=button.dataset.pricingCategory;render();}));
  $('pricing-offer-panels').addEventListener('click',event=>{
    const button=event.target.closest('[data-pricing-offer]');
    if(!button) return;
    filters.offer=filters.offer===button.dataset.pricingOffer?'all':button.dataset.pricingOffer;
    filters.offerKind='';filters.includeUnavailable=false;render();
  });
  $('pricing-offer-kind').addEventListener('change',event=>{filters.offerKind=event.target.value;render();});
  $('pricing-include-unavailable').addEventListener('change',event=>{filters.includeUnavailable=event.target.checked;render();});
  for(const key of ['provider','currency']) $(`pricing-${key}`).addEventListener('change',event=>{filters[key]=event.target.value;render();});
  $('pricing-search').addEventListener('input',event=>{filters.query=event.target.value;render();});
  $('pricing-reset').addEventListener('click',reset);
  $('pricing-list').addEventListener('click',event=>{if(event.target.closest('[data-pricing-reset]'))reset();if(event.target.closest('[data-pricing-retry]'))load();});
  return {load,render};
}
