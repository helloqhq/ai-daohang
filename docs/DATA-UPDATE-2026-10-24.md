# 2026-10-24 信源与数据更新

本地快照 `0f38798af8895654`，生成于北京时间 2026-10-24 02:00。本记录描述本轮更新内容；发布状态以对应 GitHub Actions 运行和线上快照验收为准。

## 范围与结果

- 维持 41 个对象、8 位人物、59 个信源；33 个信源配置 RSS。本轮没有新增、合并或停用公开对象 / 信源。
- 在线查询沿用各源增量进度和 48 小时重叠，主查询截止北京时间 2026-10-24 01:50；正常来源主要回读 10 月 19 日以来的重叠窗口。既有断档按各源原起点继续尝试，未重置 `.collector/`。
- 对离线转换来源运行官方页面到私有 RSS 的独立转换，再导入材料队列；Kimi 与 Kiro 另作定点修复。
- 最终处置 108 条当前候选：47 条 keep（40 条新增事件、7 条沿用已发布事件）、49 条过滤、12 条 defer；更正已有事件 0 条。新闻总数由 299 增至 339。
- 新增事件的中英文标题、摘要、关键点与重要性理由全部成对完整；关键点逐项同序。仅日期的公告保留日精度，Atom 更新时间保留 updated 语义。
- 重点包括 Kimi K3.1 Pro、Codex 0.164.0、MiniMax Code Mini Apps、Agent Skills 捐赠 AAIF、Kiro 模型正式可用、Copilot / Pi / Qoder 等 Agent 更新。K3.1 Pro 托管服务已可用，完整权重仅计划在 11 月 4 日前发布。
- 在线请求报告 168 条材料和 5 次 HTTP 缓存命中；首次整轮独立转换 21 源成功产出、9 源受限，99 次请求、0 次离线缓存重放。已缓存且指纹与规则未变的判断继续复用；没有可靠的 token 用量计量。

## 信源维护

- **Kimi**：修复新版 `blog-v2-page-container` 正文提取，给此来源显式登记 `Asia/Shanghai` 日期边界。北京时间已进入 10 月 24 日而 UTC 仍为 23 日时，不能漏掉已显示的日精度公告，也不能给公告虚构具体时分。实际取得 K3.1 Pro 正文后经 RSS 入队。
- **Kiro**：原生 RSS 的 CLI 2.33.0 / 2.33.1 正文为摘要或模板注释；用同一官方页面可见正文补充私有 RSS，仍标 `partial_text`，没有宣称读完折叠细节。IDE 1.4.26 的指针条目与对应正文去重。
- **硅基流动资讯**：在线尝试超时后独立转换成功，取得 11 个带日期卡片和查询窗内正文。移除“尚未执行正式采集”的旧说明；置顶 / 首屏列表仍不代表完整历史。
- **发现候选**：复核 TypeSafe Jev 1.14 公告、Pi 分类模型集成和 OpenCode 接入，但官网无 RSS 发现链接，`/rss.xml`、`/blog/rss.xml` 为 404；尚无验证过的新格式转换器，保留内部候选。Flint 40B 已确认为 OpenCode 免费端点，独立发布者与 NVIDIA 文中 Recursive Flint 的对应关系仍待核实，不推断与 LL Alpha 的身份继承。LL Alpha、Beam、Exo 等旧候选继续保留证据缺口。

## 计费、免费与折扣

- 读取 82 个去重后的官方价格 / 权益 / 优惠 URL；49 个来源与上轮取回文本完全相同，沿用已有事实判断而非猜测新套餐。另用浏览器读取 Kiro 模型表，解决空服务端正文。
- 完整候选目录校验后替换，再生成 `pricing.xml`。共 133 项：API 61、Agent 52、Token Plan 19、聊天 1；122 项 verified、8 项 pending、3 项 paused。
- 100 个已有方案价格完成复核，新增两个端点后共有 102 项价格日期为本轮；31 项保留原价格核验日期。24 个已有方案发生内容变化，另新增 2 个方案。仅复核日期不制造新的 RSS GUID。

| 新增 Kimi API | 输入 | 输出 | 缓存读取 | 缓存写入 |
| --- | ---: | ---: | ---: | ---: |
| K3.1 Pro | $2 | $10 | $0.20 | $2 |
| K3.1 Pro Highspeed | $4 | $20 | $0.20 | $4 |

