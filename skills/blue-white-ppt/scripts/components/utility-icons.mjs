import { C, shape } from './research-components.mjs';

const DEFINITIONS = [
  { id: 'icon.search', name: '搜索', code: 'C24', page: 'tools', variants: [
    { key: 'search-lens', name: '放大镜', note: '圆形镜面与斜向镜柄' },
    { key: 'search-focus', name: '聚焦搜索', note: '四角框内保留放大镜' },
  ] },
  { id: 'icon.filter', name: '筛选', code: 'C25', page: 'tools', variants: [
    { key: 'filter-funnel', name: '漏斗筛选', note: '宽入口收束为细出口' },
    { key: 'filter-layers', name: '分层筛选', note: '三层逐级收窄的筛选' },
  ] },
  { id: 'icon.settings', name: '设置', code: 'C26', page: 'tools', variants: [
    { key: 'settings-gear', name: '齿轮设置', note: '八齿轮廓与中心圆孔' },
    { key: 'settings-sliders', name: '滑杆设置', note: '三条滑轨与错位滑块' },
  ] },
  { id: 'icon.check', name: '确认', code: 'C27', page: 'tools', variants: [
    { key: 'check-circle', name: '圆形勾选', note: '圆形边界内的确认勾' },
    { key: 'check-shield', name: '盾形勾选', note: '盾牌轮廓内的确认勾' },
  ] },
  { id: 'icon.lock', name: '锁定', code: 'C28', page: 'tools', variants: [
    { key: 'lock-padlock', name: '挂锁', note: '弧形锁梁与钥匙孔' },
    { key: 'lock-shield', name: '盾牌锁', note: '盾牌内嵌完整挂锁' },
  ] },
  { id: 'icon.clock', name: '时间', code: 'C29', page: 'data', variants: [
    { key: 'clock-dial', name: '时钟', note: '刻度圆盘与两根指针' },
    { key: 'clock-hourglass', name: '沙漏', note: '上下沙室与收窄通道' },
  ] },
  { id: 'icon.cloud', name: '云端', code: 'C30', page: 'data', variants: [
    { key: 'cloud-basic', name: '云朵', note: '连续圆弧组成云轮廓' },
    { key: 'cloud-transfer', name: '云端传输', note: '云下双向上传与下载' },
  ] },
  { id: 'icon.folder', name: '文件夹', code: 'C31', page: 'data', variants: [
    { key: 'folder-tab', name: '文件夹', note: '顶部页签与展开前片' },
    { key: 'folder-layered', name: '分层文件夹', note: '多个页签与层叠前片' },
  ] },
  { id: 'icon.chart', name: '统计', code: 'C32', page: 'data', variants: [
    { key: 'chart-bars', name: '柱形统计', note: '三根不同高度的柱形' },
    { key: 'chart-line', name: '折线统计', note: '节点折线与坐标轴' },
  ] },
  { id: 'icon.chip', name: '芯片', code: 'C33', page: 'data', variants: [
    { key: 'chip-core', name: '芯片', note: '四侧引脚与中心核心' },
    { key: 'chip-circuit', name: '电路芯片', note: '芯片连接分支电路' },
  ] },
];

export const UTILITY_ICON_VARIANTS = Object.freeze(DEFINITIONS.flatMap(component =>
  component.variants.map(variant => Object.freeze({ componentId: component.id, ...variant, page: component.page }))));

export const UTILITY_ICON_COMPONENTS = Object.freeze(DEFINITIONS.map(({ id, name, code }) => Object.freeze({
  id, name, code, variants: Object.freeze(UTILITY_ICON_VARIANTS.filter(variant => variant.componentId === id)),
})));

const COMPONENT_BY_ID = new Map(UTILITY_ICON_COMPONENTS.map(component => [component.id, component]));
const VARIANT_BY_KEY = new Map(UTILITY_ICON_VARIANTS.map(variant => [variant.key, variant]));

