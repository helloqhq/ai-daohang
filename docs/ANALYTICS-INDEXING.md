# Google 统计与索引

核验日期：2026-10-04（北京时间）。正式站点：https://go2-ai.com/ 。

## Google Analytics

- 已有 GA4 媒体资源 `go2-ai.com`，测量 ID 为 `G-HGXR45VSBG`；实现位于 `public/assets/analytics.js`，首页和三个法律／联系页面通过共享 Cookie 控件加载。
- 访问统计默认关闭，在“Cookie 设置”中单独允许后加载 Google 代码。允许语言偏好不会允许统计；旧版语言存储同意不会授权统计。
- 关闭 Google 信号和广告个性化；统计 Cookie 有效期设为 180 天。撤回后停用采集并清除本站 `_ga`、`_ga_*` Cookie。到期或其他标签页撤回同意时同步停用；本地预览不向生产媒体资源发送数据。
- 中英文隐私说明已同步更新。测试浏览器已验证：未同意时无 Google 脚本、无统计 Cookie；单独同意后代码加载返回 200，`page_view` 采集请求返回 204；撤回后统计停用且相关 Cookie 清空。采集端点接收成功不等于历史报告已完成处理。

## Google 索引提交

- `robots.txt` 允许抓取并声明 `https://go2-ai.com/sitemap.xml`。
- 站点地图包含首页、隐私协议、免责声明和联系页面四个规范网址；四页均添加 canonical。信息流 JSON 与前端筛选参数不作为独立网页提交。
- 恢复旧站已有的 `/sitemap_index.xml`，改为指向新 `sitemap.xml`，保持旧 Search Console 提交入口可访问。
- 已在 `https://go2-ai.com/` 的 Search Console 资源中提交 `/sitemap.xml`；后台明确返回“已成功提交站点地图”。列表随后仍显示“无法抓取”，不能宣称 Google 已读取成功。直接访问 robots 和两种 XML 地址均返回 200，XML 可解析；该现象的具体原因尚未确定。
- 首页检查显示“网址已收录到 Google”，但 AMP、产品等增强信息来自旧站缓存。已请求首页重新编入索引，后台返回“已将网址添加到优先抓取队列中”。该回执不表示新内容已完成抓取或索引更新。
- 后续应在 Search Console 检查站点地图的上次读取时间、状态和已发现网页，以及首页新的抓取时间。按 Google 官方说明，重复请求同一网址不会加快处理。
- Bing 索引按用户后续指示本次跳过，未提交网址或站点地图。

## 验证与发布

`npm test` 通过：30 个 Python 测试和 20 个 JavaScript 测试；`npm run build` 成功。代码已推送 main，提交 `0ee8f97`、`760e7f9` 的 GitHub Pages 工作流均成功。正式域名的页面、统计脚本、共享隐私脚本和文案已核对与本地一致。

配置与提交方式依据 [Google Analytics 官方安装说明](https://support.google.com/analytics/answer/9304153) 和 [Google 重新抓取说明](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)。
