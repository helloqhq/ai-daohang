# 计费方案

首页导航「计费方案」或 `/#pricing` 聚合三类数据：模型 API（每百万 tokens）、Token / Coding Plan 固定订阅、Agent 产品套餐。前端沿用原生 JavaScript、中英文切换与本地筛选，无第三方请求或依赖。

展示按厂商聚合，每个厂商下分别展示 API 模型及各订阅产品。同一 Token Plan 或 Agent 产品的档位共用一张表，对照价格、可用模型和额度；不因模型或产品名称相同而跨厂商、跨类别合并。模型列表超过 6 项时可展开全部，模型搜索包含折叠部分。

## 数据与核验

`public/data/pricing.json` 是独立于新闻采集快照的人工核验目录。首批于 2026-10-05 核验官方定价页 / 文档，共 39 项方案；覆盖 OpenAI、Anthropic、Google、DeepSeek、Alibaba Cloud、Z.AI、MiniMax、Kimi、Cursor、GitHub。

每项保留原币种、计费周期、适用地域 / 上下文 / 用量条件、双语说明、官方 HTTPS 来源和核验日期。API 的输入、输出、缓存读取、缓存写入采用每百万 tokens 的同一单位；缓存写入 TTL 等条件写在说明中。订阅额度维持官方口径，credits、请求数和 tokens 不互相换算，人民币和美元不按假定汇率合并。年付价格在明确核实的方案说明中保留。

非 API 项使用 `product_id` / `product_name` 标识所属产品、`tier_name` 标识档位。`supported_models` 列出该档位已核实的模型，`models_note_zh` / `models_note_en` 记录上下文、额外付费、客户端及组织策略限制；`models_source_urls` 和 `models_checked_at` 单独保留模型权益来源与核验日期。兼容某个 Agent 工具不代表包含该工具厂商的模型。

Kimi 按档位区分 K3、1M 上下文和高速模型；Claude Pro 的 Fable 模型需要另购 usage credits，Max 也有 Fable 周额度上限。MiniMax 官方按模型类别描述图像 / 语音覆盖，说明保留该范围及排除项，不猜具体型号。Copilot 按月付权益核验，已退役且仅旧年付用户保留的 Sonnet 4.6 不列入；GPT-5.4 nano 的表格与脚注存在冲突，依脚注只在 Pro+ 中收录，并注明仅限 Codex VS Code 扩展。

`null` 表示价格未收录，不等于免费。GLM Coding Plan 额度已核验，公开促销价的结算周期条件不完整，订阅价格保持 `null` / `pending`；Codex Pro $200 标记 `paused`。同一模型的地域、上下文、优先级、时段价格可能不同，表格展示的基准条件在模型下方，其他已核实阶梯在「计费条件」中；它不是所有型号及价格维度的穷举。

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
