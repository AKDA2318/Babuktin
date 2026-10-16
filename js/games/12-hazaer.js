/* 12. mese – Babuktin hazaér
   Játék: ki mit hozott a bulira? Ajándékok párosítása a vendégekkel, aztán gyertyagyújtás. */
Babuktin.register({
  id: 'hazaer',
  title: 'Babuktin hazaér',
  short: 'Babuktin hazaér',
  icon: '🎂',
  place: 'Otthon, a domb tetején',
  story: [
    'Babuktin végre hazaér, de egy hetet késett: a húga, Boróka születésnapja már elmúlt. Még ajándéka sincs!',
    'Boróka kinyitja az ajtót… és a nagyszobában ott van mindenki, akivel Babuktin a kalandjai során találkozott. MEGLEPETÉS!',
  ],
  howto: 'Ki mit hozott a bulira? Húzd az ajándékot ahhoz a vendéghez, aki hozta. Vagy koppints előbb az ajándékra, aztán a vendégre.',
  moral: '„Ez életem legszebb születésnapja. Pedig nem is az enyém.”',
  friend: null,

  async start(stage, api) {
    const B = Babuktin;
    const boroka = { e: '👧', name: 'Boróka' };
    const hapci = { e: '🐉', name: 'Hapci' };

    await api.say(boroka, 'Minden kalandodról írtál nekem, bátyó. Így tudtam, kikkel találkoztál, és mindenkinek elküldtem a meghívót!');

    const pairs = [
      { guest: 'Dobrava', ge: '🧔', gift: '⌚', what: 'Fából faragott zsebóra' },
      { guest: 'Tanaka úr', ge: '🙇', gift: '🏮', what: 'Papírlámpás' },
      { guest: 'Kobak', ge: '👦', gift: B.emoji('🪢', '➰'), what: 'Kötél tíz nyolcas csomóval' },
      { guest: 'Zafir és Kamal', ge: '👳', gift: B.emoji('🏺', '🫖'), what: 'Víz a két kútból' },
      { guest: 'Halmos úr', ge: '👨‍🍳', gift: '🐟', what: 'Egy hatalmas hal' },
      { guest: 'Mira néni', ge: '👵', gift: '🥕', what: 'Zöldség a Sós-szigetről' },
      { guest: 'Feketeszakáll', ge: '🏴‍☠️', gift: B.emoji('🪗', '🎷'), what: 'A régi szájharmonika' },
      { guest: 'Ottó', ge: '🐙', gift: '♟️', what: 'Sakktábla egy kagylóval a sarkán' },
    ];

    stage.innerHTML =
      '<div class="party">' +
      '  <p class="party-msg">Ki mit hozott? Húzd az ajándékot a vendéghez!</p>' +
      '  <div class="guests"></div>' +
      '  <div class="gifts"></div>' +
      '</div>';
    const party = stage.querySelector('.party');
    const msg = stage.querySelector('.party-msg');
    const guestsBox = stage.querySelector('.guests');
    const giftsBox = stage.querySelector('.gifts');
    let matched = 0, selected = null;
    api.hud('🎁 0/' + pairs.length);

    pairs.forEach((p) => {
      const g = B.el('button', 'guest');
      g.type = 'button';
      g.innerHTML = '<span class="emoji">' + p.ge + '</span><small></small><span class="emoji got"></span>';
      g.querySelector('small').textContent = p.guest;
      g.setAttribute('aria-label', 'Vendég: ' + p.guest);
      g.addEventListener('click', () => { if (selected) give(selected, p, g); });
      p.guestEl = g;
      guestsBox.appendChild(g);
    });
    B.shuffle(pairs).forEach((p) => {
      const b = B.el('button', 'gift');
      b.type = 'button';
      b.innerHTML = '<span class="emoji">' + p.gift + '</span><small></small>';
      b.querySelector('small').textContent = p.what;
      b.setAttribute('aria-label', 'Ajándék: ' + p.what);
      p.giftEl = b;
      enableDrag(b, p);
      giftsBox.appendChild(b);
    });

    function select(p) {
      if (selected) selected.giftEl.classList.remove('selected');
      selected = selected === p ? null : p;
      if (selected) {
        p.giftEl.classList.add('selected');
        msg.textContent = p.what + ' – most koppints arra, aki hozta!';
        B.sfx.click();
      } else {
        msg.textContent = 'Ki mit hozott? Húzd az ajándékot a vendéghez!';
      }
    }
    function give(giftPair, guestPair, guestEl) {
      if (giftPair === guestPair) {
        giftPair.giftEl.classList.remove('selected');
        giftPair.giftEl.classList.add('given');
        giftPair.giftEl.disabled = true;
        guestEl.classList.add('happy');
        guestEl.querySelector('.got').textContent = giftPair.gift;
        selected = null;
        matched++;
        B.sfx.good();
        api.hud('🎁 ' + matched + '/' + pairs.length);
        msg.textContent = B.pick(['Eltaláltad!', 'Így van!', 'Pontosan!', 'Emlékszel a mesére!']);
        if (matched === pairs.length) api.timeout(cake, 700);
      } else {
        B.sfx.bad();
        B.shake(guestEl);
        msg.textContent = 'Nem, ezt nem ' + guestPair.guest + ' hozta. Melyik mesében szerepelt?';
      }
    }

    // húzás egérrel vagy ujjal; ha nem mozdul, sima kiválasztás
    function enableDrag(el, p) {
      let start = null, dragging = false;
      el.addEventListener('pointerdown', (e) => {
        if (el.disabled) return;
        start = { x: e.clientX, y: e.clientY };
        dragging = false;
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', (e) => {
        if (!start) return;
        const dx = e.clientX - start.x, dy = e.clientY - start.y;
        if (!dragging && Math.hypot(dx, dy) > 8) {
          dragging = true;
          el.classList.add('dragging');
          if (selected !== p) select(p);
        }
        if (dragging) el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.1)';
      });
      el.addEventListener('pointerup', (e) => {
        if (!start) return;
        start = null;
        if (!dragging) { select(p); return; }
        el.classList.remove('dragging');
        el.style.transform = '';
        el.style.visibility = 'hidden';
        const under = document.elementFromPoint(e.clientX, e.clientY);
        el.style.visibility = '';
        const guestEl = under && under.closest('.guest');
        const target = guestEl && pairs.find((q) => q.guestEl === guestEl);
        if (target) give(p, target, guestEl);
      });
      el.addEventListener('pointercancel', () => {
        start = null; dragging = false;
        el.classList.remove('dragging'); el.style.transform = '';
      });
    }

    /* ---------- Torta és gyertyák ---------- */
    async function cake() {
      await api.say(boroka, 'Itt a torta! Háromemeletes! Hapci, segítenél meggyújtani a gyertyákat?');
      party.innerHTML =
        '<p class="party-msg">Koppints Hapcira, hogy meggyújtsa a gyertyákat!</p>' +
        '<div class="cake-wrap"><button type="button" class="emoji cake-dragon" aria-label="Hapci">🐉</button>' +
        '<div class="cake"><div class="candles"></div><span class="emoji cake-emoji">🎂</span></div></div>';
      const m = party.querySelector('.party-msg');
      const candlesBox = party.querySelector('.candles');
      const candles = [];
      for (let k = 0; k < 7; k++) {
        const c = B.el('button', 'candle');
        c.type = 'button';
        c.setAttribute('aria-label', 'Gyertya');
        c.innerHTML = '<span class="flame"></span>';
        candlesBox.appendChild(c);
        candles.push(c);
      }
      let phase = 'light', out = 0;
      party.querySelector('.cake-dragon').addEventListener('click', () => {
        if (phase !== 'light') return;
        phase = 'blow';
        B.noise(0.6, 900, 0.35);
        candles.forEach((c, k) => api.timeout(() => { c.classList.add('lit'); B.tone(500 + k * 60, 0.12, 'triangle', 0.1); }, 150 + k * 120));
        api.timeout(() => { m.textContent = 'Boróka, fújd el a gyertyákat! Koppints mindegyikre!'; }, 1100);
      });
      candles.forEach((c) => c.addEventListener('click', () => {
        if (phase !== 'blow' || !c.classList.contains('lit')) return;
        c.classList.remove('lit');
        B.noise(0.15, 2500, 0.25);
        out++;
        if (out === candles.length) { phase = 'done'; finale(); }
      }));
    }

    async function finale() {
      B.sfx.win();
      await api.wait(800);
      await api.say(B.cast.babuktin, 'Barátaim! Kedves vendégek! Én vagyok A világjáró Babu…');
      B.sfx.sneeze();
      await api.say(hapci, 'HAPCI! … Bocsánat! Még egy kis nátha maradt!');
      await api.say(B.cast.babuktin, 'Én vagyok A világjáró Babuktin… és ez életem legszebb születésnapja. Pedig nem is az enyém.');
      await api.say(B.cast.narrator, 'Másnap reggel a vitorlák már fel voltak húzva. Makkos mekegett, Csíkos ásított, és A világjáró Babuktin hajója elindult a következő kaland felé.', 'Vége ⭐');
      api.win();
    }
  },
});
