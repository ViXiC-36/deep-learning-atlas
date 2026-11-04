import SymbolKey from '../components/SymbolKey';
import { useEffect, useState } from 'react';
import { scalarNetwork } from '../lib/math';
import './playgrounds.css';

const defaults = { x: 1.2, w: 0.6, b: -0.3, target: 0.8 };
const explanations = [
  '从输入开始。x 是固定样本；w 和 b 是训练时会更新的参数。',
  '线性变换 z = xw + b。局部导数分别为 ∂z/∂w = x、∂z/∂b = 1。',
  '非线性激活 a = tanh(z)。导数 1 − a² 在饱和区接近 0。',
  '比较预测与目标：L = ½(a − y)²。现在得到一个标量损失。',
  '反向起点：∂L/∂a = a − y。损失增大或减小的方向由它传给上游。',
  '穿过 tanh：∂L/∂z = (a − y)(1 − a²)。这是链式法则的一次局部相乘。',
  '分支累积到参数：∂L/∂w = (∂L/∂z)x，∂L/∂b = ∂L/∂z。现在可以更新。',
];
const fmt = (n: number) => n.toFixed(4);

export default function BackpropPlayground() {
  const [params, setParams] = useState(defaults);
  const [lr, setLr] = useState(0.1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const result = scalarNetwork(params.x, params.w, params.b, params.target);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setStep(s => { if (s >= 6) { setPlaying(false); return 6; } return s + 1; }), 900);
    return () => window.clearInterval(timer);
  }, [playing]);
  const update = (key: keyof typeof params, value: number) => { setParams(p => ({ ...p, [key]: value })); setStep(0); setPlaying(false); setHistory([]); };
  const reset = () => { setParams(defaults); setLr(0.1); setStep(0); setPlaying(false); setHistory([]); };
  const train = () => {
    const next = { ...params, w: params.w - lr * result.dW, b: params.b - lr * result.dB };
    setHistory(prev => [...prev, result.loss].slice(-19)); setParams(next); setStep(6); setPlaying(false);
  };
  const nodes = [
    { label: '输入 x', value: params.x, text: 'scalar', active: step === 0 },
    { label: '线性 z', value: result.z, text: 'xw + b', active: step === 1 || step === 5 || step === 6 },
    { label: '激活 a', value: result.activation, text: 'tanh(z)', active: step === 2 || step === 4 },
    { label: '损失 L', value: result.loss, text: '½(a − y)²', active: step === 3 },
  ];
  return <div className="lab backprop-lab">
    <div className="lab-heading"><div><span className="lab-kicker">LIVE COMPUTATION</span><h3>让梯度走一遍计算图</h3></div><button type="button" onClick={reset}>重置</button></div>
    <p className="lab-note">单神经元教学模型 · 标量输入 · Tanh 激活。修改参数后，每个数值与导数都会重新计算。</p>
    <SymbolKey items={[["x、w、b、y","依次是输入、权重、偏置、目标。它们在这个实验里都是一个数字（标量）。"],["z、a、L","z=xw+b 是激活前的数；a=tanh(z) 是预测；L 是预测与目标之间的平方误差的一半。"],["tanh、²、½","tanh 把数压到 −1 与 1 之间；² 表示乘自身；½ 表示一半。"],["∂L/∂w","偏导数：轻微改变 w 时，损失 L 的变化率。把 w 换成 a、z 或 b，读法相同。"],["η、←、SGD","η（伊塔）是学习率；← 表示把右侧结果赋给左侧参数；SGD 是随机梯度下降，这里用一个样本演示一步更新。"]]}/>
    <div className="lab-controls">
      {([['x','输入 x',-3,3],['w','权重 w',-3,3],['b','偏置 b',-3,3],['target','目标 y',-1,1]] as const).map(([key,label,min,max]) => <label key={key}>{label}<output>{fmt(params[key])}</output><input type="range" aria-label={label} min={Math.min(min,params[key])} max={Math.max(max,params[key])} step="0.05" value={params[key]} onChange={e => update(key,Number(e.target.value))}/></label>)}
    </div>
    <div className="gradient-flow" aria-label="前向与反向计算图">{nodes.map((node,index) => <div className={`flow-node ${node.active ? 'active' : ''}`} key={node.label}><span>{node.label}</span><strong>{fmt(node.value)}</strong><small>{node.text}</small>{index !== nodes.length - 1 && <span className={`flow-arrow ${step >= 4 ? 'reverse' : ''}`} aria-hidden="true">{step >= 4 ? '←' : '→'}</span>}</div>)}</div>
    <div className="step-description" aria-live="polite"><span className="step-number">{step + 1} / 7</span>{explanations[step]}</div>
    <div className="lab-controls button-row"><button type="button" onClick={() => { setPlaying(false); setStep(s => Math.max(0,s-1)); }} disabled={step===0}>上一步</button><button type="button" onClick={() => { setPlaying(false); setStep(s => Math.min(6,s+1)); }} disabled={step===6}>下一步</button><button type="button" onClick={() => { if (step===6) setStep(0); setPlaying(p=>!p); }}>{playing ? '暂停' : '自动演示'}</button><span className="lab-note">可随时暂停，也可全程手动操作</span></div>
    <div className="gradient-values stat-row">
      <div><span>∂L / ∂a</span><strong>{fmt(result.dActivation)}</strong></div><div><span>∂L / ∂z</span><strong>{fmt(result.dZ)}</strong></div><div><span>∂L / ∂w</span><strong>{fmt(result.dW)}</strong></div><div><span>∂L / ∂b</span><strong>{fmt(result.dB)}</strong></div>
    </div>
    <div className="lab-controls"><label>学习率 η<output>{lr.toFixed(2)}</output><input type="range" aria-label="学习率 η" min="0.01" max="2" step="0.01" value={lr} onChange={e=>setLr(Number(e.target.value))}/></label><button type="button" className="primary" onClick={train}>执行一次 SGD 更新</button></div>
    <p className="lab-note">w ← w − η ∂L/∂w；b ← b − η ∂L/∂b。大的学习率不保证每一步损失下降。把 z 推到饱和区，观察 tanh 如何压小梯度。</p>
    {!!history.length && <div className="loss-history" aria-live="polite"><span>最近 {history.length} 次更新的损失</span><div>{[...history,result.loss].map((value,index)=><span key={index} title={`第 ${index} 步：${value.toFixed(6)}`}>{value.toFixed(4)}{index<history.length?' → ':''}</span>)}</div></div>}
  </div>;
}
