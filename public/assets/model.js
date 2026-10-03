export const KIND_LABELS = { update: '正式更新', preview: '预览 / 预告', opinion: '负责人观点' };
export const TOPIC_LABELS = {model_release:'模型发布',capability:'能力变化',api:'API',pricing:'价格变化',availability:'可用性',feature:'新功能',compatibility:'兼容性',critical_fix:'关键修复'};
export const PLATFORM_LABELS = {web:'官网 / 博客',github:'GitHub',youtube:'YouTube',tiktok:'TikTok',x:'X',threads:'Threads',wechat:'微信公众号'};
export function dateKey(value) {
  if (!value) return '';
  if (value.length === 10) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
}
export function daysAgo(days, now = new Date()) {
  return dateKey(new Date(now.getTime() - days * 86400000));
}
export function filterEvents(events, catalog, filters) {
  const entities = new Map(catalog.entities.map(e => [e.id,e]));
  const query = (filters.query || '').normalize('NFKC').toLocaleLowerCase().trim();
  return events.filter(event => {
    const date = dateKey(event.published_at);
    if (filters.from && (!date || date < filters.from)) return false;
    if (filters.to && (!date || date > filters.to)) return false;
    if (filters.category !== 'all' && !event.entity_ids.some(id => entities.get(id)?.category === filters.category)) return false;
    if (filters.entity && !event.entity_ids.includes(filters.entity)) return false;
    if (filters.kind && event.kind !== filters.kind) return false;
    if (query) {
      const haystack = [event.title_zh,event.summary_zh,...event.key_points_zh,...event.entity_ids.flatMap(id => {
        const e = entities.get(id);return e ? [e.name,...e.aliases] : [];
      }),...event.topics.map(t => TOPIC_LABELS[t] || t)].join(' ').normalize('NFKC').toLocaleLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }).sort((a,b) => (b.published_at || '').localeCompare(a.published_at || ''));
}
export function relevantMonths(index, from, to) {
  return index.months.filter(m => (!from || !m.max_date || dateKey(m.max_date) >= from) && (!to || !m.min_date || dateKey(m.min_date) <= to));
}
export function coverageSummary(sources) {
  return {total:sources.length,checked:sources.filter(s=>['success','partial'].includes(s.status)).length,complete:sources.filter(s=>s.status==='success' && s.reviewed_through && !s.pending_count).length,failed:sources.filter(s=>['failed','blocked'].includes(s.status)).length,pending:sources.reduce((n,s)=>n+s.pending_count,0)};
}
