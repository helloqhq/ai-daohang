import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {validatePricing} from '../public/assets/pricing.js';
import {pricingStatus,offerStatus} from '../public/assets/pricing-offers.js';

// Inspection only: an agent must verify official evidence before changing a record.
export function maintenanceReport({pricing,entities,sources,people},now=new Date()) {
  validatePricing(pricing);
  const sourceURLs=new Map(),missingMappings=[],review=[];
  const addSource=(url,plan,role,checked)=>{
    if(!sourceURLs.has(url)) sourceURLs.set(url,{url,plan_ids:new Set(),roles:new Set(),oldest_checked_at:checked});
    const item=sourceURLs.get(url);
    item.plan_ids.add(plan.id);item.roles.add(role);
    if(checked<item.oldest_checked_at) item.oldest_checked_at=checked;
  };
  for(const plan of pricing.plans) {
    addSource(plan.source_url,plan,'price',plan.checked_at);
    for(const url of plan.models_source_urls||[]) addSource(url,plan,'model_access',plan.models_checked_at);
    const objects=entities.filter(entity=>entity.enabled!==false && (plan.category==='api'?entity.pricing_provider===plan.provider:entity.pricing_product_ids?.includes(plan.product_id)));
    const channels=sources.filter(source=>source.enabled && source.verification==='verified' && (source.feed_url||source.rsshub_route||source.offline_conversion) && source.entity_ids.some(id=>objects.some(entity=>entity.id===id)));
    if(!objects.length||!channels.length) missingMappings.push({plan_id:plan.id,provider:plan.provider,product_id:plan.product_id,entity_ids:objects.map(entity=>entity.id),missing:!objects.length?'object':'news_channel'});
    const issues=[];
    const status=pricingStatus(plan,now);
    if(status!=='verified') issues.push(status);
    for(const offer of plan.offers||[]) {
      addSource(offer.source_url,plan,'offer',offer.checked_at);
      if(offer.reference) addSource(offer.reference.source_url,plan,'reference',offer.reference.checked_at);
      const state=offerStatus(plan,offer,now);
      if(state!=='verified') issues.push(`offer:${offer.id}:${state}`);
      if(offer.ends_at && Date.parse(offer.ends_at)>now && Date.parse(offer.ends_at)-now<=7*86400000) issues.push(`offer:${offer.id}:ends_within_7_days`);
    }
    if(issues.length) review.push({plan_id:plan.id,entity_ids:objects.map(entity=>entity.id),issues,checked_at:plan.checked_at});
  }
  const sourceIssues=sources.flatMap(source=>{
    const issues=[];
    if(source.verification!=='verified') issues.push('identity_unverified');
    if(!source.enabled) issues.push('disabled');
    if(!source.feed_url&&!source.rsshub_route&&!source.offline_conversion) issues.push('subscription_missing');
    return issues.length?[{source_id:source.id,issues}]:[];
  });
  return {
    inspected_at:now.toISOString(),network_verified:false,
    counts:{entities:entities.length,people:people.length,sources:sources.length,plans:pricing.plans.length,offers:pricing.plans.reduce((n,plan)=>n+(plan.offers?.length||0),0)},
    missing_pricing_mappings:missingMappings,pricing_review:review,source_issues:sourceIssues,
    pricing_sources:[...sourceURLs.values()].map(item=>({...item,plan_ids:[...item.plan_ids],roles:[...item.roles]})),
  };
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const {values}=parseArgs({options:{root:{type:'string'},now:{type:'string'}}});
    const root=resolve(values.root||fileURLToPath(new URL('..',import.meta.url)));
    const now=values.now?new Date(values.now):new Date();
    if(!Number.isFinite(now.getTime())) throw new Error('Invalid --now timestamp');
    const read=async path=>JSON.parse(await readFile(join(root,path),'utf8'));
    const [pricing,objects,channels]=await Promise.all([read('public/data/pricing.json'),read('config/entities.json'),read('config/sources.json')]);
    console.log(JSON.stringify(maintenanceReport({pricing,entities:objects.entities,sources:channels.sources,people:channels.people||[]},now),null,2));
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
