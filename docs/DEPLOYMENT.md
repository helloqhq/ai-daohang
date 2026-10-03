# 独立域名发布

正式域名：`go2-ai.com`。站点从 `https://go2-ai.com/` 根路径访问，静态托管仍采用免费 GitHub Pages。域名费用由现有域名服务承担，不增加网站后端。

## 已完成

- 项目仓库：helloqhq/ai-daohang。
- Pages 发布源为 GitHub Actions，构建输入 public/，产物 dist/。
- Custom domain 指定 go2-ai.com；与其他仓库的域名设置独立。
- 页面和 JSON 均使用相对路径，域名切换无需修改信息流或数据契约。

## DNS 已配置

2026-10-03 已在用户现有、已登录的 Chrome 中完成阿里云配置。域名注册商为阿里云，DNS 服务器已从 Hostinger 的 ns1.dns-parking.com / ns2.dns-parking.com 切换为 dns1.hichina.com / dns2.hichina.com。

网站使用以下默认线路解析，TTL 为 600 秒：

| 类型 | 主机名 | 值 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | helloqhq.github.io |

通过增量导入新增网站记录，阿里云中的六条旧根域 / www 网站记录已暂停，保留以便恢复；没有清空现有配置。新 DNS 区域不发布旧 Hostinger AAAA。两条既有 _acme-challenge TXT 保留。

迁移前读取并增量保留了九条当前生效的 Hostinger 邮件记录：两条 MX、SPF、DMARC、三条 DKIM CNAME、autodiscover 与 autoconfig。MX 仍为 mx1.hostinger.com（优先级 5）和 mx2.hostinger.com（优先级 10）。

已验证两台阿里云权威服务器上的 11 项网站及邮件解析均正确；Google 与 Cloudflare 的公开 DNS 查询也返回新 NS、四条 GitHub Pages A 地址，且根域 AAAA 为空。部分本地解析缓存可能暂时保留旧结果。

CNAME 值仅包含 helloqhq.github.io，不包含仓库名或路径。具体规则及 IP 以 [GitHub 官方说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) 为准。

## HTTPS 待完成

已在正确的 GitHub Pages IP 上使用 go2-ai.com Host 验证根页面、assets/app.js、data/index.json、catalog.json、coverage.json、两个月份 JSON 及 subscriptions.opml，全部返回 HTTP 200；JSON 与本地发布文件逐字节一致，snapshot_id 为 01be142a3cdc3eeb。

GitHub Pages 的域名绑定已重新保存以触发检查。目前 https_certificate 仍为空，直接 TLS 校验显示 GitHub 证书尚未包含 go2-ai.com。没有跳过证书校验或启用尚不可用的 HTTPS 强制跳转。

证书签发后需启用 Enforce HTTPS，并使用 https://go2-ai.com/ 再验证上述页面、资源与数据。正式 HTTPS 入口通过验证前，不标记为全部上线完成。[GitHub HTTPS 说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) 说明证书会在 DNS 检查通过后自动申请。

Actions 发布模式由 Pages 设置保存域名，不依赖构建中的 CNAME 文件。
