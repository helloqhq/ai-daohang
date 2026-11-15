# 2026-11-15 数据更新

本地快照 `1a7cdcce8be7625d`，主查询截止北京时间 2026-11-15 22:32。本记录描述本轮更新内容；发布状态以对应 GitHub Actions 运行和线上快照验收为准。

## 范围与结果

- 维持 41 个对象、59 个信源；本轮没有新增、合并或停用公开对象 / 信源。
- 在线查询沿用各源增量进度与 48 小时重叠，未重置 `.collector/` 起点。三轮查询合计导入 179 条材料（重叠时间窗内重复取回的材料按内容指纹合并），第三轮有 22 条材料直接复用 HTTP 缓存，原文未变时沿用既有判断。
- 最终处置 169 条候选：57 条 keep（对应 47 个新增事件）、112 条过滤、0 条 defer、0 条更正。新闻总数由 432 增至 477，其中 11 月 90 条、10 月 381 条、9 月 6 条。
- 47 个新增事件的中英文标题、摘要、关键点与重要性理由全部成对完整，关键点逐项同序。20 个事件使用到 `partial_text` 材料，2 个事件使用到 `metadata_only` 材料（Gemini 4 Hydrogen / Gemini 4 Carbon 的 Google 与 Antigravity 公告仅有标题和摘要，详细可用范围取自 Copilot 变更日志全文）；正文未覆盖的部分没有被补写或推断。
- 重点包括 Gemini 4 Hydrogen、Gemini 4 Carbon 正式可用、Gemini Robotics 2.5、AlphaProof Code、AlphaGenome 2、Claude Fable 5.2 / Claude Mythos 5.2、Claude Fable 5.2 在 Copilot 可用、LongCat-2.5 以 MIT 协议开源、ChatGPT Wallet、Businesses in ChatGPT、OpenRouter Extractions API。
- 工具链更新覆盖 Claude Code 2.1.321–325（3 条）、OpenCode 2.2.7 / 2.3.0、Copilot CLI 1.0.108–111（4 条）、Hermes 0.23.1、Kimi Code 2.6.0 / 2.6.2、MiMo Code 0.1.17、Pi 1.5.1、DeepSeek Harness 0.2.2-rc.3、Gemini CLI 0.68.0；Kiro 10 条（Grok 4.7、企业策略预览、额度池 IdP、Approve for me、CLI 3.2、CloudTrail 审计、Android 版等）。
- Copilot 平台另有模型下线预告（12 月 14 日下线 6 款）、GitHub Enterprise Server 支持转正、企业席位管理 API、C++ 语言服务器自动配置 MSBuild、Fable 5.2 数据保留条款。
- 过滤集中在 hermes / kimi-code / copilot / kilo 的 canary、rc、预览构建，OpenAI 与 NVIDIA 的客户案例与行业合作，OpenRouter 教程，Kilo 博客随笔与评测方法，以及 Anthropic 订阅回溯中已经建过事件的重复链接。

## 覆盖与维护

- 公共覆盖状态：24 success、19 partial、16 failed。partial 表示已取得部分材料但未证明整段时间窗完整；failed 包含 X / TikTok 等公开列表限制、站点不可达与正文 403，不等同于来源停服。
- `anthropic-official` 本轮恢复读取，带回 10 月 21 日至 11 月 10 日的回溯条目，其中 4 条与既有事件链接相同（S-1、GSA、AI for Science、Agent Skills 捐赠），按重复过滤；新增 Fable 5.2 / Mythos 5.2 发布与 IPO 路演两个事件。该源仍为 partial：社区订阅缺生成时间，无法证明整段时间窗完整。
- `google-official` 在最后一轮查询中再次不可达，未覆盖起点为 2026-11-13 14:19（UTC）；11 月 10 日至 12 日的 Google 公告已在本轮取得并处置，缺口留待下轮按原起点补采。
- `nvidia-ai-blog` 本轮恢复为 success；`meta-official` 由 failed 转为 partial。X、TikTok、Threads、YouTube、`codex-releases`、`mistral-official`、`google-developers-blog`、`b-ai-x`、`worldrouter-x` 仍无法取得可核实正文或返回失败。
- 下表为仍未证明完整覆盖的起点；终点为本轮对应来源最后尝试时间（UTC）。历史缺口不会因当前列表没有新条目而消失。

