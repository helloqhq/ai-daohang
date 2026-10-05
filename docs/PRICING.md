# 计费方案

首页导航「计费方案」或 `/#pricing` 聚合三类数据：模型 API（每百万 tokens）、Token / Coding Plan 固定订阅、Agent 产品套餐。前端沿用原生 JavaScript、中英文切换与本地筛选，无第三方请求或依赖。

展示按厂商聚合，每个厂商下分别展示 API 模型及各订阅产品。同一 Token Plan 或 Agent 产品的档位共用一张表，对照价格、可用模型和额度；不因模型或产品名称相同而跨厂商、跨类别合并。模型列表超过 6 项时可展开全部，模型搜索包含折叠部分。

## 数据与核验

`public/data/pricing.json` 是独立于新闻采集快照的人工核验目录。2026-10-05 复核官方定价页 / 文档，当前共 67 项方案，其中 Agent 36 项；覆盖 OpenAI、Anthropic、Google、DeepSeek、Alibaba Cloud、Z.AI、MiniMax、Kimi、Cursor、GitHub、OpenCode、Pi、Cognition、Cline、Aider、Kilo、AWS。Agent 目录新增 23 项，包含 OpenCode 客户端与 Go / Go Plus、Pi、Devin / Windsurf、Gemini CLI、Cline、Aider、Kilo Code / Pass 和 Kiro。新闻采集替换快照时保留独立的 `pricing.json` 与 `pricing.xml`。

每项保留原币种、计费周期、适用地域 / 上下文 / 用量条件、双语说明、官方 HTTPS 来源和核验日期。API 的输入、输出、缓存读取、缓存写入采用每百万 tokens 的同一单位；缓存写入 TTL 等条件写在说明中。订阅额度维持官方口径，credits、请求数和 tokens 不互相换算，人民币和美元不按假定汇率合并。年付价格在明确核实的方案说明中保留。

非 API 项使用 `product_id` / `product_name` 标识所属产品、`tier_name` 标识档位。`supported_models` 列出该档位已核实的模型，`models_note_zh` / `models_note_en` 记录上下文、额外付费、客户端及组织策略限制；`models_source_urls` 和 `models_checked_at` 单独保留模型权益来源与核验日期。兼容某个 Agent 工具不代表包含该工具厂商的模型。

免费 Agent 使用 `billing: free` 且 `price.amount: 0`，页面和 RSS 显示「无订阅费」。OpenCode、Pi、Cline、Aider、Kilo Code 的客户端免费，自带 API Key（BYOK）、模型网关、已有订阅或云计算仍可能收费；模型系列在这些条目中表示连接能力，额度和具体型号由接入的提供商决定。Gemini CLI、Devin 和 Kiro 的免费档则有各自包含的用量上限，不能当作无限推理。

新增产品的核验入口与特殊口径：

