# 2026-10-18 来源、动态与计费更新

沿用工作区原有 255 条事件和增量状态，更新本地公开快照。现有 257 条双语事件、40 个关注对象、8 位人物、57 个来源、125 项计费方案。未暂存、提交、推送或部署。

## 来源维护

新增 **Google Antigravity** 关注对象及其[官方博客](https://antigravity.google/blog)直接链接的[原生 RSS](https://antigravity.google/blog/rss.xml)。身份与纳入依据来自 Google 官方 Gemini CLI 迁移公告，以及 DeepMind 展示的实际研究工作流；依据写入对象的双语 `admission`。新增订阅已经实际读取和验证，不只是登记地址。

Google Developers Blog 增加 Antigravity 产品关联，沿用既有补日期、正文的独立转换器。没有合并或停用来源；社交页暂时无法读取，不据此删除历史来源。关注目录及 OPML 已随整套快照重新生成。

Beam、LL Alpha 及新发现的 Exo 免费端点仅能确认平台接入；独立发布者身份与影响力依据仍不足，保留为内部候选，不新建公开关注对象。B.AI 新设的[活动与计费公告页](https://docs.b.ai/llmservice/promotions-and-pricing-notices/)已作为优惠依据；这不代表其新闻 RSS 已接通，原有 X 渠道的覆盖缺口仍在。

## 动态处置

没有重置 `.collector/` 或指定新的全站回溯起点。逐来源查询总体范围为北京时间 **2026-09-30 10:54 至 2026-10-18 15:15**；常规在线采集终点为 15:11:44，新增对象关联来源定向读取至 15:14:27，最后一次正文转换至 15:15:00。最早起点来自长期缺口，不表示所有来源均完整覆盖该区间。

最终人工处置 19 条候选：**2 条入选、3 条过滤、14 条待核查；既有事件更正 0 条**。原有 255 条事件的内容、ID、首次采集时间完整保留。

- **Antigravity 生物分子结构查看器（10-15）**：补充官方全文后，按新增产品能力收录。查看器让 Agent 与研究者共享结构、残基高亮及批注，并支持 AlphaFold Database 与研究者自己的预测。抗菌肽候选仍需湿实验验证，没有写成已证实疗法。[原文](https://deepmind.google/blog/accelerating-antimicrobial-discovery/)
- **Demis Hassabis 的临床研究评论（10-13）**：按已核实负责人的一手观点保留，只概括实际取得的帖子文字。明确未确认具体项目、适应症、论文内容及临床效果；证据范围仍为 `partial_text`。[原帖](https://x.com/demishassabis/status/2109813775377563908)

过滤 Hermes canary 的单纯构建标签、Gemini CLI 同一提交的 nightly 比较链接，以及 Tibo 没有实际 AI 信息的指向性互动。未据构建日期或版本号生成能力变化。

14 条待核查包括：9 条只有标题的视频、3 条马斯克短帖（2 条纯短链接，1 条无法确认 AI 关联对象的“10GW”）、Claude Code 2.1.281 的首次日期冲突，以及缺发表日期的 MiniMax Token Plan 通知。复核历史记录后，2.1.281 继续待核查，没有将 RSS 重写时间当作新发布日期。视频未用标题扩写正文；MiniMax 计费权益核验与新闻日期判断分别处理。

## 覆盖与缓存

常规在线读取 104 条材料，HTTP 缓存命中 19 次；新增对象关联来源另读取 20 条既有材料，Antigravity 新订阅窗口内 0 条。原文指纹、解析版本及规则版本相符的已判材料继续复用判断，没有重复生成新闻。

全量离线转换 77 次请求，21 个来源生成有效 RSS、9 个社交来源受限；定向重读 Google Developers Blog 另 22 次请求。合计 99 次请求，转换缓存命中 0 次。成功项均经私有 RSS 导入；转换及导入没有推进离线来源的在线完整覆盖。

最终 57 个配置来源为 **26 success、22 partial、9 blocked、0 failed**。受限来源为 OpenAI、ZCode、Elon Musk、Demis Hassabis、Jeff Dean、Tibo、B.AI、WorldRouter 的 X，以及 OpenAI TikTok。Threads、YouTube、社区订阅和各离线来源仍保留完整时间窗缺口，不能据有限列表或成功转换声称没有更新。

最早未覆盖起点仍为北京时间 09-30 10:54；Threads 为 09-30 18:47、YouTube 为 10-04 22:24；Anthropic 社区订阅为 10-14 23:18、Meta 社区订阅为 10-15 21:38。其余逐项边界及获取、审阅进度见 `public/data/coverage.json`。

## 计费与权益

目录从 117 项增至 **125 项：API 55、Token Plan 18、Agent 52；116 verified、6 pending、3 paused**。读取原目录的 73 个去重官方 URL，其中 71 个经本地只读请求取得正文；Codex Pro 帮助页的 403 和 Copilot Argon 公告的超时另经网页工具直接读取成功。没有将成功 HTTP 响应直接等同于所有字段核验。

原有 105 项更新价格核验日期、52 项单独更新模型权益核验日期。12 项保留原价格日期：不再单列价格的 Google 旧两型号、Kimi 旧四档，以及仍无法确认完整档位结算价的 MiniMax 旧三档和 GLM 三档。后六项继续 `null` / `pending`；Gemini CLI 三个旧个人入口继续 `paused`。实际核实范围之外的日期没有批量更新。

新增 8 项：

- **Google AI / Antigravity 五档**：Free、Plus $4.99、Pro $19.99、Ultra 5x $99.99、Ultra 20x $199.99，美国美元月费。共享 Google AI 订阅每档只登记一次，用 `use_cases` 同时进入聊天和 Agent 筛选。模型列表明确指 Antigravity 核心模型，不冒充整个共享订阅的全部模型。Free / Plus 按周额度；Pro / Ultra 有五小时与周窗口，没有换算成固定请求数或 tokens。[价格](https://gemini.google/us/subscriptions/)、[Antigravity 价格](https://antigravity.google/pricing)、[模型表](https://antigravity.google/docs/models)、[额度](https://antigravity.google/docs/plans)
- **B.AI Qwen3.8 Flash、MiMo-V2.6-Pro、GLM-5.3-Flash**：标准参考价与活动价分开记录。输入 / 输出 / 缓存读取 / 缓存写入每百万 tokens 分别为 $0.16 / $0.47 / $0.016 / $0.16，$0.435 / $0.87 / $0.0036 / $0.435，$0.15 / $0.50 / $0.03 / $0.15；符合资格的用量分别按标准价的 30%、50%、70% 结算。[标准价格](https://docs.b.ai/llmservice/pricing-and-usage/)、[活动依据](https://docs.b.ai/llmservice/promotions-and-pricing-notices/)

原有 10 项有实质说明或优惠变化：

- **OpenCode**：免费优惠从 5 个端点扩展至官方表明确列出的 14 个，补齐 Big Pickle、Space Bunny、LongCat 2.5、Exo、MiMo、Nemotron、Jev 等端点。保留模型训练、30 天留存、NVIDIA 试用和 Beam 地域限制，未公布的统一额度与截止日不补造。[官方模型与隐私表](https://opencode.ai/v2/docs/console/models/)
- **B.AI 两项**：MiMo-V2.6-Flash 优惠改用独立活动公告页，标准价参考仍指模型详情；DeepSeek-V4.1-Flash 新增按适用峰谷标准价 60% 结算的优惠，高峰与非高峰分开说明，不把高峰优惠叠用到非高峰价格上。[公告](https://docs.b.ai/llmservice/promotions-and-pricing-notices/)
- **Devin 三个付费档**：明确 SWE-2 免费期已结束。价格页写至 10-16、模型页写至 10-15，两者均已过去；不再保留“临近结束”的表述，记录之后的模型文档费率，最终扣费以客户端为准。[模型说明](https://docs.devin.ai/desktop/models)
- **Kiro 四个付费档**：本轮模型总表已经可读，补齐 K3 的 US East 配置为 US、Frankfurt 配置不可用的事实；同时保留公告所述 US geography 内跨区域推理，不再写成未读到正文。[模型表](https://kiro.dev/docs/models/)、[K3 公告](https://kiro.dev/changelog/models/kimi-k3-now-available-in-kiro)

Antigravity 的 Argon 和 Claude 5.5 仅限已付费的非试用 Pro 或 Ultra；Argon 不支持旧 Antigravity IDE。旧 Claude 4.6 与 GPT-OSS 的 11-02 移除预告写入权益说明，未提前移除当前仍可用模型。[模型依据](https://antigravity.google/docs/models)

免费 / 折扣记录共 **16 条：6 条免费（5 verified、1 paused）、10 条 verified 折扣**。本轮新增 1 条 Antigravity 免费周额度和 4 条 B.AI 折扣，既有 OpenCode 免费记录扩展模型范围。MiniMax 首月活动仍只有“10 月 14 日”标签、缺年份，没有伪造活动截止时刻或重新认定为当前有效优惠。计费 RSS 保留 107 个原 GUID，10 项内容变化产生新 GUID，另新增 8 项；仅核验日期变化不产生新条目。

## 验证与产物

`pricing:build`、`apply → refresh → validate`、54 项 Python 测试、57 项 Node 测试、`npm run build` 全部通过。257 条事件的双语必填字段与关键点数量校验通过。原有 255 条事件与更新前逐项比较一致；所有公开新闻 JSON 的快照 ID 一致，`dist/data/index.json` 与公开源目录一致。

最终新闻快照为 **`d0380a16e9445415`**。公开文件位于 `public/data/`，配置位于 `config/entities.json`、`config/sources.json`；价格为独立的 `pricing.json` / `pricing.xml`。原文、处置包、发现候选与核验缓存留在已忽略的 `.collector/`。`dist/` 不提交。未读取、搜索或修改约定中的本地视频产物；无可靠 token 计量，不报告用量。
