# 按需离线 RSS

最新核查见 [2026-10-04 RSS 来源复核](RSS-RECHECK-2026-10-04.md)：4 个来源补齐订阅时间窗，Threads 恢复读取，Claude Code 切换官方全文 RSS；剩余限制逐项保留。

2026-10-03 按用户确认方案实施。采集器继续只读 RSS/Atom；独立转换器将已登记官方页面或公开接口转成本地 RSS。Python 标准库实现，无常驻服务、收费 API 或发布步骤。

## 操作

在项目根目录依次运行：

```sh
python3 scripts/convert_feeds.py
python3 scripts/collect.py import-converted .collector/converted/manifest.json
python3 scripts/collect.py queue
python3 scripts/collect.py read 材料ID
# agent 按编辑规则生成双语事件与处置包后执行
python3 scripts/collect.py apply /本地/packet.json
python3 scripts/collect.py validate
```

转换有失败项时退出码为 1，成功项仍有有效 RSS，可继续导入。不要用 `&&` 将转换成功作为导入的前提。导入清单先核对全部成功文件的来源 ID、原始入口、SHA-256 和时间窗；校验失败不开始导入。每次转换会替换清单，仅导入本次清单对应的文件。

限定来源与缓存重放：

```sh
python3 scripts/convert_feeds.py --sources tencent-official openai-x
python3 scripts/convert_feeds.py --offline
```

`--offline` 只读此前缓存，缺少页面会记录失败。默认时间窗沿用各来源的未覆盖起点，其次用已获取进度，首次回溯 72 小时；显式回溯可用 `--since`、`--until`。转换同时补读已有待审阅材料的正文，以便核对历史队列。转换器不会自动判断重要性或生成新闻。

原始缓存、RSS、清单和处置包均留在已忽略的 `.collector/`。21 个离线来源无公开订阅地址，不进入 OPML。Google 保留原生 RSS，离线转换仅补充正文。美团直接使用官方 `https://tech.meituan.com/atom.xml`；如需核对已有待审阅材料：

```sh
python3 scripts/collect.py import-feed meituan-official /本地/atom.xml --since 查询起点 --until 查询终点 --reconcile-existing
```

## 本轮能力与限制

| 来源 | 转换方式与限制 |
| --- | --- |
| Anthropic、Kimi、MiniMax、xAI、Meta | 官方文章列表与查询窗内文章正文；列表边界不能证明完整覆盖 |
| 智谱、DeepSeek、Qoder、TRAE、ZCode | 官方更新页分段；同页版本使用独立内容标识，保留真实链接 |
| Qwen | 公开文章检索接口的日期与正文 |
| 腾讯混元 | 官网公开文章接口；采用页面显示日期，保留日期精度 |
| OpenAI、ZCode、Elon Musk、Demis Hassabis、Jeff Dean、Tibo 的 X | 匿名页面提供的本人帖子、日期与文本；列表有限，文本按 partial_text 保存 |
| OpenAI TikTok、Zuckerberg Threads | 本轮匿名页面无帖子列表，记录 blocked；需可读取的登录态或订阅服务后才能继续 |
| Dario | 6 篇官方文章全文；只标月份，保留 date_label，发布时间仍未知 |
| Google DeepMind | 原生 RSS 发现条目，官方文章正文补充；MRSS 附件不会遮蔽 description |
| 美团 | 官方 Atom 提供全文与 updated；更新时间不等于首次发表日期 |

21 个转换目标中，本轮 19 个生成有效 RSS、2 个受限。转换成功与零条窗口内材料均不证明“没有更新”。离线导入不推进 `fetched_through` 或 `reviewed_through`，保留最早 `uncovered_from`；Google 的原生订阅覆盖另按在线获取结果计算。

只有月份的材料不得猜测具体日期。可确认整个月早于查询窗口的旧材料可按窗口外过滤；月份与窗口交叠的材料保留待核查。未知日不能写成新闻发布日期。原始 RSS/Atom、转换结果与编辑判断保留各自事实范围。

## 验证

```sh
npm test
npm run validate
npm run build
```

回归覆盖 MRSS 正文选择、Atom 更新时间、重复版本锚点、中文日期、匿名登录页、X 帖子归属、月份日期、全文容器、导入校验与在线覆盖边界。

本轮本地核对：各来源沿用自身补采起点，总体范围 2026-09-30T02:54:00.275982+00:00 至 2026-10-03T12:10:55.638187+00:00。共审阅 28 条材料，4 条证据归并为 2 条双语事件、23 条过滤、1 条待核查（Dario 的 September 2026 文章缺少具体日）。原有 14 条事件保留，当前共 16 条。该结果不消除离线来源的完整覆盖缺口。
