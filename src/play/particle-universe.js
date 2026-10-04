import { createCanvasRuntime } from './canvas-runtime.js';
export function mount(root) {
  let particles=[];let mode='attract';let burst=0;const select=root.querySelector('[data-play-mode]');const onMode=()=>{mode=select.value;};select.addEventListener('change',onMode);
  const particle=(width,height)=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*20,hue:Math.random()*80+155});
  const runtime=createCanvasRuntime(root,{
    resize({width,height,budget}) {particles=Array.from({length:budget},()=>particle(width,height));},
    interact(kind) {if(kind==='press')burst=1;},
    draw({context:c,width:w,height:h,delta:dt,pointer:p,budget,now}) {
      if(particles.length>budget)particles.length=budget;c.fillStyle='rgba(5,12,20,.19)';c.fillRect(0,0,w,h);
      const x=p.active?p.x*w:w*(.5+.12*Math.cos(now/3200));const y=p.active?p.y*h:h*(.5+.16*Math.sin(now/2600));
      const glow=c.createRadialGradient(x,y,0,x,y,Math.max(w,h)*.6);glow.addColorStop(0,'rgba(28,70,90,.07)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,w,h);
      for(const q of particles){const dx=x-q.x,dy=y-q.y,d=Math.max(30,Math.hypot(dx,dy));const force=(mode==='repel'?-1:1)*45/d;q.vx+=(mode==='orbit'?-dy:dx)*force*dt;q.vy+=(mode==='orbit'?dx:dy)*force*dt;if(burst){q.vx-=dx/d*100;q.vy-=dy/d*100;}q.vx*=Math.pow(.99,dt*60);q.vy*=Math.pow(.99,dt*60);const oldX=q.x,oldY=q.y;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.x<0||q.x>w||q.y<0||q.y>h){Object.assign(q,particle(w,h));continue;}c.strokeStyle=`hsla(${q.hue},90%,70%,.75)`;c.lineWidth=1.2;c.beginPath();c.moveTo(oldX,oldY);c.lineTo(q.x+1,q.y+1);c.stroke();}burst=0;
    },
  });return {dispose(){select.removeEventListener('change',onMode);runtime.dispose();}};
}
