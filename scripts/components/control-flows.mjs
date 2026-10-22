import { C } from './research-components.mjs';
import { flowContext } from './flow-core.mjs';

export const CONTROL_FLOW_VARIANTS = Object.freeze([
  { componentId: 'structure.decision', key: 'decision-binary', name: '二分支判断', note: '互斥的是、否分支在输出前合并', group: 'decision' },
  { componentId: 'structure.decision', key: 'decision-multi', name: '多分支选择', note: 'A、B、其他三路选择在末端合并', group: 'decision' },
  { componentId: 'structure.loop', key: 'loop-pre', name: '前置判断循环', note: '先判断再执行，否分支直接输出', group: 'loop' },
  { componentId: 'structure.loop', key: 'loop-post', name: '后置判断循环', note: '先执行再判断，是分支返回步骤', group: 'loop' },
  { componentId: 'structure.synchronize', key: 'fork-join', name: '分叉同步汇合', note: '同步条展开并行步骤并等待汇合', group: 'synchronize' },
  { componentId: 'structure.synchronize', key: 'staged-parallel', name: '分阶段并行', note: '中间同步屏障连接前后两阶段', group: 'synchronize' },
].map(item => Object.freeze({ ...item, options: Object.freeze({ variant: item.key }) })));

const BY_KEY = new Map(CONTROL_FLOW_VARIANTS.map(item => [item.key, item]));

