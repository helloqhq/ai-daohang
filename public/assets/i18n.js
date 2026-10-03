export const LANGUAGES = ['zh', 'en'];
export const LANGUAGE_STORAGE_KEY = 'ai-signal-language';
export function resolveLanguage(search, stored) {
  const requested = new URLSearchParams(search).get('lang');
  return LANGUAGES.includes(requested) ? requested : LANGUAGES.includes(stored) ? stored : 'zh';
}

// Each entry keeps the Chinese and English copy together.
export const messages = {
  title: ['AI 简报', 'AI Brief'],
  description: ['模型、Agent、平台与名人的 AI 动态。', 'AI updates from models, agents, platforms and people.'],
  skip: ['跳到动态内容', 'Skip to updates'],
  home: ['AI 简报首页', 'AI Brief home'],
  navigation: ['主导航', 'Main navigation'],
  feed: ['动态', 'Updates'],
  sources: ['信息源', 'Sources'],
  language: ['选择语言', 'Choose language'],
  reading: ['正在读取数据…', 'Loading data…'],
  coverageLink: ['查看采集覆盖', 'View source coverage'],
  loading: ['正在加载', 'Loading'],
  filters: ['动态筛选', 'Filter updates'],
  categories: ['信息分类', 'Categories'],
  allUpdates: ['全部', 'All'],
  models: ['模型', 'Models'],
  agents: ['Agent', 'Agents'],
  platforms: ['平台', 'Platforms'],
  people: ['名人', 'People'],
  timezone: ['北京时间 UTC+8', 'Beijing time UTC+8'],
  entity: ['关注对象', 'Following'],
  allEntities: ['全部对象', 'All'],
  contentType: ['内容类型', 'Update type'],
  allTypes: ['全部类型', 'All types'],
  updateList: ['动态列表', 'Update list'],
  journal: ['最新动态', 'Latest updates'],
  searchPlaceholder: ['搜索变化、模型或工具', 'Search updates, models or tools'],
  searchLabel: ['搜索当前日期范围的动态', 'Search updates in the selected date range'],
  dateRange: ['日期范围', 'Date range'],
  days3: ['近 3 天', '3 days'],
  days7: ['近 7 天', '7 days'],
  days30: ['近 30 天', '30 days'],
  allHistory: ['全部历史', 'All history'],
  customDate: ['自定日期', 'Custom dates'],
  startDate: ['开始日期', 'Start date'],
  endDate: ['结束日期', 'End date'],
  to: ['至', 'to'],
  apply: ['应用', 'Apply'],
  loadingFeed: ['正在整理动态…', 'Loading the brief…'],
  more: ['继续阅读', 'Read more'],
  sourcesTitle: ['信息源', 'Sources'],
  sourceSearchPlaceholder: ['搜索对象或信息源', 'Search organizations or sources'],
  sourceSearchLabel: ['搜索信息源', 'Search sources'],
  download: ['下载全部订阅 OPML', 'Download all feeds as OPML'],
  top: ['回到顶部', 'Back to top'],
  close: ['关闭详情', 'Close details'],
  dateUnknown: ['日期待核实', 'Date unverified'],
  corrected: ['已更正', 'Corrected'],
  original: ['原始来源', 'Original source'],
  noMatchesTitle: ['暂无匹配动态', 'No matching updates'],
  noUpdatesTitle: ['暂无动态', 'No updates'],
  noMatchesCopy: ['可以调整筛选、搜索词或日期范围。', 'Try different filters, search terms or dates.'],
  noUpdatesCopy: ['可调整日期范围或查看信息源。', 'Try other dates or check sources.'],
  reset: ['重置筛选', 'Reset filters'],
  unverified: ['待核实账号', 'Account unverified'],
  restricted: ['读取受限', 'Access restricted'],
  pendingCount: ['{count} 条待审阅', '{count} awaiting review'],
  reviewed: ['已检查', 'Reviewed'],
  partial: ['部分覆盖', 'Partial coverage'],
  feedPending: ['订阅待配置', 'Feed not configured'],
  notCollected: ['尚未采集', 'Not collected yet'],
  lastAttempt: ['最近尝试', 'Last attempt'],
  reviewCompleted: ['完成审阅', 'Review completed'],
  unconfirmed: ['尚未完整确认', 'Not fully confirmed'],
  rss: ['RSS 订阅', 'RSS feed'],
  rssPending: ['RSS 待配置', 'RSS not configured'],
  offlineRSS: ['按需离线 RSS', 'On-demand offline RSS'],
  noSources: ['没有匹配的信息源。', 'No sources match your search.'],
  verifiedCount: ['{count} 个已核实入口', '{count} verified accounts'],
  accountsPending: ['账号待登记 / 核实', 'Accounts not registered / verified'],
  translation: ['中文译文', 'English translation'],
  correction: ['更正', 'Correction'],
  evidence: ['依据', 'Evidence'],
  related: ['查看关联事件', 'View related update'],
  sourceEvidence: ['原始依据', 'Original evidence'],
  metadata: ['依据标题 / 简介', 'Based on title / description'],
  partialText: ['依据已取得的正文片段', 'Based on available text excerpts'],
  fullText: ['依据原始文字内容', 'Based on original text'],
  seconds: ['{seconds} 秒起', 'from {seconds}s'],
  snapshot: ['更新于 {time}', 'Updated {time}'],
  stale: ['数据较旧，请留意采集日期', 'Older snapshot; check collection dates'],
  incomplete: ['部分来源仍待核查', 'Some sources still need review'],
  complete: ['当前来源已检查', 'Current sources reviewed'],
  coverageSummary: ['{checked} / {total} 个来源取得内容 · {failed} 个读取受限', '{checked} / {total} sources retrieved · {failed} restricted'],
  pendingSuffix: [' · {count} 条待审阅', ' · {count} awaiting review'],
  dateError: ['开始日期应早于结束日期。', 'Start date must be on or before end date.'],
  httpError: ['数据读取失败（{status}）', 'Could not load data ({status}).'],
  snapshotError: ['数据正在更新，请刷新后重试。', 'Data is being updated. Please refresh and try again.'],
  relatedUnavailable: ['关联事件暂不可用', 'Related update is unavailable.'],
  relatedIncomplete: ['关联事件索引不完整', 'The related update index is incomplete.'],
  loadError: ['无法读取数据，请刷新重试。', 'Could not load data. Please refresh and try again.'],
  unavailable: ['数据暂不可用', 'Data unavailable'],
  retry: ['请刷新重试。', 'Please refresh and try again.'],
  chineseOnly: ['仅有中文内容', 'Available in Chinese'],
  noteUnavailable: ['请查看原始来源了解详情。', 'See the original source for details.'],
};

