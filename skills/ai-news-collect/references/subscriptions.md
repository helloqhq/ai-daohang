# RSS 订阅管理

所有平台共用一个 RSS/Atom 读取器。`url` 是原始网站／账号入口，`feed_url` 是原生或第三方订阅地址，二者分开。添加来源时仍先核实账号身份和转换订阅是否来自该账号。

原生 RSS 优先；没有原生 RSS 时配置已核实的转换服务。RSSHub 在 `config/collection.json` 用 `rsshub_base_url` 集中指定实例，各来源使用 `rsshub_route`；也可直接填写任意兼容服务的 `feed_url`。直接 feed_url 优先。公共实例可用性不保证，读取失败保留未覆盖起点，不转为直接抓网页。微信没有核实可用账号订阅时保留待配置。

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

OPML 与网站来源页便于订阅管理。离线导入仅处理同一订阅的 XML，不能推进在线订阅的完整覆盖进度。变更订阅地址后，旧成功状态不能证明新地址可用；脚本自动重新检查并保留必要补采起点。

RSS description/summary 默认 partial_text；content/content:encoded 是文字材料范围。视频订阅默认 metadata_only，完整文字也不代表视频画面理解。缺少关键内容或日期时 defer，不能从 URL 日期、版本号或发布时间相近的其他条目猜测事实。

订阅条目 ID 使用原文链接，材料指纹包含正文、标题、日期、URL、材料范围与预览标识。近期条目通过 ETag／Last-Modified 复查，更改后重新进入队列。有限 feed 未覆盖查询起点时保持 partial；RSS 不保证能找回服务已经丢弃的历史条目。
