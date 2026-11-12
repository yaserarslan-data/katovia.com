/* Shared, deterministic rules for browser play and Node tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TypingCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MATCH_REQUIRED=90;
  class Run {
    constructor(level){this.level=level;this.text=level.lines.join('\n');this.typed='';this.phase='ready';this.accumulated=0;this.since=null;this.attempts=0;this.errors=0;this.removed=0;this.won=false;}
    elapsed(now){return this.accumulated+(this.phase==='running'?Math.max(0,now-this.since):0);}
    metrics(now){
      let correct=0;for(let i=0;i<this.typed.length;i++)if(this.typed[i]===this.text[i])correct++;
      const seconds=Math.min(this.level.timeLimitSec,this.elapsed(now)/1000),remaining=Math.max(0,this.level.timeLimitSec-seconds);
      const accuracy=this.attempts?100*(this.attempts-this.errors)/this.attempts:100,matching=this.typed.length?100*correct/this.typed.length:100;
      return {seconds,remaining,correct,accuracy,matching,wpm:correct/5/(Math.max(1,seconds)/60),progress:this.typed.length/this.text.length,score:Math.max(0,correct*10-this.errors*5+(this.won?Math.floor(remaining)*2:0)),stars:this.won?(Math.min(accuracy,matching)>=98?3:Math.min(accuracy,matching)>=95?2:1):0};
    }
    finish(won,now){this.accumulated=Math.min(this.level.timeLimitSec*1000,this.elapsed(now));this.since=null;this.won=won;this.phase='ended';}
    advance(now){if(this.phase==='running'&&this.elapsed(now)>=this.level.timeLimitSec*1000)this.finish(false,now);return this.phase;}
    input(value,now){
      this.advance(now);if(!['ready','running'].includes(this.phase))return false;
      value=String(value).replace(/\r\n?/g,'\n').slice(0,this.text.length);if(value===this.typed)return false;
      if(this.phase==='ready'&&value.length){this.phase='running';this.since=now;}
      // Count the edited region, including replacements with unchanged length.
      let prefix=0,oldEnd=this.typed.length,newEnd=value.length;
      while(prefix<oldEnd&&prefix<newEnd&&this.typed[prefix]===value[prefix])prefix++;
      while(oldEnd>prefix&&newEnd>prefix&&this.typed[oldEnd-1]===value[newEnd-1]){oldEnd--;newEnd--;}
      this.removed+=oldEnd-prefix;
      for(let i=prefix;i<newEnd;i++){this.attempts++;if(value[i]!==this.text[i])this.errors++;}
      this.typed=value;
      if(value.length===this.text.length&&this.metrics(now).matching>=MATCH_REQUIRED)this.finish(true,now);
      return true;
    }
    pause(now){this.advance(now);if(!['ready','running'].includes(this.phase))return;this.wasReady=this.phase==='ready';this.accumulated=this.elapsed(now);this.since=null;this.phase='paused';}
    resume(now){if(this.phase!=='paused')return;this.phase=this.wasReady?'ready':'running';this.since=this.wasReady?null:now;}
  }
  function cleanSave(raw,count){
    raw=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
    const integer=(n,fallback,min,max)=>Number.isInteger(n)?Math.max(min,Math.min(max,n)):fallback;
    const save={version:2,unlocked:integer(raw.unlocked,1,1,count),selected:1,stars:{},bests:{},runs:[]};save.selected=integer(raw.selected,1,1,save.unlocked);
    for(let id=1;id<=count;id++){
      save.stars[id]=integer(raw.stars?.[id],0,0,3);const b=raw.bests?.[id];
      if(b&&['wpm','accuracy','score'].every(k=>Number.isFinite(b[k])&&b[k]>=0)&&b.accuracy<=100)save.bests[id]={wpm:b.wpm,accuracy:b.accuracy,score:b.score};
    }
    if(Array.isArray(raw.runs))save.runs=raw.runs.filter(r=>r&&Number.isInteger(r.level)&&r.level>=1&&r.level<=count&&typeof r.won==='boolean'&&['wpm','accuracy','score','seconds'].every(k=>Number.isFinite(r[k])&&r[k]>=0)&&r.accuracy<=100).slice(0,100);
    return save;
  }
  function record(save,run,now,date=new Date().toISOString()){
    const m=run.metrics(now),id=run.level.id,old=save.bests[id],personalBest=run.won&&(!old||m.wpm>old.wpm);
    if(run.won){save.unlocked=Math.max(save.unlocked,Math.min(id+1,20));save.stars[id]=Math.max(save.stars[id]||0,m.stars);save.bests[id]={wpm:Math.max(old?.wpm||0,m.wpm),accuracy:Math.max(old?.accuracy||0,m.accuracy),score:Math.max(old?.score||0,m.score)};}
    save.runs.unshift({date,level:id,won:run.won,wpm:m.wpm,accuracy:m.accuracy,score:m.score,seconds:m.seconds,stars:m.stars});save.runs=save.runs.slice(0,100);return {...m,personalBest};
  }
  return {Run,cleanSave,record,MATCH_REQUIRED};
});
