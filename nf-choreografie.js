/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame Choreografie — die Scrollstrecke

   Diese Schicht macht aus einer Abfolge von Sektionen eine Fahrt. Sie nutzt
   die Motoren, die ohnehin an Bord sind — Lenis fuer den Scrollstrom,
   die vorhandene WebGL-Ebene fuer die Atmosphaere — und fuegt das hinzu,
   was zwischen ihnen fehlte: eine Dramaturgie.

   Sechs Bausteine:

   1. Marken & Masken   — Sektionskoordinaten und Ueberschriften, die aus
                          ihrer eigenen Kante aufsteigen (IntersectionObserver)
   2. Wort-Scrub        — ein Satz, der sich beim Lesen aufhellt
   3. Horizontalfahrt   — gepinnte Buehne, Bahn 1:1 am Scroll, Bilder mit
                          Gegenversatz
   4. Laufband          — Grunddrift plus Scrollgeschwindigkeit, mit Vorzeichen
   5. Rollentext        — Beschriftungen werden getauscht, nicht aufgehellt
   6. Zaehlwerk & Fahrtanzeige — Zahlen laufen hoch, der Stand steht rechts unten

   Warum genau ein rAF-Loop: jeder zusaetzliche Loop ist ein zweiter
   Taktgeber, der gegen den ersten laeuft. Hier lesen alle scrollabhaengigen
   Teile denselben Frame und schreiben in derselben Phase — Lesen zuerst,
   Schreiben danach, kein erzwungenes Reflow-Pingpong.

   Der Loop laeuft nur, wenn er etwas zu tun hat: er stoppt bei verstecktem
   Tab und wenn kein scrollabhaengiges Element im Blick ist.

   Ausfallverhalten: Ohne JavaScript oder bei einem Fehler in dieser Datei
   bleibt html.nf-choreo aus — dann versteckt kein Stylesheet etwas, die
   Bahn ist eine Liste, der Satz steht voll da. Bei prefers-reduced-motion
   wird zusaetzlich html.nf-statisch gesetzt: dasselbe Markup, kein Transport.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const wurzel = document.documentElement;
  const reduziert = matchMedia('(prefers-reduced-motion: reduce)').matches;

  wurzel.classList.add('nf-choreo');
  if (reduziert) wurzel.classList.add('nf-statisch');

  /* ── Werkzeug ───────────────────────────────────────────────────────── */
  const klemme = (v, a, b) => v < a ? a : (v > b ? b : v);
  const alle = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* Ein Beobachter fuer alles, was beim Eintritt genau einmal etwas tut.
     Ein zweiter Observer waere kein zweiter Gedanke, nur ein zweiter
     Callback im selben Frame. */
  const eintritt = new IntersectionObserver((eintraege) => {
    eintraege.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const fn = e.target.__nfEintritt;
      if (fn) { fn(); e.target.__nfEintritt = null; }
      eintritt.unobserve(e.target);
    });
  }, { threshold: .2, rootMargin: '0px 0px -6% 0px' });

  /* ═══ 1. Marken & Masken ══════════════════════════════════════════════ */
  alle('.nf-marke').forEach((el) => eintritt.observe(el));

  /* Der Hero steigt maskiert auf. Ausgeloest hat das frueher der Lader in
     nf-dreher.js — der ist entfallen, seit nf-buehne.js den Vorhang fuehrt,
     und damit stand die Ueberschrift dauerhaft 110 % nach unten verschoben
     hinter ihrer eigenen Maske: drei unsichtbare Zeilen, kein Fehler in der
     Konsole. Der Beobachter hier haengt an nichts, was wegfallen kann. */
  alle('.nf-hero').forEach((el) => eintritt.observe(el));

  /* Die warmen Register-Zeilen wischen von oben herein.

     Beobachtet wird der Container, nicht die Zeile — und das ist keine
     Bequemlichkeit, sondern die Aufloesung einer Sackgasse:

     Die Zeilen stehen vor ihrem Auftritt auf clip-path: inset(0 0 100% 0),
     also auf Nullhoehe. In Chromium geht dieses Clipping in die
     Intersection-Rechnung ein: das Element meldet ratio 0 und
     isIntersecting false, dauerhaft. Ein Element, das sich selbst auf null
     klippt, kann den Beobachter, der es aufdecken soll, nie ausloesen. Der
     Aufdeckmechanismus haengt an einer Beobachtung, die sein eigener
     Ausgangszustand verhindert — gemessen: die eine Zeile, der man das
     clip-path nimmt, meldet sofort ratio 1, die drei anderen bleiben bei 0.

     Der Container klippt sich nicht und wird deshalb normal gemeldet. Er
     deckt dann alle Zeilen auf einmal auf; die Staffelung liegt als
     transition-delay im Stil, nicht als Kette von Zeitgebern. */
  alle('[data-nf-baender]').forEach((wirt) => {
    const zeilen = alle('.nf-band', wirt);
    if (!zeilen.length) return;
    zeilen.forEach((el, i) => { el.style.transitionDelay = (i * 0.12).toFixed(2) + 's'; });
    wirt.__nfEintritt = () => zeilen.forEach((el) => el.classList.add('in'));
    eintritt.observe(wirt);
  });

  /* Die Ueberschrift wird nicht ersetzt, sondern eingepackt: ihre inneren
     Auszeichnungen (das goldene <span>) bleiben unangetastet. */
  alle('[data-nf-maske]').forEach((el) => {
    const innen = document.createElement('span');
    innen.className = 'nf-maske-i';
    while (el.firstChild) innen.appendChild(el.firstChild);
    el.appendChild(innen);
    el.classList.add('nf-maske');
    eintritt.observe(el);
  });

  /* ═══ 1b. Sucherrahmen ════════════════════════════════════════════════
     Vier Haarlinien-Ecken, die nur ueber den dunklen Abschnitten stehen —
     der Kinosequenz und dem Feld. Dort ist der Blick ein Sucher. Auf
     Cream waere derselbe Rahmen eine Verzierung, deshalb geht er dort aus.

     Ein eigener Beobachter, weil dieser mehrfach schaltet: der obige
     meldet jedes Ziel genau einmal und gibt es dann frei. */
  const rahmenEl = document.getElementById('nfRahmen');
  /* Frueher stand hier .cine-wrap — die Kinosequenz gibt es nicht mehr.
     Der Rahmen haengt jetzt am Farbbogen selbst: jeder Abschnitt, der sich
     als tief ausweist, bekommt ihn, und neue brauchen keine Codeaenderung.

     Gemessen statt beobachtet, und das ist eine Korrektur: hier stand ein
     IntersectionObserver mit threshold .35 — 35 % des Abschnitts muessen
     im Bild sein. Fuer die Abschnitte, um die es geht, ist diese Bedingung
     unerfuellbar. Die Bahn der laufenden Systeme ist gepinnt und damit
     rund 5.000 px hoch; in ein 900 px hohes Fenster passen davon nie mehr
     als 18 %. Der Rahmen ging ueber dem groessten dunklen Abschnitt der
     Seite also nie an, und nichts schlug fehl — der Beobachter meldete
     korrekt, dass seine Schwelle nicht erreicht ist.

     Ein Anteil am Abschnitt ist ohnehin die falsche Frage. Gefragt ist,
     was gerade unter einer bestimmten Bildzeile liegt. Das ist ein
     Zahlenvergleich, und er stimmt bei jeder Abschnittshoehe. */
  const dunkel = alle('[data-grund="tief"], .nf-feld').map((el) => ({ el, oben: 0, unten: 0 }));
  const dunkelMessen = () => {
    dunkel.forEach((d) => {
      const r = d.el.getBoundingClientRect();
      d.oben = r.top + scrollY;
      d.unten = d.oben + r.height;
    });
  };
  /* Liegt diese Dokumentzeile auf tiefem Grund? */
  const istTief = (dokY) => {
    for (let i = 0; i < dunkel.length; i++) {
      if (dokY >= dunkel[i].oben && dokY < dunkel[i].unten) return true;
    }
    return false;
  };
  let dunkelLetzter = null, kopfLetzter = null;

  /* ═══ 2. Wort-Scrub ═══════════════════════════════════════════════════
     Der Satz wird in Woerter zerlegt. Jedes Wort bekommt ein eigenes
     Fenster auf der Scrollstrecke des Blocks, leicht gegeneinander
     versetzt — dadurch wandert die Helligkeit durch den Satz, statt ihn
     als Ganzes hochzudrehen.

     Nur Textknoten werden zerlegt: vorhandene Auszeichnungen im Satz
     bleiben als Elemente erhalten und werden mitgezaehlt. */
  const scrubs = [];
  alle('[data-nf-scrub]').forEach((block) => {
    const schluessel = (block.dataset.nfSchluessel || '')
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    const woerter = [];

    const zerlegen = (knoten) => {
      Array.from(knoten.childNodes).forEach((k) => {
        if (k.nodeType === 3) {
          const teile = k.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          teile.forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            const s = document.createElement('span');
            s.className = 'nf-wort';
            s.textContent = t;
            const nackt = t.replace(/[^\wäöüß]/gi, '').toLowerCase();
            if (schluessel.includes(nackt)) s.classList.add('nf-schluessel');
            frag.appendChild(s);
            woerter.push(s);
          });
          knoten.replaceChild(frag, k);
        } else if (k.nodeType === 1) {
          zerlegen(k);
        }
      });
    };
    zerlegen(block);
    block.classList.add('nf-scrub');
    if (woerter.length) scrubs.push({ block, woerter });
  });

  /* ═══ 3. Horizontalfahrt ══════════════════════════════════════════════
     Die Buehne klebt oben, die Bahn faehrt seitlich. Die Hoehe der
     Huelle ist keine Designentscheidung, sondern eine Rechnung: so viel
     Scrollweg, wie die Bahn Ueberhang hat — plus eine Viewporthoehe, in
     der die Buehne steht. Dadurch faehrt die Bahn 1:1 mit dem Rad, nicht
     schneller und nicht langsamer als die Hand.

     Kein Federglied dazwischen: eine Feder auf einer Scrub-Achse fuehlt
     sich nicht weich an, sondern lose. */
  const bahnen = [];
  alle('[data-nf-pin]').forEach((huelle) => {
    const bahn = huelle.querySelector('[data-nf-bahn]');
    const stand = huelle.querySelector('[data-nf-stand]');
    if (!bahn) return;
    bahnen.push({ huelle, bahn, stand, weg: 0, oben: 0, karten: alle('.live-card, .nf-endkarte', bahn) });
  });

  const bahnenMessen = () => {
    const aus = !wurzel.classList.contains('nf-choreo')
      || wurzel.classList.contains('nf-statisch')
      || innerWidth < 1025;
    bahnen.forEach((b) => {
      if (aus) {
        b.huelle.style.height = '';
        b.bahn.style.transform = '';
        b.weg = 0;
        b.karten.forEach((k) => {
          const bild = k.querySelector('.live-shot img');
          if (bild) bild.style.removeProperty('--nf-gegen');
        });
        return;
      }
      /* Nicht scrollWidth: Chromium zaehlt den rechten Innenabstand eines
         Flex-Containers nicht mit, die Bahn haette 72 px zu frueh gehalten
         und die letzte Karte waere nie ganz angekommen. Gemessen wird
         deshalb die rechte Kante der letzten Karte plus dieser Abstand.

         Vorher die Transformation zuruecksetzen — sonst misst der Rect die
         Bahn dort, wo die letzte Fahrt sie stehen liess. */
      b.bahn.style.transform = '';
      const letzte = b.bahn.lastElementChild;
      const padRechts = parseFloat(getComputedStyle(b.bahn).paddingRight) || 0;
      const inhalt = letzte
        ? (letzte.getBoundingClientRect().right - b.bahn.getBoundingClientRect().left) + padRechts
        : b.bahn.scrollWidth;
      b.weg = Math.max(0, Math.round(inhalt) - innerWidth);
      b.huelle.style.height = (b.weg + innerHeight) + 'px';
      /* offsetTop waere hier falsch: es misst gegen den offsetParent, und
         die Huelle liegt in einer positionierten Sektion — die Fahrt haette
         an der falschen Linie begonnen. Der Rect plus Scrollstand misst
         immer gegen das Dokument. Einmal hier, nicht pro Frame. */
      b.oben = b.huelle.getBoundingClientRect().top + scrollY;
    });
  };

  /* ═══ 3b. Tiefe ═══════════════════════════════════════════════════════
     Bis hierher hatte die Seite zwei Stellen, an denen Scrollen etwas
     bewegt — die Kinosequenz und die Bahn. Dazwischen blendete Inhalt
     einmal ein und stand dann still, waehrend man daran vorbeizog. Das
     ist der Unterschied zwischen einer Seite, die reagiert, und einer,
     die nur Zustaende hat.

     Diese Schicht koppelt Elemente durchgehend an den Scroll. Zwei
     Angaben genuegen:

       data-nf-tiefe="0.14"   senkrechter Versatz, Anteil der Elementhoehe
       data-nf-zug="0.5"      waagerechter Versatz, Anteil der Breite

     Das Vorzeichen ist die Tiefe: positiv zieht schneller als die Seite
     (naeher), negativ langsamer (weiter weg). Dass beide Werte relativ
     sind, ist wichtig — ein fester Pixelwert waere auf einem Telefon ein
     Sprung und auf einem grossen Schirm unsichtbar.

     Gemessen wird der Fortschritt eines Elements durch das Fenster:
     0, wenn seine Oberkante gerade unten hereinkommt, 1, wenn seine
     Unterkante oben verschwindet. Der Versatz ist darauf zentriert, damit
     jedes Element auf halber Strecke exakt dort steht, wo es im Layout
     steht — sonst verschoebe die Tiefe das Design statt es zu beleben. */
  const tiefen = [];
  alle('[data-nf-tiefe], [data-nf-zug]').forEach((el) => {
    tiefen.push({
      el,
      y: parseFloat(el.dataset.nfTiefe) || 0,
      x: parseFloat(el.dataset.nfZug) || 0
    });
  });

  /* ═══ 4. Laufband ═════════════════════════════════════════════════════
     Das Band braucht doppelten Inhalt, damit der Ruecksprung an der
     Nahtstelle unsichtbar ist. Verdoppelt wird einmal, nicht pro Frame. */
  const baender = [];
  if (!reduziert) {
    alle('[data-nf-laufband]').forEach((spur) => {
      const original = spur.innerHTML;
      spur.innerHTML = original + original;
      spur.setAttribute('aria-hidden', 'false');
      baender.push({ spur, x: 0, breite: 0 });
    });
  }
  const baenderMessen = () => {
    baender.forEach((b) => { b.breite = b.spur.scrollWidth / 2; });
  };

  /* ═══ 5. Rollentext ═══════════════════════════════════════════════════
     Nur reine Textbeschriftungen: sobald ein Link ein Icon oder eigene
     Auszeichnung enthaelt, bliebe von der zweiten Zeile ein leerer
     Kasten stehen. Solche Links behalten ihr bisheriges Verhalten. */
  alle('[data-nf-roll]').forEach((el) => {
    const text = el.textContent.trim();
    if (!text || el.children.length) return;
    el.textContent = '';
    const maske = document.createElement('span');
    maske.className = 'nf-roll';
    const a = document.createElement('span');
    a.className = 'nf-roll-a';
    a.textContent = text;
    const b = document.createElement('span');
    b.className = 'nf-roll-b';
    b.textContent = text;
    b.setAttribute('aria-hidden', 'true');
    maske.appendChild(a);
    maske.appendChild(b);
    el.appendChild(maske);
  });

  /* ═══ 6. Zaehlwerk ════════════════════════════════════════════════════
     Zahlen laufen einmal hoch, wenn sie in den Blick kommen. Gezaehlt
     wird nur, was auch eine Zahl ist — „Headless" bleibt „Headless".
     Die Breite ist vorher reserviert, damit das Layout beim Zaehlen
     nicht springt. */
  if (!reduziert) {
    alle('[data-nf-zaehl]').forEach((el) => {
      const roh = el.textContent.trim().replace(/\./g, '').replace(',', '.');
      const ziel = parseFloat(roh);
      if (!isFinite(ziel) || ziel <= 0) return;
      const nachkomma = (roh.split('.')[1] || '').length;
      const fmt = new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma
      });
      const endtext = el.textContent;
      el.style.display = 'inline-block';
      el.style.minWidth = el.getBoundingClientRect().width + 'px';
      el.__nfEintritt = () => {
        const start = performance.now();
        const dauer = 1100;
        const tick = (jetzt) => {
          const t = klemme((jetzt - start) / dauer, 0, 1);
          const e = 1 - Math.pow(1 - t, 4); // easeOutQuart
          el.textContent = t < 1 ? fmt.format(ziel * e) : endtext;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      eintritt.observe(el);
    });
  }

  /* ═══ 7. Kapitelwerk ══════════════════════════════════════════════════
     Bis hierher sagte die Seite an zwei Stellen, wo man ist: die Marke am
     Kopf jedes Abschnitts und die Fahrtanzeige unten rechts. Beide waren
     unvollstaendig. Die Marken trugen ihre Nummer von Hand — und liefen
     auseinander: „Sek. 01" stand ueber dem Auftakt und ueber „Wer wir
     sind", „Sek. 05" ueber dem Feld und ueber den Erfolgsgeschichten,
     „Sek. 06" gleich dreimal. Die Anzeige wiederum zaehlte Prozent des
     Dokuments, also eine Zahl ohne Ort, und ging ueber jedem dunklen
     Abschnitt aus — ausgerechnet ueber dem groessten der Seite.

     Beides ersetzt eine Fuehrung: die Kapitel stehen als Leiste am Rand,
     das laufende ist benannt, der Weg dahin gefuellt. Damit ist Scrollen
     eine Fahrt mit Stationen statt eine Folge von Abschnitten.

     Die Nummer schreibt diese Datei, nicht die Hand. Im Markup steht sie
     weiterhin — als Fassung fuer den Fall ohne JavaScript — aber die
     Reihenfolge im Dokument entscheidet. Zwei Kapitel koennen deshalb
     nicht wieder dieselbe Nummer tragen.

     Kein eigener rAF-Loop: die Leiste haengt am Takt weiter unten. Ein
     zweiter Taktgeber waere genau der Fehler, den der Kopf dieser Datei
     beschreibt. */
  const kapitel = alle('[data-nf-kapitel]').map((marke, i) => {
    const abschnitt = marke.closest('section, header, footer') || marke.parentElement;
    const name = (marke.dataset.nfKapitel || '').trim();
    const nr = String(i + 1).padStart(2, '0');
    /* Die erste Spalte der Marke traegt Nummer und Namen. */
    const feld = marke.querySelector('span');
    if (feld) feld.textContent = 'Sek. ' + nr + ' — ' + name;
    if (!abschnitt.id) abschnitt.id = 'sek-' + nr;
    return { abschnitt, name, nr, oben: 0, unten: 1 };
  });

  /* Der Auftakt nennt die Gesamtzahl. Sie stand als „06" im Text, waehrend
     es sechs, dann acht, dann neun Kapitel waren — eine Zahl, die bei jeder
     neuen Sektion falsch wird, gehoert nicht ins Markup. */
  const auftakt = document.querySelector('[data-nf-auftakt]');
  if (auftakt && kapitel.length) {
    auftakt.textContent = auftakt.textContent.replace(/\/\s*\d+/, '/ ' + String(kapitel.length).padStart(2, '0'));
  }

  let leisteFuell = null, leisteStriche = [], leisteStand = -1;
  if (kapitel.length > 1) {
    const nav = document.createElement('nav');
    nav.className = 'nf-leiste';
    nav.setAttribute('aria-label', 'Kapitel dieser Seite');
    const liste = document.createElement('ol');
    /* Die Fuellung liegt hinter den Strichen und zeigt den zurueckgelegten
       Weg — dieselbe Aussage, die die Prozentzahl vorher hatte, nur an
       einem Ort, an dem sie etwas bedeutet. */
    const spur = document.createElement('i');
    spur.className = 'nf-leiste-spur';
    spur.setAttribute('aria-hidden', 'true');
    leisteFuell = document.createElement('b');
    spur.appendChild(leisteFuell);
    nav.appendChild(spur);

    kapitel.forEach((k) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + k.abschnitt.id;
      a.innerHTML = '<span class="nf-leiste-nr">' + k.nr + '</span>'
        + '<span class="nf-leiste-name"></span>'
        + '<span class="nf-leiste-strich" aria-hidden="true"></span>';
      a.querySelector('.nf-leiste-name').textContent = k.name;
      li.appendChild(a);
      liste.appendChild(li);
      leisteStriche.push(a);
    });
    nav.appendChild(liste);
    document.body.appendChild(nav);
  }

  const kapitelMessen = () => {
    kapitel.forEach((k) => {
      const r = k.abschnitt.getBoundingClientRect();
      k.oben = r.top + scrollY;
      k.unten = k.oben + r.height;
    });
    /* Die Leiste ist fixiert: die Bildzeile jedes Eintrags steht fest und
       wird einmal je Messung bestimmt, nicht je Frame. */
    leisteStriche.forEach((a) => {
      const r = a.getBoundingClientRect();
      a.__nfMitte = r.top + r.height / 2;
    });
  };

  /* ═══ Der Loop ════════════════════════════════════════════════════════
     Eine Runde: erst alles lesen, dann alles schreiben. Dazwischen wird
     nichts abgefragt, was das Layout neu berechnen liesse. */
  let laeuft = false;
  let letzterFrame = 0;

  const rahmen = (jetzt) => {
    if (document.hidden) { laeuft = false; return; }
    const dt = letzterFrame ? klemme((jetzt - letzterFrame) / 1000, 0, .05) : .016;
    letzterFrame = jetzt;

    /* ── Lesen ── */
    const y = scrollY;
    const hoehe = innerHeight;
    const dok = document.documentElement.scrollHeight - hoehe;
    /* Lenis fuehrt bereits eine geglaettete Geschwindigkeit mit — die
       nochmal selbst zu messen hiesse, zwei Wahrheiten ueber dieselbe
       Bewegung zu haben. */
    const tempo = (window.__nfLenis && window.__nfLenis.velocity) || 0;

    /* ── Schreiben ── */

    // Wort-Scrub
    for (let i = 0; i < scrubs.length; i++) {
      const s = scrubs[i];
      const r = s.block.getBoundingClientRect();
      if (r.bottom < -200 || r.top > hoehe + 200) continue;
      /* Fenster: der Block beginnt bei 85 % Viewporthoehe zu leuchten und
         ist bei 45 % durch — der Satz ist also fertig, bevor er den
         oberen Rand erreicht, und nicht erst danach. */
      const start = hoehe * .85;
      const ende = hoehe * .45;
      const p = klemme((start - r.top) / Math.max(1, (start - ende) + r.height * .6), 0, 1);
      const n = s.woerter.length;
      for (let j = 0; j < n; j++) {
        const w = s.woerter[j];
        const eigen = klemme((p * (n + 6) - j) / 5, 0, 1);
        w.style.opacity = (.16 + eigen * .84).toFixed(3);
        if (w.classList.contains('nf-schluessel')) w.classList.toggle('hell', eigen > .6);
      }
    }

    // Horizontalfahrt
    for (let i = 0; i < bahnen.length; i++) {
      const b = bahnen[i];
      if (!b.weg) continue;
      const p = klemme((y - b.oben) / b.weg, 0, 1);
      b.bahn.style.transform = 'translate3d(' + (-p * b.weg).toFixed(2) + 'px,0,0)';
      // Gegenversatz der Bilder: die Karte wird zum Fenster.
      const gegen = (p * 2 - 1) * 5;
      for (let k = 0; k < b.karten.length; k++) {
        const bild = b.karten[k].querySelector('.live-shot img');
        if (bild) bild.style.setProperty('--nf-gegen', gegen.toFixed(2) + '%');
      }
      if (b.stand) {
        const nr = Math.min(b.karten.length, Math.floor(p * b.karten.length) + 1);
        const soll = String(nr).padStart(2, '0');
        if (b.stand.textContent !== soll) b.stand.textContent = soll;
      }
    }

    // Tiefe: durchgehende Kopplung an den Scroll.
    for (let i = 0; i < tiefen.length; i++) {
      const t = tiefen[i];
      const r = t.el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > hoehe + 120) continue;
      /* -0.5 .. +0.5 ueber die gesamte Durchfahrt, 0 in der Mitte. */
      const p = ((hoehe - r.top) / (hoehe + r.height)) - 0.5;
      const dy = t.y ? (-p * t.y * r.height).toFixed(2) : 0;
      const dx = t.x ? (-p * t.x * r.width).toFixed(2) : 0;
      t.el.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
    }

    // Laufband: Grunddrift plus Scrollgeschwindigkeit mit Vorzeichen.
    for (let i = 0; i < baender.length; i++) {
      const m = baender[i];
      if (!m.breite) continue;
      const schub = klemme(tempo * 1.6, -420, 420);
      m.x -= (46 + Math.abs(schub) * .6) * dt * (schub < -60 ? -1 : 1);
      if (m.x <= -m.breite) m.x += m.breite;
      if (m.x > 0) m.x -= m.breite;
      m.spur.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
    }

    // Grund unter der Bildmitte: Rahmen und Seitenzustand.
    if (dunkel.length) {
      const imDunkeln = istTief(y + hoehe * .5);
      if (imDunkeln !== dunkelLetzter) {
        dunkelLetzter = imDunkeln;
        if (rahmenEl) rahmenEl.classList.toggle('an', imDunkeln);
        wurzel.classList.toggle('nf-dunkel', imDunkeln);
      }

      /* Der Kopf fragt nach seiner eigenen Zeile, nicht nach der Bildmitte.
         Er stand fest auf Cream, waehrend die Seite unter ihm ins Tiefe
         ging — ein heller Balken auf schwarzem Grund, an dem die Fahrt
         jedes Mal sichtbar abriss. Die Zeile ist die Unterkante des
         Kopfes: was dort liegt, liegt hinter ihm. */
      const kopfTief = istTief(y + 74);
      if (kopfTief !== kopfLetzter) {
        kopfLetzter = kopfTief;
        wurzel.classList.toggle('nf-kopf-tief', kopfTief);
      }
      /* Die Kapitelleiste steht fest im Bild und ist hoeher als der
         Abstand zweier Abschnittsgrenzen sein kann. Ein Zustand fuer die
         ganze Leiste waere an jeder Grenze fuer die Haelfte ihrer
         Eintraege falsch — dort stuenden sie dann Ink auf Void. Jeder
         Eintrag fragt deshalb nach dem Grund an seiner eigenen Zeile. */
      for (let i = 0; i < leisteStriche.length; i++) {
        const a = leisteStriche[i];
        const tief = istTief(y + a.__nfMitte);
        if (tief !== a.__nfTief) { a.__nfTief = tief; a.classList.toggle('tief', tief); }
      }
    }

    // Kapitelwerk: Fuellung stetig, Stand nur beim Wechsel.
    if (leisteFuell && dok > 0) {
      leisteFuell.style.transform = 'scaleY(' + klemme(y / dok, 0, 1).toFixed(4) + ')';
    }
    if (leisteStriche.length) {
      /* Das laufende Kapitel ist das letzte, dessen Abschnitt die
         Lesezeile schon erreicht hat. Nicht die groesste sichtbare
         Flaeche: an jeder Grenze wechselte der Stand sonst hin und her,
         solange zwei Abschnitte gleich viel Bild fuellen. */
      const zeile = y + hoehe * 0.38;
      let stand = 0;
      for (let i = 0; i < kapitel.length; i++) {
        if (kapitel[i].oben <= zeile) stand = i; else break;
      }
      /* Ueber dem Auftakt ist noch kein Kapitel erreicht. */
      if (y + hoehe * 0.38 < kapitel[0].oben) stand = -1;
      if (stand !== leisteStand) {
        if (leisteStriche[leisteStand]) {
          leisteStriche[leisteStand].classList.remove('an');
          leisteStriche[leisteStand].removeAttribute('aria-current');
        }
        if (leisteStriche[stand]) {
          leisteStriche[stand].classList.add('an');
          leisteStriche[stand].setAttribute('aria-current', 'true');
        }
        leisteStand = stand;
      }
    }

    requestAnimationFrame(rahmen);
  };

  const anwerfen = () => {
    if (laeuft || document.hidden) return;
    laeuft = true;
    letzterFrame = 0;
    requestAnimationFrame(rahmen);
  };

  /* Der Loop haengt am Scroll, nicht an der Uhr: er wird beim Scrollen
     angeworfen und laeuft weiter, solange der Tab sichtbar ist. Das
     Laufband braucht ihn ohnehin dauerhaft — es driftet auch im Stand. */
  addEventListener('scroll', anwerfen, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) anwerfen();
  });

  /* Messen erst, wenn Schriften und Bilder stehen: eine Bahn, die vor dem
     Font-Swap gemessen wurde, faehrt danach am Ziel vorbei. */
  const messen = () => { bahnenMessen(); baenderMessen(); kapitelMessen(); dunkelMessen(); };
  messen();
  addEventListener('load', messen);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(messen).catch(() => {});

  let messTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(messTimer);
    messTimer = setTimeout(messen, 150);
  }, { passive: true });

  anwerfen();
})();
