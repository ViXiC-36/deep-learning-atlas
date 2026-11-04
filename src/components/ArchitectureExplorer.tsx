import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';
import './architecture.css';

import { computeArchitecture, tokens, vocabulary, architectureParameterTotal, type Matrix } from '../lib/architecture';

const stages = [
  { id: 'embedding', title: 'Token + Position', shape: '4 × 8', parameters: 96, formula: String.raw`X=E[\mathrm{tokens}]+P`, explanation: '查表取得 4 个 token 的 8 维向量，再加入正弦位置编码。词表 12 × 8 = 96 个参数；正弦位置编码不含可学习参数。' },
  { id: 'norm1', title: 'LayerNorm ①', shape: '4 × 8', parameters: 16, formula: String.raw`\mathrm{LN}(x)=\gamma\odot\frac{x-\mu}{\sqrt{\sigma^2+10^{-5}}}+\beta`, explanation: '对每个 token 的 8 个特征独立归一化；不混合不同 token。γ 与 β 各有 8 个参数，此处 γ=1、β=0。采用 Pre-LN。' },
  { id: 'attention', title: 'Multi-Head Attention', shape: '2 × (4 × 4) → 4 × 8', parameters: 256, formula: String.raw`\mathrm{MHA}(X)=\mathrm{Concat}(A_1V_1,A_2V_2)W_O`, explanation: '两个 head 各有 4 个维度。Q/K/V 投影与输出投影均为 8 × 8、无偏置，共 4 × 64 = 256 个参数。注意力权重是计算结果，不是模型参数。' },
  { id: 'residual1', title: 'Residual ①', shape: '4 × 8 + 4 × 8', parameters: 0, formula: String.raw`H=X+\mathrm{MHA}(\mathrm{LN}_1(X))`, explanation: '将注意力子层的输出与原始输入逐元素相加。残差支路保留信息流；两项形状必须一致，无新增参数。' },
  { id: 'norm2', title: 'LayerNorm ②', shape: '4 × 8', parameters: 16, formula: String.raw`\widetilde H=\mathrm{LN}_2(H)`, explanation: '这是与第一处 LayerNorm 不共享参数的第二组归一化：另有 8 个缩放参数与 8 个偏置参数。' },
  { id: 'ffn', title: 'Feed-Forward Network', shape: '4 × 8 → 4 × 16 → 4 × 8', parameters: 280, formula: String.raw`\mathrm{FFN}(H)=\mathrm{GELU}(HW_1+b_1)W_2+b_2`, explanation: '相同的两层 MLP 独立应用于每个 token，不混合 token 位置。第一层 8 × 16 + 16 = 144，第二层 16 × 8 + 8 = 136，共 280 个参数。这里使用 tanh 近似 GELU。' },
  { id: 'residual2', title: 'Residual ②', shape: '4 × 8', parameters: 0, formula: String.raw`Z=H+\mathrm{FFN}(\mathrm{LN}_2(H))`, explanation: '再次逐元素相加。完成一个 Pre-LN block 后，token 数量与隐藏维度都保持不变。' },
  { id: 'output', title: 'Final Norm + LM Head', shape: '4 × 8 → 4 × 12', parameters: 124, formula: String.raw`p_t=\mathrm{softmax}(\mathrm{LN}_f(Z_t)W_{\mathrm{vocab}}+b)`, explanation: '最终 LayerNorm 有 16 个参数；未与 embedding 共享的输出头有 8 × 12 + 12 = 108 个参数。每个位置预测下一个 token；展示第 4 个位置的输出分布。' },
];

function Formula({ value }: { value: string }) {
  const html = useMemo(() => katex.renderToString(value, { throwOnError: false, displayMode: true }), [value]);
  return <div className="arch-formula" dangerouslySetInnerHTML={{ __html: html }} />;
}

function MatrixView({ matrix, label, probability = false }: { matrix: Matrix; label: string; probability?: boolean }) {
  return <div className="arch-matrix"><div className="arch-matrix-title"><strong>{label}</strong><span>[{matrix.length}, {matrix[0].length}]</span></div><div className="arch-table-scroll"><table aria-label={`${label} 数值矩阵`}><tbody>{matrix.map((row, i) => <tr key={i}>{row.map((value, j) => <td key={j} style={probability ? { background: `rgba(49, 114, 88, ${value * .5})` } : undefined} title={`row ${i + 1}, column ${j + 1}: ${value}`}>{Number.isFinite(value) ? value.toFixed(3) : '−∞'}</td>)}</tr>)}</tbody></table></div></div>;
}

