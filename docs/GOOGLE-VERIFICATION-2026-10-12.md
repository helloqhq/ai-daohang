# Google 统计与所有权验证

核验日期：2026-10-12（北京时间）。本次由用户确认操作 `https://go2-ai.com/`，使用已打开的 Chrome 登录会话。

## 访问统计

- 沿用已有 GA4 媒体资源 `go2-ai.com`（资源 ID `485453410`）、网站数据流 `10521659944`，测量 ID `G-HGXR45VSBG`。Google 后台安装说明与网站 `public/assets/analytics.js` 使用的 ID 一致，无需重复添加代码。
- 保留现有 Cookie 同意机制：只有单独允许“访问统计”后才加载统计代码。验收前的 Chrome 网站标签页未允许统计，没有 Google 脚本且统计停用。
- 本次在该浏览器网站设置中单独允许“访问统计”后，`www.googletagmanager.com/gtag/js` 返回 200，`www.google-analytics.com/g/collect` 的 `page_view` 和 `scroll` 请求返回 204；请求测量 ID 均为 `G-HGXR45VSBG`。
- GA4 实时概览随后显示本站标题“AI 简报｜AI 模型、编程 Agent 与平台最新动态”浏览次数为 1，`first_visit`、`page_view`、`scroll`、`session_start` 各为 1，确认测试访问进入该资源。
- 请求被接收不等于历史报告已处理。本次没有更改全站统计同意策略。

## Search Console 所有权

- 用户提供的入口地址带 `sc-domain:utool.top`，但现有 Chrome 弹窗的验证对象为 `https://go2-ai.com/`。本次确认并验证的是 go2-ai.com 的网址前缀资源。
- 从 Google 验证弹窗下载原文件 `googleea1ae096c73c02af.html`，存放在 `public/`；文件内容为 `google-site-verification: googleea1ae096c73c02af.html`。
- 发布后正式地址 `https://go2-ai.com/googleea1ae096c73c02af.html` 返回 HTTP 200，响应内容与下载原文件逐字节一致。
- 点击“验证”后，Google 明确返回“已完成所有权验证”，验证方法为“HTML 文件”。随后进入资源地址 `https://search.google.com/search-console?resource_id=https%3A%2F%2Fgo2-ai.com%2F`。
- 为保持验证状态，后续发布必须保留该文件。此次未修改 DNS，未验证 utool.top。

## 构建与发布

- 站点地图生成器原先要求每个 HTML 文件具有 canonical，无法构建 Google 验证文件。现在仅跳过文件名符合 Google 验证格式且内容与文件名匹配的验证文件；普通内容页仍必须有 canonical。验证文件随 `public/` 原样复制到 `dist/`，不进入站点地图或 IndexNow 内容页列表。
- 回归测试覆盖有效验证文件不进入索引提交，以及同名普通 HTML 仍触发缺少 canonical 的错误。
- `npm test` 通过：52 个 Python 测试、35 个 JavaScript 测试；`npm run build` 成功，验证文件在构建输出中保持原样。
- 发布提交 `55ce0d9`；[GitHub Pages 工作流 38193121728](https://github.com/helloqhq/ai-daohang/actions/runs/38193121728) 完成且成功。
