/* Katovia's independently authored QR Model 2 byte encoder and renderer.
 * Mathematical QR parameters; no vendored implementation or document asset.
 * Existing products use error-correction M. Versions 1–40, UTF-8 ECI 26.
 */
(function (root) {
  'use strict';
  const repair = [0,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
  const blockCount = [0,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
  function rawWords(version) {
    let bits = (16 * version + 128) * version + 64;
    if (version > 1) { const n = Math.floor(version / 7) + 2; bits -= (25 * n - 10) * n - 55; if (version >= 7) bits -= 36; }
    return Math.floor(bits / 8);
  }
  function capacity(version) { return rawWords(version) - repair[version] * blockCount[version]; }
  function product(a, b) {
    let value = 0;
    while (b) { if (b & 1) value ^= a; b >>>= 1; a <<= 1; if (a & 256) a ^= 0x11d; }
    return value;
  }
  function parity(data, length) {
    let polynomial = [1], power = 1;
    for (let i = 0; i < length; i++) {
      const next = Array(polynomial.length + 1).fill(0);
      polynomial.forEach((value, j) => { next[j] ^= value; next[j + 1] ^= product(value, power); });
      polynomial = next; power = product(power, 2);
    }
    const division = [...data, ...Array(length).fill(0)];
    for (let i = 0; i < data.length; i++) { const factor = division[i]; for (let j = 0; j < polynomial.length; j++) division[i + j] ^= product(polynomial[j], factor); }
    return division.slice(-length);
  }
  function interleave(data, version) {
    const count = blockCount[version], ec = repair[version], raw = rawWords(version);
    const shortLength = Math.floor(raw / count) - ec, shortCount = count - raw % count;
    const blocks = []; let offset = 0;
    for (let i = 0; i < count; i++) { const length = shortLength + (i >= shortCount ? 1 : 0), part = data.slice(offset, offset + length); blocks.push({data:part, ec:parity(part, ec)}); offset += length; }
    const words = [];
    for (let i = 0; i <= shortLength; i++) for (const block of blocks) if (i < block.data.length) words.push(block.data[i]);
    for (let i = 0; i < ec; i++) for (const block of blocks) words.push(block.ec[i]);
    return words;
  }
  function encode(text, options = {}) {
    if (typeof text !== 'string') throw new TypeError('QR text must be a string');
    if (options.ecLevel && options.ecLevel !== 'M') throw new RangeError('This product supports correction M');
    const bytes = Array.from(new TextEncoder().encode(text));
    const eci = options.eci !== false && bytes.some(byte => byte > 127);
    const minimum = options.version ?? options.minVersion ?? 1;
    if (!Number.isInteger(minimum) || minimum < 1 || minimum > 40) throw new RangeError('QR version must be 1–40');
    let version = minimum;
    const required = v => (eci ? 12 : 0) + 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
    while (version <= 40 && required(version) > capacity(version) * 8) version++;
    if (version > 40 || (options.version && version !== options.version)) throw new RangeError('QR payload exceeds the selected capacity');
    const bits = [], append = (value, width) => { for (let i = width - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
    if (eci) { append(7, 4); append(26, 8); }
    append(4, 4); append(bytes.length, version < 10 ? 8 : 16); bytes.forEach(byte => append(byte, 8));
    const dataBits = capacity(version) * 8;
    append(0, Math.min(4, dataBits - bits.length)); while (bits.length % 8) bits.push(0);
    const data = []; for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((value, bit) => value * 2 + bit, 0));
    for (let i = 0; data.length < capacity(version); i++) data.push(i % 2 ? 0x11 : 0xec);
    const words = interleave(data, version), size = version * 4 + 17;
    const modules = Array.from({length:size}, () => Array(size).fill(false));
    const reserved = Array.from({length:size}, () => Array(size).fill(false));
    const set = (x, y, black) => { if (x >= 0 && y >= 0 && x < size && y < size) { modules[y][x] = !!black; reserved[y][x] = true; } };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    for (const [cx, cy] of [[3,3],[size-4,3],[3,size-4]]) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const distance = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, distance !== 2 && distance !== 4); }
    if (version > 1) {
      const count = Math.floor(version / 7) + 2, step = version === 32 ? 26 : Math.floor((version * 4 + count * 2 + 1) / (count * 2 - 2)) * 2;
      const positions = [6]; for (let i = count - 1, position = size - 7; i > 0; i--, position -= step) positions.splice(1, 0, position);
      for (let y = 0; y < count; y++) for (let x = 0; x < count; x++) {
        if ((x === 0 && y === 0) || (x === 0 && y === count - 1) || (x === count - 1 && y === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(positions[x]+dx, positions[y]+dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
    function format(mask) {
      let remainder = mask << 10; for (let i = 14; i >= 10; i--) if ((remainder >>> i) & 1) remainder ^= 0x537 << (i - 10);
      const value = ((mask << 10) | remainder) ^ 0x5412, bit = i => (value >>> i) & 1;
      for (let i = 0; i < 6; i++) set(8, i, bit(i)); set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14-i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size-1-i, 8, bit(i)); for (let i = 8; i < 15; i++) set(8, size-15+i, bit(i)); set(8, size-8, true);
    }
    format(0);
    if (version >= 7) {
      let remainder = version << 12; for (let i = 17; i >= 12; i--) if ((remainder >>> i) & 1) remainder ^= 0x1f25 << (i - 12);
      const value = (version << 12) | remainder;
      for (let i = 0; i < 18; i++) { const a = size-11+i%3, b = Math.floor(i/3); set(a,b,(value >>> i)&1); set(b,a,(value >>> i)&1); }
    }
    let index = 0;
    for (let right = size-1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let i = 0; i < size; i++) { const y = ((right+1)&2) === 0 ? size-1-i : i; for (let j = 0; j < 2; j++) { const x = right-j; if (!reserved[y][x]) { modules[y][x] = index < words.length*8 ? !!((words[index >>> 3] >>> (7-index%8)) & 1) : false; index++; } } }
    }
    if (Math.floor(index / 8) !== words.length) throw new Error('QR placement invariant failed');
    function masked(mask) {
      return modules.map((row,y) => row.map((black,x) => {
        if (reserved[y][x]) return black;
        const conditions = [(x+y)%2===0,y%2===0,x%3===0,(x+y)%3===0,(Math.floor(y/2)+Math.floor(x/3))%2===0,x*y%2+x*y%3===0,(x*y%2+x*y%3)%2===0,((x+y)%2+x*y%3)%2===0];
        return conditions[mask] ? !black : black;
      }));
    }
    function penalty(grid) {
      let score = 0, dark = 0;
      for (let axis = 0; axis < 2; axis++) for (let i = 0; i < size; i++) {
        let previous = null, run = 0;
        for (let j = 0; j < size; j++) {
          const bit = axis ? grid[j][i] : grid[i][j]; if (!axis && bit) dark++;
          if (bit === previous) run++; else { if (run >= 5) score += run-2; run = 1; previous = bit; }
        }
        if (run >= 5) score += run-2;
        // Finder-like 1:1:3:1:1 runs can occur at more than one scale.
        // Check their light surroundings, including the quiet zone.
        const runs = [{black:false,length:4}];
        for(let j=0;j<size;j++){const black=axis?grid[j][i]:grid[i][j],last=runs[runs.length-1];if(last.black===black)last.length++;else runs.push({black,length:1});}
        if(runs[runs.length-1].black)runs.push({black:false,length:4});else runs[runs.length-1].length+=4;
        for(let j=1;j+5<runs.length;j++){
          const n=runs[j].length;
          if(!runs[j].black||runs[j+1].length!==n||runs[j+2].length!==n*3||runs[j+3].length!==n||runs[j+4].length!==n)continue;
          if(runs[j-1].length>=n*4&&runs[j+5].length>=n)score+=40;
          if(runs[j+5].length>=n*4&&runs[j-1].length>=n)score+=40;
        }
      }
      for (let y = 0; y < size-1; y++) for (let x = 0; x < size-1; x++) if (grid[y][x] === grid[y][x+1] && grid[y][x] === grid[y+1][x] && grid[y][x] === grid[y+1][x+1]) score += 3;
      return score + Math.floor(Math.abs(dark*20-size*size*10)/(size*size))*10;
    }
    let chosen = 0, best = Infinity, output;
    if (options.mask !== undefined && (!Number.isInteger(options.mask) || options.mask < 0 || options.mask > 7)) throw new RangeError('QR mask must be 0–7');
    for (let mask = 0; mask < 8; mask++) {
      if (options.mask !== undefined && options.mask !== mask) continue;
      format(mask); const candidate = masked(mask), score = penalty(candidate);
      if (score < best) { best = score; chosen = mask; output = candidate; }
    }
    return {version, size, mask:chosen, ecLevel:'M', modules:output, eci, byteLength:bytes.length};
  }
  function render(options = {}) {
    const qr = encode(options.text, options), quiet = options.quiet ?? 4, dimension = options.size ?? 320;
    if (!Number.isInteger(quiet) || quiet < 4 || !Number.isInteger(dimension) || dimension < qr.size + quiet*2) throw new RangeError('QR requires a four-module quiet zone and sufficient size');
    const total = qr.size + quiet*2, fill = options.fill || '#000000', back = options.back || '#ffffff';
    if (!/^#[0-9a-f]{6}$/i.test(fill) || !/^#[0-9a-f]{6}$/i.test(back)) throw new RangeError('QR colors must be RGB hex');
    if (options.render === 'svg') {
      const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns,'svg'); svg.setAttribute('viewBox',`0 0 ${total} ${total}`); svg.setAttribute('width',dimension); svg.setAttribute('height',dimension); svg.setAttribute('shape-rendering','crispEdges');
      const background = document.createElementNS(ns,'rect'); background.setAttribute('width',total); background.setAttribute('height',total); background.setAttribute('fill',back); svg.append(background);
      const path = document.createElementNS(ns,'path'), segments = [];
      qr.modules.forEach((row,y) => row.forEach((black,x) => { if (black) segments.push(`M${x+quiet} ${y+quiet}h1v1h-1z`); })); path.setAttribute('d',segments.join('')); path.setAttribute('fill',fill); svg.append(path); return svg;
    }
    if (options.render && options.render !== 'canvas') throw new RangeError('Unsupported QR render mode');
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = dimension; const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable'); context.fillStyle = back; context.fillRect(0,0,dimension,dimension); context.fillStyle = fill;
    const modulePixels = Math.floor(dimension/total), offset = Math.floor((dimension-modulePixels*total)/2);
    qr.modules.forEach((row,y) => row.forEach((black,x) => { if (black) context.fillRect(offset+(x+quiet)*modulePixels,offset+(y+quiet)*modulePixels,modulePixels,modulePixels); }));
    canvas.dataset.qrVersion = qr.version; return canvas;
  }
  root.KatoviaQR = Object.freeze({encode,render});
}(typeof window === 'undefined' ? globalThis : window));
