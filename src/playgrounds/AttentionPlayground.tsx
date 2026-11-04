import { useEffect, useMemo, useState } from 'react';
import { matmul, scaledAttention, teachingEmbedding } from '../lib/math';
import './playgrounds.css';

const matrices = [
  { q:[[1,0],[0,1],[0.5,0], [0,0.5]], k:[[0.5,0],[0,1],[1,0],[0,0.5]], v:[[1,0],[0,1],[-0.5,0],[0,0.5]] },
  { q:[[0,1],[1,0],[0,0.5],[-0.5,0]], k:[[0,0.5],[0.5,0],[0,1],[1,0]], v:[[0,0.5],[0.5,0],[0,1],[1,0]] },
];
const wo = [[1,0,0.2,0],[0,1,0,0.2],[0.2,0,1,0],[0,0.2,0,1]];
const stages = ['Token → 向量', '投影 Q、K、V', '计算相似度', 'Softmax 权重', '加权汇总 V'];
const fmt = (value:number) => Number.isFinite(value) ? value.toFixed(2) : '−∞';

function NumericMatrix({title,data,labels,selected}:{title:string;data:number[][];labels?:string[];selected?:number}) {
  return <div className="numeric-matrix"><p className="matrix-caption">{title} <span>{data.length} × {data[0]?.length ?? 0}</span></p><div className="matrix-scroll"><table className="matrix-table"><tbody>{data.map((row,i)=><tr key={i} className={i===selected?'selected-row':''}>{labels && <th scope="row">{labels[i]}</th>}{row.map((value,j)=><td key={j} title={Number.isFinite(value)?value.toFixed(6):'被因果掩码屏蔽'}>{fmt(value)}</td>)}</tr>)}</tbody></table></div></div>;
}

