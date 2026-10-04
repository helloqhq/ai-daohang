import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {daysAgo,dateKey,filterEvents} from '../public/assets/model.js';
import {createEventRenderer,escape} from '../public/assets/render.js';
import {translate} from '../public/assets/i18n.js';

export function renderInitialFeed(events,catalog,now=new Date()) {
  const filtered=filterEvents(events,catalog,{category:'all',from:daysAgo(6,now),to:daysAgo(0,now)});
  const renderer=createEventRenderer(catalog,'zh');
  let lastDate='',html='';
  for(const event of filtered.slice(0,18)) {
    const date=dateKey(event.published_at);
    if(date!==lastDate){html+=`<div class="date-heading">${escape(date.replaceAll('-','.'))}</div>`;lastDate=date;}
    html+=renderer.card(event);
  }
  return html || `<div class="empty-state"><div class="empty-mark" aria-hidden="true">∅</div><h3>${translate('zh','noUpdatesTitle')}</h3><p>${translate('zh','noUpdatesCopy')}</p><button id="empty-reset">${translate('zh','coverageLink')} ↗</button></div>`;
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const destination=process.argv[2];
  const readJSON=async path=>JSON.parse(await readFile(join(destination,'data',path),'utf8'));
  const index=await readJSON('index.json');
  const catalog=await readJSON('catalog.json');
  const months=await Promise.all(index.months.map(month=>readJSON(month.path)));
  const html=await readFile(join(destination,'index.html'),'utf8');
  const feed=renderInitialFeed(months.flatMap(month=>month.events),catalog);
  await writeFile(join(destination,'index.html'),html.replace(/<!-- feed:start -->[\s\S]*?<!-- feed:end -->/,`<!-- feed:start -->${feed}<!-- feed:end -->`));
  console.log('首页已预渲染：沿用现有卡片、日期分组与近 7 天筛选');
}
