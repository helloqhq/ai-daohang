import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {escape} from '../public/assets/render.js';
import {validatePricing,priceLabel} from '../public/assets/pricing.js';

export function pricingGUID(plan) {
  const {checked_at,updated_at,models_checked_at,...content}=plan;
  const canonical=JSON.stringify(content,(_key,value)=>value && typeof value==='object' && !Array.isArray(value)?Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b))):value);
  const hash=createHash('sha256').update(canonical).digest('hex').slice(0,16);
  return `ai-brief-pricing:${plan.id}:${hash}`;
}
export function renderPricingRSS(data) {
  validatePricing(data);
  const items=data.plans.map(plan=>{
    const price=plan.category==='api'?`输入 ${priceLabel(plan.price.input,plan.currency)} / 输出 ${priceLabel(plan.price.output,plan.currency)} / 缓存读取 ${priceLabel(plan.price.cached,plan.currency)}（每百万 tokens）`:`${priceLabel(plan.price.amount,plan.currency)}${plan.billing==='free'?' · 无订阅费 / No subscription fee':plan.billing==='monthly-from'?'/月起':plan.billing==='seat-monthly'?'/席位/月':'/月'}`;
    const models=plan.category==='api'?'':`\n可用模型 / Supported models: ${plan.supported_models.join(', ')}。${plan.models_note_zh}\n${plan.models_note_en}\n模型权益核验 / Model access checked: ${plan.models_checked_at}。${plan.models_source_urls.join(' ')}`;
    const description=`计费快照，非实时价格。${price}。${plan.scope_zh}。${plan.note_zh} 核验日期：${plan.checked_at}。\nPricing snapshot, not a live quote. ${plan.scope_en}. ${plan.note_en}${models}`;
    return `<item><title>${escape(`${plan.name} · ${price}`)}</title><link>${escape(plan.source_url)}</link><guid isPermaLink="false">${pricingGUID(plan)}</guid><pubDate>${new Date(`${plan.updated_at}T00:00:00+08:00`).toUTCString()}</pubDate><category>${plan.category}</category><description>${escape(description)}</description></item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>AI 简报 · 计费快照 / Pricing snapshots</title><link>https://go2-ai.com/#pricing</link><description>模型 API、Token Plan 与 Agent 套餐的人工核验快照。更新并发布后刷新，不代表厂商实时价格或完整历史。</description><language>zh-CN</language><atom:link href="https://go2-ai.com/data/pricing.xml" rel="self" type="application/rss+xml"/>\n${items}\n</channel></rss>\n`;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const destination=process.argv[2];
  const data=JSON.parse(await readFile(join(destination,'data/pricing.json'),'utf8'));
  await writeFile(join(destination,'data/pricing.xml'),renderPricingRSS(data));
  console.log(`计费数据已校验，RSS 已生成：${data.plans.length} 项方案`);
}