export default function AttentionPlayground() {
  const [sentence,setSentence] = useState('我 喜欢 语音 模型');
  const [head,setHead] = useState(0);
  const [causal,setCausal] = useState(false);
  const [temperature,setTemperature] = useState(1);
  const [selected,setSelected] = useState(0);
  const [stage,setStage] = useState(0);
  const [playing,setPlaying] = useState(false);
  const tokens=useMemo(()=> { const input=sentence.trim(); return (input.includes(' ')?input.split(/\s+/):Array.from(input)).filter(Boolean).slice(0,6); },[sentence]);
  const embeddings=useMemo(()=>tokens.map(teachingEmbedding),[tokens]);
  const heads=useMemo(()=>embeddings.length?matrices.map(w=>{const q=matmul(embeddings,w.q),k=matmul(embeddings,w.k),v=matmul(embeddings,w.v);return {q,k,v,...scaledAttention(q,k,v,causal,temperature)};}):[],[embeddings,causal,temperature]);
  const current=heads[head];
  const query=Math.min(selected,Math.max(0,tokens.length-1));
  const combined=heads.length?matmul(heads[0].output.map((row,i)=>[...row,...heads[1].output[i]]),wo):[];
  useEffect(()=>{ if(!playing)return;const timer=window.setInterval(()=>setStage(s=>{if(s>=4){setPlaying(false);return 4;}return s+1;}),1000);return()=>window.clearInterval(timer);},[playing]);
  const reset=()=>{setSentence('我 喜欢 语音 模型');setHead(0);setCausal(false);setTemperature(1);setSelected(0);setStage(0);setPlaying(false);};
  return <div className="lab attention-lab">
    <div className="lab-heading"><div><span className="lab-kicker">ATTENTION UNDER THE HOOD</span><h3>逐项算出「关注」的权重</h3></div><button type="button" onClick={reset}>重置</button></div>
    <p className="lab-note">确定性的微型教学模型：Embedding 由字符哈希生成，投影矩阵固定，未训练、不具有语言语义，也不包含位置编码。所有矩阵均实时计算。</p>
    <label className="sentence-input">输入短句（空格分词，最多 6 个；无空格时按字符拆分）<input type="text" value={sentence} maxLength={120} onChange={e=>{setSentence(e.target.value);setStage(0);setPlaying(false);}} placeholder="我 喜欢 语音 模型"/></label>
    <div className="lab-controls"><label>注意力头 Head<select value={head} onChange={e=>setHead(Number(e.target.value))}><option value={0}>Head 1</option><option value={1}>Head 2</option></select></label><label>温度 τ<output>{temperature.toFixed(2)}</output><input type="range" aria-label="温度 τ" min="0.2" max="2" step="0.05" value={temperature} onChange={e=>setTemperature(Number(e.target.value))}/></label><label className="checkbox-label"><input type="checkbox" checked={causal} onChange={e=>setCausal(e.target.checked)}/>因果掩码 Causal mask</label></div>
    {!tokens.length ? <p className="lab-note">输入至少一个 Token，开始计算。</p> : <>
      <div className="attention-steps">{stages.map((label,i)=><button type="button" key={label} className={stage===i?'active':''} onClick={()=>{setStage(i);setPlaying(false);}} aria-pressed={stage===i}><span>0{i+1}</span>{label}</button>)}</div>
      <div className="lab-controls button-row"><button type="button" onClick={()=>{setPlaying(false);setStage(s=>Math.max(0,s-1));}} disabled={stage===0}>上一步</button><button type="button" onClick={()=>{setPlaying(false);setStage(s=>Math.min(4,s+1));}} disabled={stage===4}>下一步</button><button type="button" onClick={()=>{if(stage===4)setStage(0);setPlaying(p=>!p);}}>{playing?'暂停':'自动演示'}</button></div>
      <div className="token-picker"><span>选择 Query：</span>{tokens.map((token,i)=><button type="button" className={query===i?'active':''} onClick={()=>setSelected(i)} key={i} aria-pressed={query===i}>{token}<small>{i+1}</small></button>)}</div>
      <div className="attention-stage" aria-live="polite">
        {stage===0 && <><p>每个 Token 映射到 4 维向量。重复 Token 在此模型中具有相同向量；真实模型的 Embedding 通常需要学习。</p><NumericMatrix title="X · Token Embedding" data={embeddings} labels={tokens} selected={query}/></>}
        {stage===1 && <><p>X ∈ ℝⁿˣ⁴，WQ、WK、WV ∈ ℝ⁴ˣ²。每个头得到 Q、K、V ∈ ℝⁿˣ²；两头使用不同的投影。</p><div className="matrix-gallery"><NumericMatrix title="Q = XWQ" data={current.q} labels={tokens} selected={query}/><NumericMatrix title="K = XWK" data={current.k} labels={tokens}/><NumericMatrix title="V = XWV" data={current.v} labels={tokens}/></div><details><summary>查看此 Head 的固定投影矩阵</summary><div className="matrix-gallery"><NumericMatrix title="WQ" data={matrices[head].q}/><NumericMatrix title="WK" data={matrices[head].k}/><NumericMatrix title="WV" data={matrices[head].v}/></div></details></>}
        {stage===2 && <><p>Sᵢⱼ = (qᵢ · kⱼ) / (√2 × τ)。因果掩码把未来位置设为 −∞，使其在 Softmax 后变为 0。</p><NumericMatrix title="S · Scaled scores" data={current.scores} labels={tokens} selected={query}/><p className="calculation-line">当前 Query「{tokens[query]}」与自身：({current.q[query].map((v,i)=>`${fmt(v)} × ${fmt(current.k[query][i])}`).join(' + ')}) / (√2 × {temperature.toFixed(2)}) = {fmt(current.scores[query][query])}</p></>}
        {stage===3 && <p>对每一行独立归一化：Aᵢⱼ = exp(Sᵢⱼ) / Σₖ exp(Sᵢₖ)。每一行之和为 1；颜色表示权重大小，不是词语之间的真实语义关系。</p>}
        {stage===4 && <><p>Oᵢ = Σⱼ AᵢⱼVⱼ。Q、K 决定如何取信息，V 提供被汇总的信息。</p><NumericMatrix title={`O · Head ${head+1} 输出`} data={current.output} labels={tokens} selected={query}/><p className="calculation-line">输出第 1 维：{current.weights[query].map((a,j)=>`${a.toFixed(3)} × ${fmt(current.v[j][0])}`).join(' + ')} = {current.output[query][0].toFixed(4)}</p><details><summary>查看两头拼接与输出投影</summary><p>Concat(O₁,O₂) ∈ ℝⁿˣ⁴，再乘固定 WO ∈ ℝ⁴ˣ⁴。这是一个注意力子层，尚未加入残差、归一化或 FFN。</p><NumericMatrix title="WO" data={wo}/><NumericMatrix title="Concat(O₁,O₂) WO" data={combined} labels={tokens} selected={query}/></details></>}
      </div>
      <div className="attention-heatmap"><p className="matrix-caption">Attention Matrix A <span>{tokens.length} × {tokens.length} · 行 Query / 列 Key</span></p><div className="matrix-scroll"><table className="matrix-table heatmap-table"><thead><tr><th scope="col">Q ↓ / K →</th>{tokens.map((token,i)=><th scope="col" key={i}>{token}</th>)}</tr></thead><tbody>{current.weights.map((row,i)=><tr key={i} className={query===i?'selected-row':''}><th scope="row"><button type="button" onClick={()=>setSelected(i)} aria-label={`选择第 ${i+1} 个 Query ${tokens[i]}`}>{tokens[i]}</button></th>{row.map((weight,j)=><td key={j} style={{background:`rgba(41,139,119,${0.06+weight*0.78})`}} title={`${tokens[i]} → ${tokens[j]}：${weight.toFixed(6)}`}>{(weight*100).toFixed(1)}%</td>)}</tr>)}</tbody></table></div><p className="lab-note">当前行权重之和：{current.weights[query].reduce((a,b)=>a+b,0).toFixed(6)}。τ 是演示用温度，标准 Attention 通常设为 1。</p></div>
    </>}
  </div>;
}
