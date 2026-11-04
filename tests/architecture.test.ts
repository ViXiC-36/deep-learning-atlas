import test from 'node:test';
import assert from 'node:assert/strict';
import { computeArchitecture, architectureConfig, architectureParameterCounts, architectureParameterTotal } from '../src/lib/architecture.ts';

const close = (actual: number, expected: number, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const shape = (matrix: number[][], rows: number, cols: number) => { assert.equal(matrix.length, rows); matrix.forEach(row => assert.equal(row.length, cols)); };

test('Transformer dimensions remain consistent through every residual and head', () => {
  const result = computeArchitecture(true);
  assert.equal(architectureConfig.heads * architectureConfig.headDimension, architectureConfig.modelDimension);
  for (const matrix of [result.e, result.position, result.x, result.n1, result.concat, result.projected, result.residual1, result.n2, result.ffn, result.residual2, result.finalNorm]) shape(matrix,4,8);
  shape(result.hidden,4,16); shape(result.activated,4,16);
  shape(result.logits,4,12); shape(result.probabilities,4,12);
  assert.equal(result.heads.length,2);
  result.heads.forEach(head => [head.q,head.k,head.v,head.scores,head.attention,head.output].forEach(matrix => shape(matrix,4,4)));
});

test('Architecture parameter inventory includes biases, three affine LayerNorms and untied output head', () => {
  assert.deepEqual(architectureParameterCounts, {embedding:96,attention:256,blockNorms:32,feedForward:280,finalNorm:16,languageHead:108});
  assert.equal(architectureParameterTotal,788);
});

test('Pre-LN normalizes each token independently, residual sums are exact', () => {
  const result = computeArchitecture(true);
  [result.n1,result.n2,result.finalNorm].forEach(matrix => matrix.forEach(row => {
    close(row.reduce((a,b)=>a+b,0)/row.length,0);
    const variance=row.reduce((a,b)=>a+b*b,0)/row.length;
    assert.ok(variance>0.999 && variance<1);
  }));
  result.x.forEach((row,i)=>row.forEach((value,j)=>{
    close(result.residual1[i][j],value+result.projected[i][j]);
    close(result.residual2[i][j],result.residual1[i][j]+result.ffn[i][j]);
  }));
});

test('Causal scores mask only future tokens; every attention and vocabulary row is normalized', () => {
  const result=computeArchitecture(true);
  result.heads.forEach(head=>head.attention.forEach((row,i)=>{
    close(row.reduce((a,b)=>a+b,0),1);
    row.forEach((value,j)=>{
      if(j>i){assert.equal(value,0);assert.equal(head.scores[i][j],-Infinity);}
      else {assert.ok(value>0);assert.ok(Number.isFinite(head.scores[i][j]));}
    });
  }));
  result.probabilities.forEach(row=>{close(row.reduce((a,b)=>a+b,0),1);row.forEach(p=>assert.ok(p>0&&p<1));});
});

test('Turning off mask changes contextual outputs but does not change projections or the last-position result', () => {
  const causal=computeArchitecture(true), bidirectional=computeArchitecture(false);
  assert.deepEqual(causal.n1,bidirectional.n1);
  assert.deepEqual(causal.heads[0].q,bidirectional.heads[0].q);
  assert.notDeepEqual(causal.heads[0].attention[0],bidirectional.heads[0].attention[0]);
  // A single block: last token sees the same complete prefix under both masks.
  causal.probabilities[3].forEach((p,i)=>close(p,bidirectional.probabilities[3][i]));
});

test('Sine/cosine position encoding starts with alternating 0 and 1 and forward pass is deterministic', () => {
  const result=computeArchitecture(true);
  assert.deepEqual(result.position[0],[0,1,0,1,0,1,0,1]);
  assert.deepEqual(result,computeArchitecture(true));
  close(result.position[1][0],Math.sin(1));
  close(result.position[1][2],Math.sin(0.1));
});
