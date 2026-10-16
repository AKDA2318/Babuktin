/* 5. mese – Babuktin és a két kút
   Játék: időzítés – a kötelet a zöld mezőben kell megfogni, hogy a társ biztonságban ásson. */
Babuktin.register({
  id: 'kutak',
  title: 'Babuktin és a két kút',
  short: 'A két kút',
  icon: '🐫',
  place: 'Sivatagi oázis',
  story: [
    'A sivatagi oázisban két kereskedő, Zafir és Kamal veszekszik: kié a kút? Vonalat húztak a homokba, és közben senki sem iszik. A víz pedig egyre fogy.',
    'Ekkor Makkos kaparni kezd egy dűne tövében: a homok nedves! Itt egy új forrás. Kutat ásni viszont csak együtt lehet: az egyik lent ás, a másik fogja a kötelet.',
  ],
  howto: 'Nyomd meg a „Fogd a kötelet!” gombot (vagy a szóközt), amikor a jel a zöld mezőben van. Minden jó fogással mélyebbre jut az ásó.',
  moral: '„A világjáró Babuktin mindig az utolsó, aki iszik. De sosem az utolsó, aki segít.”',
  friend: { e: '🐫', name: 'Zafir és Kamal' },

  async start(stage, api) {
    const B = Babuktin;
    const zafir = { e: '👳', name: 'Zafir' };
    const kamal = { e: '🧔‍♂️', name: 'Kamal' };

    await api.talk([
      [zafir, 'Ez az én kutam! Én találtam meg először!'],
      [kamal, 'Hazudsz! Én jártam itt tavaly!'],
    ]);
    await api.choice(B.cast.babuktin, 'A tevék szomjasak, de senki sem iszik. Mit mondjon Babuktin?', [
      { text: '„Leülünk beszélni?”', ok: true },
      { text: '„Aki erősebb, azé a kút!”', reply: 'Így csak még nagyobb lenne a veszekedés.' },
      { text: '„Akkor az enyém a kút!”', reply: 'Babuktin nem elvenni jött, hanem segíteni.' },
    ]);
    await api.talk([
      [B.cast.babuktin, 'Nézzék: a víz szintje nagyon alacsony. Mindketten titokban hordókba merik, amikor a másik nem látja. Így hamarosan kiszárad!'],
      [B.cast.makkos, 'Mek! (Makkos kaparni kezd egy dűne tövében. A homok nedves!)'],
      [B.cast.babuktin, 'Makkos vizet talált! De kutat ásni senki sem tud egyedül. Aki lent van, az a másik kezére bízza magát.'],
      [kamal, 'Nem engedlek el, Zafir. Esküszöm.'],
    ]);

    stage.innerHTML =
      '<div class="well">' +
      '  <div class="well-pit"><div class="well-hole"><span class="emoji digger">👳</span><div class="water"></div></div></div>' +
      '  <div class="well-side">' +
      '    <p class="well-who"></p>' +
      '    <div class="meter"><div class="meter-zone"></div><div class="meter-mark"></div></div>' +
      '    <button type="button" class="btn btn-primary big-btn grab">Fogd a kötelet! 🪢</button>' +
      '    <p class="well-depth"></p>' +
      '  </div>' +
      '</div>';
    const hole = stage.querySelector('.well-hole');
    const digger = stage.querySelector('.digger');
    const who = stage.querySelector('.well-who');
    const zone = stage.querySelector('.meter-zone');
    const mark = stage.querySelector('.meter-mark');
    const water = stage.querySelector('.water');
    const depthText = stage.querySelector('.well-depth');
    const grab = stage.querySelector('.grab');

    const GOAL = 8;
    let depth = 0, pos = 0, dir = 1, speed = 0.7, zoneW = 0.26, zoneX = 0.37, cooldown = 0, done = false;
    function setRoles() {
      const zafirDigs = depth < GOAL / 2;
      digger.textContent = zafirDigs ? '👳' : '🧔‍♂️';
      who.textContent = zafirDigs ? 'Zafir ás, Kamal tartja a kötelet.' : 'Most Kamal ás, Zafir tartja a kötelet!';
    }
    function placeZone() {
      zoneX = B.rand(0.08, 0.92 - zoneW);
      zone.style.left = zoneX * 100 + '%';
      zone.style.width = zoneW * 100 + '%';
    }
    function render() {
      hole.style.height = 18 + depth * 9 + '%';
      depthText.textContent = 'Mélység: ' + depth + ' / ' + GOAL + ' ásónyom';
      api.hud('⛏️ ' + depth + '/' + GOAL);
    }
    setRoles(); placeZone(); render();

    function tryGrab() {
      if (done || cooldown > 0) return;
      cooldown = 0.35;
      if (pos >= zoneX && pos <= zoneX + zoneW) {
        depth++;
        B.noise(0.18, 500, 0.4);
        B.sfx.good();
        render();
        if (depth === GOAL / 2) {
          api.toast('Zafir elfáradt. Cseréljetek!');
          speed += 0.15;
        } else {
          api.toast(B.pick(['Erősen tartja!', 'Mélyebbre!', 'Szép munka!', 'A kötél feszes!']));
        }
        setRoles();
        zoneW = Math.max(0.16, zoneW - 0.012);
        speed += 0.05;
        placeZone();
        if (depth >= GOAL) finish();
      } else {
        B.sfx.bad();
        B.shake(stage.querySelector('.well-pit'));
        api.toast('A homok megcsúszott! De a társ nem engedte el a kötelet.');
      }
    }
    grab.addEventListener('pointerdown', (e) => { e.preventDefault(); tryGrab(); });
    api.on(window, 'keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); tryGrab(); } });

    api.loop((dt) => {
      cooldown = Math.max(0, cooldown - dt);
      if (done) return false;
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; }
      if (pos < 0) { pos = 0; dir = 1; }
      mark.style.left = pos * 100 + '%';
    });

    async function finish() {
      done = true;
      grab.disabled = true;
      who.textContent = 'Víz! Ezüstösen bugyog fel a gödör aljáról!';
      water.classList.add('up');
      B.sfx.splash();
      await api.wait(1600);
      await api.talk([
        [kamal, 'Víz! Zafir, víz!'],
        [zafir, 'Látom! Gyere fel! … Tudod, most két kutunk van. És egy barátom.'],
      ]);
      await api.choice(B.cast.babuktin, 'Végre lehet inni! Ki igyon elsőként?', [
        { text: 'Előbb a tevék és mindenki más, Babuktin utoljára.', ok: true },
        { text: 'Babuktin, hiszen ő segített!', reply: '„A világjáró Babuktin mindig az utolsó, aki iszik.”' },
        { text: 'Aki gyorsabban odaér.', reply: 'Akkor kezdődne elölről a veszekedés!' },
      ]);
      await api.say(B.cast.narrator, 'Aznap este a két kereskedő együtt törölte le a homokba húzott vonalat, és a tevék végre ihattak.', 'Vége ⭐');
      api.win();
    }
  },
});
