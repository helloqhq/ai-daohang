# 2026-10-16 动态与计费方案更新

本轮按项目增量 RSS / Atom、独立离线转换和人工计费核验流程更新本地数据。动态由 202 条增至 229 条，计费方案由 116 项增至 117 项；仍为 56 个来源、39 个关注对象。原有 202 条事件的内容、稳定 ID 和首次采集时间完整保留，无实质更正。顶部关注对象分组由“模型”改为“模型厂商”，英文同步为“Model providers”，静态 HTML 和 README 同步更新。

## 动态

沿用逐来源增量、48 小时重叠和失败回补进度，未重置状态或指定新全站起点。总体查询区间为北京时间 2026-09-30 10:54 至 2026-10-16 09:28:46；首轮在线终点为 09:21:14，离线转换查询终点为 09:21:21。各来源有独立起点，最早起点来自长期未覆盖来源，不表示所有渠道都重新回溯到该日。

共审阅 76 条候选：29 条本轮入选材料归并为 27 条新增双语事件，另有 4 条既有事件材料复用原判断，24 条过滤，19 条待核查。新增事件包括：

- Codex 0.163.0 的即时 steering、配置搜索、后台服务重启与会话权限恢复；Claude Code 2.1.301 的小上下文切换压缩与无人值守等待上限。
- Copilot CLI 1.0.99-1 / -2 的目录信任、认证、沙箱与语义搜索；agentic autofix 正式可用及其企业策略、默认分支和单次最多 25 个警报限制；11 月 16 日模型退役预告与个人年付例外。
- OpenCode 1.19.1 取消会话分享；Pi 1.3.0 的思考缓存、Kimi / OpenCode 协议迁移及恢复工具修复；DeepSeek Harness 0.2.1-alpha.4 的自定义插件索引和模型推理设置。
- Kilo 7.8.12、JetBrains 7.1.10 的稳定更新和 Nemotron 3.5 Super VL 接入；模型参数与评测结果均保留平台归属。
- Hermes 0.22.2 回到正确发布线，解释 0.22.1 错误构建，修复网关重启与本地模型长任务；保留 0.22.1 网关会话无法删除的已知问题。采用说明明确标出的 10 月 15 日日期。
- OpenAI 的 Rosalind Academic Plan 赞助学术接入与 GPT-Live-1.1 新声音。Rosalind 的官网 RSS 与 X 合并；语音更新的 X 与 YouTube 元数据合并，API 仍为稍后开放。
- Kiro Kimi K3 实验接入、Sonnet 4 退役及 Markdown Review；Qoder 0.4.8 修复旧指令重新排队；OpenRouter 企业 Private Endpoints；Devin Review manager、SARIF 和稳定 v3 API。
- Tibo 对满载提示减少、自动继续及重置的状态通报；马斯克对 Grok Bot 增长、日常改进和使用建议的一手表述。短帖不补写产品、额度、适用范围或效果保证。

过滤普通案例、推广、教程、构建元信息及没有实际变更说明的安装包。美团推理引擎文章是内部技术实践，未作为公开产品更新入选；其 Atom `updated` 没有改写为首次发表时间。Anthropic 安全评估安排未作为模型或 Agent 功能变化入选。

19 条待核查为：7 条只有标题的视频、4 条正文仅模板注释的 Kiro 更新、Claude Code 2.1.281 的既有首次日期冲突、2 条马斯克纯短链接及 1 条缺所指对象的“10GW”短帖、Tibo 缺引用对象短帖、Demis 缺可确认 AI 关联的临床短帖，以及缺发表日期的 GLM 活动和 MiniMax 迁移通知。未用标题扩写视频内容，也未用活动日或抓取时间替代发表日期。

## 覆盖与缓存

首轮 30 个在线订阅中 28 个读取成功，YouTube 返回 404、Threads 超时；HTTP 缓存命中 8 次。定向重试恢复 YouTube，另命中 Meta / Sam Altman 缓存 2 次；YouTube 订阅仍不能证明完整时间窗，Threads 仍超时。没有改订阅地址以掩盖临时失败。

离线转换执行 69 次请求，缓存命中 0 次；30 个目标中 29 个生成有效 RSS，TikTok 匿名页仍无列表。重试后重新导入本轮已校验清单恢复正文、日期语义与指纹，复用已有判断；该重放不产生网络请求。

最终为 26 个 `success`、28 个 `partial`、1 个 `blocked`、1 个 `failed`。TikTok 未覆盖起点仍为北京时间 09-30 10:54，Threads 为 09-30 18:47，YouTube 为 10-04 22:24。其他部分来源的区间与逐项获取 / 审阅进度保存在 `public/data/coverage.json`；离线导入没有推进在线完整覆盖。失败、有限列表及证据缺失均未描述为“没有重要更新”。全部未变材料继续复用既有判断；无可靠 token 计量，不报告实际用量。

## 计费方案

复核原有 116 项，新增硅基流动 DeepSeek V4.1 Flash，共 117 项：API 52、Token Plan 18、Agent 47；108 项 `verified`、6 项 `pending`、3 项 `paused`。25 项原有内容实际变化，91 项内容不变。原有 110 项更新价格核验日期，6 项保留原日期；只有内容变化更新 `updated_at`，模型权益核验日期独立维护。

