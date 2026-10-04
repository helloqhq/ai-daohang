# AI 简报 · AI 信息聚合

正式域名：`go2-ai.com` · [项目仓库](https://github.com/helloqhq/ai-daohang)

纯静态中英文 AI 信息站。统一通过 RSS / Atom 订阅官方与已核实负责人信息，由用户已有 AI agent 调用采集 skill，筛选并整理中英文两份内容后产出 JSON。网站本身不抓取上游、不调用模型。采集按需执行，首版没有定时任务。

完整流程：**登记订阅 → 拉取 RSS → agent 判断与双语编辑 → 校验 JSON → 本地预览 → 推送仓库 → GitHub Actions 发布 → 检查线上快照**。

## 页面与筛选

首页使用深色紧凑列表，点击标题原位展开详情，时间按北京时间显示到小时。关注对象按「模型／Agent／平台／名人」分组，每组下平铺具体对象；平台通过对象的 `kind: api_platform` 区分，名人根据动态原始来源的 `person_id` 匹配。每个对象归属一个分组，动态可以同时关联模型、工具和人物。来源只有日期时保留原始精度。

“信息源”导航及无动态时的采集覆盖入口默认隐藏；在 URL 中添加 `?showSources=1` 后显示（已有参数时使用 `&showSources=1`）。

## 本地使用

要求 Python 3.11+；采集、预览与构建只用标准库。Node.js 20+ 用于前端行为测试及 npm 便捷命令，无需 `npm install`。以下命令均在项目根目录执行。

```sh
npm run dev
# 浏览器打开 http://localhost:4173
npm test
npm run validate
npm run build
```

不用 npm 也可预览：`python3 -m http.server 4173 --directory public`。构建输出 `dist/`，仅复制公开页面和校验通过的数据；线上发布以此目录为准。

## 订阅配置与管理

### 配置文件分工

| 文件 | 管理内容 |
| --- | --- |
| `config/entities.json` | 模型厂商与 Agent 关注对象：稳定 ID、名称、分类、别名、启用状态 |
| `config/sources.json` | 每个订阅的原始入口、RSS 地址或 RSSHub 路由、关联对象、身份核实依据；`people` 登记负责人 |
| `config/platforms.json` | YouTube、TikTok、X、Threads、微信公众号等媒体分类；登记平台不等于已订阅具体账号 |
| `config/collection.json` | 首次回溯、增量重叠、超时、并发、缓存、RSSHub 实例、解析与编辑规则版本 |

所有来源使用 `adapter: rss`，RSS 与 Atom 共用采集器。`url` 是原始官网／账号入口，`feed_url` 是实际订阅地址，两者用途不同。采集器只读 RSS/Atom；无原生订阅的官网和社交页面由独立的按需转换脚本生成本地 RSS，视频不下载。

订阅方式按以下顺序选择：

1. **官方原生 RSS / Atom**：填写 `feed_provider: native` 和 `feed_url`。GitHub Releases 统一订阅对应仓库的 `releases.atom`。
2. **RSSHub 转换订阅**：填写 `feed_provider: rsshub`、`rsshub_route` 和路由核实依据；完整地址由 `config/collection.json` 中的 `rsshub_base_url` 拼接。当前实例为 `https://rsshub.app`。若同时填写 `feed_url`，脚本优先使用该直接地址。
3. **其他转换服务**：填写服务实际提供的 `feed_url`，记录 `feed_provider`、原始入口与核实依据；采集器只读取其 RSS / Atom 输出。
4. **按需离线转换**：配置 `feed_provider: offline`、`feed_url: null` 和 `offline_conversion: true`，运行独立转换器后导入本地 RSS，见 [离线 RSS 操作说明](docs/OFFLINE-RSS.md)。Google 原生订阅可同时用转换器补足正文。
5. **暂无可用订阅**：保留 `feed_url: null`、`feed_provider: pending` 和 `subscription_note`，等待核实后接入。

### 当前各数据源

以下清单对应 2026-10-03 的配置：39 个来源，18 个保留在线订阅，21 个使用按需离线转换。转换器覆盖 22 个目标（包括 Google 正文补充）；新增 Tibo 的 X 已检查并成功生成 RSS，TikTok 和 Threads 仍受限。**已配置不代表可读取或已完成判断**；实时配置看 `config/sources.json`，每轮采集结果看 `public/data/coverage.json` 和网站来源页。RSSHub 公共实例存在访问受限或路由不可用的情况。

#### 模型厂商、品牌与服务平台

离线行列出转换用的原始入口；生成的 RSS 位于 `.collector/converted/`，不发布到网站、不写入 OPML。

| 关注对象 | 来源 ID | 订阅地址／接入方式 |
| --- | --- | --- |
| OpenAI | `openai-official` | 原生：`https://openai.com/news/rss.xml` |
| Anthropic | `anthropic-official` | 按需离线转换：[Anthropic 官方新闻](https://www.anthropic.com/news) |
| Google DeepMind | `google-official` | 原生：`https://deepmind.google/blog/rss.xml` |
| DeepSeek | `deepseek-official` | 按需离线转换：[DeepSeek API 更新](https://api-docs.deepseek.com/updates) |
| Qwen | `qwen-official` | 按需离线转换：[Qwen 官方博客](https://qwen.ai/blog) |
| 智谱 | `zhipu-official` | 按需离线转换：[智谱模型发布](https://docs.z.ai/release-notes/new-released) |
| 月之暗面 | `moonshot-official` | 按需离线转换：[Kimi 研究博客](https://www.kimi.com/en/blog/) |
| MiniMax | `minimax-official` | 按需离线转换：[MiniMax 官方博客](https://www.minimax.io/blog) |
| 腾讯 | `tencent-official` | 按需离线转换：[腾讯混元](https://hunyuan.tencent.com/) |
| 美团 | `meituan-official` | 原生：`https://tech.meituan.com/atom.xml` |
| Grok | `grok-official` | 按需离线转换：[Grok 官方新闻](https://x.ai/news) |
| Meta | `meta-official` | 按需离线转换：[Meta AI 博客](https://ai.meta.com/blog/) |
| OpenRouter（模型服务平台） | `openrouter-official` | 原生：`https://openrouter.ai/blog/feed.xml`；[官方博客订阅入口](https://openrouter.ai/blog/all/) |

OpenRouter 关注平台功能、API、价格及可用性的重要变化，普通教程与宣传按编辑规则过滤。它按 `category: model` 进入模型筛选，`kind: api_platform` 区分其平台身份；博客订阅不代表完整监测所有上架模型及价格。

#### Agent 应用

| 关注对象 | 来源 ID | 订阅地址／接入方式 |
| --- | --- | --- |
| Codex | `codex-releases` | `https://github.com/openai/codex/releases.atom` |
| Claude Code | `claude-code-changelog` | `https://github.com/anthropics/claude-code/releases.atom` |
| Cursor | `cursor-official` | `https://cursor.com/changelog/rss.xml` |
| Gemini CLI | `gemini-cli-releases` | `https://github.com/google-gemini/gemini-cli/releases.atom` |
| DeepSeek Harness | `deepseek-harness-releases` | `https://github.com/deepseek-ai/deepseek-harness/releases.atom` |
| Hermes | `hermes-releases` | `https://github.com/NousResearch/hermes-agent/releases.atom` |
| OpenCode | `opencode-releases` | `https://github.com/anomalyco/opencode/releases.atom` |
| Copilot | `copilot-releases` | `https://github.com/github/copilot-cli/releases.atom`（当前覆盖 CLI） |
| Qoder | `qoder-official` | 按需离线转换：[Qoder 更新](https://docs.qoder.com/release-notes/qoder) |
| Pi | `pi-releases` | `https://github.com/earendil-works/pi/releases.atom` |
| TRAE | `trae-official` | 按需离线转换：[TRAE 中文版更新](https://docs.trae.cn/ide_changelog) |
| ZCode | `zcode-official` | 按需离线转换：[ZCode 更新](https://zcode.z.ai/en/changelog) |
| MiniMax Code | `minimax-code-releases` | `https://github.com/MiniMax-AI/minimax-code/releases.atom` |
| DeepTutor | `deeptutor-releases` | `https://github.com/HKUDS/DeepTutor/releases.atom`；[官方项目](https://github.com/HKUDS/DeepTutor) |

#### 负责人及媒体账号

此表只列具体博客、频道或账号；媒体平台的接入方法见下一节。

| 负责人／账号 | 平台 | 来源 ID | 当前订阅 |
| --- | --- | --- | --- |
| Sam Altman 博客 | 网站／博客 | `sam-altman-blog` | 原生：`https://blog.samaltman.com/posts.atom`；关联 `person_id: sam-altman` |
| Tibo（Thibault Sottiaux） | X | `tibo-x` | 按需离线转换：[X @thsottiaux](https://x.com/thsottiaux)；关联 OpenAI 与 Codex，公开列表有限，不代表完整覆盖 |
| Dario Amodei 博客 | 网站／博客 | `dario-blog` | 按需离线转换：[Dario Amodei 个人博客](https://www.darioamodei.com/)；只标月份，不补造日期 |
| 马斯克 Elon Musk | X | `elon-musk-x` | 按需离线转换：[马斯克 Elon Musk · X](https://x.com/elonmusk)；公开列表有限，不代表完整覆盖 |
| 扎克伯格 Mark Zuckerberg | Threads | `mark-zuckerberg-threads` | 按需离线转换：[扎克伯格 Mark Zuckerberg · Threads](https://www.threads.net/@zuck)；匿名页未提供帖子列表，仍受限 |
| 黄仁勋 Jensen Huang | 网站／博客 | `jensen-huang-blog` | 原生：`https://blogs.nvidia.com/blog/author/jen-hsun-huang/feed/`；仅本人署名文章；关联 `person_id: jensen-huang` |
| Demis Hassabis | X | `demis-hassabis-x` | 按需离线转换：[Demis Hassabis · X](https://x.com/demishassabis)；公开列表有限，不代表完整覆盖 |
| Jeff Dean | X | `jeff-dean-x` | 按需离线转换：[Jeff Dean · X](https://x.com/JeffDean)；公开列表有限，不代表完整覆盖 |
| OpenAI 官方频道 | YouTube | `openai-youtube` | 原生：`https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A` |
| OpenAI 官方账号 | X | `openai-x` | 按需离线转换：[OpenAI X](https://x.com/OpenAI)；公开列表有限，不代表完整覆盖 |
| ZCode 官方账号 | X | `zcode-x` | 按需离线转换：[ZCode X](https://x.com/zcode_ai)；公开列表有限，不代表完整覆盖 |
| OpenAI 官方账号 | TikTok | `openai-tiktok` | 按需离线转换：[OpenAI TikTok](https://www.tiktok.com/@openai)；匿名页未提供帖子列表，仍受限 |

新增人物于 2026-10-03 按官方资料核实身份与账号，依据见 [来源登记](docs/SOURCE-REGISTRY.md)。已核实负责人的 AI 一手预告、观点、产品进展及简短状态通报均可保留；缺少回复上下文时按本人表述报道，不补写未知背景。NVIDIA 与 Discovery Loop 当前分别只订阅黄仁勋署名文章与 Jeff Dean 账号，不代表公司全部渠道。

2026-10-03 已按确认方案接入离线转换。混元使用公开文章接口，X 读取公开页面中的帖子数据，TikTok 与 Threads 已尝试但匿名页无帖子列表。Dario 的 6 篇文章已补齐全文，原文仅标月份；美团改用有 `updated` 时间的官方 Atom，不能把更新时间当成首次发表时间。Google 解析器忽略 MRSS 附件，并通过离线 RSS 补足文章正文。第三方过期 feed 和受限公共 RSSHub 不再作为这些来源的当前接入方式。离线导入保留未覆盖起点，不推进在线完整获取或审阅时间；操作与限制见 [离线 RSS 说明](docs/OFFLINE-RSS.md)。

#### 媒体平台接入方法

YouTube、TikTok、X、Threads、微信公众号都是媒体平台，在 `config/platforms.json` 中登记。`sources.json` 的每个来源对应具体频道、账号或公众号，不为平台本身创建独立信息源。一个关注对象可在多个平台分别订阅。

| 平台 | 平台 ID | 新增订阅的方法 |
| --- | --- | --- |
| YouTube | `youtube` | 核实具体频道的官方身份与 channel ID，配置该频道原生 RSS |
| TikTok | `tiktok` | 核实具体账号，配置实际可用的 RSSHub 路由或转换服务订阅 |
| X | `x` | 核实具体账号，配置实际可用的 RSSHub 路由或转换服务订阅 |
| Threads | `threads` | 核实具体账号；RSSHub 路由 `/threads/用户名`，需检查实例可读性 |
| 微信公众号 | `wechat` | 核实具体公众号身份及转换服务 RSS 地址，以公众号名称登记来源；目前尚无已登记的具体公众号订阅 |

增加负责人时，先在 `people` 登记身份与关联对象，再为每个博客／媒体账号分别登记来源。通过官网反链、官方团队介绍或官方项目依据核实身份与账号后，才能设置 `verification: verified`。新增媒体账号时，参考 `feed_route_verification_url` 核实转换服务路由，并检查实际可读性；尚未取回 RSS 时保留检查说明，不能仅凭路由存在宣称列表、正文或覆盖已可用。

YouTube 和 TikTok 的标题、简介属于视频元数据。只有订阅实际提供正文或字幕时，才能据其内容总结；记录 `metadata_only`、`partial_text` 或 `full_text`，没有字幕不声称已经总结完整视频。

### 新增、修改、停用订阅

先在 `entities.json` 登记新关注对象（已有对象无需重复添加），再将来源加入 `sources.json` 的 `sources` 数组。以下为字段模板，替换示例后使用：

```json
{
  "id": "example-releases",
  "name": "示例应用发布",
  "entity_ids": ["已登记对象ID"],
  "url": "https://github.com/owner/repo/releases",
  "adapter": "rss",
  "platform": "github",
  "feed_provider": "native",
  "feed_url": "https://github.com/owner/repo/releases.atom",
  "enabled": true,
  "verification": "verified",
  "verification_url": "https://官方身份与账号核实依据",
  "capabilities": {
    "list": true,
    "text": true,
    "captions": false,
    "complete_window": false
  }
}
```

`capabilities` 按实际材料填写，不能因地址存在就宣称完整覆盖。修改订阅地址后，旧地址的覆盖进度会失效，下一轮重新检查并保留断档；同一来源保留原 ID。临时停用设 `enabled: false`，保留来源登记和已发布历史；停用整个对象则修改 `entities.json` 中对应开关。

```sh
# 检查配置是否可解析、列出实际拼接后的订阅地址；此命令不测试网络可达性
python3 scripts/collect.py feeds
# 配置变更后重新生成公开目录、覆盖状态和 OPML；此命令不采集
python3 scripts/collect.py refresh
python3 scripts/collect.py validate
# 导出本地订阅清单，可导入支持 OPML 的 RSS 阅读器
python3 scripts/collect.py feeds --opml /tmp/ai-news-subscriptions.opml
```

公开 OPML 在 `public/data/subscriptions.opml`，网站来源页也可下载。OPML 只包含启用且已配置地址的来源，不证明这些地址可用。配置属于构建输入，网站读取的是公开 `catalog.json`；只修改配置而未 `apply` 或 `refresh`，页面不会得到新的订阅目录。

## 按需采集、翻译与更新

### 通过 skill 完成一次更新

采集 skill 位于 [skills/ai-news-collect/SKILL.md](skills/ai-news-collect/SKILL.md)，本机已安装在 `~/.codex/skills/ai-news-collect`。在 AI agent 中调用：

```text
$ai-news-collect
更新 /Users/qhq/Downloads/code/ai-daohang 的全部启用来源。
按默认增量规则采集，补采失败断档；筛选重要事件，在同一 JSON 中输出中英文标题、摘要、关键点和入选理由，
生成并校验本地 JSON，报告剩余待核查材料和来源覆盖情况。
```

在新机器上，可让 agent 读取项目内的 `SKILL.md` 并按其流程执行；也可在 Codex 技能目录尚无同名项时，从项目根目录安装符号链接，再重新加载技能：

```sh
mkdir -p ~/.codex/skills
ln -s "$PWD/skills/ai-news-collect" ~/.codex/skills/ai-news-collect
```

skill 只负责本地采集与 JSON 更新，不推送、不部署。Python 脚本负责获取、解析、缓存和校验；**重要性判断、双语整理与归纳由正在运行的 agent 完成**，单独执行 `fetch` 不会自动生成双语新闻。

### 脚本流程与手动操作

1. 拉取启用且身份已核实的 RSS / Atom，查看各来源结果。

   ```sh
   python3 scripts/collect.py fetch
   # 可选：只更新指定关注对象（参数是 entity ID，不是 source ID）
   python3 scripts/collect.py fetch --entities codex trae zcode minimax-code
   ```

   每个来源首次回溯最近 **3 天**；后续从其完整获取进度向前重叠 **48 小时**，遇到断档自动向前补采。参数在 `config/collection.json`。公共订阅可能只保留最近若干条，补采会重试，但不能保证恢复上游已删除的历史。

2. 查看候选，按材料 ID 读取证据；长文可分段。

   ```sh
   python3 scripts/collect.py queue --offset 0 --count 20
   python3 scripts/collect.py read 材料ID --offset 0 --characters 6000
   ```

   `queue`、`read` 返回 `next_offset`；只读翻页时依此继续。每批 `apply` 后队列会缩小，应重新从 `offset 0` 查看，避免跳过材料。已经明确 `defer` 的材料会继续出现，可记录其 ID 后继续检查其他候选，避免反复处理同一待核查项。分页和分段用于节省上下文，没有 token 预算或候选总量限制。

3. agent 对照 `public/data/index.json` 与相关月份历史，按发布对象、版本和阶段去重，生成本地 `.collector/decisions-packet.json`。格式见 [处置包说明](skills/ai-news-collect/references/packet.md) 和 [事件 schema](schemas/event.schema.json)。

   | 判断 | 用法 |
   | --- | --- |
   | `keep` | 重要产品变化或已核实负责人的 AI 一手动态；有日期和支持当前表述的原文，关联事件 ID，填写中英文标题、摘要、关键点、入选理由及原文链接 |
   | `reject` | 宣传、重复、小调整等不入选内容；记录中文理由，供后续复用 |
   | `defer` | 发布时间、正文、变更说明或其他证据不足；写清缺少什么，下轮仍待核查 |

   保留模型发布、显著能力／API／价格／可用性变化、Agent 重要功能与兼容性变化、关键修复。厂商宣称保留归属和限制条件；预览及一手预告标 `preview`，负责人观点标 `opinion`。不凭版本号猜重要性，不用采集时间替代发布时间，不依据标题扩写正文。

   已核实负责人的 AI 一手动态采用更宽的标准，保留简短预告、观点、产品改进、反馈、调查、重置和修复状态。不因文字短、宣传口吻、缺模型名或父帖上下文而过滤／暂缓；以“某人表示”等表述明确归属，摘要只覆盖取得的原文。当前调查和状态通报标 `update`；无 AI 信息的纯互动、范围外内容与准确重复仍过滤，身份、日期或实际文字无法核实时仍待核查。完整规则见 [采集技能](skills/ai-news-collect/SKILL.md)。

4. 应用判断并校验公开快照。

   ```sh
   python3 scripts/collect.py apply .collector/decisions-packet.json
   python3 scripts/collect.py refresh
   python3 scripts/collect.py validate
   python3 scripts/collect.py queue
   ```

   `apply` 合并既有历史并生成快照；其后 `refresh` 可统一刷新目录和覆盖信息，无新增事件时也可单独执行。全部候选都被过滤时仍提交 `decisions`，`events` 可为空。`refresh` 不代替判断。校验失败不会覆盖有效快照，按错误修正处置包后重新应用。

同次发布的多来源归并为一条事件，不同版本、预告和正式发布分别保留并可关联。事件 ID、`first_collected_at` 保持稳定；实质更正更新 `updated_at` 并追加带原因、依据链接的 `corrections`，避免重复创建或覆盖更正历史。具体字段见 [数据契约](docs/DATA-CONTRACT.md)。

### 失败补采、离线导入与进度判断

日常更新直接再次执行 `fetch`，它自动利用上次进度和 `uncovered_from` 重试。若只修复某个对象的来源，可用 `--entities` 限定范围；目前没有按 source ID 拉取的参数。修改 RSSHub 实例地址、修复路由或填写新的 RSS 地址后，再执行正常流程。

确需指定更早回溯起点时使用带时区的时间，例如：

```sh
python3 scripts/collect.py fetch --entities openai --since 2026-09-30T00:00:00Z
```

不要每轮重置 `--since` 或删除 `.collector/`。该目录保存增量进度、材料、判断指纹、网络缓存和运行报告；迁移采集机器时需通过私下方式保留它，避免丢失补采断档。已有判断在材料、解析版本或编辑规则变化时重新进入处理范围；变更编辑标准时递增 `rules_version`，变更解析逻辑时同步调整 `parser_version`。

当本地无法联网，但已从**同一订阅地址**取得真实 RSS / Atom XML 时，可以导入文件，再执行 `queue → read → apply → validate`：

```sh
python3 scripts/collect.py import-feed openai-official /tmp/openai-feed.xml \
  --since 2026-09-30T00:00:00Z --until 2026-10-03T00:00:00Z
```

离线导入不会推进在线来源的完整覆盖进度。订阅只含摘要或视频简介时，应接入提供正文／字幕的可核实订阅；首版不自建常驻转换服务。转换服务所需账号凭据由其私有环境管理，不写入公开配置、订阅 URL 或 JSON。

| 状态／字段 | 含义与处理方法 |
| --- | --- |
| `success` | RSS 条目满足采集器的查询时间窗检查；仍需查看待判断数量，不表示全部内容已编辑或涵盖整个官网／账号 |
| `partial` | 历史条目有限或日期未知，完整时间窗未确认；保留断档，补充可核实订阅材料 |
| `blocked` | HTTP 401／403／429 等访问受限；检查订阅服务权限、限流或更换可用实例 |
| `failed` | 超时、404、无效 XML 等读取失败；查看 `note`，修复地址或服务后重试 |
| `not_attempted` | 身份待核实、订阅待配置或尚未检查；先补配置和核实依据 |
| `fetched_through` | 该订阅已完整获取的时间窗终点；失败或部分读取不推进它 |
| `reviewed_through` | 已完成判断的时间窗终点；仍有待核查材料时不推进 |
| `uncovered_from` | 未覆盖区间的起点，下一轮自动据此补采 |
| `pending_count` | 尚未完成有效 `keep`／`reject` 判断的材料数量，包含 `defer` |

内部详细状态在 `.collector/state.json`，每轮报告在 `.collector/runs/`；公开状态需通过 `apply` 或 `refresh` 更新到 `public/data/coverage.json`。JSON 的生成时间只说明快照生成，不能当作所有来源均已完成更新的证明。失败或待核查时如实保留缺口，不写成“没有重要更新”。

## 页面与公开数据

页头支持中文 / EN 切换，首次访问默认中文，记住主动选择。可通过 `?lang=zh` / `?lang=en` 分享对应语言链接；URL 参数优先于已保存的偏好。界面、详情、来源说明与辅助阅读标签随语言切换，保留当前筛选。关键词同时检索两种语言，不依赖在线翻译服务。

事件在同一 JSON 记录中保存必填 `title_zh/en`、`summary_zh/en`、`key_points_zh/en` 和 `importance_reason_zh/en`。来源目录的英文名称和订阅说明在配置中维护，采集 skill 必须产出双语文案；字段完整性由校验脚本检查。

首页默认最近 7 天，支持模型／Agent、关注对象、类型、关键词及自定义日期筛选。重要历史永久保留，按月份按需加载；详情展示原文、多来源、关联与更正。只发布有真实材料支持的内容。

| 公开文件 | 用途 |
| --- | --- |
| `public/data/index.json` | 总事件数、月份索引、事件位置、生成时间和快照版本 |
| `public/data/events/YYYY-MM.json` | 每月中英文事件与共用来源依据 |
| `public/data/catalog.json` | 关注对象、来源、负责人及平台目录 |
| `public/data/coverage.json` | 来源获取与判断进度、待处理数量、失败和断档说明 |
| `public/data/subscriptions.opml` | 启用且已配置的订阅清单 |

所有 JSON 使用相同 `snapshot_id`，网页发现版本不一致会提示刷新。通过 `apply`／`refresh` 统一生成并发布整套 `public/data/`，不要只替换某个月文件。`.collector/`、原文缓存、账号凭据和处置包不提交公开仓库，也不进入部署产物。

## 免费发布与上线检查

### 每次更新后发布

采集完成只更新本地文件；发布另行执行。当前公开仓库使用免费 GitHub Pages，`.github/workflows/pages.yml` 在 `main` 分支推送或手动触发时依次 **运行测试 → 校验并构建 → 上传 `dist/` → 部署**。工作流不运行采集、不调用模型、不创建定时任务。

先预览首页、历史和来源页，确认中英文内容、原文链接、待配置与失败提示正确，再检查并提交本次变更：

```sh
python3 scripts/collect.py validate
npm test
npm run build
git status --short
git diff --stat
git diff -- public/data config
# 普通数据更新提交整个公开数据快照
git add public/data
# 本轮确有订阅或采集参数变更时，再加入配置
git add config
git diff --cached --stat
git diff --cached
git commit -m "Update AI news snapshot"
git push origin main
```

代码、skill 或文档有修改时，另行加入对应文件并检查暂存内容；`dist/` 由 Actions 生成，不提交。`.collector/` 已在 `.gitignore` 中排除，不使用强制添加将内部缓存公开。

在仓库 **Actions → Publish static website** 查看本次提交的 `build`、`deploy` 是否成功。需重新部署已提交内容时，点击 **Run workflow** 并选择 `main`；手动运行不会采集新信息，也不会发布本地尚未提交的文件。失败时先检查对应步骤日志，修复后重新推送或重跑。

### 独立域名与验收

正式域名为 `go2-ai.com`，从域名根目录访问。仓库 **Settings → Pages → Source** 使用 GitHub Actions，**Custom domain** 设置 `go2-ai.com`。Actions 模式由 Pages 设置保存域名，构建不生成 `CNAME` 文件。资源和 JSON 使用相对路径，兼容根目录与项目子路径。

域名由阿里云管理，已配置四条根域 GitHub Pages A 记录和 `www → helloqhq.github.io`；DNS、邮件记录保留及 HTTPS 设置详情见 [独立域名部署记录](docs/DEPLOYMENT.md)。截至 2026-10-03 最近一次检查，DNS 已配置，HTTPS 证书仍待签发；证书可用后在 Pages 启用 **Enforce HTTPS**。日常发布新闻无需修改 DNS。

部署成功后检查：

1. 打开 `https://go2-ai.com/`，确认域名证书正常、页面和静态资源可加载；HTTPS 尚未签发时不能将 HTTPS 上线标为完成。
2. 查看 `https://go2-ai.com/data/index.json`，将其 `snapshot_id` 与本地 `public/data/index.json` 比较，确认发布的是本次快照。
3. 检查 `data/catalog.json`、`data/coverage.json` 与索引列出的月份 JSON，确认 `snapshot_id` 一致；检查 `data/subscriptions.opml` 可下载。
4. 在页面核对新增／更正事件、日期筛选、历史月份和来源状态；若加载到旧数据，刷新后再检查 Actions 运行对应的提交。

数据出错时先修正材料或处置包并重新发布。需回退版本时通过 Git 恢复已知有效版本的**整套数据及对应配置**，校验后正常提交、推送，避免手动拼接不同快照。

## 进一步说明

[计划](docs/PLAN.md) · [数据契约](docs/DATA-CONTRACT.md) · [来源登记](docs/SOURCE-REGISTRY.md) · [采集 skill 设计](docs/SKILL-SPEC.md) · [采集流程](docs/COLLECTION-PIPELINE.md) · [RSS 订阅操作](skills/ai-news-collect/references/subscriptions.md) · [统一 RSS 决策](docs/adr/0003-rss-only-ingestion.md) · [部署与域名](docs/DEPLOYMENT.md)
