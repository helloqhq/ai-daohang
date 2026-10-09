# 2026-10-09 动态与计费方案更新

本轮完成数据更新、校验、测试、构建和页面预览。新闻继续通过 RSS / Atom 与独立的按需 RSS 转换流程处理；计费目录依据官方页面单独核验。

## 查询范围与结果

检查全部 36 个关注对象、52 个启用且已核实的来源，沿用逐来源增量起点、重叠查询与历史断档，没有重置 `--since`。最早需补采的起点为北京时间 2026-09-30 10:54:00；各来源实际起点不同。在线 RSS 本轮查询截至 2026-10-09 21:40:28，主转换轮截至 21:41:04，Grok / TRAE 重试截至 21:48:55。快照生成时间与离线导入时间不作为完整查询覆盖时间。

共处理 97 条候选：30 条保留判断、59 条过滤、8 条暂缓。保留判断包括新增 27 条事件、更正 2 条历史事件及重新确认 1 条已有事件；公开历史从 94 条增至 121 条。新增内容包括 DeepSeek Harness、Claude Code、Codex、Copilot CLI、Hermes、Kilo、Cline、TRAE 的功能或关键修复，以及 Anthropic、Google 和已核实负责人的一手动态。预览、观点与正式更新按原始证据分别标注，保留厂商或个人归属。

Claude Code `2.1.292`、`2.1.293` 的当前官方订阅正文与本站原摘要不一致。本轮按当前原文修正双语标题、摘要和关键点，追加双语更正理由，保留原事件 ID、首次采集时间和来源；其他既有事件的首次采集时间也保持不变。

## 来源覆盖与待核查

最终状态为 27 个 `success`、23 个 `partial`、2 个 `blocked`，没有 `failed`。这表示本轮订阅处理状态，不宣称已完整覆盖所有官网或账号。首次转换中 TRAE 请求临时失败，重试后成功导入 3.4.0 更新；Grok 重试仍返回 HTTP 403，TikTok 匿名账号页仍没有帖子列表。YouTube 订阅恢复读取，但条目历史不足，继续保留覆盖缺口。

以下为仍未确认的覆盖区间起点，时间均为北京时间 UTC+8，区间延续至各来源本轮查询结束；完整字段见 `public/data/coverage.json`。

| 状态 | 未覆盖起点 | 来源 ID |
| --- | --- | --- |
| partial | 2026-09-30 10:54:00 | zcode-official、openai-x、zcode-x |
| partial | 2026-09-30 11:22:33 | deepseek-official、qwen-official、zhipu-official、moonshot-official、minimax-official、tencent-official、qoder-official、trae-official、dario-blog |
| partial | 2026-09-30 18:47:16 | elon-musk-x、mark-zuckerberg-threads、demis-hassabis-x、jeff-dean-x |
| partial | 2026-09-30 20:28:54 | tibo-x |
| partial | 2026-10-03 22:27:56 | devin-changelog、cognition-blog、google-developers-blog |
| partial | 2026-10-03 22:30:37 | glm-coding-notices、minimax-plan-notices |
| partial | 2026-10-04 22:24:22 | openai-youtube |
| blocked | 2026-09-30 11:22:33 | grok-official：HTTP 403 |
| blocked | 2026-09-30 10:54:00 | openai-tiktok：匿名页无帖子列表 |

8 条材料仍在队列中等待证据：

- Claude Code 2.1.281 的订阅日期与已确认版本时间冲突，不能把订阅重写时间当成首次发布。
- 3 条 YouTube 视频只有标题，缺少可核实功能的简介正文或字幕。
- Tibo 的 “The real story is this one” 短帖缺少可核实的 AI 信息或引用对象。
- 马斯克的一条短链接缺少可核实的目标内容。
- GLM 活动公告、MiniMax 迁移公告缺少可核实的公告发布日期；活动日期和本轮采集日期不能代替发布日期。MiniMax 当前计费条件可用于人工定价核验，但不据此编造一条新闻发布时间。

在线 RSS 使用了 9 次 HTTP 304 缓存命中；主转换轮 63 次请求、重试 2 次请求，转换缓存命中均为 0。材料和编辑规则未变的既有判断沿用内部缓存。原文、处置包、网络缓存与运行记录均保留在忽略的 `.collector/` 中。

## 计费方案

