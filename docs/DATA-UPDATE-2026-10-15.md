# 2026-10-15 动态与计费方案更新

本轮按项目 RSS / Atom、独立离线转换、人工计费核验流程更新本地快照。动态由 169 条增至 202 条，计费方案由 114 项增至 116 项；仍为 56 个来源、39 个关注对象。原有 169 条事件的内容、稳定 ID 和首次采集时间全部保留，没有实质更正。工作区原有文档改动未覆盖，约定中的视频产物未读取或修改。尚未提交、推送或部署。

## 动态

沿用各来源增量、48 小时重叠及失败回补进度，没有重置采集状态或指定新的全站起点。总体查询范围为北京时间 2026-09-30 10:54 至 2026-10-15 10:09:05；首轮在线终点为 10-15 09:59:23，转换查询终点为 09:59:30。不同来源有各自的起点，整体最早起点来自长期未覆盖来源，不代表所有渠道都重新回溯到该日。

最终审阅 102 条候选：35 条材料归并为 33 条新增双语事件，51 条过滤，16 条待核查。重试在线 RSS 会用简介覆盖本地同 ID 材料，随后重新导入本轮已校验的转换清单，恢复全文、原日期与指纹并复用对应判断；最终队列没有新增未处置材料。原始材料、转换 RSS 和处置包均留在忽略的 `.collector/`。

主要新增：

- Gemini 4 Argon 正式发布、API 介绍价与开放范围；同次安全说明归并到发布事件，机器人闭环控制演示单列并归并两个来源。厂商能力及评测表述保持归属。
- Grok Voice 3.0 正式提供 Voice Agent API，维持每分钟 $0.08，`grok-voice-latest` 自动切换。此语音按分钟计费未塞入每百万 tokens 的模型价格表。
- Hermes 0.22 的本地模型、应用连接器、稳定更新渠道、签名桌面包与会话清理条件，以及 0.22.1 的 MCP、技能压缩和恢复修复。两者采用发布说明明确标出的 10-13、10-14 日期，不把 Atom 更新时间当作首次发布日。
- Kimi Code 2.2.0、DeepSeek Harness 0.2.1-alpha.3、Qoder 0.4.7、Cline 4.1.24 / Desktop 0.0.46、Gemini CLI 0.64 稳定版 / 0.65 预览，以及 Kilo 7.8.10 / JetBrains rc.4 的功能和关键修复。明确的预发布按 `preview` 记录。
- Copilot HydraFusion Max 研究预览、Gemini 4 Argon 接入、CLI 的多个独立版本及企业策略刷新与最低客户端要求；Cursor Origin 应用市场与 Kilo 平台 MCP。
- Google / 新加坡端侧诈骗检测模型的分阶段部署、Claude 预告的官方投票信息接入，以及 Apigee hybrid 的集群内 MCP 支持。Apigee 文章日期与其中提及的旧版本发布日期分开表述。
- Tibo 关于桌面状态存储预计减少 60% 的一手通报、Demis 的 Argon 使用反馈及马斯克的 Grok Bot 文档审阅评价。负责人观点不改写为独立验证结论。

过滤构建元信息、无说明的安装包、重复材料、普通案例、活动宣传和界面小调整。16 条待核查包括：6 条只有标题的视频、3 条正文只有模板注释的 Kiro 更新、Claude Code 2.1.281 的既有首次日期冲突、2 条马斯克纯短链接、Tibo 缺引用对象短帖、Demis 缺研究对象的临床短帖，以及缺发布日期的 GLM 活动和 MiniMax 迁移通知。缺失证据未用抓取时间、活动时间或标题扩写替代。

## 覆盖与缓存

首轮 30 个在线订阅中 28 个读取成功，Google DeepMind 与 Threads 失败；首轮 HTTP 304 缓存命中 7 次。定向重试恢复 Google DeepMind，另复用 Meta 缓存 1 次，Threads 仍失败。转换执行 74 次请求，转换缓存命中 0 次；30 个转换目标中 29 个生成有效 RSS，TikTok 匿名页仍无帖子列表。

最终状态为 26 个 `success`、28 个 `partial`、1 个 `blocked`、1 个 `failed`。Google DeepMind 完整在线获取与审阅进度推进到北京时间 10-15 10:09:05；离线导入没有推进其他来源的在线完整覆盖。TikTok 未覆盖起点仍为北京时间 09-30 10:54，Threads 仍为 09-30 18:47；部分来源的逐项起点与进度保存在 `public/data/coverage.json`。有限社交列表和社区订阅不等于完整覆盖，不据零条新增宣称没有更新。

正文、规则与解析版本未变的既有判断继续复用；本轮重新导入已缓存的转换 RSS 不增加网络请求。所有入选事件的标题、摘要、关键点与入选理由双语完整，关键点数量一致。环境没有可靠 token 计量，不报告实际用量。

## 计费方案

复核原有 114 项，新增 Google 与 B.AI 的 Gemini 4 Argon 两项，共 116 项：API 51、Token Plan 18、Agent 47；107 项 `verified`、6 项 `pending`、3 项 `paused`。原有 27 项内容或来源发生变化，87 项内容不变。原有 108 项更新价格核验日期，6 项保留原日期；只有实际内容变化更新 `updated_at`。模型权益核验日期独立维护。

