# 2026-11-08 信源与数据更新

本地快照 `2eec17bb7737e8d8`，生成于北京时间 2026-11-08 14:50。本记录描述本轮更新内容；发布状态以对应 GitHub Actions 运行和线上快照验收为准。

## 范围与结果

- 维持 41 个对象、59 个信源；30 个原生 RSS、26 个离线转换、2 个社区来源、1 个 RSSHub。本轮没有新增、合并或停用公开对象 / 信源。
- 在线查询沿用各源增量进度与 48 小时重叠，主查询截止北京时间 2026-11-08 14:08；两轮查询共记录 310 条材料与 53 次 HTTP 缓存命中，导入后候选队列 318 条。既有断档按各源原起点继续尝试，未重置 `.collector/`。
- 离线转换 17 个来源成功，14 个受公开页限制失败；产出物经 `import-converted` 进入同一材料队列。X、TikTok、Threads 与 YouTube 仍无法取得可核实正文或字幕。
- 最终处置 318 条候选：84 条 keep（全部为新增事件）、228 条过滤、6 条 defer；更正已有事件 0 条。新闻总数由 348 增至 432，其中 11 月 45 条、10 月新增 39 条（当月共 381 条）、9 月维持 6 条。
- 84 条事件的中英文标题、摘要、关键点与重要性理由全部成对完整，关键点逐项同序。24 条事件使用了 `partial_text` 材料、4 条使用 `metadata_only` 材料，正文未覆盖的部分没有被补写或推断。
- 重点包括 GPT-6.1 Terra、GPT-6 Cyber、Images 2.6、Gemini 4 Carbon、Gemini Omni 1.2 Flash、Genie 4、LongCat-2.5、Hyra 2.0；Kimi Code 2.5.x、Codex 0.165–0.167、Claude Code 2.1.311–319 的 7 个版本、OpenCode 2.2.x、Kiro 11 项更新、Copilot CLI 与 Copilot 平台更新；Anthropic S-1、AI for Science 与 GSA 合作，OpenAI 收购 Pierre、Oracle / ServiceNow 合作与 GovCloud 上线；Kilo 供应链攻击复盘及修复版本。
- 过滤集中在预发布 / nightly / canary 构建、营销与客户案例、政策评论、教程、重复条目以及已被后续补丁取代的版本；同一事件的后续版本不重复建条。

## 覆盖与维护

- 公共覆盖状态：24 success、17 partial、18 failed。partial 表示已取得部分材料但未证明整段时间窗完整；failed 包含 X / TikTok 等公开列表限制、站点不可达与正文 403，不等同于来源停服。
- 6 条待处理材料全部来自 OpenAI YouTube，只有标题而缺少可核实说明或字幕，按 defer 保留，等待补充文字材料；没有用抓取时间或视频标题推测内容。
- 本轮修复采集器在响应体不完整时抛出未捕获 `http.client.HTTPException` 的问题，将其归入来源读取失败并记录缺口，避免单个连接中断终止整轮查询。
- `anthropic-official`、`grok-official`、`meta-official`、`google-developers-blog`、`nvidia-ai-blog`、`mistral-official` 本轮不可达或仅取得部分材料；OpenAI 文章页偶发 403。相关来源保留 `uncovered_from`，下轮继续按原起点补采。
- 下表为仍未证明完整覆盖的起点；终点为本轮对应来源最后尝试时间（UTC）。历史缺口不会因当前列表没有新条目而消失。

| 信源 | 状态 | 未覆盖起点 |
| --- | --- | --- |
| anthropic-official | failed | 2026-10-21 17:50 |
| deepseek-official | partial | 2026-09-30 03:22 |
| qwen-official | partial | 2026-09-30 03:22 |
| zhipu-official | partial | 2026-09-30 03:22 |
| moonshot-official | partial | 2026-09-30 03:22 |
| minimax-official | partial | 2026-09-30 03:22 |
| tencent-official | partial | 2026-09-30 03:22 |
| grok-official | failed | 2026-09-30 03:22 |
| meta-official | failed | 2026-10-23 04:32 |
| qoder-official | partial | 2026-09-30 03:22 |
| trae-official | partial | 2026-09-30 03:22 |
| zcode-official | partial | 2026-09-30 02:54 |
| dario-blog | partial | 2026-09-30 03:22 |
| openai-youtube | failed | 2026-10-04 14:24 |
| openai-x | failed | 2026-09-30 02:54 |
| zcode-x | failed | 2026-09-30 02:54 |
| openai-tiktok | failed | 2026-09-30 02:54 |
| elon-musk-x | failed | 2026-09-30 10:47 |
| mark-zuckerberg-threads | failed | 2026-09-30 10:47 |
| demis-hassabis-x | failed | 2026-09-30 10:47 |
| jeff-dean-x | failed | 2026-09-30 10:47 |
| jensen-huang-blog | failed | 2026-10-23 04:32 |
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
| nvidia-ai-blog | failed | 2026-10-23 04:32 |

## 计费与验证

- 计费目录本轮未改动，`pricing.json` 仍为此前独立核验结果（133 项，`checked_at` 2026-10-25）；新闻采集不推进价格核验日期，也不据新闻推断套餐变化。
- `npm test`：Python 58 项、Node 59 项全部通过。
- `npm run validate`：432 条事件、59 个信源、41 个对象，校验通过；成对双语字段、关键点数量、来源与对象关联均满足契约。
- `npm run build`、`git diff --check` 通过；`dist/` 仅含公开文件，本地验证结果未暂存。
- 公开新闻 JSON 的快照 ID 一致：`2eec17bb7737e8d8`。`catalog.json`、`coverage.json`、`index.json` 与月份文件整体发布，没有单独拼接或手改某个月份。
- 数据文件：[目录](../public/data/catalog.json)、[覆盖](../public/data/coverage.json)、[索引](../public/data/index.json)、[9 月事件](../public/data/events/2026-09.json)、[10 月事件](../public/data/events/2026-10.json)、[11 月事件](../public/data/events/2026-11.json)、[计费](../public/data/pricing.json)。
- `.collector/` 内的缓存、队列与判断记录未进入公开目录；没有读取或修改受排除的视频制作产物。
