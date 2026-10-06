# 计费目录对应的动态来源

2026-10-06 按 `public/data/pricing.json` 的 67 项方案补齐动态来源。`config/entities.json` 用 `pricing_provider` 对应 API 厂商，用 `pricing_product_ids` 对应 Token Plan 和 Agent 产品；档位共享产品来源，不为每个价格档位建立重复订阅。回归检查读取实际计费目录，确保每个 API 厂商和订阅产品都有启用、已核实且具备 RSS 或离线转换入口的来源。登记和检查通过不代表完整监测全部型号、价格或权益。

## 对应关系

| 计费类别 | 计费对象 | 动态对象与官方渠道 |
| --- | --- | --- |
| 模型 API | OpenAI、Anthropic、Google、DeepSeek、Alibaba Cloud、Z.AI、MiniMax、Kimi | 复用 OpenAI、Anthropic、Google、DeepSeek、Qwen、智谱、MiniMax、月之暗面的现有来源；Google 补充开发者博客 |
| Token Plan | MiniMax Token Plan | MiniMax 博客，新增 Token / M Plan 官方通知转换 |
| Token Plan | GLM Coding Plan | 智谱模型发布，新增 GLM Coding Plan 官方通知转换 |
| Token Plan | Kimi Code | Kimi 博客，新增当前 Kimi Code CLI 官方 Releases；客户端更新不等于套餐权益更新 |
| Agent | Codex、Claude Code、Cursor、Gemini CLI、OpenCode / Go、Pi | 复用现有官方更新及 Releases；Google 开发者博客补充 CLI 迁移公告渠道 |
| Agent | GitHub Copilot | 复用 CLI Releases，新增 Copilot 产品 Changelog RSS |
| Agent | Devin / Windsurf | 新增 Devin 更新页转换、Cognition 博客转换，沿用同一产品对象 |
| Agent | Cline、Aider | 新增官方 GitHub Releases Atom |
| Agent | Kilo Code / Pass | 新增官方 GitHub Releases Atom 和 Kilo 博客 RSS |
| Agent | Kiro | 新增官方 Changelog RSS，按官方日期标签保留日期精度 |
| Agent 可用模型补充 | 小米 MiMo | 新增 MiMo 官方项目 Releases Atom；只采纳官方发布说明，不把用户 Issue 作为公告 |

新增 7 个动态关注对象：Devin / Windsurf、Cline、Aider、Kilo Code、Kiro、Kimi Code、小米 MiMo。原有模型 / Agent 分类保持不变，Token Plan 通过所属模型厂商筛选。新增名称、别名、来源说明均提供中英文。

## 新增订阅

| 来源 ID | 订阅或转换入口 | 核实依据 |
| --- | --- | --- |
| `cline-releases` | https://github.com/cline/cline/releases.atom | [Cline 官方文章链接至更新仓库](https://cline.bot/blog/cline-3-10-local-chrome-integration-yolo-mode-drag-drop-and-more-workflow-enhancements) |
| `aider-releases` | https://github.com/Aider-AI/aider/releases.atom | [Aider 官网的仓库反链](https://aider.chat/) |
| `kilo-releases` | https://github.com/Kilo-Org/kilocode/releases.atom | [Kilo 官网的 Changelog 入口](https://kilo.ai/) |
| `kilo-blog` | https://blog.kilo.ai/feed | [Kilo 官网的 Blog 入口](https://kilo.ai/) |
| `kiro-changelog` | https://kiro.dev/changelog/feed.rss | [官方 Changelog 的 RSS 入口](https://kiro.dev/changelog/) |
| `kimi-code-releases` | https://github.com/MoonshotAI/kimi-code/releases.atom | [已归档的旧官方仓库指向当前项目](https://github.com/MoonshotAI/kimi-cli) |
| `devin-changelog` | 离线转换 https://docs.devin.ai/release-notes/overview | [官方更新页](https://docs.devin.ai/release-notes/overview) |
| `cognition-blog` | 离线转换 https://cognition.com/blog | [Devin 官网](https://devin.ai/) |
| `glm-coding-notices` | 离线转换 https://docs.z.ai/devpack/overview 中的官方通知 | [官方文档目录](https://docs.z.ai/llms.txt) |
| `minimax-plan-notices` | 离线转换 https://platform.minimax.io/docs/m-plan/intro 中的套餐通知 | [官方文档目录](https://platform.minimax.io/docs/llms.txt) |
| `google-developers-blog` | https://developers.googleblog.com/feeds/posts/default；离线补充日期和正文 | [Google 开发者博客](https://developers.googleblog.com/) |
| `copilot-changelog` | https://github.blog/changelog/label/copilot/feed/ | [GitHub 官方 Copilot 更新分类](https://github.blog/changelog/label/copilot/) |
| `mimo-releases` | https://github.com/XiaomiMiMo/MiMo-Code/releases.atom | [MiMo 官方模型项目](https://github.com/XiaomiMiMo/MiMo-V2-Flash) |

