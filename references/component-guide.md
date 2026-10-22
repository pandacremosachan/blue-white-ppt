# Component guide

## Stable identifiers

Use C01–C39 with renderByCode(). Canonical IDs are also accepted. There are 244 registered variants, not 244 component IDs. Geometry choices, fills, labels and application compositions preserve their original canonical code. Get exact option keys and runnable examples with inspect-component.mjs Cxx; do not guess keys from names.

| Code | Canonical ID | Name | Variants | Physical reference pages |
|---|---|---|---|---|
| C01 | `page.header` | 编号渐变标题栏 | 1 | 1, 4, 9, 19, 26 |
| C02 | `block.message` | 信息框 | 21 | 1, 4, 9, 12, 17, 18, 19, 26 |
| C03 | `block.label` | 分类标签 | 20 | 9, 11, 15, 16, 26 |
| C04 | `arrow.lead` | 双折引导箭头 | 1 | 1, 4, 9, 19, 26 |
| C05 | `arrow.block` | 实体箭头 | 22 | 4, 5, 6, 7, 8 |
| C06 | `arrow.stages` | 阶段箭头链 | 2 | 4 |
| C07 | `connector.link` | 关系连线 | 6 | 4, 19, 47, 48 |
| C08 | `connector.junction` | 分流与汇流 | 4 | 4, 9, 49 |
| C09 | `connector.bypass` | 跨接与回路线 | 6 | 19, 47, 50, 51 |
| C10 | `icon.question` | 问题气泡 | 3 | 9, 10, 26 |
| C11 | `icon.info` | 说明标记 | 3 | 9, 10 |
| C12 | `icon.document` | 文档 | 3 | 9, 10 |
| C13 | `icon.database` | 数据库 | 3 | 9, 10 |
| C14 | `icon.target` | 靶心 | 3 | 9, 10 |
| C15 | `block.node` | 基础节点 | 15 | 33, 34, 35 |
| C16 | `mark.operator` | 运算符号 | 15 | 33, 36, 37 |
| C17 | `graphic.stack` | 叠层平面 | 15 | 33, 38, 39 |
| C18 | `graphic.cells` | 单元格阵列 | 22 | 40, 41, 42, 45 |
| C19 | `graphic.dots` | 圆点阵列 | 21 | 40, 43, 44, 46 |
| C20 | `structure.chain` | 顺序链 | 2 | 19 |
| C21 | `structure.parallel` | 并行汇合结构 | 2 | 19 |
| C22 | `structure.layers` | 层间连接结构 | 6 | 47, 52, 53 |
| C23 | `layout.partitions` | 分区容器 | 16 | 26, 27, 28, 29, 30, 31, 32 |
| C24 | `icon.search` | 搜索 | 2 | 13 |
| C25 | `icon.filter` | 筛选 | 2 | 13 |
| C26 | `icon.settings` | 设置 | 2 | 13 |
| C27 | `icon.check` | 确认 | 2 | 13 |
| C28 | `icon.lock` | 锁定 | 2 | 13 |
| C29 | `icon.clock` | 时间 | 2 | 14 |
| C30 | `icon.cloud` | 云端 | 2 | 14 |
| C31 | `icon.folder` | 文件夹 | 2 | 14 |
| C32 | `icon.chart` | 统计 | 2 | 14 |
| C33 | `icon.chip` | 芯片 | 2 | 14 |
| C34 | `structure.decision` | 条件分支 | 2 | 20 |
| C35 | `structure.loop` | 循环反馈 | 2 | 21 |
| C36 | `structure.synchronize` | 同步并行 | 2 | 22 |
| C37 | `structure.staged` | 阶段与子流程 | 2 | 23 |
| C38 | `structure.swimlane` | 跨泳道流程 | 2 | 24 |
| C39 | `structure.exception` | 异常与退出 | 2 | 25 |

## Selection by meaning

- Page framing and textual emphasis: C01–C03. addSlide() creates the header automatically.
- Direction or transformation: C04–C06; attached relations, branching and bypass: C07–C09.
- Small semantic icons: C10–C14 and C24–C33. Inspect variants before choosing a silhouette.
- Diagram primitives: C15 nodes, C16 operators, C17 stacks, C18 cells and C19 dots.
- Sequences, parallel paths and layers: C20–C22.
- Explicit layout regions: C23; inspect preset geometry and keep text inside regions.
- Control flow: C34 decisions, C35 loops, C36 synchronization, C37 staged subprocesses, C38 swimlanes and C39 exception/exit paths.

Use the least complex structure that expresses the subject accurately. Separate presentation structure from domain facts: replace placeholder labels and explain evidence and conclusions in nearby editable text. A component gallery is not a finished argument.

## Exact variants and parameter overrides

Run node scripts/inspect-component.mjs C05 to see shape, direction, rotation, gradient, labels and reference pages. For example, C05 can use {shape:'notchedRightArrow',gradient:'light-to-dark'}, while C22 can use {variant:'layers-skip'}. Values in variants[].options are executable examples. Some components have geometry or preset keys rather than a variant key.

A custom text label changes content, not geometry. For structural variants, labels often use a logical-key object rather than an ordered array. Read the corresponding renderer or variant metadata when changing internal node labels. Grouped structures expose native nodes and edges; use their actual return keys for external attachments.

## Reference navigation

Pages are physical 1-based PPTX page numbers. Page 2 is the chapter directory; page 3 is the code index. Preview path: assets/reference/slide-NN.png. reference-page.mjs --page N prints the absolute path or copies the PNG.

| Section | Title | Physical page range |
|---|---|---|
| 1 | 视觉基础与页面结构 | 1–1 |
| 2 | 箭头与关系连接 | 4–8 |
| 3 | 图标、标签与信息框 | 9–18 |
| 4 | 流程图组件 | 19–25 |
| 5 | 版式组件与内容分区 | 26–32 |
| 6 | 节点、符号与叠层平面 | 33–39 |
| 7 | 单元格与圆点阵列 | 40–46 |
| 8 | 连接补充与层间连接 | 47–53 |

The complete current metadata is catalog.json. Component source is scripts/components/index.mjs and its imported modules. Refresh this table with update-guide.mjs after an intentional registry/catalog update.
