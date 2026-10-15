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

## 2026-10-04 SEO 更新

- 发布提交 `3ef1fc0`，GitHub Pages 工作流 [37172540296](https://github.com/helloqhq/ai-daohang/actions/runs/37172540296) 成功。
- 首页增加中英文搜索标题与摘要、Open Graph、WebSite 站点名称结构化数据和沿用 `sr-only` 样式的 H1。品牌文案和可见布局不变；语言切换同步更新搜索元信息。
- 构建调用 `scripts/prerender.mjs`，与前端共用 `public/assets/render.js` 的原有卡片渲染逻辑，把当前北京时间近七天的前 18 条动态及摘要、关键点和原始来源写入发布首页。浏览器仍按当前日期加载 JSON，继续提供搜索、筛选、翻译、分页与详情；不生成筛选参数页或事件新页面。
- 当前首页 HTTP 200，含 18 条预渲染动态，与本地构建完全一致；三个法律／联系页面 HTTP 200 且 canonical 正确。robots 和两个 XML 地址 HTTP 200，XML 可解析，Googlebot 用户代理请求的站点地图与本地一致；不存在的地址返回真正的 404。
- 30 个 Python 测试和 23 个 JavaScript 测试通过，构建成功。固定同尺寸、同数据的修改前后首页截图 SHA-256 完全相同；搜索、中英文切换、键盘展开详情和 39 个信息源视图已验证。
- Search Console 首页检查已显示最近抓取时间为 `2026年10月4日 00:11:26`，Googlebot 智能手机版抓取成功、允许抓取及索引；用户和 Google 选择的规范网址一致。该抓取发生在本次 SEO 发布前。总览报告仍停留在 `2026/9/21`，其中已索引 1 页、未索引 408 页为旧站历史状态，不能据此判断新站覆盖情况。
- 本次重新提交 `/sitemap_index.xml` 后，后台已经识别为“站点地图索引”，上次读取时间 `2026年10月4日`，状态“成功”。重新提交 `/sitemap.xml` 获得成功提交回执，但列表暂时仍为“无法抓取”；索引已发现网页数暂为 0，继续以处理后的读取状态和网页数为准。

- 本次发布后于北京时间 11:00 运行首页“测试实际网址”，Google 明确返回“网址可编入 Google 索引”。随后请求重新索引，后台回执为“已请求编入索引”，并确认加入优先抓取队列。这是针对已发布 SEO 版本的新请求，未重复提交同一版本。

预渲染与站点名称依据 [Google JavaScript SEO 说明](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) 和 [Google 站点名称说明](https://developers.google.com/search/docs/appearance/site-names)。Google 决定最终抓取、索引和搜索展示时间，提交回执与实时检测通过不代表新内容已经完成索引更新。

## 2026-10-07 索引提交更新

- 站点地图提交 `31bc7e2` 已发布；GitHub Pages 工作流 [37494787594](https://github.com/helloqhq/ai-daohang/actions/runs/37494787594) 完成且成功。正式域名的 `sitemap.xml` 与 `sitemap_index.xml` 已核对包含本次 `lastmod` 更新。
- 测试通过：41 个 Python 测试、32 个 JavaScript 测试；构建成功。站点地图继续包含四个规范页面，计费方案 `#pricing` 使用首页网址。
- Chrome 中 Google Search Console 的 `https://go2-ai.com/` 资源已登录。本轮重新提交 `sitemap.xml` 后，新的只读页面确认后台提交日期已更新为 `2026年10月7日`，状态为“成功”，已发现四个网页。上次读取时间仍显示 `2026年10月4日`，不能宣称本轮内容已重新读取。已有 `sitemap_index.xml` 继续显示“成功”并指向同一文件，未重复提交。
- 本轮 Google 首页检查确认“网址已收录到 Google”，最近抓取时间为 `2026年10月4日 11:04:18`，抓取及索引均允许，用户与 Google 选择的规范网址一致。本轮请求重新编入索引已取得“已请求编入索引”回执，确认网址加入优先抓取队列；这不代表 10 月 6 日内容已完成重新抓取。
- Chrome 中 Bing Webmaster Tools 已有 `go2-ai.com/` 资源。本轮新提交 `sitemap.xml`，并重新提交旧 `sitemap_index.xml`；列表已记录这两次提交，均显示“正在处理”。后台提交日期显示 `2026/10/6`，操作发生在北京时间 10 月 7 日；不将处理队列状态写成读取或索引更新完成。
- Bing 首页检查显示“已成功编制索引”，最近尝试爬网时间为 `29 Sept 2026 在 04:21`，早于当前静态站更新。北京时间 10 月 7 日 `00:14` 的实时测试显示“该 URL 可以由必应编制索引”及“未找到 SEO/GEO 问题”。旧缓存中的多个 H1、图片 alt 等提示不代表实时测试结果。
- 本轮 Bing 首页重新索引请求已完成，确认窗口中的网址为 `https://go2-ai.com/`；提交后页面明确显示“已请求编制索引。”。该回执不代表新内容已重新抓取或索引更新完成。
- Chrome 扩展控制连接持续无响应，原生截图为空白；上述操作通过 Chrome 原生窗口完成。Google 原提交窗口长时间停在“正在提交站点地图”，通过新的只读页面确认后台已记录本轮成功提交，未重复发送请求；原窗口随后也明确返回“已成功提交站点地图”。后续以搜索引擎更新后的读取时间、抓取时间和索引报告为准。
