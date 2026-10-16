/* Képernyők: főmenü, mesetérkép, bevezető, játék, győzelem. */
(function () {
  'use strict';
  const B = window.Babuktin;
  const $ = (id) => document.getElementById(id);
  const games = B.games;

  const screens = ['title', 'map', 'intro', 'game', 'win'];
  function show(name) {
    if (name !== 'game') stopGame();
    B.stopSpeaking();
    screens.forEach((s) => { $('screen-' + s).hidden = s !== name; });
    window.scrollTo(0, 0);
    if (name === 'title') renderTitle();
    if (name === 'map') renderMap();
  }
  document.querySelectorAll('[data-go]').forEach((b) => {
    b.addEventListener('click', () => { B.sfx.click(); show(b.dataset.go); });
  });

  function nextIndex() {
    const i = games.findIndex((g) => !B.isDone(g.id));
    return i === -1 ? games.length - 1 : i;
  }

  /* ---------- Főmenü ---------- */
  function renderTitle() {
    const started = B.state.done.length > 0;
    $('btn-continue').hidden = !started;
    $('btn-new').classList.toggle('btn-primary', !started);
    $('btn-new').textContent = started ? 'Új játék' : 'Kezdjük! ⛵';
    renderSettings();
  }
  function renderSettings() {
    $('btn-sound').textContent = B.state.sound ? '🔔 Hang: be' : '🔕 Hang: ki';
    $('btn-sound').setAttribute('aria-pressed', String(B.state.sound));
    $('btn-speech').textContent = B.state.speech ? '🗣️ Felolvasás: be' : '🗣️ Felolvasás: ki';
    $('btn-speech').setAttribute('aria-pressed', String(B.state.speech));
  }
  $('btn-continue').addEventListener('click', () => { B.sfx.click(); openIntro(nextIndex()); });
  $('btn-map').addEventListener('click', () => { B.sfx.click(); show('map'); });
  $('btn-new').addEventListener('click', async () => {
    B.sfx.click();
    if (B.state.done.length) {
      const yes = await B.confirm(B.cast.babuktin,
        'Biztosan elölről kezded? A már megoldott mesék újra zárva lesznek.',
        'Igen, elölről', 'Mégse');
      if (!yes) return;
      B.resetProgress();
    }
    openIntro(0);
  });
  $('btn-sound').addEventListener('click', () => {
    B.state.sound = !B.state.sound; B.save(); renderSettings(); B.sfx.click();
  });
  $('btn-speech').addEventListener('click', () => {
    B.state.speech = !B.state.speech; B.save(); renderSettings();
    if (B.state.speech) B.speak('Felolvasás bekapcsolva.'); else B.stopSpeaking();
  });

  /* ---------- Mesetérkép ---------- */
  function renderMap() {
    const grid = $('map-grid');
    grid.innerHTML = '';
    const next = nextIndex();
    games.forEach((g, i) => {
      const unlocked = B.isUnlocked(i);
      const done = B.isDone(g.id);
      const btn = B.el('button', 'island');
      btn.type = 'button';
      if (!unlocked) btn.classList.add('locked');
      if (done) btn.classList.add('done');
      if (unlocked && !done && i === next) btn.classList.add('next');
      btn.innerHTML =
        '<span class="isl-icon">' + g.icon + '</span>' +
        '<span class="isl-num">' + (i + 1) + '. mese</span>' +
        '<span class="isl-name"></span>' +
        '<span class="isl-badge" aria-hidden="true">' + (done ? '⭐' : unlocked ? (i === next ? '⛵' : '') : '🔒') + '</span>';
      btn.querySelector('.isl-name').textContent = g.short;
      btn.setAttribute('aria-label', (i + 1) + '. mese: ' + g.title + (done ? ' (megoldva)' : unlocked ? '' : ' (zárva)'));
      if (unlocked) {
        btn.addEventListener('click', () => { B.sfx.click(); openIntro(i); });
      } else {
        btn.addEventListener('click', () => {
          B.sfx.bad();
          toast('Előbb oldd meg az előző mesét: ' + games[i - 1].short);
        });
      }
      grid.appendChild(btn);
    });
    const friends = games.filter((g) => g.friend && B.isDone(g.id)).length;
    const total = games.filter((g) => g.friend).length;
    $('invites').textContent = '💌 Meghívók Boróka bulijára: ' + friends + ' / ' + total;
  }

  /* ---------- Bevezető ---------- */
  let currentIndex = 0;
  function openIntro(i) {
    currentIndex = i;
    const g = games[i];
    show('intro');
    $('intro-icon').textContent = g.icon;
    $('intro-num').textContent = (i + 1) + '. mese a 12-ből';
    $('intro-title').textContent = g.title;
    $('intro-place').textContent = '📍 ' + g.place;
    const story = $('intro-story');
    story.innerHTML = '';
    g.story.forEach((p) => { const n = B.el('p'); n.textContent = p; story.appendChild(n); });
    $('intro-howto').textContent = g.howto;
    B.autoSpeak(g.title + '. ' + g.story.join(' '));
    $('btn-start').focus();
  }
  $('btn-start').addEventListener('click', () => { B.sfx.click(); startGame(currentIndex); });
  $('btn-read-intro').addEventListener('click', () => {
    const g = games[currentIndex];
    B.speak(g.title + '. ' + g.story.join(' ') + ' Feladat: ' + g.howto);
  });

  /* ---------- Játék futtatása ---------- */
  let run = null;
  let toastTimer = 0;
  function toast(text) {
    const t = $('toast');
    t.textContent = text;
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function stopGame() {
    if (!run) return;
    run.alive = false;
    run.cleanups.forEach((f) => { try { f(); } catch (e) { /* már leállt */ } });
    run = null;
    B.closeDialog();
    $('toast').hidden = true;
  }

  function startGame(i) {
    stopGame();
    const g = games[i];
    currentIndex = i;
    show('game');
    $('game-title').textContent = g.title;
    $('hud').textContent = '';
    const stage = $('stage');
    stage.innerHTML = '';
    stage.className = 'stage stage-' + g.id;
    const r = (run = { alive: true, cleanups: [], won: false });
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const api = {
      stage,
      alive: () => r.alive,
      hud(text) { if (r.alive) $('hud').textContent = text; },
      toast(text) { if (r.alive) toast(text); },
      win() {
        if (!r.alive || r.won) return;
        r.won = true;
        api.timeout(() => finish(i), 400);
      },
      restart() { startGame(i); },
      timeout(fn, ms) {
        const id = setTimeout(() => { if (r.alive) fn(); }, ms);
        r.cleanups.push(() => clearTimeout(id));
        return id;
      },
      interval(fn, ms) {
        const id = setInterval(() => { if (r.alive) fn(); }, ms);
        r.cleanups.push(() => clearInterval(id));
        return id;
      },
      wait(ms) { return new Promise((res) => api.timeout(res, ms)); },
      /* Animációs ciklus: fn(dt mp-ben, idő) – ha false-t ad vissza, megáll. */
      loop(fn) {
        let last = performance.now();
        let id = 0;
        let stopped = false;
        const step = (t) => {
          if (!r.alive || stopped) return;
          const dt = Math.min(0.05, (t - last) / 1000);
          last = t;
          if (fn(dt, t) === false) { stopped = true; return; }
          id = requestAnimationFrame(step);
        };
        id = requestAnimationFrame(step);
        const stop = () => { stopped = true; cancelAnimationFrame(id); };
        r.cleanups.push(stop);
        return stop;
      },
      on(target, ev, fn, opts) {
        target.addEventListener(ev, fn, opts);
        r.cleanups.push(() => target.removeEventListener(ev, fn, opts));
      },
      /* Rajzvászon logikai méretben; point(e) az eseményt vászon-koordinátára váltja. */
      canvas(w, h) {
        const cv = document.createElement('canvas');
        cv.width = w * dpr;
        cv.height = h * dpr;
        cv.className = 'game-canvas';
        cv.style.maxWidth = 'min(100%, calc((100dvh - 150px) * ' + (w / h).toFixed(3) + '))';
        const ctx = cv.getContext('2d');
        ctx.scale(dpr, dpr);
        stage.appendChild(cv);
        return {
          cv, ctx, w, h,
          point(e) {
            const b = cv.getBoundingClientRect();
            return { x: (e.clientX - b.left) * w / b.width, y: (e.clientY - b.top) * h / b.height };
          },
        };
      },
      say: (who, text, btn) => (r.alive ? B.say(who, text, btn) : new Promise(() => {})),
      talk: (lines) => (r.alive ? B.talk(lines) : new Promise(() => {})),
      choice: (who, text, opts) => (r.alive ? B.choice(who, text, opts) : new Promise(() => {})),
    };
    g.start(stage, api);
  }
  $('btn-quit').addEventListener('click', () => { B.sfx.click(); show('map'); });

  /* ---------- Győzelem ---------- */
  function finish(i) {
    const g = games[i];
    B.markDone(g.id);
    stopGame();
    show('win');
    B.sfx.win();
    $('win-title').textContent = g.title;
    const friend = $('win-friend');
    if (g.friend) {
      friend.hidden = false;
      friend.innerHTML = '<span class="f-emoji"></span><b></b><span>Boróka meghívót küld a születésnapjára!</span>';
      friend.querySelector('.f-emoji').textContent = g.friend.e;
      friend.querySelector('b').textContent = 'Új barát: ' + g.friend.name;
    } else {
      friend.hidden = false;
      friend.innerHTML = '<span class="f-emoji">🏆</span><b>Mind a tizenkét mesét megoldottad!</b><span>Igazi világjáró vagy. Az A betűt kiérdemelted!</span>';
    }
    $('win-moral').textContent = g.moral;
    const next = $('btn-next');
    next.hidden = i >= games.length - 1;
    next.onclick = () => { B.sfx.click(); openIntro(i + 1); };
    confetti();
    B.autoSpeak('Mese megoldva! ' + g.moral);
  }
  function confetti() {
    const box = document.querySelector('.confetti');
    box.innerHTML = '';
    const colors = ['#ef6a4c', '#ffc93c', '#3f9d5d', '#1d6f8f', '#c97bd8'];
    for (let k = 0; k < 40; k++) {
      const c = B.el('i');
      c.style.left = Math.random() * 100 + '%';
      c.style.background = colors[k % colors.length];
      c.style.animationDelay = Math.random() * 0.8 + 's';
      box.appendChild(c);
    }
  }

  // Mélylink: #mesek → térkép
  show(location.hash === '#mesek' ? 'map' : 'title');
})();
