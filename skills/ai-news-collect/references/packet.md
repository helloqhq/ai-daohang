# JSON 处置包

字段以项目 `schemas/event.schema.json` 为准；业务说明见 `docs/DATA-CONTRACT.md`。处理前读取相关历史，避免同一次发布生成新 ID。

```json
{
  "events": [{
    "id": "entity-v1-release",
    "entity_ids": ["现有对象ID"],
    "kind": "update",
    "topics": ["feature"],
    "title_zh": "中文标题",
    "summary_zh": "有原文依据且保留限制条件的摘要。",
    "key_points_zh": ["关键变化"],
    "importance_reason_zh": "实际影响",
    "title_en": "English title",
    "summary_en": "A source-grounded summary that preserves limitations.",
    "key_points_en": ["Key change"],
    "importance_reason_en": "Practical impact",
    "published_at": "2026-10-02T01:00:00Z",
    "date_precision": "datetime",
    "first_collected_at": "材料中的collected_at",
    "updated_at": "带时区的当前时间",
    "sources": [{
      "source_id": "材料中的source_id",
      "content_id": "材料中的content_id",
      "url": "https://原始链接",
      "collected_at": "材料中的collected_at",
      "material_scope": "full_text"
    }]
  }],
  "decisions": [{
    "material_id": "材料ID",
    "fingerprint": "读取时的fingerprint",
    "action": "keep",
    "event_id": "entity-v1-release",
    "reason_zh": "保留理由"
  }]
}
```

同一事件内中英文四组字段均必填、不得为空白；关键点逐项对应且数量一致。来源、发布时间、分类和 ID 共用，不创建语言专用事件。短公告全文译文可选；填写时同时提供 `translation_zh` 与 `translation_en`。

`reject`／`defer` 只需材料 ID、指纹、动作和中文理由。`defer` 下次仍返回队列；`keep`／`reject` 仅在内容指纹、解析版本与规则版本均未变化时复用。改变编辑规则时递增 `config/collection.json` 的 `rules_version`。

## 指纹与批次

指纹绑定标题、发布时间、日期标签、链接、材料范围和正文。`fetch`、`import-feed`、`import-converted` 或解析器升级后都可能生成新指纹；每次采集后重新 `queue`，对变化项重新 `read`，不能沿用旧指纹或旧结论。`apply` 会校验指纹，过期处置包整包失败。

候选多时按来源／发布日期分批生成 `decisions-packet-日期-序号.json`，每批只含本批已读取的材料；批与批之间不要再次采集。每批都要覆盖该批全部已读候选（包括过滤项），即使 `events` 为空也提交 `decisions`。后一批可以继续修订前一批写入的事件，但必须保留稳定 ID、`first_collected_at` 并遵守更正规则。

## 时间精度

只有日期没有时刻时，`published_at` 写 `YYYY-MM-DD` 并设 `date_precision: "date"`；`published_at` 必须是纯日期，不能写成当天 `T00:00:00Z` 再标 `date`。材料层可保留 `date_label`，事件层不复制该字段。RSSHub 或订阅把日期补成 `00:00` 不代表真实午夜。已发布事件的时间或精度需要修正时，保留原 ID，追加双语 `corrections`，不要新建重复事件：

```json
"published_at": "2026-11-16",
"date_precision": "date",
"corrections": [{
  "at": "2026-11-16T20:00:00+08:00",
  "reason_zh": "订阅仅提供日期，原记录误把 00:00 当作发布时间。",
  "reason_en": "The feed provides only a date; the earlier record treated 00:00 as the publication time.",
  "url": "https://原始条目"
}]
```

## 补采队列

更换订阅地址或恢复断档会产生补采材料，必须逐条判断：模型／产品／API 的实质变化保留；普通宣传、客户案例、重复转发、仅安装包的小版本过滤；标题、日期或原文链接无法核实的 `defer` 并写明缺口。不要因为材料来自旧时间窗就整体保留或整体过滤，也不要用抓取时间补发布时间。旧候选指纹变化后重新进入待处理，旧的 `reject` 不再自动有效。

来源引用必须对应已导入原文的 source_id、content_id 和 URL。新事件必须有 keep 判断；未知时间不能 keep；预览版必须 preview。跨来源引用可保留实际材料范围，不能把部分正文升级成全文。

`queue --offset 0 --count 20` 返回页码与总数。apply 后队列会缩小，因此处理一批后重新从 offset 0 读未处理项；仅只读翻页时使用 next_offset，避免删除队列前项后跳过材料。

更正已发布事件时保留 `first_collected_at`、ID，更新 `updated_at` 并追加 `corrections: [{at, reason_zh, reason_en, url}]`。中英文同步修改；已有英文的实质修改也需记录更正。仅补齐旧事件缺失英文不虚构事实更正。`apply` 合并现有历史，校验失败不会替换有效快照。不同发布阶段需分别建事件；关联引用必须存在于当前快照或同一提交包。
