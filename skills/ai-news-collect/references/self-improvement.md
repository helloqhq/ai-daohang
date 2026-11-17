# 每轮复盘与自修复

每次调用结束前完成复盘、修复与经验沉淀，写入 `.collector/run-journal.json`；下次调用开始时先读取复用。日志是内部文件，不公开、不入库；只有跨轮验证的可复用结论才允许写回本 skill 的参考文档。

## 开始时读取

目录维护前读取 `run-journal.json` 的最近记录：

- 未完成的 `followups` 与 `status: pending` 的失败：本轮优先安排复测或修复，不重复从零诊断。
- `status: active` 的经验：直接应用，如已知限流实例、需串行探测的来源、已确认的解析陷阱。
- 经验与当前配置或实测冲突时以实测为准，把失效条目标为 `obsolete` 并记原因，不盲从旧经验。

文件不存在按首轮处理；本轮结束时才创建，不预写空记录。

## 结束时复盘

对照本轮实际输出检查以下信号，只记录真实发生的内容，不推测：

- `fetch` 失败／partial 来源：症状、分层诊断结论（DNS／TLS／HTTP／XML／限流）、修复动作与结果。
- `validate`、`apply`、`import-converted` 及转换器测试的报错与根因。
- `defer` 候选及各自缺少的证据。
- 浪费的工作：整批失效的处置包、重复读取、无效重试及其原因。
- 旧缓存判断与新规则的偏差。

## 自修复

根因明确且属于本轮范围的问题，在本轮内修完并复验：

- 订阅故障按 [RSS 订阅管理](subscriptions.md) 诊断与切换；修复后实测新地址，从 `uncovered_from` 补采。
- 转换器缺陷先补真实格式回归用例再修复，运行对应测试通过后才算修复。
- 配置错误修正后重新 `refresh` 和 `validate`。
- 编辑标准调整必须递增 rules_version 并复核受影响的缓存判断，不能只留日志备注。

修复不得突破硬约束：不重置 `--since`、不删除 `.collector/`、不伪造覆盖或验证状态、不降低双语与证据标准。本轮无法修复的环境问题（本机 DNS 污染、公共实例限流等）如实记 `status: environment` 并写明复测条件，不做破坏性“修复”。修复后重跑受影响的校验；仍失败则回退该项改动并记录，不留半成品。

## 经验沉淀

本轮记录追加到 `run-journal.json` 的 `runs` 数组：

```json
{
  "date": "实际运行日期",
  "scope": "本轮范围",
  "outcomes": {"kept": 0, "corrected": 0, "filtered": 0, "deferred": 0},
  "failures": [
    {"target": "来源ID或环节", "symptom": "症状", "root_cause": "诊断结论",
     "action": "修复动作", "status": "fixed|pending|environment"}
  ],
  "lessons": [
    {"id": "稳定经验ID", "lesson": "一句话可复用结论",
     "evidence_runs": ["2026-11-08", "2026-11-16"],
     "status": "active|promoted|obsolete", "promoted_to": "文档路径或 null"}
  ],
  "followups": ["下轮待办及所需条件"]
}
```

`runs` 只保留最近 20 轮；裁掉旧轮次前，把其中仍有效的经验合并进最新记录，不丢结论。一次性偶发不构成经验；经验条目必须有稳定 ID 和证据轮次，同一问题复发时更新既有条目而不是新建。

同一经验在 ≥2 轮出现，或根因已确认且修复方式普适时，才写入 skill 文档：选择对应文档（subscriptions／discovery／pricing／SKILL.md 编辑判断），最小化合并进既有条目，不追加流水账；具体日期的一次性事件只能作为明确标注的示例，不写成永久规则。改动不得与 AGENTS.md、GLOSSARY.md 及 docs/adr 的硬约定冲突。写入后把该经验标为 `promoted` 并记 `promoted_to`。skill 文档改动在汇报中列出，不自动提交或推送。

## 汇报

最终汇报追加：本轮修复的问题与复验结果、未解决问题及复测条件、新增／晋升／失效的经验条目、修改过的 skill 文档。