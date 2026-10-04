import { t, i18n } from '../i18n/index.js';
import '../styles/play.css';
export function createCanvasRuntime(root, { draw, interact = () => {}, resize = () => {}, dispose = () => {} }) {
  const canvas = root.querySelector('canvas'); const context = canvas.getContext('2d', { alpha:false });
  const toggle = root.querySelector('[data-motion-toggle]'); const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width=1,height=1,dpr=1,raf=0,previous=0,slowFrames=0,mean=16,budget=400,limit=60,dead=false,paused=reduced.matches;
  const pointer={x:.5,y:.5,active:false}; const removers=[];
  const listen=(target,event,fn,options) => { target.addEventListener(event,fn,options);removers.push(()=>target.removeEventListener(event,fn,options)); };
  function paint(delta) { draw({context,width,height,dpr,delta,pointer,budget,now:performance.now()}); }
  function measure() { const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);budget=Math.max(120,Math.min(1100,Math.round(width*height/(dpr>1?850:600))));resize({width,height,dpr,budget});paint(0); }
  function frame(now) { raf=0;if(dead||paused||document.hidden)return;const elapsed=previous?now-previous:16;if(limit===30&&elapsed<32){raf=requestAnimationFrame(frame);return;}previous=now;mean=mean*.95+elapsed*.05;if(mean>24&&++slowFrames>45){budget=Math.max(100,Math.floor(budget*.75));if(budget===100)limit=30;slowFrames=0;}else if(mean<20)slowFrames=0;root.dataset.quality=String(budget);root.dataset.frameTarget=String(limit);paint(Math.min(elapsed,50)/1000);raf=requestAnimationFrame(frame); }
  function resume() {cancelAnimationFrame(raf);raf=0;previous=0;if(!dead&&!paused&&!document.hidden)raf=requestAnimationFrame(frame);toggle.textContent=t(paused?'play.resume':'play.pause');toggle.setAttribute('aria-pressed',String(paused));}
  listen(toggle,'click',()=>{paused=!paused;resume();});listen(document,'visibilitychange',resume);listen(reduced,'change',()=>{paused=reduced.matches;resume();});
  function position(event) {const rect=canvas.getBoundingClientRect();pointer.x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));pointer.y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));pointer.active=true;}
  listen(canvas,'pointermove',(event)=>{position(event);interact('move',pointer,event);if(paused)paint(0);});
  listen(canvas,'pointerdown',(event)=>{if(event.button!==0)return;event.preventDefault();canvas.focus({preventScroll:true});position(event);try{canvas.setPointerCapture(event.pointerId);}catch{}interact('press',pointer,event);paint(0);});
  listen(canvas,'pointerup',(event)=>{interact('release',pointer,event);pointer.active=false;});listen(canvas,'pointercancel',()=>{pointer.active=false;});listen(canvas,'pointerleave',()=>{pointer.active=false;});
  listen(canvas,'keydown',(event)=>{if([' ','Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();if(event.repeat)return;pointer.active=true;if(event.key==='ArrowLeft')pointer.x=Math.max(0,pointer.x-.08);if(event.key==='ArrowRight')pointer.x=Math.min(1,pointer.x+.08);if(event.key==='ArrowUp')pointer.y=Math.max(0,pointer.y-.08);if(event.key==='ArrowDown')pointer.y=Math.min(1,pointer.y+.08);interact('press',pointer,event);paint(0);}});
  const observer=new ResizeObserver(measure);observer.observe(canvas);const unsubscribe=i18n.subscribe(resume);measure();resume();
  return {get paused(){return paused;},redraw(){paint(0);},dispose(){dead=true;cancelAnimationFrame(raf);observer.disconnect();removers.forEach((fn)=>fn());unsubscribe();dispose();context.clearRect(0,0,width,height);canvas.width=1;canvas.height=1;}};
}
