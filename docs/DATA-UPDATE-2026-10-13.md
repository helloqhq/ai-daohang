# 2026-10-13 动态与计费方案更新

本轮按既有 RSS / Atom、独立离线转换及人工计费核验流程更新本地数据。动态由 139 条增至 169 条，计费方案由 104 项增至 114 项。原有 139 条事件的内容、稳定 ID 和首次采集时间全部保留；视频产物未读取或修改，工作区原有其他文档改动未覆盖。提交、推送和部署另按项目发布流程执行。

## 动态

沿用 56 个来源、39 个关注对象的增量、重叠及失败回补起点，没有重置采集状态。总体查询范围为北京时间 2026-09-30 10:54 至 2026-10-13 22:46:33；在线订阅查询终点为 10-13 22:45:57，各来源起点不同。

最终审阅 83 条候选：33 条材料归并为 30 条新增双语事件，38 条过滤，12 条待核查，原有事件无实质更正。Cline CLI / SDK 同次更新、B.AI 中英文迁移通知、ZCode 更新与同次推荐活动按事件归并；不同版本与发布阶段分别保存。Hermes 0.21.7 采用发布说明明确标出的 10-11 日期，来源仍保留 Atom 的 10-12 更新时间及 `date_kind: updated`，未将更新时间冒充首次发表日期。

新增内容包括：

- Cline CLI 3.0.71 / SDK 0.0.93 进程内插件、ACP 思考与定时任务修复；Pi 1.2.0 按 Key 获取 OpenRouter 目录及扩展接口变化。
- Kilo 7.8.9 和 JetBrains 7.1.10-rc.3 的权限、后台进程、MCP 与模型兼容修复，按预发布记录；Copilot CLI 1.0.96、1.0.97-0、1.0.97-2 及企业遥测独立采集控制。
- Hermes 0.21.7 稳定标签更新渠道；Kiro V3 迁移、FedRAMP Class C 及 GovCloud 模型可用性；ZCode 3.15.1 / 3.15.3、Qoder 0.4.4；Devin 个人记忆与恢复窗口调整。
- The X Subscription 新购套餐；B.AI MiMo-V2.5 系列自动转发和停用旧 ID 的安排。
- 已核实负责人关于更多用量的预告、重置通报、Pro 五小时限制调查、Codex / Work 500K 默认上下文、Grok Bot 使用反馈、Muse Wonder 与 AI 研究活动的一手动态。观点与预告保留归属，不据短帖改写套餐政策。

过滤项包括无说明的安装包、内部 RC / canary 发布元信息、普通宣传、活动邀请、客户案例、无 AI 信息互动和未明确 AI 关联的通用招聘。待核查 12 条为：Claude Code 2.1.281 首次日期冲突、5 条只有标题的视频、Tibo 缺引用对象短帖、马斯克 2 条纯短链接、Demis 临床研究短帖缺引用项目、GLM 活动和 MiniMax 迁移通知各 1 条缺公告日期。视频标题、活动日期、抓取时间均不替代缺失证据。

## 覆盖与缓存

30 个在线订阅均成功读取，9 次 HTTP 304 缓存命中；独立转换轮 67 次请求、0 次转换缓存命中，30 个目标中 29 个生成有效 RSS，TikTok 仍受限。Google 开发者博客由既有转换器补齐日期和正文；原文未变、规则与解析版本未变的判断继续复用。

最终覆盖为 25 个 `success`、30 个 `partial`、1 个 `blocked`，无 `failed`。Grok 官方公告、Threads 和 YouTube 恢复取得材料；取得有限列表不消除完整时间窗缺口。TikTok 匿名页仍无帖子列表，未覆盖区间从北京时间 09-30 10:54 起延续至本轮；其他部分来源的逐项起点与进度保存在 `public/data/coverage.json`。离线导入不推进在线完整覆盖，也不声称“没有重要更新”。

所有原文、转换 RSS、核验页面与处置包保存在忽略的 `.collector/`，未加入公开目录。环境未提供可靠 token 计量，不报告实际用量。

## 计费方案

复核原有 104 项，新增 10 项，共 114 项：API 49、Token Plan 18、Agent 47；105 项 `verified`、6 项 `pending`、3 项 `paused`。原有 15 项实质修改，89 项内容不变。原有 95 项更新价格核验日期；9 项保留原价格核验日期，模型权益日期独立记录。仅实际内容变化更新 `updated_at`。

