# 2026-10-20 信源与数据更新

本记录描述采集完成时的本地结果；后续提交和部署状态以 GitHub Actions 为准。公开新闻快照 `336072346fa5b76c`，共 273 条历史事件、41 个关注对象、8 位人物、58 个启用信源。计费目录独立维护，共 129 项方案。

## 采集与判断

沿原增量进度及失败补采起点执行，没有重置 `--since` 或删除 `.collector/`。旧缺口最早起于北京时间 **2026-09-30 10:54**；本轮原有订阅查询至 **2026-10-20 21:32**，新 Mistral 来源至 **21:36**。这表示尝试查询范围，不表示所有来源完整覆盖。

- 在线获取统计：58 条材料、12 次缓存命中；这一统计包含重复或已处理材料，不等于 58 条新动态。
- 30 个转换目标中首轮 20 个产出有效本地 RSS，9 个匿名账号受限、Cognition 解析失败；修复后 Cognition 单独转换并成功导入。Google 开发者博客的日期和正文由已有转换器补齐。
- 新增 **11** 条双语事件、实质更正 **0** 条、过滤 **16** 条，剩余 **12** 条待核查。最终 39 条待审材料均逐项处置；导入时原文未变且编辑规则未变的判断沿用，不重复编辑。
- 每条新增事件均有对应的中英文标题、摘要、关键点、入选理由和原始来源；关键点逐项对应。没有把视频标题扩成字幕或全文。

新增内容：ZCode 3.16.2；Kilo 7.8.15；Claude Code 2.1.304；Copilot 模型策略 API 正式开放；Copilot 六款模型退役；Copilot CLI 1.0.101-0 预发布与 1.0.100 正式版；Devin Oncall 正式开放；Coral NPU 架构及编译器 v1.0；LiteRT Tensor API；补齐历史队列中的 Claude Code 2.1.281。不同发布阶段保持独立事件。

过滤材料包括仅构建号的安装包、常规教程、演示和客户案例；不能以 OpenCode v2.1.0 的版本号推断功能。Copilot 1.0.100 正式版与已有 1.0.100-0 / -1 预发布记录分开。

## 目录与信源

