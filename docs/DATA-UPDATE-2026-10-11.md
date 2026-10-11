# 2026-10-11 动态与计费方案更新

本轮更新动态数据与计费 RSS，沿用项目 RSS / Atom 采集、按需官方渠道转换、双语处置包和人工计费核验流程。数据整理完成后，按用户后续授权提交至 main，并由 GitHub Actions 构建、部署至 GitHub Pages。工作区原有文档修改保持原样，禁止读取或提交的视频制作产物未参与处理。

## 动态范围与结果

检查全部 39 个关注对象、56 个来源。沿用各来源增量、48 小时重叠和历史断档，不重置 `--since` 或采集状态。最早需回补的起点为北京时间 2026-09-30 10:54:00；主在线查询截至 2026-10-11 11:48:18，主转换查询截至 11:48:31；硅基流动资讯重试截至 11:51:48，Meta / Threads 重试截至 11:55:11，OpenAI 来源重试截至 11:57:08。新增四个平台渠道首次查询从 10-08 11:47:54 起；接入核验未被当作已完成历史采集。

人工处理 56 条候选：22 条保留、25 条过滤、9 条暂缓。保留判断对应新增 18 条事件、复核 3 条已有事件和同一 Kiro 发布的两条证据归并。原有 121 条历史事件正文、ID、发布日期及首次采集时间逐项保持不变，总数为 139。DeepSeek Harness 的订阅重新显示时间未用于覆盖已收录首次发布日期；ML Drift、TRAE 3.4.0 也复用原事件，未重复建立记录。

新增内容包括 OpenCode 1.19.0 的 Ultrafast / 升级入口、Codex 0.162.1 启动与 TUI 修复、Claude Code 2.1.296 工作流模型和成本统计、Copilot CLI / JetBrains / 组织审查计费、Kiro 跨会话记忆、B.AI Haiku 5.5 可用性及已核实负责人的一手动态。Gemini CLI 夜间版保留 `preview`，Tibo 观点保留 `opinion`；短帖不补造产品范围、额度或上线细节。Tibo 关于 ChatGPT 与 Devin 订阅的说法仅作为归属明确的动态，不据此修改计费权益。

过滤项包括内部构建元信息、无功能说明的安装包、用户增长与展会宣传、模型推荐、客户案例及无 AI 信息的日常互动。Google RSS 无日期条目经已有独立转换器补充官方日期和正文；窗口外材料和未变判断沿用缓存。

9 条待核查包括：Claude Code 2.1.281 首次日期冲突、3 条只有标题的 YouTube 视频、Tibo 缺引用对象短帖、马斯克 2 条纯短链接、GLM 活动与 MiniMax 迁移通知各 1 条缺公告日期。活动生效日期、抓取时间和标题不替代发布日期或正文证据。

## 覆盖限制与缓存

最终覆盖状态为 25 个 `success`、27 个 `partial`、2 个 `blocked`、2 个 `failed`。硅基流动资讯首次超时后重试成功。Grok 仍返回 HTTP 403；TikTok 匿名页仍无帖子列表；Threads 两次请求超时；OpenAI YouTube 首次 HTTP 404、重试 HTTP 500。未据读取失败或有限列表声称“没有重要更新”。

失败 / 受限区间起点（北京时间）为：Grok 09-30 11:22:33、TikTok 09-30 10:54:00、Threads 09-30 18:47:16、YouTube 10-04 22:24:22；区间延续至各自本轮查询终点。社区订阅、离线转换与有限社交列表继续保留逐来源完整覆盖缺口；完整起点见 `public/data/coverage.json`。离线转换和导入时间没有推进在线完整覆盖。

在线成功联网轮及重试共 13 次 HTTP 304 缓存命中。主转换轮 65 次请求，硅基流动重试 2 次请求，转换缓存命中均为 0。首次受沙箱网络限制的尝试已重新联网执行；计费页读取使用系统 CA，未关闭 HTTPS 证书验证。原文、处置包、转换 RSS 和核验页面保存在忽略的 `.collector/`，未进入公开目录。环境未提供可靠 token 计量，不报告实际用量。

## 计费核验

复核原有 103 项，新增 B.AI Claude Haiku 5.5 共 104 项：API 49、Token Plan 18、Agent 37；92 项 `verified`、9 项 `pending`、3 项 `paused`。原有 9 项修改条件，94 项没有内容变化。原有 101 项更新价格核验日期；Gemini 3.7 Flash、Gemini 3.5 Flash 未出现在本轮取得的 Google 当前 API 价格页中，保留原价格与 10-09 核验日期，未从其他平台费率推断原厂现价，也未因页面缺项推断停服。目录日期为 10-11，各项日期仍独立展示。

- B.AI Haiku 5.5：标准短提示输入 / 输出 / 缓存读取 / 5 分钟写入分别为 $0.10 / $0.50 / $0.01 / $0.125 每百万 tokens；提示超过 100K，整次请求采用 $0.50 / $2.50 / $0.05 / $0.625。Web Search $0.01/次。来源为[B.AI 计费表](https://docs.b.ai/llmservice/pricing-and-usage/)，不推算未单列的其他缓存 TTL。
- Kilo Pass 三档修正奖励说明：月付首月 10%、第二月欢迎奖励 50%，随后随连续订阅增长至最高 40%；年付每月 50%。付费 credits 用尽后发放奖励，奖励在账期结束过期。$19 / $49 / $199 月费未变。[官方 Kilo Pass](https://kilo.ai/pricing/kilo-pass)。
- Kiro 四个付费档补齐追加 credits 条件：个人社交登录 / AWS Builder ID 用户可购买 $0.04/credit 的追加额度，未使用部分可结转、购买后 12 个月到期；企业超额须管理员启用、月底计费。月度包含额度仍不结转，未把两种额度混用。[Kiro 定价](https://kiro.dev/pricing/)。
- B.AI Pro / Max 补齐免费赠送 Credits（注册与充值奖励）30 天有效期；未把该有效期套用于全部付费余额。[B.AI 计费说明](https://docs.b.ai/llmservice/pricing-and-usage/)。

GLM 三档、MiniMax 旧 Token Plan 三档、Kimi 新套餐三档的结算价格仍待核验。Gemini CLI 三个个人入口仍保持停止服务状态。人民币、美元和 WorldRouter Credits 保留原单位，平台价格与原厂价格不合并；兼容客户端不代表包含该客户端厂商的模型权益。只有实际内容变化的计费项更新 `updated_at`，94 项复核记录的 RSS GUID 保持稳定，9 项内容变更更新 GUID，新增 1 个 GUID。

## 校验与文件

`python3 scripts/collect.py validate` 通过：139 条事件、56 个来源、39 个对象；双语必填项、关键点数量与更正理由校验完整。本轮没有更改原有历史事件；新写入的 Copilot 周报移除了编辑流程说明，按写入契约保存双语编辑修订理由。`npm test` 的 51 项 Python 和 35 项 Node 测试全部通过；`npm run pricing:build` 与 `npm run build` 通过。构建预渲染 139 条事件和 104 项计费数据。

公开数据包括 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json`、`pricing.xml`；9 月事件文件仅同步快照 ID。最终新闻快照 ID 为 `df0ef1ecccdb4bb3`。内部缓存与构建目录不加入 Git；上线验收核对 139 条动态、104 项计费数据及上述快照 ID，并逐文件比对发布数据。
