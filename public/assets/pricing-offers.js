import {escape,safeURL} from './render.js';
import {translate} from './i18n.js';
import {dateKey,zoneAbbreviation} from './model.js';
import {INTERFACE_ZONES as LANGUAGE_ZONES} from './i18n.js';

export const OFFER_KINDS={free:['recurring','signup','trial','limited-time'],discount:['promotion','vs-origin','off-peak','batch','official-discount']};
export const USE_CASES=['api','chat','agent'];
export const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)===value;
const https=value=>typeof value==='string' && safeURL(value)!=='#' && new URL(value).protocol==='https:';
const bilingual=(record,key)=>['zh','en'].every(language=>typeof record[`${key}_${language}`]==='string' && record[`${key}_${language}`].trim());
const timestamp=value=>typeof value==='string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && validDate(value.slice(0,10));

export function pricingStatus(plan,now=new Date()) {
  if(plan.valid_until && dateKey(now)>plan.valid_until) return 'expired';
  if(plan.status!=='verified') return plan.status;
  const checked=plan.models_checked_at && plan.models_checked_at<plan.checked_at?plan.models_checked_at:plan.checked_at;
  return now-new Date(`${checked}T00:00:00+08:00`)>30*86400000 ? 'stale' : 'verified';
}
export function offerStatus(plan,offer,now=new Date()) {
  if(offer.ends_at && now>=new Date(offer.ends_at)) return 'expired';
  if(offer.starts_at && now<new Date(offer.starts_at)) return 'scheduled';
  const parent=pricingStatus(plan,now);
  if(parent!=='verified') return parent;
  if(offer.status!=='verified') return offer.status;
  const checked=[offer.checked_at,offer.reference?.checked_at].filter(Boolean).sort()[0];
  return now-new Date(`${checked}T00:00:00+08:00`)>30*86400000 ? 'stale' : 'verified';
}
export function matchingOffers(plan,{offer='all',offerKind='',includeUnavailable=false}={},now=new Date()) {
  return (plan.offers||[]).filter(item=>(offer==='all'||item.type===offer) && (!offerKind||item.kind===offerKind) && (includeUnavailable||offerStatus(plan,item,now)==='verified'));
}
// Savings are comparable only within the same currency, billing unit and price dimension.
export function offerSavings(plan,offer) {
  if(!offer.reference || offer.reference.currency!==plan.currency || offer.reference.billing!==plan.billing) return {};
  return Object.fromEntries(Object.entries(offer.price||{}).flatMap(([key,value])=>{
    const base=offer.reference.price[key];
    return typeof value==='number' && typeof base==='number' && base>value ? [[key,Math.round((1-value/base)*10000)/100]] : [];
  }));
}
export function validateOffers(plan,data) {
  const fail=message=>{throw new Error(`${message}: ${plan.id}`);};
  if(plan.use_cases && (!Array.isArray(plan.use_cases)||!plan.use_cases.length||new Set(plan.use_cases).size!==plan.use_cases.length||plan.use_cases.some(value=>!USE_CASES.includes(value)))) fail('Invalid use cases');
  if(plan.offers===undefined) return;
  if(!Array.isArray(plan.offers)) fail('Invalid offers');
  const ids=new Set(),dimensions=plan.category==='api'?['input','output','cached','cache_write']:['amount'];
  const price=values=>values && typeof values==='object' && !Array.isArray(values) && Object.keys(values).length && Object.entries(values).every(([key,value])=>dimensions.includes(key) && typeof value==='number' && Number.isFinite(value) && value>=0);
  for(const offer of plan.offers) {
    if(!offer || !/^[a-z0-9-]+$/.test(offer.id)||ids.has(offer.id)) fail('Invalid or duplicate offer ID');
    ids.add(offer.id);
    if(!OFFER_KINDS[offer.type]?.includes(offer.kind)||!['verified','pending','paused'].includes(offer.status)) fail('Invalid offer kind or status');
    if(!https(offer.source_url)||!validDate(offer.checked_at)||offer.checked_at>data.checked_at) fail('Invalid offer evidence');
    if(!bilingual(offer,'conditions')||!bilingual(offer,'eligibility')||!Array.isArray(offer.models)||!offer.models.length||offer.models.some(model=>typeof model!=='string'||!model.trim())) fail('Missing offer conditions or models');
    if(!['yes','no','unknown'].includes(offer.card_required)) fail('Missing card requirement');
    if(('end_note_zh' in offer||'end_note_en' in offer)&&!bilingual(offer,'end_note')) fail('Incomplete offer end note');
    if(offer.starts_at!=null&&!timestamp(offer.starts_at)||offer.ends_at!=null&&!timestamp(offer.ends_at)||offer.starts_at&&offer.ends_at&&Date.parse(offer.starts_at)>=Date.parse(offer.ends_at)) fail('Invalid offer window');
    if(offer.type==='free'&&!bilingual(offer,'quota')) fail('Missing free allowance');
    if(offer.price!==undefined&&!price(offer.price)) fail('Invalid offer price');
    if(offer.type==='discount'&&offer.status==='verified'&&!price(offer.price)) fail('Missing verified discount price');
    if(offer.type==='free'&&offer.price&&Object.values(offer.price).some(value=>value!==0)) fail('Free inference has a nonzero price');
    if(offer.reference) {
      const reference=offer.reference;
      if(offer.type!=='discount'||reference.currency!==plan.currency||reference.billing!==plan.billing||!https(reference.source_url)||!validDate(reference.checked_at)||reference.checked_at>data.checked_at||!bilingual(reference,'label')||!bilingual(reference,'comparison')||!price(reference.price)||!price(offer.price)) fail('Invalid discount reference');
      if(Object.entries(offer.price).some(([key,value])=>!(key in reference.price)||value>reference.price[key])||!Object.keys(offerSavings(plan,offer)).length) fail('Incomparable discount prices');
    }
  }
}
export function renderOffers(plan,language,now,filters,priceLabel) {
  const t=(key,values)=>translate(language,key,values);
  const local=(item,key)=>escape(item[`${key}_${language}`]||'');
  const prices=price=>Object.entries(price).map(([key,value])=>`${t({input:'pricingInput',output:'pricingOutput',cached:'pricingCache',cache_write:'pricingCacheWrite',amount:'pricingPrice'}[key])} ${priceLabel(value,plan.currency)}`).join(' · ');
  return matchingOffers(plan,{...filters,includeUnavailable:filters.offer==='all'||filters.includeUnavailable},now).map(offer=>{
    const status=offerStatus(plan,offer,now);
    const statusLabel=status==='verified'?'':t(status==='pending'?'pricingOfferPending':status==='paused'?'pricingOfferPaused':`pricingStatus_${status}`);
    const savings=Object.entries(offerSavings(plan,offer)).map(([key,value])=>`${t({input:'pricingInput',output:'pricingOutput',cached:'pricingCache',cache_write:'pricingCacheWrite',amount:'pricingPrice'}[key])} −${value}%`).join(' · ');
    const zoneStamp=value=>`${new Date(value).toLocaleString(language==='zh'?'zh-CN':'en-GB',{timeZone:LANGUAGE_ZONES[language],hour12:false})} ${language==='zh'?'UTC+8':zoneAbbreviation(LANGUAGE_ZONES[language],value)}`;
    const end=offer.ends_at?escape(zoneStamp(offer.ends_at)):offer.end_note_zh?local(offer,'end_note'):t('pricingOfferNoEnd');
    return `<article class="pricing-offer ${offer.type}"><strong>${t(`pricingOffer_${offer.type}`)} · ${t(`pricingOfferKind_${offer.kind}`)}</strong>${status==='verified'?'':`<span class="pricing-status ${status}">${statusLabel}</span>`}
      <dl class="pricing-offer-facts">
        <div><dt>${t('pricingOfferModels')}</dt><dd>${escape(offer.models.join(' · '))}</dd></div>
        ${offer.quota_zh?`<div><dt>${t('pricingOfferQuota')}</dt><dd>${local(offer,'quota')}</dd></div>`:''}
        ${offer.price?`<div><dt>${t('pricingPrice')}</dt><dd class="pricing-offer-price">${prices(offer.price)} <small>${t(plan.category==='api'?'pricingPerMillion':'pricingOfferBilling')}</small></dd></div>`:''}
        ${offer.reference?`<div><dt>${t('pricingOfferReference')}</dt><dd>${local(offer.reference,'label')} · ${prices(offer.reference.price)}<p>${local(offer.reference,'comparison')} · ${savings}</p><a href="${escape(safeURL(offer.reference.source_url))}" target="_blank" rel="noopener noreferrer">${t('pricingOfferReferenceSource')} ↗</a></dd></div>`:''}
        <div><dt>${t('pricingOfferConditions')}</dt><dd>${local(offer,'conditions')}</dd></div>
        <div><dt>${t('pricingOfferEligibility')}</dt><dd>${local(offer,'eligibility')} · ${t(`pricingCard_${offer.card_required}`)}</dd></div>
        <div><dt>${t('pricingOfferEnds')}</dt><dd>${end}</dd></div>
        ${offer.starts_at?`<div><dt>${t('pricingOfferStarts')}</dt><dd>${escape(zoneStamp(offer.starts_at))}</dd></div>`:''}
      </dl><a href="${escape(safeURL(offer.source_url))}" target="_blank" rel="noopener noreferrer">${t('pricingOfferSource')} ↗</a><span class="pricing-checked">${t('pricingChecked')} ${escape(offer.checked_at)}</span></article>`;
  }).join('');
}
export function renderOfferPanels(plans,language='zh',selected='all',now=new Date()) {
  const t=(key,values)=>translate(language,key,values);
  return ['free','discount'].map(type=>{
    const count=plans.filter(plan=>matchingOffers(plan,{offer:type},now).length).length;
    return `<button type="button" class="pricing-quick-panel ${type}" data-pricing-offer="${type}" aria-pressed="${selected===type}" aria-controls="pricing-list"><span>${t(`pricingOffer_${type}`)}</span> <span class="pricing-panel-count">${count}<span class="pricing-panel-unit"> ${t('pricingPanelCount')}</span></span></button>`;
  }).join('');
}
