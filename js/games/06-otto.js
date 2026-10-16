/* 6. mese – Babuktin és a szégyenlős tengeri szörny
   Játék: sakk-feladvány – a lóval kell összeszedni a kagylókat. */
Babuktin.register({
  id: 'otto',
  title: 'Babuktin és a szégyenlős tengeri szörny',
  short: 'A szégyenlős tengeri szörny',
  icon: '🐙',
  place: 'Kis halászváros',
  story: [
    'Babuktin nagy mesét mond a gyerekeknek: hogyan győzte le a nyolckarú tengeri szörnyet egyetlen suhintással. Csakhogy ez nem igaz!',
    'Másnap kiemelkedik a vízből Ottó, a szörny, és elpirul. Mindent hallott. Sosem harcoltak egymással…',
  ],
  howto: 'Ottó megtanítja, hogyan lép a ló: L alakban ugrik. Koppints a világító mezőkre, és szedd össze az összes kagylót!',
  moral: '„Nincs olyan ember, sem olyan szörny, akiben ne lenne valami érték. Csak észre kell venni.”',
  friend: { e: '🐙', name: 'Ottó, a sakkozó szörny' },

  async start(stage, api) {
    const B = Babuktin;
    const otto = { e: '🐙', name: 'Ottó' };

    await api.say(otto, 'Én vagyok az, akit legyőztél. A nevem Ottó. Pedig sosem találkoztunk… Az egész kikötő azt hiszi, hogy legyőztél, és ez nagyon rosszulesik.');
    await api.choice(B.cast.babuktin, 'Mit válaszoljon Babuktin?', [
      { text: '„Igazad van. Túloztam, kitaláltam. Bocsánatot kérek.”', ok: true },
      { text: '„Ugyan, csak egy mese volt, nem nagy ügy.”', reply: 'Ottónak ez fontos. Ha valakit megbántunk, bocsánatot kérünk.' },
      { text: '„Hát most legyőzlek igazából!”', reply: 'Babuktin nem akar verekedni. Inkább jóvá teszi, amit elrontott.' },
    ]);
    await api.talk([
      [otto, 'Akkor mérjük össze az erőnket, hogy helyreálljon a becsületem.'],
      [B.cast.babuktin, 'Rendben. A Babuktin-szabály szerint te választasz versenyszámot. Bármi lehet. Akár sakk is.'],
      [otto, 'Sakk? Tényleg? Mindig is sakkozni akartam! Előbb megmutatom, hogyan lép a ló: kettőt egyenesen, egyet oldalra, mint egy L betű.'],
    ]);

    const N = 5;
    const levels = [
      { start: [0, 4], shells: [[1, 2], [3, 3], [2, 0]] },
      { start: [2, 2], shells: [[0, 0], [4, 0], [4, 4], [0, 4], [2, 3]] },
    ];
    let level = 0, knight, shells, moves = 0;

    stage.innerHTML =
      '<div class="chess">' +
      '  <div class="board" role="grid" aria-label="Sakktábla"></div>' +
      '  <div class="chess-side"><span class="emoji otto-big">🐙</span><p class="chess-msg"></p></div>' +
      '</div>';
    const board = stage.querySelector('.board');
    const msg = stage.querySelector('.chess-msg');
    const cells = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const b = B.el('button', 'sq ' + ((r + c) % 2 ? 'dark' : 'light'));
        b.type = 'button';
        b.addEventListener('click', () => tryMove(r, c));
        board.appendChild(b);
        cells.push(b);
      }
    }
    const cell = (r, c) => cells[r * N + c];
    function canJump(r, c) {
      const dr = Math.abs(r - knight[0]), dc = Math.abs(c - knight[1]);
      return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
    }
    function load() {
      knight = levels[level].start.slice();
      shells = levels[level].shells.map((s) => s.slice());
      moves = 0;
      msg.textContent = level === 0
        ? 'Szedd össze a 3 kagylót! A ló csak a világító mezőkre ugorhat.'
        : 'Ügyes! Most egy nehezebb: 5 kagyló a tábla szélein.';
      render();
    }
    function render() {
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const b = cell(r, c);
          const isK = knight[0] === r && knight[1] === c;
          const hasShell = shells.some((s) => s[0] === r && s[1] === c);
          b.textContent = isK ? '♞' : hasShell ? '🐚' : '';
          b.classList.toggle('knight', isK);
          b.classList.toggle('shell', hasShell);
          b.classList.toggle('can', !isK && canJump(r, c));
          b.setAttribute('aria-label', isK ? 'Ló' : hasShell ? 'Kagyló' : canJump(r, c) ? 'Ide ugorhat a ló' : 'Üres mező');
        }
      }
      api.hud('🐚 ' + (levels[level].shells.length - shells.length) + '/' + levels[level].shells.length + '   Lépés: ' + moves);
    }
    function tryMove(r, c) {
      if (!canJump(r, c)) {
        if (!(knight[0] === r && knight[1] === c)) {
          B.sfx.bad();
          msg.textContent = 'A ló nem tud oda lépni. Keresd a világító mezőket!';
        }
        return;
      }
      knight = [r, c];
      moves++;
      const before = shells.length;
      shells = shells.filter((s) => !(s[0] === r && s[1] === c));
      if (shells.length < before) {
        B.sfx.good();
        msg.textContent = shells.length ? B.pick(['Kagyló a zsebben!', 'Ottó tapsol mind a nyolc karjával!', 'Szép ugrás!']) : '';
      } else {
        B.tone(330, 0.08, 'triangle', 0.12);
      }
      render();
      if (!shells.length) next();
    }
    async function next() {
      await api.wait(500);
      if (level < levels.length - 1) {
        level++;
        load();
        return;
      }
      await api.talk([
        [otto, 'Sakk-matt! … Megnyertem? Tényleg?'],
        [B.cast.babuktin, 'Tisztességesen! Gyerekek, bevallom: a tegnapi mesém nem volt igaz. Sakkban Ottó a jobb. Hát ti miben vagytok jók?'],
        [{ e: '👧', name: 'Kislány' }, 'Én mindig megtalálom a legszebb kagylókat! Ottó, megtanítasz sakkozni?'],
      ]);
      await api.say(B.cast.narrator, 'Aznap délután Ottó nyolc karjával egyszerre nyolc gyereknek magyarázta a sakkszabályokat.', 'Vége ⭐');
      api.win();
    }
    load();
  },
});
