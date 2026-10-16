/* 9. mese – Babuktin és a kis potyautas
   Játék: a nyolcas csomó kötése – végig kell húzni az ujjat a kötélen. */
Babuktin.register({
  id: 'kobak',
  title: 'Babuktin és a kis potyautas',
  short: 'A kis potyautas',
  icon: '⚓',
  place: 'Holló-szikla',
  story: [
    'Gergő bácsi világítótornyából kifogyott az olaj, és vihar közeleg. Ha nem ég a fény, a halászhajók nem találnak haza. Babuktin azonnal indul.',
    'Útközben egy hordóból kócos fej bukkan ki: Kobak, aki világjáró szeretne lenni! Aztán a szél is elül, és várni kell…',
  ],
  howto: 'Babuktin megtanítja Kobaknak a nyolcas csomót. Tedd az ujjad (vagy az egeret) a világító pontra, és húzd végig a kötél mentén!',
  moral: '„A türelem nem azt jelenti, hogy nem csinálsz semmit. Azt jelenti, hogy közben azt csinálod, amit lehet.”',
  friend: { e: '👦', name: 'Kobak' },

  async start(stage, api) {
    const B = Babuktin;
    const kobak = { e: '👦', name: 'Kobak' };

    await api.say(kobak, 'Sziasztok! … Igen, én vagyok. Elbújtam a hordóban.');
    await api.choice(B.cast.babuktin, 'Kobak szülei nem tudják, hol van. Mit tegyen Babuktin először?', [
      { text: 'Hírt küld a szüleinek az arra járó Sirály halászhajóval.', ok: true },
      { text: 'Úgy tesz, mintha semmi sem történt volna.', reply: 'A szülei nagyon aggódnak. Szólni kell nekik!' },
      { text: 'Megfordul, pedig a toronyhoz kell sietni.', reply: 'Gergő bácsi fényére sok hajó számít. Hogyan üzenhetnénk haza?' },
    ]);
    await api.say(B.cast.narrator, 'Másnap elállt a szél. Kobak türelmetlen lett, és felmászott a főárbocra, hogy rákiabáljon a szélre. Félúton lenézett, és remegni kezdett a lába.');
    await api.choice(B.cast.babuktin, 'Kobak fent ragadt az árbocon. Mit mondjon neki Babuktin?', [
      { text: '„Most nem nézel le. Rám nézel. Lépj vissza egyet. Így, szépen.”', ok: true },
      { text: '„Siess már le!”', reply: 'Ha rákiabálunk, még jobban megijed. Nyugodt hangon beszélj hozzá!' },
      { text: '„Ugorj, majd elkaplak!”', reply: 'Jaj, dehogy! Lassan, lépésenként kell lejönni.' },
    ]);
    await api.say(B.cast.babuktin, 'A türelem nem azt jelenti, hogy nem csinálsz semmit. Megtanítalak a nyolcas csomóra!');

    const W = 800, H = 520;
    const { ctx, cv, point } = api.canvas(W, H);
    // a nyolcas: felső kör az óramutatóval, alsó kör ellentétesen
    const cx = 400, r = 100, mid = 250;
    const path = [];
    const STEPS = 70;
    for (let k = 0; k <= STEPS; k++) {
      const a = Math.PI / 2 - (k / STEPS) * Math.PI * 2;
      path.push({ x: cx + Math.cos(a) * r, y: mid - r + Math.sin(a) * r });
    }
    for (let k = 1; k <= STEPS; k++) {
      const a = -Math.PI / 2 + (k / STEPS) * Math.PI * 2;
      path.push({ x: cx + Math.cos(a) * r, y: mid + r + Math.sin(a) * r });
    }

    let idx = 0, drawing = false, knot = 1, t = 0, eaten = 0, busy = false;
    api.hud('🪢 1. csomó');

    function near(p, q, d) { return Math.hypot(p.x - q.x, p.y - q.y) < d; }
    api.on(cv, 'pointerdown', (e) => {
      if (busy) return;
      const p = point(e);
      if (near(p, path[idx], 48)) { drawing = true; cv.setPointerCapture(e.pointerId); }
    });
    api.on(cv, 'pointermove', (e) => {
      if (!drawing || busy) return;
      const p = point(e);
      // a következő néhány pont közül a legtávolabbit fogadjuk el, ami elég közel van
      let best = -1;
      for (let k = idx + 1; k < Math.min(path.length, idx + 10); k++) {
        if (near(p, path[k], 40)) best = k;
      }
      if (best > idx) {
        if (Math.floor(best / 10) > Math.floor(idx / 10)) B.tone(300 + best * 3, 0.06, 'triangle', 0.08);
        idx = best;
        if (idx === path.length - 1) knotDone();
      } else if (!near(p, path[idx], 90)) {
        drawing = false;
        api.toast('Lecsúszott a kötél! Folytasd a világító pontnál.');
      }
    });
    api.on(cv, 'pointerup', () => { drawing = false; });
    api.on(cv, 'pointercancel', () => { drawing = false; });

    async function knotDone() {
      drawing = false;
      busy = true;
      B.sfx.good();
      if (knot === 1) {
        await api.wait(500);
        eaten = 1;
        B.sfx.meh();
        await api.say(B.cast.makkos, 'Mek! (Makkos megette az első csomót.)');
        await api.say(B.cast.babuktin, 'Makkos! … Semmi baj, Kobak. Kössük meg még egyszer!');
        eaten = 0;
        knot = 2; idx = 0; busy = false;
        api.hud('🪢 2. csomó');
        return;
      }
      if (knot === 2) {
        await api.wait(400);
        await api.say(B.cast.babuktin, 'Szép! Most kösd meg gyorsan, a vihar előtt, egyedül! Én csak nézlek.');
        knot = 3; idx = 0; busy = false;
        api.hud('🪢 3. csomó – a vitorlakötél!');
        return;
      }
      B.sfx.win();
      await api.wait(600);
      await api.talk([
        [B.cast.narrator, 'Kobak gyorsan és pontosan megkötötte a vitorlakötelet. A hajó úgy repült, mint egy madár, és még az eső előtt odaértek a Holló-sziklához.'],
        [B.cast.narrator, 'A torony fénye felgyulladt, és a halászhajók egymás után hazataláltak. Köztük a Sirály is.'],
        [B.cast.babuktin, 'Ha felnősz, jöhetsz hozzám tanítványnak. Addig a kapitányaid a szüleid. A jó matróz előbb megtanul hallgatni, aztán tud vezetni.'],
      ]);
      api.win();
    }

    api.loop((dt) => {
      t += dt;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, knot === 3 ? '#4d5a73' : '#bfe3ef');
      sky.addColorStop(1, knot === 3 ? '#6f7f99' : '#f8e7c0');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      // fedélzet deszkái
      ctx.fillStyle = '#b07a45'; ctx.fillRect(0, H - 60, W, 60);
      ctx.strokeStyle = '#8a5a2e'; ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, H - 60); ctx.lineTo(x, H); ctx.stroke(); }
      B.drawEmoji(ctx, '🤠', 110, H - 100, 70);
      B.drawEmoji(ctx, '👦', 690, H - 95, 60);
      B.drawEmoji(ctx, eaten ? '🐐' : '🐯', eaten ? 470 : 760, H - 40, 44);
      if (knot !== 3) B.drawEmoji(ctx, '🐐', 40, H - 40, 44);

      // vezető vonal
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(80,60,40,.25)'; ctx.lineWidth = 34;
      ctx.beginPath(); path.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
      ctx.setLineDash([2, 14]); ctx.strokeStyle = 'rgba(80,60,40,.5)'; ctx.lineWidth = 4;
      ctx.beginPath(); path.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
      ctx.setLineDash([]);
      // megkötött kötél
      if (!eaten && idx > 0) {
        ctx.strokeStyle = '#d9a35b'; ctx.lineWidth = 22;
        ctx.beginPath(); for (let k = 0; k <= idx; k++) (k ? ctx.lineTo(path[k].x, path[k].y) : ctx.moveTo(path[k].x, path[k].y)); ctx.stroke();
        ctx.strokeStyle = '#a8742f'; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
        ctx.beginPath(); for (let k = 0; k <= idx; k++) (k ? ctx.lineTo(path[k].x, path[k].y) : ctx.moveTo(path[k].x, path[k].y)); ctx.stroke();
        ctx.setLineDash([]);
      }
      // nyíl a következő irányba és világító pont
      if (!busy) {
        const p = path[idx];
        const q = path[Math.min(path.length - 1, idx + 6)];
        const pulse = 18 + Math.sin(t * 6) * 5;
        ctx.fillStyle = 'rgba(255,201,60,.45)';
        ctx.beginPath(); ctx.arc(p.x, p.y, pulse + 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffc93c';
        ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
        const ang = Math.atan2(q.y - p.y, q.x - p.x);
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(ang);
        ctx.fillStyle = '#ef6a4c';
        ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.fill();
        ctx.restore();
      }
      if (knot === 3) {
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        for (let k = 0; k < 30; k++) {
          const x = (k * 53 + t * 200) % W, y = (k * 97 + t * 400) % (H - 60);
          ctx.fillRect(x, y, 2, 12);
        }
      }
    });
  },
});
