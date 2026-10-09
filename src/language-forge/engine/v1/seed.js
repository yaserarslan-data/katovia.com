export function canonicalSeed(seed) {
  if (typeof seed !== 'string' || !/^[0-9a-fA-F]{32}$/.test(seed)) throw new TypeError('seed: expected 32 hexadecimal characters');
  return seed.toLowerCase(); // ASCII hex only; no whitespace or separators accepted.
}
// First-party non-cryptographic four-lane expansion. No 32-bit collapse of root seed.
// Length-framed ASCII domains, fixed word order, imul and unsigned shifts are e1 ABI.
export function deriveState(seed, engineVersion, datasetVersion, namespace) {
  const root = canonicalSeed(seed);
  const state = [0,1,2,3].map(i => parseInt(root.slice(i*8,i*8+8),16) >>> 0);
  const fields = [engineVersion,datasetVersion,namespace];
  if (fields.some(x=>typeof x!=='string'||!x.length||x.length>512||!/^[\x20-\x7e]+$/.test(x))) throw new TypeError('stream domain');
  const domain = fields.map(x=>`${x.length}:${x}`).join('');
  for (let round=0; round<4; round++) {
    for (let i=0;i<domain.length;i++) {
      const lane=(i+round)%4, next=(lane+1)%4;
      state[lane] = Math.imul((state[lane] ^ domain.charCodeAt(i) ^ (round+1)) >>> 0, 0x85ebca6b) >>> 0;
      state[lane] = (state[lane] ^ (state[next] >>> 13) ^ (state[next] << 19)) >>> 0;
    }
    for(let i=0;i<4;i++) {
      let x=(state[i]^state[(i+1)%4]^0x9e3779b9)>>>0;
      x=Math.imul(x^(x>>>16),0x7feb352d)>>>0;
      x=Math.imul(x^(x>>>15),0x846ca68b)>>>0;
      state[i]=(x^(x>>>16))>>>0;
    }
  }
  if (state.every(x=>x===0)) state[3]=1;
  return state;
}
