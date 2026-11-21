# 2026-11-21 信源与数据更新

本地快照 `650aa154cee1b245`，生成于北京时间 2026-11-21 03:17。本记录描述本轮更新内容；发布状态以对应 GitHub Actions 运行和线上快照验收为准。

## 范围与结果

- 维持既有对象与信源清单，本轮没有新增、合并或停用公开对象 / 信源；沿用 11-19 轮修复的 X DOM 兜底转换器与 ego lite 兜底流程。
- 在线查询沿用各源增量进度和重叠窗口，最终快照生成于北京时间 2026-11-21 03:17；未重置 `.collector/`。
- 最终处置 71 条当前候选：18 条 keep（全部为新增事件）、53 条过滤、0 条更正、0 条 defer；队列余 0。新闻总数由 552 增至 570。
- 新增事件的中英文标题、摘要、关键点与重要性理由全部成对完整；重点包括 GPT-6.2 Astra / Sol 发布后的接入潮（Copilot CLI、Codex CLI 0.171.0、Pi 1.6.0）、Kiro IDE 1.5 与 VS Code 扩展、Kiro Crew 0.13.0、Claude Code 2.1.329、Hermes Agent 0.23.2 / 0.23.3、Anthropic IPO 收官及 NVIDIA RTX Spark 上市。
- 计费核验与新闻处置分开进行：本轮独立复核约 40 个去重官方价格 / 权益 / 优惠页面，`pricing.json` 顶层核验日期更新为 2026-11-21。
- `python3 scripts/collect.py validate` 通过；公开新闻 JSON 的快照 ID 一致。没有可靠 token 用量计量。

## 计费、免费与折扣

- 读取约 40 个去重后的官方价格 / 权益 / 优惠页面：可直连的用 curl 取原始文本，JS 渲染或 DNS 污染页面用 ego lite 浏览器（devin.ai、cline.bot、docs.b.ai、antigravity.google、cursor.com、GitHub Copilot、kilo.ai、kiro.dev、platform.kimi.ai 会员页、MiniMax Token Plan、WorldRouter 等）。help.openai.com 返回 Cloudflare 挑战页，未取得有效内容。claude.com 与 docs.claude.com 按地区封锁（"App unavailable in region"），Anthropic 全部条目本轮无法核验。
- 完整候选目录校验后替换，再生成 `pricing.xml`。共 143 项：API 71、Agent 52、Token Plan 19、聊天 1；132 项 verified、8 项 pending、3 项 paused。
- 77 项已有方案核验日期刷新为本轮：Mistral Large 4 与 Devin Teams 价格变化、GLM 三档与 MiniMax 旧 Token Plan 三档 pending 复核、其余 69 项价格重读未变；连同 7 个新增方案共 84 项日期为 2026-11-21，另 59 项保留原价格核验日期。仅复核日期不制造新的 RSS GUID。

| 新增方案 | 输入 | 输出 | 缓存读取 | 说明 |
| --- | ---: | ---: | ---: | --- |
| GPT-6.2 Astra | $8 | $40 | $0.40 | 长上下文 $16 / $60 / $0.80；Ultrafast 为 Standard 3 倍 |
| GPT-6.2 Sol | $2 | $10 | $0.10 | 长上下文 $4 / $15 / $0.20；Ultrafast 为 Standard 3 倍 |
| GPT-6.1 Terra | $1 | $5 | $0.05 | 长上下文 $2 / $7.50 / $0.10 |
| Gemini 4 Carbon | $2 | $10 | $0.10 | 2026-12-01 起 $4 / $20 / $0.20；无免费层 |
| Gemini 4 Neon | $3 | $15 | $0.15 | 1M 上下文；无免费层，未公布调价时间 |
| Gemini 4 Hydrogen | $1.50 | $7.50 | $0.075 | 提供免费层 |
| Gemini 3.6 Flash | $0.75 | $3.75 | $0.075 | 活动价至 2026-12-31，2027-01-01 起 $1.50 / $7.50 / $0.15 |

