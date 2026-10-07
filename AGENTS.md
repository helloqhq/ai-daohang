# AI agent 工作约定

## 本次视频生成文件

以下文件属于本地视频制作产物，不得加入 Git 暂存区、提交或推送：

- `videos/go2ai-promo-zh/` 下的所有文件
- `docs/VIDEO-PROMO-NARRATION.json`
- `docs/VIDEO-PROMO-RESEARCH.md`
- `docs/VIDEO-PROMO-SCRIPT.md`

AI agent 默认不得主动读取、搜索、递归扫描或索引这些文件及目录。常规代码分析、仓库检查和上下文收集必须跳过这些路径；不得通过忽略规则绕过选项（例如 `rg --no-ignore` 或 `rg -uuu`）读取它们。仅当用户明确要求处理这些视频产物时，才读取完成该请求所必需的文件。

这些产物已列入 `.gitignore`。不得使用 `git add -f` 强制加入，除非用户明确撤销“不提交到 Git”的要求。
