/** Deterministic, untrained single-block Pre-LN Transformer teaching model. */
export type Matrix = number[][];
export const tokens = ['我', '正在', '学习', '。'];
export const vocabulary = ['<pad>', '我', '。', '正在', '你', '模型', '语音', '学习', '喜欢', '数学', '声音', '语言'];
const tokenIds = [1, 3, 7, 2];
const weight = (rows: number, cols: number, seed: number): Matrix => Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => Math.sin((i + 1) * (j + 2) + seed) * 0.24));
const matmul = (a: Matrix, b: Matrix): Matrix => a.map(row => b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
const transpose = (a: Matrix): Matrix => a[0].map((_, j) => a.map(row => row[j]));
const add = (a: Matrix, b: Matrix): Matrix => a.map((row, i) => row.map((x, j) => x + b[i][j]));
const norm = (a: Matrix): Matrix => a.map(row => { const mean = row.reduce((s, x) => s + x, 0) / row.length; const variance = row.reduce((s, x) => s + (x - mean) ** 2, 0) / row.length; return row.map(x => (x - mean) / Math.sqrt(variance + 1e-5)); });
const softmax = (row: number[]): number[] => { const max = Math.max(...row); const exp = row.map(x => Math.exp(x - max)); const sum = exp.reduce((s, x) => s + x, 0); return exp.map(x => x / sum); };
const gelu = (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));

export function computeArchitecture(causal: boolean) {
  const embedding = weight(12, 8, 1);
  const e = tokenIds.map(id => embedding[id]);
  const position = tokens.map((_, t) => Array.from({ length: 8 }, (_, j) => { const angle = t / 10000 ** (2 * Math.floor(j / 2) / 8); return j % 2 ? Math.cos(angle) : Math.sin(angle); }));
  const x = add(e, position), n1 = norm(x);
  const q = matmul(n1, weight(8, 8, 2)), k = matmul(n1, weight(8, 8, 3)), v = matmul(n1, weight(8, 8, 4));
  const heads = [0, 1].map(head => {
    const slice = (a: Matrix) => a.map(row => row.slice(head * 4, (head + 1) * 4));
    const qh = slice(q), kh = slice(k), vh = slice(v);
    const scores = matmul(qh, transpose(kh)).map((row, i) => row.map((value, j) => causal && j > i ? -Infinity : value / 2));
    const attention = scores.map(softmax), output = matmul(attention, vh);
    return { q: qh, k: kh, v: vh, scores, attention, output };
  });
  const concat = tokens.map((_, i) => [...heads[0].output[i], ...heads[1].output[i]]);
  const projected = matmul(concat, weight(8, 8, 5)), residual1 = add(x, projected), n2 = norm(residual1);
  // Bias vectors are learnable parameters, initialized here to deterministic nonzero values.
  const hidden = matmul(n2, weight(8, 16, 6)).map(row => row.map((value, j) => value + 0.01 * (j - 7.5)));
  const activated = hidden.map(row => row.map(gelu));
  const ffn = matmul(activated, weight(16, 8, 7)).map(row => row.map((value, j) => value + 0.01 * (j - 3.5)));
  const residual2 = add(residual1, ffn), finalNorm = norm(residual2);
  const logits = matmul(finalNorm, weight(8, 12, 8)).map(row => row.map((value, j) => value + 0.01 * (j - 5.5)));
  const probabilities = logits.map(softmax);
  return { e, position, x, n1, heads, concat, projected, residual1, n2, hidden, activated, ffn, residual2, finalNorm, logits, probabilities };
}


export const architectureConfig = { sequenceLength: 4, modelDimension: 8, heads: 2, headDimension: 4, feedForwardDimension: 16, vocabularySize: 12 } as const;
export const architectureParameterCounts = { embedding: 12 * 8, attention: 4 * 8 * 8, blockNorms: 2 * 2 * 8, feedForward: 8 * 16 + 16 + 16 * 8 + 8, finalNorm: 2 * 8, languageHead: 8 * 12 + 12 } as const;
export const architectureParameterTotal = Object.values(architectureParameterCounts).reduce((total, count) => total + count, 0);