以上均为每百万 tokens，来源为 [Kimi API 官方目录](https://platform.kimi.ai/)，1M 上下文；不与订阅用量换算。

- **Kimi Code**：新 Plus / 旧 Moderato 起支持 K3.1 Pro 256K；新 Pro / 旧 Allegretto 起支持 1M 和 Highspeed。K3.1 Pro 仅思考模式，默认 max；Highspeed 约 2–3 倍输出速度、约 2 倍额度消耗。保留新旧套餐的月 / 周 / 五小时窗口差异。
- **OpenCode**：免费表移除 MiniMax M3.1 Flash Free，以 Flint 40B Free 替代 LL Alpha Free，现共 13 个免费端点；保留地域、训练用途与 30 天留存等差异。Go / Go Plus 的 M3.1 Flash 转为 $0.15 输入、$0.60 输出、$0.015 缓存读取 / 百万 tokens，月美元用量上限分别 $20 / $80；五小时 20%、每周 50%。Kilo 的独立免费活动仍有官方依据，不随 OpenCode 渠道变化撤销。
- **Kiro**：Sonnet 5.5、Terra / Luna 正式可用，Fable 5.1 仅企业 us-east-1；Sol 仍实验。补齐 GPT-5.6 Global 推理范围：US 端点不保证请求仅在美国处理，存储地域与推理路由分别约束。
- **Antigravity**：Argon 对 Pro 的资格为付费订阅或符合条件的高端设备试用，不能将所有 Pro 试用都列为可用。
- **MiniMax**：套餐权益改为正式 M3.1 Flash，并注明旧 Preview 名称请求转到正式型号；没有刷新待核验旧 Token Plan 的价格日期。
- **B.AI**：核实 Qwen3.8-Flash 自 10 月 22 日 17:00 起按标准价 80% 结算的既有记录；旧 30% 活动按已记录边界到期。没有将活动折扣覆盖标准参考价。
- **WorldRouter**：Gemini 3.1 Pro Preview、MiMo V2.5 原官方详情页返回 404，状态改 pending，数值及价格核验日期保留；未将读取失败等同停服。
- **未完成核验**：GLM 三档、MiniMax 旧 Token Plan 三档完整结算价继续 pending；Kilo Pass 数值、旧 Kimi 档价格、部分旧 Gemini / MiniMax / Kimi API 行、403 的 Pro 档文档、406 的 Copilot 价格页及客户端壳页面保留原日期。Gemini CLI 三个旧个人入口维持 paused。MiniMax 首月五折的期限缺年份，Mistral 官方半价及 B.AI MiMo 旧优惠仍 pending，不据其他渠道推断。

## 未处理材料与覆盖缺口

- 12 条待处理材料：8 条 YouTube 只有标题而缺少说明 / 字幕，3 条 Musk 帖子缺可确认的 AI 对象或链接正文，1 条 MiniMax Token Plan 通知缺原始发布日期。没有用抓取时间、版本顺序或模型推测补齐。
- 最终来源状态：29 success、21 partial、9 blocked。partial 代表已取得部分材料而未证明整段时间窗完整；blocked 为 X / TikTok 公开列表限制。离线导入没有推进完整在线覆盖。
- 下表为仍未证明完整覆盖的起点；终点为本轮对应来源最后尝试时间（北京时间）。历史缺口不会因当前列表没有新条目而消失。

| 信源 | 状态 | 未覆盖起点 | 本轮最后尝试 |
| --- | --- | --- | --- |
| deepseek-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| qwen-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| zhipu-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| moonshot-official | partial | 2026-09-30 11:22 | 2026-10-24 01:56 |
| minimax-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| tencent-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| grok-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| meta-official | partial | 2026-10-15 21:38 | 2026-10-24 01:50 |
| qoder-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| trae-official | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| zcode-official | partial | 2026-09-30 10:54 | 2026-10-24 01:53 |
| dario-blog | partial | 2026-09-30 11:22 | 2026-10-24 01:53 |
| openai-youtube | partial | 2026-10-04 22:24 | 2026-10-24 01:50 |
| openai-x | blocked | 2026-09-30 10:54 | 2026-10-24 01:51 |
| zcode-x | blocked | 2026-09-30 10:54 | 2026-10-24 01:51 |
| openai-tiktok | blocked | 2026-09-30 10:54 | 2026-10-24 01:51 |
| elon-musk-x | blocked | 2026-09-30 18:47 | 2026-10-24 01:51 |
| mark-zuckerberg-threads | partial | 2026-09-30 18:47 | 2026-10-24 01:50 |
| demis-hassabis-x | blocked | 2026-09-30 18:47 | 2026-10-24 01:51 |
| jeff-dean-x | blocked | 2026-09-30 18:47 | 2026-10-24 01:51 |
| tibo-x | blocked | 2026-09-30 20:28 | 2026-10-24 01:51 |
| devin-changelog | partial | 2026-10-03 22:27 | 2026-10-24 01:53 |
| cognition-blog | partial | 2026-10-03 22:27 | 2026-10-24 01:53 |
| glm-coding-notices | partial | 2026-10-03 22:30 | 2026-10-24 01:53 |
| minimax-plan-notices | partial | 2026-10-03 22:30 | 2026-10-24 01:53 |
| google-developers-blog | partial | 2026-10-03 22:27 | 2026-10-24 01:50 |
| siliconflow-updates | partial | 2026-10-08 11:47 | 2026-10-24 01:53 |
| siliconflow-news | partial | 2026-10-08 11:47 | 2026-10-24 01:53 |
| b-ai-x | blocked | 2026-10-08 11:47 | 2026-10-24 01:53 |
| worldrouter-x | blocked | 2026-10-08 11:47 | 2026-10-24 01:53 |

## 修复与验证

- 调整计费校验：内容更新时间可以晚于独立的价格核验日期，但不得晚于快照日期；价格过期仍按旧日期判断。避免为更新模型权益而伪造新价格核验。
- 新增回归覆盖 Kimi UTC 午夜前的日精度公告、新版正文容器、未来日期排除，以及权益更新保留旧价格核验 / 过期状态。
- `npm test`：Python 56 项、Node 59 项全部通过。
- `python3 scripts/collect.py validate`、`npm run pricing:build`、`npm run build`、`git diff --check` 均通过；计费对象与新闻渠道映射缺口为 0。
- 公开新闻 JSON 的快照 ID 一致：`0f38798af8895654`。`pricing.json` 为独立核验目录；没有单独拼接月份文件。
- 数据文件：[目录](../public/data/catalog.json)、[覆盖](../public/data/coverage.json)、[索引](../public/data/index.json)、[10 月事件](../public/data/events/2026-10.json)、[计费](../public/data/pricing.json)、[计费 RSS](../public/data/pricing.xml)。
- `.collector/` 缓存与内部判断未进入公开目录；`dist/` 为本地验证产物，未暂存、提交或推送。没有读取或修改受排除的视频制作产物。
