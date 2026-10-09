import { deriveState } from './seed.js';
export function createRandom(words) {
  if(!Array.isArray(words)||words.length!==4||words.some(x=>!Number.isInteger(x)||x<0||x>0xffffffff)||words.every(x=>x===0)) throw new TypeError('nonzero uint32[4] state required');
  let [a,b,c,d]=words;
  return Object.freeze({nextUint32() {
    const mixed=(a^(a<<11))>>>0;
    a=b;b=c;c=d;
    d=(d^(d>>>19)^mixed^(mixed>>>8))>>>0;
    return d;
  }});
}
export const createStream = (seed, engineVersion, datasetVersion, namespace) => createRandom(deriveState(seed,engineVersion,datasetVersion,namespace));
export function bounded(stream,bound) {
  if(!Number.isSafeInteger(bound)||bound<1||bound>0x100000000) throw new RangeError('integer bound');
  const ceiling=0x100000000-(0x100000000%bound);
  for(let i=0;i<1024;i++) {
    const x=stream.nextUint32();
    if(!Number.isInteger(x)||x<0||x>0xffffffff) throw new TypeError('uint32 stream');
    if(x<ceiling) return x%bound;
  }
  throw new RangeError('random rejection budget exhausted');
}
export function weighted(stream, rows) {
  if(!rows.length||rows.some(x=>!Number.isSafeInteger(x.weight)||x.weight<1)) throw new TypeError('positive integer weights');
  const total=rows.reduce((sum,x)=>sum+x.weight,0);
  let pick=bounded(stream,total);
  for(const row of rows) {if(pick<row.weight)return row;pick-=row.weight;}
  throw new Error('unreachable weighted selection');
}
