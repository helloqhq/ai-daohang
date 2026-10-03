# 独立域名发布

正式域名：`go2-ai.com`。站点从 `https://go2-ai.com/` 根路径访问，静态托管仍采用免费 GitHub Pages。域名费用由现有域名服务承担，不增加网站后端。

## 已完成

- 项目仓库：helloqhq/ai-daohang。
- Pages 发布源为 GitHub Actions，构建输入 public/，产物 dist/。
- Custom domain 指定 go2-ai.com；与其他仓库的域名设置独立。
- 页面和 JSON 均使用相对路径，域名切换无需修改信息流或数据契约。

## DNS 待配置

2026-10-03 查到域名使用 ns1.dns-parking.com 和 ns2.dns-parking.com。当前根域 A 记录为 77.37.48.234、179.61.189.0，AAAA 为 Hostinger 地址；www CNAME 指向 Hostinger CDN，尚未指向 GitHub Pages。

在该域名的 DNS 管理面板，将以下记录配置为：

| 类型 | 主机名 | 值 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | helloqhq.github.io |

替换现有根域 A；移除原先根域 AAAA，以免 IPv6 仍访问旧服务器。若需要 IPv6，可配置 GitHub 官方列出的 AAAA 地址。www CNAME 替换现有 CDN 指向。邮件 MX、TXT 及其他无关子域记录保留。

CNAME 值仅包含 helloqhq.github.io，不包含仓库名或路径。具体规则及 IP 以 [GitHub 官方说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 为准。

## DNS 生效后

1. 检查根域 A、AAAA 和 www CNAME 的解析是否与上方一致。
2. 在仓库 Settings → Pages 查看 DNS 检查及证书状态。证书可用后启用 Enforce HTTPS。
3. 验证根路径、assets/app.js、data/index.json、各月份 JSON 和 data/subscriptions.opml。
4. 检查 JSON snapshot_id 一致、筛选和原文链接有效，再把域名作为正式在线入口。

DNS 传播及 HTTPS 证书可能需要等待。在验证完成前，文档只标记待上线，不声称独立域名已经可用。Actions 发布模式由 Pages 设置保存域名，不依赖构建中的 CNAME 文件。