/**
 * Draw one flat, native, editable utility icon, fitted to a 100 × 105 box.
 * options.variant resolves the component directly. With only componentId,
 * draw the component's first variant; instanceId is used only for names.
 */
export function drawUtilityIcon(slide, instanceId, bounds, options = {}) {
  const { x, y, w, h } = bounds ?? {};
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) {
    throw new RangeError('Utility icon bounds require finite x/y and positive w/h.');
  }
  const component = options.componentId === undefined ? undefined : COMPONENT_BY_ID.get(options.componentId);
  if (options.componentId !== undefined && !component) {
    throw new RangeError(`Unknown utility icon component ${JSON.stringify(options.componentId)}.`);
  }
  const key = options.variant ?? component?.variants[0].key;
  const variant = VARIANT_BY_KEY.get(key);
  if (!variant) throw new RangeError('Supply a valid utility icon variant or componentId.');
  if (component && variant.componentId !== component.id) {
    throw new RangeError(`Variant ${JSON.stringify(key)} does not belong to ${component.id}.`);
  }
  const scale = Math.min(w / 100, h / 105), ox = x + (w - 100 * scale) / 2, oy = y + (h - 105 * scale) / 2;
  const parts = [];
  function add(name, geometry, left, top, width, height, fill = C.white, stroke = C.border, strokeWidth = 1.5, extra = {}) {
    const part = shape(slide, `${instanceId}.${name}`, geometry, ox + left * scale, oy + top * scale,
      width * scale, height * scale, fill, stroke, strokeWidth, extra);
    parts.push(part); return part;
  }
  function path(name, left, top, width, height, commands, fill = C.white, stroke = C.border, strokeWidth = 1.5) {
    return add(name, 'custom', left, top, width, height, fill, stroke, strokeWidth,
      { customPaths: [{ width, height, commands }] });
  }
  function polygon(name, points, fill = C.white, stroke = C.border, strokeWidth = 1.5) {
    const left = Math.min(...points.map(point => point[0])), top = Math.min(...points.map(point => point[1]));
    const width = Math.max(...points.map(point => point[0])) - left, height = Math.max(...points.map(point => point[1])) - top;
    const commands = points.map(([px, py], i) => ({ [i ? 'lineTo' : 'moveTo']: { x: px - left, y: py - top } }));
    commands.push({ close: {} }); return path(name, left, top, width, height, commands, fill, stroke, strokeWidth);
  }
  function trace(name, points, stroke = C.border, strokeWidth = 1.5) {
    const left = Math.min(...points.map(point => point[0])), top = Math.min(...points.map(point => point[1]));
    const width = Math.max(.01, Math.max(...points.map(point => point[0])) - left);
    const height = Math.max(.01, Math.max(...points.map(point => point[1])) - top);
    return path(name, left, top, width, height,
      points.map(([px, py], i) => ({ [i ? 'lineTo' : 'moveTo']: { x: px - left, y: py - top } })), 'none', stroke, strokeWidth);
  }
  function circle(name, left, top, diameter, fill = C.white, stroke = C.border) {
    return add(name, 'ellipse', left, top, diameter, diameter, fill, stroke, stroke === 'none' ? 0 : 1.5);
  }
  function checkMark(name, points, fill = C.blue) { return polygon(name, points, fill, 'none', 0); }
  function shield(fill = C.bluePale) {
    return path('shield', 12, 8, 76, 89, [
      { moveTo: { x: 38, y: 0 } }, { lineTo: { x: 76, y: 15 } }, { lineTo: { x: 76, y: 40 } },
      { cubicBezTo: { x1: 76, y1: 64, x2: 61, y2: 80, x: 38, y: 89 } },
      { cubicBezTo: { x1: 15, y1: 80, x2: 0, y2: 64, x: 0, y: 40 } },
      { lineTo: { x: 0, y: 15 } }, { close: {} },
    ], fill);
  }
  function shackle(name, left, top, width, height) {
    const r = width / 2, thickness = width * .18, inner = r - thickness, k = .55228475;
    return path(name, left, top, width, height, [
      { moveTo: { x: 0, y: height } }, { lineTo: { x: 0, y: r } },
      { cubicBezTo: { x1: 0, y1: r * (1 - k), x2: r * (1 - k), y2: 0, x: r, y: 0 } },
      { cubicBezTo: { x1: r * (1 + k), y1: 0, x2: width, y2: r * (1 - k), x: width, y: r } },
      { lineTo: { x: width, y: height } }, { lineTo: { x: width - thickness, y: height } },
      { lineTo: { x: width - thickness, y: r } },
      { cubicBezTo: { x1: width - thickness, y1: r - k * inner, x2: r + k * inner, y2: thickness, x: r, y: thickness } },
      { cubicBezTo: { x1: r - k * inner, y1: thickness, x2: thickness, y2: r - k * inner, x: thickness, y: r } },
      { lineTo: { x: thickness, y: height } }, { close: {} },
    ], C.blue);
  }
  function padlock(name, left, top, width, height, fill = C.bluePale, hole = C.blue) {
    shackle(`${name}.shackle`, left + width * .2, top, width * .6, height * .58);
    const bodyY = top + height * .44, bodyH = height * .56;
    add(`${name}.body`, 'roundRect', left, bodyY, width, bodyH, fill, C.border, 1.5, { borderRadius: 5 * scale });
    const diameter = width * .16, center = left + width / 2, dotY = bodyY + bodyH * .25;
    circle(`${name}.keyhole.dot`, center - diameter / 2, dotY, diameter, hole, 'none');
    add(`${name}.keyhole.stem`, 'rect', center - diameter * .19, dotY + diameter * .75,
      diameter * .38, bodyH * .31, hole, 'none', 0);
  }
  function cloud(name, left, top, width, height, fill = C.blue) {
    return path(name, left, top, width, height, [
      { moveTo: { x: width * .2, y: height } },
      { cubicBezTo: { x1: width * .07, y1: height, x2: 0, y2: height * .84, x: 0, y: height * .68 } },
      { cubicBezTo: { x1: 0, y1: height * .5, x2: width * .08, y2: height * .36, x: width * .23, y: height * .36 } },
      { cubicBezTo: { x1: width * .23, y1: height * .13, x2: width * .37, y2: 0, x: width * .52, y: 0 } },
      { cubicBezTo: { x1: width * .68, y1: 0, x2: width * .78, y2: height * .17, x: width * .79, y: height * .36 } },
      { cubicBezTo: { x1: width * .91, y1: height * .35, x2: width, y2: height * .5, x: width, y: height * .68 } },
      { cubicBezTo: { x1: width, y1: height * .85, x2: width * .91, y2: height, x: width * .77, y: height } },
      { close: {} },
    ], fill);
  }

  switch (key) {
    case 'search-lens':
      polygon('handle', [[55, 65], [63, 57], [91, 85], [83, 93]], C.blue);
      circle('rim', 9, 9, 66, C.blue);
      circle('glass', 17, 17, 50, C.white, 'none');
      break;
    case 'search-focus':
      trace('corner.tl', [[10, 31], [10, 11], [30, 11]], C.blue);
      trace('corner.tr', [[70, 11], [90, 11], [90, 31]], C.blue);
      trace('corner.bl', [[10, 74], [10, 94], [30, 94]], C.blue);
      trace('corner.br', [[70, 94], [90, 94], [90, 74]], C.blue);
      polygon('handle', [[55, 59], [61, 53], [83, 75], [77, 81]], C.blue);
      circle('rim', 24, 24, 42, C.blue);
      circle('glass', 30, 30, 30, C.white, 'none');
      break;
    case 'filter-funnel':
      polygon('funnel', [[9, 17], [91, 17], [59, 54], [59, 86], [41, 95], [41, 54]], C.blue);
      trace('opening', [[21, 27], [79, 27]], C.white);
      break;
    case 'filter-layers':
      trace('links', [[50, 31], [50, 78]], C.blue);
      polygon('stage1', [[9, 16], [91, 16], [75, 35], [25, 35]], C.blue);
      polygon('stage2', [[26, 45], [74, 45], [61, 63], [39, 63]], C.bluePale);
      polygon('stage3', [[39, 73], [61, 73], [54, 83], [54, 96], [46, 96], [46, 83]], C.blue);
      break;
    case 'settings-gear': {
      const points = [];
      for (let tooth = 0; tooth < 8; tooth++) {
        for (const [angle, radius] of [[-22.5, 34], [-15, 34], [-10, 43], [10, 43], [15, 34]]) {
          const a = (tooth * 45 + angle) * Math.PI / 180;
          points.push([50 + radius * Math.cos(a), 52 + radius * Math.sin(a)]);
        }
      }
      polygon('gear', points, C.blue);
      circle('hole', 33, 35, 34, C.white);
      break;
    }
    case 'settings-sliders':
      add('frame', 'rect', 11, 11, 78, 84, C.white);
      for (const [i, yy, knob] of [[0, 29, 43], [1, 53, 65], [2, 77, 34]]) {
        trace(`track${i}`, [[23, yy], [77, yy]]);
        add(`active${i}`, 'rect', 23, yy - 1.5, knob - 23, 3, C.blue, 'none', 0);
        add(`knob${i}`, 'rect', knob - 5, yy - 8, 10, 16, C.blue);
      }
      break;
    case 'check-circle':
      circle('circle', 10, 12, 80, C.bluePale);
      checkMark('check', [[23, 51], [31, 43], [44, 57], [70, 30], [78, 38], [44, 73]]);
      break;
    case 'check-shield':
      shield(C.blue);
      checkMark('check', [[27, 49], [35, 41], [46, 53], [67, 31], [75, 39], [46, 69]], C.white);
      break;
    case 'lock-padlock':
      padlock('lock', 16, 9, 68, 87);
      break;
    case 'lock-shield':
      shield();
      padlock('lock', 29, 29, 42, 53, C.blue, C.white);
      break;
    case 'clock-dial':
      circle('dial', 10, 13, 80, C.white);
      for (let tick = 0; tick < 12; tick++) {
        const a = (tick * 30 - 90) * Math.PI / 180, inner = tick % 3 ? 31 : 27;
        trace(`tick${tick}`, [[50 + inner * Math.cos(a), 53 + inner * Math.sin(a)], [50 + 34 * Math.cos(a), 53 + 34 * Math.sin(a)]]);
      }
      polygon('hands', [[48, 53], [48, 26], [52, 26], [52, 51], [70, 61], [68, 65], [49, 55]], C.blue, 'none', 0);
      circle('center', 46.5, 49.5, 7, C.blue, 'none');
      break;
    case 'clock-hourglass':
      path('glass', 26, 17, 48, 71, [
        { moveTo: { x: 0, y: 0 } }, { lineTo: { x: 48, y: 0 } },
        { cubicBezTo: { x1: 48, y1: 17, x2: 40, y2: 25, x: 29, y: 35.5 } },
        { cubicBezTo: { x1: 40, y1: 46, x2: 48, y2: 54, x: 48, y: 71 } },
        { lineTo: { x: 0, y: 71 } },
        { cubicBezTo: { x1: 0, y1: 54, x2: 8, y2: 46, x: 19, y: 35.5 } },
        { cubicBezTo: { x1: 8, y1: 25, x2: 0, y2: 17, x: 0, y: 0 } }, { close: {} },
      ], C.bluePale);
      add('top', 'rect', 20, 8, 60, 8, C.blue);
      add('bottom', 'rect', 20, 89, 60, 8, C.blue);
      polygon('sand.top', [[34, 26], [66, 26], [50, 44]], C.blue, 'none', 0);
      polygon('sand.bottom', [[50, 63], [66, 82], [34, 82]], C.blue, 'none', 0);
      trace('sand.drop', [[50, 48], [50, 58]], C.blue);
      break;
    case 'cloud-basic':
      cloud('cloud', 6, 22, 88, 61);
      break;
    case 'cloud-transfer':
      cloud('cloud', 6, 13, 88, 51, C.bluePale);
      polygon('upload', [[32, 47], [19, 62], [26, 62], [26, 90], [38, 90], [38, 62], [45, 62]], C.blue);
      polygon('download', [[68, 97], [55, 82], [62, 82], [62, 54], [74, 54], [74, 82], [81, 82]], C.blue);
      break;
    case 'folder-tab':
      polygon('back', [[8, 18], [37, 18], [48, 29], [91, 29], [91, 87], [8, 87]], C.bluePale);
      polygon('front', [[8, 39], [94, 39], [85, 91], [8, 91]], C.blue);
      break;
    case 'folder-layered':
      polygon('rear', [[21, 13], [45, 13], [55, 23], [92, 23], [92, 76], [21, 76]], C.bluePale);
      polygon('middle', [[14, 25], [38, 25], [48, 35], [85, 35], [85, 87], [14, 87]], C.white);
      polygon('front.back', [[7, 38], [31, 38], [41, 48], [78, 48], [78, 96], [7, 96]], C.bluePale);
      polygon('front.face', [[7, 58], [82, 58], [75, 97], [7, 97]], C.blue);
      break;
    case 'chart-bars':
      trace('axes', [[12, 12], [12, 93], [93, 93]]);
      add('bar1', 'rect', 24, 58, 14, 35, C.bluePale);
      add('bar2', 'rect', 47, 39, 14, 54, C.blue);
      add('bar3', 'rect', 70, 20, 14, 73, C.bluePale);
      break;
    case 'chart-line':
      polygon('area', [[23, 74], [42, 47], [61, 61], [83, 24], [83, 93], [23, 93]], C.bluePale, 'none', 0);
      trace('axes', [[12, 12], [12, 93], [93, 93]]);
      trace('line', [[23, 74], [42, 47], [61, 61], [83, 24]], C.blue);
      for (const [i, px, py] of [[0, 23, 74], [1, 42, 47], [2, 61, 61], [3, 83, 24]]) circle(`point${i}`, px - 3.5, py - 3.5, 7, C.blue, 'none');
      break;
    case 'chip-core':
      for (let pin = 0; pin < 4; pin++) {
        const offset = 30 + pin * 13;
        trace(`pin.top${pin}`, [[offset, 11], [offset, 25]]);
        trace(`pin.bottom${pin}`, [[offset, 81], [offset, 95]]);
        trace(`pin.left${pin}`, [[8, offset + 3], [22, offset + 3]]);
        trace(`pin.right${pin}`, [[78, offset + 3], [92, offset + 3]]);
      }
      add('body', 'rect', 22, 25, 56, 56, C.bluePale);
      add('core', 'rect', 34, 37, 32, 32, C.blue);
      for (const [i, px, py] of [[0, 41, 44], [1, 54, 44], [2, 41, 57], [3, 54, 57]]) add(`cell${i}`, 'rect', px, py, 5, 5, C.white, 'none', 0);
      break;
    case 'chip-circuit': {
      const circuits = [
        [[29, 40], [20, 40], [20, 19], [10, 19]],
        [[29, 64], [18, 64], [18, 86], [8, 86]],
        [[71, 40], [82, 40], [82, 19], [92, 19]],
        [[71, 64], [84, 64], [84, 86], [94, 86]],
        [[43, 29], [43, 12]], [[57, 75], [57, 95]],
        [[29, 52], [8, 52]], [[71, 52], [92, 52]],
      ];
      circuits.forEach((points, i) => {
        trace(`trace${i}`, points);
        const [px, py] = points.at(-1); circle(`terminal${i}`, px - 2.75, py - 2.75, 5.5, C.blue, 'none');
      });
      add('body', 'rect', 29, 29, 42, 46, C.bluePale);
      add('core', 'rect', 40, 41, 20, 22, C.blue);
      break;
    }
  }
  return parts;
}
