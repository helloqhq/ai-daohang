# AI agent 工作约定

纯静态中英文 AI 信息站（`go2-ai.com`）：Python 3.11+ 标准库负责采集与构建，Node 20+（ESM，`"type": "module"`）仅用于前端行为测试；**无需 `npm install`，无第三方运行时依赖**。完整流程与细节以 [README.md](README.md) 为准，本文件只列 agent 易错的约定。

## 常用命令（项目根目录执行）

```sh
npm run dev            # python3 http.server，服务 public/，http://localhost:4173
npm test               # 先 python3 -m unittest discover -s tests，再 node --test tests/*.test.mjs
npm run validate       # python3 scripts/collect.py validate（校验公开数据快照）
npm run build          # python3 scripts/build.py：校验并复制 public/ → dist/，再渲染计费表/SEO 文件
npm run pricing:build  # node scripts/build-pricing.mjs public：改 pricing.json 后生成 pricing.xml
npm run catalog:inspect # 检查来源、计费映射与待复核项；不联网
```

- 单独跑测试：`python3 -m unittest tests.test_pipeline -v`、`node --test tests/model.test.mjs`。
- CI（`.github/workflows/pages.yml`，push 到 `main` 触发）：`npm test` → `npm run build` → 部署 `dist/` → IndexNow 通知。**`dist/` 不提交**，构建产物以线上 Actions 为准。

## 采集/数据流水线（scripts/collect.py）

1. 改动 `config/*.json` 不等于生效：必须 `validate` 后再 `refresh`（或走 `apply`）重新生成 `public/data/catalog.json`、`coverage.json`、OPML；只改配置不 refresh，页面拿不到新目录。
2. `fetch --entities` 接收 **entity ID**（如 `codex`），不是 source ID。
3. 不要每轮重置 `--since`、不要删除 `.collector/`：它保存增量进度、缓存、判断指纹；丢失即产生补采断档。该目录已 gitignore，绝不 `git add -f`。
4. 重要性判断、中英文案由**运行中的 agent** 完成（`queue` → `read` → 生成 `decisions-packet.json` → `apply`）；单跑 `fetch`/`import-feed` 不会产出新闻。
5. `apply` 时全部候选被过滤也照常提交 `decisions`，`events` 可为空；校验失败不会覆盖现有快照。

## 数据与提交约定

- 事件必须含成对的 `title_zh/en`、`summary_zh/en`、`key_points_zh/en`、`importance_reason_zh/en`，校验脚本强制检查。
- 通过 `apply`/`refresh` 统一发布整套快照；**不要手改或单独替换某个月份文件**，所有公开 JSON 的 `snapshot_id` 必须一致。普通数据更新提交整个 `public/data/`；仅订阅配置变更时再加 `config/`。
- 事件更正走 `corrections` 字段（含原因与依据链接），不重复创建事件；`event_id`、`first_collected_at` 保持稳定。
- 计费数据 [`public/data/pricing.json`](docs/PRICING.md) 与新闻采集**相互独立**：运行新闻 pipeline 不会更新价格。价格单位为每 million tokens，不把 credits/请求数换算成 tokens；`null` 不等于免费；`checked_at`/`updated_at` 按实际核验更新，不能靠改日期消除过期提示。
- 部署验收：对比线上与本地 `data/index.json` 的 `snapshot_id`。自定义域名在 Pages 设置中维护，构建**不生成 CNAME**，不要手动添加。需回退时恢复整套数据+配置，不手动拼接快照。

## 本次视频生成文件

以下文件属于本地视频制作产物，不得加入 Git 暂存区、提交或推送：

- `videos/go2ai-promo-zh/` 下的所有文件
- `docs/VIDEO-PROMO-NARRATION.json`
- `docs/VIDEO-PROMO-RESEARCH.md`
- `docs/VIDEO-PROMO-SCRIPT.md`

AI agent 默认不得主动读取、搜索、递归扫描或索引这些文件及目录。常规代码分析、仓库检查和上下文收集必须跳过这些路径；不得通过忽略规则绕过选项（例如 `rg --no-ignore` 或 `rg -uuu`）读取它们。仅当用户明确要求处理这些视频产物时，才读取完成该请求所必需的文件。

这些产物已列入 `.gitignore`。不得使用 `git add -f` 强制加入，除非用户明确撤销"不提交到 Git"的要求。

## 关键参考文档

- [docs/DATA-CONTRACT.md](docs/DATA-CONTRACT.md)：公开/内部文件边界与字段契约
- [docs/PRICING.md](docs/PRICING.md)：计费字段与核验规则
- [skills/ai-news-collect/SKILL.md](skills/ai-news-collect/SKILL.md)：完整采集更新流程（`fetch → queue → read → apply → validate`）
- [docs/OFFLINE-RSS.md](docs/OFFLINE-RSS.md)：离线导入操作与限制
