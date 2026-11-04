export type LearningMode = 'quick' | 'deep' | 'implementation';
export type Notation = { symbol: string; meaning: string; shape?: string; example?: string };
export type Section = {
 id: string; title: string; paragraphs: string[]; formula?: string; formulaReading?: string;
 notation?: Notation[]; code?: string; bullets?: string[];
 flow?: {label:string; detail:string}[];
 checkpoint?: {question:string; answer:string};
};
export type Chapter = {
 id: string; title:string; english:string; module:number; minutes:number; summary:string;
 topicIds?:string[]; prerequisites:string[]; sections:Record<LearningMode,Section[]>;
 misconceptions:string[]; references:{title:string;author:string;url:string;reason:string}[];
};
