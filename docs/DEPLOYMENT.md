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

## HTTPS 已完成

已在正确的 GitHub Pages IP 上使用 go2-ai.com Host 验证根页面、assets/app.js、data/index.json、catalog.json、coverage.json、两个月份 JSON 及 subscriptions.opml，全部返回 HTTP 200；JSON 与本地发布文件逐字节一致，snapshot_id 为 01be142a3cdc3eeb。

最初重新保存域名绑定后，https_certificate 仍为空，直接 TLS 校验显示 GitHub 证书尚未包含 go2-ai.com。

2026-10-03 晚间再次排查并在 Pages 中移除、重新保存 `go2-ai.com`。`.com` 父区已委派到阿里云；两台阿里云权威服务器、Google 与 Cloudflare 返回正确的 Pages 地址，根域没有 AAAA 或 CAA，`www` 的 CAA 链允许 Let's Encrypt。但 GitHub `/pages/health` 仍报告根域与 `www` 的 `is_non_github_pages_ip_present: true`、`is_https_eligible: false`，`/pages` 的 `https_certificate` 仍为空。

直接查询旧 `ns1.dns-parking.com` / `ns2.dns-parking.com`，根域最初仍返回 `179.61.189.154`、`77.37.48.38`，以及两条旧 Hostinger IPv6 地址；`www` 仍指向 `www.go2-ai.com.cdn.hstgr.net`。这些结果与 GitHub 后台所见的非 Pages 地址相符，推断旧 NS 委派缓存尚未过期；父区 NS TTL 为 172800 秒。Hostinger 已将域名显示为未连接，外部域名 DNS 页面没有提供旧区域的记录编辑入口。

用户明确授权联系 Hostinger 支持并同步旧区域后，已通过其支持助手在 22:53 左右将旧根域网站 ALIAS 替换为上述四条 A，移除旧根域 AAAA，并将 `www` CNAME 改为 `helloqhq.github.io`。直接查询两台旧权威服务器已返回正确的 Pages 地址，旧根域 AAAA 为空。新旧区域的两条 MX、SPF、DMARC、三条 DKIM CNAME、autodiscover 与 autoconfig 逐项一致；当前阿里云 NS 未修改。随后重新绑定 Pages 域名以触发证书申请。

2026-10-03 22:58 左右完成 HTTPS 验收：GitHub 的 `https_certificate.state` 为 `approved`，Let's Encrypt 证书同时覆盖 `go2-ai.com` 与 `www.go2-ai.com`，有效期至 2027-01-01；已启用 `https_enforced: true`。两个域名均通过系统 CA 和域名校验，使用 TLS 1.3。根域 HTTP 自动跳转到 HTTPS，HTTPS `www` 跳转到根域 HTTPS，HTTP `www` 经根域 HTTP 后最终到达 HTTPS。

通过 `https://go2-ai.com/` 验证首页、全部五个 assets 文件、index/catalog/coverage JSON、两个月份 JSON 和 subscriptions.opml，共 12 个文件全部 HTTP 200，逐字节匹配本地 `public/`；当前快照为 `3bf479d156e0acf1`。[GitHub HTTPS 说明](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https) 说明证书会在 DNS 检查通过后自动申请。

Actions 发布模式由 Pages 设置保存域名，不依赖构建中的 CNAME 文件。