- **Google Gemini 4 Argon**：Standard 介绍价为输入 $2、输出 $10、缓存输入 $0.10 / 百万 tokens，至 2026-11-30；12-01 起为 $4 / $20 / $0.20。仅隐式缓存；Batch / Flex 半价，Priority 为 1.8 倍。Contributor 是受邀私密预览、允许产品改进数据使用，与普通付费层分开说明。[Google 官方 API 价格](https://ai.google.dev/gemini-api/docs/pricing)
- **B.AI Gemini 4 Argon**：标准参考价输入 $2、输出 $10、缓存读取 $0.10、缓存写入 $2 / 百万 tokens；搜索 $0.014 / 次。保留平台 Credits 结算规则，不套用 Google 直连活动期限。[B.AI 官方价格](https://docs.b.ai/llmservice/pricing-and-usage/)
- **Cursor 新套餐**：确认 Plus 包含 Grok 4.7 / 4.6 / 4.5 与 Composer 2.5，固定 medium effort、关闭 Fast，Grok 4.7 为 256K；不含 Auto、第三方模型及 BYOK。Premium 以上补齐 Composer 和 Argon 连接能力、第三方从首个请求起扣预付 credits；Teams 第三方请求增加 $0.25 / 百万 tokens，Cost 模式及自有模型豁免。付费档的 Grok API 用量单独计费、不扣共享周池。个人 Plus / Premium / Super / Ultra 年付总额分别 $80 / $300 / $1,000 / $2,000，表格月费仍用月付价。[套餐价格](https://cursor.com/pricing)、[模型与计费条件](https://cursor.com/docs/models-and-pricing)
- **旧 Cursor**：五个旧订阅稳定 ID、原价和两个按月用量池权益保留，价格来源改为新的官方 legacy 专页；当前模型目录补入 Argon。双池按月刷新，迁移为自愿且永久；没有把旧、新同名档位合并。[官方旧订阅说明](https://cursor.com/docs/account/pricing/legacy-cursor-plans)
- **Copilot / Devin**：Copilot Pro+ / Max 增加 Argon 的正式接入、逐步开放和组织策略条件；Devin 付费档补齐 Argon 自助介绍价及截至 10-27 的额外折扣，企业 ACU 与旧 credits 分开说明。Devin 原有 SWE-2 两个页面相差一天的截止日期说明保留。[Copilot 公告](https://github.blog/changelog/2026-10-13-gemini-4-argon-in-github-copilot)、[Devin 模型说明](https://docs.devin.ai/desktop/models)
- **OpenCode**：Go 两档加入 Gemini 4 Argon Contributor 和 Cat Jam Free，移除当前目录不再列出的 DeepSeek V4 Flash / Vision Exp。Argon Contributor 限时双倍月美元上限为 $60 / $240，常规 $30 / $120，并明确可用于训练；Cat Jam Free 的限时、30 天安全留存与地域限制保留。免费客户端项补充 Zen Argon 的限时费率与推理另计费条件。[Go 文档](https://opencode.ai/docs/go/)、[Zen 文档](https://opencode.ai/docs/zen/)
- **Codex Pro / MiniMax M Plan**：重新确认 Pro 三档价格和旧 $200 资格窗口，补入同账号重订条件及 Fast 消耗为 Standard 2.5 倍；Ultrafast 的 8 倍订阅消耗和 6 倍 credits 费率保留。MiniMax 显示标准月费，首月优惠原文仅写至“10 月 14 日”且无年份，本次不作为当前优惠承诺。[Pro 帮助](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)、[M Plan 公告](https://platform.minimax.io/docs/m-plan/monthly-offer)

67 个既有核验 URL 中 65 个直接取得页面；OpenAI API 与 Pro 帮助入口的直接请求返回 403，随后通过网页读取工具取得同一官方页面，核实价格、长上下文、Ultrafast 和资格细节。Cursor legacy 新入口另行读取。Kiro 和 MiniMax 页面出现空主容器时检查同次 HTML 的完整树；Kiro 模型表未变，MiniMax 模型权益以可读取的 intro / FAQ 为据，没有把空主容器当作完整核验。

保留旧价格核验日期的 6 项为：当前 Google 价格页仍缺少的 Gemini 3.7 Flash / 3.5 Flash，以及当前 Kimi 价格表不再列出旧数值的 Andante / Moderato / Allegretto / Allegro。不因缺项推断停服。GLM 三档和旧 MiniMax Token Plan 三档仍为 `null` / `pending`；Gemini CLI 三个个人入口仍为 `paused`。计费 RSS 保留 87 个未变 GUID，27 项修改和 2 项新增产生 29 个新 GUID；仅日期变化不生成新条目。

## 校验与文件

`python3 scripts/collect.py validate`、`npm run pricing:build`、`npm test`、`npm run build` 均通过，52 项 Python 与 35 项 Node 测试通过。构建预渲染 202 条动态与 116 项方案。最终新闻快照 ID 为 `58f890ccea8e8a0f`。

公开更新为 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json`、`pricing.xml`。9 月文件仅同步快照 ID。配置和采集器代码未修改，未增设来源或自动任务。完整覆盖限制与待核查原因保留在公开覆盖快照和内部处置记录。