export default function ArchitectureExplorer({ model = 'transformer' }: { model?: string }) {
  const [step, setStep] = useState(0), [head, setHead] = useState(0);
  const [causal, setCausal] = useState(true), [playing, setPlaying] = useState(false);
  const [motion, setMotion] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [attentionView, setAttentionView] = useState<'qkv' | 'scores' | 'weights' | 'output'>('qkv');
  const [ffnView, setFfnView] = useState<'linear1' | 'gelu' | 'linear2'>('linear1');
  const result = useMemo(() => computeArchitecture(causal), [causal]);
  const stage = stages[step], selectedHead = result.heads[head];
  useEffect(() => {
    if (!playing || !motion) return;
    if (step === stages.length - 1) { setPlaying(false); return; }
    const timer = window.setTimeout(() => setStep(current => current + 1), 1600);
    return () => window.clearTimeout(timer);
  }, [playing, motion, step]);
  const reset = () => { setStep(0); setHead(0); setPlaying(false); setCausal(true); setAttentionView('qkv'); setFfnView('linear1'); };
  const chooseStep = (index: number) => { setPlaying(false); setStep(index); };
  const matrix = [result.x, result.n1, result.projected, result.residual1, result.n2, result.ffn, result.residual2, result.probabilities][step];

  return <section className="architecture-explorer" aria-label="Transformer 架构探索器">
    <header className="arch-header"><div><span className="arch-eyebrow">ARCHITECTURE EXPLORER</span><h3>走进一个 Transformer</h3></div><span className="arch-total">{architectureParameterTotal} <small>parameters</small></span></header>
    <p className="arch-intro">一个真实计算的微型 Pre-LN 模型：T=4 · d=8 · heads=2 · d<sub>ff</sub>=16 · vocab=12。{model !== 'transformer' && model !== 'attention' ? '此处展示可交互的 Transformer 示例。' : ''} 权重为确定性教学数值，未经训练，输出不代表语言理解。</p>
    <div className="arch-controls">
      <button type="button" onClick={() => { if (step === stages.length - 1) setStep(0); setPlaying(value => !value); }} disabled={!motion}>{playing ? '暂停' : '播放数据流'}</button>
      <button type="button" onClick={() => chooseStep((step + 1) % stages.length)}>下一步</button>
      <button type="button" onClick={reset}>重置</button>
      <label><input type="checkbox" checked={motion} onChange={e => { setMotion(e.target.checked); setPlaying(false); }} />允许动画</label>
      <label><input type="checkbox" checked={causal} onChange={e => setCausal(e.target.checked)} />Causal mask</label>
    </div>
    <div className="arch-workspace">
      <nav className="arch-pipeline" aria-label="模型组件"><div className="arch-token-strip">{tokens.map((token, i) => <span key={i}>{token}</span>)}</div>{stages.map((item, index) => <button type="button" key={item.id} className={`arch-stage ${index === step ? 'selected' : ''} ${index < step ? 'passed' : ''}`} aria-pressed={index === step} onClick={() => chooseStep(index)}><span className="arch-stage-index">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.title}</strong><small>{item.shape}</small></span></button>)}</nav>
      <div className="arch-detail"><div className="arch-detail-heading"><span>STEP {String(step + 1).padStart(2, '0')} / 08</span><span>{stage.parameters} 个参数</span></div><h4>{stage.title}</h4><p>{stage.explanation}</p><Formula value={stage.formula} />
        {stage.id === 'attention' ? <>
          <div className="arch-subcontrols"><span>选择 head</span>{[0, 1].map(index => <button key={index} type="button" className={head === index ? 'active' : ''} aria-pressed={head === index} onClick={() => setHead(index)}>Head {index + 1}</button>)}</div>
          <div className="arch-tabs" role="group" aria-label="注意力计算步骤">{([['qkv', '① Q · K · V'], ['scores', '② Scores'], ['weights', '③ Softmax'], ['output', '④ 输出']] as const).map(([key, label]) => <button key={key} type="button" className={attentionView === key ? 'active' : ''} aria-pressed={attentionView === key} onClick={() => setAttentionView(key)}>{label}</button>)}</div>
          {attentionView === 'qkv' && <><Formula value={String.raw`Q_h=XW_{Q,h},\ K_h=XW_{K,h},\ V_h=XW_{V,h}\quad\in\mathbb{R}^{4\times4}`} /><div className="arch-matrices">{(['q', 'k', 'v'] as const).map(key => <MatrixView key={key} label={key.toUpperCase()} matrix={selectedHead[key]} />)}</div><p className="arch-note">这里 X 是第一处归一化的输出。每个 head 选取投影结果中的四列，各自计算注意力。</p></>}
          {attentionView === 'scores' && <><Formula value={String.raw`S_{ij}=\frac{q_i\cdot k_j}{\sqrt4}+M_{ij}`} /><MatrixView label="Scores · 行 query / 列 key" matrix={selectedHead.scores} /><p className="arch-note">{causal ? '未来位置在 softmax 前被设为 −∞，每一行只允许读取当前位置及之前的位置。' : '关闭 mask 后每个位置都能读取整个序列，这是双向自注意力；其预测头不再具有严格的自回归约束。'}</p></>}
          {attentionView === 'weights' && <><Formula value={String.raw`A_{ij}=\frac{\exp(S_{ij})}{\sum_k\exp(S_{ik})}`} /><MatrixView label="Attention · 每行和为 1" matrix={selectedHead.attention} probability /><p className="arch-note">行和：{selectedHead.attention.map(row => row.reduce((sum, x) => sum + x, 0).toFixed(4)).join(' · ')}。实现先减去行最大值以避免溢出。</p></>}
          {attentionView === 'output' && <><Formula value={String.raw`O_h=A_hV_h,\quad O=\mathrm{Concat}(O_1,O_2)W_O`} /><MatrixView label={`Head ${head + 1} · 加权求和`} matrix={selectedHead.output} /><MatrixView label="合并两头并投影 · MHA output" matrix={result.projected} /></>}
        </> : stage.id === 'ffn' ? <>
          <div className="arch-tabs" role="group" aria-label="FFN 计算步骤">{([['linear1', '① Linear 8 → 16'], ['gelu', '② GELU'], ['linear2', '③ Linear 16 → 8']] as const).map(([key, label]) => <button type="button" key={key} className={ffnView === key ? 'active' : ''} aria-pressed={ffnView === key} onClick={() => setFfnView(key)}>{label}</button>)}</div>
          <MatrixView label={ffnView === 'linear1' ? '第一层线性变换 + 偏置' : ffnView === 'gelu' ? '逐元素 GELU 激活' : '第二层线性变换 + 偏置'} matrix={ffnView === 'linear1' ? result.hidden : ffnView === 'gelu' ? result.activated : result.ffn} />
          {ffnView === 'gelu' && <p className="arch-note">使用 GELU 的 tanh 近似，输入乘以一个平滑门；不是把所有负数直接截为 0。</p>}
        </> : stage.id === 'output' ? <><div className="arch-probabilities" aria-label="最后位置的下一个 token 概率">{result.probabilities[3].map((p, index) => <div key={index}><span>{vocabulary[index]}</span><div><i style={{ width: `${p * 100}%` }} /></div><strong>{(p * 100).toFixed(1)}%</strong></div>)}</div><p className="arch-note">以上为末位置的完整 12 类分布，总和为 100%。这些值来自本示例的实际前向计算，并非预训练模型的预测。</p></> : <MatrixView label={stage.id === 'embedding' ? 'Embedding + Position' : `${stage.title} · 输出`} matrix={matrix} />}
        <details className="arch-accounting"><summary>配置与参数核算</summary><p>单个 Pre-LN block；无 dropout。embedding 96 + QKV/O 256 + block 内 LayerNorm 32 + FFN 280 + 最终 LayerNorm 16 + 未共享 LM head 108 = <strong>{architectureParameterTotal}</strong>。输入 token、位置编码、激活值和注意力矩阵不计入参数。所有表格按行展示 token；数字保留三位小数，内部计算使用完整精度。</p></details>
      </div>
    </div>
  </section>;
}
