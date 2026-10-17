import {LABELS,INTERFACE_ZONES} from './i18n.js';
export function dateKey(value, timeZone = 'Asia/Shanghai') {
  if (!value) return '';
  if (value.length === 10) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
}
export function formatEventTime(value, precision = 'datetime', language = 'zh') {
  const zone = INTERFACE_ZONES[language] || 'Asia/Shanghai';
  const date = dateKey(value, zone);
  if (!date) return language === 'en' ? 'Date unverified' : '日期待核实';
  if (precision !== 'datetime') return value.slice(0,10); // date-only sources keep their literal calendar date
  if (value.length === 10) return value;
  const hour = new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',hourCycle:'h23'}).format(new Date(value));
  return `${date} ${hour}${language === 'en' ? 'h' : '时'}`;
}
// Short zone label (PDT/PST) for interface copy; Shanghai keeps its fixed UTC+8 wording.
export function zoneAbbreviation(timeZone, value = new Date()) {
  const d = new Date(value);
  if (!timeZone || Number.isNaN(d.getTime())) return '';
  const part = new Intl.DateTimeFormat('en-US',{timeZone,timeZoneName:'short'}).formatToParts(d).find(p => p.type === 'timeZoneName');
  return part ? part.value : '';
}
export function formatClock(value, timeZone) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const date = new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const time = new Intl.DateTimeFormat('en-GB',{timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);
  return `${date.slice(5)} ${time}`;
}
export function followingObjects(catalog) {
  return [
    ...catalog.entities.filter(e => e.enabled !== false).map(e => ({...e,category:e.kind === 'api_platform' ? 'platform' : e.category})),
    ...(catalog.people || []).map(p => ({...p,id:`person:${p.id}`,category:'person'})),
  ];
}
export function eventObjectIds(event, catalog) {
  const sources = new Map((catalog.sources || []).map(s => [s.id,s]));
  return [...new Set([...event.entity_ids,...(event.sources || []).flatMap(s => {
    const person = sources.get(s.source_id)?.person_id;
    return person ? [`person:${person}`] : [];
  })])];
}
export function daysAgo(days, now = new Date(), timeZone = 'Asia/Shanghai') {
  return dateKey(new Date(now.getTime() - days * 86400000), timeZone);
}
export function filterEvents(events, catalog, filters, timeZone = 'Asia/Shanghai') {
  const entities = new Map(followingObjects(catalog).map(e => [e.id,e]));
  const query = (filters.query || '').normalize('NFKC').toLocaleLowerCase().trim();
  return events.filter(event => {
    const date = dateKey(event.published_at, timeZone);
    const objectIds = eventObjectIds(event,catalog);
    if (filters.from && (!date || date < filters.from)) return false;
    if (filters.to && (!date || date > filters.to)) return false;
    if (filters.category !== 'all' && !objectIds.some(id => entities.get(id)?.category === filters.category)) return false;
    if (filters.entity && !objectIds.includes(filters.entity)) return false;
    if (filters.kind && event.kind !== filters.kind) return false;
    if (query) {
      const haystack = [event.title_zh,event.summary_zh,...event.key_points_zh,event.title_en,event.summary_en,...(event.key_points_en || []),...objectIds.flatMap(id => {
        const e = entities.get(id);return e ? [e.name,e.name_en,...(e.aliases || [])] : [];
      }),...event.topics.flatMap(t => [LABELS.zh.topic[t] || t,LABELS.en.topic[t] || t])].join(' ').normalize('NFKC').toLocaleLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }).sort((a,b) => (b.published_at || '').localeCompare(a.published_at || ''));
}
export function relevantMonths(index, from, to, timeZone = 'Asia/Shanghai') {
  return index.months.filter(m => (!from || !m.max_date || dateKey(m.max_date,timeZone) >= from) && (!to || !m.min_date || dateKey(m.min_date,timeZone) <= to));
}
export function coverageSummary(sources) {
  return {total:sources.length,checked:sources.filter(s=>['success','partial'].includes(s.status)).length,complete:sources.filter(s=>s.status==='success' && s.reviewed_through && !s.pending_count).length,failed:sources.filter(s=>['failed','blocked'].includes(s.status)).length,pending:sources.reduce((n,s)=>n+s.pending_count,0)};
}
