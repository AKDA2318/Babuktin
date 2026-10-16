/* A világjáró Babuktin – közös motor: mentés, hangok, felolvasás, párbeszédek.
   Minden mese egy külön fájl a js/games mappában, és a Babuktin.register()-rel jelentkezik be. */
(function () {
  'use strict';

  const B = (window.Babuktin = { games: [] });
  B.register = (game) => B.games.push(game);

  /* ---------- Szereplők ---------- */
  B.cast = {
    babuktin: { e: '🤠', name: 'Babuktin' },
    makkos: { e: '🐐', name: 'Makkos' },
    csikos: { e: '🐯', name: 'Csíkos' },
    narrator: { e: '📖', name: 'Mesélő' },
  };

  /* ---------- Mentés (csak ebben a böngészőben) ---------- */
  const KEY = 'babuktin-mesek-v1';
  const defaults = { done: [], sound: true, speech: false };
  B.state = Object.assign({}, defaults, read());
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  B.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(B.state)); } catch (e) { /* privát ablak: nincs mentés */ }
  };
  B.isDone = (id) => B.state.done.indexOf(id) !== -1;
  B.isUnlocked = (i) => i === 0 || B.isDone(B.games[i - 1].id);
  B.markDone = function (id) {
    if (!B.isDone(id)) { B.state.done.push(id); B.save(); }
  };
  B.resetProgress = function () { B.state.done = []; B.save(); };

  /* ---------- Hangok (Web Audio, fájlok nélkül) ---------- */
  let ac = null;
  function audio() {
    if (!B.state.sound) return null;
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  B.tone = function (freq, dur, type, vol, when) {
    const a = audio();
    if (!a) return;
    dur = dur || 0.15; vol = vol || 0.18;
    const t = a.currentTime + (when || 0);
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
    return o;
  };
  B.slide = function (from, to, dur, type, vol, when) {
    const o = B.tone(from, dur, type, vol, when);
    if (o) o.frequency.exponentialRampToValueAtTime(to, ac.currentTime + (when || 0) + dur);
  };
  B.noise = function (dur, filterFreq, vol, when) {
    const a = audio();
    if (!a) return;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    const f = a.createBiquadFilter();
    const g = a.createGain();
    src.buffer = buf;
    f.type = 'bandpass';
    f.frequency.value = filterFreq || 1200;
    g.gain.value = vol || 0.4;
    src.connect(f).connect(g).connect(a.destination);
    src.start(a.currentTime + (when || 0));
  };
  B.sfx = {
    good() { B.tone(660, 0.1, 'triangle'); B.tone(990, 0.16, 'triangle', 0.18, 0.08); },
    bad() { B.tone(180, 0.25, 'sawtooth', 0.07); },
    pop() { B.tone(520, 0.07, 'square', 0.07); },
    click() { B.tone(880, 0.04, 'square', 0.05); },
    splash() { B.noise(0.35, 700, 0.35); },
    sneeze() { B.noise(0.12, 2500, 0.3); B.noise(0.5, 600, 0.5, 0.12); },
    whoosh() { B.noise(0.3, 1800, 0.25); },
    win() { [523, 659, 784, 1047].forEach((f, i) => B.tone(f, 0.3, 'triangle', 0.2, i * 0.12)); },
    meh() { [0, 0.09, 0.18].forEach((w) => B.slide(520, 430, 0.08, 'sawtooth', 0.06, w)); },
  };

  /* ---------- Felolvasás (a böngésző beépített magyar hangjával, ha van) ---------- */
  let huVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    huVoice = voices.find((v) => /^hu/i.test(v.lang)) || null;
    document.documentElement.classList.toggle('can-speak', !!huVoice);
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
  }
  B.canSpeak = () => !!huVoice;
  B.speak = function (text) {
    if (!huVoice) return;
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[„”"]/g, ''));
    u.voice = huVoice;
    u.lang = huVoice.lang;
    u.rate = 0.95;
    s.speak(u);
  };
  B.stopSpeaking = function () {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };
  B.autoSpeak = function (text) { if (B.state.speech) B.speak(text); };

  /* ---------- Emoji-támogatás ellenőrzése (régi eszközökön tartalék jel) ---------- */
  B.EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  const emojiCache = {};
  B.emoji = function (ch, fallback) {
    if (!(ch in emojiCache)) {
      let ok = true;
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 24;
        const x = c.getContext('2d', { willReadFrequently: true });
        x.font = '20px ' + B.EMOJI_FONT;
        x.textBaseline = 'top';
        x.fillText(ch, 0, 0);
        const d = x.getImageData(0, 0, 24, 24).data;
        ok = false;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] > 0 && (Math.abs(d[i] - d[i + 1]) > 8 || Math.abs(d[i + 1] - d[i + 2]) > 8)) { ok = true; break; }
        }
        // Az összetett (ZWJ) emojit a régebbi rendszerek több külön jelként rajzolják ki: ilyenkor szélesebb.
        if (ok && ch.indexOf('‍') !== -1) ok = x.measureText(ch).width < x.measureText('😀').width * 1.5;
      } catch (e) { ok = true; }
      emojiCache[ch] = ok;
    }
    return emojiCache[ch] ? ch : fallback;
  };

  /* ---------- Segédek ---------- */
  B.el = function (tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  B.rand = (a, b) => a + Math.random() * (b - a);
  B.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  B.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  B.drawEmoji = function (ctx, ch, x, y, size) {
    ctx.font = size + 'px ' + B.EMOJI_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, x, y);
  };
  B.shake = function (node) {
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
  };

  /* ---------- Párbeszéd ablak ---------- */
  const dlg = {};
  function dialogEls() {
    if (!dlg.root) {
      dlg.root = document.getElementById('dialog');
      dlg.emoji = document.getElementById('dialog-emoji');
      dlg.name = document.getElementById('dialog-name');
      dlg.text = document.getElementById('dialog-text');
      dlg.options = document.getElementById('dialog-options');
      dlg.feedback = document.getElementById('dialog-feedback');
      dlg.speak = document.getElementById('dialog-speak');
      dlg.speak.addEventListener('click', () => B.speak(dlg.name.textContent + '. ' + dlg.text.textContent));
    }
    return dlg;
  }
  let dialogToken = 0;
  function openDialog(who, text) {
    const d = dialogEls();
    dialogToken++;
    d.emoji.textContent = who.e;
    d.name.textContent = who.name;
    d.text.textContent = text;
    d.options.innerHTML = '';
    d.feedback.textContent = '';
    d.root.hidden = false;
    B.autoSpeak(text);
    return dialogToken;
  }
  B.closeDialog = function () {
    dialogToken++;
    if (dlg.root) dlg.root.hidden = true;
    B.stopSpeaking();
  };

  /* Egy mondat, "Tovább" gombbal. */
  B.say = function (who, text, button) {
    return new Promise((resolve) => {
      const token = openDialog(who, text);
      const btn = B.el('button', 'btn btn-primary', button || 'Tovább ▶');
      btn.type = 'button';
      btn.addEventListener('click', () => {
        if (token !== dialogToken) return;
        B.sfx.click();
        B.closeDialog();
        resolve();
      });
      dlg.options.appendChild(btn);
      btn.focus();
    });
  };

  /* Több mondat egymás után: [[szereplő, szöveg], ...] */
  B.talk = async function (lines) {
    for (const [who, text] of lines) await B.say(who, text);
  };

  /* Választós kérdés. Csak a jó válasz zárja be; a rossz válasz kedves magyarázatot kap. */
  B.choice = function (who, text, options) {
    return new Promise((resolve) => {
      const token = openDialog(who, text);
      B.shuffle(options).forEach((opt) => {
        const btn = B.el('button', 'btn', '');
        btn.type = 'button';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
          if (token !== dialogToken) return;
          if (opt.ok) {
            B.sfx.good();
            B.closeDialog();
            resolve(opt);
          } else {
            B.sfx.bad();
            btn.classList.add('wrong');
            btn.disabled = true;
            dlg.feedback.textContent = opt.reply || 'Próbáld másképp!';
            B.autoSpeak(dlg.feedback.textContent);
          }
        });
        dlg.options.appendChild(btn);
      });
    });
  };

  /* Igen/nem megerősítés a menühöz. */
  B.confirm = function (who, text, yes, no) {
    return new Promise((resolve) => {
      const token = openDialog(who, text);
      [[yes, true, 'btn btn-primary'], [no, false, 'btn']].forEach(([label, val, cls]) => {
        const btn = B.el('button', cls, '');
        btn.type = 'button';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (token !== dialogToken) return;
          B.closeDialog();
          resolve(val);
        });
        dlg.options.appendChild(btn);
      });
    });
  };
})();