共新增 13 个渠道；配置现有 52 个来源，30 个有在线订阅地址，22 个只有按需离线转换入口。26 个来源启用离线转换（含 Anthropic、Meta 和 Google 两个在线订阅的补充）。网站目录、覆盖 JSON 和 OPML 已同步刷新；OPML 不包含只有本地转换入口的来源。定价 JSON 继续独立维护，本次修改动态数据。

## 本轮采集结果

各来源沿用增量、重叠或失败回补起点；总体最早起点为北京时间 2026-09-30 10:54，最后查询终点为 2026-10-06 22:35。新增来源首次回溯 72 小时，约为 10-03 22:28 至 10-06 22:35；不同来源终点略有差异。Google RSS 缺少条目日期，额外补读其 20 篇官方文章核实日期，均早于新来源查询窗，并按窗口外材料过滤。

本轮处理 30 条候选：3 条入选、21 条过滤、6 条待核查。新增 Kilo Desktop、Kiro IDE 1.2.37、Devin 10 月 5 日更新三条双语事件，原有 49 条历史保留，共 52 条。Kiro 新记录校正一次日期精度，并保存双语更正理由。所有事件的标题、摘要、关键点和入选理由中英文完整，关键点逐项对应。

待核查材料为：GLM-5.3-Flash 活动通知和 MiniMax 套餐迁移通知缺少发布日期；两条 OpenAI 视频只有标题；Tibo 的 “The real story is this one” 缺少可确认 AI 关联的引用对象；Elon Musk 的短链接缺少可核实目标。套餐活动的起止日期不能替代通知发布时间，视频标题不能替代字幕或正文。

Devin 原生 RSS 的 `pubDate` 与官方更新日期标签不一致（例如 October 5 标签对应 October 6 的 RSS 时间），采用独立转换器按页面日期生成 RSS。Kimi 使用当前 `kimi-code` 项目，避免把旧归档项目当成正在维护的 CLI。Cognition 从各文章卡片的 `MM.DD.YY` 标签提取日期，套餐通知仅采纳明确的发布时间字段，Google 开发者博客从官方文章补充日期与正文。

最终覆盖状态：26 个成功、24 个部分覆盖、1 个受限、1 个失败。TikTok 匿名页没有帖子列表，未覆盖起点为北京时间 09-30 10:54；Threads 本轮在线请求超时，未覆盖起点为 09-30 18:47。TRAE 在线转换读取失败后复用原始缓存，保留部分覆盖。社区订阅、有限社交列表、离线来源及无日期的 Google RSS 仍有完整时间窗缺口，逐项见 `public/data/coverage.json`，不能据零条新增材料宣称没有更新。

首轮在线 RSS 使用 13 次 HTTP 304 缓存复用，新增来源采集复用 2 次，再次核对 Kiro 复用 1 次。转换修复及 Google 日期/正文补充复用原始缓存；不删除采集状态或重新设置全站回溯起点。内部原文、处置包和转换 RSS 保存在忽略的 `.collector/`，不进入公开数据。

验证：`npm test`、`python3 scripts/collect.py validate`、`npm run build`。新增回归覆盖计费产品来源遗漏、Devin 更新日期和段落隔离、Cognition 卡片日期、套餐活动日期不得冒充发布日期、Google RSS 无日期补充。
