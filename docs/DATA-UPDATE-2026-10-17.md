# 2026-10-17 动态与计费方案更新

本轮为 10-16 数据窗口的第二轮增量更新，于 10-17 上午完成处置与校验，按项目增量 RSS / Atom、独立离线转换和人工计费核验流程更新本地数据。动态由 229 条增至 239 条，计费维持 117 项；仍为 56 个来源、39 个关注对象。原有 229 条事件的内容、稳定 ID 和首次采集时间完整保留，无实质更正。

## 动态

沿用逐来源增量、48 小时重叠和失败回补进度，未重置状态或指定新全站起点。总体查询区间为北京时间 2026-09-30 10:54 至 2026-10-16 23:18:35；在线终点为 23:18:35，离线转换查询终点为 23:19:35，grok-official 定向重试至 23:24:07。各来源有独立起点，最早起点来自长期未覆盖来源，不表示所有渠道都重新回溯到该日。

共审阅 46 条候选：28 条本轮判定（15 条入选、12 条过滤、1 条新增待核查），18 条与上午指纹一致、维持待核查不重判。15 条入选材料中 14 条归并为 10 条新增双语事件（其中 2 条事件由多份材料合并），另 1 条对应既有事件、仅登记决策复用原判断，保留稳定 ID、首次采集时间与既有双语摘要，不重发事件块。新增事件包括：

- Copilot CLI 1.0.99-3 可关闭客户端遥测并修复沙箱凭据提示；Cline 云上会话让托管沙箱任务在编辑器关闭后继续运行；Copilot 在 Slack 与 Teams 支持跨仓库对话。
- OpenCode 1.19.2 / 1.19.3：1.x 不再接收 2.x 常规更新，推理选项生成模型变体。
- DeepSeek Harness 0.2.1-alpha.5 的插件模型名称槽位与终端修复（预览）；Gemini CLI 夜间版 v0.66.0 的同步输出渲染与 Git 凭据提示收紧（预览）。
- 智谱 GLM 自 10-16 起将标准 API 与 Coding Plan 的密钥分开管理：标准密钥在编码工具中不消耗套餐额度、可能按量计费，存量密钥自动归类。
- 硅基流动：systemone 接口的 diffusiongemma 模型于 10-17 停止服务；上线高速版 DeepSeek V4.1 Flash；另补录 10-09 上线的高速版 GLM-5.3-Flash（缓存 ¥0.23、输入 ¥0.8、输出 ¥2.8 每百万 tokens）。

过滤 12 条无独立用户侧变更的材料：alpha / canary / release 安装包标记、子包版本标记（变更已由 SDK 0.0.94 事件收录）、nightly 单条修复元信息，以及政府项目通报、研究应用案例、办公室备忘录等。

19 条待核查维持或新增：7 条只有标题的视频（含本轮新增 1 条）、4 条正文仅模板注释的 Kiro 更新、3 条马斯克短帖（含纯短链接及缺所指对象的“10GW”短帖）、Tibo 与 Demis 各 1 条缺引用对象的短帖、Claude Code 2.1.281 的既有首次日期冲突、缺发表日期的 GLM 活动与 MiniMax 迁移通知。未用标题扩写视频内容，也未用活动日或抓取时间替代发表日期。

## 覆盖与缓存

在线 56 个订阅中 26 个读取成功、29 个部分覆盖、1 个阻塞（TikTok 匿名页仍无帖子列表）；HTTP 缓存命中 11 次，读取 123 条材料。本机 Python 证书路径失效导致初始请求大量失败，使用系统证书路径后恢复正常请求，未改订阅地址以掩盖临时失败。TikTok 未覆盖起点仍为北京时间 09-30 10:54，Threads 为 09-30 18:47，YouTube 为 10-04 22:24；X 系来源在线窗口未确认，继续以离线导入为据。

离线转换执行 76 次请求，缓存命中 0 次；20 个目标生成有效 RSS，10 个失败（X 系 8 个与 TikTok 匿名页不可读，grok-official 首次 URLError）。对 grok-official 定向重试成功（87 条、最新 10-14），导入 2 条；该重试不改变在线覆盖结论。

