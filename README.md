# 知更 · AI 信息聚合

纯静态中文 AI 信息站。统一通过 RSS / Atom 订阅官方与已核实负责人信息，由用户已有 AI agent 调用采集 skill，筛选、翻译和归纳后产出 JSON。网站本身不抓取上游、不调用模型。

## 使用

要求 Python 3.11+；本地预览与构建只用标准库。Node.js 20+ 用于前端行为测试及 npm 便捷命令，无需 npm install。

```sh
npm run dev
# 打开 http://localhost:4173
npm test
npm run validate
npm run build
```

直接运行 Python 也可：`python3 -m http.server 4173 --directory public`。构建输出 `dist/`，仅复制公开页面及校验通过的 JSON。

## 按需更新信息

在 AI agent 中调用 `$ai-news-collect`，指定本项目。skill 源文件在 `skills/ai-news-collect/SKILL.md`；本机安装位置为 `~/.codex/skills/ai-news-collect`。脚本不自动调用模型，中文编辑由正在运行的 agent 完成。

```sh
python3 scripts/collect.py feeds
python3 scripts/collect.py fetch
python3 scripts/collect.py queue
python3 scripts/collect.py read 材料ID
python3 scripts/collect.py apply .collector/decisions-packet.json
python3 scripts/collect.py validate
```

首次回溯 72 小时；后续按订阅增量、重叠复核、自动补采失败断档。判断缓存会在材料或规则变化时失效。分批读取节省上下文，没有 token 预算、候选总量限制或因 token 使用量停止的条件。

`apply` 合并历史，保留事件 ID、首次采集时间和关联；实质修改需要更正记录。校验失败不会覆盖有效快照。`.collector/` 保存缓存、队列、指纹与进度，不提交公开仓库，也不进入部署产物。

## 管理订阅

关注对象在 `config/entities.json`，信息订阅在 `config/sources.json`。所有来源的 adapter 都是 rss，平台只用于来源分类。

- 官方原生订阅填写 `feed_url`，`feed_provider: native`。
- RSSHub 来源填写 `rsshub_route`，`feed_provider: rsshub`，全局实例地址在 `config/collection.json` 的 `rsshub_base_url`。
- 其他 RSS 转换服务直接填写 `feed_url`，保留原始入口、账号核实依据与平台分类。
- 没有核实的 RSS 地址保留 null 和 pending，页面显示订阅待配置。

```sh
python3 scripts/collect.py feeds --opml /本地/订阅.opml
python3 scripts/collect.py import-feed 来源ID /本地/feed.xml --since 2026-09-30T00:00:00Z --until 2026-10-03T00:00:00Z
```

网站来源页也可下载 OPML。离线 XML 导入不会推进在线订阅覆盖。采集器不直接抓原始官网、GitHub API、X、TikTok 或公众号文章；没有原生 RSS 的渠道通过订阅服务接入，首版不自建常驻转换服务。

RSSHub 路由参考其 [官方源码](https://github.com/DIYgod/RSSHub/tree/master/lib/routes)。公共实例可能限制访问或依赖账号配置，不能把“已填写路由”当作“已经成功接入”。微信公众号目前保留平台支持，具体账号订阅仍待核实。

## 页面与数据

首页默认最近 7 天，支持模型／Agent、关注对象、类型、关键词及自定义日期筛选。长期历史按月份按需加载；事件详情保留原文、多来源、关联与更正。每份 JSON 使用相同 snapshot_id，版本不一致时提示刷新。

首批数据来自真实官方材料，最终统一 RSS 配置后保留既有有效历史，并通过发布订阅补充 Claude Code 等更新。没有重要更新不填假新闻；仅标题、无日期、无变更说明的材料保留待核查。来源页分别显示完整检查、部分覆盖、读取受限和订阅待配置，生成时间不能代表全部来源已完成。

## 免费发布

`.github/workflows/pages.yml` 在 main 分支推送或手动触发时测试、构建并部署到 GitHub Pages。它不运行采集、不创建定时任务。采集与发布分开。

新建公开 GitHub 仓库，将本项目推送到 main，在仓库 Settings → Pages → Source 选择 GitHub Actions。流程按 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) 配置。默认地址为 `https://用户名.github.io/仓库名/`；所有资源及 JSON 使用相对路径，支持项目子路径。

```sh
git add public config schemas scripts tests skills docs GLOSSARY.md README.md package.json .gitignore .github
git commit -m "Update AI news snapshot"
git push origin main
```

## 设计文档

[计划](docs/PLAN.md) · [数据契约](docs/DATA-CONTRACT.md) · [来源登记](docs/SOURCE-REGISTRY.md) · [采集 skill](docs/SKILL-SPEC.md) · [采集流程](docs/COLLECTION-PIPELINE.md) · [统一 RSS 决策](docs/adr/0003-rss-only-ingestion.md)