- **新增 Mistral AI**：根据[官方 Large 4 发布](https://mistral.ai/news/mistral-large-4/)、[Timestral](https://mistral.ai/news/timestral/)及 [OpenCode 集成](https://opencode.ai/v2/docs/console/models/)核实 AI 贡献及实际生态采用；原生订阅为 [mistral.ai/rss.xml](https://mistral.ai/rss.xml)。它提供标题、简介、原文链接和日期，未标成全文源。首次按默认 72 小时采集，本窗口没有新条目，未追补 10 月 6 日或 15 日的历史新闻。
- **修复 Cognition 转换**：原列表 `MM.DD.YY` 改为 `<time>YYYY.MM.DD</time>`，兼容两种格式，按各文章卡片取日期，不跨卡片借用；补入真实格式回归验证。已取回 10 月 16 日文章，内容为招聘合作，按规则过滤，完整在线覆盖仍未确认。
- **Kiro**：原生 RSS 可访问，但 10 月 19 日 Memory Across Chat Sessions 正文只有模板注释，记录双语来源说明并保留待核查；详情页本轮未能读取。
- DeepSeek、xAI 本轮转换恢复，不因一次旧失败停用来源。无来源被停用或合并。
- TypeSafe AI / Jev：已读[官方发布](https://typesafe.ai/blog/introducing-system-one-models-and-jev)及 OpenCode 集成依据；两个候选 RSS 路径均为 404，暂存内部发现候选，尚未登记为已接通来源。原有 LL Alpha、Beam、Exo 的独立发布者/身份核查缺口仍保留，不凭名称推断继承关系。

## 覆盖缺口与待审材料

公开来源最终状态：**27 success、21 partial、9 blocked、1 failed**。离线 RSS 导入没有推进在线完整获取/审阅时间。

| 受限范围 | 未覆盖情况 |
| --- | --- |
| OpenAI / ZCode 的 X、OpenAI TikTok | 自北京时间 9 月 30 日 10:54 起；匿名页没有可核实帖子列表 |
| Elon Musk、Demis Hassabis、Jeff Dean 的 X | 自 9 月 30 日 18:47 起；匿名页没有可核实帖子列表 |
| Tibo 的 X | 自 9 月 30 日 20:28 起；匿名页没有可核实帖子列表 |
| B.AI、WorldRouter 的 X | 自 10 月 8 日 11:47 起；匿名页没有可核实帖子列表 |
| Zuckerberg Threads | 自 9 月 30 日 18:47 起；RSSHub 本轮超时，未据此停用 |
| Anthropic / Meta 社区 RSS | 分别自 10 月 17 日 23:28、10 月 15 日 21:38 起；生成时间缺失或过旧，官网转换仅补充实际取得材料 |
| 官方页面离线转换与有限列表 | 各源保留原缺口（最早 9 月 30 日），详见 `coverage.json`；转换成功不等于完整时间窗 |

12 条待审：7 条 OpenAI 视频只有标题、Kiro 1 条模板正文、Musk 3 条缺对象或只有短链接、MiniMax 旧 Token Plan 通知 1 条缺发布日期。MiniMax 通知只用于独立计费核验，未用抓取时间生成新闻。

## 计费价格、权益、免费与折扣

本轮按待核价和新增/退役线索核验相关官方资料，**没有声称重核全部 129 项价格**。15 个既有方案记录发生日期或内容更新，新增 1 项；其余方案保留原始核验日期。

- **新增 Mistral Large 4 Preview 官方 API**：[模型页](https://docs.mistral.ai/models/mistral-large-4)确认 1M 上下文。每百万 tokens 标准输入/输出/缓存读取为 **$1.36 / $4.18 / $0.14**，当前五折 **$0.68 / $2.09 / $0.07**。标准价和优惠价分别记录；缓存写入未知，优惠截止日未知，未推断免费或截止时间。
- **Copilot 三档**：按[10 月 19 日退役公告](https://github.blog/changelog/2026-10-19-github-copilot-models-deprecated-on-october-19-2026)移除 Gemini 3.7 Flash、GPT-5.5、GPT-5.4、GPT-5.4 mini、GPT-5 mini、Grok 4.5。部分官网表仍残留旧型号，说明中保留冲突并以专门退役公告为准。[价格页](https://github.com/features/copilot/plans)重核 $10 / $39 / $100 月费与 $15 / $70 / $200 credits。未将局部退役核查冒充完整模型表重核，完整模型核验日期保留原值。
- **OpenCode**：[Console 免费表](https://opencode.ai/v2/docs/console/models/)仍为 14 个免费端点，Space Bunny Free 撤下，新增 MiniMax M3.1 Flash Free；保留实际隐私、地域、试用与未知绑卡条件。[Go / Go Plus](https://opencode.ai/v2/docs/console/go/)月费仍 $10 / $40，模型表同步以 MiniMax M3.1 Flash Free 替代 Space Bunny，未将工具连接能力全部标为免费。
- **MiniMax M Plan**：[官方月付表](https://platform.minimax.io/docs/m-plan/monthly-offer)核实 Go / Explore / Build 常规月费 $22 / $55 / $132，[FAQ](https://platform.minimax.io/docs/m-plan/faq)核实 M3.1 Flash、Explore / Build 的 H3 与共享窗口。新增三条首月半价记录，但原页仅写“10 月 14 日”无年份，全部标 **pending**，默认优惠面板不展示为有效活动。
- **6 项价格继续 pending**：GLM Lite / Pro / Max 和 MiniMax 旧 Token Plan Plus / Max / Ultra。本轮只重核[GLM 模型与额度](https://docs.z.ai/devpack/overview)、[MiniMax 旧计划迁移权益](https://platform.minimax.io/docs/m-plan/token-plan-notice)，没有得到完整结算价，价格值继续 `null`，旧价格核验日期不刷新。
- 3 项旧 Gemini CLI 个人入口继续 paused，未重新声称恢复可用。

计费总计：**129 方案（120 verified、6 pending、3 paused）**；**20 条优惠（5 verified free、1 paused free、11 verified discount、3 pending discount）**。优惠记录状态不等于此刻所有请求均适用；前端仍按时间、地区、核验日期和资格筛选。

## 验证与交付

- 候选完整 pricing JSON 先独立校验，通过后替换公开目录并生成 `pricing.xml`。
- `npm test`：Python 55 项、Node 57 项通过；包含新增 Cognition 真实格式回归。
- `npm run pricing:build`、`npm run validate`、`npm run build` 均通过；新闻所有 JSON 的 snapshot_id 一致。
- 数据：`public/data/` 整套快照；配置：`config/entities.json`、`config/sources.json`；修复：`scripts/converters/official.py`、`tests/test_conversion.py`。
- `.collector/` 原文、RSS、判断包及缓存保留在本地忽略目录。`dist/` 未提交。视频产物未读取或纳入变更。
- 采集阶段未执行线上部署；发布时须以线上 `data/index.json` 与本地快照编号一致作为验收依据。