| 产品 | 官方来源 | 收录口径 |
| --- | --- | --- |
| OpenCode Go | [Go 文档](https://opencode.ai/docs/go/) | Go $10/月、Go Plus $40/月；模型额度不同，5 小时 / 周窗口及超额 Zen 余额另见说明 |
| Pi | [官网](https://pi.dev/)及[提供商文档](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/providers.md) | MIT 客户端免费，推理另计 |
| Devin / Windsurf | [套餐](https://devin.ai/pricing)及[Devin Desktop 公告](https://cognition.com/blog/introducing-devin-desktop) | Windsurf 已升级为 Devin Desktop，共用产品表并保留 Windsurf 搜索；Teams 按 $80 基础费 + $40/完整开发席位，展示含 1 个完整席位的 $120/月起价 |
| Gemini CLI | [额度](https://geminicli.com/docs/resources/quota-and-pricing/)及[Google AI 定价](https://gemini.google/subscriptions/) | 免费 Google 登录、AI Pro、AI Ultra；美元为美国常规价，Ultra 文档未按 $99.99 / $199.99 两档区分 CLI 额度，需核对账号；API Key 与 Vertex AI 另计费 |
| Cline | [定价](https://cline.bot/pricing) | 个人开源客户端免费，模型推理另计；不从导航中的 ClinePass 名称推测未核实套餐 |
| Aider | [官方仓库](https://github.com/Aider-AI/aider)及[模型连接文档](https://aider.chat/docs/llms.html) | 开源终端工具免费，远程模型与本地算力自备 |
| Kilo Code / Pass | [定价](https://kilo.ai/pricing) | 平台、模型推理和云计算分开；Code Free / Teams 与 Pass 三档分别分组，月付奖励依账期与连续订阅规则变化 |
| Kiro | [定价](https://kiro.dev/pricing/)及[模型表](https://kiro.dev/docs/models/) | 免费和四个付费档；按档位模型表核验，不把仅企业预览可用的 Fable 放入个人套餐 |

Kimi 按档位区分 K3、1M 上下文和高速模型；Claude Pro 的 Fable 模型需要另购 usage credits，Max 也有 Fable 周额度上限。MiniMax 官方按模型类别描述图像 / 语音覆盖，说明保留该范围及排除项，不猜具体型号。Copilot 按月付权益核验，已退役且仅旧年付用户保留的 Sonnet 4.6 不列入；GPT-5.4 nano 的表格与脚注存在冲突，依脚注只在 Pro+ 中收录，并注明仅限 Codex VS Code 扩展。

`null` 表示价格未收录，不等于免费。GLM Coding Plan 额度已核验，完整档位结算价仍待核验，订阅价格保持 `null` / `pending`；2026-09-25 至 10-07 全天按非高峰半价扣 credits。Codex Pro $200 已恢复新订阅，采用较低的新额度；符合官方资格窗口的旧用户可在订阅有效期间沿用旧额度至 2026-10-29。Pro $500 包含 Astra Ultrafast，各档位用量以官方面板为准，不沿用旧的固定 Plus 倍数。同一模型的地域、上下文、优先级、时段价格可能不同，表格展示的基准条件在模型下方，其他已核实阶梯在「计费条件」中；它不是所有型号及价格维度的穷举。

`checked_at` 是定价核验日期；`updated_at` 是本站录入或实际修改该项内容的日期，不冒充厂商发布时间。定价或模型权益超过 30 天未核验标「需重新核验」。带 `valid_until` 的活动超过北京时间截止日期后标「活动已到期」，价格划线；重新核实后再修改数据，不能把旧活动价继续当成当前价格。

## 更新与 RSS

核实每项 `source_url` 的适用条件后编辑 JSON，更新相应 `checked_at`；价格、条件、状态等内容确实变化时同时更新 `updated_at`。目录顶层 `checked_at` 取最近核验日期，各项日期独立显示。官方内容无法确认时保留 `pending` 和说明，不猜价格。定价页若有原生 RSS，可通过现有来源登记和新闻队列跟踪公告；新闻采集仍保持 RSS-only，核验目录不替代新闻材料及处置包，也不增加直接抓取器。

```sh
npm run pricing:build
npm test
npm run build
```

`pricing:build` 校验数据并生成开发目录中的 `public/data/pricing.xml`；正式构建会再次校验并在 `dist/data/pricing.xml` 生成 RSS，同时预渲染计费表格。无新增服务或自动刷新任务。修改 JSON 后应一并提交重新生成的公开 RSS。

RSS 地址为 `https://go2-ai.com/data/pricing.xml`，首页提供发现链接。它是本站人工核验并发布后的当前计费快照，由本站生成，非厂商原生订阅，亦非完整价格变更历史。订阅项包含可用模型、权益说明与官方来源。每项的 GUID 包含方案 ID 和内容摘要；仅更改核验日期不会产生新 GUID，价格 / 条件 / 状态 / 模型权益变化会产生新的标识。发布前此地址仍是原网站的状态，须按既有发布流程部署后才可订阅新版。

测试覆盖价格和日期校验、重复 ID、空价格语义、厂商 / 产品分组、档位模型校验与搜索、双语内容、链接安全、北京时间活动截止、过期提示和 RSS 去重。
