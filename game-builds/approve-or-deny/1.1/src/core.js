/* APPROVE OR DENY v1.0 — deterministic rules, generation, timing and saves. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./content.js'));
  else root.AOD = factory(root.AOD_CONTENT);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (content) {
  'use strict';
  const VERSION = '1.1.0', OFFICE_DATE = '1996-11-06', CASE_COUNT = 10;
  const DIFFICULTIES = {
    easy: {label: 'Easy', seconds: 240, mistakes: 4, penalty: 10, compound: 1},
    normal: {label: 'Normal', seconds: 210, mistakes: 3, penalty: 15, compound: 2},
    hard: {label: 'Hard', seconds: 180, mistakes: 2, penalty: 20, compound: 3}
  };
  const isDifficulty = value => typeof value === 'string' && Object.hasOwn(DIFFICULTIES,value);
  const REQUESTS = {
    CHAIR: 'Second chair permit', WINDOW: 'Window opening license', UMBRELLA: 'Umbrella ownership permit',
    PLANT: 'Office plant registration', WHISPER: 'Permission to whisper', CLOCK: 'Clock adjustment request',
    LUNCH: 'Extended sandwich license', HAT: 'Emergency hat registration', SOCK: 'Mismatched sock exemption',
    CLOUD: 'Cloud appreciation permit', QUEUE: 'Permission to leave the queue', DRAWER: 'Empty drawer declaration'
  };
  const SPECIAL = ['CHAIR', 'WINDOW', 'UMBRELLA'];
  const FIRST = ['Ada','Alma','Arthur','Bea','Ben','Clara','Cora','Dale','Dina','Edwin','Eli','Emma','Felix','Finn','Flora','Gary','Grace','Hana','Hugo','Ida','Iris','Ivo','June','Leon','Lena','Lewis','Mabel','Mara','Milo','Nora','Omar','Otis','Rita','Rosa','Ruth','Theo','Vera','Walt'];
  const LAST = ['Ash','Baker','Bell','Birch','Bloom','Brooks','Cole','Cross','Dove','Dunn','Finch','Ford','Frost','Gray','Green','Hart','Hill','Holt','Lake','Lane','Marsh','Miller','Moss','North','Oak','Page','Park','Pike','Reed','Stone','Vale','Ward','West','Wren'];
  const DISTRICTS = ['NORTH','SOUTH','EAST','WEST'];
  const QUIPS = [
    'I brought a spare copy. Of the spare copy.', 'The queue was shorter last Tuesday.',
    'My hat has become administratively urgent.', 'Please stamp firmly. The paper is nervous.',
    'I was told this was the correct wrong office.', 'The form for this form was out of stock.',
    'I have been practicing my official signature.', 'Is lunch a valid reason for an appeal?',
    'I numbered my copies. Then made copies.', 'The plant insisted on being registered.',
    'I hope the ink is having a good day.', 'I only need a small amount of permission.',
    'I followed the instructions on the other instructions.', 'The chair is waiting outside.',
    'I filed a complaint about filing complaints.', 'I would like to remain provisionally optimistic.'
  ];
  function rng(seed) {
    let state = (seed >>> 0) || 0x6d2b79f5;
    return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
  }
  const pick = (random, array) => array[Math.floor(random() * array.length)];
  function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(random() * (i+1)); [array[i], array[j]] = [array[j], array[i]]; }
    return array;
  }
  function dateFrom(offset) { return new Date(Date.UTC(1996, 10, 6 + offset)).toISOString().slice(0,10); }
  function validDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  }
  const normalize = value => typeof value === 'string' ? value.trim().toUpperCase() : '';
  const RULES = {
    expiry: {code:'01', title:'VALID IDENTIFICATION', text:'ID expiry must be on or after 06 NOV 1996.', check:c=>validDate(c.id.expires) && c.id.expires >= OFFICE_DATE, reason:'The citizen ID has expired or has an invalid expiry date.'},
    identity: {code:'02', title:'SAME CITIZEN', text:'Full name AND citizen number must match on both documents.', check:c=>!!normalize(c.application.name) && normalize(c.application.name)===normalize(c.id.name) && !!c.id.number && c.application.number===c.id.number, reason:'The name or citizen number does not match across the documents.'},
    ink: {code:'03', title:'APPROVED INK', text:'Applications must use BLUE or BLACK ink. No red ink.', check:c=>['BLUE','BLACK'].includes(c.application.ink), reason:'The application uses prohibited ink.'},
    form: {code:'04', title:'EXTRA PAPERWORK', text:'CHAIR, WINDOW and UMBRELLA requests require Form 8-B.', check:c=>!SPECIAL.includes(c.application.request) || c.application.formB===true, reason:'This request requires Form 8-B, but it is missing.'},
    signature: {code:'05', title:'SIGNED, NOT SEALED', text:'Every application must have a citizen signature.', check:c=>c.application.signed===true, reason:'The citizen signature is missing.'},
    district: {code:'06', title:'KNOW YOUR DISTRICT', text:'Application district must match the ID registry district.', check:c=>DISTRICTS.includes(c.id.district) && c.application.district===c.id.district, reason:'The application and ID show different districts.'}
  };
  function levelInfo(level) {
    if (!Number.isInteger(level) || level < 1 || level > 20) throw new RangeError('Level must be 1–20');
    return content.levels[level-1];
  }
  function rulesFor(level) {
    levelInfo(level);
    return ['expiry','identity', ...(level>=6?['ink']:[]), ...(level>=11?['form']:[]), ...(level>=16?['signature','district']:[])];
  }
  function evaluate(applicant, level) {
    const keys = rulesFor(level);
    if (!applicant || !applicant.application || !applicant.id || !Object.hasOwn(REQUESTS,applicant.application.request)) {
      return {valid:false, violations:[{key:'integrity',code:'00',reason:'The document data is incomplete.'}]};
    }
    const violations = keys.filter(key=>!RULES[key].check(applicant)).map(key=>({key,code:RULES[key].code,reason:RULES[key].reason}));
    return {valid:violations.length===0, violations};
  }
  function generate(level, difficulty, seed) {
    levelInfo(level); const settings = DIFFICULTIES[difficulty];
    if (!isDifficulty(difficulty)) throw new RangeError('Unknown difficulty');
    const random = rng(seed), active = rulesFor(level), validCount = 4 + Math.floor(random()*3);
    const plan = shuffle(Array.from({length:CASE_COUNT},(_,i)=>i<validCount),random), names = new Set();
    return plan.map((isValid,index)=>{
      let name; do {name=pick(random,FIRST)+' '+pick(random,LAST);} while(names.has(name)); names.add(name);
      const number='KT-'+String(1000+Math.floor(random()*9000))+'-'+String(index+1).padStart(2,'0');
      const district=pick(random,DISTRICTS), request=pick(random,Object.keys(REQUESTS));
      const citizen={serial:index+1, face:Math.floor(random()*4294967296), quip:pick(random,QUIPS),
        application:{name,number,request,ink:pick(random,['BLUE','BLACK']),formB:SPECIAL.includes(request)||random()>.5,signed:true,district},
        id:{name,number,expires:dateFrom(1+Math.floor(random()*365)),district}};
      if(!isValid){
        const maximum=Math.min(active.length,settings.compound+(level%5===0&&difficulty!=='easy'?1:0));
        const mutations=shuffle([...active],random).slice(0,1+Math.floor(random()*maximum));
        for(const mutation of mutations){
          switch(mutation){
            case 'expiry':citizen.id.expires=dateFrom(-1-Math.floor(random()*160));break;
            case 'identity':
              if(random()<.5)citizen.application.name=pick(random,FIRST.filter(n=>!name.startsWith(n+' ')))+' '+name.split(' ')[1];
              else citizen.application.number=number.slice(0,-1)+(Number(number.slice(-1))+1)%10;
              break;
            case 'ink':citizen.application.ink='RED';break;
            case 'form':citizen.application.request=pick(random,SPECIAL);citizen.application.formB=false;break;
            case 'signature':citizen.application.signed=false;break;
            case 'district':citizen.application.district=pick(random,DISTRICTS.filter(d=>d!==district));break;
          }
        }
      }
      if(evaluate(citizen,level).valid!==isValid)throw new Error('Generated applicant does not match its rule plan');
      return citizen;
    });
  }
  class Shift {
    constructor(level,difficulty,seed,now=0){
      levelInfo(level);if(!isDifficulty(difficulty))throw new RangeError('Unknown difficulty');
      if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new RangeError('Invalid seed');
      this.level=level;this.difficulty=difficulty;this.seed=seed;this.cases=generate(level,difficulty,seed);
      this.decisions=[];this.index=0;this.errors=0;this.earnings=0;this.phase='review';this.won=false;this.endReason='';
      this.accumulated=0;this.since=now;this.paused=false;
    }
    get settings(){return DIFFICULTIES[this.difficulty];}
    get current(){return this.cases[this.index];}
    elapsed(now){return this.accumulated+(!this.paused&&this.phase!=='ended'?Math.max(0,now-this.since):0);}
    remaining(now){return Math.max(0,this.settings.seconds-this.elapsed(now)/1000);}
    end(won,reason,now){this.accumulated=Math.min(this.settings.seconds*1000,this.elapsed(now));this.phase='ended';this.won=won;this.endReason=reason;this.paused=false;}
    advance(now){if(this.phase!=='ended'&&!this.paused&&this.remaining(now)<=0)this.end(false,'time',now);return this.phase;}
    decide(approved,now){
      this.advance(now);if(this.phase!=='review'||this.paused||typeof approved!=='boolean')return null;
      const evidence=evaluate(this.current,this.level),correct=approved===evidence.valid;
      const delta=correct?25:-this.settings.penalty;
      this.earnings+=delta;if(!correct)this.errors++;
      const decision={approved,correct,delta,violations:evidence.violations};this.decisions.push(decision);this.phase='reviewed';
      if(this.errors>=this.settings.mistakes)this.end(false,'mistakes',now);
      else if(this.decisions.length===CASE_COUNT)this.end(true,'complete',now);
      return decision;
    }
    next(now){this.advance(now);if(this.phase!=='reviewed'||this.paused)return false;this.index=this.decisions.length;this.phase='review';return true;}
    pause(now){this.advance(now);if(this.phase==='ended'||this.paused)return;this.accumulated=this.elapsed(now);this.paused=true;}
    resume(now){if(this.phase==='ended'||!this.paused)return;this.since=now;this.paused=false;}
    snapshot(now){return {level:this.level,difficulty:this.difficulty,seed:this.seed,decisions:this.decisions.map(d=>d.approved),reviewed:this.phase==='reviewed',elapsedMs:Math.min(this.settings.seconds*1000,this.elapsed(now))};}
    result(now){
      const processed=this.decisions.length,correct=processed-this.errors;
      return {level:this.level,difficulty:this.difficulty,seed:this.seed,won:this.won,reason:this.endReason,processed,correct,errors:this.errors,earnings:this.earnings,accuracy:processed?correct/processed*100:0,seconds:Math.min(this.settings.seconds,this.elapsed(now)/1000),stars:this.won?(this.errors===0?3:this.errors===1?2:1):0};
    }
  }
  function restore(snapshot,now=0){
    try{
      if(!snapshot||!Number.isInteger(snapshot.seed)||typeof snapshot.reviewed!=='boolean'||!Array.isArray(snapshot.decisions)||snapshot.decisions.length>=CASE_COUNT||!snapshot.decisions.every(d=>typeof d==='boolean'))return null;
      const shift=new Shift(snapshot.level,snapshot.difficulty,snapshot.seed,0);
      if(!Number.isFinite(snapshot.elapsedMs)||snapshot.elapsedMs<0||snapshot.elapsedMs>=shift.settings.seconds*1000)return null;
      if(snapshot.reviewed&&snapshot.decisions.length===0)return null;
      snapshot.decisions.forEach((decision,index)=>{shift.decide(decision,0);if(index<snapshot.decisions.length-1||!snapshot.reviewed)shift.next(0);});
      if(shift.phase==='ended')return null;
      shift.accumulated=snapshot.elapsedMs;shift.since=now;return shift;
    }catch{return null;}
  }
  function emptySave(){return {version:1,selectedLevel:1,difficulty:'normal',sound:false,effectsVolume:.8,ambienceVolume:.35,progress:Object.fromEntries(Object.keys(DIFFICULTIES).map(key=>[key,{unlocked:1,stars:{},bests:{}}])),history:[],active:null};}
  function cleanSave(raw){
    const save=emptySave();if(!raw||typeof raw!=='object'||Array.isArray(raw))return save;
    if(isDifficulty(raw.difficulty))save.difficulty=raw.difficulty;save.sound=raw.sound===true;
    for(const key of ['effectsVolume','ambienceVolume'])if(Number.isFinite(raw[key]))save[key]=Math.max(0,Math.min(1,raw[key]));
    for(const difficulty of Object.keys(DIFFICULTIES)){
      const p=raw.progress?.[difficulty];if(!p||typeof p!=='object')continue;
      const dest=save.progress[difficulty];if(Number.isInteger(p.unlocked))dest.unlocked=Math.max(1,Math.min(20,p.unlocked));
      for(let level=1;level<=20;level++){
        if(Number.isInteger(p.stars?.[level])&&p.stars[level]>=1&&p.stars[level]<=3)dest.stars[level]=p.stars[level];
        const b=p.bests?.[level];
        if(b&&Number.isFinite(b.earnings)&&b.earnings>=0&&b.earnings<=250&&Number.isFinite(b.accuracy)&&b.accuracy>=0&&b.accuracy<=100&&Number.isFinite(b.seconds)&&b.seconds>=0&&b.seconds<=DIFFICULTIES[difficulty].seconds)dest.bests[level]={earnings:b.earnings,accuracy:b.accuracy,seconds:b.seconds};
      }
    }
    if(Number.isInteger(raw.selectedLevel))save.selectedLevel=Math.max(1,Math.min(save.progress[save.difficulty].unlocked,raw.selectedLevel));
    if(Array.isArray(raw.history))save.history=raw.history.filter(r=>r&&Number.isInteger(r.level)&&r.level>=1&&r.level<=20&&isDifficulty(r.difficulty)&&typeof r.won==='boolean'&&Number.isFinite(r.earnings)&&Math.abs(r.earnings)<=250&&Number.isFinite(r.accuracy)&&r.accuracy>=0&&r.accuracy<=100&&Number.isFinite(r.seconds)&&r.seconds>=0&&r.seconds<=DIFFICULTIES[r.difficulty].seconds).slice(0,50);
    const active=restore(raw.active,0);if(active&&active.level<=save.progress[active.difficulty].unlocked)save.active=active.snapshot(0);
    return save;
  }
  function record(save,shift,now,date=new Date().toISOString()){
    if(shift.phase!=='ended')throw new Error('Cannot record an unfinished shift');
    const result=shift.result(now),p=save.progress[shift.difficulty],best=p.bests[shift.level];
    const personalBest=result.won&&(!best||result.earnings>best.earnings||(result.earnings===best.earnings&&result.seconds<best.seconds));
    if(result.won){p.unlocked=Math.max(p.unlocked,Math.min(20,shift.level+1));p.stars[shift.level]=Math.max(p.stars[shift.level]||0,result.stars);if(personalBest)p.bests[shift.level]={earnings:result.earnings,accuracy:result.accuracy,seconds:result.seconds};}
    save.active=null;save.history.unshift({...result,date});save.history=save.history.slice(0,50);return {...result,personalBest};
  }
  return {VERSION,OFFICE_DATE,CASE_COUNT,DIFFICULTIES,REQUESTS,RULES,levels:content.levels,rulesFor,evaluate,generate,Shift,restore,emptySave,cleanSave,record};
});
