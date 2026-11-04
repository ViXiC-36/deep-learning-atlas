import test from 'node:test';
import assert from 'node:assert/strict';
import { scalarNetwork, crossCorrelate2d, scaledAttention, softmax, ctcCollapse, ctcDistribution, normalizeWeights, matmul } from '../src/lib/math.ts';

function close(a: number, b: number, tolerance = 1e-8) { assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`); }

test('backprop agrees with central finite differences for x, w and b, including saturation', () => {
  for (const [x, w, b, target] of [[1.2, 0.6, -0.3, 0.8], [-0.8, 1.4, 0.2, -0.2], [2, 2, 2, 0]]) {
    const result = scalarNetwork(x, w, b, target), eps = 1e-5;
    close(result.dW, (scalarNetwork(x, w + eps, b, target).loss - scalarNetwork(x, w - eps, b, target).loss) / (2 * eps));
    close(result.dB, (scalarNetwork(x, w, b + eps, target).loss - scalarNetwork(x, w, b - eps, target).loss) / (2 * eps));
    close(result.dX, (scalarNetwork(x + eps, w, b, target).loss - scalarNetwork(x - eps, w, b, target).loss) / (2 * eps));
  }
});

test('cross-correlation does not flip the kernel; stride and zero padding work', () => {
  assert.deepEqual(crossCorrelate2d([[1,2,3],[4,5,6],[7,8,9]], [[1,0],[0,-1]]), [[-4,-4],[-4,-4]]);
  assert.deepEqual(crossCorrelate2d([[1,2],[3,4]], [[1,1],[1,1]], 2, 1), [[1,2],[3,4]]);
  assert.throws(() => crossCorrelate2d([[1]], [[1]], 0));
});

test('attention matches hand-calculated scaled dot-product result', () => {
  const result = scaledAttention([[1,0],[0,1]], [[1,0],[0,1]], [[1,2],[3,0]]);
  const first = Math.exp(1 / Math.sqrt(2)) / (Math.exp(1 / Math.sqrt(2)) + 1);
  close(result.weights[0][0], first);
  close(result.output[0][0], first + 3 * (1 - first));
  close(result.output[0][1], 2 * first);
  result.weights.forEach(row => close(row.reduce((a,b) => a+b,0), 1));
});

test('causal attention assigns exactly zero to future tokens and sees own token', () => {
  const result = scaledAttention([[1,0],[0,1]], [[1,0],[0,1]], [[1,2],[3,0]], true);
  assert.deepEqual(result.weights[0], [1,0]);
  assert.deepEqual(result.output[0], [1,2]);
  assert.equal(result.scores[0][1], -Infinity);
  assert.throws(() => scaledAttention([[1]], [[1]], [[1]], false, 0));
});

test('softmax stable under a large common offset', () => {
  const a = softmax([1,2,3]), b = softmax([10001,10002,10003]);
  a.forEach((v,i) => close(v,b[i]));
  assert.deepEqual(softmax([0,-Infinity]), [1,0]);
});

test('CTC merge-before-remove preserves repeated labels separated by blank', () => {
  assert.deepEqual(ctcCollapse(['a','a','','a']), ['a','a']);
  assert.deepEqual(ctcCollapse(['','','']), []);
  assert.deepEqual(ctcCollapse(['a','b','b','']), ['a','b']);
});

test('CTC sums all alignments; greedy sequence need not be most probable', () => {
  const dist = ctcDistribution([[0.6,0.4],[0.6,0.4]], ['','a']);
  assert.equal(dist[0].text, 'a');
  close(dist[0].probability, 0.64);
  close(dist.find(x => x.text === '')!.probability, 0.36);
  close(dist.reduce((sum, x) => sum + x.probability, 0), 1);
  const other = ctcDistribution([[0.4,0.6],[0.5,0.5]], ['','a']);
  close(other.find(x => x.text === 'a')!.probability, 0.8);
});

test('zero probability weights have documented uniform fallback; shapes are checked', () => {
  assert.deepEqual(normalizeWeights([0,0,0]), [1/3,1/3,1/3]);
  assert.deepEqual(matmul([[1,2]],[[3],[4]]), [[11]]);
  assert.throws(() => matmul([[1,2]], [[1,2]]));
});
