# 2026-10-08 动态与计费数据更新

本轮更新动态、计费数据与相关说明，随后按用户授权执行提交、推送及部署验收。按 AGENTS.md 跳过视频制作产物，原有未提交的 SEO / 部署文档修改保留，不加入本轮数据提交。

## 动态

对全部 52 个启用且已核实来源沿用增量、48 小时重叠及失败回补规则。各来源起点不同：本轮最早回补起点为北京时间 2026-09-30 10:54，在线 RSS 查询终点为 2026-10-08 11:38；Google 开发者博客补充转换终点为 11:40。终点是实际查询时间，不代表全部渠道已完整覆盖。

处理 88 条候选：51 条材料归并为 42 条新增事件，31 条过滤，6 条待核查；无历史事实更正。保留原有 52 条，共 94 条双语事件。新增包括 Codex 0.161.0、Pi 1.1.0、Claude Code 2.1.292 / 293、Copilot 本地沙箱与 Ollama 发现、Haiku 5.5 接入、Cline 多客户端修复、Kilo MCP OAuth 与多项目工作流、EmbeddingGemma 2、Google AI Edge Foresight、Cursor iOS 本地 Agent 远程控制及已核实负责人短帖。预览与正式版本分别保留，不将未来能力标为已可用。

RSS HTTP 304 缓存复用 5 次。首次离线转换成功 24 个、失败 2 个；Google 开发者博客重试成功，补齐 20 篇文章日期与正文，17 篇早于窗口的既有判断复用，3 篇近期材料完成编辑。已有原文、规则和解析版本未改变的其他判断沿用。内部缓存与处置包在忽略的 `.collector/`，不发布。

覆盖状态为成功 25、部分覆盖 25、失败 1、受限 1。OpenAI YouTube RSS 返回 HTTP 404，未覆盖起点为北京时间 10-04 22:24；TikTok 匿名页面无帖子列表，未覆盖起点为 09-30 10:54。有限 X / Threads 列表、社区订阅及离线转换仍不推进完整在线覆盖。各来源缺口见 `public/data/coverage.json`；不能以零条新增材料断言没有更新。

待核查的 6 条：两条 OpenAI 视频仅有标题；Tibo 的 “The real story is this one” 缺少引用对象；Elon Musk 的短链接目标未核实；GLM 活动与 MiniMax 迁移通知没有可核实发布日期。活动起止日期不能充当公告发布日期。

每条事件的标题、摘要、关键点和入选理由均有中英文，关键点数量和顺序一致。不同材料提供的全文 / 简介范围按实际记录保留。相关文件：`public/data/events/2026-10.json`、`index.json`、`catalog.json`、`coverage.json`，9 月文件只同步快照标识。

## 计费方案

复核原有 67 项官方价格与模型权益来源，核验日期更新为 2026-10-08；新增 Haiku 5.5 API 后共 68 项（22 API、10 Token Plan、36 Agent）。22 项原有记录有内容变化，其余保留 `updated_at`，只更新实际核验日期。原币种和 credits / tokens 口径保留，未知 GLM 套餐价格继续为 `null` / `pending`，Gemini CLI 个人登录入口继续为 `paused`。

- [Anthropic 定价](https://platform.claude.com/docs/en/about-claude/pricing)：新增 Haiku 5.5，短提示输入 / 输出为 $0.10 / $0.50 每百万 tokens；提示超过 100K 时为 $0.50 / $2.50，缓存读取与写入阶梯也分别记录。Sonnet 5.5 缓存读取从 $0.20 修正为 $0.10。
- [Claude Code 模型配置](https://code.claude.com/docs/en/model-config)、[Cursor 模型目录](https://cursor.com/docs/models-and-pricing)、[Copilot 公告](https://github.blog/changelog/2026-10-07-claude-haiku-5-5-in-github-copilot)、[OpenCode Go](https://opencode.ai/docs/go/)：补入 Haiku 5.5。Go / Go Plus 的该模型月用量上限分别为 $15 / $60；保留客户端、组织策略与长提示费率限制。
- [GLM Coding Plan](https://docs.z.ai/devpack/overview)：标明 09-25 至 10-07 全天半价 credits 活动已结束，恢复常规高峰 / 非高峰说明；完整三档结算价格仍未确认。
- [MiniMax Token Plan](https://platform.minimax.io/docs/token-plan/intro)：补充每用户 / Team 的 Subscription Key 及已分配席位或 Credits 前提，与按量 API Key 不通用。
- [Devin 定价](https://devin.ai/pricing)与[模型文档](https://docs.devin.ai/desktop/models)：前者给出 SWE-2 Free 自助套餐免费期至 10-16，后者给出至 10-15。保留这一官方差异，提示核对客户端；补充实时语音连接与 Agent 模型用量的区别。

Cursor 的印度 Start 套餐以 INR 收费；现有数据契约仅支持 USD / CNY，本次未换算或扩展币种。该目录仍是已收录方案的人工核验快照，不是全部地区和套餐的穷举。

`public/data/pricing.json` 与重新生成的 `pricing.xml` 同步更新。价格 / 条件 / 模型权益变化会改变 RSS GUID；只更新核验日期的记录保持 GUID。

## 验证

`python3 scripts/collect.py validate`、`npm run pricing:build`、`npm test`、`npm run build` 通过。测试共 41 项 Python 与 32 项 Node；修正了两处依赖旧核验日期和旧模型数量的测试假设，不修改页面行为。核实既有事件内容和首次采集时间未变，以及未实质修改计费项的 RSS GUID 稳定。

本地浏览器检查动态及计费的中英文显示、新增模型搜索、厂商与产品分组和移动端表格。正式网站由 main 分支的 GitHub Actions 发布，需在部署成功后核对线上快照。
