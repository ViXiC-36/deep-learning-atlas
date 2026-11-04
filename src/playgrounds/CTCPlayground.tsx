import { useMemo, useState } from 'react';
import { ctcCollapse, ctcDistribution, normalizeWeights } from '../lib/math';
import './playgrounds.css';

const alphabet = ['', 'a', 'b'];
const initialWeights = [
  [0.45, 0.5, 0.05],
  [0.5, 0.45, 0.05],
  [0.1, 0.8, 0.1],
  [0.55, 0.4, 0.05],
];
const initialPath = ['a', '', 'a', 'a'];
const displayToken = (token: string) => token === '' ? '∅' : token;
const displayTranscript = (text: string) => text === '' ? '（空序列）' : text;
const percent = (value: number) => `${(100 * value).toFixed(2)}%`;

export default function CTCPlayground() {
  const [weights, setWeights] = useState(() => initialWeights.map(row => [...row]));
  const [path, setPath] = useState([...initialPath]);
  const probabilities = useMemo(() => weights.map(normalizeWeights), [weights]);
  const distribution = useMemo(() => ctcDistribution(probabilities, alphabet), [probabilities]);
  const greedyPath = probabilities.map(row => alphabet[row.indexOf(Math.max(...row))]);
  const greedyText = ctcCollapse(greedyPath).join('');
  const merged = path.filter((token, index) => index === 0 || token !== path[index - 1]);
  const text = ctcCollapse(path).join('');
  const pathProbability = probabilities.reduce((product, row, frame) => product * row[alphabet.indexOf(path[frame])], 1);
  const transcriptProbability = distribution.find(item => item.text === text)?.probability ?? 0;
  const best = distribution[0];
  const greedyTranscriptProbability = distribution.find(item => item.text === greedyText)?.probability ?? 0;

  function setWeight(frame: number, token: number, value: string) {
    const number = Number(value);
    setWeights(current => current.map((row, index) => index === frame
      ? row.map((weight, tokenIndex) => tokenIndex === token ? Math.max(0, Math.min(1, Number.isFinite(number) ? number : 0)) : weight)
      : row));
  }

  function reset() {
    setWeights(initialWeights.map(row => [...row]));
    setPath([...initialPath]);
  }

  return (
    <section className="lab ctc-lab" aria-label="CTC 交互实验">
      <div className="lab-heading">
        <div><span className="eyebrow">CTC PLAYGROUND</span><h3>同一句转写，可以来自许多条路径。</h3></div>
        <button type="button" onClick={reset}>重置实验</button>
      </div>
      <p className="lab-note">修改四帧的分布，再编辑候选路径。这里真实枚举全部 3⁴ = 81 条路径，累加同一转写的概率；∅ 表示 Blank。</p>

      <fieldset className="lab-fieldset">
        <legend>1 / 每帧概率 · Frame-level probabilities</legend>
        <p className="lab-note">输入非负权重，每列按帧归一化；整列为 0 时使用均匀分布。下方颜色与百分比展示实际参与计算的概率。</p>
        <div className="matrix-scroll" style={{ overflowX: 'auto' }}>
          <table className="matrix-table ctc-probability-table">
            <thead><tr><th scope="col">符号</th>{probabilities.map((_, frame) => <th key={frame} scope="col">帧 {frame + 1}</th>)}</tr></thead>
            <tbody>{alphabet.map((token, tokenIndex) => (
              <tr key={tokenIndex}>
                <th scope="row">{displayToken(token)}{token === '' ? ' Blank' : ''}</th>
                {probabilities.map((row, frame) => (
                  <td key={frame} style={{ backgroundColor: `rgba(91, 126, 219, ${0.04 + row[tokenIndex] * 0.25})` }}>
                    <input type="number" min="0" max="1" step="0.05" inputMode="decimal"
                      aria-label={`帧 ${frame + 1} 的 ${token === '' ? 'Blank' : token} 权重`}
                      value={weights[frame][tokenIndex]} onChange={event => setWeight(frame, tokenIndex, event.target.value)}
                      style={{ width: '4.5rem' }} />
                    <div className="matrix-value">{percent(row[tokenIndex])}</div>
                  </td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </fieldset>

      <fieldset className="lab-fieldset">
        <legend>2 / 编辑路径 · Alignment path</legend>
        <div className="lab-controls">
          {path.map((token, frame) => (
            <label key={frame}>帧 {frame + 1}
              <select aria-label={`候选路径帧 ${frame + 1}`} value={token} onChange={event => setPath(current => current.map((item, index) => index === frame ? event.target.value : item))}>
                {alphabet.map((symbol, index) => <option key={index} value={symbol}>{displayToken(symbol)}{symbol === '' ? ' Blank' : ''}</option>)}
              </select>
            </label>
          ))}
          <button type="button" onClick={() => setPath([...greedyPath])}>使用逐帧贪心路径</button>
        </div>
        <div className="ctc-collapse" aria-live="polite">
          <div className="ctc-step"><span>原始路径 π</span><strong>{path.map(displayToken).join(' · ')}</strong></div>
          <div className="ctc-step"><span>① 合并相邻重复</span><strong>{merged.map(displayToken).join(' · ')}</strong></div>
          <div className="ctc-step"><span>② 删除 Blank</span><strong>{displayTranscript(text)}</strong></div>
        </div>
        <p className="lab-note">顺序不能交换：a · ∅ · a → aa，而 a · a · a → a。Blank 将两次相同标签分隔开。</p>
        <div className="stat-row">
          <div><span>当前路径 P(π | x)</span><strong>{percent(pathProbability)}</strong><small>四帧所选标签的概率相乘</small></div>
          <div><span>转写 P({displayTranscript(text)} | x)</span><strong>{percent(transcriptProbability)}</strong><small>所有折叠到该转写的路径概率之和</small></div>
        </div>
      </fieldset>

      <fieldset className="lab-fieldset">
        <legend>3 / 贪心路径 ≠ 最优转写</legend>
        <div className="stat-row">
          <div><span>逐帧取最大概率后折叠</span><strong>{displayTranscript(greedyText)}</strong><small>序列概率 {percent(greedyTranscriptProbability)}</small></div>
          <div><span>枚举路径并求和后的最优转写</span><strong>{displayTranscript(best.text)}</strong><small>序列概率 {percent(best.probability)}</small></div>
        </div>
        <p className="lab-note">{greedyText === best.text
          ? '此时两种方法恰好得到相同转写；这并不保证任意分布下都会一致。'
          : '此时贪心解码与最优序列不同：单条最佳路径，不一定属于概率总和最大的转写。'}</p>
        <div className="ctc-distribution" aria-label="概率最高的五个转写">
          {distribution.slice(0, 5).map(item => (
            <div className="ctc-distribution-row" key={item.text}>
              <span>{displayTranscript(item.text)}</span>
              <div className="probability-track"><div className="probability-fill" style={{ width: `${100 * item.probability}%` }} /></div>
              <strong>{percent(item.probability)}</strong>
            </div>
          ))}
        </div>
        <p className="lab-note">教学示例使用精确枚举。真实语音的帧数很大，训练时用动态规划求目标序列概率，解码常用贪心或 Beam Search；不能把全部路径逐一展开。</p>
      </fieldset>
    </section>
  );
}
