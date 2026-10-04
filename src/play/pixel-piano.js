import { createCanvasRuntime } from './canvas-runtime.js';
export function mount(root) {
  let audio, voices=new Set(), pixels=[], notes=0;
  const sound=root.querySelector('[data-sound-toggle]'); let muted=false;
  const pentatonic=[0,2,4,7,9,12,14,16,19,21];
  function note(pointer) {
    const index=Math.min(9,Math.floor(pointer.x*10));const frequency=220*2**(pentatonic[index]/12);
    pixels.push({x:pointer.x,y:pointer.y,hue:index*30+140,age:0});if(pixels.length>80)pixels.shift();root.dataset.notes=String(++notes);
    if(muted)return;
    try {audio??=new (window.AudioContext||window.webkitAudioContext)();void audio.resume().catch(()=>{});if(voices.size>=12)return;
      const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;
      const now=audio.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.07,now+.015);gain.gain.exponentialRampToValueAtTime(.001,now+.65);oscillator.connect(gain);gain.connect(audio.destination);voices.add(oscillator);oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(now);oscillator.stop(now+.7);
    }catch {muted=true;sound.setAttribute('aria-pressed','true');}
  }
  const toggle=()=>{muted=!muted;sound.setAttribute('aria-pressed',String(muted));if(muted)for(const voice of voices)try{voice.stop();}catch{}};
  sound.addEventListener('click',toggle);
  const runtime=createCanvasRuntime(root,{interact(kind,p,event){if(kind==='press')note({...p});if(kind==='move'&&event.buttons&&event.timeStamp-(root._lastNote||0)>100){root._lastNote=event.timeStamp;note({...p});}},
    draw({context:c,width:w,height:h,delta:dt}) {c.fillStyle='#080d18';c.fillRect(0,0,w,h);for(let i=0;i<10;i++){c.fillStyle=`hsla(${i*30+140},70%,60%,.12)`;c.fillRect(i*w/10+2,h*.75,w/10-4,h*.25);}for(const pixel of pixels){pixel.age+=dt;const x=pixel.x*w,y=pixel.y*h;c.strokeStyle=`hsla(${pixel.hue},90%,70%,${Math.max(0,1-pixel.age/2)})`;c.lineWidth=3;c.strokeRect(x-16-pixel.age*40,y-16-pixel.age*40,32+pixel.age*80,32+pixel.age*80);c.fillStyle=`hsla(${pixel.hue},90%,70%,${Math.max(0,1-pixel.age)})`;c.fillRect(x-12,y-12,24,24);}pixels=pixels.filter(p=>p.age<2);},
    dispose(){for(const voice of voices)try{voice.stop();}catch{}voices.clear();void audio?.close().catch(()=>{});pixels=[];sound.removeEventListener('click',toggle);delete root._lastNote;}
  });
  const keys='asdfghjkl;';const keyboard=(event)=>{const index=keys.indexOf(event.key.toLowerCase());if(index<0||event.repeat||event.target!==root.querySelector('canvas'))return;event.preventDefault();note({x:(index+.5)/10,y:.75});runtime.redraw();};root.addEventListener('keydown',keyboard);
  const hidden=()=>{if(document.hidden){void audio?.suspend().catch(()=>{});for(const voice of voices)try{voice.stop();}catch{}}};document.addEventListener('visibilitychange',hidden);
  return {dispose(){root.removeEventListener('keydown',keyboard);document.removeEventListener('visibilitychange',hidden);runtime.dispose();}};
}