/** Native neutral control-flow structures in the shared 540 × 350 system. */
export function drawControlFlow(slide, instanceId, bounds, options = {}) {
  const key = options.variant ?? CONTROL_FLOW_VARIANTS.find(item => item.componentId === options.componentId)?.key;
  const variant = BY_KEY.get(key);
  if (!variant) throw new RangeError('Supply a valid control-flow variant or componentId.');
  if (options.componentId !== undefined && variant.componentId !== options.componentId) {
    throw new RangeError(`Variant ${JSON.stringify(key)} does not belong to ${options.componentId}.`);
  }
  const g = flowContext(slide, instanceId, bounds, options);
  const terminal = { geometry: 'roundRect', highlight: true };
  const branchLabel = { fontSize: 20, fill: C.white };
  function start(x = 215, y = 3, w = 110, h = 42) { return g.n('input', '输入', x, y, w, h, terminal); }
  function end(x = 215, y = 304, w = 110, h = 42) { return g.n('output', '输出', x, y, w, h, terminal); }
  function down(key, from, to, extra = {}) { return g.e(key, from, to, { fromSide: 'bottom', toSide: 'top', ...extra }); }

  if (key === 'decision-binary') {
    const input = start(), condition = g.n('condition', '条件', 210, 75, 120, 76, { geometry: 'diamond' });
    const a = g.n('stepA', '步骤 A', 42, 194, 132, 48), b = g.n('stepB', '步骤 B', 366, 194, 132, 48);
    const output = end(), merge = g.anchor('merge', 270, 278);
    down('input.condition', input, condition);
    g.route('condition.yes', condition, a, [[108, 113]], { fromSide: 'left', toSide: 'top' });
    g.route('condition.no', condition, b, [[432, 113]], { fromSide: 'right', toSide: 'top' });
    g.route('a.merge', a, merge, [[108, 278]], { fromSide: 'bottom', toSide: 'left', arrow: false });
    g.route('b.merge', b, merge, [[432, 278]], { fromSide: 'bottom', toSide: 'right', arrow: false });
    down('merge.output', merge, output);
    g.t('yes', '是', 139, 82, 40, 28, branchLabel);
    g.t('no', '否', 361, 82, 40, 28, branchLabel);
  } else if (key === 'decision-multi') {
    const input = start(), condition = g.n('condition', '条件', 210, 68, 120, 76, { geometry: 'diamond' });
    const a = g.n('stepA', '步骤 A', 18, 190, 132, 48), b = g.n('stepB', '步骤 B', 204, 190, 132, 48);
    const c = g.n('stepC', '步骤 C', 390, 190, 132, 48), output = end(), merge = g.anchor('merge', 270, 278);
    down('input.condition', input, condition);
    g.route('condition.a', condition, a, [[84, 106]], { fromSide: 'left', toSide: 'top' });
    down('condition.b', condition, b);
    g.route('condition.other', condition, c, [[456, 106]], { fromSide: 'right', toSide: 'top' });
    g.route('a.merge', a, merge, [[84, 278]], { fromSide: 'bottom', toSide: 'left', arrow: false });
    down('b.merge', b, merge, { arrow: false });
    g.route('c.merge', c, merge, [[456, 278]], { fromSide: 'bottom', toSide: 'right', arrow: false });
    down('merge.output', merge, output);
    g.t('branchA', 'A', 127, 75, 40, 28, branchLabel);
    g.t('branchB', 'B', 278, 151, 40, 28, branchLabel);
    g.t('branchOther', '其他', 357, 75, 60, 28, branchLabel);
  } else if (key === 'loop-pre') {
    const input = start(), condition = g.n('condition', '条件', 205, 82, 130, 80, { geometry: 'diamond' });
    const a = g.n('stepA', '步骤 A', 204, 217, 132, 48), output = end(409, 100, 112, 44);
    down('input.condition', input, condition);
    down('condition.yes', condition, a);
    g.e('condition.no', condition, output, { fromSide: 'right', toSide: 'left' });
    g.route('a.repeat', a, condition, [[270, 312], [117, 312], [117, 122]], { fromSide: 'bottom', toSide: 'left' });
    g.t('yes', '是', 280, 174, 40, 28, branchLabel);
    g.t('no', '否', 351, 88, 40, 28, branchLabel);
  } else if (key === 'loop-post') {
    const input = start(), a = g.n('stepA', '步骤 A', 204, 86, 132, 48);
    const condition = g.n('condition', '条件', 205, 184, 130, 80, { geometry: 'diamond' }), output = end();
    down('input.step', input, a);
    down('step.condition', a, condition);
    down('condition.no', condition, output);
    g.route('condition.repeat', condition, a, [[438, 224], [438, 110]], { fromSide: 'right', toSide: 'right' });
    g.t('yes', '是', 361, 191, 40, 28, branchLabel);
    g.t('no', '否', 280, 269, 40, 28, branchLabel);
  } else if (key === 'fork-join') {
    const input = start(), fork = g.bar('fork', 70, 82, 400, 8), join = g.bar('join', 70, 249, 400, 8), output = end();
    const rows = [
      ['a', '步骤 A', 35, 100], ['b', '步骤 B', 205, 270], ['c', '步骤 C', 375, 440],
    ];
    down('input.fork', input, fork);
    for (const [name, label, x, center] of rows) {
      const step = g.n(`step${name.toUpperCase()}`, label, x, 145, 130, 48);
      const forkPort = g.anchor(`fork.${name}.port`, center, 90), joinPort = g.anchor(`join.${name}.port`, center, 249);
      down(`fork.${name}`, forkPort, step);
      down(`${name}.join`, step, joinPort);
    }
    down('join.output', join, output);
  } else if (key === 'staged-parallel') {
    const input = start(215, 2, 110, 38), fork = g.bar('fork', 70, 64, 400, 7);
    const barrier = g.bar('barrier', 70, 171, 400, 7), join = g.bar('join', 70, 280, 400, 7);
    const output = end(215, 312, 110, 36);
    down('input.fork', input, fork);
    for (const [name, label1, label2, x, center] of [
      ['left', '步骤 A', '步骤 C', 70, 140], ['right', '步骤 B', '步骤 D', 330, 400],
    ]) {
      const first = g.n(`${name}.first`, label1, x, 102, 140, 44), second = g.n(`${name}.second`, label2, x, 210, 140, 44);
      const forkPort = g.anchor(`fork.${name}.port`, center, 71), barrierIn = g.anchor(`barrier.${name}.in`, center, 171);
      const barrierOut = g.anchor(`barrier.${name}.out`, center, 178), joinPort = g.anchor(`join.${name}.port`, center, 280);
      down(`fork.${name}`, forkPort, first);
      down(`${name}.barrier`, first, barrierIn);
      down(`barrier.${name}`, barrierOut, second);
      down(`${name}.join`, second, joinPort);
    }
    down('join.output', join, output);
    // The solid middle bar is one shared synchronization boundary. Both first
    // steps reach it before either second step leaves it; no lane bypasses it.
    void barrier;
  }
  return g.finish({ variant: key, componentId: variant.componentId, group: variant.group });
}