export function translate(language, key, values = {}) {
  const template = messages[key]?.[language === 'en' ? 1 : 0] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}

export const LABELS = {
  zh: {
    kind: {update:'正式更新',preview:'预览 / 预告',opinion:'负责人观点'},
    topic: {model_release:'模型发布',capability:'能力变化',api:'API',pricing:'价格变化',availability:'可用性',feature:'新功能',compatibility:'兼容性',critical_fix:'关键修复'},
    platform: {web:'官网 / 博客',github:'GitHub',youtube:'YouTube',tiktok:'TikTok',x:'X',threads:'Threads',wechat:'微信公众号'},
  },
  en: {
    kind: {update:'Release',preview:'Preview',opinion:'Opinion'},
    topic: {model_release:'Model release',capability:'Capabilities',api:'API',pricing:'Pricing',availability:'Availability',feature:'New feature',compatibility:'Compatibility',critical_fix:'Critical fix'},
    platform: {web:'Website / Blog',github:'GitHub',youtube:'YouTube',tiktok:'TikTok',x:'X',threads:'Threads',wechat:'WeChat'},
  },
};

// Fall back as a complete article so incomplete translations do not mix languages.
export function eventContent(event, language) {
  const fields = ['title', 'summary', 'key_points', 'importance_reason'];
  const english = fields.every(key => key === 'key_points'
    ? Array.isArray(event.key_points_en) && event.key_points_en.length > 0 && event.key_points_en.every(p => typeof p === 'string' && p.trim())
    : typeof event[`${key}_en`] === 'string' && event[`${key}_en`].trim());
  const lang = language === 'en' && english ? 'en' : 'zh';
  return {lang, ...Object.fromEntries([...fields, 'translation'].map(key => [key, event[`${key}_${lang}`]]))};
}

const coverageNotes = {
  '订阅条目覆盖查询起点，已读取该订阅时间窗': 'Feed entries cover the query start; this feed window has been read.',
  '订阅历史有限或存在未知日期，完整时间窗尚未确认': 'Feed history is limited or dates are unknown; the full window is not confirmed.',
  'RSS 订阅待配置': 'RSS feed not configured.',
  '尚未采集': 'Not collected yet.',
  '账号或来源身份待核实': 'Account or source identity awaits verification.',
  '订阅地址已变更，待重新检查': 'Feed URL changed; a new check is required.',
  '离线转换待运行': 'On-demand offline conversion has not run yet.',
  '离线 RSS 已导入，在线覆盖未确认': 'Offline RSS imported; online coverage remains unconfirmed.',
};
export function coverageNote(info, language) {
  if (!info.note) return translate(language, 'notCollected');
  if (language === 'zh') return info.note;
  return info.note_en || coverageNotes[info.note] || (/^[\x00-\x7F]*$/.test(info.note) ? info.note : translate(language, 'noteUnavailable'));
}
