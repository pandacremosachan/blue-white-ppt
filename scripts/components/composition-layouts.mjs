// Declarative composition presets in a 540 × 350 coordinate system.
// Cells are fillable content areas; regions only group related cells.
export const COMPOSITION_LAYOUTS = Object.freeze([
  {
    componentId: 'layout.partitions', key: 'main-with-support', name: '主辅与小结',
    note: '一大主区配双辅助，下方独立小结', group: 'priority', options: { preset: 'main-with-support' },
    cells: [
      { id: 'main', x: 0, y: 0, w: 354, h: 278, title: '主内容', role: 'main' },
      { id: 'support1', x: 366, y: 0, w: 174, h: 134, title: '辅助一', role: 'support' },
      { id: 'support2', x: 366, y: 146, w: 174, h: 132, title: '辅助二', role: 'support' },
      { id: 'summary', x: 0, y: 290, w: 540, h: 60, title: '小结', role: 'summary' },
    ],
  },
  {
    componentId: 'layout.partitions', key: 'rail-main-notes', name: '主题轴主区注释',
    note: '窄主题轴、中间主区和右侧三段注释', group: 'priority', options: { preset: 'rail-main-notes' },
    cells: [
      { id: 'rail', x: 0, y: 0, w: 68, h: 350, title: '主题', role: 'axis' },
      { id: 'main', x: 80, y: 0, w: 300, h: 350, title: '主内容', role: 'main' },
      { id: 'note1', x: 392, y: 0, w: 148, h: 108, title: '注释一', role: 'support' },
      { id: 'note2', x: 392, y: 120, w: 148, h: 110, title: '注释二', role: 'support' },
      { id: 'note3', x: 392, y: 242, w: 148, h: 108, title: '注释三', role: 'support' },
    ],
  },
  {
    componentId: 'layout.partitions', key: 'figure-caption', name: '图表说明与图注',
    note: '左图配独立图注，右侧分段正文与结论', group: 'media', options: { preset: 'figure-caption' },
    cells: [
      { id: 'figure', x: 0, y: 0, w: 318, h: 264, title: '图表', role: 'figure' },
      { id: 'caption', x: 0, y: 276, w: 318, h: 74, title: '图注', role: 'caption' },
      { id: 'explanation1', x: 330, y: 0, w: 210, h: 108, title: '说明一', role: 'support' },
      { id: 'explanation2', x: 330, y: 120, w: 210, h: 108, title: '说明二', role: 'support' },
      { id: 'conclusion', x: 330, y: 240, w: 210, h: 110, title: '结论', role: 'summary' },
    ],
  },
  {
    componentId: 'layout.partitions', key: 'annotated-figure', name: '中心图与对应短注',
    note: '中心图内标记与两侧错位短注对应', group: 'media', options: { preset: 'annotated-figure' },
    regions: [
      { id: 'figureRegion', x: 104, y: 0, w: 332, h: 350, title: '图表区' },
    ],
    cells: [
      { id: 'figure', x: 116, y: 44, w: 308, h: 190, title: '中心图', role: 'figure', parent: 'figureRegion' },
      { id: 'markerA', x: 116, y: 246, w: 148, h: 34, title: '标记 A', role: 'label', parent: 'figureRegion' },
      { id: 'markerB', x: 276, y: 246, w: 148, h: 34, title: '标记 B', role: 'label', parent: 'figureRegion' },
      { id: 'caption', x: 116, y: 292, w: 308, h: 46, title: '图注', role: 'caption', parent: 'figureRegion' },
      { id: 'noteA', x: 0, y: 44, w: 92, h: 104, title: 'A 注', role: 'support' },
      { id: 'noteB', x: 448, y: 194, w: 92, h: 104, title: 'B 注', role: 'support' },
    ],
  },
  {
    componentId: 'layout.partitions', key: 'headline-columns', name: '概要三列与结论',
    note: '共享概要与底部结论贯穿三个内容栏', group: 'bands', options: { preset: 'headline-columns' },
    cells: [
      { id: 'headline', x: 0, y: 0, w: 540, h: 56, title: '概要', role: 'band' },
      { id: 'column1', x: 0, y: 68, w: 164, h: 214, title: '内容一', role: 'main' },
      { id: 'column2', x: 176, y: 68, w: 188, h: 214, title: '内容二', role: 'main' },
      { id: 'column3', x: 376, y: 68, w: 164, h: 214, title: '内容三', role: 'main' },
      { id: 'conclusion', x: 0, y: 294, w: 540, h: 56, title: '结论', role: 'summary' },
    ],
  },
  {
    componentId: 'layout.partitions', key: 'alternating-bands', name: '通栏拆列交错',
    note: '通栏阅读段交替连接两列与三列', group: 'bands', options: { preset: 'alternating-bands' },
    cells: [
      { id: 'overview', x: 0, y: 0, w: 540, h: 46, title: '总览', role: 'band' },
      { id: 'openingMain', x: 0, y: 58, w: 208, h: 82, title: '要点', role: 'main' },
      { id: 'openingSupport', x: 220, y: 58, w: 320, h: 82, title: '说明', role: 'support' },
      { id: 'transition', x: 0, y: 152, w: 540, h: 46, title: '过渡', role: 'band' },
      { id: 'detail1', x: 0, y: 210, w: 150, h: 82, title: '展开一', role: 'main' },
      { id: 'detail2', x: 162, y: 210, w: 216, h: 82, title: '展开二', role: 'support' },
      { id: 'detail3', x: 390, y: 210, w: 150, h: 82, title: '展开三', role: 'support' },
      { id: 'summary', x: 0, y: 304, w: 540, h: 46, title: '小结', role: 'summary' },
    ],
  },
].map(item => Object.freeze({
  ...item,
  options: Object.freeze(item.options),
  ...(item.regions ? { regions: Object.freeze(item.regions.map(region => Object.freeze(region))) } : {}),
  cells: Object.freeze(item.cells.map(cell => Object.freeze(cell))),
})));
