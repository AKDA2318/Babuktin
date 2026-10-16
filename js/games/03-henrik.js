/* 3. mese – Világjáró Babuktin és Henrik, a kalóz
   Játék: dallam-memória a homokba rajzolt zongorán. */
Babuktin.register({
  id: 'henrik',
  title: 'Világjáró Babuktin és Henrik, a kalóz',
  short: 'Henrik, a kalóz',
  icon: '🏴‍☠️',
  place: 'Nyílt óceán',
  story: [
    'Babuktin hazafelé tart a húga születésnapjára, amikor kalózok támadják meg a hajót. A nagy csatában mindkét hajó elsüllyed!',
    'Babuktin egy úszó gerendán köt ki, a kalózkapitánnyal, Henrikkel együtt. Végül egy apró szigetre érnek, ahol várni kell a mentőhajóra.',
  ],
  howto: 'Babuktin a homokba rajzolt billentyűkön zongorázni tanítja Henriket. Figyeld meg a dallamot, aztán koppints a billentyűkre ugyanabban a sorrendben!',
  moral: '„Lehet, hogy van baj, de meg tudjuk oldani.”',
  friend: { e: '🎹', name: 'Henrik, a zongorista' },

  async start(stage, api) {
    const B = Babuktin;
    const henrik = { e: '🏴‍☠️', name: 'Henrik' };

    stage.innerHTML =
      '<div class="beach">' +
      '  <div class="beach-sea"></div>' +
      '  <div class="beach-people"><span class="emoji">🌴</span><span class="emoji">🤠</span><span class="emoji henrik-face">🏴‍☠️</span><span class="emoji">🔥</span></div>' +
      '  <p class="beach-msg" aria-live="polite"></p>' +
      '  <div class="keys"></div>' +
      '</div>';
    const msg = stage.querySelector('.beach-msg');
    const keysBox = stage.querySelector('.keys');
    const notes = [
      { n: 'Dó', f: 261.63, c: '#ef6a4c' },
      { n: 'Ré', f: 293.66, c: '#ffc93c' },
      { n: 'Mi', f: 329.63, c: '#3f9d5d' },
      { n: 'Fá', f: 349.23, c: '#1d6f8f' },
      { n: 'Szó', f: 392.0, c: '#a45cc4' },
    ];
    const keys = notes.map((note, i) => {
      const k = B.el('button', 'sand-key');
      k.type = 'button';
      k.style.setProperty('--key', note.c);
      k.innerHTML = '<span>' + note.n + '</span>';
      k.setAttribute('aria-label', note.n);
      k.addEventListener('pointerdown', (e) => { e.preventDefault(); press(i); });
      keysBox.appendChild(k);
      return k;
    });
    api.on(window, 'keydown', (e) => {
      const i = '12345'.indexOf(e.key);
      if (i !== -1) press(i);
    });

    await api.talk([
      [henrik, 'A cápák megesznek minket! Itt vagyunk a semmi közepén, étel nélkül, egyetlen kulacs vízzel!'],
    ]);
    await api.choice(B.cast.babuktin, 'Henrik sír. Mit mondjon neki Babuktin?', [
      { text: '„Nyugi, nincs baj. Mit szeretnél igazából csinálni?”', ok: true },
      { text: '„Kalóz vagy, magadnak köszönheted!”', reply: 'Ez nem segít Henriken. Babuktin a legkedvesebb hangján szól hozzá.' },
      { text: '„Ne sírj, a kalózok nem sírnak!”', reply: 'Sírni szabad. Inkább kérdezd meg, mi bántja!' },
    ]);
    await api.talk([
      [henrik, 'Nagyszerű zongorista akartam lenni, de a családi szakmában kötöttem ki. A bátyám, Feketeszakáll miatt.'],
      [B.cast.babuktin, 'Amíg a mentőhajóra várunk, megtanítalak! Rajzolok billentyűket a homokba. Figyelj, és játszd utánam!'],
    ]);

    // a dallam hossza körről körre nő
    const rounds = [3, 4, 5, 6];
    let round = 0, seq = [], pos = 0, listening = false;
    function newSequence() {
      seq = [];
      for (let k = 0; k < rounds[round]; k++) {
        let n;
        do { n = Math.floor(Math.random() * notes.length); } while (k > 0 && n === seq[k - 1] && Math.random() < 0.6);
        seq.push(n);
      }
    }
    function light(i, ms) {
      keys[i].classList.add('lit');
      B.tone(notes[i].f, ms / 1000, 'triangle', 0.25);
      api.timeout(() => keys[i].classList.remove('lit'), ms - 60);
    }
    async function playSequence() {
      listening = false;
      keysBox.classList.add('busy');
      msg.textContent = 'Babuktin játszik… figyelj!';
      api.hud('🎵 ' + (round + 1) + '. dallam / ' + rounds.length);
      await api.wait(700);
      for (const i of seq) { light(i, 480); await api.wait(620); }
      msg.textContent = 'Most te jössz, Henrik!';
      keysBox.classList.remove('busy');
      pos = 0;
      listening = true;
    }
    async function press(i) {
      if (!listening) return;
      light(i, 300);
      if (i === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          listening = false;
          B.sfx.good();
          round++;
          if (round === rounds.length) { finish(); return; }
          msg.textContent = B.pick(['Ügyes!', 'Szép volt!', 'Henrik mosolyog!']);
          await api.wait(900);
          newSequence();
          playSequence();
        }
      } else {
        listening = false;
        B.sfx.bad();
        B.shake(keysBox);
        msg.textContent = '„Nincs baj… próbáljuk újra!”';
        await api.wait(1200);
        playSequence();
      }
    }
    async function finish() {
      msg.textContent = 'Henrik már zongorázik! 🎶';
      [0, 2, 4, 2, 4, 4].forEach((n, k) => api.timeout(() => light(n, 260), 300 + k * 280));
      await api.wait(2400);
      await api.talk([
        [B.cast.narrator, 'Egy hét múlva egy kereskedőhajó észrevette a tüzüket, és kimentette őket.'],
        [henrik, 'Köszönöm, Babuktin! Azóta én vagyok a város zongoristája.'],
      ]);
      api.win();
    }
    newSequence();
    playSequence();
  },
});
