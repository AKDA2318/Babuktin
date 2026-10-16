/* 1. mese – Babuktin és az aranyóra
   Játék: víz alatti úszás három sávban, akadályok kerülgetése a partig. */
Babuktin.register({
  id: 'aranyora',
  title: 'Babuktin és az aranyóra',
  short: 'Az aranyóra',
  icon: '⌚',
  place: 'Dadogó-szigetek',
  story: [
    'Dobrava, Babuktin régi bajtársa elvesztette a családja aranyóráját a Dadogó-szigeteken. Ha Babuktin segít megkeresni, cserébe neki adja az egyik hajóját.',
    'Amikor a szigetekhez érnek, nyílzápor fogadja őket! Babuktin felkapja a fakardját, és a víz alatt úszik a part felé.',
  ],
  howto: 'Úszd ki a partig! Kerüld ki a korallokat és a halakat: koppints a vászon felső vagy alsó felére, vagy használd a ↑ ↓ nyilakat.',
  moral: '„Helyrehoztad, amit elrontottál.” Ami fontos, azt becsületesen kell visszaszerezni.',
  friend: { e: '🧔', name: 'Dobrava' },

  start(stage, api) {
    const B = Babuktin;
    const W = 800, H = 500;
    const { ctx, cv, point } = api.canvas(W, H);
    const lanes = [175, 290, 405];
    const LENGTH = 32; // másodperc tiszta úszás
    const hazards = [B.emoji('🪸', '🌵'), '🐡', '🦀', B.emoji('🪼', '🐙')];
    let lane = 1, py = lanes[1];
    let progress = 0, stunned = 0, spawn = 1.2, t = 0, finished = false;
    let obstacles = [], bubbles = [], arrows = [];

    function move(d) {
      if (finished) return;
      lane = Math.max(0, Math.min(2, lane + d));
      B.sfx.pop();
    }
    api.on(cv, 'pointerdown', (e) => { e.preventDefault(); move(point(e).y < py ? -1 : 1); });
    api.on(window, 'keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); move(-1); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); move(1); }
    });

    api.hud('🏝️ 0%');
    api.loop((dt) => {
      t += dt;
      const speed = stunned > 0 ? 90 : 250;
      if (!finished) {
        progress = Math.min(1, progress + dt * (stunned > 0 ? 0.3 : 1) / LENGTH);
        api.hud('🏝️ ' + Math.floor(progress * 100) + '%');
        if (progress >= 1) { finished = true; reachShore(); }
      }
      stunned = Math.max(0, stunned - dt);
      py += (lanes[lane] - py) * Math.min(1, dt * 12);

      // új akadály: soha nem zárja el mind a három sávot
      spawn -= dt;
      if (spawn <= 0 && progress < 0.9) {
        const free = Math.floor(Math.random() * 3);
        const twin = progress > 0.35 && Math.random() < 0.45;
        const blocked = B.shuffle([0, 1, 2].filter((l) => l !== free)).slice(0, twin ? 2 : 1);
        blocked.forEach((l, k) => {
          obstacles.push({ x: W + 40 + k * 30, lane: l, e: B.pick(hazards), wob: Math.random() * 6 });
        });
        spawn = B.rand(0.9, 1.4) - progress * 0.35;
      }
      // nyilak csapódnak a vízbe (csak díszlet)
      if (Math.random() < dt * 1.2) arrows.push({ x: B.rand(200, W), y: 70, vy: 160 });

      obstacles.forEach((o) => { o.x -= speed * dt; });
      obstacles = obstacles.filter((o) => o.x > -60);
      for (const o of obstacles) {
        if (!finished && !o.hit && o.lane === lane && Math.abs(o.x - 150) < 46 && Math.abs(py - lanes[lane]) < 40) {
          o.hit = true;
          stunned = 1;
          B.sfx.bad();
          api.toast(B.pick(['Au! Vigyázz!', 'Hoppá, egy akadály!', 'Bumm! Úszás tovább!']));
        }
      }
      if (Math.random() < dt * 6) bubbles.push({ x: 120, y: py - 10, r: B.rand(3, 7) });
      bubbles.forEach((b) => { b.y -= 60 * dt; b.x -= 40 * dt; });
      bubbles = bubbles.filter((b) => b.y > 95);
      arrows.forEach((a) => { a.y += a.vy * dt; a.vy *= 0.97; a.x -= speed * dt * 0.5; });
      arrows = arrows.filter((a) => a.y < 140 && a.x > -20);
      draw();
    });

    function draw() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#9fd8ea'); g.addColorStop(0.18, '#9fd8ea');
      g.addColorStop(0.2, '#2b8db0'); g.addColorStop(1, '#0d3c56');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      // vízfelszín hullámai
      ctx.fillStyle = '#d9f3f7';
      for (let x = 0; x < W + 40; x += 40) {
        const ox = (x - (t * 60) % 40);
        ctx.beginPath(); ctx.arc(ox, 100, 22, Math.PI, 0); ctx.fill();
      }
      // fénysugarak
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      for (let k = 0; k < 4; k++) {
        const x = ((k * 230 - t * 30) % 920 + 920) % 920 - 60;
        ctx.beginPath(); ctx.moveTo(x, 110); ctx.lineTo(x + 60, 110); ctx.lineTo(x + 160, H); ctx.lineTo(x + 40, H); ctx.fill();
      }
      // homokos fenék és hínár
      ctx.fillStyle = '#c9a85c';
      ctx.fillRect(0, H - 34, W, 34);
      ctx.strokeStyle = '#2f8a4f'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let k = 0; k < 7; k++) {
        const x = ((k * 140 - t * 250 * 0.6) % 980 + 980) % 980 - 90;
        ctx.beginPath(); ctx.moveTo(x, H - 30);
        ctx.quadraticCurveTo(x + Math.sin(t * 2 + k) * 14, H - 70, x, H - 100); ctx.stroke();
      }
      // a part közeledik
      if (progress > 0.82) {
        const sx = W - (progress - 0.82) / 0.18 * 260;
        ctx.fillStyle = '#f2d38b';
        ctx.beginPath(); ctx.moveTo(sx, H); ctx.lineTo(sx + 120, 100); ctx.lineTo(W + 10, 100); ctx.lineTo(W + 10, H); ctx.fill();
        B.drawEmoji(ctx, '🌴', sx + 200, 60, 70);
        B.drawEmoji(ctx, '🏹', sx + 150, 70, 34);
      }
      // nyilak
      arrows.forEach((a) => {
        ctx.strokeStyle = '#6b4b2a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(a.x, a.y - 26); ctx.lineTo(a.x, a.y); ctx.stroke();
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(a.x - 5, a.y); ctx.lineTo(a.x + 5, a.y); ctx.lineTo(a.x, a.y + 9); ctx.fill();
      });
      // buborékok
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
      bubbles.forEach((b) => { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke(); });
      // akadályok
      obstacles.forEach((o) => {
        ctx.globalAlpha = o.hit ? 0.4 : 1;
        B.drawEmoji(ctx, o.e, o.x, lanes[o.lane] + Math.sin(t * 3 + o.wob) * 6, 56);
      });
      ctx.globalAlpha = 1;
      // Babuktin pajzzsal (hordótető)
      const wob = Math.sin(t * 8) * 4;
      ctx.save();
      ctx.translate(150, py + wob);
      if (stunned > 0 && Math.floor(t * 10) % 2) ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#b5702e';
      ctx.beginPath(); ctx.ellipse(34, 4, 12, 26, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b3f17'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#c0392b';
      ctx.beginPath(); ctx.moveTo(-10, -6); ctx.quadraticCurveTo(-60, -10 + wob, -70, 14); ctx.quadraticCurveTo(-40, 10, -10, 12); ctx.fill();
      B.drawEmoji(ctx, '🤠', 0, 0, 58);
      ctx.restore();
      // haladásjelző
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.fillRect(20, 20, W - 40, 12);
      ctx.fillStyle = '#ffc93c';
      ctx.fillRect(20, 20, (W - 40) * progress, 12);
      B.drawEmoji(ctx, '🏝️', W - 24, 26, 26);
    }

    async function reachShore() {
      B.sfx.splash();
      await api.wait(700);
      await api.say(B.cast.narrator, 'Babuktin kiugrik a vízből, és az íjászokhoz rohan. A pajzsa három nyílvesszőt is felfog. Az íjászok remegnek: tudják, hogy Babuktin könnyen legyőzhetné őket.');
      await api.choice(B.cast.babuktin, 'Mit mondjon Babuktin az íjászoknak?', [
        { text: '„Leülünk beszélni?”', ok: true },
        { text: '„Adjátok meg magatokat!”', reply: 'Babuktin nem így szokta. Ő inkább a szót választja a verekedés helyett.' },
        { text: '„Hol az óra? Gyorsan!”', reply: 'Előbb jó lenne megtudni, miért lőnek ránk.' },
      ]);
      await api.talk([
        [{ e: '🏹', name: 'A legidősebb íjász' }, 'Dobrava? Az az álnok! Ételt követelt tőlünk, elvitte az egészet, aztán felgyújtotta az egyik házunkat.'],
        [{ e: '🧔', name: 'Dobrava' }, 'Igen… így volt. És itt hagytam az órámat.'],
      ]);
      await api.choice(B.cast.babuktin, 'Mi legyen most? Mit döntsön Babuktin?', [
        { text: 'Dobrava építse fel újra a házat, utána visszakapja az órát.', ok: true },
        { text: 'Kapjuk fel az órát, és meneküljünk!', reply: 'Az nem lenne igazságos az íjászokkal szemben.' },
        { text: 'Hagyjuk itt Dobravát a szigeten.', reply: 'Babuktin nem hagyja cserben a barátját. Inkább segít neki jóvátenni a hibáját.' },
      ]);
      await api.say(B.cast.babuktin, 'Egyedül tetted tönkre, egyedül hozod rendbe. Amíg dolgozol, mi halat fogunk, és megvendégeljük az íjászokat. Ne legyen harag!');
      await api.say({ e: '🧔', name: 'Dobrava' }, 'Öt nap kalapálás után… Igazad volt, Babuktin. Rossz úton jártam. Bocsánatot kérek.', 'Vége ⭐');
      api.win();
    }
  },
});
