import { useState } from 'react';
import katex from 'katex';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import type { Section } from '../content/types';

hljs.registerLanguage('python', python);

export function MathText({ text, display = false }: { text: string; display?: boolean }) {
  const html = katex.renderToString(text, { displayMode: display, throwOnError: false, strict: false });
  return display ? <div className="formula" dangerouslySetInnerHTML={{ __html: html }} />
    : <span className="inline-symbol" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="code-wrap"><div className="code-toolbar"><span>PYTHON / PYTORCH</span>
    <button onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }}>{copied ? '已复制 ✓' : '复制代码'}</button>
  </div><pre><code dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: 'python' }).value }} /></pre></div>;
}

export default function LessonSection({ section }: { section: Section }) {
  return <section className="lesson-section" id={`s-${section.id}`}>
    <h2>{section.title}</h2>
    {!!section.notation?.length && <div className="notation-guide" role="region" aria-label={`${section.title}：符号说明`}>
      <h3>先认符号</h3>
      <dl>{section.notation.map((item, index) => <div className="notation-entry" key={`${item.symbol}-${index}`}>
        <dt><MathText text={item.symbol} /></dt><dd><span>{item.meaning}</span>
          {item.shape && <span className="notation-shape">形状 / 范围：{item.shape}</span>}
          {item.example && <span className="notation-example">小例子：{item.example}</span>}
        </dd>
      </div>)}</dl>
    </div>}
    {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    {!!section.flow?.length && <figure className="lesson-flow"><figcaption>沿着这条计算顺序看</figcaption>
      <ol>{section.flow.map((step, index) => <li key={index}><span className="flow-step-number">{index + 1}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div></li>)}</ol>
    </figure>}
    {section.formula && <div className="explained-formula">
      {section.formulaReading && <p className="formula-reading"><strong>把公式读成一句话</strong>{section.formulaReading}</p>}
      <MathText text={section.formula} display />
    </div>}
    {section.bullets && <ul>{section.bullets.map((item, index) => <li key={index}>{item}</li>)}</ul>}
    {section.code && <Code code={section.code} />}
    {section.checkpoint && <details className="lesson-checkpoint"><summary>停一下，想一个小问题：{section.checkpoint.question}</summary><p>{section.checkpoint.answer}</p></details>}
  </section>;
}
