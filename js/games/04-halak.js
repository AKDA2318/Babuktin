/* 4. mese – Babuktin és a halak tolvaja
   Játék: rejtett lábnyomok keresése a piacon, aztán a tolvaj kitalálása. */
Babuktin.register({
  id: 'halak',
  title: 'Babuktin és a halak tolvaja',
  short: 'A halak tolvaja',
  icon: '🔍',
  place: 'Halpiac',
  story: [
    'Egy zajos kikötővárosban három éjszaka óta tűnnek el a halak. Halmos úr, a halárus Csíkost gyanúsítja: hiszen ő csíkos és halszagú!',
    'Babuktin kalapot és nagyítót vesz elő: ő lesz a világ legjobb nyomozója. Csak Makkos meg ne egye a bizonyítékot!',
  ],
  howto: 'Keresd meg a piacon a 6 apró, nedves lábnyomot, és koppints rájuk! Utána találd ki, ki a tolvaj.',
  moral: '„A legjobb nyomozó az, aki nem a tolvajt keresi, hanem a megoldást.”',
  friend: { e: '🦦', name: 'A vidracsalád' },

  async start(stage, api) {
    const B = Babuktin;
    const otter = B.emoji('🦦', '🐾');
    const halmos = { e: '👨‍🍳', name: 'Halmos úr' };

    stage.innerHTML =
      '<div class="scene market">' +
      '  <div class="market-water"></div>' +
      '  <div class="market-pier"></div>' +
      '</div>';
    const scene = stage.querySelector('.market');

    await api.say(halmos, 'Ő volt! Biztosan az a tigris! Tegnap húsz kiló ponty tűnt el, ma hajnalban egy egész láda hering!');
    await api.say(B.cast.babuktin, 'Csíkos egész éjjel a hajón aludt, velem. Kiderítem, ki a tolvaj! Keressünk nyomokat.');

    // díszletek: standok, ládák, halak – ezek között bújnak meg a nyomok
    const props = [
      ['🐟', 8, 62, 44], ['🐠', 16, 70, 38], ['🦐', 24, 60, 34], ['🧺', 32, 72, 52], ['🦀', 40, 64, 40],
      ['📦', 50, 70, 54], ['🐡', 58, 61, 40], ['🪣', 66, 73, 42], ['🐟', 74, 64, 40], ['🧂', 6, 82, 34],
      ['⚓', 88, 30, 44], ['🐚', 46, 86, 30], ['🦑', 30, 86, 38], ['🛶', 80, 22, 60], ['🎣', 92, 60, 44],
      ['🐟', 20, 88, 34], ['🧺', 62, 88, 44],
    ];
    props.forEach(([e, x, y, s]) => {
      const n = B.el('span', 'emoji prop');
      n.textContent = B.emoji(e, '📦');
      n.style.cssText = 'left:' + x + '%;top:' + y + '%;font-size:' + s * 0.1 + 'cqw';
      scene.appendChild(n);
    });
    // standok tetői
    [[4, 44], [36, 44], [68, 44]].forEach(([x, y]) => {
      const n = B.el('div', 'stall');
      n.style.left = x + '%'; n.style.top = y + '%';
      scene.appendChild(n);
    });

    // a nyomok a pultoktól a víz felé vezetnek
    const prints = [[14, 78], [28, 67], [43, 79], [55, 66], [70, 79], [84, 50]];
    let found = 0;
    api.hud('🐾 0/6');
    prints.forEach(([x, y], k) => {
      const p = B.el('button', 'print');
      p.type = 'button';
      p.setAttribute('aria-label', 'Lábnyom');
      p.innerHTML = '<span class="emoji">🐾</span>';
      p.style.left = x + '%'; p.style.top = y + '%';
      p.style.setProperty('--rot', (k % 2 ? 25 : -20) + 'deg');
      p.addEventListener('click', () => {
        if (p.classList.contains('found')) return;
        p.classList.add('found');
        found++;
        B.sfx.good();
        api.hud('🐾 ' + found + '/6');
        if (found === 6) api.timeout(deduce, 700);
        else api.toast(B.pick(['Megvan egy nyom!', 'Hm, egy újabb nyom!', 'Nedves, és apró…']));
      });
      scene.appendChild(p);
    });

    // Makkos a piacon kószál – ha rákoppintasz, mekeg
    const goat = B.el('button', 'emoji goat-walker', '🐐');
    goat.type = 'button';
    goat.setAttribute('aria-label', 'Makkos');
    scene.appendChild(goat);
    let gx = 10, dir = 1;
    api.loop((dt) => {
      gx += dir * dt * 6;
      if (gx > 85 || gx < 5) dir *= -1;
      goat.style.left = gx + '%';
      goat.style.transform = 'scaleX(' + (dir > 0 ? -1 : 1) + ')';
    });
    goat.addEventListener('click', () => {
      B.sfx.meh();
      api.toast(B.pick(['Mek! Makkos megette a kalapod szalagját.', 'Makkos szerint ő a legjobb nyomozó.', 'Mek-mek! Ne edd meg a nyomokat!']));
    });

    async function deduce() {
      await api.say(B.cast.babuktin, 'A nyomok aprók, négy ujjúak, és az ujjak között vékony hártya van. A víz szélénél eltűnnek. Aki a halakat viszi, az vízben él, kicsi, és éjszaka dolgozik.');
      await api.choice(B.cast.babuktin, 'Ki lehet a tolvaj?', [
        { text: '🐯  Csíkos, a tigris', reply: 'Csíkos egész éjjel a hajón aludt, és a mancsa sem volt nedves.' },
        { text: '🐈  A kikötői macska', reply: 'A macska nem szeret úszni, és a mancsán nincs hártya.' },
        { text: '🐦  Egy sirály', reply: 'A sirálynak nincs négy ujja, és nem a vízből mászik elő.' },
        { text: otter + '  Egy vidra', ok: true },
      ]);
      scene.classList.add('night');
      await api.talk([
        [B.cast.narrator, 'Éjjel Babuktin egy hordó mögött les. Éjfél után csobbanás: egy vidramama és három kölyök mászik ki a vízből, halakkal a szájukban.'],
        [B.cast.babuktin, 'Jó éjszakát! Nem harapok. Leülünk beszélni?'],
        [{ e: otter, name: 'Vidramama' }, 'Sajnáljuk, nem akartunk lopni. De a halászok kihalászták az öblöt, és a kicsik napok óta éhesek.'],
      ]);
      await api.choice(B.cast.babuktin, 'Másnap reggel az egész piac összegyűlik. Mit javasoljon Babuktin?', [
        { text: 'A vidrák hajtsák a halakat a hálóba, cserébe megkapják a maradékot.', ok: true },
        { text: 'Zavarjuk el a vidrákat a kikötőből!', reply: 'Akkor a kölykök éhen maradnának. Van jobb megoldás!' },
        { text: 'Zárjuk be a piacot éjszakára.', reply: 'A vidrák attól még éhesek maradnának. Mit tudnak jól a vidrák?' },
      ]);
      await api.say(halmos, 'Ez nem is rossz ötlet! … Bocsásson meg, tigris úr. Gyorsan ítéltem. Ez az óriási lazac az öné!');
      await api.say(B.cast.narrator, 'Csíkos szétosztotta a lazacot a vidrakölykökkel, és együtt lakmároztak a móló szélén.', 'Vége ⭐');
      api.win();
    }
  },
});
