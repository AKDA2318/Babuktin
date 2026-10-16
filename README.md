# A világjáró Babuktin – mesés kalandjáték

Böngészőben futó játék 6–9 éveseknek, Széles Ákos Dániel Babuktin-meséi alapján.
Mind a 12 mese egy-egy saját minijáték. Ha az egyik megvan, kinyílik a következő,
és a végén minden barát eljön Boróka születésnapjára.

## Indítás

Nem kell semmit telepíteni. Elég megnyitni az `index.html` fájlt egy böngészőben
(Chrome, Edge, Firefox, Safari), gépen, tableten vagy telefonon.

Weboldalként is kitehető bármilyen statikus tárhelyre, például a GitHub Pages-re
(Settings → Pages → a `main` ág gyökere).

A haladást a böngésző menti el (localStorage), így minden gépen és böngészőben külön
számít. Az „Új játék” gomb elölről kezdi.

## A mesék és a játékok

| # | Mese | Játék |
|---|------|-------|
| 1 | Babuktin és az aranyóra | Úszás a víz alatt három sávban, akadályok kerülgetése |
| 2 | A tüsszentő sárkány | Hozzávalók elkapása az üsttel, utána lámpásgyújtás Hapcival |
| 3 | Henrik, a kalóz | Dallam-memória a homokba rajzolt zongorán |
| 4 | A halak tolvaja | Rejtett lábnyomok keresése, utána a tolvaj kitalálása |
| 5 | A két kút | Időzítés: a kötelet a zöld mezőben kell megfogni |
| 6 | A szégyenlős tengeri szörny | Sakkfeladvány: kagylók összeszedése a lóval |
| 7 | A falu, ahol tilos volt nevetni | Memóriakártyák nevetőpárokkal, a falu kiszíneződik |
| 8 | A Vaskalapos Varjak | Varjúcsapkodó: a vaskalapokat kell leütni |
| 9 | A kis potyautas | A nyolcas csomó végigrajzolása ujjal |
| 10 | A kincs, ami nem arany | Kertészkedés: ültetés, locsolás, szüret, Makkos elhessegetése |
| 11 | Henrik koncertje | Ritmusjáték három hangszerrel |
| 12 | Babuktin hazaér | Ki mit hozott a bulira? Párosítás, aztán gyertyagyújtás |

Minden mesében van legalább egy „Leülünk beszélni?” pillanat: a gyerek választ, mit
mondjon Babuktin. A rossz válasz nem büntet, csak kedvesen elmagyarázza, miért nem az
a jó út.

A játékban nincs vesztés: a hibának csak vicces következménye van, és újra lehet próbálni.

## Felépítés

```
index.html            képernyők: főmenü, mesetérkép, bevezető, játék, győzelem
css/style.css         közös megjelenés (színek, betűk, gombok, térkép)
css/games.css         az egyes játékok díszletei
js/engine.js          mentés, hangok (Web Audio), felolvasás, párbeszédablakok
js/app.js             képernyőváltás, feloldás, játék indítása és leállítása
js/games/01-...js     egy fájl = egy mese = egy játék
```

Új mese hozzáadása: készíts egy új fájlt a `js/games` mappában a többi mintájára
(`Babuktin.register({ id, title, short, icon, place, story, howto, moral, friend, start })`),
és vedd fel egy `<script>` sorral az `index.html`-be. A sorrendet a betöltés sorrendje adja.

## Felolvasás

Most a böngésző beépített beszédszintézisét használja (Web Speech API), ha a gépen van
magyar hang. Ilyenkor megjelenik a 🔊 gomb és a főmenüben a „Felolvasás” kapcsoló.
Windowson és Androidon általában van magyar hang, Macen és iPhone-on is letölthető
(Beállítások → Kisegítő lehetőségek → Felolvasott tartalom → Hangok).

Jobb minőséghez a szövegeket előre fel lehet venni MP3-ba, és a játék azokat játssza le:

1. **Saját hang:** a szerző vagy egy mesélő felolvassa a szövegeket. Ez a legszemélyesebb.
2. **Mesterséges intelligenciás hang:** például Azure Speech (`hu-HU-NoemiNeural`,
   `hu-HU-TamasNeural`), Google Cloud Text-to-Speech vagy ElevenLabs. Ezekkel egyszer
   elkészíthető az összes hangfájl, utána nincs több költség.
