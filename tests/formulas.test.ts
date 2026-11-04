import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import {chapters} from '../src/content/chapters.ts';

test('every displayed equation and notation entry renders as valid mathematics',()=>{
 for(const chapter of chapters) for(const [mode,sections] of Object.entries(chapter.sections)) for(const section of sections) {
  const expressions = [section.formula,...(section.notation||[]).map(entry=>entry.symbol)].filter((value):value is string=>!!value);
  for(const expression of expressions) assert.doesNotThrow(()=>katex.renderToString(expression,{throwOnError:true,strict:false}),`${chapter.id}/${mode}/${section.id}: ${expression}`);
 }
});
