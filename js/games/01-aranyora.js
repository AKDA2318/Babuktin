/* 1. mese – Babuktin és az aranyóra
   A mese nyolc rövid fejezetben halad, a fontos pillanatok kis játékok: a felszerelés felkapása
   a nyílzáporban, úszás a tengeri lények között, a nyilak felfogása a pajzzsal és Dobrava öt napos
   házépítése. A szövegek a vászon fölötti HTML-rétegben vannak, hogy telefonon is olvashatók legyenek. */
Babuktin.register({
  id: 'aranyora',
  title: 'Babuktin és az aranyóra',
  short: 'Az aranyóra',
  icon: '⌚',
  place: 'Dadogó-szigetek',
  story: [
    'Dobrava, Babuktin régi bajtársa rohanva érkezik a kikötőbe. A legutóbbi kalandján elhagyta az édesapjától kapott aranyóráját a Dadogó-szigeteken!',
    'Ha Babuktin segít megkeresni, neki adja az egyik hajóját. Makkos, a kecske és Csíkos, a kis tigris is velük tart. De vajon miért kér Dobrava segítséget?',
  ],
  howto: 'Kövesd a mesét fejezetről fejezetre! Kapd fel Babuktin felszerelését, ússz a part felé a tengeri lények között, fogd fel a nyilakat a pajzzsal, végül Dobrava kalapácsával építsd újra a leégett házat.',
  moral: '„Helyrehoztad, amit elrontottál.” Ami fontos, azt becsületesen kell visszaszerezni.',
  friend: { e: '🧔', name: 'Dobrava' },

  async start(stage, api) {
    const B = Babuktin;
    const W = 800, H = 500, CHAPTERS = 8;
    const { ctx, cv, point } = api.canvas(W, H);

    // A vászon fölé HTML-réteg kerül a buborékoknak és feliratoknak.
    const wrap = B.el('div', 'tale-wrap');
    wrap.style.maxWidth = cv.style.maxWidth;
    cv.style.maxWidth = '100%';
    stage.appendChild(wrap);
    wrap.appendChild(cv);
    const layer = B.el('div', 'tale-layer');
    wrap.appendChild(layer);

    const hero = B.cast.babuktin;
    const narrator = B.cast.narrator;
    const dobrava = { e: '🧔', name: 'Dobrava' };
    const oreg = { e: '👴', name: 'Az öreg íjász' };
    const ijasz = { e: '🧑', name: 'Egy íjász' };

    /* ---------- Jelenetek kezelése ---------- */
    let t = 0;
    let scene = null;
    let fade = 0, fadeGoal = 0, fadeDone = null;
    api.on(cv, 'pointerdown', (e) => {
      e.preventDefault();
      if (scene && scene.tap && fade === 0) scene.tap(point(e));
    });
    api.on(window, 'keydown', (e) => { if (scene && scene.key) scene.key(e); });
    api.loop((dt) => {
      t += dt;
      if (scene) {
        if (scene.update) scene.update(dt);
        ctx.save();
        scene.draw();
        ctx.restore();
      }
      if (fade !== fadeGoal) {
        fade = fadeGoal > fade ? Math.min(fadeGoal, fade + dt * 2.5) : Math.max(fadeGoal, fade - dt * 2.5);
        if (fade === fadeGoal && fadeDone) { const f = fadeDone; fadeDone = null; f(); }
      }
      if (fade > 0) {
        ctx.fillStyle = 'rgba(12, 34, 50, ' + fade + ')';
        ctx.fillRect(0, 0, W, H);
      }
    });
    function fadeTo(v) {
      return new Promise((res) => {
        fadeGoal = v;
        if (fade === v) { res(); return; }
        fadeDone = res;
      });
    }
    function makeScene(obj) {
      obj.finished = new Promise((r) => { obj.finish = r; });
      return obj;
    }
    async function chapter(n, title, next) {
      if (scene) await fadeTo(1);
      layer.innerHTML = '';
      scene = next;
      api.hud('📖 ' + n + '/' + CHAPTERS);
      await fadeTo(0);
      banner(n + '. fejezet', title);
      await api.wait(1100);
    }
    async function cut(fn) {
      await fadeTo(1);
      fn();
      await fadeTo(0);
    }

    /* ---------- Feliratok a vászon fölött ---------- */
    function place(node, x, y) {
      node.style.left = (x / W) * 100 + '%';
      node.style.top = (y / H) * 100 + '%';
    }
    function bubble(x, y, text, cls, ms) {
      const b = B.el('div', 'tale-bubble' + (cls ? ' ' + cls : ''));
      b.textContent = text;
      place(b, x, y);
      layer.appendChild(b);
      if (ms) api.timeout(() => b.remove(), ms);
      return b;
    }
    function clearBubbles() {
      layer.querySelectorAll('.tale-bubble').forEach((b) => b.remove());
    }
    function banner(small, big) {
      const n = B.el('div', 'tale-banner', '<small></small><b></b>');
      n.querySelector('small').textContent = small;
      n.querySelector('b').textContent = big;
      layer.appendChild(n);
      api.timeout(() => n.classList.add('out'), 2000);
      api.timeout(() => n.remove(), 2600);
    }
    let hintEl = null;
    function hint(text) {
      if (hintEl) { hintEl.remove(); hintEl = null; }
      if (!text) return;
      hintEl = B.el('div', 'tale-hint');
      hintEl.textContent = text;
      layer.appendChild(hintEl);
    }

    /* ---------- Rajzoló segédek ---------- */
    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    function sky(c1, c2, h) {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, h);
    }
    function sun(x, y, r) {
      ctx.fillStyle = 'rgba(255, 212, 92, .3)';
      ctx.beginPath(); ctx.arc(x, y, r + 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd45c';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    function clouds(speed) {
      ctx.fillStyle = 'rgba(255, 255, 255, .9)';
      for (let k = 0; k < 4; k++) {
        const x = ((k * 260 - t * speed) % 1040 + 1040) % 1040 - 120;
        const y = 46 + (k % 2) * 44, s = 0.8 + (k % 3) * 0.2;
        [[0, 0, 20], [22, -10, 24], [46, 0, 18], [22, 6, 20]].forEach(([dx, dy, r]) => {
          ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); ctx.fill();
        });
      }
    }
    function gulls() {
      ctx.strokeStyle = '#33424f'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const x = ((k * 280 + t * 36) % 940) - 70, y = 120 + k * 26 + Math.sin(t * 2 + k) * 8, f = Math.sin(t * 8 + k) * 3;
        ctx.beginPath();
        ctx.moveTo(x - 11, y - 4 + f); ctx.quadraticCurveTo(x - 5, y - 9, x, y);
        ctx.quadraticCurveTo(x + 5, y - 9, x + 11, y - 4 + f);
        ctx.stroke();
      }
    }
    function waves(y, speed, rows) {
      ctx.strokeStyle = 'rgba(255, 255, 255, .5)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let r = 0; r < rows; r++) {
        const yy = y + 16 + r * 34, off = (t * speed * (1 + r * 0.5)) % 64;
        ctx.beginPath();
        for (let x = -64 - off + (r % 2) * 32; x < W + 64; x += 64) {
          ctx.moveTo(x, yy);
          ctx.quadraticCurveTo(x + 14, yy - 7, x + 28, yy);
        }
        ctx.stroke();
      }
    }
    function seaBand(y, speed, h) {
      const hh = h || H - y;
      const g = ctx.createLinearGradient(0, y, 0, y + hh);
      g.addColorStop(0, '#3d9cc0'); g.addColorStop(1, '#16587a');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, W, hh);
      waves(y, speed, Math.max(1, Math.min(3, Math.floor(hh / 40))));
    }
    function sail(cx, top, h, w) {
      const l = cx - w / 2, r = cx + w / 2, bulge = 9 + Math.sin(t * 2) * 2;
      ctx.beginPath();
      ctx.moveTo(l, top); ctx.lineTo(r, top);
      ctx.quadraticCurveTo(r + bulge, top + h / 2, r, top + h);
      ctx.lineTo(l, top + h);
      ctx.quadraticCurveTo(l + bulge, top + h / 2, l, top);
      ctx.fill(); ctx.stroke();
    }
    // Kétárbocos brigg, jobbra néz; (x, y) a fedélzet vonala.
    function ship(x, y, s, tilt) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(tilt || 0); ctx.scale(s, s);
      ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 7; ctx.lineCap = 'butt';
      [[-45, -192], [55, -166]].forEach(([mx, top]) => {
        ctx.beginPath(); ctx.moveTo(mx, -10); ctx.lineTo(mx, top); ctx.stroke();
      });
      ctx.fillStyle = '#fffaf0'; ctx.strokeStyle = '#d8c9a8'; ctx.lineWidth = 2;
      sail(-45, -180, 56, 80); sail(-45, -118, 74, 104);
      sail(55, -154, 50, 72); sail(55, -98, 68, 96);
      ctx.fillStyle = '#ef6a4c';
      ctx.beginPath(); ctx.moveTo(-45, -192); ctx.lineTo(-10, -185 + Math.sin(t * 6) * 3); ctx.lineTo(-45, -176); ctx.fill();
      ctx.fillStyle = '#7a4a24';
      ctx.beginPath();
      ctx.moveTo(-130, -12); ctx.lineTo(136, -12); ctx.quadraticCurveTo(120, 30, 88, 42);
      ctx.lineTo(-96, 42); ctx.quadraticCurveTo(-124, 26, -130, -12);
      ctx.fill();
      ctx.fillStyle = '#c9a35b'; ctx.fillRect(-122, -2, 248, 7);
      ctx.fillStyle = '#3e2412';
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(k * 42, 20, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    // a hajótest víz alatti része
    function shipWater(x, y, s) {
      ctx.fillStyle = 'rgba(29, 111, 143, .6)';
      ctx.fillRect(x - 140 * s, y + 18 * s, 280 * s, 30 * s);
    }
    function island(x, y, w, palm) {
      ctx.fillStyle = '#f2d38b';
      ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.3, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#5ea35f';
      ctx.beginPath(); ctx.ellipse(x, y - w * 0.12, w * 0.62, w * 0.16, 0, Math.PI, 0); ctx.fill();
      if (palm) B.drawEmoji(ctx, '🌴', x + w * 0.2, y - w * 0.42, w * 0.7);
    }
    // nyílvessző: a hegye (x, y)-ban, az ang irányába mutat
    function arrow(x, y, ang, len) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang);
      ctx.strokeStyle = '#7a5230'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, 0); ctx.stroke();
      ctx.fillStyle = '#59616a';
      ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-2, -5); ctx.lineTo(-2, 5); ctx.fill();
      ctx.fillStyle = '#ef6a4c';
      ctx.beginPath(); ctx.moveTo(-len + 6, 0); ctx.lineTo(-len - 6, -6); ctx.lineTo(-len - 2, 0); ctx.lineTo(-len - 6, 6); ctx.fill();
      ctx.restore();
    }
    // a vizeshordó teteje, ebből lesz a pajzs
    function lid(x, y, r) {
      ctx.fillStyle = '#b5702e';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b3f17'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.75, y - r * 0.32); ctx.lineTo(x + r * 0.75, y - r * 0.32);
      ctx.moveTo(x - r * 0.75, y + r * 0.32); ctx.lineTo(x + r * 0.75, y + r * 0.32);
      ctx.stroke();
    }
    function woodSword(x, y, ang, s) {
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
      ctx.fillStyle = '#d6a868';
      ctx.beginPath(); ctx.moveTo(-5, -4); ctx.lineTo(-5, -62); ctx.lineTo(0, -72); ctx.lineTo(5, -62); ctx.lineTo(5, -4); ctx.fill();
      ctx.fillStyle = '#7a4a24';
      ctx.fillRect(-15, -6, 30, 7);
      ctx.fillRect(-3.5, 1, 7, 18);
      ctx.restore();
    }
    function cloak(x, y, s, flutter) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0);
      ctx.quadraticCurveTo(26 + flutter, 40, 24, 72); ctx.lineTo(-24, 72);
      ctx.quadraticCurveTo(-26 + flutter, 40, -14, 0); ctx.fill();
      ctx.fillStyle = '#ffc93c';
      ctx.beginPath(); ctx.arc(0, 3, 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function barrel(x, y, s) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = '#9c6a3a'; rr(-26, -64, 52, 64, 12); ctx.fill();
      ctx.strokeStyle = '#5b3a1c'; ctx.lineWidth = 4;
      [-50, -14].forEach((yy) => { ctx.beginPath(); ctx.moveTo(-26, yy); ctx.lineTo(26, yy); ctx.stroke(); });
      ctx.restore();
    }
    function crate(x, y, s) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(s, s);
      ctx.fillStyle = '#c08a4e'; ctx.fillRect(-28, -50, 56, 50);
      ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 4; ctx.strokeRect(-28, -50, 56, 50);
      ctx.beginPath(); ctx.moveTo(-28, -50); ctx.lineTo(28, 0); ctx.stroke();
      ctx.restore();
    }
    // pulzáló gyűrű a megérinthető dolgok körül
    function glow(x, y, r) {
      ctx.strokeStyle = 'rgba(255, 201, 60, ' + (0.5 + Math.sin(t * 5) * 0.3) + ')';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(x, y, r + Math.sin(t * 5) * 4, 0, Math.PI * 2); ctx.stroke();
    }
    // Egész alakos szereplő: emojifej, rajzolt test. (x, y) a csípő helye.
    function figure(x, y, face, o) {
      ctx.lineCap = 'round';
      if (o.cape) {
        ctx.fillStyle = '#c0392b';
        ctx.beginPath(); ctx.moveTo(x - 4, y - 40);
        ctx.quadraticCurveTo(x - 40, y - 22 + Math.sin(t * 9) * 5, x - 50, y + 6);
        ctx.lineTo(x - 8, y + 2); ctx.fill();
      }
      ctx.strokeStyle = o.legs || '#34405e'; ctx.lineWidth = 10;
      ctx.beginPath();
      if (o.sit) {
        const d = o.flip ? -1 : 1;
        ctx.moveTo(x - 6 * d, y + 2); ctx.lineTo(x + 24 * d, y + 6);
        ctx.moveTo(x + 4 * d, y + 2); ctx.lineTo(x + 28 * d, y - 2);
      } else {
        const sw = Math.sin(o.run || 0) * 13;
        ctx.moveTo(x - 5, y); ctx.lineTo(x - 5 + sw, y + 40);
        ctx.moveTo(x + 5, y); ctx.lineTo(x + 5 - sw, y + 40);
      }
      ctx.stroke();
      ctx.fillStyle = o.shirt || '#2f6fa3';
      rr(x - 17, y - 44, 34, 48, 10); ctx.fill();
      if (o.sword) woodSword(x - 10, y - 4, -0.7, 0.62);
      B.drawEmoji(ctx, face, x, y - 66, o.size || 48);
    }
    function archerFig(x, y, face, o) {
      const hip = o.sit ? y + 28 : y;
      figure(x, hip, face, { shirt: '#4f8a4a', legs: '#5b4632', sit: o.sit, flip: true, size: 46 });
      if (o.bow) {
        const by = hip - 22, cx = x - 14, a1 = Math.PI * 0.62, a2 = Math.PI * 1.38;
        ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, by, 28, a1, a2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, .85)'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * 28, by + Math.sin(a1) * 28);
        ctx.lineTo(cx + Math.cos(a2) * 28, by + Math.sin(a2) * 28);
        ctx.stroke();
      }
      if (o.bowDown) {
        ctx.strokeStyle = '#7a4a24'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(x - 30, y + 44, 26, 6, 0, Math.PI, 0); ctx.stroke();
      }
      if (o.scared) B.drawEmoji(ctx, '💦', x + 24, hip - 94, 22);
    }
    function sparkle(x, y) {
      ctx.globalAlpha = 0.6 + Math.sin(t * 7) * 0.4;
      B.drawEmoji(ctx, '✨', x, y, 20);
      ctx.globalAlpha = 1;
    }

    /* ---------- 1. fejezet: A kikötőben ---------- */
    function portScene() {
      const sc = makeScene({
        dobX: -60,
        update(dt) { sc.dobX = Math.min(200, sc.dobX + dt * 230); },
        draw() {
          sky('#9fd8ee', '#eaf7f9', 300);
          sun(700, 66, 30);
          clouds(8);
          gulls();
          seaBand(300, 22);
          ship(630, 300, 0.8, Math.sin(t * 1.3) * 0.015);
          shipWater(630, 300, 0.8);
          // móló
          ctx.fillStyle = '#6b3f1d';
          for (let x = 26; x < 490; x += 76) ctx.fillRect(x, 326, 14, 120);
          ctx.fillStyle = '#a9743f'; ctx.fillRect(0, 314, 500, 18);
          ctx.strokeStyle = 'rgba(60, 30, 10, .35)'; ctx.lineWidth = 2;
          for (let x = 40; x < 500; x += 40) { ctx.beginPath(); ctx.moveTo(x, 314); ctx.lineTo(x, 332); ctx.stroke(); }
          barrel(46, 314, 0.75);
          crate(100, 314, 0.75);
          B.drawEmoji(ctx, '🤠', 320, 284, 58);
          B.drawEmoji(ctx, '🐯', 392, 294, 38);
          B.drawEmoji(ctx, '🐐', 446, 290, 44);
          const running = sc.dobX < 200;
          B.drawEmoji(ctx, '🧔', sc.dobX, 284 - (running ? Math.abs(Math.sin(t * 14)) * 9 : 0), 58);
          if (running) {
            ctx.fillStyle = 'rgba(255, 255, 255, .6)';
            ctx.beginPath(); ctx.arc(sc.dobX - 36, 306, 8 + Math.sin(t * 20) * 2, 0, Math.PI * 2); ctx.fill();
          }
        },
      });
      return sc;
    }

    /* ---------- 2. fejezet: Úton a szigetek felé ---------- */
    function voyageScene() {
      const SX = 300, SY = 330, CYCLE = 2.7;
      const qs = [
        ['Ott vagyunk már?', 'Még nem.'],
        ['És most?', 'Még mindig nem.'],
        ['Biztos jó felé megyünk?', 'Biztos! Én vagyok A világjáró Babuktin!'],
        ['Ugye megtaláljuk az órát?', 'Megtaláljuk, ne aggódj!'],
      ];
      const sc = makeScene({
        time: 0, cyc: -1, answered: true, isl: W + 60, arrived: false,
        update(dt) {
          sc.time += dt;
          const cyc = Math.floor(sc.time / CYCLE);
          if (cyc < qs.length) {
            if (cyc !== sc.cyc) {
              sc.cyc = cyc;
              sc.answered = false;
              clearBubbles();
              bubble(SX + 130, SY - 70, qs[cyc][0]);
            }
            if (!sc.answered && sc.time - cyc * CYCLE > 1.4) answer();
            return;
          }
          if (sc.cyc < qs.length) { sc.cyc = qs.length; clearBubbles(); }
          sc.isl = Math.max(440, sc.isl - dt * 260);
          if (sc.isl === 440 && !sc.arrived) {
            sc.arrived = true;
            bubble(SX - 30, SY - 70, 'Ott vannak a Dadogó-szigetek! Tíz sziget… Melyiken hagytad az órát?', 'hero');
            api.timeout(sc.finish, 2600);
          }
        },
        tap() { if (sc.cyc >= 0 && sc.cyc < qs.length && !sc.answered) answer(); },
        draw() {
          sky('#8fd0ea', '#e6f5f8', 300);
          sun(680, 80, 30);
          clouds(30);
          seaBand(300, 90);
          if (sc.cyc >= qs.length) {
            for (let k = 0; k < 10; k++) island(sc.isl + k * 38 + (k % 2) * 6, 302, 30 + (k % 3) * 8, k % 3 === 0);
          }
          // a hajó nyoma
          ctx.fillStyle = 'rgba(255, 255, 255, .6)';
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.ellipse(SX - 120 - k * 34 - (t * 120) % 34, SY + 28 + Math.sin(t * 4 + k) * 2, 16, 4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          const bob = Math.sin(t * 2.2) * 4;
          ship(SX, SY + bob, 0.8, Math.sin(t * 1.6) * 0.03);
          B.drawEmoji(ctx, '🐯', SX - 100, SY - 18 + bob, 28);
          B.drawEmoji(ctx, '🤠', SX - 60, SY - 22 + bob, 40);
          B.drawEmoji(ctx, '🧔', SX + 40, SY - 22 + bob, 40);
          B.drawEmoji(ctx, '🐐', SX + 85, SY - 18 + bob, 30);
          shipWater(SX, SY + bob, 0.8);
        },
      });
      function answer() {
        sc.answered = true;
        bubble(SX - 90, SY - 70, qs[sc.cyc][1], 'hero');
        B.sfx.pop();
      }
      return sc;
    }

    /* ---------- 3. fejezet: Nyílzápor ---------- */
    function deckScene() {
      const HX = 320, HY = 384;
      const items = [
        { name: 'Köpeny', x: 152, y: 214 },
        { name: 'Fakard', x: 548, y: 360 },
        { name: 'Pajzs', x: 660, y: 316 },
      ];
      const avoid = [HX, 455, 80, 724];
      const sc = makeScene({
        active: false, rain: 0, falling: [], stuck: [], jump: -1, splashed: false,
        start() {
          sc.active = true;
          hint('Gyorsan! Koppints a köpenyre, a fakardra és a hordó tetejére!');
        },
        tap(p) {
          if (!sc.active) return;
          const it = items.find((i) => !i.got && Math.hypot(p.x - i.x, p.y - i.y) < 80);
          if (!it) return;
          it.got = true;
          it.fly = 0;
          B.sfx.good();
          bubble(it.x, it.y - 46, it.name + ' ✓', 'shout', 900);
          if (items.every((i) => i.got)) {
            sc.active = false;
            hint('');
            api.timeout(() => bubble(HX, HY - 44, 'Ennyi elég. Ugrás!', 'hero', 1300), 500);
            api.timeout(() => { sc.jump = 0; }, 1500);
          }
        },
        update(dt) {
          sc.rain -= dt;
          if (sc.rain <= 0 && sc.jump < 0) {
            sc.rain = B.rand(0.14, 0.32);
            let tx = B.rand(60, 760);
            avoid.forEach((ax) => { if (Math.abs(tx - ax) < 48) tx = ax + (tx < ax ? -60 : 60); });
            const sx = tx + B.rand(90, 170);
            sc.falling.push({ x: sx, y: -30, sx, tx, ty: B.rand(350, 490), k: 0 });
          }
          sc.falling.forEach((a) => {
            a.k = Math.min(1, a.k + dt * 2.2);
            a.x = a.sx + (a.tx - a.sx) * a.k;
            a.y = -30 + (a.ty + 30) * a.k;
          });
          sc.falling = sc.falling.filter((a) => {
            if (a.k < 1) return true;
            sc.stuck.push({ x: a.tx, y: a.ty, a: Math.atan2(a.ty + 30, a.tx - a.sx) });
            if (sc.stuck.length > 36) sc.stuck.shift();
            if (Math.random() < 0.35) B.tone(140, 0.05, 'square', 0.05);
            return false;
          });
          items.forEach((i) => { if (i.got && i.fly < 1) i.fly = Math.min(1, i.fly + dt * 2.6); });
          if (sc.jump >= 0) {
            sc.jump += dt / 1.1;
            if (sc.jump >= 1 && !sc.splashed) {
              sc.splashed = true;
              B.sfx.splash();
              api.timeout(sc.finish, 500);
            }
          }
        },
        draw() {
          sky('#9fd3e8', '#e7f4f6', 236);
          seaBand(232, 18, 100);
          for (let k = 0; k < 10; k++) island(470 + k * 34, 236, 24 + (k % 3) * 6, k % 3 === 1);
          // íjászok a parton, messziről
          ctx.fillStyle = '#4f8a4a';
          [540, 600, 668].forEach((x) => {
            ctx.fillRect(x, 214, 5, 12);
            ctx.beginPath(); ctx.arc(x + 2.5, 210, 4, 0, Math.PI * 2); ctx.fill();
          });
          // korlát és fedélzet
          ctx.fillStyle = '#7a4a24'; ctx.fillRect(0, 288, W, 10);
          for (let x = 8; x < W; x += 64) ctx.fillRect(x, 288, 10, 46);
          ctx.fillStyle = '#b5824b'; ctx.fillRect(0, 332, W, H - 332);
          ctx.strokeStyle = 'rgba(90, 50, 20, .3)'; ctx.lineWidth = 2;
          for (let y = 356; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
          // árboc a köpennyel
          ctx.fillStyle = '#6b3f1d'; ctx.fillRect(126, 0, 22, 340);
          ctx.fillStyle = '#444'; ctx.fillRect(146, 178, 14, 5);
          const [iCloak, iSword, iLid] = items;
          if (!iCloak.got) { glow(iCloak.x, iCloak.y, 52); cloak(152, 180, 0.95, Math.sin(t * 3) * 4); }
          // vizeshordó a tetejével, mellette a fakard
          barrel(660, 404, 1.25);
          if (!iLid.got) {
            glow(iLid.x, iLid.y, 42);
            ctx.save(); ctx.translate(660, 322); ctx.scale(1, 0.38); lid(0, 0, 34); ctx.restore();
          }
          if (!iSword.got) { glow(iSword.x, iSword.y, 46); woodSword(540, 398, 0.32, 1); }
          sc.stuck.forEach((a) => arrow(a.x, a.y, a.a, 30));
          B.drawEmoji(ctx, '🐐', 80, 446, 46);
          B.drawEmoji(ctx, '🐯', 724, 452, 40);
          B.drawEmoji(ctx, '🧔', 455, 386, 46);
          crate(455, 446, 1.15);
          // Babuktin, ugrás közben is
          let hx = HX, hy = HY;
          if (sc.jump >= 0) {
            const j = Math.min(1, sc.jump);
            hx = HX + j * 560;
            hy = HY - Math.sin(j * Math.PI) * 170 + j * 140;
          }
          if (sc.jump < 1) {
            if (iCloak.got && iCloak.fly >= 1) cloak(hx - 4, hy - 16, 0.8, Math.sin(t * 8) * 5);
            B.drawEmoji(ctx, '🤠', hx, hy, 62);
            if (iSword.got && iSword.fly >= 1) woodSword(hx - 30, hy + 34, -0.5, 0.7);
            if (iLid.got && iLid.fly >= 1) lid(hx + 38, hy + 12, 22);
          }
          // a felkapott tárgyak Babuktinhoz repülnek
          items.forEach((i, k) => {
            if (!i.got || i.fly >= 1) return;
            const x = i.x + (HX - i.x) * i.fly;
            const y = i.y + (HY - i.y) * i.fly - Math.sin(i.fly * Math.PI) * 60;
            if (k === 0) cloak(x, y - 30, 0.7, 0);
            else if (k === 1) woodSword(x, y + 30, 0, 0.7);
            else lid(x, y, 22);
          });
          sc.falling.forEach((a) => arrow(a.x, a.y, Math.atan2(a.ty + 30, a.tx - a.sx), 30));
        },
      });
      return sc;
    }

    /* ---------- 4. fejezet: A víz alatt ---------- */
    function swimScene() {
      const lanes = [175, 290, 405];
      const LENGTH = 30; // ennyi másodperc zavartalan úszás a partig
      const kinds = {
        hal: { e: '🐟', speed: 1, size: 54, msg: 'Bocsánat, halacska!' },
        raj: { e: '🐠', speed: 1.12, size: 42, msg: 'Hoppá, egy egész halraj!' },
        gomb: { e: '🐡', speed: 0.75, size: 52, msg: 'Au! Szúrós a gömbhal!', puff: true },
        tinta: { e: '🦑', speed: 1.05, size: 56, msg: 'Pfff! A tintahal tintát fújt rád!', wave: true },
        polip: { e: '🐙', speed: 0.85, size: 58, msg: 'Hihi! A polip megcsiklandozott!', wave: true },
        capa: { e: '🦈', speed: 1.9, size: 80, msg: 'Huh, egy cápa! Szerencsére csak megijesztett.' },
        delfin: { e: '🐬', speed: 0.55, size: 66 },
      };
      let gid = 0;
      const sc = makeScene({
        active: false, lane: 1, px: 150, py: lanes[1], progress: 0, stun: 0, boost: 0,
        spawn: 1.2, shark: 8, dolphinIn: 7, dolphins: 2, warn: null, lastFree: 1,
        objs: [], bubbles: [], arrows: [], done: false, out: 0, splashed: false,
        start() {
          sc.active = true;
          hint('Koppints Babuktin fölé vagy alá (↑ ↓)! Kerüld ki a tengeri lényeket. A delfin a barátod!');
          api.timeout(() => hint(''), 7000);
        },
        tap(p) { if (sc.active && !sc.done) move(p.y < sc.py ? -1 : 1); },
        key(e) {
          if (!sc.active || sc.done) return;
          if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); move(-1); }
          if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); move(1); }
        },
        update(dt) {
          if (!sc.active) return;
          const speed = sc.stun > 0 ? 90 : sc.boost > 0 ? 420 : 250;
          if (!sc.done) {
            sc.progress = Math.min(1, sc.progress + dt * (sc.stun > 0 ? 0.35 : sc.boost > 0 ? 2.2 : 1) / LENGTH);
            api.hud('🏝️ ' + Math.floor(sc.progress * 100) + '%');
            if (sc.progress >= 1) { sc.done = true; hint(''); }
          }
          sc.stun = Math.max(0, sc.stun - dt);
          sc.boost = Math.max(0, sc.boost - dt);
          if (!sc.done) {
            sc.py += (lanes[sc.lane] - sc.py) * Math.min(1, dt * 12);
          } else {
            // kiúszik a partra
            sc.out += dt;
            sc.px += (560 - sc.px) * Math.min(1, dt * 2);
            sc.py += (70 - sc.py) * Math.min(1, dt * 2.4);
            if (sc.out > 1.3 && !sc.splashed) {
              sc.splashed = true;
              B.sfx.splash();
              api.timeout(sc.finish, 600);
            }
          }

          if (!sc.done && sc.progress < 0.86) {
            sc.spawn -= dt; sc.shark -= dt; sc.dolphinIn -= dt;
            if (sc.warn) {
              sc.warn.time -= dt;
              if (sc.warn.time <= 0) {
                add('capa', sc.warn.lane, W + 70, ++gid);
                sc.warn = null;
                sc.spawn = Math.max(sc.spawn, 1.3);
              }
            } else if (sc.shark <= 0 && sc.progress > 0.2) {
              // a cápa abba a sávba jön, ahol a legutóbbi lények is úsznak: a szabad sáv szabad marad
              sc.warn = { lane: B.pick([0, 1, 2].filter((l) => l !== sc.lastFree)), time: 1.2 };
              sc.shark = B.rand(8, 11);
            }
            if (sc.spawn <= 0 && !sc.warn) {
              spawn();
              sc.spawn = B.rand(1.0, 1.4) - sc.progress * 0.3;
            }
          }

          for (const o of sc.objs) {
            if (o.riding) {
              if (sc.boost > 0) {
                o.x += (sc.px + 6 - o.x) * Math.min(1, dt * 8);
                o.ry = sc.py + 30;
              } else {
                o.riding = false;
                o.leaving = true;
              }
              continue;
            }
            if (o.leaving) {
              o.x += 380 * dt;
              o.dy -= 60 * dt;
              o.alpha = Math.max(0, o.alpha - dt * 0.7);
              continue;
            }
            o.x -= speed * o.k.speed * dt;
            if (o.hit) {
              o.vy -= 260 * dt;
              o.dy += o.vy * dt;
              o.alpha = Math.max(0, o.alpha - dt * 1.4);
            }
          }
          sc.objs = sc.objs.filter((o) => o.x > -90 && o.x < W + 400 && o.alpha > 0);

          if (!sc.done) {
            for (const o of sc.objs) {
              if (o.hit || o.riding || o.leaving) continue;
              const near = Math.abs(o.x - sc.px) < o.k.size * 0.6 + 14 && Math.abs(laneY(o) - sc.py) < 42;
              if (!near) continue;
              if (o.kind === 'delfin') {
                o.riding = true;
                o.ry = sc.py + 30;
                sc.boost = 2.6;
                sc.stun = 0;
                [523, 659, 784, 1047].forEach((f, i) => B.tone(f, 0.15, 'triangle', 0.15, i * 0.07));
                api.toast('A delfin elvitt egy darabon! 🐬');
              } else if (sc.boost > 0) {
                scatter(o);
              } else {
                sc.objs.forEach((q) => { if (q.group === o.group) scatter(q); });
                sc.stun = 0.9;
                B.sfx.bad();
                api.toast(o.k.msg);
              }
            }
          }

          if (Math.random() < dt * 6) sc.bubbles.push({ x: sc.px - 30, y: sc.py - 12, r: B.rand(3, 7) });
          sc.bubbles.forEach((b) => { b.y -= 60 * dt; b.x -= 40 * dt; });
          sc.bubbles = sc.bubbles.filter((b) => b.y > 100);
          if (!sc.done && Math.random() < dt * 1.3) sc.arrows.push({ x: B.rand(220, W), y: 80, vy: 170 });
          sc.arrows.forEach((a) => { a.y += a.vy * dt; a.vy = Math.max(30, a.vy - 200 * dt); a.x -= speed * dt * 0.5; });
          sc.arrows = sc.arrows.filter((a) => a.y < 140 && a.x > -20);
        },
        draw() {
          const g = ctx.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, '#9fd8ea'); g.addColorStop(0.19, '#9fd8ea');
          g.addColorStop(0.2, '#2b8db0'); g.addColorStop(1, '#0d3c56');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          // vízfelszín
          ctx.fillStyle = '#d9f3f7';
          for (let x = 0; x < W + 40; x += 40) {
            const ox = x - (t * 60) % 40;
            ctx.beginPath(); ctx.arc(ox, 100, 22, Math.PI, 0); ctx.fill();
          }
          // fénysugarak
          ctx.fillStyle = 'rgba(255, 255, 255, .06)';
          for (let k = 0; k < 4; k++) {
            const x = ((k * 230 - t * 30) % 920 + 920) % 920 - 60;
            ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x + 60, 110); ctx.lineTo(x + 160, H); ctx.lineTo(x + 40, H); ctx.fill();
          }
          // homokos fenék hínárral
          ctx.fillStyle = '#c9a85c';
          ctx.fillRect(0, H - 34, W, 34);
          ctx.strokeStyle = '#2f8a4f'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          for (let k = 0; k < 7; k++) {
            const x = ((k * 140 - t * 150) % 980 + 980) % 980 - 90;
            ctx.beginPath(); ctx.moveTo(x, H - 30);
            ctx.quadraticCurveTo(x + Math.sin(t * 2 + k) * 14, H - 70, x, H - 100);
            ctx.stroke();
          }
          // a part közeledik
          if (sc.progress > 0.82) {
            const sx = W - (sc.progress - 0.82) / 0.18 * 260;
            ctx.fillStyle = '#f2d38b';
            ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx + 120, 100); ctx.lineTo(W + 10, 100); ctx.lineTo(W + 10, H); ctx.fill();
            B.drawEmoji(ctx, '🌴', sx + 200, 60, 70);
          }
          sc.arrows.forEach((a) => arrow(a.x, a.y, Math.PI / 2, 26));
          ctx.strokeStyle = 'rgba(255, 255, 255, .7)'; ctx.lineWidth = 2;
          sc.bubbles.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });
          // villogó jelzés: cápa érkezik ebben a sávban
          if (sc.warn && Math.floor(t * 6) % 2 === 0) {
            const y = lanes[sc.warn.lane];
            ctx.fillStyle = '#ef6a4c';
            ctx.beginPath(); ctx.arc(W - 34, y, 22, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '800 30px "Baloo 2", system-ui, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('!', W - 34, y + 2);
          }
          sc.objs.forEach((o) => {
            let size = o.k.size;
            if (o.k.puff && !o.hit && o.lane === sc.lane && Math.abs(o.x - sc.px) < 170) size *= 1.35;
            ctx.save();
            ctx.globalAlpha = o.alpha;
            ctx.translate(o.x, laneY(o));
            ctx.rotate(Math.sin(t * 10 + o.ph) * 0.08);
            if (o.riding || o.leaving) ctx.scale(-1, 1);
            if (o.kind === 'delfin' && !o.riding && !o.leaving) {
              ctx.fillStyle = 'rgba(255, 236, 140, .35)';
              ctx.beginPath(); ctx.arc(0, 0, 44 + Math.sin(t * 6) * 4, 0, Math.PI * 2); ctx.fill();
            }
            B.drawEmoji(ctx, o.k.e, 0, 0, size);
            ctx.restore();
          });
          // Babuktin köpennyel, fakarddal és a hordótető-pajzzsal
          const wob = sc.done ? 0 : Math.sin(t * 8) * 4;
          ctx.save();
          ctx.translate(sc.px, sc.py + wob);
          if (sc.stun > 0 && Math.floor(t * 10) % 2) ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#c0392b';
          ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-60, -10 + wob, -72, 14); ctx.quadraticCurveTo(-40, 10, -10, 12); ctx.fill();
          woodSword(-14, 20, -1.9, 0.55);
          B.drawEmoji(ctx, '🤠', 0, 0, 58);
          lid(36, 6, 20);
          ctx.restore();
          if (sc.boost > 0) sparkle(sc.px - 64, sc.py - 26);
          // haladás a partig
          ctx.fillStyle = 'rgba(255, 255, 255, .35)';
          ctx.fillRect(20, 20, W - 40, 12);
          ctx.fillStyle = '#ffc93c';
          ctx.fillRect(20, 20, (W - 40) * sc.progress, 12);
          B.drawEmoji(ctx, '🏝️', W - 24, 26, 26);
        },
      });
      function move(d) {
        sc.lane = Math.max(0, Math.min(2, sc.lane + d));
        B.sfx.pop();
      }
      function add(kind, lane, x, group) {
        sc.objs.push({ k: kinds[kind], kind, lane, x, group, ph: Math.random() * 6, hit: false, dy: 0, vy: 0, ry: 0, alpha: 1 });
      }
      // egyszerre legfeljebb két sáv foglalt, egy mindig szabad
      function spawn() {
        const free = Math.floor(Math.random() * 3);
        sc.lastFree = free;
        const twin = sc.progress > 0.3 && Math.random() < 0.4;
        const blocked = B.shuffle([0, 1, 2].filter((l) => l !== free)).slice(0, twin ? 2 : 1);
        blocked.forEach((l, i) => {
          const g = ++gid;
          if (Math.random() < 0.22) {
            for (let k = 0; k < 3; k++) add('raj', l, W + 40 + i * 30 + k * 40, g);
          } else {
            add(B.pick(['hal', 'hal', 'gomb', 'tinta', 'polip']), l, W + 40 + i * 30, g);
          }
        });
        if (sc.dolphinIn <= 0 && sc.dolphins > 0) {
          add('delfin', free, W + 120, ++gid);
          sc.dolphins--;
          sc.dolphinIn = B.rand(9, 12);
        }
      }
      function laneY(o) {
        if (o.riding || o.leaving) return o.ry + o.dy;
        return lanes[o.lane] + (o.k.wave ? Math.sin(t * 3 + o.ph) * 16 : Math.sin(t * 2 + o.ph) * 5) + o.dy;
      }
      function scatter(o) {
        o.hit = true;
        o.vy = -120;
      }
      return sc;
    }

    /* ---------- 5–6. fejezet: A parton ---------- */
    function beachScene() {
      const HIP = 352, HIGH = 290, LOW = 372;
      const archers = [{ x: 600, f: '🧑' }, { x: 680, f: '👴' }, { x: 760, f: '👩' }];
      const sc = makeScene({
        phase: 'idle', hx: 110, tx: 110, high: true, blocked: 0, wait: 1.3, aim: null, shot: null,
        stuck: [], misses: [], run: 0, scared: false, sit: false, boat: null, landed: false, watch: false,
        start() {
          sc.phase = 'shield';
          api.hud('🛡️ 0/3');
          hint('Fogd fel a nyilakat a pajzzsal! Ha fent jön, koppints fent, ha lent jön, koppints lent (↑ ↓).');
        },
        tap(p) { if (sc.phase === 'shield') setShield(p.y < HIP - 26); },
        key(e) {
          if (sc.phase !== 'shield') return;
          if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); setShield(true); }
          if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setShield(false); }
        },
        rowBoat() { sc.boat = 0; },
        land() { sc.boat = null; sc.landed = true; },
        update(dt) {
          sc.hx += (sc.tx - sc.hx) * Math.min(1, dt * 3);
          if (sc.boat !== null) sc.boat = Math.min(1, sc.boat + dt / 3.2);
          if (sc.phase === 'shield') {
            sc.run += dt * 10;
            if (!sc.aim && !sc.shot) {
              sc.wait -= dt;
              if (sc.wait <= 0) sc.aim = { a: B.pick(archers), high: Math.random() < 0.5, time: 0.75 };
            } else if (sc.aim) {
              sc.aim.time -= dt;
              if (sc.aim.time <= 0) {
                const sx = sc.aim.a.x - 40;
                sc.shot = { x: sx, high: sc.aim.high, v: (sx - (sc.hx + 46)) / 1.15, past: false };
                sc.aim = null;
                B.sfx.whoosh();
              }
            } else {
              const s = sc.shot;
              s.x -= s.v * dt;
              if (!s.past && s.x <= sc.hx + 46) {
                if (s.high === sc.high) {
                  sc.blocked++;
                  sc.stuck.push({ dy: B.rand(-9, 9), a: Math.PI + B.rand(-0.25, 0.25) });
                  B.tone(150, 0.08, 'square', 0.2);
                  B.noise(0.08, 1500, 0.4);
                  bubble(sc.hx + 40, (s.high ? HIGH : LOW) - 30, 'Kopp!', 'shout', 700);
                  api.hud('🛡️ ' + sc.blocked + '/3');
                  sc.shot = null;
                  sc.wait = 0.9;
                  sc.tx = 110 + sc.blocked * 120;
                  if (sc.blocked >= 3) {
                    sc.phase = 'arrive';
                    sc.tx = 470;
                    hint('');
                  }
                } else {
                  s.past = true;
                  api.toast(s.high ? 'Huh! Ez a füle mellett süvített el!' : 'Hoppá! Ez a lába között repült át!');
                }
              } else if (s.past && s.x < sc.hx - 120) {
                sc.misses.push({ x: s.x, y: 404 + B.rand(0, 30), a: Math.PI + 0.5 });
                sc.shot = null;
                sc.wait = 0.8;
              }
            }
          } else if (sc.phase === 'arrive') {
            sc.run += dt * 10;
            if (Math.abs(sc.hx - sc.tx) < 3) {
              sc.phase = 'talk';
              sc.scared = true;
              api.timeout(sc.finish, 700);
            }
          }
        },
        draw() {
          sky('#9fd8ee', '#f4ecd2', 300);
          sun(150, 70, 28);
          clouds(6);
          seaBand(246, 16, 110);
          ship(80, 262, 0.42, Math.sin(t * 1.2) * 0.02);
          shipWater(80, 262, 0.42);
          // homok
          ctx.fillStyle = '#f2d38b';
          ctx.beginPath(); ctx.moveTo(0, 352); ctx.quadraticCurveTo(220, 300, 460, 306); ctx.lineTo(W, 296); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
          ctx.fillStyle = 'rgba(255, 255, 255, .45)';
          ctx.beginPath(); ctx.moveTo(0, 352); ctx.quadraticCurveTo(220, 300, 460, 306); ctx.lineTo(460, 312); ctx.quadraticCurveTo(220, 308, 0, 360); ctx.fill();
          // a leégett ház romjai füstölögnek
          ctx.fillStyle = '#4a4a4a';
          ctx.fillRect(704, 258, 8, 40); ctx.fillRect(730, 268, 8, 30); ctx.fillRect(690, 290, 64, 8);
          ctx.fillStyle = 'rgba(120, 120, 120, .35)';
          for (let k = 0; k < 3; k++) {
            const p = (t * 0.35 + k / 3) % 1;
            ctx.beginPath(); ctx.arc(720 + Math.sin(p * 6 + k) * 8, 254 - p * 90, 8 + p * 14, 0, Math.PI * 2); ctx.fill();
          }
          B.drawEmoji(ctx, '🌴', 530, 236, 96);
          B.drawEmoji(ctx, '🌴', 786, 226, 104);
          sc.misses.forEach((m) => arrow(m.x, m.y, m.a, 34));
          // mentőcsónak: Babuktin kihozza Dobravát a partra
          if (sc.boat !== null) {
            const bx = 120 + sc.boat * 170, by = 300 + sc.boat * 24;
            B.drawEmoji(ctx, '🤠', bx - 18, by - 16, 34);
            B.drawEmoji(ctx, '🧔', bx + 20, by - 14, 32);
            ctx.strokeStyle = '#c9a35b'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(bx + 6, by - 8); ctx.lineTo(bx + 34, by - 8); ctx.stroke();
            ctx.fillStyle = '#7a4a24';
            ctx.beginPath(); ctx.moveTo(bx - 46, by); ctx.lineTo(bx + 46, by); ctx.quadraticCurveTo(bx + 40, by + 20, bx + 26, by + 22);
            ctx.lineTo(bx - 30, by + 22); ctx.quadraticCurveTo(bx - 42, by + 18, bx - 46, by); ctx.fill();
            const r = Math.sin(t * 5) * 0.5;
            ctx.strokeStyle = '#6b3f1d'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(bx - 18, by - 4); ctx.lineTo(bx - 18 - Math.cos(r) * 40, by + 18 + Math.sin(r) * 8); ctx.stroke();
          }
          archers.forEach((a) => {
            archerFig(a.x, HIP, a.f, {
              sit: sc.sit,
              bow: !sc.scared,
              bowDown: sc.scared,
              scared: sc.scared && !sc.sit,
            });
          });
          if (sc.watch) {
            B.drawEmoji(ctx, '⌚', 650, HIP - 6, 30);
            sparkle(668, HIP - 26);
          }
          if (sc.landed) {
            figure(400, HIP + 28, '🧔', { sit: true, shirt: '#8a5a9e', size: 48 });
            ctx.strokeStyle = '#c9a35b'; ctx.lineWidth = 4;
            [-6, 8].forEach((dy) => { ctx.beginPath(); ctx.moveTo(380, HIP + dy); ctx.lineTo(420, HIP + dy + 4); ctx.stroke(); });
          }
          if (sc.boat === null) {
            const moving = sc.phase === 'shield' || sc.phase === 'arrive';
            if (sc.sit) {
              figure(sc.hx, HIP + 28, '🤠', { cape: true, sit: true, size: 50 });
              lid(sc.hx + 52, HIP + 52, 22);
              sc.stuck.forEach((a) => arrow(sc.hx + 58, HIP + 52 + a.dy, a.a, 40));
            } else {
              figure(sc.hx, HIP, '🤠', { cape: true, run: moving ? sc.run : 0, sword: true, size: 50 });
              const sy = sc.high ? HIGH : LOW;
              ctx.strokeStyle = '#2f6fa3'; ctx.lineWidth = 8; ctx.lineCap = 'round';
              ctx.beginPath(); ctx.moveTo(sc.hx + 12, HIP - 30); ctx.lineTo(sc.hx + 30, sy); ctx.stroke();
              lid(sc.hx + 36, sy, 26);
              sc.stuck.forEach((a) => arrow(sc.hx + 44, sy + a.dy, a.a, 40));
            }
          }
          // célzás: szaggatott vonal mutatja, milyen magasan jön a nyíl
          if (sc.aim) {
            const y = sc.aim.high ? HIGH : LOW;
            ctx.setLineDash([8, 10]);
            ctx.strokeStyle = 'rgba(239, 106, 76, ' + (0.5 + Math.sin(t * 12) * 0.3) + ')';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(sc.aim.a.x - 40, y); ctx.lineTo(sc.hx + 64, y); ctx.stroke();
            ctx.setLineDash([]);
            arrow(sc.aim.a.x - 30, y, Math.PI, 34);
          }
          if (sc.shot) arrow(sc.shot.x, sc.shot.high ? HIGH : LOW, Math.PI, 40);
        },
      });
      function setShield(h) {
        if (sc.high === h) return;
        sc.high = h;
        B.sfx.click();
      }
      return sc;
    }

    /* ---------- 7–8. fejezet: Öt nap munka, az óra titka ---------- */
    function buildScene() {
      const FIRE = { x: 616, y: 420 };
      const DAYS = [
        { title: 'Cölöpök', hint: 'Koppints a cölöpökre, hogy Dobrava leverje őket! Mindegyikhez két ütés kell.', t: [[170, 0], [250, 0], [330, 0]], post: true },
        { title: 'Padló', hint: 'Most a padló jön. Koppints a szögekre!', t: [[176, 306], [250, 306], [324, 306]] },
        { title: 'Falak', hint: 'Jönnek a falak. Koppints a szögekre!', t: [[190, 252], [250, 276], [310, 252]] },
        { title: 'Tető', hint: 'Most a tető. Koppints a szögekre!', t: [[198, 216], [250, 190], [302, 216]] },
        { title: 'Ajtó és ablakok', hint: 'Végül az ajtó és az ablakok. Még három szög!', t: [[250, 272], [197, 256], [303, 256]] },
      ];
      const sc = makeScene({
        day: 0, stage: 0, phase: 'idle', targets: [], dark: 0, dobX: 104, dobTo: 104, swing: 0,
        fish: [], roasted: 1, fishIn: 2, watch: false, final: false, give: -1,
        start() { nextDay(); },
        giveWatch() { sc.give = 0; },
        tap(p) {
          if (sc.phase !== 'work') return;
          let best = null, bd = 80;
          sc.targets.forEach((tg) => {
            if (tg.hits >= 2) return;
            const q = tpos(tg), d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < bd) { bd = d; best = tg; }
          });
          if (!best) return;
          const q = tpos(best);
          best.hits++;
          sc.swing = 0.22;
          sc.dobTo = Math.max(90, best.x - 52);
          B.tone(170, 0.06, 'square', 0.16);
          B.noise(0.06, 2400, 0.3);
          bubble(q.x, q.y - 16, 'Kopp!', 'shout', 450);
          if (sc.targets.every((tg) => tg.hits >= 2)) {
            sc.phase = 'wait';
            api.timeout(endDay, 600);
          }
        },
        update(dt) {
          sc.dark += ((sc.phase === 'night' ? 1 : 0) - sc.dark) * Math.min(1, dt * 2.5);
          sc.swing = Math.max(0, sc.swing - dt);
          sc.dobX += (sc.dobTo - sc.dobX) * Math.min(1, dt * 6);
          if (sc.phase === 'work' || sc.phase === 'wait') {
            sc.fishIn -= dt;
            if (sc.fishIn <= 0) { sc.fishIn = B.rand(2.8, 4); sc.fish.push({ k: 0 }); }
          }
          sc.fish.forEach((f) => { f.k += dt / 1.1; });
          sc.fish = sc.fish.filter((f) => {
            if (f.k < 1) return true;
            sc.roasted = Math.min(6, sc.roasted + 1);
            B.sfx.pop();
            return false;
          });
          if (sc.give >= 0 && sc.give < 1) sc.give = Math.min(1, sc.give + dt / 0.9);
        },
        draw() {
          sky('#9fd8ee', '#f6ecd2', 300);
          sun(120, 70, 28);
          clouds(5);
          seaBand(250, 14, 60);
          ship(700, 262, 0.36, Math.sin(t * 1.2) * 0.02);
          shipWater(700, 262, 0.36);
          ctx.fillStyle = '#f2d38b';
          ctx.fillRect(0, 300, W, H - 300);
          ctx.fillStyle = '#e8c477';
          ctx.beginPath(); ctx.ellipse(250, 396, 150, 18, 0, 0, Math.PI * 2); ctx.fill();
          B.drawEmoji(ctx, '🌴', 470, 250, 86);
          drawHouse();
          campfire();
          people();
          if (!sc.final) drawDobrava();
          drawTargets();
          // halak repülnek a tűzhöz
          sc.fish.forEach((f) => {
            const tx = FIRE.x - 40 + sc.roasted * 16, ty = FIRE.y - 34;
            const x = 770 + (tx - 770) * f.k, y = 300 + (ty - 300) * f.k - Math.sin(f.k * Math.PI) * 90;
            ctx.save(); ctx.translate(x, y); ctx.rotate(f.k * 6); B.drawEmoji(ctx, '🐟', 0, 0, 24); ctx.restore();
          });
          // éjszaka
          if (sc.dark > 0.01) {
            ctx.fillStyle = 'rgba(12, 20, 52, ' + sc.dark * 0.62 + ')';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + sc.dark + ')';
            for (let k = 0; k < 40; k++) ctx.fillRect((k * 97) % W, (k * 53) % 230, 2, 2);
            ctx.globalAlpha = sc.dark;
            B.drawEmoji(ctx, '🌙', 690, 60, 40);
            ctx.globalAlpha = 1;
            const glowFire = ctx.createRadialGradient(FIRE.x, FIRE.y, 10, FIRE.x, FIRE.y, 160);
            glowFire.addColorStop(0, 'rgba(255, 170, 60, ' + sc.dark * 0.5 + ')');
            glowFire.addColorStop(1, 'rgba(255, 170, 60, 0)');
            ctx.fillStyle = glowFire;
            ctx.fillRect(FIRE.x - 160, FIRE.y - 160, 320, 320);
          }
        },
      });
      function tpos(tg) { return tg.post ? { x: tg.x, y: 244 + tg.hits * 30 } : tg; }
      function nextDay() {
        sc.day++;
        const d = DAYS[sc.day - 1];
        sc.targets = d.t.map(([x, y]) => ({ x, y, hits: 0, post: !!d.post }));
        sc.phase = 'work';
        api.hud('🔨 ' + sc.day + '. nap / 5');
        banner(sc.day + '. nap', d.title);
        hint(d.hint);
        if (sc.day === 3) {
          api.timeout(() => { B.sfx.meh(); api.toast('Makkos megkóstolta az egyik deszkát. Mek!'); }, 2500);
        }
      }
      async function endDay() {
        sc.stage = sc.day;
        B.sfx.good();
        hint('');
        if (sc.day === 5) {
          sc.phase = 'done';
          sc.finish();
          return;
        }
        sc.phase = 'night';
        await api.wait(1200);
        if (sc.day === 1) {
          await api.say(narrator, 'Este az öreg íjász odaült Babuktin mellé. Látta, hogy Babuktin halat fog nekik, és megvendégeli őket. Megbízott benne, és odaadta neki az aranyórát. Psszt! Ez maradjon titok!');
          sc.watch = true;
          B.sfx.good();
          await api.wait(900);
        }
        nextDay();
      }
      function part(isGhost, fn) {
        ctx.save();
        if (isGhost) ctx.globalAlpha = 0.3 + Math.sin(t * 4) * 0.08;
        fn();
        ctx.restore();
      }
      function drawHouse() {
        const s = sc.stage;
        const building = sc.phase === 'work' || sc.phase === 'wait' ? sc.day : 0;
        const ghost = (k) => building === k && s < k;
        if (s < 1) {
          // a leégett ház romjai
          ctx.fillStyle = '#6d6d6d';
          ctx.beginPath(); ctx.ellipse(250, 390, 92, 14, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#2b2b2b';
          ctx.save(); ctx.translate(196, 390); ctx.rotate(-0.2); ctx.fillRect(-6, -54, 12, 54); ctx.restore();
          ctx.save(); ctx.translate(300, 390); ctx.rotate(0.15); ctx.fillRect(-6, -36, 12, 36); ctx.restore();
          ctx.fillStyle = 'rgba(120, 120, 120, .35)';
          for (let k = 0; k < 3; k++) {
            const p = (t * 0.4 + k / 3) % 1;
            ctx.beginPath(); ctx.arc(250 + Math.sin(p * 6 + k) * 10, 370 - p * 120, 10 + p * 16, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (s >= 1 || building === 1) {
          [170, 250, 330].forEach((x, k) => {
            const top = s >= 1 ? 300 : 230 + sc.targets[k].hits * 35;
            ctx.fillStyle = '#7a4a24'; ctx.fillRect(x - 8, top, 16, 392 - top);
            ctx.fillStyle = '#5b3418'; ctx.fillRect(x - 8, top, 16, 5);
          });
        }
        if (s >= 2 || ghost(2)) part(ghost(2), () => {
          ctx.fillStyle = '#9c6a3a'; ctx.fillRect(152, 300, 196, 13);
        });
        if (s >= 3 || ghost(3)) part(ghost(3), () => {
          ctx.fillStyle = '#c08a4e'; ctx.fillRect(162, 228, 176, 72);
          ctx.strokeStyle = 'rgba(90, 50, 20, .4)'; ctx.lineWidth = 2;
          for (let x = 178; x < 338; x += 16) { ctx.beginPath(); ctx.moveTo(x, 228); ctx.lineTo(x, 300); ctx.stroke(); }
        });
        if (s >= 4 || ghost(4)) part(ghost(4), () => {
          ctx.fillStyle = '#b5482e';
          ctx.beginPath(); ctx.moveTo(142, 236); ctx.lineTo(358, 236); ctx.lineTo(250, 158); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(80, 20, 10, .35)'; ctx.lineWidth = 2;
          for (let k = 1; k < 4; k++) {
            const y = 158 + k * 19.5, half = (y - 158) / 78 * 108;
            ctx.beginPath(); ctx.moveTo(250 - half, y); ctx.lineTo(250 + half, y); ctx.stroke();
          }
        });
        if (s >= 5 || ghost(5)) part(ghost(5), () => {
          ctx.fillStyle = '#6b3f1d'; rr(232, 252, 36, 48, 6); ctx.fill();
          ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(261, 278, 3, 0, Math.PI * 2); ctx.fill();
          [[182, 244], [288, 244]].forEach(([x, y]) => {
            ctx.fillStyle = '#bfe3ef'; ctx.fillRect(x, y, 30, 24);
            ctx.strokeStyle = '#6b3f1d'; ctx.lineWidth = 3; ctx.strokeRect(x, y, 30, 24);
            ctx.beginPath(); ctx.moveTo(x + 15, y); ctx.lineTo(x + 15, y + 24); ctx.moveTo(x, y + 12); ctx.lineTo(x + 30, y + 12); ctx.stroke();
          });
          if (!ghost(5)) { B.drawEmoji(ctx, '🌼', 172, 300, 22); B.drawEmoji(ctx, '🌼', 330, 300, 22); }
        });
      }
      function drawTargets() {
        if (sc.phase !== 'work' && sc.phase !== 'wait') return;
        sc.targets.forEach((tg) => {
          if (tg.post) {
            if (tg.hits < 2) glow(tg.x, 244 + tg.hits * 30, 30);
            return;
          }
          if (tg.hits >= 2) {
            ctx.fillStyle = '#3b3b3b';
            ctx.beginPath(); ctx.arc(tg.x, tg.y, 4, 0, Math.PI * 2); ctx.fill();
            return;
          }
          glow(tg.x, tg.y - 8, 26);
          const len = tg.hits === 0 ? 18 : 9;
          ctx.strokeStyle = '#8a9299'; ctx.lineWidth = 4; ctx.lineCap = 'butt';
          ctx.beginPath(); ctx.moveTo(tg.x, tg.y); ctx.lineTo(tg.x, tg.y - len); ctx.stroke();
          ctx.fillStyle = '#5b636a'; ctx.fillRect(tg.x - 7, tg.y - len - 3, 14, 4);
        });
      }
      function campfire() {
        ctx.fillStyle = '#6b3f1d';
        ctx.save(); ctx.translate(FIRE.x, FIRE.y + 12);
        ctx.rotate(0.3); ctx.fillRect(-26, -4, 52, 8);
        ctx.rotate(-0.6); ctx.fillRect(-26, -4, 52, 8);
        ctx.restore();
        B.drawEmoji(ctx, '🔥', FIRE.x, FIRE.y - 6, 40 + Math.sin(t * 9) * 3);
        // nyárs a halakkal
        ctx.strokeStyle = '#6b3f1d'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(FIRE.x - 56, FIRE.y - 34); ctx.lineTo(FIRE.x + 56, FIRE.y - 34);
        ctx.moveTo(FIRE.x - 52, FIRE.y - 36); ctx.lineTo(FIRE.x - 52, FIRE.y + 10);
        ctx.moveTo(FIRE.x + 52, FIRE.y - 36); ctx.lineTo(FIRE.x + 52, FIRE.y + 10);
        ctx.stroke();
        for (let k = 0; k < sc.roasted; k++) B.drawEmoji(ctx, '🐟', FIRE.x - 40 + k * 16, FIRE.y - 34, 20);
      }
      function people() {
        if (!sc.final) {
          B.drawEmoji(ctx, '👴', 590, 368, 44);
          B.drawEmoji(ctx, '👩', 650, 368, 44);
          B.drawEmoji(ctx, '🤠', 552, 404, 48);
          B.drawEmoji(ctx, '🧑', 690, 404, 44);
          B.drawEmoji(ctx, '🐯', 512, 440, 38);
          B.drawEmoji(ctx, '🐐', 742, 444, 42);
          if (sc.watch) {
            B.drawEmoji(ctx, '⌚', 578, 424, 20);
            sparkle(590, 410);
          }
          return;
        }
        // mindenki a kész ház előtt
        B.drawEmoji(ctx, '🧔', 362, 380, 56);
        B.drawEmoji(ctx, '💦', 392, 346, 20);
        B.drawEmoji(ctx, '💦', 334, 350, 18);
        B.drawEmoji(ctx, '🤠', 452, 380, 56);
        B.drawEmoji(ctx, '👴', 532, 380, 50);
        B.drawEmoji(ctx, '👩', 590, 374, 48);
        B.drawEmoji(ctx, '🧑', 648, 380, 48);
        B.drawEmoji(ctx, '🐯', 412, 438, 40);
        B.drawEmoji(ctx, '🐐', 712, 440, 44);
        if (sc.give < 0) {
          B.drawEmoji(ctx, '⌚', 474, 404, 24);
        } else {
          const k = sc.give;
          const x = 474 + (384 - 474) * k, y = 404 - Math.sin(k * Math.PI) * 40;
          B.drawEmoji(ctx, '⌚', x, y, 24);
          sparkle(x + 14, y - 14);
        }
      }
      function drawDobrava() {
        const x = sc.dobX, y = 356;
        B.drawEmoji(ctx, '🧔', x, y, 54);
        for (let k = 0; k < Math.min(sc.day, 3); k++) B.drawEmoji(ctx, '💦', x - 26 + k * 26, y - 36 - (k % 2) * 6, 16);
        const ang = sc.swing > 0 ? -1.1 + (1 - sc.swing / 0.22) * 1.6 : -1.1;
        ctx.save();
        ctx.translate(x + 26, y + 4);
        ctx.rotate(ang);
        B.drawEmoji(ctx, '🔨', 14, -10, 32);
        ctx.restore();
      }
      return sc;
    }

    /* ---------- Búcsú: Babuktin új hajója útnak indul ---------- */
    function sailScene() {
      const sc = makeScene({
        x: 230,
        update(dt) { sc.x += dt * 60; },
        draw() {
          sky('#ffb27a', '#ffe1b3', 300);
          sun(600, 262, 40);
          clouds(4);
          const g = ctx.createLinearGradient(0, 290, 0, H);
          g.addColorStop(0, '#4f8fb0'); g.addColorStop(1, '#1d4f73');
          ctx.fillStyle = g;
          ctx.fillRect(0, 290, W, H - 290);
          waves(290, 24, 3);
          for (let k = 0; k < 10; k++) island(40 + k * 30, 294, 20 + (k % 3) * 5, k % 4 === 0);
          const bob = Math.sin(t * 2) * 4;
          ship(sc.x, 340 + bob, 0.72, Math.sin(t * 1.5) * 0.03);
          B.drawEmoji(ctx, '🐯', sc.x - 92, 326 + bob, 28);
          B.drawEmoji(ctx, '🤠', sc.x - 50, 320 + bob, 38);
          B.drawEmoji(ctx, '🧔', sc.x + 30, 320 + bob, 36);
          B.drawEmoji(ctx, '🐐', sc.x + 78, 324 + bob, 30);
          shipWater(sc.x, 340 + bob, 0.72);
        },
      });
      return sc;
    }

    /* ---------- A mese menete ---------- */
    const port = portScene();
    await chapter(1, 'A kikötőben', port);
    await api.talk([
      [dobrava, 'Babuktin, Babuktin! Segítened kell! A legutóbbi kalandomon elhagytam az aranyórámat a Dadogó-szigeten. Az édesapámtól kaptam!'],
      [hero, 'Jaj, Dobrava, éppen kalandra indulunk.'],
      [dobrava, 'Ha segítesz, neked adom az egyik hajómat! Ott ringatózik a móló végén.'],
      [hero, 'Komolyan ez az? Harminc méter… Ennél nagyobbra számítottam.'],
      [dobrava, 'Vannak dolgok, amelyek érdektelenek, és vannak, amelyek fontosak. Az óra tíz generáció óta a családomé. Hozzá képest ez a hajó semmit sem ér.'],
    ]);
    await api.choice(narrator, 'Mi ér többet Dobravának?', [
      { text: 'Az édesapjától kapott aranyóra', ok: true },
      { text: 'A harmincméteres hajó', reply: 'Dobrava szerint a hajó értéktelen az órához képest.' },
      { text: 'Egy láda arany', reply: 'Az óra a család kincse, többet ér bármennyi aranynál.' },
    ]);
    await api.say(hero, 'Értem. Végre nekem is lesz saját hajóm! Makkos, Csíkos, indulás!');

    const voyage = voyageScene();
    await chapter(2, 'Úton a szigetek felé', voyage);
    await voyage.finished;
    await api.say(dobrava, 'Hát… az egyiken. Igaz, hogy a szigetek majdnem összeérnek, de attól még tíz sziget.');

    const deck = deckScene();
    await chapter(3, 'Nyílzápor!', deck);
    await api.talk([
      [hero, 'Dobrava, ez meg micsoda?!'],
      [dobrava, 'Ez… ez az oka, hogy segítséget kértem.'],
      [hero, 'Erről nem szólhattál volna korábban?!'],
    ]);
    deck.start();
    await deck.finished;

    const swim = swimScene();
    await chapter(4, 'A víz alatt', swim);
    swim.start();
    await swim.finished;

    const beach = beachScene();
    await chapter(5, 'A parton', beach);
    beach.start();
    await beach.finished;

    api.hud('📖 6/' + CHAPTERS);
    banner('6. fejezet', 'Leülünk beszélni?');
    await api.wait(1300);
    await api.choice(hero, 'Az íjászok remegnek: tudják, hogy Babuktin könnyedén legyőzhetné őket. Mit mondjon Babuktin?', [
      { text: '„Leülünk beszélni?”', ok: true },
      { text: '„Adjátok meg magatokat!”', reply: 'Babuktin nem így szokta. Inkább a szó csatázzon, mint a kar!' },
      { text: '„Hol az óra? Gyorsan!”', reply: 'Előbb jó lenne megtudni, miért lőttek ránk.' },
    ]);
    beach.sit = true;
    await api.talk([
      [hero, 'Na, uraim, én vagyok A világjáró Babuktin, akinek a nevét minden kikötőben ismerik. Dobrava kért meg, hogy keressem meg az aranyóráját.'],
      [ijasz, 'Dobrava? Az az álnok?'],
      [oreg, 'Ételt és italt követelt tőlünk. Adtunk neki, amennyit nélkülözni tudtunk, de neki nem volt elég. Elvitte az egészet, aztán felgyújtotta az egyik házunkat.'],
      [hero, 'Értem. Egy pillanat türelmet kérek.'],
    ]);
    beach.rowBoat();
    await api.say(narrator, 'Babuktin visszaevezett a hajóhoz, megkötözte Dobravát, és a mentőcsónakban kihozta a partra.');
    await cut(() => beach.land());
    await api.talk([
      [hero, 'Na, Dob, mondd el, mi történt! Azt mondják, kiraboltad őket, és felgyújtottál egy házat.'],
      [dobrava, 'Igen… így volt. És itt hagytam az órámat.'],
    ]);
    beach.watch = true;
    B.sfx.good();
    await api.talk([
      [oreg, 'Ezt?'],
      [dobrava, 'Az az én órám! Add vissza!'],
      [hero, 'Csendet!'],
    ]);
    await api.choice(hero, 'Mi legyen most? Mit döntsön Babuktin?', [
      { text: 'Dobrava építse fel újra a házat, utána visszakapja az órát.', ok: true },
      { text: 'Kapjuk fel az órát, és meneküljünk!', reply: 'Az nem lenne igazságos az íjászokkal szemben.' },
      { text: 'Hagyjuk itt Dobravát a szigeten.', reply: 'Babuktin nem hagyja cserben a barátját. Inkább segít neki jóvátenni a hibáját.' },
    ]);
    await api.talk([
      [hero, 'Dobrava, te felépítesz egy ugyanolyan házat, amilyet leromboltál. Egyedül tetted tönkre, egyedül hozod rendbe.'],
      [hero, 'Öregapám, ha elkészült a ház, adja vissza neki az órát. Addig mi halat fogunk, és együtt megesszük. Ne legyen harag!'],
      [oreg, 'Elfogadjuk.'],
    ]);

    const build = buildScene();
    await chapter(7, 'Öt nap munka', build);
    build.start();
    await build.finished;

    build.final = true;
    api.hud('📖 8/' + CHAPTERS);
    banner('8. fejezet', 'Az óra titka');
    await api.wait(1300);
    await api.say(dobrava, 'Elkészültem! … De koma, nem abban egyeztünk meg, hogy visszaszerzed nekem az órát?');
    build.giveWatch();
    await api.talk([
      [hero, 'De igen. Tessék, itt van.'],
      [dobrava, 'Mióta van nálad?'],
      [hero, 'Hmmm… négy napja.'],
      [dobrava, 'Négy napja?! Akkor négy nappal ezelőtt meglóghattunk volna!'],
      [hero, 'Te még mindig nem érted? Én enni adtam nekik, és megvendégeltem őket. Amikor az öreg látta, hogy bízhat bennem, odaadta az órát.'],
      [hero, 'Te pedig helyrehoztad, amit elrontottál. Mit mondana az apád, ha ezt hallaná?'],
    ]);
    await api.choice(narrator, 'Miért kellett Dobravának felépítenie a házat?', [
      { text: 'Hogy helyrehozza, amit elrontott.', ok: true },
      { text: 'Mert Babuktin meg akarta büntetni.', reply: 'Babuktin nem büntetni akart. Azt akarta, hogy Dobrava jóvátegye a hibáját.' },
      { text: 'Mert az íjászok nem tudnak házat építeni.', reply: 'Dehogynem! De a házat Dobrava gyújtotta fel, ezért neki kellett rendbe hoznia.' },
    ]);
    await api.say(dobrava, 'Most már értem. Rossz úton jártam. Bocsánatot kérek tőletek!');
    await api.say(oreg, 'Ne legyen harag!');

    await cut(() => {
      layer.innerHTML = '';
      api.hud('');
      scene = sailScene();
    });
    B.sfx.meh();
    await api.say(narrator, 'Babuktin hazavitte Dobravát a szülővárosába. Aztán kihúzta a horgonyt, a vitorla megfeszült, Makkos mekegett, Csíkos dorombolt, és Babuktin új hajója elindult a következő kaland felé.', 'Vége ⭐');
    api.win();
  },
});
