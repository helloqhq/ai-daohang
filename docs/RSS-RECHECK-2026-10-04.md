# RSS 来源复核：2026-10-04

本次针对“部分来源仍待核查”“部分覆盖”“读取受限”实测订阅、官方页面及转换规则，并修改本地配置、采集器和数据快照。时间按 Asia/Shanghai；逐来源沿用原有缺口起点，总体最早起点为 2026-09-30 10:54，最后联网采集于 2026-10-04 11:48。没有发布网站。

39 个来源的获取状态由 **16 成功 / 21 部分 / 2 受限**变为 **20 成功 / 18 部分 / 1 受限**。其中 19 个成功来源已完成已获取材料的审阅；YouTube 仍有 1 条缺少正文的材料。成功只指登记订阅的查询时间窗，不代表厂商全部渠道无遗漏。

## 已修复和接入

| 来源 | 原因与处理 | 实测结果 |
| --- | --- | --- |
| Codex Releases | Atom 首页仅 10 条；`page=2` 与首页完全相同。改用最后条目的版本标签作为 `after` 游标，逐页补到查询起点 | 本轮取得 25 条窗口内材料，补齐缺口，`success` |
| Copilot CLI Releases | 同样通过原生 Atom `after` 补历史，而不是将 RSS 条目数上限当成完整列表 | 读取历史页后覆盖查询起点，`success` |
| Anthropic News | 接入 [Olshansk 的新闻转换 RSS](https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic_news.xml)，保留官网正文补充 | 262 条有日期条目；生成于本日，最新 10 月 2 日条目与官网一致，`success` |
| Meta AI Blog | 接入 [Olshansk 的 Meta 转换 RSS](https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_meta_ai.xml)，保留官网正文补充 | 88 条有日期条目；生成于本日，最新 7 月 27 日条目与官网一致，`success` |
| Claude Code Changelog | 从 [官方文档页面](https://code.claude.com/docs/en/changelog)的 `rel=alternate` 发现 [官方全文 RSS](https://code.claude.com/docs/en/changelog/rss.xml)，替换 GitHub Releases 获取入口 | 15 条全文更新，日期覆盖查询起点；旧 GitHub 事件依据与 ID 保留 |
| Zuckerberg Threads | 原 `threads.net` 入口及主实例不能取得列表；迁到现行 `threads.com`，采用 [可读 RSSHub 实例](https://rsshub.rssforever.com/threads/zuck) | 4 条本人帖子及日期；从 `blocked` 恢复为 `partial`，有限列表不证明完整时间线 |
| X 正文归属 | 旧转换器搜索整个帖文对象的长文，可能命中引用帖；改为只读本人对象的 `core`、`details`、`note_tweet` | 六个账号重放缓存；“Exactly”和“Tesla FSD feels like magic”不再被被引用作者的长文替换 |

社区转换来源明确标为 `community`，不冒充官方原生 RSS；原文链接继续指向官网。其日期只保留官网能够支持的“日”，不把转换器填入的 UTC 零点当作实际发布时间。读取时要求 RSS 生成时间存在、距查询终点不超过一天，且不能明显在未来；否则保留材料并标为部分覆盖。

分页遇到重复游标、无可继续的条目或下一页读取失败时停止，已取得的材料保留，完整覆盖不推进。未知日期或无效原文链接也不能用较老条目的日期掩盖。订阅切换或重新读取会清除旧英文状态说明，避免中文显示成功、英文仍称离线失败。

## 仍为部分覆盖的来源

以下 17 个离线来源重新转换成功，但没有本轮验证可持续读取的在线订阅。转换结果是页面快照，仍保留最早缺口，不将本地导入当作在线完整覆盖。

| 来源 | 本轮取得的转换条目 | 保留限制及下一步 |
| --- | ---: | --- |
| DeepSeek API 更新 | 21 | 更新段落含日期和正文；RSSHub `/deepseek/news` 返回空订阅，不能采用 |
| Qwen 博客 | 40 | 官方检索接口含日期和正文；[现行路由登记](https://docs.rsshub.app/routes.json)为 `/qwen/blog/:lang?`，旧 `/qwenlm/blog` 不适用；现行路由主实例 403、替代实例 503 |
| 智谱模型发布 | 17 | 官方更新页含日期和正文；`/rss.xml` 候选 404 |
| Kimi 研究博客 | 9 | 有日期文章列表；RSS 候选返回 HTML，不能作为订阅 |
| MiniMax 博客 | 12 | 有日期文章列表；`/blog/rss.xml` 404，`/rss.xml` 返回 HTML |
| 腾讯混元 | 8 | 公开接口分页成功，含显示日期和正文；仍无已验证在线 RSS |
| Grok/xAI 新闻 | 85 | 官方列表可转换；候选社区 feed 最新文章为 5 月 21 日、生成于 5 月 22 日，遗漏官网 9 月内容，拒绝采用 |
| Qoder 更新 | 15 | 官方更新页含日期和正文；RSS 候选 404 |
| TRAE 中文版更新 | 181 | 官方更新页含日期和正文；不据此声称覆盖国际版或产品全部更新 |
| ZCode 更新 | 8 | 同页版本分开，含日期和正文；仍无已验证在线 RSS |
| Dario 博客 | 6 | 全文可读，但只标月份；RSS 候选 404，不推断具体发表日 |
| OpenAI X | 5 | 匿名列表有限；替代 RSSHub 实例 503 |
| ZCode X (`zcode_ai`) | 5 | 匿名列表有限；准确账号名的替代 RSSHub 路由 503 |
| Elon Musk X | 5 | 匿名列表有限；替代 RSSHub 实例 503；额外复核了既有两条事件的本人原帖 |
| Demis Hassabis X | 5 | 匿名列表有限；替代 RSSHub 实例 503 |
| Jeff Dean X | 5 | 匿名列表有限；替代 RSSHub 实例 503 |
| Tibo X | 5 | 匿名列表有限；主实例 404、替代实例 503 |

第 18 个部分覆盖来源是已恢复在线读取的 Zuckerberg Threads。其有限列表仍可能遗漏帖子；不能仅因最老帖子早于起点而显示完整覆盖。[RSSHub 当前实现](https://github.com/DIYgod/RSSHub/blob/master/lib/routes/threads/index.ts)也只提取公开页面返回的帖子。

## 剩余读取限制与待处理材料

**OpenAI TikTok**：匿名页面返回核实账号资料，但 `itemList` 为空；主 RSSHub 实例返回 403，替代实例返回 503。继续标 `blocked`。下一步需要能实际提供本人视频、日期和文案的订阅服务或可读取会话；没有配置付费服务、提取登录凭据或建立常驻服务。

**YouTube 的 dots 演示**：RSS 只有标题，没有简介、字幕或作者文字稿。保留 1 条 `defer`；不能从标题推断演示能力。原生订阅本轮曾临时返回 404，重试成功，最后状态为 `success`，审阅覆盖仍未完成。

Dario 的《We Must Pace the Frontier》虽只标 September 2026，但 [2026-09-14 美国国会正式记录 S4644（PDF 第 6 页）](https://www.govinfo.gov/content/pkg/CREC-2026-09-14/pdf/CREC-2026-09-14-senate.pdf#page=6)已引用同名文章及相同段落，可证明它在 9 月 30 日补采起点之前已公开。因此按窗口外历史材料处理，保留未知具体日及原始月份标签。这是发布时间上界的证据，未将 9 月 14 日写成首次发布日期。

## 材料与历史更正

处理 30 条待处理/重新打开材料：11 条保留判断、18 条过滤、1 条暂缓。新增 6 个双语事件，保留旧 23 个事件；当前 29 个事件。为同版本 Codex、Claude Code 补充来源，未生成重复事件。

更正 1 条历史事件 `elon-musk-x-2106293251233738928`：原转换误将引用作者关于 Terafab 产能的长文归给马斯克。其本人实际评论用单细胞与人体讨论数量和性质。保留事件 ID、首次采集时间和原文发布时间，双语同步更正，类别从预告改为观点，并记录双语更正原因。另一条 Star Mind 太阳能功率历史帖已复核，本人原文与既有记录一致。

六个 X 来源的原始缓存重放共命中 6 次，无新增网络请求。未变化材料沿用已有判断；没有重新设置补采起点或删除历史进度。

## 校验与公开边界

- `npm test`：35 个 Python 测试与 23 个 Node 测试通过，包括历史分页、重复页/读取失败、跨页未知日期、无效链接、社区订阅过旧/未知生成时间、日期精度、引用正文归属和旧英文说明清除。
- `npm run validate`：29 个双语事件、39 个来源、29 个关注对象通过。
- `npm run build`：静态公开文件构建成功。
- 配置、目录、覆盖、月度历史、索引及 OPML 已同步，快照版本一致。当前 21 个在线订阅进入 OPML；18 个离线来源不导出不可订阅地址。
- 原始 XML、页面、运行记录和处置包仅存 `.collector/`，不进入公开构建。现有 README、部署和计划的其他未提交修改保留。