| 信源 | 状态 | 未覆盖起点 |
| --- | --- | --- |
| anthropic-official | partial | 2026-10-21 17:50 |
| google-official | failed | 2026-11-13 14:19 |
| deepseek-official | partial | 2026-09-30 03:22 |
| qwen-official | partial | 2026-09-30 03:22 |
| zhipu-official | partial | 2026-09-30 03:22 |
| moonshot-official | partial | 2026-09-30 03:22 |
| minimax-official | partial | 2026-09-30 03:22 |
| tencent-official | partial | 2026-09-30 03:22 |
| grok-official | failed | 2026-09-30 03:22 |
| meta-official | partial | 2026-10-23 04:32 |
| qoder-official | partial | 2026-09-30 03:22 |
| trae-official | partial | 2026-09-30 03:22 |
| zcode-official | partial | 2026-09-30 02:54 |
| codex-releases | failed | 2026-11-06 06:08 |
| dario-blog | partial | 2026-09-30 03:22 |
| openai-youtube | failed | 2026-10-04 14:24 |
| openai-x | failed | 2026-09-30 02:54 |
| zcode-x | failed | 2026-09-30 02:54 |
| openai-tiktok | failed | 2026-09-30 02:54 |
| elon-musk-x | failed | 2026-09-30 10:47 |
| mark-zuckerberg-threads | failed | 2026-09-30 10:47 |
| demis-hassabis-x | failed | 2026-09-30 10:47 |
| jeff-dean-x | failed | 2026-09-30 10:47 |
| tibo-x | failed | 2026-09-30 12:28 |
| devin-changelog | partial | 2026-10-03 14:27 |
| cognition-blog | partial | 2026-10-03 14:27 |
| glm-coding-notices | partial | 2026-10-03 14:30 |
| minimax-plan-notices | partial | 2026-10-03 14:30 |
| google-developers-blog | failed | 2026-10-03 14:27 |
| copilot-changelog | partial | 2026-10-23 04:32 |
| siliconflow-updates | partial | 2026-10-08 03:47 |
| siliconflow-news | partial | 2026-10-08 03:47 |
| b-ai-x | failed | 2026-10-08 03:47 |
| worldrouter-x | failed | 2026-10-08 03:47 |
| mistral-official | failed | 2026-10-23 04:32 |

## 计费与验证

- 计费目录本轮未改动，`pricing.json` 仍为此前独立核验结果（133 项，`checked_at` 2026-10-25）；新闻采集不推进价格核验日期，也不据新闻推断套餐变化。Claude Fable 5.2 的 8/40 美元单价、Gemini 4 Carbon / Hydrogen 均未写入计费目录，因为本轮无法读取官方定价页（Anthropic 定价页区域不可用，Google 与 xAI 文档请求超时），避免用新闻稿价格冒充核验结果。
- `npm test`：Python 58 项、Node 59 项全部通过。
- `npm run validate`：477 条事件、59 个信源、41 个对象，校验通过；成对双语字段、关键点数量、来源与对象关联均满足契约。
- `npm run build`、`git diff --check` 通过；`dist/` 仅含公开文件，本地验证结果未暂存。
- 公开新闻 JSON 的快照 ID 一致：`1a7cdcce8be7625d`。`catalog.json`、`coverage.json`、`index.json` 与月份文件整体发布，没有单独拼接或手改某个月份。
- 数据文件：[目录](../public/data/catalog.json)、[覆盖](../public/data/coverage.json)、[索引](../public/data/index.json)、[9 月事件](../public/data/events/2026-09.json)、[10 月事件](../public/data/events/2026-10.json)、[11 月事件](../public/data/events/2026-11.json)、[计费](../public/data/pricing.json)。
- `.collector/` 内的缓存、队列与判断记录未进入公开目录；没有读取或修改受排除的视频制作产物。
