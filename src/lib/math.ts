/** Small, deterministic teaching computations. No trained model runs here. */
export function scalarNetwork(x: number, w: number, b: number, target: number) {
  const z = x * w + b;
  const activation = Math.tanh(z);
  const loss = 0.5 * (activation - target) ** 2;
  const dActivation = activation - target;
  const dZ = dActivation * (1 - activation ** 2);
  return { z, activation, loss, dActivation, dZ, dW: dZ * x, dB: dZ, dX: dZ * w };
}

export function crossCorrelate2d(input: number[][], kernel: number[][], stride = 1, padding = 0): number[][] {
  if (!input.length || !input[0].length || !kernel.length || !kernel[0].length) throw new Error('Matrices must be nonempty.');
  if (!Number.isInteger(stride) || stride < 1 || !Number.isInteger(padding) || padding < 0) throw new Error('Invalid stride or padding.');
  const h = input.length, width = input[0].length, kh = kernel.length, kw = kernel[0].length;
  if (input.some(row => row.length !== width) || kernel.some(row => row.length !== kw)) throw new Error('Matrices must be rectangular.');
  const oh = Math.floor((h + 2 * padding - kh) / stride) + 1;
  const ow = Math.floor((width + 2 * padding - kw) / stride) + 1;
  if (oh <= 0 || ow <= 0) return [];
  return Array.from({ length: oh }, (_, r) => Array.from({ length: ow }, (_, c) => {
    let sum = 0;
    for (let i = 0; i < kh; i++) for (let j = 0; j < kw; j++) sum += (input[r * stride + i - padding]?.[c * stride + j - padding] ?? 0) * kernel[i][j];
    return sum;
  }));
}

export function matmul(a: number[][], b: number[][]): number[][] {
  if (!a.length || !b.length || !a[0].length || !b[0].length || a[0].length !== b.length) throw new Error('Matrix shape mismatch.');
  const inner = a[0].length, cols = b[0].length;
  if (a.some(r => r.length !== inner) || b.some(r => r.length !== cols)) throw new Error('Ragged matrix.');
  return a.map(row => Array.from({ length: cols }, (_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
}

export function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  if (max === -Infinity) return values.map(() => 0);
  const exps = values.map(value => Math.exp(value - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(value => value / sum);
}

export function scaledAttention(q: number[][], k: number[][], v: number[][], causal = false, temperature = 1) {
  if (!(temperature > 0) || !q.length || !k.length || !v.length || k.length !== v.length) throw new Error('Invalid attention configuration.');
  const d = q[0].length;
  if (!d || q.some(r => r.length !== d) || k.some(r => r.length !== d)) throw new Error('Q/K shapes differ.');
  const scores = q.map((row, i) => k.map((key, j) => causal && j > i ? -Infinity : row.reduce((sum, val, ix) => sum + val * key[ix], 0) / (Math.sqrt(d) * temperature)));
  const weights = scores.map(softmax);
  return { scores, weights, output: matmul(weights, v) };
}

export function normalizeWeights(weights: number[]): number[] {
  const safe = weights.map(value => Number.isFinite(value) ? Math.max(0, value) : 0);
  const total = safe.reduce((a, b) => a + b, 0);
  return total ? safe.map(x => x / total) : safe.map(() => 1 / safe.length);
}

/** CTC merges adjacent repeated symbols BEFORE removing blanks. */
export function ctcCollapse(path: string[], blank = ''): string[] {
  return path.filter((token, index) => token !== blank && (index === 0 || token !== path[index - 1]));
}

/** Exact enumeration; intended for tiny teaching examples only. */
export function ctcDistribution(probabilities: number[][], alphabet: string[]): { text: string; probability: number }[] {
  if (!alphabet.length || probabilities.some(row => row.length !== alphabet.length)) throw new Error('CTC alphabet mismatch.');
  if (alphabet.length ** probabilities.length > 1_000_000) throw new Error('Teaching enumeration too large.');
  const rows = probabilities.map(normalizeWeights);
  const result = new Map<string, number>();
  const visit = (time: number, path: string[], probability: number) => {
    if (time === rows.length) {
      const text = ctcCollapse(path).join('');
      result.set(text, (result.get(text) ?? 0) + probability);
      return;
    }
    alphabet.forEach((token, index) => visit(time + 1, [...path, token], probability * rows[time][index]));
  };
  visit(0, [], 1);
  return [...result.entries()].map(([text, probability]) => ({ text, probability })).sort((a, b) => b.probability - a.probability || a.text.localeCompare(b.text));
}

export function teachingEmbedding(token: string): number[] {
  let hash = 2166136261;
  for (const char of token) hash = Math.imul(hash ^ (char.codePointAt(0) ?? 0), 16777619) >>> 0;
  return Array.from({ length: 4 }, (_, i) => {
    hash = Math.imul(hash ^ (i + 17), 16777619) >>> 0;
    return ((hash % 201) - 100) / 100;
  });
}
