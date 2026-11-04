import { useEffect, useMemo, useState } from 'react';
import { crossCorrelate2d } from '../lib/math';
import './playgrounds.css';

const INITIAL_INPUT = [
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 1],
];
const EDGE_KERNEL = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const clone = (matrix: number[][]) => matrix.map(row => [...row]);
const fmt = (n: number) => Number(n.toFixed(3)).toString();
const bounded = (raw: string) => {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(-9, Math.min(9, value)) : 0;
};

export default function ConvolutionPlayground() {
  const [input, setInput] = useState(() => clone(INITIAL_INPUT));
  const [kernel, setKernel] = useState(() => clone(EDGE_KERNEL));
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const output = useMemo(() => crossCorrelate2d(input, kernel, stride, padding), [input, kernel, stride, padding]);
  const width = output[0]?.length ?? 0;
  const count = output.length * width;
  const active = Math.min(position, Math.max(0, count - 1));
  const outRow = Math.floor(active / width);
  const outCol = active % width;
  const inputRow = outRow * stride - padding;
  const inputCol = outCol * stride - padding;
  const terms = kernel.flatMap((row, kr) => row.map((weight, kc) => {
    const r = inputRow + kr;
    const c = inputCol + kc;
    const padded = r < 0 || r >= input.length || c < 0 || c >= input[0].length;
    const value = padded ? 0 : input[r][c];
    return { kr, kc, r, c, padded, value, weight, product: value * weight };
  }));

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(query.matches);
      if (query.matches) setPlaying(false);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => setPosition(previous => (previous + 1) % count), 1000);
    return () => window.clearInterval(timer);
  }, [playing, count, reducedMotion]);

  function changeInput(r: number, c: number, raw: string) {
    setInput(previous => previous.map((row, ri) => row.map((value, ci) => ri === r && ci === c ? bounded(raw) : value)));
  }
  function changeKernel(r: number, c: number, raw: string) {
    setKernel(previous => previous.map((row, ri) => row.map((value, ci) => ri === r && ci === c ? bounded(raw) : value)));
  }
  function reset() {
    setPlaying(false);
    setInput(clone(INITIAL_INPUT));
    setKernel(clone(EDGE_KERNEL));
    setStride(1);
    setPadding(0);
    setPosition(0);
  }

  return <section className="lab convolution-lab" aria-label="卷积交互实验">
    <div className="lab-controls">
      <label>步幅 Stride <select value={stride} onChange={event => { setStride(Number(event.target.value)); setPosition(0); setPlaying(false); }}>
        <option value={1}>1</option><option value={2}>2</option>
      </select></label>
      <label>补零 Padding <select value={padding} onChange={event => { setPadding(Number(event.target.value)); setPosition(0); setPlaying(false); }}>
        <option value={0}>0</option><option value={1}>1</option>
      </select></label>
      <label>载入卷积核 <select aria-label="载入卷积核预设" value="" onChange={event => {
        if (event.target.value === 'edge') setKernel(clone(EDGE_KERNEL));
        if (event.target.value === 'blur') setKernel(Array.from({ length: 3 }, () => [1 / 9, 1 / 9, 1 / 9]));
        if (event.target.value === 'sharpen') setKernel([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
      }}>
        <option value="" disabled>选择预设</option>
        <option value="edge">垂直边缘</option><option value="blur">均值模糊</option><option value="sharpen">锐化</option>
      </select></label>
      <button type="button" onClick={() => { setPlaying(false); setPosition((active + 1) % count); }}>下一窗口 →</button>
      <button type="button" disabled={reducedMotion} onClick={() => setPlaying(value => !value)}>{playing ? '暂停' : '自动滑动'}</button>
      <button type="button" onClick={reset}>重置</button>
    </div>
    {reducedMotion && <p className="lab-note">已遵循系统的减少动态效果设置，可用「下一窗口」逐步观察。</p>}
    <p className="lab-note">修改任意输入值或卷积核，输出会立即重新计算。点击输出格选择滑动窗口；黄色输入格表示当前参与计算的区域。</p>
    <div className="conv-matrices" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
      <div>
        <p className="matrix-caption"><strong>输入 X</strong> · 5 × 5</p>
        <div className="matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 42px))', gap: 4 }}>
          {input.flatMap((row, r) => row.map((value, c) => <input
            key={`${r}-${c}`} className={`matrix-cell${r >= inputRow && r < inputRow + 3 && c >= inputCol && c < inputCol + 3 ? ' is-active' : ''}`}
            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', background: r >= inputRow && r < inputRow + 3 && c >= inputCol && c < inputCol + 3 ? 'var(--lab-highlight, #f5df94)' : undefined, color: r >= inputRow && r < inputRow + 3 && c >= inputCol && c < inputCol + 3 ? '#30270e' : undefined }}
            type="number" min={-9} max={9} step="any" value={value}
            aria-label={`输入第 ${r + 1} 行第 ${c + 1} 列`} onChange={event => changeInput(r, c, event.target.value)}
          />))}
        </div>
      </div>
      <div>
        <p className="matrix-caption"><strong>卷积核 K</strong> · 3 × 3</p>
        <div className="matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 48px))', gap: 4 }}>
          {kernel.flatMap((row, r) => row.map((value, c) => <input
            key={`${r}-${c}`} className="matrix-cell" style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
            type="number" min={-9} max={9} step="any" value={Number(value.toFixed(5))}
            aria-label={`卷积核第 ${r + 1} 行第 ${c + 1} 列`} onChange={event => changeKernel(r, c, event.target.value)}
          />))}
        </div>
      </div>
      <div>
        <p className="matrix-caption"><strong>输出 Y</strong> · {output.length} × {width}</p>
        <div className="matrix-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${width}, minmax(0, 42px))`, gap: 4 }}>
          {output.flatMap((row, r) => row.map((value, c) => <button
            key={`${r}-${c}`} type="button" className={`matrix-cell${r * width + c === active ? ' is-active' : ''}`}
            aria-label={`输出第 ${r + 1} 行第 ${c + 1} 列：${fmt(value)}`} aria-pressed={r * width + c === active}
            style={{ minWidth: 0, padding: '0.5rem 0.1rem', background: r * width + c === active ? 'var(--accent, #247b64)' : undefined, color: r * width + c === active ? 'var(--paper, #fff)' : undefined }}
            onClick={() => { setPlaying(false); setPosition(r * width + c); }}>{fmt(value)}</button>))}
        </div>
      </div>
    </div>
    <div className="stat-row" aria-live="polite">
      <span>当前输出 <strong>Y[{outRow}, {outCol}] = {fmt(output[outRow][outCol])}</strong></span>
      <span>输出边长 ⌊(5 + 2 × {padding} − 3) / {stride}⌋ + 1 = <strong>{width}</strong></span>
    </div>
    <details className="calculation-details" open>
      <summary>展开当前窗口的 9 次乘加</summary>
      <div className="conv-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.4rem', marginTop: '0.8rem' }}>
        {terms.map(term => <div key={`${term.kr}-${term.kc}`}>
          <small>{term.padded ? '边界补零' : `X[${term.r}, ${term.c}]`} × K[{term.kr}, {term.kc}]</small><br />
          <code>{fmt(term.value)} × {fmt(term.weight)} = {fmt(term.product)}</code>
        </div>)}
      </div>
      <p style={{ overflowWrap: 'anywhere' }}><strong>求和：</strong>{terms.map(term => `(${fmt(term.product)})`).join(' + ')} = <strong>{fmt(output[outRow][outCol])}</strong></p>
    </details>
    <p className="lab-note">这里采用深度学习库（如 PyTorch Conv2d）中的互相关 Cross-correlation：卷积核不翻转。这个示例只有一个输入／输出通道，未加偏置；多通道卷积还需沿输入通道求和。</p>
  </section>;
}
