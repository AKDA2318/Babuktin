/* 7. mese – Babuktin és a falu, ahol tilos volt nevetni
   Játék: memóriakártyák – nevetőpárok keresése, a szürke falu kiszíneződik. */
Babuktin.register({
  id: 'nevetes',
  title: 'Babuktin és a falu, ahol tilos volt nevetni',
  short: 'A falu, ahol tilos volt nevetni',
  icon: '😄',
  place: 'Hegyi falu',
  story: [
    'Egy hegyi faluban nagy tábla áll a főtéren: TILOS NEVETNI! Tizenkét éve senki sem mosolyog, mert a Morc király megtiltotta.',
    'Babuktin felmegy a kastélyba. Meghajol, a fakardja a földhöz koppan, visszapattan, és az orrára csap. A király arca megrándul…',
  ],
  howto: 'Mindenkinek más a nevetése! Fordíts fel két kártyát, és keresd meg a nevetőpárokat. Minden párral színesebb lesz a falu.',
  moral: '„A nevetés nem azt jelenti, hogy valakit kinevetnek. Hanem azt, hogy együtt nevetünk.”',
  friend: { e: '👑', name: 'A Morc király' },

  async start(stage, api) {
    const B = Babuktin;
    const kiraly = { e: '🤴', name: 'A Morc király' };

    // minden nevetés saját hangot kap
    const laughs = [
      { e: '👑', name: 'Hrrr-kiiik-röff!', play: () => { B.slide(120, 90, 0.25, 'sawtooth', 0.12); B.slide(900, 1400, 0.15, 'square', 0.06, 0.25); B.slide(160, 110, 0.2, 'sawtooth', 0.12, 0.42); } },
      { e: '🤠', name: 'Fiíí-fiíí!', play: () => { [0, 0.18, 0.36].forEach((w) => B.slide(1500, 1900, 0.12, 'sine', 0.12, w)); } },
      { e: '🐐', name: 'Mehehe!', play: () => B.sfx.meh() },
      { e: '🐯', name: 'Puff-puff!', play: () => { B.noise(0.1, 300, 0.5); B.noise(0.1, 300, 0.5, 0.18); } },
      { e: '💂', name: 'Hö-hö-hö!', play: () => { [0, 0.15, 0.3].forEach((w) => B.tone(140, 0.1, 'triangle', 0.25, w)); } },
      { e: '👧', name: 'Kicc-kacc!', play: () => { [0, 0.1, 0.2, 0.3].forEach((w, k) => B.tone(700 + k * 120, 0.07, 'square', 0.07, w)); } },
    ];

    await api.say(kiraly, 'Ki vagy te? És miért nem nevetsz? Úgyis tilos.');
    await api.say(B.cast.babuktin, 'Felség, leülünk beszélni? Hadd meséljek arról, hogyan kente be Makkos a saját szakállát egy tál lekvárral…');
    B.slide(120, 90, 0.25, 'sawtooth', 0.12); B.slide(900, 1400, 0.15, 'square', 0.06, 0.25);
    await api.say(kiraly, 'HRRRR-KIIIK-RÖFF! … Jaj! Látod? Ezért tiltottam be. Gyerekkoromban kinevettek ezért a nevetésért.');
    await api.choice(B.cast.babuktin, 'A király szeme megtelik könnyel. Mit tegyen Babuktin?', [
      { text: 'Megmutatja a saját, vicces nevetését.', ok: true },
      { text: 'Kineveti a királyt.', reply: 'Az fájna neki. Nem kinevetünk, hanem együtt nevetünk!' },
      { text: 'Gyorsan elmegy a kastélyból.', reply: 'Így a falu örökre szürke maradna. Segíts a királynak!' },
    ]);
    await api.say(B.cast.babuktin, 'Felség, mindenkinek más a nevetése. Az enyém így hangzik: fiíí-fiíí, mint egy lyukas fuvola! Keressük meg mindenki nevetését!');

    stage.innerHTML =
      '<div class="village">' +
      '  <p class="sign">TILOS NEVETNI!</p>' +
      '  <div class="cards"></div>' +
      '</div>';
    const village = stage.querySelector('.village');
    const sign = stage.querySelector('.sign');
    const grid = stage.querySelector('.cards');

    const deck = B.shuffle(laughs.concat(laughs).map((l, k) => ({ l, k })));
    let open = [], pairs = 0, lock = false;
    village.style.setProperty('--gray', 1);
    api.hud('😄 0/' + laughs.length);

    deck.forEach((d) => {
      const card = B.el('button', 'card');
      card.type = 'button';
      card.setAttribute('aria-label', 'Lefordított kártya');
      card.innerHTML =
        '<span class="card-inner">' +
        '<span class="card-back">?</span>' +
        '<span class="card-front"><span class="emoji">' + d.l.e + '</span><small>' + d.l.name + '</small></span>' +
        '</span>';
      card.addEventListener('click', () => flip(card, d));
      grid.appendChild(card);
    });

    function flip(card, d) {
      if (lock || card.classList.contains('open')) return;
      card.classList.add('open');
      card.setAttribute('aria-label', d.l.name);
      d.l.play();
      open.push({ card, d });
      if (open.length < 2) return;
      lock = true;
      const [a, b] = open;
      open = [];
      if (a.d.l === b.d.l) {
        api.timeout(() => {
          a.card.classList.add('matched');
          b.card.classList.add('matched');
          pairs++;
          B.sfx.good();
          village.style.setProperty('--gray', 1 - pairs / laughs.length);
          api.hud('😄 ' + pairs + '/' + laughs.length);
          lock = false;
          if (pairs === laughs.length) finish();
        }, 500);
      } else {
        api.timeout(() => {
          a.card.classList.remove('open');
          b.card.classList.remove('open');
          a.card.setAttribute('aria-label', 'Lefordított kártya');
          b.card.setAttribute('aria-label', 'Lefordított kártya');
          lock = false;
        }, 1100);
      }
    }

    async function finish() {
      await api.wait(600);
      sign.textContent = 'KÖTELEZŐ NEVETNI! (legalább naponta egyszer)';
      sign.classList.add('happy');
      laughs.forEach((l, k) => api.timeout(l.play, k * 350));
      await api.wait(2400);
      await api.talk([
        [B.cast.narrator, 'Az egész falu nevetett: hangosan és halkan, vékonyan és mélyen, csuklásszerűen és röfögve. A szürke falu kiszíneződött.'],
        [kiraly, 'Hrrrr-kiiik-röff! Igazad van, Babuktin. Hiba volt betiltani.'],
      ]);
      api.win();
    }
  },
});
