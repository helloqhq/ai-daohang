import {followingObjects,eventObjectIds,formatEventTime} from './model.js';
import {translate,LABELS,eventContent} from './i18n.js';
export const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeURL = value => {try {const u = new URL(value);return ['http:','https:'].includes(u.protocol) ? u.href : '#';} catch {return '#';}};

export function createEventRenderer(catalog,language,expanded=new Set()) {
  const t=(key,values)=>translate(language,key,values);
  const name=record=>language==='en' ? record.name_en || record.name : record.name;
  const labels=()=>LABELS[language];
  const eventTime=event=>formatEventTime(event.published_at,event.date_precision,language);
  function tags(event) {const objects=followingObjects(catalog);return eventObjectIds(event,catalog).map(id=>{const e=objects.find(x=>x.id===id);return e ? `<span class="entity-tag">${escape(name(e))}</span>`:'';}).join('');}
  function sourceName(sourceId) {const source=catalog.sources.find(s=>s.id===sourceId);return source ? name(source) : sourceId;}
  function eventDetails(event) {
    const content=eventContent(event,language);
    return `${language==='en'&&content.lang==='zh'?`<span class="translation-notice">${t('chineseOnly')}</span>`:''}<p class="event-summary" itemprop="description" lang="${content.lang}">${escape(content.summary)}</p><ul class="key-points" lang="${content.lang}">${content.key_points.map(p=>`<li>${escape(p)}</li>`).join('')}</ul>${content.translation?`<h3>${translate(content.lang,'translation')}</h3><p class="event-summary" lang="${content.lang}">${escape(content.translation)}</p>`:''}${(event.corrections||[]).map(c=>`<div class="correction">${escape(formatEventTime(c.at,'datetime',language))} ${t('correction')}: <span lang="${language==='en'&&c.reason_en?'en':'zh'}">${escape(language==='en'?c.reason_en || c.reason_zh:c.reason_zh)}</span> <a href="${escape(safeURL(c.url))}" target="_blank" rel="noopener noreferrer">${t('evidence')} ↗</a></div>`).join('')}<div class="topics">${event.topics.map(topic=>`<span class="topic">${escape(labels().topic[topic] || topic)}</span>`).join('')}</div><div class="related-links">${(event.related_event_ids||[]).map(related=>`<button data-detail="${escape(related)}">${t('related')} ↗</button>`).join('')}</div><div class="event-sources"><h4>${t('sourceEvidence')} · ${escape(eventTime(event))}</h4>${event.sources.map(source=>`<a${safeURL(source.url)!=='#'?' itemprop="citation"':''} href="${escape(safeURL(source.url))}" target="_blank" rel="noopener noreferrer">${escape(sourceName(source.source_id))} ↗<small>${t(source.material_scope==='metadata_only'?'metadata':source.material_scope==='partial_text'?'partialText':'fullText')}${source.evidence_locator?.start_seconds!=null?' · '+t('seconds',{seconds:escape(source.evidence_locator.start_seconds)}):''}</small></a>`).join('')}</div>`;
  }
  function card(event) {
    const content=eventContent(event,language);
    return `<article data-event-id="${escape(event.id)}" itemscope itemtype="https://schema.org/NewsArticle"><meta itemprop="inLanguage" content="${content.lang==='zh'?'zh-CN':'en'}"><details class="event-card" data-event-id="${escape(event.id)}"${expanded.has(event.id)?' open':''}><summary><span class="expand-icon" aria-hidden="true">›</span><h3 class="event-title" itemprop="headline" lang="${content.lang}">${escape(content.title)}</h3><div class="card-meta">${tags(event)}<span class="kind-tag ${escape(event.kind)}" itemprop="articleSection">${labels().kind[event.kind]}</span>${event.corrections?.length?`<span class="corrected-tag">${t('corrected')}</span>`:''}</div><time class="card-time"${event.published_at?` itemprop="datePublished" datetime="${escape(event.published_at)}"`:''}>${escape(eventTime(event))}</time></summary><div class="event-body">${eventDetails(event)}</div></details></article>`;
  }
  return {tags,eventDetails,card};
}