复核原有 68 项及其官方价格 / 模型权益来源，新增 7 项，当前共 75 项：模型 API 22、Token Plan 16、Agent 套餐 37。原有 23 项发生内容或来源变更，其余 45 项仅更新核验日期。状态为 63 项已核验、9 项价格待核验、3 项 Gemini CLI 个人登录入口已停止服务。核验日期为 2026-10-09，纯复核项的 `updated_at` 保持原值。

主要变化：

- MiniMax 新增 M Plan Go / Explore / Build，常规月付分别为 $22 / $55 / $132，并记录共享多模态额度、H3 档位门槛与 Music 排除项。旧 Token Plan 保留独立历史档位及续订条件；当前入口无法重新确认旧套餐结算价，数值置为 `null` / `pending`，历史价格仅作说明。[M Plan 月付说明](https://platform.minimax.io/docs/m-plan/monthly-offer)、[权益 FAQ](https://platform.minimax.io/docs/m-plan/faq)、[迁移通知](https://platform.minimax.io/docs/m-plan/token-plan-notice)。
- Kimi 新增 Plus / Pro / Max，记录新套餐取消周限额、仍受共享月额度及 5 小时窗口约束，并区分 K3 256K、1M 和高速模型门槛。新名称无法从公开页面确定档位结算价，三档价格保留 `null` / `pending`；旧套餐保留历史名称、价格与周限制。[Kimi Code 会员说明](https://www.kimi.com/code/docs/kimi-code/membership.html)。
- Cursor Teams 原档标为 Standard，新增 Premium $120 / 席位 / 月，并记录第三方模型的 API 费率加 $0.25 / 百万 tokens、包含用量及例外条件。[Cursor 模型与定价](https://cursor.com/docs/models-and-pricing)。
- GPT-6.1 Sol 补充 Ultrafast API 阶梯价格；Codex Pro $500 补充 Astra 与 Sol Ultrafast 的用量条件，Pro $100 / $200 改为遵循当前模型额度及面板重置规则，保留 $200 旧用户资格窗口。[OpenAI API 定价](https://developers.openai.com/api/docs/pricing)、[Pro 档位说明](https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers)。
- OpenCode Go 补充 Step 5 Preview Free 临时免费权益；Kilo Pass 更新奖励与到期规则；Kiro 补充 GPT-5.6 超长上下文的翻倍扣量条件。Gemini CLI 的停服记录改用可读取的美国订阅官方入口。[OpenCode Go](https://opencode.ai/go)、[Kilo Pass](https://kilo.ai/pricing/kilo-pass)、[Kiro 模型表](https://kiro.dev/docs/models/)、[Google 美国订阅页](https://gemini.google/us/subscriptions/)。

9 项价格待核验为 GLM Coding Plan 三档、MiniMax 旧 Token Plan 三档、Kimi 新套餐三档。未将工具兼容性当成第三方模型权益，未把 credits / 请求数换算成 tokens，也未推断人民币与美元汇率。MiniMax 首月活动说明只写“October 14”而没有年份，因此没有编造 `valid_until`，常规月付价格仍作为基准。

## 校验与交付

- `python3 scripts/collect.py validate`：121 条事件、52 个来源、36 个关注对象通过；中英文必填项、关键点数量及双语更正理由完整。
- `npm test`：47 项 Python、34 项 Node 测试通过。调整既有 Kimi 档位数量和模型权益断言，匹配新增套餐。
- `npm run pricing:build`、`npm run build`：75 项计费方案与完整公开快照构建通过。
- 45 项纯复核记录的计费 RSS GUID 保持稳定，23 项内容变更的 GUID 已更新。
- 本地页面核对动态与计费分组、中文 / 英文切换、关键词和厂商筛选；390 × 844 手机视图显示水平滚动表格提示，待核验价格与历史档位标识正常。

更新文件包括 `public/data/catalog.json`、`coverage.json`、`index.json`、`events/2026-09.json`、`events/2026-10.json`、`pricing.json`、`pricing.xml`，以及 MiniMax M Plan 关联配置、计费文档和既有测试断言。新闻 JSON 统一使用快照 ID `2c58b3efd10a470f`。本轮未修改网站生产代码；保留工作区原有其他修改。`dist/`、内部缓存和本地视频产物不加入 Git。

发布按项目既有流程提交、推送至 `main`，由 GitHub Actions 构建并部署。上线核验应确认上述新闻快照 ID、121 条事件与 75 项计费记录均与本地一致。