以上均为每百万 tokens，来源为 [OpenAI API 定价页](https://developers.openai.com/api/docs/pricing)与 [Gemini API 定价页](https://ai.google.dev/gemini-api/docs/pricing)；输出含思考 tokens，缓存写入等条件写在方案说明中。

- **Mistral Large 4**：官方页确认 2026-11-05 转 GA，名称去掉 Preview；GA 标准价 $0.7 / $2.1 / $0.07 为此前 Preview 标准价（$1.36 / $4.18 / $0.14）的一半。Preview 五折优惠作为独立促销不再适用，保留 paused 与历史记录。OpenCode 渠道同型号价格未重读，保留原日期。
- **Devin / Windsurf Teams**：官方页改为固定 $80/月自助套餐（至多 100 名成员、共享按需 credits），此前“$80 基础费 + $40/完整开发席位、$120/月起价”的口径不再展示；条目改为 $80/月。
- **Antigravity 免费档**：Claude Sonnet / Opus 4.6 与 GPT-OSS 120B 的移除日期由 2026-11-02 官方顺延至 2026-11-30；页面已转 GA。付费四档价格在当前页面未渲染，保留 10-24 核验日期。
- **MiniMax**：M3 / M3.1 Flash 价格复核未变；M2.7 已从官方 API 价格页移除，沿用弃用先例保留历史价格与原核验日期、不判定停服。旧 Token Plan 三档复核：仍停止新购、存量可按原价自动续订，结算价继续待核验。M Plan 三档（11-17）本轮未取得价格页依据，保留原日期。
- **Kimi**：K3 / K3.1 Pro / Highspeed 与会员五档（Go / Plus / Pro / Max / Ultra）价格复核未变；K2.7 Code 价格不变，但官方文档预告 K2 系列自 2026-10-31 起不对新注册用户开放，并计划 2026 年 12 月底前全部退役。旧 Andante 系列四档未重列价格，保留原日期。
- **GLM Coding Plan**：三档复核，概述页与 API 价格页均称“每月 18 美元起”；官方 2026-04-21 迁移公告列参考月价 Lite $18 / Pro $72 / Max $160（注明仅供参考）。按站点约定结算价以登录后的订阅页为准，三档保持 pending；credits、模型路由与非高峰半价复核未变。
- **B.AI**：六个在售优惠（Hy4 / Hy4 Flash 五折、DeepSeek-V4.1-Flash 五折时段价、GLM-5.3-Flash 六折、Qwen3.8-Flash 八折、Qwen4-Max 九折）重读仍在进行，核验日期刷新为本轮；已结束的 Qwen3.8-Flash 三折活动保留历史边界。其余 B.AI 条目本轮未取得标准价页依据，保留原日期。
- **WorldRouter**：七个 verified 条目的 Credits 价格在官方模型列表页重读未变；Gemini 3.1 Pro Preview 与 MiMo V2.5 两条 pending 仍不在列表中，保留 404 历史与原核验日期。模型列表新增 GPT-6.2 Astra 与 Gemini 4 Carbon 路由，尚未建条目。
- **Kilo**：平台免费、Teams $15、Pass 三档价格复核未变；MiniMax M3.1 Flash 限时免费在当前计费页已不再提及，优惠转 pending 待核验，10 月公告依据保留。
- **未完成核验**：Anthropic API 五项与 Claude Code 两项因地区封锁保留 10-24 日期；DeepSeek 两项、Qwen、硅基流动八项、OpenCode 四项、B.AI 其余条目未重读；codex Plus / Free / Go 因 help 页 Cloudflare 挑战未核到；GLM 三档与 MiniMax 旧 Token Plan 三档结算价继续 pending；Gemini CLI 三入口维持 paused；gemini-3-7-flash / 3-5-flash 沿用弃用先例不刷新。

## 未处理材料与覆盖缺口

- 队列余 0；无 defer。openai-official 的 Daybreak Blue、Codex Security Plugin 与 openai-youtube 的 ChatGPT Data Agent 等公告仅有 partial_text / metadata_only 材料，缺正文与可核实日期，未据此创建事件，保留覆盖缺口。
- 最终来源状态：28 success、30 partial、2 failed。partial 代表已取得部分材料而未证明整段时间窗完整；mistral-official 直连仍受本机 DNS 污染影响（材料经 ego lite 兜底取得），openai-tiktok 为登录墙。
- 下表为仍未证明完整覆盖的起点；终点为本轮快照生成时间（北京时间）。历史缺口不会因当前列表没有新条目而消失。

| 信源 | 状态 | 未覆盖起点 |
| --- | --- | --- |
| mistral-official | failed | 2026-10-23 12:32 |
| openai-tiktok | failed | 2026-09-30 10:54 |
| b-ai-x | partial | 2026-10-08 11:47 |
| cognition-blog | partial | 2026-10-03 22:27 |
| copilot-changelog | partial | 2026-10-23 12:32 |
| dario-blog | partial | 2026-09-30 11:22 |
| deepseek-official | partial | 2026-09-30 11:22 |
| demis-hassabis-x | partial | 2026-09-30 18:47 |
| devin-changelog | partial | 2026-10-03 22:27 |
| elon-musk-x | partial | 2026-09-30 18:47 |
| glm-coding-notices | partial | 2026-10-03 22:30 |
| google-developers-blog | partial | 2026-10-03 22:27 |
| grok-official | partial | 2026-09-30 11:22 |
| jeff-dean-x | partial | 2026-09-30 18:47 |
| mark-zuckerberg-threads | partial | 2026-09-30 18:47 |
| meta-official | partial | 2026-10-23 12:32 |
| minimax-official | partial | 2026-09-30 11:22 |
| minimax-plan-notices | partial | 2026-10-03 22:30 |
| moonshot-official | partial | 2026-09-30 11:22 |
| openai-x | partial | 2026-09-30 10:54 |
| openai-youtube | partial | 2026-10-04 22:24 |
| qoder-official | partial | 2026-09-30 11:22 |
| qwen-official | partial | 2026-09-30 11:22 |
| siliconflow-news | partial | 2026-10-08 11:47 |
| siliconflow-updates | partial | 2026-10-08 11:47 |
| tencent-official | partial | 2026-09-30 11:22 |
| tibo-x | partial | 2026-09-30 20:28 |
| trae-official | partial | 2026-09-30 11:22 |
| worldrouter-x | partial | 2026-10-08 11:47 |
| zcode-official | partial | 2026-09-30 10:54 |
| zcode-x | partial | 2026-09-30 10:54 |
| zhipu-official | partial | 2026-09-30 11:22 |

## 修复与验证

- 随数据语义变化更新两处测试预期：Devin Teams 固定价 $80；Kilo 的 MiniMax 免费优惠转 pending 后默认免费面板排除、勾选“包含不可用”可见。
- `npm test`：Python 60 项、Node 59 项全部通过；`npm run pricing:build` 校验 143 项并重新生成 RSS。
- `python3 scripts/collect.py validate`、`npm run build`、`git diff --check` 均通过；计费对象与新闻渠道映射缺口为 0。
- 数据文件：[目录](../public/data/catalog.json)、[覆盖](../public/data/coverage.json)、[索引](../public/data/index.json)、[11 月事件](../public/data/events/2026-11.json)、[计费](../public/data/pricing.json)、[计费 RSS](../public/data/pricing.xml)。
- `.collector/` 缓存与内部判断未进入公开目录；`dist/` 为本地验证产物，未暂存、提交或推送。没有读取或修改受排除的视频制作产物。
