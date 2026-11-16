# RSS 订阅管理

所有平台共用一个 RSS/Atom 读取器。`url` 是原始网站／账号入口，`feed_url` 是原生或第三方订阅地址，二者分开。添加来源时仍先核实账号身份和转换订阅是否来自该账号。

每次调用按 [对象发现与信源维护](discovery.md) 自动补充、核实和修复范围内的来源；原生订阅兼容时只改配置，新增独立转换器须实现解析并通过验证。身份核实、订阅可用和完整覆盖分别判断，不需要用户逐项批准。计费价格／权益的官方证据按 [计费核验](pricing.md) 维护，不能由一个新闻订阅代替。

原生 RSS 优先；没有原生 RSS 时配置已核实的转换服务。RSSHub 在 `config/collection.json` 用 `rsshub_base_url` 集中指定实例，各来源使用 `rsshub_route`；也可直接填写任意兼容服务的 `feed_url`。直接 feed_url 优先。公共实例可用性不保证，读取失败保留未覆盖起点。采集器仍只读 RSS；经确认的独立离线转换器可读取官方页面／公开接口，输出私有 RSS。微信没有核实可用账号订阅时保留待配置。

## 故障诊断与修复

先分层定位，再改配置：DNS（`dscacheutil -q host -a name 域名`、`dig @1.1.1.1 域名 A`）、TCP/TLS（`curl -v -m 20`）、HTTP 状态、XML 可解析性。响应是登录页、HTML 或空 body 都不算有效订阅。单次超时、`403` 或 `429` 通常是本机网络或实例限流，不得据此停用来源；应换时间、换实例复测，并保留原未覆盖起点。原生订阅失败时，用同一路由的 RSSHub 结果与官方页面交叉核对标题、发布日期和原始链接，确认不是缓存或伪造内容后再切换。

```sh
# 逐条核对：状态、条目数、标题、日期、原始链接
curl -sS -m 20 -o /tmp/feed.xml -w '%{http_code} %{size_download}\n' 'https://实例/路由'
python3 - <<'PY'
import re
t=open('/tmp/feed.xml').read()
print((re.search(r'<title>(.*?)</title>',t,re.S) or [None,''])[1])
items=re.findall(r'<item>(.*?)</item>',t,re.S)
print('items',len(items))
for it in items[:2]:
    print((re.search(r'<title>(.*?)</title>',it,re.S) or [None,''])[1],
          (re.search(r'<pubDate>(.*?)</pubDate>',it,re.S) or [None,''])[1])
PY
```

切换时直接写 `feed_url`，设 `feed_provider: "rsshub"`，更新 `feed_checked_at` 与 `feed_verified_at`，并在 `maintenance` 里写明双语原因。改地址会清除旧 `fetched_through` 指纹，下次 `fetch` 会从 `uncovered_from` 补采；补采材料仍要逐条判断，不能因为“源刚修好”就全部保留。2026-11-16 的实例轮换可作示例：原 Threads 实例返回 503，YouTube 原生订阅超时，Google 开发者博客 TLS 被重置；`rsshub.liumingye.cn` 同时返回了 5 条 Threads 帖子、30 条 YouTube 视频和 10 篇带日期的 Google 开发者文章。公共实例会轮换，不要把某次可用的实例写死为永久保证。

官方路径本身也可能变化。Mistral 的订阅路径已从 `/rss.xml` 改为 `/news/rss`；本机 DNS 被污染、无法直接复核时，应注明证据来自公开订阅目录或第三方监控，并保留“待网络恢复后实测”的状态，而不是把未验证写成已验证。

离线转换器输出 XML 前必须过滤 XML 1.0 不允许的控制字符（例如 `0x05`），否则 `import-converted` 会在解析阶段整体失败。该项已由转换器的 `xml_safe()` 处理，并在 `tests/test_conversion.py` 留有回归用例；新增转换器应复用同一清洗步骤。

```json
{
  "id": "example-releases",
  "name": "示例发布订阅",
  "entity_ids": ["已登记对象ID"],
  "url": "https://github.com/owner/repo/releases",
  "adapter": "rss",
  "platform": "github",
  "feed_provider": "native",
  "feed_url": "https://github.com/owner/repo/releases.atom",
  "enabled": true,
  "verification": "verified",
  "verification_url": "https://官方身份依据"
}
```

```sh
python3 scripts/collect.py feeds
python3 scripts/collect.py feeds --opml /本地/subscriptions.opml
python3 scripts/collect.py fetch --entities codex
python3 scripts/collect.py import-feed 来源ID /本地/feed.xml --since 2026-09-30T00:00:00Z --until 2026-10-03T00:00:00Z
```

OPML 与网站来源页便于订阅管理。按需转换配置 `feed_provider: offline`、`feed_url: null`、`offline_conversion: true`；原生来源也可启用正文补充。操作见 [离线 RSS](../../../docs/OFFLINE-RSS.md)。转换、缓存重放及导入均无常驻服务。离线导入只处理对应已登记来源的 XML，不能推进在线订阅的完整覆盖进度。变更订阅地址后，旧成功状态不能证明新地址可用；脚本自动重新检查并保留必要补采起点。

RSS description/summary 默认 partial_text；content/content:encoded 是文字材料范围。视频订阅默认 metadata_only，完整文字也不代表视频画面理解。原文只有月份时保存 `date_label`，不补造日；Atom `updated` 保存为更新时间语义。缺少关键内容或日期时 defer，不能从 URL 日期、版本号或发布时间相近的其他条目猜测事实。

订阅条目 ID 默认使用原文链接；共享同一页面／锚点的多个版本使用转换 RSS 的稳定版本内容标识。材料指纹包含正文、标题、日期、URL、材料范围与预览标识。近期条目通过 ETag／Last-Modified 复查，更改后重新进入队列。有限 feed 未覆盖查询起点时保持 partial；RSS 不保证能找回服务已经丢弃的历史条目。
