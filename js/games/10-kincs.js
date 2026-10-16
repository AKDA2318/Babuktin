/* 10. mese – Babuktin és a kincs, ami nem arany
   Játék: kertészkedés – ültetés, locsolás, szüret, és Makkos elhessegetése. */
Babuktin.register({
  id: 'kincs',
  title: 'Babuktin és a kincs, ami nem arany',
  short: 'A kincs, ami nem arany',
  icon: '🌱',
  place: 'Sós-sziget',
  story: [
    'Babuktin kincses térképet talál egy palackban. A piros X alatt tényleg ott a láda… de nem arany van benne, hanem sok kis zsák mag!',
    '„Ültesd el, és oszd meg másokkal” – írja az Öreg Kertész. A szeles Sós-szigeten még sosem nőtt zöldség, a gyerekek soványak és sápadtak.',
  ],
  howto: 'Koppints az üres ágyásra, és elülteted a magot. Ha csepp jelenik meg, koppints rá: megöntözöd. Ha megérett, szüretelj! Makkost hessegesd el a palántáktól.',
  moral: '„Azt hittem, hogy aranyat találok. De az Öreg Kertész kincse többet ér.”',
  friend: { e: '👵', name: 'Mira néni' },

  async start(stage, api) {
    const B = Babuktin;
    const mira = { e: '👵', name: 'Mira néni' };

    await api.say(B.cast.babuktin, 'Hát… mag. Én aranyra számítottam.');
    await api.choice(B.cast.babuktin, 'A cédulán ez áll: „Ültesd el, és oszd meg másokkal.” Mit kezdjen Babuktin a magokkal?', [
      { text: 'Elviszi a Sós-szigetre, és ott elülteti.', ok: true },
      { text: 'Kidobja, hiszen nem arany.', reply: 'Lehet, hogy ebben több van, mint gondolnánk!' },
      { text: 'Megeteti Makkossal.', reply: 'Makkos örülne, de az Öreg Kertész nem ezt kérte.' },
    ]);
    await api.talk([
      [mira, 'Halból, szárított kenyérből és sós levesből élünk. A szél elviszi a földet. Semmi sem nő.'],
      [B.cast.babuktin, 'Építsünk falat a szél ellen, cseréljük ki a földet, és ültessük el a magokat! Csíkos hozza a vizet.'],
    ]);

    const GOAL = 10;
    const veggies = ['🍅', '🥕', '🥬', '🌽', '🍆', B.emoji('🫑', '🌶️'), '🥔', '🍎'];
    stage.innerHTML =
      '<div class="farm">' +
      '  <div class="farm-wall"></div>' +
      '  <div class="plots"></div>' +
      '  <button type="button" class="emoji farm-goat" aria-label="Makkos – hessegesd el!">🐐</button>' +
      '  <div class="basket"><span class="emoji">🧺</span><b class="basket-n">0</b></div>' +
      '</div>';
    const farm = stage.querySelector('.farm');
    const plotsBox = stage.querySelector('.plots');
    const goat = stage.querySelector('.farm-goat');
    const basketN = stage.querySelector('.basket-n');
    let harvested = 0, done = false;

    // ágyás állapotai: empty → seed → thirsty → growing → ripe
    const plots = [];
    for (let k = 0; k < 9; k++) {
      const b = B.el('button', 'plot');
      b.type = 'button';
      b.innerHTML = '<span class="emoji plant"></span><span class="emoji need"></span>';
      const p = { b, plant: b.querySelector('.plant'), need: b.querySelector('.need'), state: 'empty', veg: '', timer: 0 };
      b.addEventListener('click', () => tap(p));
      plotsBox.appendChild(b);
      plots.push(p);
      setState(p, 'empty');
    }
    function setState(p, s) {
      p.state = s;
      clearTimeout(p.timer);
      p.b.className = 'plot ' + s;
      const labels = { empty: 'Üres ágyás – ültess!', seed: 'Elvetett mag', thirsty: 'Szomjas palánta – locsold meg!', growing: 'Növekvő palánta', ripe: 'Érett – szüretelj!' };
      p.b.setAttribute('aria-label', labels[s]);
      p.plant.textContent = { empty: '', seed: '🟤', thirsty: '🌱', growing: '🌿', ripe: p.veg }[s];
      p.need.textContent = s === 'thirsty' ? '💧' : s === 'ripe' ? '✨' : '';
      if (s === 'seed') p.timer = api.timeout(() => setState(p, 'thirsty'), B.rand(1200, 2200));
      if (s === 'growing') p.timer = api.timeout(() => setState(p, 'ripe'), B.rand(2200, 3400));
    }
    function tap(p) {
      if (done) return;
      if (p.state === 'empty') { p.veg = B.pick(veggies); setState(p, 'seed'); B.sfx.pop(); }
      else if (p.state === 'thirsty') { setState(p, 'growing'); B.noise(0.3, 3000, 0.2); }
      else if (p.state === 'ripe') {
        setState(p, 'empty');
        harvested++;
        basketN.textContent = harvested;
        B.sfx.good();
        api.hud('🧺 ' + harvested + '/' + GOAL);
        if (harvested >= GOAL) finish();
      } else {
        B.tone(250, 0.06, 'triangle', 0.08);
      }
    }
    api.hud('🧺 0/' + GOAL);

    // Makkos időnként odalopakodik egy palántához
    let goatTarget = null, goatTimer = 0;
    function goatHome() {
      goat.style.left = '2%'; goat.style.top = '78%';
      goat.classList.remove('sneaking');
      goatTarget = null;
    }
    function sneak() {
      if (done) return;
      const growing = plots.filter((p) => p.state === 'growing' || p.state === 'ripe' || p.state === 'thirsty');
      if (!growing.length) { api.timeout(sneak, 1500); return; }
      goatTarget = B.pick(growing);
      const fr = farm.getBoundingClientRect();
      const pr = goatTarget.b.getBoundingClientRect();
      goat.style.left = ((pr.left - fr.left + pr.width / 2) / fr.width * 100 - 4) + '%';
      goat.style.top = ((pr.top - fr.top + pr.height / 2) / fr.height * 100 - 6) + '%';
      goat.classList.add('sneaking');
      goatTimer = api.timeout(() => {
        if (!goatTarget) return;
        if (goatTarget.state !== 'empty') {
          setState(goatTarget, 'empty');
          B.sfx.meh();
          api.toast('Makkos! Nem az ebéd! (Megette a palántát.)');
        }
        goatHome();
        api.timeout(sneak, B.rand(3500, 5500));
      }, 3200);
    }
    goat.addEventListener('click', () => {
      if (!goatTarget) { B.sfx.meh(); return; }
      clearTimeout(goatTimer);
      B.sfx.meh();
      api.toast(B.pick(['Hess, Makkos!', 'Makkos bánatosan mekeg.', 'Makkos, ez nem a tiéd!']));
      goatHome();
      api.timeout(sneak, B.rand(3500, 5500));
    });
    goatHome();
    api.timeout(sneak, 5000);

    async function finish() {
      done = true;
      goatHome();
      B.sfx.win();
      farm.classList.add('green');
      await api.wait(900);
      await api.talk([
        [B.cast.narrator, 'Pontosan egy évvel később Babuktin visszatért. A sziget zöld lett: paradicsom, répa, káposzta termett, és a gyerekek arca rózsás volt.'],
        [mira, 'Ez az első termésünk magja. Vigye magával, és adja tovább valakinek, aki szintén szomjazza a zöldet!'],
      ]);
      api.win();
    }
  },
});
