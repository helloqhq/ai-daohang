# 可扩展的关注对象与来源配置

状态：实际配置在 config/entities.json 与 config/sources.json。获取方式已统一 RSS/Atom；下方官方入口调查保留作身份依据，不代表直接抓取已接入。实际可用订阅及覆盖见 config 和 public/data/coverage.json。

## 对象与来源分别维护

用户名单同时包含厂商、模型品牌、应用及运行工具。关注对象是“跟进谁”，信息源是“去哪里取得信息”，二者不能用一个名称混在一起。

分成三类配置：

- 关注对象：稳定标识、展示名、用户别名、分类，以及需要时的所属组织与模型系列。
- 信息源：稳定标识、平台、账号或频道标识、官方入口、来源格式、适配器、实际读取能力、关联关注对象、启用状态及身份核实依据。
- 指定负责人：稳定标识、姓名、关联关注对象、已核实身份及自媒体入口。

展示名和网页地址变化不应导致对象标识变化。一个关注对象可有多个来源，一个官方渠道也可能同时覆盖多个关注对象。

## 扩展方式

加入支持现有来源格式的新对象，应只需新增或修改配置。来源类型需要新增解析能力时，才增加相应适配逻辑；不要为每个厂商单独写一套页面。

全部来源共用 RSS/Atom 读取器。原始平台独立登记，原生订阅或第三方转换后的 RSS 在 config/sources.json 集中维护。平台与适配器分别登记，避免把平台名等同于原始数据格式；同一平台可以使用公开网页、已配置接口或链接导入等不同读取方式。

允许独立启用或停用对象与来源，保留既有历史引用。配置层面未核实的入口不得被标为已接入，来源的运行时访问失败也不能解释为永久停用。

公开网站仅需读取用于展示的对象元数据；实际采集状态、重试进度和内部运行细节应与公开内容分开设计。

## 首版名单

模型关注对象：OpenAI、Anthropic、Google、DeepSeek、Qwen、智谱、月之暗面、MiniMax、腾讯、美团、Grok、Meta。

Agent 应用／运行工具：Codex、Claude Code、Cursor、Gemini CLI、DeepSeek Harness、Nous Research Hermes Agent、OpenCode、GitHub Copilot、Qoder、Pi Agent Harness、TRAE、ZCode、MiniMax Code。

负责人名单采用身份与账号可核实的明确名单，逐步扩展。

已按用户确认的推荐映射统一展示名，原始名称作为别名保留。Google 关联多条官方模型渠道；Grok 登记为模型品牌，厂商另行登记。Copilot 限定 GitHub Copilot 的 CLI、IDE Agent 等任务执行能力。后续新增歧义对象时先核实再确认，不凭同名搜索结果自动选择。

### 已确认的 Agent 身份