- **Kimi 新 Plus / Pro / Max**：中国区标准月费分别 ¥99 / ¥199 / ¥699；年付总额 ¥948 / ¥1,908 / ¥6,708，折合 ¥79 / ¥159 / ¥559 每月。Agent 额度为 2× / 4× / 14×；均含 Kimi Code，保留五小时窗口、无周限额，共享月额度且未用额度不结转。此次直接读取新档位价格表，未用旧档位名称推算价格。[官方会员帮助页](https://www.kimi.com/en/help/membership/membership-overview)
- **Cursor 新购 The X Subscription**：新增 Free / Plus / Premium / Super / Ultra 五档，月费 $0 / $8 / $30 / $100 / $200；另增 Teams Premium / Super / Ultra，每席位每月 $30 / $100 / $200。付费档共享 Grok 周用量；Premium 及以上第三方模型额外按 API 标价购买用量，不包含第三方模型额度。新购与旧订阅分为两个产品表，复用已登记 Cursor 来源。[Cursor 计费页](https://cursor.com/pricing)、[官方发布与迁移说明](https://x.ai/news/x-subscription)
- **旧 Cursor 订阅**：Pro / Pro+ / Ultra / Teams Standard / Teams Premium 保留稳定 ID、原价和原有模型权益，标明 legacy、停止新购。官方明确已有订阅可保留权益，迁移后才采用新规则；没有将旧 Ultra 与新 Ultra 合并。[旧套餐文档](https://cursor.com/docs/models-and-pricing)、[迁移说明](https://x.ai/news/x-subscription)
- **Codex Free / Go**：新增免费与 $8/月入口，官方列出桌面应用 GPT-6 Luna Standard，按发布进度开放；不将 API 模型价换算成订阅用量。[OpenAI 官方 Learn 计费说明](https://learn.chatgpt.com/docs/pricing)
- **OpenCode Go**：DeepSeek V4.1 Flash 月美元用量上限由 $60 / $120 上调至 $80 / $160；保持五小时 20%、每周 50% 的窗口。补充单成员 workspace、不能邀请成员、新 `https://opencode.ai/inference/go/v1` 端点和 Console 按量余额条件。[官方 Go 文档](https://opencode.ai/docs/go/)
- **Pi / MiniMax M Plan / B.AI**：补齐 Pi 按 Key / 地域加载 OpenRouter 目录、MiniMax 官方兼容表新增 Pi 和免 API Key 的官方客户端登录；B.AI MiMo-V2.6-Flash 条目补入旧 V2.5 ID 于 10-14 18:00 SGT 转发、10-21 10:00 SGT 停用的安排，SGT 与北京时间均为 UTC+8。[Pi 提供商文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/providers.md)、[M Plan 文档](https://platform.minimax.io/docs/m-plan/intro)、[B.AI 中文通知](https://x.com/BAI_AGI/status/2109847688846213545)

67 个目录核验 URL 中 65 个首轮取得页面；Copilot 计费页首次传输中断后重试成功，OpenAI Pro 帮助入口返回 403，以官方 Learn 补查公开月费及常规模型权益，但未据此重新确认帮助页中的全部旧用户资格细节。Kiro 与 MiniMax 部分页面的正文位于主容器外或内嵌数据中，按同次取得的 HTML 核对，不将空主容器当作完整核验。

保留原日期的 9 项为：当前 Google API 价格页缺少的 Gemini 3.7 Flash / 3.5 Flash；详细 Pro 帮助入口未成功复核的 Codex Pro $100 / $200 / $500；当前 Kimi 新表未再列出旧数值的 Andante / Moderato / Allegretto / Allegro。不因页面缺项推断停服。GLM 三档和 MiniMax 旧 Token Plan 三档仍是 `null` / `pending`；Gemini CLI 三个个人入口仍 `paused`。人民币、美元和 WorldRouter Credits 保留原单位。

计费 RSS 保留 89 个未变内容 GUID；15 项修改产生新 GUID，10 个新方案新增 GUID。仅日期变化不生成新条目。

## 校验与文件

`python3 scripts/collect.py validate`、`npm run pricing:build`、`npm test` 和 `npm run build` 通过；52 项 Python、35 项 Node 测试通过。动态必填双语字段、关键点数量与更正理由完整。构建预渲染 169 条事件、114 项计费。最终新闻快照 ID 为 `2a39f71f4aa5c55b`。

公开更新包括 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json`、`pricing.xml`。9 月事件仅同步快照 ID。`config/entities.json` 增加新订阅产品到已核实 Cursor 动态来源的映射，来源和关注对象数量不变。
