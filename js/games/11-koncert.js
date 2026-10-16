/* 11. mese – Babuktin és Henrik koncertje
   Játék: ritmusjáték három sávval – zongora, harmonika, dob. */
Babuktin.register({
  id: 'koncert',
  title: 'Babuktin és Henrik koncertje',
  short: 'Henrik koncertje',
  icon: '🎵',
  place: 'A városháza nagyterme',
  story: [
    'Henrik, az egykori kalóz ma este nagy zongorakoncertet ad! Babuktin az első sorban ül, Makkos már meg is kóstolta a kottát.',
    'A koncert közepén kivágódik az ajtó: Feketeszakáll, Henrik bátyja érkezik a kalózaival. „A kalózok nem zongoráznak!”',
  ],
  howto: 'Játszd el a régi dalt! Koppints a sávra (vagy nyomd meg az 1, 2, 3 gombot), amikor a hang a sárga vonalhoz ér.',
  moral: '„Nekem csak annyi volt a dolgom, hogy hátradőljek, és szurkoljak neked. Néha ez a legnehezebb.”',
  friend: { e: '🏴‍☠️', name: 'Feketeszakáll és a koncerthajó' },

  async start(stage, api) {
    const B = Babuktin;
    const henrik = { e: '🎹', name: 'Henrik' };
    const fekete = { e: '🏴‍☠️', name: 'Feketeszakáll' };

    await api.say(fekete, 'HENRIK! Hallottam, hogy zongorista lettél. Szégyent hoztál ránk! A kalózok nem zongoráznak!');
    await api.choice(B.cast.babuktin, 'Babuktin keze a fakardjához nyúl. De Henrik halkan megszólal: „Babuktin. Hadd csináljam én.” Mit tegyen Babuktin?', [
      { text: 'Visszaül, és szurkol Henriknek.', ok: true },
      { text: 'Mégis előrántja a fakardot.', reply: 'Henrik maga szeretné megoldani. Néha a szurkolás a legnehezebb!' },
      { text: 'Kimegy a teremből.', reply: 'Henriknek most nagy szüksége van egy barátra az első sorban.' },
    ]);
    await api.say(henrik, 'Bátyám, én mindig zenélni akartam. Ezt a dalt neked játszom. Azt, amit anya dúdolt nekünk a tengerparton.');

    const W = 800, H = 520, HIT = 440, SPEED = 260;
    const { ctx, cv, point } = api.canvas(W, H);
    const lanes = [
      { x: 180, e: '🎹', name: 'Zongora', c: '#ef6a4c', type: 'triangle' },
      { x: 400, e: B.emoji('🪗', '🎷'), name: 'Harmonika', c: '#ffc93c', type: 'square' },
      { x: 620, e: '🥁', name: 'Dob', c: '#1d6f8f', type: 'drum' },
    ];
    // a régi dal: [ütem, sáv, hangmagasság]
    const C = 261.63, D = 293.66, E = 329.63, G = 392, A = 440, c = 523.25;
    const beat = 0.5;
    const tune = [
      [0, 0, G], [1, 0, E], [2, 0, G], [3, 0, E], [4, 0, G], [5, 0, A], [6, 0, G], [8, 0, E], [9, 0, D], [10, 0, C],
      [12, 1, G], [13, 0, E], [14, 1, G], [15, 0, E], [16, 1, G], [17, 0, A], [18, 1, G], [20, 0, E], [21, 1, D], [22, 0, C],
      [24, 2, 0], [24, 0, G], [25, 1, E], [26, 2, 0], [26, 0, G], [27, 1, E], [28, 2, 0], [28, 0, A], [29, 1, c], [30, 2, 0], [30, 0, G],
      [32, 2, 0], [32, 1, E], [33, 0, D], [34, 2, 0], [34, 1, E], [35, 0, D], [36, 2, 0], [36, 0, C], [38, 1, C], [38, 2, 0],
    ];
    const LEAD = (HIT + 40) / SPEED; // ennyi idő alatt ér le egy hang
    let notes, t, hits, combo, flashes, banner, finished;
    function reset() {
      notes = tune.map(([b, l, f]) => ({ time: LEAD + 1 + b * beat, lane: l, f, state: 'wait' }));
      t = 0; hits = 0; combo = 0; flashes = [0, 0, 0]; banner = null; finished = false;
      api.hud('👏 0/' + notes.length);
    }
    reset();
    const ends = notes[notes.length - 1].time + 1.2;

    function play(lane, f) {
      if (lanes[lane].type === 'drum') { B.noise(0.15, 180, 0.7); B.tone(90, 0.15, 'sine', 0.3); }
      else B.tone(f, 0.35, lanes[lane].type, lanes[lane].type === 'square' ? 0.06 : 0.22);
    }
    function strike(lane) {
      if (finished) return;
      flashes[lane] = 0.15;
      let best = null;
      for (const n of notes) {
        if (n.lane !== lane || n.state !== 'wait') continue;
        const d = Math.abs(n.time - t);
        if (d < 0.2 && (!best || d < Math.abs(best.time - t))) best = n;
      }
      if (best) {
        best.state = 'hit';
        hits++; combo++;
        play(lane, best.f);
        api.hud('👏 ' + hits + '/' + notes.length);
      } else {
        combo = 0;
        B.tone(150, 0.05, 'triangle', 0.05);
      }
    }
    api.on(cv, 'pointerdown', (e) => {
      const p = point(e);
      const lane = p.x < 290 ? 0 : p.x < 510 ? 1 : 2;
      strike(lane);
    });
    api.on(window, 'keydown', (e) => {
      const map = { '1': 0, '2': 1, '3': 2, a: 0, s: 1, d: 2, j: 0, k: 1, l: 2 };
      if (e.key in map) { e.preventDefault(); strike(map[e.key]); }
    });

    api.loop((dt) => {
      t += dt;
      flashes = flashes.map((f) => Math.max(0, f - dt));
      for (const n of notes) {
        if (n.state === 'wait' && t - n.time > 0.22) { n.state = 'miss'; combo = 0; }
      }
      const s2 = LEAD + 1 + 12 * beat, s3 = LEAD + 1 + 24 * beat;
      banner = t > s2 - 2 && t < s2 + 1 ? 'Feketeszakáll előveszi a szájharmonikát!'
        : t > s3 - 2 && t < s3 + 1 ? 'A kalózok is beszállnak a dobbal!' : null;
      draw();
      if (!finished && t > ends) { finished = true; end(); }
    });

    function draw() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#3a1f2e'); g.addColorStop(1, '#6b2f3b');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // függöny
      ctx.fillStyle = '#9b2335';
      for (let k = 0; k < 6; k++) { ctx.fillRect(k * 14, 0, 10, H); ctx.fillRect(W - 10 - k * 14, 0, 10, H); }
      lanes.forEach((l, k) => {
        ctx.fillStyle = 'rgba(255,255,255,' + (0.06 + flashes[k] * 2) + ')';
        ctx.fillRect(l.x - 90, 0, 180, H);
        B.drawEmoji(ctx, l.e, l.x, HIT + 46, 40);
      });
      ctx.strokeStyle = '#ffc93c'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(100, HIT); ctx.lineTo(W - 100, HIT); ctx.stroke();
      notes.forEach((n) => {
        if (n.state === 'hit') return;
        const y = HIT - (n.time - t) * SPEED;
        if (y < -40 || y > H + 40) return;
        const l = lanes[n.lane];
        ctx.globalAlpha = n.state === 'miss' ? 0.3 : 1;
        ctx.fillStyle = l.c;
        ctx.beginPath(); ctx.arc(l.x, y, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        B.drawEmoji(ctx, n.lane === 2 ? '🥁' : '♪', l.x, y + 1, 26);
        ctx.globalAlpha = 1;
      });
      if (banner) {
        ctx.fillStyle = 'rgba(255,251,241,.95)';
        ctx.fillRect(140, 30, W - 280, 54);
        ctx.fillStyle = '#1b3347';
        ctx.font = '700 22px "Baloo 2", system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(banner, W / 2, 58);
      }
      if (combo >= 4) {
        ctx.fillStyle = '#ffc93c';
        ctx.font = '800 26px "Baloo 2", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(combo + ' egymás után!', W - 110, 120);
      }
    }

    async function end() {
      const need = Math.ceil(notes.length * 0.55);
      if (hits < need) {
        await api.say(henrik, 'Szép volt, de Feketeszakáll még nem ismerte fel a dalt. Játsszuk el még egyszer!', 'Újra 🎵');
        reset();
        return;
      }
      B.sfx.win();
      await api.talk([
        [fekete, 'Ezt ismerem… Ezt mi együtt játszottuk. Testvérem, büszke vagyok rád.'],
        [henrik, 'Köszönöm, Babuktin. Nélküled nem mertem volna.'],
        [B.cast.narrator, 'Feketeszakáll és a kalózok a hajójukból koncerthajót csináltak, és bejárják vele a világ kikötőit.'],
      ]);
      api.win();
    }
  },
});