| 用户名称 | 已确认身份 | 官方依据 |
| --- | --- | --- |
| deepseek harness | DeepSeek Harness | [DeepSeek 官方仓库](https://github.com/deepseek-ai/deepseek-harness)、[Releases](https://github.com/deepseek-ai/deepseek-harness/releases) |
| hermes | Nous Research Hermes Agent | [官方文档](https://hermes-agent.nousresearch.com/docs/)、[Releases](https://github.com/NousResearch/hermes-agent/releases) |
| pi | Pi Agent Harness | [现行官方仓库](https://github.com/earendil-works/pi)、[Releases](https://github.com/earendil-works/pi/releases)；旧 badlogic/pi-mono 地址本轮重定向至此 |
| copilot | GitHub Copilot，聚焦 CLI、IDE Agent 等任务执行能力 | [Copilot CLI 官方页](https://github.com/features/copilot/cli)、[官方 Changelog](https://github.blog/changelog/label/copilot/)、[CLI Releases](https://github.com/github/copilot-cli/releases) |

以上对象映射及关注范围已获用户确认。来源地址迁移只更新配置，不重新生成关注对象标识。

### 其他初始来源入口

| 对象 | 官方入口与本轮观察 |
| --- | --- |
| OpenAI | [News](https://openai.com/news/)列表可读取 |
| Anthropic | [Newsroom](https://www.anthropic.com/news)列表可读取 |
| Google | [DeepMind Blog](https://deepmind.google/blog/)可读取；按 Google 模型范围继续扩展官方渠道 |
| DeepSeek | [API 文档](https://api-docs.deepseek.com/)及更新入口本轮读取超时，需进一步验证 |
| Qwen | [旧博客](https://qwenlm.github.io/blog/)提示迁往 [qwen.ai](https://qwen.ai/)；新站本轮文本抽取为空，需进一步验证 |
| Codex | [官方 Releases](https://github.com/openai/codex/releases)可读取，但不代表覆盖整个产品所有客户端更新 |
| Claude Code | [官方 CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)存在，正文读取应进一步验证 Raw 等官方路径 |
| Cursor | [Changelog](https://cursor.com/changelog)列表可读取 |
| Gemini CLI | [官方 Releases](https://github.com/google-gemini/gemini-cli/releases)列表可读取 |

负责人初始可核实入口：Sam Altman 的 [OpenAI 身份依据](https://openai.com/our-structure/)与 [个人博客](https://blog.samaltman.com/)；Dario Amodei 的 [Anthropic 身份依据](https://www.anthropic.com/company/leadership)与 [个人博客](https://www.darioamodei.com/)。Demis Hassabis 的 [DeepMind 身份依据](https://deepmind.google/about/)可核实，但本轮尚未确认其个人账号入口。博客不是全部社交动态的覆盖保证。

### 新增对象的官方入口候选

| 用户名称 | 可关注的模型系列／产品 | 官方入口 |
| --- | --- | --- |
| 智谱 | GLM | [公司介绍](https://z.ai/company)、[模型发布记录](https://docs.z.ai/release-notes/new-released) |
| 月之暗面 | Kimi | [官网](https://www.moonshot.ai/en)、[研究博客](https://www.kimi.com/en/blog/)、[开放平台博客](https://platform.kimi.com/blog) |
| minimax | MiniMax 模型与产品 | [博客](https://www.minimax.io/blog)、[新闻](https://www.minimax.io/news) |
| 腾讯 | 混元及该厂商后续相关模型 | [混元官网](https://hunyuan.tencent.com/)、[官方仓库示例](https://github.com/Tencent-Hunyuan/Hunyuan-A13B) |
| 美团 | LongCat 及该厂商后续相关模型 | [美团技术团队发布文章](https://tech.meituan.com/2026/07/12/LongCat-2.0-Open-source.html)、[官方项目组织](https://github.com/meituan-longcat) |
| grok | Grok；厂商与品牌分别登记 | [官方新闻](https://x.ai/news)、[Grok 官方介绍](https://x.ai/news/grok) |
| meta | Llama 及该厂商其他相关模型 | [Meta AI 博客](https://ai.meta.com/blog/)、[Llama 发布文章示例](https://ai.meta.com/blog/meta-llama-3) |
| opencode | OpenCode | [官网](https://opencode.ai/)、[Changelog](https://opencode.ai/changelog)、[官网链接的项目仓库](https://github.com/anomalyco/opencode/tree/v2) |
| qoder | Qoder 产品家族 | [Changelog](https://qoder.com/en/changelog)、[Release Notes](https://docs.qoder.com/release-notes/qoder) |
| trae | TRAE 产品的 Agent 能力与重要更新 | [国际版 Changelog](https://www.trae.ai/changelog)、[中文版 IDE 更新日志](https://docs.trae.cn/ide_changelog)、[官方中文社区产品更新](https://forum.trae.cn/c/4-category/17-category/17) |
| zcode | ZCode | [官网](https://zcode.z.ai/cn)、[官方更新日志](https://zcode.z.ai/en/changelog)、[官方文档](https://zcode.z.ai/cn/docs/welcome) |
| minimax code | MiniMax Code | [官方产品入口](https://agent.minimax.cn/download)、[官方 CLI 仓库](https://github.com/MiniMax-AI/minimax-code)、[CLI Releases](https://github.com/MiniMax-AI/minimax-code/releases) |

配置不能把一个厂商锁死为一个模型版本的仓库：单个仓库可能只覆盖该产品的一部分更新。单篇发布文章可作为身份和来源关系的依据，不是持续更新的列表入口。

新增三项于 2026-10-03 核实以上官方入口，保留用户输入 `trae`、`zcode`、`minimax code` 为别名。ZCode 更新日志与 MiniMax Code CLI Releases 可读取；TRAE 中文 IDE 更新日志可读取，国际版 Changelog 本轮抽取显示没有更新记录，不能据此推断整个产品没有更新。TRAE 的地区版本、MiniMax Code 的桌面产品与 CLI 分别登记来源范围，同一产品仍作为一个关注对象，避免重复计数或把单个入口视为全部更新覆盖。

本轮部分页面只提取到导航或没有正文，包括混元官网、MiniMax 新闻页与 Qoder Changelog；可优先进一步验证其官方仓库、博客或文档入口。智谱的博客索引本轮返回 404，但所列发布记录可读取。上述访问情况不能解释为相应对象没有更新。

grok 是用户希望关注的模型品牌，不能直接记作厂商。xAI 可保留为常用别名，正式厂商展示名应随官方身份核实结果更新，不写死在页面或 skill 中。

## 新增媒体平台

YouTube、TikTok、X、微信公众号加入来源平台范围。默认接入已确认关注对象的官方账号和已核实负责人账号，具体账号在实施中登记；平台存在不等于所有对象都拥有该平台账号。

| 平台 | 采集对象与材料 | 复用与降级设计 |
| --- | --- | --- |
| YouTube | 指定频道的视频索引、标题、简介、发布时间、可取得的字幕／文字稿 | 统一频道适配器，正文与字幕能力分别登记；没有字幕时仅按实际文本总结，保留视频链接 |
| TikTok | 指定账号的视频文案、发布时间、可取得的文字材料 | 统一账号适配器，根据实际可用公开页面或已授权接口读取；受限时保留缺口，允许原文链接导入 |
| X | 指定账号的原创帖文、线程及有价值的引用，附媒体文本证据 | 统一账号适配器，按可读页面或已有可用访问方式接入；不以付费 API 为默认依赖，读取能力不足时标记受限 |
| 微信公众号 | 指定公众号的已发现文章、正文、发布时间和账号信息 | 统一文章解析，账号发现能力另行验证；公开文章和本账号授权素材库分别登记，只有个别文章链接时不声称完整覆盖历史 |

账号核实依据可采用官网反链、官方项目说明或可验证的账号认证信息与其他官方依据，不仅凭相同昵称。频道／账号稳定标识与可变昵称分别保存；无法取得稳定标识时保留待核实状态和入口链接。

链接导入作为自动发现失败或受限时的补充，仍需核实来源、时间和内容。只导入一条帖子或文章不能推进整个账号时间窗的成功覆盖进度。

视频标题、简介、字幕和关键画面是不同材料范围。完整字幕仍不等于已理解全部画面；字幕需区分作者提供、平台自动生成和其他转写来源，并保留语言、时间戳和完整度。

### 已核实的官方接口边界

- YouTube 的 [视频元数据接口](https://developers.google.com/youtube/v3/docs/videos/list)与 [字幕下载接口](https://developers.google.com/youtube/v3/docs/captions/download)具有不同权限。后者明确要求调用者有编辑相应视频的权限，因此官方元数据接口不能作为任意公开频道字幕都可读取的保证。
- TikTok 的 [Display API](https://developers.tiktok.com/doc/display-api-get-started)需要应用产品／权限配置与用户授权，读取授权用户的数据；[Research Tools](https://developers.tiktok.com/doc/research-api-faq)另有资格和项目审批要求，不能假设任意账号采集已获准使用。
- X 的 [官方计费文档](https://docs.x.com/x-api/getting-started/pricing)当前规定按使用量收费，不能把官方读取 API 视为免费运行前提。
- 微信的 [素材列表文档](https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Get_materials_list.html)与 [access token 文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html)本轮无法直接读取，此项标为待验证。设计中分开“本账号授权素材库”与“其他账号公开文章”，不假定素材接口支持任意公众号历史。

以上是接口与证据边界调查，不表示平台适配器已经实现。实施时按实际能力登记列表发现、正文、字幕、授权需求和覆盖完整度，不把同一平台所有读取方式混为一谈。

## 建议的来源处理原则

以官网、官方博客、官方项目发布记录和明确指定的负责人账号为原始依据；搜索结果用于发现入口，不能单独作为摘要的事实依据。

上游统一通过 RSS/Atom 取得，再转换为本站 JSON。无可用 RSS 时待配置，不改用网页或 API 直接抓取。无法访问的入口记录为失败或受限，仍未核实的入口记录为待核实；只有实际完成查询才能记录对应的覆盖范围。

## 实际 RSS 配置

2026-10-03 已登记全部关注对象。GitHub 发布记录使用官方 releases.atom，Claude Code 也改用发布订阅；OpenAI、Google DeepMind、Cursor、美团、Sam Altman 和 OpenAI YouTube 配置原生订阅。Anthropic、DeepSeek、Qwen、Meta、X 与 TikTok 配置 RSSHub 官方路由，默认公共实例存在 403/404 访问限制。智谱、Kimi、MiniMax、腾讯、Grok、Qoder、TRAE、ZCode 和 Dario 的有效 RSS 仍待登记。微信公众号具体账号订阅仍待核实。

下载网站的 public/data/subscriptions.opml 或运行 scripts/collect.py feeds --opml 文件名，管理兼容 RSS 阅读器中的订阅。统一 RSS 决策优先于上方早期多格式采集调查。