最终为 26 个 `success`、29 个 `partial`、1 个 `blocked`、0 个 `failed`。其他部分来源的区间与逐项获取 / 审阅进度保存在 `public/data/coverage.json`；离线导入没有推进在线完整覆盖。失败、有限列表及证据缺失均未描述为“没有重要更新”。全部未变材料继续复用既有判断；无可靠 token 计量，不报告实际用量。

## 计费方案

维持 117 项（108 项 `verified`、6 项 `pending`、3 项 `paused`）：6 项内容变化并更新 `updated_at`，10 项仅更新核验日期（合计 16 项核验日期更新至 10-17），Kimi 旧四档因页面未重列数值维持 10-11，其余 97 项未变。顶层核验日期更新为 2026-10-17；计费 RSS 保留 111 个原 GUID，6 项内容变化生成 6 个新 GUID，仅核验日期变化未生成新条目。

- **智谱 GLM Coding Plan（三档，维持 pending）**：补入密钥管理说明——标准模型 API 与 Coding Plan 的 API Key 分开管理；标准密钥在编码工具中也不消耗套餐额度、可能按量计费；Coding Plan 密钥按套餐额度计费，切换端点不改变计费类型；存量密钥自动归类。档位结算价仍以 `null` / `pending` 保留。[密钥管理公告](https://docs.z.ai/devpack/overview)
- **Gemini 3.7 Flash / 3.5 Flash**：官方模型页确认两者已弃用并自动路由（3.7 → 3.8 Flash、3.5 → 3.6 Flash；3.6 与 3.8 活动价相同，至 2026-12-31），定价页已不再单列其价格；备注补入弃用与路由说明，条目按历史价格保留。[3.7 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.7-flash)、[3.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash)
- **DeepSeek V4.1 Flash**：按官方计费页脚注补入旧模型名说明——模型名为 deepseek-flash，deepseek-v4-flash 与 deepseek-v4-flash-vision-exp 仍可调用、由 V4.1-Flash 承接并按 Flash 价计费；峰谷时段与半价规则复核未变。[官方价格](https://api-docs.deepseek.com/quick_start/pricing/)
- **MiniMax 旧 Token Plan 三档（维持 pending）**：notice / intro 页仍未提供结算价，价格保持 `null`，核验日期更新。[Token Plan 通知](https://platform.minimax.io/docs/m-plan/token-plan-notice)
- **Kimi**：会员页确认现行为 Go / Plus / Pro / Max，旧四档（Andante / Moderato / Allegretto / Allegro）可续订、名称与规则保持原样；新三档价格复核未变并更新核验日期。[会员说明](https://www.kimi.com/en/help/membership/membership-overview)
- **其他复核**：Gemini 3.8 Flash / 3.5 Flash-Lite / 4 Argon 的活动价、DeepSeek V4.1 Pro 价格与时段规则复核未变，仅更新核验日期；本轮复核的官方页面均直接读取成功。

GLM 三档、旧 MiniMax Token Plan 三档继续 `null` / `pending`，Gemini CLI 三个个人入口继续 `paused`。

## 校验与预览

`apply → refresh → validate` 通过：239 条事件、56 个来源、39 个关注对象。`npm run pricing:build`、`npm test`、`npm run build` 通过，54 项 Python、47 项 Node 测试全部通过；`pricing-offers` 测试中一个表示“晚于目录核验日期”的日期字面量随顶层日期推进同步改为远期日期（9999-01-01），断言意图不变。239 条事件双语必填字段完整。

静态核对 `dist/`：快照 ID 与 `public/` 一致，首页包含本轮新增事件与 GLM 密钥管理说明，计费 RSS 117 项。本轮无样式或结构改动，未做浏览器预览。最终新闻快照 ID 为 `65034947ae1f5a71`。

公开更新位于 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json` 和 `pricing.xml`；9 月文件仅同步快照 ID。内部原文、处置包与核验缓存保留在忽略的 `.collector/`。未读取或修改约定中的视频产物，未暂存、提交、推送或部署。
