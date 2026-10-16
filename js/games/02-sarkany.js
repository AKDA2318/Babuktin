/* 2. mese – Babuktin és a tüsszentő sárkány
   Játék: hozzávalók elkapása az üsttel, utána lámpások meggyújtása Hapcival. */
Babuktin.register({
  id: 'sarkany',
  title: 'Babuktin és a tüsszentő sárkány',
  short: 'A tüsszentő sárkány',
  icon: '🐉',
  place: 'Ködös-hegy',
  story: [
    'Egy hegyi faluban mindenki fél: a Ködös-hegy barlangjában lakó sárkány hetek óta tüzet okád. Holnap lenne a Papírlámpás-fesztivál!',
    'Babuktin felmászik a barlanghoz. Makkos és Csíkos persze utána lopakodik, pedig a hajón kellett volna maradniuk.',
  ],
  howto: 'Kapd el az üsttel a mentát, a mézet és a gyömbért a gyógyteához! A zoknit és a csípős paprikát kerüld el. Húzd az üstöt ujjal vagy egérrel, vagy használd a ← → nyilakat.',
  moral: '„Ha magának nátha lenne, a családja sem haragudna magára, hanem teát hozna.”',
  friend: { e: '🐉', name: 'Hapci, a sárkány' },

  async start(stage, api) {
    const B = Babuktin;
    const hapci = { e: '🐉', name: 'Hapci' };
    const W = 800, H = 500;
    const { ctx, cv, point } = api.canvas(W, H);
    let t = 0, mode = 'cave';
    let sneezeFlash = 0;

    // Barlang a háttérben, amíg a párbeszéd tart
    const stopCave = api.loop((dt) => {
      t += dt;
      drawCave();
      if (sneezeFlash > 0) sneezeFlash -= dt;
      return mode === 'cave';
    });
    function drawCave() {
      ctx.fillStyle = '#3b3446'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#4c4459';
      ctx.beginPath(); ctx.ellipse(W / 2, H + 60, 520, 360, 0, Math.PI, 0); ctx.fill();
      B.drawEmoji(ctx, '🐉', 520, 280 + Math.sin(t * 6) * 3, 200);
      B.drawEmoji(ctx, '🤠', 200, 380, 70);
      B.drawEmoji(ctx, '🐐', 110, 420, 50);
      B.drawEmoji(ctx, '🐯', 290, 420, 50);
      if (sneezeFlash > 0) {
        ctx.fillStyle = 'rgba(255,140,40,' + sneezeFlash + ')';
        ctx.beginPath(); ctx.moveTo(450, 260); ctx.lineTo(250, 200); ctx.lineTo(250, 340); ctx.fill();
      }
    }
    function sneeze() { sneezeFlash = 0.9; B.sfx.sneeze(); }

    sneeze();
    await api.say(B.cast.babuktin, 'Üdvözlöm! Én vagyok A világjáró Babu…');
    sneeze();
    await api.say(hapci, 'HAPCI! … Jaj, sajnálom! Nem akartam. Három hete folyton tüsszögök.');
    await api.choice(B.cast.babuktin, 'Piros az orra, könnyezik a szeme, és reszket. Mi baja lehet a sárkánynak?', [
      { text: 'Náthás, és fázik.', ok: true },
      { text: 'Haragszik a falura.', reply: 'Nézd meg jobban: nem mérges, hanem beteg.' },
      { text: 'Unatkozik.', reply: 'Az unatkozó sárkány nem tüsszög. Mit jelent a piros orr?' },
    ]);
    await api.talk([
      [hapci, 'A barlangom forró forrása kihűlt, azóta fázom. Mindenki elmenekül előlem, még egy tea sem jut.'],
      [{ e: '👵', name: 'Lin néni' }, 'Ha náthás, főzzünk neki gyömbéres, mézes teát, mentával! Segíts összegyűjteni a hozzávalókat!'],
    ]);
    mode = 'catch';
    stopCave();
    catchGame();

    /* ---------- Hozzávalók elkapása ---------- */
    function catchGame() {
      const need = { menta: 4, mez: 4, gyomber: 4 };
      const got = { menta: 0, mez: 0, gyomber: 0 };
      const good = [
        { k: 'menta', e: '🌿' },
        { k: 'mez', e: '🍯' },
        { k: 'gyomber', e: B.emoji('🫚', '🥔') },
      ];
      const bad = [
        { e: '🧦', msg: 'Fúj, egy zokni! Az nem kell a teába.' },
        { e: '🌶️', msg: 'Csípős paprika? Attól még jobban tüsszögne!' },
        { e: '🐟', msg: 'Halas tea? Inkább ne!' },
      ];
      let px = W / 2, target = W / 2, items = [], spawn = 0.4, splash = [];
      updateHud();

      api.on(cv, 'pointermove', (e) => { target = point(e).x; });
      api.on(cv, 'pointerdown', (e) => { target = point(e).x; });
      const keys = {};
      api.on(window, 'keydown', (e) => { if (e.key.startsWith('Arrow')) { keys[e.key] = true; e.preventDefault(); } });
      api.on(window, 'keyup', (e) => { keys[e.key] = false; });

      function updateHud() {
        api.hud('🌿 ' + got.menta + '/4   🍯 ' + got.mez + '/4   ' + good[2].e + ' ' + got.gyomber + '/4');
      }
      function complete() { return got.menta >= need.menta && got.mez >= need.mez && got.gyomber >= need.gyomber; }

      api.loop((dt) => {
        t += dt;
        if (keys.ArrowLeft) target = px - 400 * dt * 3;
        if (keys.ArrowRight) target = px + 400 * dt * 3;
        target = Math.max(60, Math.min(W - 60, target));
        px += (target - px) * Math.min(1, dt * 14);

        spawn -= dt;
        if (spawn <= 0) {
          // amiből még kell, az gyakrabban esik
          const missing = good.filter((g) => got[g.k] < need[g.k]);
          const isBad = Math.random() < 0.3;
          const it = isBad ? B.pick(bad) : B.pick(missing.length ? missing : good);
          items.push({ x: B.rand(50, W - 50), y: -30, vy: B.rand(150, 220), spin: B.rand(-2, 2), a: 0, it, bad: isBad });
          spawn = B.rand(0.55, 0.9);
        }
        items.forEach((o) => { o.y += o.vy * dt; o.a += o.spin * dt; });
        items = items.filter((o) => {
          if (o.y > 400 && o.y < 450 && Math.abs(o.x - px) < 70) {
            if (o.bad) {
              B.sfx.bad();
              api.toast(o.it.msg);
            } else {
              B.sfx.good();
              got[o.it.k] = Math.min(need[o.it.k], got[o.it.k] + 1);
              updateHud();
              for (let k = 0; k < 6; k++) splash.push({ x: px + B.rand(-30, 30), y: 410, vx: B.rand(-60, 60), vy: B.rand(-160, -60), life: 0.6 });
            }
            return false;
          }
          return o.y < H + 40;
        });
        splash.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 400 * dt; s.life -= dt; });
        splash = splash.filter((s) => s.life > 0);
        drawCatch(px, items, splash);
        if (complete()) {
          B.sfx.win();
          api.timeout(lanterns, 500);
          return false;
        }
      });
    }
    function drawCatch(px, items, splash) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#b9d8c6'); g.addColorStop(1, '#6f9f7a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // hegyek
      ctx.fillStyle = '#88b39a';
      ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(160, 140); ctx.lineTo(330, 300); ctx.lineTo(500, 120); ctx.lineTo(700, 300); ctx.lineTo(800, 200); ctx.lineTo(800, 500); ctx.lineTo(0, 500); ctx.fill();
      ctx.fillStyle = '#5e8c69'; ctx.fillRect(0, 450, W, 50);
      // tűz az üst alatt
      B.drawEmoji(ctx, '🔥', px, 470, 34);
      // üst
      ctx.fillStyle = '#2f3438';
      ctx.beginPath(); ctx.ellipse(px, 420, 70, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px - 70, 420); ctx.quadraticCurveTo(px - 66, 470, px, 470); ctx.quadraticCurveTo(px + 66, 470, px + 70, 420); ctx.fill();
      ctx.fillStyle = '#b5884a';
      ctx.beginPath(); ctx.ellipse(px, 420, 60, 13, 0, 0, Math.PI * 2); ctx.fill();
      // gőz
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath(); ctx.moveTo(px + k * 22, 405);
        ctx.quadraticCurveTo(px + k * 22 + Math.sin(t * 4 + k) * 12, 380, px + k * 22, 360); ctx.stroke();
      }
      items.forEach((o) => {
        ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a);
        B.drawEmoji(ctx, o.it.e, 0, 0, 52);
        ctx.restore();
      });
      ctx.fillStyle = '#b5884a';
      splash.forEach((s) => { ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill(); });
    }

    /* ---------- Lámpások meggyújtása ---------- */
    async function lanterns() {
      api.hud('');
      await api.talk([
        [B.cast.narrator, 'Hapci megitta a teát, és másnap reggelre elmúlt a náthája. A falusiak a forrást is kitisztították, újra gőzölög.'],
        [{ e: '👵', name: 'Lin néni' }, 'Este lenne a fesztivál, de nincs, aki meggyújtsa a lámpásokat…'],
        [hapci, 'Megengeded, hogy segítsek? Koppints a lámpásokra, és én óvatosan meggyújtom őket!'],
      ]);
      const lamps = [];
      for (let k = 0; k < 7; k++) lamps.push({ x: 80 + k * 106, y: 300 + (k % 2) * 50, lit: false, rise: 0 });
      let litCount = 0, flame = null, done = false;
      api.hud('🏮 0/7');
      api.on(cv, 'pointerdown', (e) => {
        const p = point(e);
        const l = lamps.find((m) => !m.lit && Math.abs(m.x - p.x) < 50 && Math.abs(m.y - p.y) < 60);
        if (!l) return;
        l.lit = true;
        litCount++;
        flame = { x: l.x, y: l.y, life: 0.4 };
        B.noise(0.25, 900, 0.3);
        B.tone(400 + litCount * 80, 0.2, 'triangle', 0.15);
        api.hud('🏮 ' + litCount + '/7');
        if (litCount === 7) {
          done = true;
          B.sfx.win();
          api.timeout(() => api.win(), 3000);
        }
      });
      let hx = 100;
      api.loop((dt) => {
        t += dt;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#141a3c'); g.addColorStop(1, '#3a2f5c');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        for (let k = 0; k < 40; k++) ctx.fillRect((k * 97) % W, (k * 53) % 260, 2, 2);
        ctx.fillStyle = '#231d3a'; ctx.fillRect(0, 430, W, 70);
        if (flame) {
          hx += (flame.x - hx) * Math.min(1, dt * 6);
          flame.life -= dt;
          if (flame.life <= 0) flame = null;
        }
        B.drawEmoji(ctx, '🐉', hx, 120 + Math.sin(t * 3) * 10, 90);
        if (flame) {
          ctx.fillStyle = 'rgba(255,170,60,.8)';
          ctx.beginPath(); ctx.moveTo(hx, 150); ctx.lineTo(flame.x - 14, flame.y - 30); ctx.lineTo(flame.x + 14, flame.y - 30); ctx.fill();
        }
        lamps.forEach((l, k) => {
          if (done) l.rise += dt * (40 + k * 6);
          const y = l.y - l.rise;
          if (l.lit) {
            ctx.fillStyle = 'rgba(255,190,80,.35)';
            ctx.beginPath(); ctx.arc(l.x, y, 52, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = l.lit ? 1 : 0.55;
          B.drawEmoji(ctx, '🏮', l.x, y, 70);
          ctx.globalAlpha = 1;
        });
        B.drawEmoji(ctx, '🤠', 700, 455, 44);
        B.drawEmoji(ctx, '🐯', 650, 465, 34);
        B.drawEmoji(ctx, '🐐', 750, 465, 34);
      });
    }
  },
});
