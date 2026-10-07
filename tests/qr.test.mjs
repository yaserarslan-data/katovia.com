import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import '../laboratuvar/js/katovia-qr.js';

// Independent legacy oracle remains in Git WITH its original notice. It is
// evaluated only in memory for regression; no vendor file is republished.
const baseline = '61eaacfcb2a760af2330ab34f7152b4592b1eb8e';
const vendor = execFileSync('git',['show',`${baseline}:laboratuvar/vendor/kjua-0.10.0.min.js`],{encoding:'utf8'});
function element(tag) {return {tag,attributes:{},children:[],style:{},setAttribute(k,v){this.attributes[k]=String(v);},getAttribute(k){return this.attributes[k];},appendChild(child){this.children.push(child);return child;}};}
const document = {createElementNS(_ns,tag){return element(tag);},createElement:element};
const sandbox = {document};sandbox.window=sandbox;sandbox.self=sandbox;
vm.runInNewContext(vendor,sandbox);
function legacy(text,version) {
 const size = version*4+17, svg=sandbox.kjua({render:'svg',text,size,minVersion:version,ecLevel:'M',quiet:0,rounded:0,crisp:true});
 const grid=Array.from({length:size},()=>Array(size).fill(false));
 const path=svg.children.find(e=>e.tag==='path').attributes.d;
 for(const segment of path.split('M ').slice(1)) {
  const points=[...segment.matchAll(/(?:^|L )([\d.]+) ([\d.]+) /g)].map(m=>[Number(m[1]),Number(m[2])]);
  if(points.length<4)continue;
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);
  if(Math.max(...xs)-x===1 && Math.max(...ys)-y===1)grid[y][x]=true;
 }
 let format=0;for(let i=0;i<6;i++)format|=Number(grid[i][8])<<i;format|=Number(grid[7][8])<<6;format|=Number(grid[8][8])<<7;format|=Number(grid[8][7])<<8;for(let i=9;i<15;i++)format|=Number(grid[8][14-i])<<i;
 return {grid,mask:((format^0x5412)>>>10)&7};
}
test('independent encoder matches legacy reference for all 40 versions, all blocks and format/version patterns',()=>{
 for(let version=1;version<=40;version++) {
  const text=`K${version}`,reference=legacy(text,version);
  const qr=globalThis.KatoviaQR.encode(text,{version,mask:reference.mask});
  assert.deepEqual(qr.modules,reference.grid,`version ${version}`);
 }
});
test('UTF-8 byte mode matches reference and ECI consumes exactly twelve bits',()=>{
 for(const text of ['İstanbul, çağrı, ıİşŞğĞ 🧩','https://katovia.com/?q=Türkçe','tel:+905551234567','WIFI:T:WPA;S:Katovia;P:şifre;;','BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Yaşar\r\nEND:VCARD\r\n']){
  const qr=globalThis.KatoviaQR.encode(text,{eci:false}),reference=legacy(text,qr.version);
  assert.deepEqual(globalThis.KatoviaQR.encode(text,{version:qr.version,mask:reference.mask,eci:false}).modules,reference.grid);
  assert.equal(globalThis.KatoviaQR.encode(text).byteLength,new TextEncoder().encode(text).length);
  assert.equal(globalThis.KatoviaQR.encode(text).eci,/[\u0080-\uffff]/.test(text));
 }
});
test('version selection respects byte capacity, bounds and all mask choices',()=>{
 assert.equal(globalThis.KatoviaQR.encode('a'.repeat(14)).version,1);
 assert.equal(globalThis.KatoviaQR.encode('a'.repeat(15)).version,2);
 assert.equal(globalThis.KatoviaQR.encode('a'.repeat(2331)).version,40);
 assert.throws(()=>globalThis.KatoviaQR.encode('a'.repeat(2332)),/capacity/);
 assert.throws(()=>globalThis.KatoviaQR.encode('a'.repeat(15),{version:1}),/capacity/);
 for(const version of [0,41,1.5])assert.throws(()=>globalThis.KatoviaQR.encode('x',{version}),/version/);
 for(const mask of [-1,8,0.5])assert.throws(()=>globalThis.KatoviaQR.encode('x',{mask}),/mask/);
 for(let mask=0;mask<8;mask++)assert.equal(globalThis.KatoviaQR.encode('x',{mask}).mask,mask);
 assert.throws(()=>globalThis.KatoviaQR.encode('x',{ecLevel:'L'}),/correction/);
});
test('independent installed OpenCV decoder reads rendered QR matrices including ECI UTF-8 and repaired data',()=>{
 const available=execFileSync('python',['-c','import importlib.util; print(bool(importlib.util.find_spec("cv2")))'],{encoding:'utf8'}).trim();
 if(available!=='True')return;
 const payloads=['https://katovia.com/','Katovia text','İstanbul çağrı 🧩','tel:+905551234567','https://wa.me/905551234567?text=Merhaba','WIFI:T:WPA;S:Katovia;P:şifre;;','BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Yaşar Arslan\r\nTEL:+905551234567\r\nEND:VCARD\r\n'];
 const cases=payloads.map(expected=>({name:expected.slice(0,25),expected,modules:globalThis.KatoviaQR.encode(expected).modules}));
 const damaged=globalThis.KatoviaQR.encode('Katovia error correction');
 for(let i=0;i<4;i++)damaged.modules[damaged.size-1][damaged.size-1-i]=!damaged.modules[damaged.size-1][damaged.size-1-i];
 cases.push({name:'damaged data modules',expected:'Katovia error correction',modules:damaged.modules});
 const result=JSON.parse(execFileSync('python',['tests/qr-decode.py'],{input:JSON.stringify(cases),encoding:'utf8',timeout:45000}));
 assert.equal(result.length,8);assert.ok(result.every(item=>item.matched));
});
