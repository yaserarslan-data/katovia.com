(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const levels = window.GAME_LEVELS, {Run, cleanSave, record} = window.TypingCore;
  const KEY = 'hfcyt_arcade_v2', LEGACY = 'hfcyt_campaign_v11';
  let storageFailed = false, raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(LEGACY) || 'null'); } catch { /* Recover an invalid or unavailable save. */ }
  let save = cleanSave(raw, levels.length), selected = save.selected, run = null, frame = 0, characters = [], reported = false, composing = false, soundOn = false, audio = null;
  const now = () => performance.now();
  const number = n => Math.round(n).toLocaleString('en-US');
  const percent = n => (Math.floor(n * 10) / 10).toFixed(1) + '%';
  const clock = n => Math.floor(Math.ceil(n) / 60) + ':' + String(Math.ceil(n) % 60).padStart(2, '0');
  const stars = n => Array.from({length: 3}, (_, i) => '<span' + (i < n ? ' class="earned"' : '') + '>★</span>').join('');
  function persist() {
    save.selected = selected;
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { storageFailed = true; }
    $('storageNotice').hidden = !storageFailed;
  }
  function show(view) {
    for (const id of ['home', 'play', 'results']) $(id).hidden = id !== view;
    $('pauseOverlay').hidden = true;
    $('home').inert = view !== 'home';
    $('app').inert = false;
  }
  function beep(frequency, length = .07) {
    if (!soundOn) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      audio ||= new Audio(); audio.resume().catch(() => {});
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = 'sine'; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(.025, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + length);
      osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + length);
    } catch { /* Sound is optional. */ }
  }
  function renderHome() {
    const total = Object.values(save.stars).reduce((a,b) => a+b, 0);
    $('totalStars').innerHTML = total + '<span> / 60</span>';
    $('completed').textContent = Object.values(save.stars).filter(Boolean).length + ' of 20 levels cleared';
    $('collectionFill').style.width = total / 60 * 100 + '%';
    $('levelGrid').replaceChildren();
    for (const level of levels) {
      const button = document.createElement('button'), locked = level.id > save.unlocked;
      button.className = 'level-tile' + (level.id === selected ? ' selected' : '');
      button.disabled = locked;
      button.dataset.level = level.id;
      button.setAttribute('aria-pressed', String(level.id === selected));
      button.setAttribute('aria-label', 'Level ' + level.id + ': ' + level.title + (locked ? ', locked' : ', ' + (save.stars[level.id] || 0) + ' stars'));
      button.innerHTML = '<span class="num">' + String(level.id).padStart(2,'0') + '</span>' + (locked ? '<span class="lock">LOCKED</span>' : '<span class="tile-stars">' + stars(save.stars[level.id] || 0) + '</span>');
      button.onclick = () => selectLevel(level.id);
      $('levelGrid').append(button);
    }
    const level = levels[selected-1], best = save.bests[selected];
    $('selectedNumber').textContent = 'LEVEL ' + String(selected).padStart(2,'0') + ' / 20';
    $('selectedTitle').textContent = level.title;
    $('selectedDescription').textContent = level.description;
    $('selectedPace').textContent = level.targetWpm + ' WPM';
    $('selectedTime').textContent = clock(level.timeLimitSec);
    $('selectedFocus').textContent = level.focus;
    $('selectedBest').textContent = best ? number(best.wpm) + ' WPM · ' + percent(best.accuracy) + ' accuracy · ' + number(best.score) + ' points' : 'Set your first record.';
    $('start').textContent = 'Start level ' + String(selected).padStart(2,'0') + ' ↗';
  }
  function selectLevel(id) {
    // Also guard scripted events: an active session owns its immutable level.
    if (run && ['ready', 'running', 'paused'].includes(run.phase)) return;
    if (!Number.isInteger(id) || id < 1 || id > save.unlocked) return;
    selected = id; persist(); renderHome();
    const tile = $('levelGrid').querySelector('[data-level="' + id + '"]');
    tile?.focus({preventScroll:true});
  }
  function home() {
    cancelAnimationFrame(frame); run = null; composing = false;
    show('home'); renderHome(); persist(); $('start').focus({preventScroll:true});
  }
  function buildText() {
    characters = []; $('sourceText').replaceChildren();
    run.level.lines.forEach((line, index) => {
      const row = document.createElement('div'); row.className = 'source-line';
      const text = line + (index < run.level.lines.length-1 ? '\n' : '');
      for (const char of text) {
        const span = document.createElement('span'); span.textContent = char === '\n' ? ' ↵' : char;
        span.dataset.break = String(char === '\n'); row.append(span); characters.push(span);
      }
      $('sourceText').append(row);
    });
    $('feed').scrollTop = 0;
  }
  function renderText() {
    for (let i = 0; i < characters.length; i++) {
      const state = i < run.typed.length ? (run.typed[i] === run.text[i] ? 'correct' : 'wrong') : (i === run.typed.length ? 'current' : 'pending');
      characters[i].className = 'char ' + state + (characters[i].dataset.break === 'true' ? ' break' : '');
    }
    // Actual laid-out character position handles wrapped lines at every width.
    const cursor = characters[Math.min($('typing').selectionStart, characters.length-1)];
    if (cursor) $('feed').scrollTop = Math.max(0, cursor.offsetTop - $('feed').clientHeight * .35);
    const progress = Math.round(run.typed.length / run.text.length * 100);
    $('runFill').style.width = progress + '%'; $('runProgress').setAttribute('aria-valuenow', String(progress));
    $('position').textContent = run.typed.length + ' / ' + run.text.length;
  }
  function updateMetrics(t) {
    const m = run.metrics(t);
    $('wpm').textContent = number(m.wpm); $('accuracy').textContent = percent(m.accuracy);
    $('time').textContent = clock(m.remaining); $('time').parentElement.classList.toggle('low', m.remaining <= 10);
    $('score').textContent = number(m.score);
    $('runStatus').textContent = run.phase === 'ready' ? 'READY WHEN YOU ARE' : run.phase === 'paused' ? 'PAUSED' : 'FIND YOUR RHYTHM';
    return m;
  }
  function start() {
    cancelAnimationFrame(frame); run = new Run(levels[selected-1]); reported = false; composing = false;
    show('play'); $('playLevel').textContent = 'LEVEL ' + String(run.level.id).padStart(2,'0') + ' / 20';
    $('playTitle').textContent = run.level.title; $('pace').textContent = 'PACE ' + run.level.targetWpm + ' WPM';
    $('typing').value = ''; $('typing').disabled = false; $('typing').maxLength = run.text.length;
    $('feedback').textContent = 'Take a breath. The timer waits for you.';
    buildText(); renderText(); updateMetrics(now()); $('typing').focus({preventScroll:true});
    frame = requestAnimationFrame(loop);
  }
  function loop(t) {
    if (!run) return;
    run.advance(t); updateMetrics(t);
    if (run.phase === 'ended') { finish(t); return; }
    if (run.phase !== 'paused') frame = requestAnimationFrame(loop);
  }
  function finish(t) {
    if (reported) return; reported = true; cancelAnimationFrame(frame); composing = false;
    $('typing').disabled = true;
    const m = record(save, run, t), last = run.level.id === levels.length;
    persist(); show('results');
    $('resultEyebrow').textContent = 'LEVEL ' + String(run.level.id).padStart(2,'0') + ' / ' + run.level.title.toUpperCase();
    $('resultStars').innerHTML = stars(m.stars); $('resultStars').setAttribute('aria-label', m.stars + ' of 3 stars');
    $('resultTitle').textContent = run.won ? (last ? 'All 20. All you.' : 'Nice typing.') : 'Time to try again.';
    $('resultMessage').textContent = run.won ? (last ? 'Every level cleared. Your next challenge? A new personal best.' : m.stars === 3 ? 'Three stars. That is a rhythm worth keeping.' : 'Level cleared. A cleaner run is one replay away.') : 'Keep it steady. Accuracy first, then speed.';
    $('recordBadge').hidden = !m.personalBest;
    $('resultWpm').textContent = number(m.wpm); $('resultAccuracy').textContent = percent(m.accuracy);
    $('resultScore').textContent = number(m.score); $('resultTime').textContent = clock(m.seconds);
    $('resultDetail').textContent = number(m.correct) + ' correct characters · ' + run.errors + ' mistyped · ' + percent(m.matching) + ' final text match';
    $('next').hidden = !run.won || last;
    beep(run.won ? 740 : 240, .2); $('resultTitle').focus({preventScroll:true});
  }
  function receiveInput(event) {
    if (!run || composing || event?.isComposing) return;
    const t = now(), errors = run.errors;
    run.input($('typing').value, t);
    if ($('typing').value !== run.typed) $('typing').value = run.typed;
    renderText(); const m = updateMetrics(t);
    if (run.errors > errors) beep(180, .035);
    $('feedback').textContent = run.typed.length === run.text.length && m.matching < 90 ? 'Almost there: correct the highlighted text to reach 90% matching.' : 'Keep going. Spaces and line breaks count too.';
    if (run.phase === 'ended') finish(t);
  }
  function pause() {
    if (!run) return;
    const t = now(); run.pause(t);
    if (run.phase === 'ended') { finish(t); return; }
    if (run.phase !== 'paused') return;
    cancelAnimationFrame(frame); $('typing').disabled = true;
    $('pauseOverlay').hidden = false; $('app').inert = true; $('resume').focus();
  }
  function resume() {
    if (!run || run.phase !== 'paused') return;
    run.resume(now()); $('pauseOverlay').hidden = true; $('app').inert = false;
    $('typing').disabled = false; $('typing').focus({preventScroll:true});
    frame = requestAnimationFrame(loop);
  }
  $('typing').addEventListener('input', receiveInput);
  $('typing').addEventListener('compositionstart', () => { composing = true; });
  $('typing').addEventListener('compositionend', () => { composing = false; receiveInput(); });
  for (const event of ['paste','drop']) $('typing').addEventListener(event, e => { e.preventDefault(); $('feedback').textContent = 'This one is for your keyboard. Type it yourself.'; });
  $('typing').addEventListener('beforeinput', e => { if (['insertFromPaste','insertFromDrop'].includes(e.inputType)) e.preventDefault(); });
  $('typing').addEventListener('click', () => { if (run) renderText(); });
  $('start').onclick = start; $('restart').onclick = start; $('retry').onclick = start;
  $('pause').onclick = pause; $('resume').onclick = resume;
  $('leave').onclick = home; $('resultHome').onclick = home; $('pauseHome').onclick = home;
  $('brandHome').onclick = e => { e.preventDefault(); if (!$('boot').hidden) return; home(); };
  $('next').onclick = () => { if (run?.won && run.level.id < levels.length) { selected = run.level.id + 1; persist(); start(); } };
  $('sound').onclick = () => { soundOn = !soundOn; $('sound').textContent = soundOn ? 'Sound on' : 'Sound off'; $('sound').setAttribute('aria-pressed', String(soundOn)); beep(530); };
  $('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(save,null,2)], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'katovia-typing-progress.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden && run && ['ready','running'].includes(run.phase)) pause(); });
  window.addEventListener('blur', () => { if (run && ['ready','running'].includes(run.phase)) pause(); });
  document.addEventListener('keydown', e => {
    if (!$('boot').hidden && ['Escape',' '].includes(e.key)) { e.preventDefault(); intro.skip(); return; }
    if (e.key === 'Escape' && run && ['ready','running','paused'].includes(run.phase)) { e.preventDefault(); run.phase === 'paused' ? resume() : pause(); }
    if (!$('pauseOverlay').hidden && e.key === 'Tab') {
      e.preventDefault(); (document.activeElement === $('resume') ? $('pauseHome') : $('resume')).focus();
    }
  });
  renderHome(); persist();
  let bootFinished = false;
  const intro = new window.KatoviaIntro({stage:$('stage'),duration:4200,onFinish:() => {
    if (bootFinished) return; bootFinished = true; $('boot').hidden = true; $('app').hidden = false; home();
  }});
  $('bootSkip').onclick = () => intro.skip();
  intro.play({mute:true,reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
})();
