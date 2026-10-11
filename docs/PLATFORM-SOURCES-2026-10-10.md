# 2026-10-10 新增 API 平台来源与计费方案

按用户确认的范围新增硅基流动 SiliconFlow、B.AI 和 WorldRouter。三者与已有 OpenRouter 一样归入动态的「平台」；登记官方动态渠道，收录每家 5–10 个主流文本模型及可核实订阅，本轮不补采历史动态。计费按实际提供服务的平台分别分组，同名模型不与原厂或其他平台合并。

配置新增 3 个关注对象、4 个来源，共 39 个对象、56 个来源。计费新增 26 个 API 模型和 B.AI 两个订阅档位，共 103 项（API 48、Token Plan 18、Agent 37；91 项已核验、9 项待核验、3 项暂停）。原有 75 项计费记录未改内容，原有 121 条动态保持内容、ID 与日期。

## 官方动态渠道

| 来源 ID | 官方入口与核实依据 | 获取范围 |
| --- | --- | --- |
| `siliconflow-updates` | [更新公告](https://docs.siliconflow.cn/docs/release-notes/overview)，[官网](https://siliconflow.cn/)反链官方文档 | 按需转换 45 个公告段落，使用独立 `YYYY.MM.DD` 公告标签，不使用正文价格生效日或下线日；同一天不同公告保留独立锚点 |
| `siliconflow-news` | [官方资讯](https://siliconflow.cn/news) | 按需转换首屏 10 张资讯卡及 1 张置顶卡，逐卡提取发表日期；查询窗内读取独立正文容器，不含导航。首屏不代表全部历史 |
| `b-ai-x` | [B.AI 官网](https://b.ai/)反链 [@BAI_AGI](https://x.com/BAI_AGI) | 匿名页解析到 5 条本人帖子、原始时间与部分文字，不替换为引用对象正文，不保证完整时间线 |
| `worldrouter-x` | [WorldRouter 官网](https://router.worldclaw.ai/)反链 [@WorldClawAI](https://x.com/WorldClawAI) | 匿名页解析到 5 条本人帖子、原始时间与部分文字；账号兼有 WorldClaw 其他内容，只筛选 Router 相关的重要变化，不保证列表实时或完整 |

未核实可用原生 RSS，四个来源通过独立按需转换器提供本地 RSS，不填猜测订阅地址，不加入 OPML。实际原文重放验证生成有效 XML，但没有导入采集队列；公开覆盖保持 `not_attempted`，`fetched_through`、`reviewed_through` 和查询时间为空，不以接入核验冒充正式采集。

B.AI [促销与价格更新页](https://docs.b.ai/llmservice/promotions-and-pricing-notices/)只取得活动生效日期，未取得公告发表日期。本轮仅作计费核验依据，不据此编造动态时间。

## 计费收录

API 均为每百万 tokens；`null` 表示未单独收录价格，不表示免费。各项提供双语条件、官方来源和 2026-10-10 核验日期。

| 提供方 | 本轮模型选集 | 官方定价 |
| --- | --- | --- |
| 硅基流动 SiliconFlow · 8 项 | DeepSeek-V4-Flash、DeepSeek-V4-Pro、GLM-5.3、GLM-5.3-Flash、Kimi-K2.7-Code、Qwen3.8-27B、Hy4 preview、LongCat-2.0 | [国内价格中心](https://siliconflow.cn/pricing)，保留人民币，缓存命中价记录为缓存读取；未单列缓存写入价 |
| B.AI · 9 项 | GPT-6.1 Sol、Claude Opus 5.5、Gemini 3.8 Flash、DeepSeek-V4.1-Flash、Kimi K3、GLM-5.3、MiniMax M3、MiMo-V2.6-Flash、Qwen3.8-Max | [定价与用量](https://docs.b.ai/llmservice/pricing-and-usage/)及各型号详情页，保留官方 USD 标准参考价；账户按 1 USD = 1,000,000 B.AI Credits 结算 |
| WorldRouter · 9 项 | GPT-6 Astra、Claude Opus 5.5、Gemini 3.1 Pro Preview、DeepSeek V4 Flash、DeepSeek V4 Pro、Kimi K3、GLM-5.3、MiniMax M3、MiMo V2.5 | [模型目录](https://router.worldclaw.ai/models)及各型号详情页，保留 WorldRouter Credits；未核实美元兑换比例，不推算汇率 |

价格表、单位筛选和本站计费 RSS 支持 `CREDITS`，显示数字加 `Credits`，不会加美元符号。各平台 Credits 不互相等同；充值方式、赠送积分和最终账单不作为未经核实的美元换算。

### 不同平台的条件

- 硅基流动 DeepSeek-V4-Flash 展示常规时段 ¥3/¥9/¥0.3（输入/输出/缓存读取）；每日北京时间 02:00–08:00 为 ¥1.5/¥4.5/¥0.15。不能沿用 DeepSeek 原厂的高峰表。
- B.AI DeepSeek-V4.1-Flash 展示标准高峰价，官方高峰为工作日北京时间 09:00–12:00、14:00–18:00，中国法定节假日除外；非高峰价及 2026-10-04 起按标准价 60% 结算的活动分别写入说明。MiMo-V2.6-Flash 同样保留标准价，并注明符合条件的用量按 10% 结算；活动无明确截止日，不添加虚构 `valid_until`。
- WorldRouter DeepSeek V4 Flash / Pro 使用自身公告的 UTC 高峰 01:00–04:00、06:00–10:00；非高峰价另列。官网未明确周末和节假日例外，不套用其他平台日历。
- B.AI GPT-6.1 Sol 记录输入超过 272K 后的整次请求阶梯价；Claude Opus 5.5 保留 5 分钟和 1 小时缓存写入区别；Gemini 3.8 Flash 保留单独的缓存存储和搜索收费。WorldRouter 的 GPT、Gemini、MiniMax、MiMo 各自保留长上下文阶梯；MiniMax M3 缓存写入为 `N/A`，不视为免费。

### B.AI 订阅

[官方订阅说明](https://docs.b.ai/llmservice/pricing-and-usage/)明确 Pro $200/月、Max $2,000/月，约 50–500 / 500–5,000 条消息每滚动 12 小时。额度是约值，受负载影响，耗尽后自动使用充值 Credits；Pro 需有效邀请码。两档共用 `b-ai-plan` 产品，列入 Token Plan。

官方仅以模型范围描述订阅权益：Pro 为全系列模型接入，Max 提供 beta 模型优先体验。没有逐档型号、全部 API 覆盖或逐模型扣量清单，保留该限制，不从本站 API 选集推断套餐包含每个型号。硅基流动未核实公开固定价 Coding Plan；WorldRouter 未核实独立固定订阅价，不增加占位套餐。

## 验证

新增回归验证 Credits 在页面、筛选、RSS 的原单位；验证公告日期与活动日期分离、同日独立公告、置顶卡日期隔离、正文容器、X 帖子归属和登录页受限；检查所有启用的离线来源都有实际转换入口。

运行 `npm test`、`npm run validate`、`npm run pricing:build`、`npm run build`，并预览厂商 / 平台与 Credits 筛选、中英文展示。实现与核验阶段未提交、推送或发布网站；发布另按用户授权执行。
