import { createCanvasRuntime } from './canvas-runtime.js';
export function mount(root) {
 let fish=[],food=[],ripples=[];
 const runtime=createCanvasRuntime(root,{
  resize({width,height}){fish=Array.from({length:12},(_,i)=>({x:Math.random()*width,y:Math.random()*height,angle:Math.random()*Math.PI*2,phase:i,size:12+Math.random()*9,color:['#f28b61','#f3e9cb','#dc626d'][i%3]}));food=[];ripples=[];},
  interact(kind,p){if(kind==='press'){food.push({x:p.x,y:p.y,age:0});root.dataset.feedCount=String(Number(root.dataset.feedCount||0)+1);}if(kind==='press'||kind==='move'){ripples.push({x:p.x,y:p.y,age:0});if(ripples.length>40)ripples.shift();}if(food.length>20)food.shift();},
  draw({context:c,width:w,height:h,delta:dt,pointer:p,now}){
   const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#133f43');gradient.addColorStop(1,'#061e2b');c.fillStyle=gradient;c.fillRect(0,0,w,h);
   for(let i=0;i<6;i++){c.fillStyle='rgba(75,117,76,.45)';c.beginPath();c.ellipse(w*(.08+i*.18),h*.94,22,12,i*.7,0,Math.PI*2);c.fill();}
   for(const pellet of food){pellet.age+=dt;c.fillStyle='#f5d18a';c.beginPath();c.arc(pellet.x*w,pellet.y*h,3,0,Math.PI*2);c.fill();}
   for(const f of fish){const nearest=food.reduce((best,item)=>!best||Math.hypot(f.x-item.x*w,f.y-item.y*h)<Math.hypot(f.x-best.x*w,f.y-best.y*h)?item:best,null);const tx=nearest?nearest.x*w:p.active?p.x*w:w*(.5+.35*Math.sin(now/6000+f.phase));const ty=nearest?nearest.y*h:p.active?p.y*h:h*(.5+.3*Math.cos(now/7000+f.phase));const desired=Math.atan2(ty-f.y,tx-f.x);const turn=Math.atan2(Math.sin(desired-f.angle),Math.cos(desired-f.angle));f.angle+=turn*Math.min(1,dt*1.6);f.x+=Math.cos(f.angle)*dt*(nearest?55:26);f.y+=Math.sin(f.angle)*dt*(nearest?55:26);f.x=Math.max(10,Math.min(w-10,f.x));f.y=Math.max(10,Math.min(h-10,f.y));if(nearest&&Math.hypot(tx-f.x,ty-f.y)<16)food=food.filter(item=>item!==nearest);
    c.save();c.translate(f.x,f.y);c.rotate(f.angle);c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(4,5,f.size,f.size*.43,0,0,Math.PI*2);c.fill();c.fillStyle=f.color;c.beginPath();c.ellipse(0,0,f.size,f.size*.35,0,0,Math.PI*2);c.fill();c.fillStyle='#edc2a3';c.beginPath();c.moveTo(-f.size*.6,0);c.lineTo(-f.size*1.6,-7+Math.sin(now/180+f.phase)*4);c.lineTo(-f.size*1.6,7+Math.sin(now/180+f.phase)*4);c.closePath();c.fill();c.fillStyle='#fff4d8';c.beginPath();c.ellipse(-3,0,f.size*.25,f.size*.3,0,0,Math.PI*2);c.fill();c.fillStyle='#12262a';c.beginPath();c.arc(f.size*.6,-f.size*.16,1.8,0,Math.PI*2);c.fill();c.restore();}
   food=food.filter(p=>p.age<12);for(const ripple of ripples){ripple.age+=dt;c.strokeStyle=`rgba(180,225,226,${Math.max(0,.6-ripple.age*.3)})`;c.lineWidth=1;c.beginPath();c.ellipse(ripple.x*w,ripple.y*h,5+ripple.age*55,3+ripple.age*35,0,0,Math.PI*2);c.stroke();}ripples=ripples.filter(p=>p.age<2);
  },dispose(){fish=[];food=[];ripples=[];}
 });return runtime;
}
