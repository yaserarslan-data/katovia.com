(() => {
  'use strict';
  const $ = id => document.getElementById(id), Core = window.AOD;
  const KEY = 'katovia_approve_or_deny_v1';
  let raw = null, storageFailed = false;
  try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* Bad or unavailable saves recover to defaults. */ }
  const save = Core.cleanSave(raw);
  let shift = null, frame = 0, decisionTimer = 0, nextReady = false, recorded = false, lastResult = null;
  let lastCheckpoint = 0, dialogMode = '', startPending = null, drag = null, queueKey = '', nextLabel = '';
  let selected = save.selectedLevel, difficulty = save.difficulty, soundOn = save.sound, bootFinished = false;
  let inkTimer=0, transitionTimer=0, animationBusy=false, transitioning=false, flight=null, inspected=null, inspectionFocus=null;
  const soundBus=new window.OfficeAudio({enabled:soundOn,effects:save.effectsVolume,ambience:save.ambienceVolume,onUnavailable:()=>notify('A sound file could not be loaded. You can continue playing; the sound mixer remains available.')});
  soundBus.suspend(true);
  const now = () => performance.now();
  const money = n => (n < 0 ? '-$' : '$') + Math.abs(n);
  const clock = seconds => Math.floor(Math.ceil(seconds)/60) + ':' + String(Math.ceil(seconds)%60).padStart(2,'0');
  const stars = n => Array.from({length:3},(_,i)=>'<span'+(i<n?' class="earned"':'')+'>★</span>').join('');
  const formatDate = value => new Date(value + 'T00:00:00Z').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).toUpperCase();
  function notify(message) { $('notice').textContent = message; $('notice').hidden = false; }
  function persist() {
    save.selectedLevel = selected; save.difficulty = difficulty; save.sound = soundOn; save.effectsVolume=soundBus.effects; save.ambienceVolume=soundBus.ambience;
    try { localStorage.setItem(KEY,JSON.stringify(save)); } catch { storageFailed = true; }
    if(storageFailed) notify('Browser storage is unavailable. You can still play and export records, but progress will not be saved after closing this page.');
  }
  function commit() {
    if(!shift || shift.phase !== 'ended' || recorded) return;
    recorded = true; lastResult = Core.record(save,shift,now()); persist();
  }
  function checkpoint() {
    if(shift) { shift.advance(now()); if(shift.phase === 'ended') commit(); else save.active = shift.snapshot(now()); }
    persist();
  }
  function show(view) {
    for(const id of ['menu','play','results']) $(id).hidden = id !== view;
    $('dialog').hidden = true; $('app').inert = false; dialogMode = '';
    document.body.classList.toggle('is-playing',view==='play');$('audioPanel').hidden=true;$('audioSettings').setAttribute('aria-expanded','false');closeDocument(false);soundBus.suspend(false);
  }
  function portrait(canvas,seed) {
    canvas.width=96;canvas.height=128;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,96,128);
    const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
    const skin=['#c7a57e','#ad825f','#d5b58e','#8f6d50','#b99472','#d0a17d'][seed%6],coat=['#4c5a50','#63594b','#52616b','#6b4e42','#6b7054'][(seed>>>4)%5],hair=['#39392d','#4e3e2c','#6c6551','#33352c','#8d8971'][(seed>>>8)%5];
    if(canvas.id==='idPortrait'){rect(0,0,96,128,'#929a79');for(let y=0;y<128;y+=6)rect(0,y,96,1,'#7d8868');}
    rect(21,90,54,38,coat);rect(10,102,76,26,coat);rect(35,79,27,22,skin);rect(30,25,37,55,skin);rect(25,42,6,21,skin);rect(67,42,6,21,skin);
    rect(28,18,41,20,hair);rect(26,31,7,21,hair);rect(65,32,6,17,hair);rect(33,20,31,8,hair);
    if(seed%4===0){rect(31,19,34,15,skin);rect(36,20,24,4,hair);}
    if(seed%4===1){rect(20,18,56,7,hair);rect(31,5,33,15,hair);}
    rect(35,44,9,2,hair);rect(55,44,9,2,hair);rect(37,49,5,3,'#30352a');rect(56,49,5,3,'#30352a');rect(48,51,4,14,'#957556');rect(41,70,16,2,'#805d48');rect(38,77,21,3,'#a27d5e');
    if((seed>>>6)%3===0){rect(32,45,15,13,'#454b39');rect(52,45,15,13,'#454b39');rect(35,48,9,7,skin);rect(55,48,9,7,skin);rect(47,49,5,2,'#454b39');}
    rect(33,91,31,7,'#c8c4a1');rect(42,96,15,32,'#c9c5a5');rect(47,97,6,30,'#484c39');rect(44,97,12,5,'#565b42');
    rect(25,96,9,23,'#3c4b3d');rect(65,96,8,24,'#3c4b3d');rect(14,124,69,4,'#354435');
  }
  function closeDocument(restoreFocus=true) {
    if(!inspected)return;inspected=null;$('documentViewer').hidden=true;$('documentContent').replaceChildren();$('app').inert=false;
    if(restoreFocus&&inspectionFocus?.isConnected)inspectionFocus.focus({preventScroll:true});
  }
  function inspectPaper(id) {
    const paper=$(id);if(!shift||paper.hidden||shift.paused||transitioning||!$('dialog').hidden)return;
    soundBus.play('paper-pick',{volume:.65});if(!inspected)inspectionFocus=document.activeElement;inspected=id;
    const clone=paper.cloneNode(true);clone.removeAttribute('id');clone.classList.remove('dragging','impact');
    clone.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
    const originals=paper.querySelectorAll('canvas');clone.querySelectorAll('canvas').forEach((c,i)=>c.getContext('2d').drawImage(originals[i],0,0));
    clone.querySelectorAll('button').forEach(button=>{button.tabIndex=-1;button.disabled=true;});
    $('documentTitle').textContent=id==='application'?'APPLICATION / REG-01':id==='identity'?'CITIZEN ID / REGISTER':'SUPPLEMENT / FORM 8-B';
    $('documentContent').replaceChildren(clone);$('documentViewer').hidden=false;$('app').inert=true;$('closeDocument').focus({preventScroll:true});
  }
  function clearSceneTimers() {
    clearTimeout(inkTimer);clearTimeout(transitionTimer);clearTimeout(decisionTimer);flight?.cancel();flight=null;
    animationBusy=false;transitioning=false;$('flyingStamp').hidden=true;$('officeScene').classList.remove('transferring');
  }
  function animateDecision(decision) {
    animationBusy=true;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const machine=$(decision.approved?'approve':'deny'),tool=$('flyingStamp'),paper=$('application'),desk=$('desk');
    machine.classList.remove('striking');void machine.offsetWidth;machine.classList.add('striking');
    soundBus.play('stamp-lift',{volume:.6});
    const d=desk.getBoundingClientRect(),p=paper.getBoundingClientRect(),m=machine.getBoundingClientRect();
    const x=p.left-d.left+p.width*.62-65,y=p.top-d.top+p.height*.73-85;
    tool.style.left=x+'px';tool.style.top=y+'px';tool.className='flying-stamp'+(decision.approved?' approved':'');tool.querySelector('strong').textContent=decision.approved?'APPROVED':'DENIED';tool.hidden=reduced;
    if(!reduced)flight=tool.animate([{transform:'translate('+(m.left+m.width/2-d.left-x-65)+'px,'+(m.top-d.top-y)+'px) scale(.75)',opacity:.5},{transform:'translate(0,-26px) scale(1)',opacity:1,offset:.66},{transform:'translate(0,6px) scale(.98)',opacity:1,offset:.82},{transform:'translate(0,-65px) scale(.7)',opacity:0}],{duration:470,easing:'cubic-bezier(.2,.7,.3,1)',fill:'both'});
    const thisShift=shift;
    inkTimer=setTimeout(()=>{if(shift!==thisShift||$('play').hidden)return;renderStamp(true);paper.classList.remove('impact');void paper.offsetWidth;paper.classList.add('impact');soundBus.play('stamp');
      const booth=document.querySelector('.booth');booth.classList.remove('arriving','nod','shake');void booth.offsetWidth;booth.classList.add(decision.correct?'nod':'shake');
      if(!decision.correct)soundBus.play('citation-printer',{volume:.75});
    },reduced?0:330);
  }
  function renderMenu() {
    const p=save.progress[difficulty],level=Core.levels[selected-1],settings=Core.DIFFICULTIES[difficulty];
    document.querySelectorAll('[data-difficulty]').forEach(button=>{const active=button.dataset.difficulty===difficulty;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
    $('campaignProgress').textContent=Object.keys(p.stars).length+'/20 cleared · '+Object.values(p.stars).reduce((a,b)=>a+b,0)+'/60 stars';
    $('levelGrid').replaceChildren();
    for(const item of Core.levels){
      const button=document.createElement('button'),locked=item.id>p.unlocked;
      button.className='level-tile'+(selected===item.id?' selected':'')+([6,11,16].includes(item.id)?' group-start':'');
      button.disabled=locked;button.dataset.level=item.id;button.setAttribute('aria-pressed',String(selected===item.id));
      button.setAttribute('aria-label','Level '+item.id+': '+item.title+(locked?', locked':', '+(p.stars[item.id]||0)+' stars'));
      button.innerHTML='<span class="level-number">'+String(item.id).padStart(2,'0')+'</span>'+(locked?'<span class="locked">LOCKED</span>':'<span class="tile-stars">'+stars(p.stars[item.id]||0)+'</span>');
      button.onclick=()=>{if(shift)return;selected=item.id;renderMenu();persist();$('levelGrid').querySelector('[data-level="'+selected+'"]').focus({preventScroll:true});};
      $('levelGrid').append(button);
    }
    $('previewNumber').textContent='LEVEL '+String(selected).padStart(2,'0')+' / '+level.groupName;
    $('previewTitle').textContent=level.title; $('previewDescription').textContent=level.description;
    const best=p.bests[selected];
    $('previewBest').textContent=best?'PERSONAL BEST: '+money(best.earnings)+' · '+Math.round(best.accuracy)+'% accuracy · '+clock(best.seconds):'NO RECORD FILED. YOUR DESK IS WAITING.';
    $('previewFacts').textContent='10 applicants · '+clock(settings.seconds)+' · '+Core.rulesFor(selected).length+' active rules';
    $('start').textContent='BEGIN SHIFT '+String(selected).padStart(2,'0')+' ↗';
    $('continueShift').hidden=!save.active;
    if(save.active)$('continueShift').textContent='CONTINUE '+Core.DIFFICULTIES[save.active.difficulty].label.toUpperCase()+' / SHIFT '+String(save.active.level).padStart(2,'0');
  }
  function menu() {
    cancelAnimationFrame(frame);clearSceneTimers();drag=null;shift=null;nextReady=false;show('menu');renderMenu();persist();$('start').focus({preventScroll:true});
  }
  function freshSeed() { try {return crypto.getRandomValues(new Uint32Array(1))[0];} catch {return (Date.now()^Math.floor(Math.random()*4294967296))>>>0;} }
  function setRules() {
    $('rules').replaceChildren();
    for(const key of Core.rulesFor(shift.level)){
      const rule=Core.RULES[key],item=document.createElement('li'),title=document.createElement('strong'),text=document.createElement('span');
      item.dataset.code=rule.code;title.textContent=rule.title;text.textContent=rule.text;item.append(title,text);$('rules').append(item);
    }
    setRulebook(false);
  }
  function setRulebook(open) {
    const changed=$('ruleContent').hidden===open;
    $('rulebook').classList.toggle('open',open);if(changed&&bootFinished)soundBus.play('book-open',{volume:.55});
    $('ruleContent').hidden=!open;$('ruleClosed').hidden=open;$('rulesToggle').setAttribute('aria-expanded',String(open));
    $('rulesToggle').lastElementChild.textContent=open?'[R] −':'[R] +';
  }
  function resetPapers() {
    if(!shift||animationBusy||transitioning)return;
    const desk=$('desk'),app=$('application'),id=$('identity'),form=$('attachment'),narrow=desk.clientWidth<540;
    for(const p of [app,id,form]){p.style.left='';p.style.top='';p.style.zIndex=p===app?'2':'1';p.classList.remove('dragging');}
    const bench=document.querySelector('.workbench');bench.style.height='';desk.style.minHeight='';
    if(narrow){
      let top=36;for(const p of [app,id,form]){if(p.hidden)continue;p.style.left=Math.max(10,(desk.clientWidth-p.offsetWidth)/2)+'px';p.style.top=top+'px';top+=p.offsetHeight+22;}
      bench.style.height=Math.max(710,top+91)+'px';
    }else{
      app.style.top='38px';id.style.top='46px';
      if(!form.hidden){
        const requiredRow=$('districtRow').hidden?$('idExpires').parentElement:$('districtRow');
        const requiredBottom=requiredRow.getBoundingClientRect().bottom-desk.getBoundingClientRect().top;
        form.style.top=Math.min(desk.clientHeight-form.offsetHeight-9,Math.max(requiredBottom+10,Math.min(id.offsetTop+id.offsetHeight+13,desk.clientHeight-form.offsetHeight-78)))+'px';
      }
    }
    const tray=$('enclosureTray');tray.style.top=form.hidden&&shift.level>=11?Math.max(275,Math.min(id.offsetTop+id.offsetHeight+15,desk.clientHeight-240))+'px':'';
  }
  function renderStamp(animate=false) {
    const decision=shift.decisions[shift.index],stamp=$('stamp');
    stamp.className='stamp';stamp.textContent='';
    if(!decision)return;
    stamp.textContent=decision.approved?'APPROVED':'DENIED';
    stamp.classList.add(decision.approved?'approved':'denied','visible');
    if(animate){void stamp.offsetWidth;stamp.classList.add('slam');}
  }
  function renderFeedback() {
    const decision=shift.decisions[shift.index];$('feedback').className='feedback';
    $('citation').hidden=true;
    if(!decision){$('feedbackTitle').textContent='CHECK THE PAPERWORK.';$('feedbackReason').textContent='R: manual · 1/2/3: inspect · A/D: stamp · N: return documents';return;}
    $('feedback').classList.add(decision.correct?'correct':'wrong');
    $('feedbackTitle').textContent=(decision.correct?'CORRECT. ':'CITATION ISSUED. ')+(decision.delta>0?'+':'')+money(decision.delta);
    const reason=decision.violations.length?decision.violations.map(v=>'Rule '+v.code+': '+v.reason).join(' '):'All active directives are satisfied. This application must be approved.';
    $('feedbackReason').textContent=reason;
    if(!decision.correct){$('citationReason').textContent=reason;$('citationPenalty').textContent=money(decision.delta)+' PENALTY';$('citation').hidden=false;}
  }
  function renderCase() {
    closeDocument(false);$('officeScene').classList.remove('transferring');
    const c=shift.current,a=c.application,id=c.id;
    window.OfficeArt.draw($('officeArt'),shift.seed);
    const booth=document.querySelector('.booth');booth.classList.remove('arriving','nod','shake');void booth.offsetWidth;booth.classList.add('arriving');
    $('ticket').textContent='TICKET '+String(shift.index+1).padStart(3,'0')+' / CITIZEN AT WINDOW';
    $('citizenName').textContent=a.name.toUpperCase();$('citizenQuip').textContent='“'+c.quip+'”';
    $('appName').textContent=a.name.toUpperCase();$('appNumber').textContent=a.number;$('appRequestCode').textContent=a.request;$('appRequest').textContent=Core.REQUESTS[a.request];
    $('appInk').textContent=a.ink;$('appForm').textContent=a.formB?'ATTACHED':'NOT ATTACHED';$('appDistrict').textContent=a.district;
    $('appSignature').textContent=a.signed?a.name:'';$('appSignature').setAttribute('aria-label',a.signed?'Signed by '+a.name:'Signature missing');
    const ink={BLUE:'#2b4a76',BLACK:'#303526',RED:'#9d3f36'}[a.ink];document.querySelectorAll('#application .handwritten, #appSignature').forEach(field=>field.style.color=ink);$('appInk').setAttribute('aria-label','Application ink: '+a.ink);
    $('idName').textContent=id.name.toUpperCase();$('idNumber').textContent=id.number;$('idExpires').textContent=formatDate(id.expires);$('idDistrict').textContent=id.district;
    $('formRow').hidden=shift.level<11;$('advancedApp').hidden=shift.level<16;$('districtRow').hidden=shift.level<16;
    $('attachment').hidden=shift.level<11||!a.formB;$('enclosureTray').hidden=shift.level<11||a.formB;$('formName').textContent=a.name.toUpperCase();$('formNumber').textContent=a.number;
    portrait($('portrait'),c.face);portrait($('idPortrait'),c.face);
    renderStamp();renderFeedback();resetPapers();renderHUD(now());
  }
  function renderHUD(t) {
    if(!shift)return;
    $('count').textContent=shift.decisions.length+' / 10';$('mistakes').textContent=shift.errors+' / '+shift.settings.mistakes;$('pay').textContent=money(shift.earnings);$('time').textContent=clock(shift.remaining(t));
    $('time').parentElement.classList.toggle('low',shift.remaining(t)<=30);$('mistakes').parentElement.classList.toggle('low',shift.errors>=shift.settings.mistakes-1);
    $('approve').disabled=shift.phase!=='review'||shift.paused||transitioning||animationBusy;$('deny').disabled=shift.phase!=='review'||shift.paused||transitioning||animationBusy;
    $('next').disabled=!nextReady||shift.paused||transitioning||animationBusy;
    const label=shift.phase==='ended'?'SHIFT REPORT':'RETURN DOCUMENTS';
    if(label!==nextLabel){$('next').innerHTML=label+' <kbd>N</kbd> →';nextLabel=label;}
    const key=shift.index+':'+shift.decisions.map(d=>d.correct?'1':'0').join('');
    if(key===queueKey)return;queueKey=key;$('queue').replaceChildren();
    for(let i=0;i<10;i++){
      const dot=document.createElement('span'),d=shift.decisions[i];dot.className='queue-dot'+(i===shift.index?' current':'')+(d?(d.correct?' correct':' wrong'):'');dot.setAttribute('aria-label','Application '+(i+1)+': '+(d?(d.correct?'correct':'mistake'):i===shift.index?'current':'waiting'));$('queue').append(dot);
    }
  }
  function enterShift(session) {
    cancelAnimationFrame(frame);clearSceneTimers();shift=session;recorded=false;lastResult=null;drag=null;
    nextReady=shift.phase==='reviewed';show('play');
    $('playLabel').textContent='LEVEL '+String(shift.level).padStart(2,'0')+' / 20 · '+shift.settings.label.toUpperCase()+' · '+Core.levels[shift.level-1].groupName;
    $('playTitle').textContent=Core.levels[shift.level-1].title;
    setRules();renderCase();checkpoint();lastCheckpoint=now();soundBus.suspend(false);soundBus.play('paper-pick');soundBus.play('queue-bell',{volume:.35});frame=requestAnimationFrame(loop);$('approve').focus({preventScroll:true});
  }
  function begin() {
    const launch=()=>{selected=Math.min(selected,save.progress[difficulty].unlocked);enterShift(new Core.Shift(selected,difficulty,freshSeed(),now()));};
    if(save.active){startPending=launch;openDialog('replace','Replace the unfinished shift?','Your saved shift will be replaced. Completed levels and personal records will be kept.','START NEW SHIFT','KEEP SAVED SHIFT');}
    else launch();
  }
  function continueShift() {
    const restored=Core.restore(save.active,now());
    if(!restored){save.active=null;persist();renderMenu();notify('The unfinished shift could not be restored. Your completed levels and records are safe.');return;}
    selected=restored.level;difficulty=restored.difficulty;enterShift(restored);
  }
  function loop(t) {
    if(!shift||shift.paused)return;
    shift.advance(t);renderHUD(t);
    if(shift.phase==='ended'){
      commit();if(shift.endReason==='time')showResults();return;
    }
    if(t-lastCheckpoint>=1000){checkpoint();lastCheckpoint=t;}
    frame=requestAnimationFrame(loop);
  }
  function decide(approved) {
    if(!shift||!$('dialog').hidden||$('play').hidden||animationBusy||transitioning)return;
    const decision=shift.decide(approved,now());
    if(!decision){if(shift.phase==='ended'&&shift.endReason==='time'){commit();showResults();}return;}
    closeDocument(false);nextReady=false;animateDecision(decision);renderFeedback();renderHUD(now());
    if(shift.phase==='ended')commit();else checkpoint();
    clearTimeout(decisionTimer);const thisShift=shift;
    decisionTimer=setTimeout(()=>{if(shift!==thisShift||$('play').hidden)return;animationBusy=false;$('flyingStamp').hidden=true;nextReady=true;renderHUD(now());if(!shift.paused)$('next').focus({preventScroll:true});},500);
  }
  function next() {
    if(!shift||!nextReady||shift.paused||transitioning||animationBusy||!$('dialog').hidden)return;
    closeDocument(false);transitioning=true;nextReady=false;$('officeScene').classList.add('transferring');soundBus.play('paper-return');renderHUD(now());
    const thisShift=shift;
    transitionTimer=setTimeout(()=>{
      if(shift!==thisShift)return;transitioning=false;$('officeScene').classList.remove('transferring');
      if(shift.phase==='ended'){showResults();return;}
      if(shift.next(now())){renderCase();checkpoint();soundBus.play('paper-pick',{volume:.65});soundBus.play('queue-bell',{volume:.32});$('approve').focus({preventScroll:true});}
      else if(shift.phase==='ended'){commit();showResults();}
    },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:280);
  }
  function showResults() {
    if(!shift)return;commit();cancelAnimationFrame(frame);clearSceneTimers();show('results');soundBus.play(lastResult.won?'shift-clear':'drawer',{volume:.7});
    const result=lastResult,last=shift.level===20,progress=save.progress[shift.difficulty];
    $('resultLabel').textContent='LEVEL '+String(shift.level).padStart(2,'0')+' / '+shift.settings.label.toUpperCase()+' / PERFORMANCE REVIEW';
    $('resultSeal').textContent=result.won?'SHIFT CLEARED':'SHIFT TERMINATED';$('resultSeal').classList.toggle('failed',!result.won);
    $('resultTitle').textContent=result.won?(last?'You are the department.':'Filed. Stamped. Finished.'):'Please report to your supervisor.';
    $('resultMessage').textContent=result.won?(last?'All 20 shifts cleared on '+shift.settings.label+'. The paperwork never stood a chance.':'Ten applications processed. Your next desk is waiting.'):(result.reason==='time'?'The clock has spoken. A steadier, quicker shift is one replay away.':'Too many citations. A fresh set of applicants is ready when you are.');
    $('resultStars').innerHTML=stars(result.stars);$('resultStars').setAttribute('aria-label',result.stars+' of 3 stars');
    $('personalBest').hidden=!result.personalBest;$('resultAccuracy').textContent=Math.round(result.accuracy)+'%';$('resultPay').textContent=money(result.earnings);$('resultCount').textContent=result.processed+' / 10';$('resultTime').textContent=clock(result.seconds);
    const best=progress.bests[shift.level];$('resultBest').textContent=best?'PERSONAL BEST: '+money(best.earnings)+' · '+Math.round(best.accuracy)+'% accuracy · '+clock(best.seconds):'NO CLEAR ON FILE YET. THE DEPARTMENT BELIEVES IN SECOND ATTEMPTS.';
    $('nextLevel').hidden=!result.won||last;renderMenu();$('resultTitle').focus({preventScroll:true});
  }
  function openDialog(mode,title,text,primary,secondary) {
    dialogMode=mode;$('dialogTitle').textContent=title;$('dialogText').textContent=text;$('dialogPrimary').textContent=primary;$('dialogSecondary').textContent=secondary;
    $('dialog').hidden=false;$('app').inert=true;$('dialogPrimary').focus({preventScroll:true});
  }
  function pause() {
    if(!shift||$('play').hidden)return;
    closeDocument(false);shift.pause(now());if(shift.phase==='ended'){commit();if(shift.endReason==='time')showResults();return;}
    cancelAnimationFrame(frame);checkpoint();soundBus.suspend(true);renderHUD(now());openDialog('pause','Your break is approved.','The clock is frozen. Resume when you are ready, or save this shift and return to the menu.','BACK TO THE DESK','SAVE & MENU');
  }
  function resume() {
    if(!shift)return;shift.resume(now());soundBus.suspend(false);$('dialog').hidden=true;$('app').inert=false;dialogMode='';renderHUD(now());
    (shift.phase==='review' ? $('approve') : $('next')).focus({preventScroll:true});frame=requestAnimationFrame(loop);
  }
  function saveAndMenu() {if(shift){if(shift.phase==='ended')commit();else{shift.pause(now());checkpoint();}}menu();}
  $('dialogPrimary').onclick=()=>{if(dialogMode==='replace'){const launch=startPending;startPending=null;show('menu');save.active=null;launch();}else resume();};
  $('dialogSecondary').onclick=()=>{if(dialogMode==='replace'){startPending=null;show('menu');$('continueShift').focus({preventScroll:true});}else saveAndMenu();};
  $('start').onclick=begin;$('continueShift').onclick=continueShift;$('approve').onclick=()=>decide(true);$('deny').onclick=()=>decide(false);$('next').onclick=next;
  $('pause').onclick=pause;$('saveMenu').onclick=saveAndMenu;$('resultMenu').onclick=menu;
  $('retry').onclick=()=>{if(!shift)return;selected=shift.level;difficulty=shift.difficulty;enterShift(new Core.Shift(selected,difficulty,freshSeed(),now()));};
  $('nextLevel').onclick=()=>{if(!shift||!shift.won||shift.level>=20)return;selected=shift.level+1;difficulty=shift.difficulty;enterShift(new Core.Shift(selected,difficulty,freshSeed(),now()));};
  $('rulesToggle').onclick=()=>setRulebook($('ruleContent').hidden);$('resetPapers').onclick=resetPapers;
  $('brandHome').onclick=e=>{e.preventDefault();if(!bootFinished)return;if(shift&&$('results').hidden)saveAndMenu();else menu();};
  document.querySelectorAll('[data-difficulty]').forEach(button=>button.onclick=()=>{if(shift)return;difficulty=button.dataset.difficulty;selected=Math.min(selected,save.progress[difficulty].unlocked);renderMenu();persist();});
  $('sound').textContent=soundOn?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',String(soundOn));
  $('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'SOUND ON':'SOUND OFF';$('sound').setAttribute('aria-pressed',String(soundOn));soundBus.settings(soundOn);persist();if(soundOn)soundBus.play('paper-pick');};
  $('audioSettings').onclick=()=>{const open=$('audioPanel').hidden;$('audioPanel').hidden=!open;$('audioSettings').setAttribute('aria-expanded',String(open));};
  const updateMixer=()=>{soundBus.settings(soundOn,Number($('effectsVolume').value)/100,Number($('ambienceVolume').value)/100);$('effectsValue').textContent=$('effectsVolume').value+'%';$('ambienceValue').textContent=$('ambienceVolume').value+'%';persist();};
  $('effectsVolume').value=Math.round(soundBus.effects*100);$('ambienceVolume').value=Math.round(soundBus.ambience*100);$('effectsValue').textContent=$('effectsVolume').value+'%';$('ambienceValue').textContent=$('ambienceVolume').value+'%';
  $('effectsVolume').addEventListener('input',updateMixer);$('ambienceVolume').addEventListener('input',updateMixer);
  $('closeDocument').onclick=()=>closeDocument();$('inspectApp').onclick=()=>inspectPaper('application');$('inspectId').onclick=()=>inspectPaper('identity');$('inspectForm').onclick=()=>inspectPaper('attachment');
  for(const id of ['application','identity','attachment'])$(id).addEventListener('dblclick',e=>{if(!e.target.closest('button'))inspectPaper(id);});
  $('documentViewer').addEventListener('click',e=>{if(e.target===$('documentViewer'))closeDocument();});
  $('closeCitation').onclick=()=>{$('citation').hidden=true;soundBus.play('paper-slide',{volume:.5});};
  window.__officeAudioStatus=()=>soundBus.status();
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('Fullscreen is unavailable here. Use the itch.io fullscreen button or your browser fullscreen control.');}catch{notify('Fullscreen could not start here. The game remains playable; the itch.io fullscreen control can also be used.');}};
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'EXIT FULLSCREEN ↙':'FULLSCREEN ↗';requestAnimationFrame(resetPapers);});
  $('export').onclick=()=>{checkpoint();const url=URL.createObjectURL(new Blob([JSON.stringify(save,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='katovia-approve-or-deny-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  function endDrag(event) {
    if(!drag)return;const paper=drag.paper;paper.classList.remove('dragging');
    const slot=$('next').parentElement.getBoundingClientRect();
    if(event?.type==='pointerup'&&event.clientX>=slot.left&&event.clientX<=slot.right&&event.clientY>=slot.top&&event.clientY<=slot.bottom&&nextReady){drag=null;next();return;}
    const r=paper.getBoundingClientRect();let covered=false;
    for(const id of ['application','identity','attachment']){const other=$(id);if(other===paper||other.hidden)continue;const h=other.querySelector('.drag-handle').getBoundingClientRect();if(h.left+h.width/2>r.left&&h.left+h.width/2<r.right&&h.top+h.height/2>r.top&&h.top+h.height/2<r.bottom)covered=true;}
    drag=null;if(covered)resetPapers();
  }
  document.querySelectorAll('.drag-handle').forEach(handle=>{
    handle.addEventListener('pointerdown',e=>{if(!shift||shift.paused||animationBusy||transitioning||e.button!==0)return;const paper=$(handle.dataset.paper);drag={paper,x:e.clientX,y:e.clientY,left:paper.offsetLeft,top:paper.offsetTop};paper.classList.add('dragging');paper.style.zIndex='10';soundBus.play('paper-pick',{volume:.65});handle.setPointerCapture(e.pointerId);e.preventDefault();});
    handle.addEventListener('pointermove',e=>{if(!drag||shift?.paused)return;soundBus.play('paper-slide',{volume:.35,throttle:450});const desk=$('desk'),paper=drag.paper;paper.style.left=Math.max(8,Math.min(desk.clientWidth-paper.offsetWidth-8,drag.left+e.clientX-drag.x))+'px';paper.style.top=Math.max(32,Math.min(desk.clientHeight-paper.offsetHeight-8,drag.top+e.clientY-drag.y))+'px';});
    handle.addEventListener('pointerup',endDrag);handle.addEventListener('pointercancel',endDrag);handle.addEventListener('lostpointercapture',endDrag);
  });
  window.addEventListener('resize',()=>{endDrag();if(shift&&!$('play').hidden)resetPapers();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&shift&&!$('play').hidden){if(shift.phase!=='ended')pause();else checkpoint();}});
  window.addEventListener('blur',()=>{if(shift&&!$('play').hidden&&shift.phase!=='ended'&&$('dialog').hidden)pause();});
  window.addEventListener('pagehide',()=>{checkpoint();soundBus.suspend(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)soundBus.suspend(true);else if(!shift?.paused&&$('dialog').hidden)soundBus.suspend(false);});
  window.addEventListener('focus',()=>{if(!shift?.paused&&$('dialog').hidden)soundBus.suspend(false);});
  document.addEventListener('keydown',e=>{
    if(!bootFinished){if([' ','Escape'].includes(e.key)){e.preventDefault();intro.skip();}return;}
    if(!$('dialog').hidden){
      if(e.key==='Tab'){e.preventDefault();(document.activeElement===$('dialogPrimary')?$('dialogSecondary'):$('dialogPrimary')).focus();}
      if(e.key==='Escape'){e.preventDefault();if(dialogMode==='pause')resume();else $('dialogSecondary').click();}return;
    }
    if(inspected){if(e.key==='Escape'){e.preventDefault();closeDocument();return;}if(e.key==='Tab'){e.preventDefault();$('closeDocument').focus();return;}if(!['a','d','p','1','2','3'].includes(e.key.toLowerCase()))return;}
    if(e.target instanceof Element&&e.target.matches('input[type=range]'))return;
    if(!shift||$('play').hidden||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
    const key=e.key.toLowerCase();if(['a','d','n','r','p','escape'].includes(key))e.preventDefault();
    if(['1','2','3'].includes(key)){e.preventDefault();inspectPaper({'1':'application','2':'identity','3':'attachment'}[key]);}
    if(key==='a')decide(true);if(key==='d')decide(false);if(key==='n')next();if(key==='r')$('rulesToggle').click();if(key==='p'||key==='escape')pause();
  });
  renderMenu();persist();
  const intro=new window.KatoviaIntro({stage:$('stage'),duration:4200,onFinish:()=>{if(bootFinished)return;bootFinished=true;$('boot').hidden=true;$('app').hidden=false;menu();}});
  $('skipIntro').onclick=()=>intro.skip();intro.play({mute:true,reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
})();
