/* 8. mese – Babuktin és a Vaskalapos Varjak
   Játék: vakond-csapkodó – le kell ütni a vaskalapokat, Tanaka urat békén kell hagyni. */
Babuktin.register({
  id: 'varjak',
  title: 'Babuktin és a Vaskalapos Varjak',
  short: 'A Vaskalapos Varjak',
  icon: '🌸',
  place: 'Japán',
  story: [
    'Tanaka úr levelet ír Babuktinnak a távoli Japánból: a Vaskalapos Varjak bandája minden este pénzt követel a családjától.',
    'Alkonyatkor megérkezik a tizenkét varjú, vaskalappal a fejükön. Babuktin háromszor is megkérdezi őket: „Leülünk beszélni?”',
  ],
  howto: 'Üsd le a vaskalapokat! Koppints a varjúra, amikor kidugja a fejét a bokorból. Tanaka urat hagyd békén!',
  moral: '„A legszebb ajándékot már megkaptam: hogy mindenki megértette a másikat.”',
  friend: { e: '🏮', name: 'Tanaka úr' },

  async start(stage, api) {
    const B = Babuktin;
    const crow = B.emoji('🐦‍⬛', '🐦');
    const varju = { e: crow, name: 'A sovány varjú' };
    const tanaka = { e: '🙇', name: 'Tanaka úr' };

    await api.say(varju, 'Kár-kár! Pénzt akarunk! Sok pénzt!');
    for (let k = 1; k <= 3; k++) {
      await api.choice(B.cast.babuktin, k === 1 ? 'Mit mond Babuktin?' : k === 2 ? 'A varjak nem figyelnek. Próbáld újra, hangosabban!' : 'Harmadszor is megkérdezed?', [
        { text: '„Leülünk beszélni?”' + (k > 1 ? ' (' + k + '. kérdés)' : ''), ok: true },
      ]);
      if (k < 3) await api.say(varju, 'NEM! Kár!');
    }
    await api.say(B.cast.babuktin, 'Rendben. Akkor másképp. (Babuktin a bal kezét a háta mögé teszi.) Ennyi elég is lesz!');

    const HOLES = 9, GOAL = 12;
    stage.innerHTML = '<div class="garden-jp"><div class="petals"></div><div class="holes"></div></div>';
    const holesBox = stage.querySelector('.holes');
    const holes = [];
    for (let k = 0; k < HOLES; k++) {
      const h = B.el('div', 'hole');
      h.innerHTML = '<button type="button" class="pop" aria-label="Bokor" tabindex="-1"><span class="hat"></span><span class="emoji face"></span></button><span class="bush"></span>';
      const btn = h.querySelector('.pop');
      const slot = { h, btn, face: h.querySelector('.face'), kind: null, timer: 0 };
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(slot); });
      btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') hit(slot); });
      holesBox.appendChild(h);
      holes.push(slot);
    }
    let hats = 0, done = false;
    api.hud('🎩 0/' + GOAL);

    function popUp() {
      if (done) return;
      const free = holes.filter((s) => !s.kind);
      if (!free.length) return;
      const s = B.pick(free);
      s.kind = Math.random() < 0.18 ? 'tanaka' : 'crow';
      s.face.textContent = s.kind === 'tanaka' ? '🙇' : crow;
      s.h.classList.toggle('is-tanaka', s.kind === 'tanaka');
      s.h.classList.add('up');
      s.btn.tabIndex = 0;
      s.btn.setAttribute('aria-label', s.kind === 'tanaka' ? 'Tanaka úr' : 'Vaskalapos varjú');
      const stay = Math.max(800, 1500 - hats * 50);
      s.timer = api.timeout(() => down(s), stay);
    }
    function down(s) {
      clearTimeout(s.timer);
      s.h.classList.remove('up', 'bonk');
      s.btn.tabIndex = -1;
      s.btn.setAttribute('aria-label', 'Bokor');
      api.timeout(() => { s.kind = null; }, 250);
    }
    function hit(s) {
      if (!s.kind || !s.h.classList.contains('up') || s.h.classList.contains('bonk')) return;
      if (s.kind === 'tanaka') {
        B.sfx.bad();
        api.toast('Hoppá, ez Tanaka úr! Őt nem kell megkoppintani.');
        down(s);
        return;
      }
      s.h.classList.add('bonk');
      hats++;
      B.tone(1200, 0.08, 'square', 0.1);
      B.tone(1800, 0.2, 'triangle', 0.1, 0.05);
      api.hud('🎩 ' + hats + '/' + GOAL);
      clearTimeout(s.timer);
      s.timer = api.timeout(() => down(s), 450);
      if (hats >= GOAL) { done = true; api.timeout(finish, 900); }
    }
    let spawnDelay = 900;
    (function loop() {
      if (done) return;
      popUp();
      if (hats > 4 && Math.random() < 0.35) api.timeout(popUp, 250);
      spawnDelay = Math.max(520, 900 - hats * 30);
      api.timeout(loop, spawnDelay);
    })();

    async function finish() {
      await api.say(varju, 'Te tényleg egy kézzel…');
      await api.choice(B.cast.babuktin, 'Most már leülnek a varjak. Mit kér tőlük Babuktin?', [
        { text: '„Vegyétek le a vaskalapot, hogy meghalljuk egymást!”', ok: true },
        { text: '„Adjátok ide a pénzeteket!”', reply: 'Babuktin nem rabló. Ő meg akarja érteni, mi bántja őket.' },
        { text: '„Menjetek haza, és ne gyertek vissza!”', reply: 'Előbb hallgassuk meg, miért követeltek pénzt!' },
      ]);
      await api.say(varju, 'Tanaka úr családja árul mindent: fazekat, legyezőt, lámpást. És minden évben drágábban. A szigetünkön már senki sem tudja megfizetni.');
      await api.choice(tanaka, 'Igaz… senki sem szólt nekem. Mit tehetnék értük?', [
        { text: 'Megfelezem az árakat, és megtanítom nekik a mesterséget.', ok: true },
        { text: 'Még drágábban árulok, hogy legyen pénzem őrökre.', reply: 'Így csak még nagyobb lenne a baj.' },
        { text: 'Elköltözöm egy másik szigetre.', reply: 'A gondot attól nem oldaná meg senki.' },
      ]);
      await api.say(B.cast.narrator, 'Aznap éjjel a cseresznyevirágok alatt mindenki együtt vacsorázott. Makkos közben megette Tanaka egyik papírlámpását. „Ezt az árat nem tudom megfelezni – nevetett Tanaka –, ez ingyen van!”', 'Vége ⭐');
      api.win();
    }
  },
});
