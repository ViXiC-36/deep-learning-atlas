export default function SymbolKey({items, title='这里的符号'}:{items:[string,string][];title?:string}) {
 return <div className="symbol-key"><strong>{title}</strong><dl>{items.map(([symbol,meaning])=><div key={symbol}><dt>{symbol}</dt><dd>{meaning}</dd></div>)}</dl></div>;
}