- **硅基流动 DeepSeek V4.1 Flash**：每日北京时间 00:00–02:00 / 08:00–24:00，每百万 tokens 输入 ¥2、输出 ¥8、缓存读取 ¥0.04；02:00–08:00 为 ¥1 / ¥4 / ¥0.02。未列缓存写入价，不等同免费，也不套用原厂时段。[官方价格](https://siliconflow.cn/pricing)
- **OpenCode Go**：Step 5 Preview 从免费不限额转为每百万 tokens 输入 $1、输出 $2.70、缓存读取 $0.10；Go / Go Plus 月美元用量上限限时四倍为 $60 / $240，常规 $15 / $60。两档订阅费仍为 $10 / $40，更新模型名称并移除过期免费承诺。按 OpenAI / Anthropic / Google 协议更新 API 端点说明。[Go 文档](https://opencode.ai/docs/go/)
- **OpenCode Zen**：补入 DeepSeek V4.1 Flash Free 与 Nemotron 3.5 Super VL Free 的限时免费条件；前者零留存、不训练，后者是 NVIDIA 试用端点，会记录使用以改进产品，不接收个人或机密数据。当前免费表不再列 Step 5 Preview Free。[Zen 文档](https://opencode.ai/docs/zen/)
- **Kiro**：付费档加入实验 Kimi K3，1M、文本 / 图像、2.4× credits，仅 US geography；端点的 Global 推理范围不等于数据仅在美国处理。按 10-14 退役公告移除 Sonnet 4.0；模型总表仍保留旧行，说明冲突并优先采用明确的生命周期公告，不误删 Sonnet 4.5。[模型表](https://kiro.dev/docs/models/)、[K3 公告](https://kiro.dev/changelog/models/kimi-k3-now-available-in-kiro)、[Sonnet 4 退役公告](https://kiro.dev/changelog/models/claude-sonnet-4-end-of-life)
- **Cursor**：所有收录的第三方模型档位将目录中的 Muse Spark 1.3 更新为 Muse Wonder，保留旧、新套餐独立 ID 和额度口径；补充 Cursor 表列输入 $4、输出 $20、缓存读取 $0.20 / 百万 tokens。[模型价格](https://cursor.com/docs/models-and-pricing)
- **Copilot**：当前模型列表保留到实际退役日；补入 11-16 停用 GPT-5.6 Terra、Opus 5 和 Opus 4.8 的预告、替代选择和个人年付例外，没有提前删除当前权益。[退役预告](https://github.blog/changelog/2026-10-15-upcoming-deprecation-of-selected-github-copilot-models-in-mid-november)
- **Anthropic / WorldRouter**：Opus 5.5 Fast 不再标为研究预览，输入 $8、输出 $40 / 百万 tokens，支持第一方及 Azure 托管 Foundry，不支持 Claude Platform on AWS。WorldRouter 两个 DeepSeek V4 模型补齐平台明确给出的周末 / 中国法定节假日非高峰条件，保持 Credits 原币，不换算美元。[Claude 价格](https://platform.claude.com/docs/en/about-claude/pricing)、[WorldRouter Flash](https://router.worldclaw.ai/models/deepseek-v4-flash)、[WorldRouter Pro](https://router.worldclaw.ai/models/deepseek-v4-pro)

69 个既有核验 URL 中 68 个直接读取成功；Pro 帮助页直接请求为 403，随后用网页读取工具取得同一官方页面，确认三档价格、旧 $200 资格窗口、8× 订阅消耗及 6× credits 条件。Kiro 主容器为空时读取同次 HTML 完整树核实模型表；MiniMax 空主容器的完整树仍只有导航，M Plan 价格以可读取且未变的官方 intro 等文档为据，没有把空页面算作完整价格证据。

当前 Google 表仍缺 Gemini 3.7 Flash / 3.5 Flash，Kimi 表仍未重列旧 Andante / Moderato / Allegretto / Allegro 数值；这 6 项保留历史价格核验日期，不据缺项判断停服。GLM 三档、旧 MiniMax Token Plan 三档继续 `null` / `pending`，Gemini CLI 三个个人入口继续 `paused`。计费 RSS 保留 91 个原 GUID，25 项修改与 1 项新增生成 26 个新 GUID；仅核验日期变化未生成新条目。

## 校验与预览

`python3 scripts/collect.py validate`、`npm run pricing:build`、`npm test`、`npm run build` 通过；52 项 Python、35 项 Node 测试全部通过。核对原有 202 条事件逐字段一致，229 条事件双语必填字段完整，关键点数量对应。

本地浏览器核对了中英文“模型厂商 / Model providers”、计费分类总数以及按厂商和型号搜索新增硅基流动价格。390px 手机预览发现厂商标签会拆行，增加该标签不换行样式后复核，中文五组完整显示，英文按整组换行，页面没有横向溢出。静态构建预渲染 229 条动态与 117 项方案。最终新闻快照 ID 为 `8bf60c8ef5d0174d`。

公开更新位于 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json` 和 `pricing.xml`；9 月文件仅同步快照 ID。内部原文、处置包与核验缓存保留在忽略的 `.collector/`。未读取或修改约定中的视频产物，未暂存、提交、推送或部署。
