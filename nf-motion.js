/* ═══════════════════════════════════════════════════════════════════════
   NobleFrame — Bewegung und Bedienung

   Eine Datei statt vier. Ersetzt nf-interactions.js (Cursor-Aura,
   Klick-Schockwellen, magnetische Knöpfe), nf-tech.js (Lenis, Vanta),
   nf-shader.js (WebGL-Akzent) und cinematic-engine.js (Canvas-Intro).

   Was davon zurückkommt: nichts. Das waren Schichten über dem Inhalt, die
   Rechenzeit gekostet und nichts erklärt haben. Was bleibt, tut etwas:

     1. Dienst        Service Worker, Bewegungs-Flag
     2. Rahmen        Navigation, Mobilmenü
     3. Lauf          Reveals, Staggers, Linien, Zähler
     4. Licht         Hell/Dunkel, gemerkt
     5. Sprung        Befehlsleiste (⌘K) — jede Seite, jedes Projekt
     6. Register      Vorschau folgt der Auswahl

   Jeder Baustein prüft selbst, ob sein DOM existiert. Eine Seite ohne
   Register lädt dieselbe Datei und überspringt Punkt 6.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const doc = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ── 1. Dienst ────────────────────────────────────────────────────────
     Relativ registrieren, nicht '/service-worker.js': der Pfad bestimmt
     den Scope, absolut zeigt er immer auf den Domain-Root — auch wenn die
     Seite unter einem Unterpfad liegt. */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  /* Erst wenn dieses Attribut steht, bekommen .reveal & Co. ihren
     Startzustand. Fällt das Skript aus, bleibt die Seite sichtbar. */
  doc.setAttribute('data-motion', '');


  /* ── 2. Rahmen ───────────────────────────────────────────────────────── */
  const nav = $('.nav-wrapper');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      nav.classList.toggle('scrolled', scrollY > 8);
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  const toggle = $('.nav-toggle');
  const menu = $('.mobile-menu');
  if (toggle && menu) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const first = $('a, button', menu);
        if (first) first.focus({ preventScroll: true });
      }
    };
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', menu.id || 'mobileMenu');
    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    // Beim Wechsel auf Desktop-Breite darf kein gesperrter Body zurückbleiben.
    matchMedia('(min-width: 981px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }


  /* ── 3. Lauf ──────────────────────────────────────────────────────────
     Ein Observer für alles. Elemente werden nach dem Auslösen abgemeldet:
     ein Reveal ist ein Ereignis, kein Zustand, der laufend geprüft wird. */
  const seen = new WeakSet();
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || seen.has(en.target)) return;
          seen.add(en.target);
          // `in` gehoert dem neuen System, `visible` den Seiten, die ihr
          // eigenes Reveal-CSS behalten haben. Beide zu setzen ist billiger
          // als 380 Klassennamen umzuschreiben.
          en.target.classList.add('in', 'visible');
          if (en.target.hasAttribute('data-count')) countUp(en.target);
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })
    : null;

  const watch = (el) => { if (io) io.observe(el); else el.classList.add('in'); };
  $$('.reveal, .reveal-stagger, [data-stagger], .draw, [data-count]').forEach(watch);

  /* Zähler. Läuft über eine feste Dauer statt über Frames, damit ein
     langsames Gerät nicht länger zählt als ein schnelles. */
  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    if (!isFinite(target)) return;
    const dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduced.matches) { el.textContent = target.toFixed(dec) + suffix; return; }

    const dur = 900;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Lesefortschritt: eine Haarlinie unter der Navigation. Kein Balken,
     keine Farbe außer Signal. */
  const bar = document.createElement('div');
  bar.className = 'nf-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let barTick = false;
  const paintBar = () => {
    barTick = false;
    const max = Math.max(doc.scrollHeight - innerHeight, 1);
    bar.style.transform = 'scaleX(' + Math.min(scrollY / max, 1).toFixed(4) + ')';
  };
  addEventListener('scroll', () => {
    if (!barTick) { barTick = true; requestAnimationFrame(paintBar); }
  }, { passive: true });
  paintBar();


  /* ── 4. Licht ─────────────────────────────────────────────────────────
     Die Seite folgt dem System, bis jemand widerspricht. Der Widerspruch
     wird gemerkt; ohne ihn steht kein Attribut und `prefers-color-scheme`
     entscheidet weiter. */
  const THEME_KEY = 'nf-theme';
  const applyTheme = (v) => {
    if (v === 'light' || v === 'dark') doc.setAttribute('data-theme', v);
    else doc.removeAttribute('data-theme');
  };
  let stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (_) { /* Privatmodus */ }
  applyTheme(stored);

  const currentTheme = () =>
    doc.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  $$('[data-theme-toggle]').forEach((btn) => {
    const sync = () => {
      const dark = currentTheme() === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Zu hellem Design wechseln' : 'Zu dunklem Design wechseln');
    };
    sync();
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) { /* egal */ }
      $$('[data-theme-toggle]').forEach((b) => b.dispatchEvent(new Event('nf:sync')));
    });
    btn.addEventListener('nf:sync', sync);
  });


  /* ── 4b. Newsletter ───────────────────────────────────────────────────
     Steht in jeder Fußzeile und wird hier einmal bedient. Vorher trug
     jede Seite eine eigene Kopie dieses Handlers.

     Die Anmeldung läuft über mailto: — das ist keine Notlösung, sondern
     die Folge der Regel, dass zur Laufzeit kein Drittanbieter eingebunden
     wird. Der Besucher sieht, was er absendet, und an wen. */
  const news = $('#newsletterForm');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = $('#newsletterMessage');
      const mail = news.querySelector('input[name="email"]');
      const ok = news.querySelector('input[name="privacy"]');

      if (!mail.value || !mail.checkValidity()) {
        if (msg) { msg.textContent = 'Bitte eine gültige E-Mail-Adresse eintragen.'; msg.className = 'form-message'; }
        mail.focus();
        return;
      }
      if (ok && !ok.checked) {
        if (msg) { msg.textContent = 'Bitte der Datenschutzerklärung zustimmen.'; msg.className = 'form-message'; }
        ok.focus();
        return;
      }

      const subject = encodeURIComponent('Newsletter-Anmeldung – NobleFrame');
      const body = encodeURIComponent(
        'Newsletter-Anmeldung\nE-Mail: ' + mail.value +
        '\nDatum: ' + new Date().toLocaleString('de-DE'));
      location.href = 'mailto:info@nobleframe.de?subject=' + subject + '&body=' + body;

      if (msg) {
        msg.textContent = 'Danke — bitte die geöffnete E-Mail noch absenden.';
        msg.className = 'form-message success';
        setTimeout(() => { msg.textContent = ''; msg.className = 'form-message'; }, 6000);
      }
      news.reset();
    });
  }


  /* ── 5. Sprung — die Befehlsleiste ────────────────────────────────────
     ⌘K bzw. Strg+K, oder „/". Eine Liste aller Seiten und Projekte, nach
     Titel und Stichwort filterbar, vollständig mit der Tastatur bedienbar.

     Das Verzeichnis steht hier und nicht im HTML: es ist auf jeder Seite
     identisch, und eine Kopie pro Seite wäre wieder das Problem, das
     dieses Redesign gerade beseitigt. Die Pfade sind relativ — die Seite
     muss auch unter einem Unterpfad laufen. */
  const INDEX = [
    { t: 'Startseite',        u: 'index.html',       g: 'Seite',   k: 'home start' },
    { t: 'Showcase',          u: 'showcase.html',    g: 'Seite',   k: 'projekte arbeiten werk berichte' },
    { t: 'Leistungen',        u: 'leistungen.html',  g: 'Seite',   k: 'services angebot' },
    { t: 'Referenzen',        u: 'referenzen.html',  g: 'Seite',   k: 'kunden cases' },
    { t: 'Über uns',          u: 'about.html',       g: 'Seite',   k: 'team atelier nico tobias' },
    { t: 'Tools',             u: 'tools.html',       g: 'Seite',   k: 'rechner analyse audit' },
    { t: 'FAQ',               u: 'faq.html',         g: 'Seite',   k: 'fragen antworten' },
    { t: 'Karriere',          u: 'karriere.html',    g: 'Seite',   k: 'jobs stellen bewerbung' },
    { t: 'Kontakt',           u: 'kontakt.html',     g: 'Seite',   k: 'anfrage projekt mail telefon' },

    { t: 'OMEGA Atelier',            u: 'showcase.html#omega-atelier',        g: 'Projekt', k: 'smart home 3d grundriss planer' },
    { t: 'OMEGA OS',                 u: 'showcase.html#omega-os',             g: 'Projekt', k: 'betriebssystem desktop browser' },
    { t: 'OMEGA Phone',              u: 'showcase.html#omega-phone',          g: 'Projekt', k: 'reparatur refurbished plattform' },
    { t: 'OMEGA Phone · Produkt',    u: 'showcase.html#omega-phone-produkt',  g: 'Projekt', k: 'titan teardown keynote' },
    { t: 'Lunara',                   u: 'showcase.html#lunara',               g: 'Projekt', k: 'shop ecommerce stripe boutique' },

    { t: 'Impressum',        u: 'impressum.html',    g: 'Rechtliches', k: 'anbieter' },
    { t: 'Datenschutz',      u: 'datenschutz.html',  g: 'Rechtliches', k: 'dsgvo privacy' },
    { t: 'AGB',              u: 'agb.html',          g: 'Rechtliches', k: 'bedingungen' }
  ];

  let palette = null, input = null, list = null, items = [], cursor = 0, lastFocus = null;

  function buildPalette() {
    palette = document.createElement('div');
    palette.className = 'nf-cmd';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-modal', 'true');
    palette.setAttribute('aria-label', 'Schnellnavigation');
    palette.hidden = true;
    palette.innerHTML =
      '<div class="nf-cmd__scrim" data-close></div>' +
      '<div class="nf-cmd__box">' +
        '<div class="nf-cmd__field">' +
          '<span class="nf-cmd__prompt" aria-hidden="true">&rsaquo;</span>' +
          '<input type="text" class="nf-cmd__input" autocomplete="off" spellcheck="false" ' +
                 'aria-label="Seite oder Projekt suchen" placeholder="Seite oder Projekt…">' +
          '<kbd class="nf-cmd__kbd">esc</kbd>' +
        '</div>' +
        '<ul class="nf-cmd__list" role="listbox" aria-label="Ergebnisse"></ul>' +
        '<p class="nf-cmd__empty" hidden>Nichts gefunden.</p>' +
      '</div>';
    document.body.appendChild(palette);

    input = $('.nf-cmd__input', palette);
    list = $('.nf-cmd__list', palette);

    palette.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closePalette(); });
    input.addEventListener('input', () => render(input.value));
    input.addEventListener('keydown', onKeys);
    render('');
  }

  function score(entry, q) {
    if (!q) return 1;
    const hay = (entry.t + ' ' + entry.k + ' ' + entry.g).toLowerCase();
    const title = entry.t.toLowerCase();
    if (title.startsWith(q)) return 100;
    if (title.includes(q)) return 60;
    if (hay.includes(q)) return 30;
    // Buchstaben der Reihe nach — „oa" findet „OMEGA Atelier"
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 10 : 0;
  }

  function render(query) {
    const q = query.trim().toLowerCase();
    const hits = INDEX
      .map((e) => ({ e, s: score(e, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8);

    list.innerHTML = hits.map((r, i) =>
      '<li role="option" id="nf-cmd-o' + i + '" aria-selected="' + (i === 0) + '">' +
        '<a href="' + r.e.u + '" tabindex="-1">' +
          '<span class="nf-cmd__t">' + r.e.t + '</span>' +
          '<span class="nf-cmd__g">' + r.e.g + '</span>' +
        '</a>' +
      '</li>').join('');

    items = $$('li', list);
    cursor = 0;
    $('.nf-cmd__empty', palette).hidden = hits.length > 0;
    mark();
  }

  function mark() {
    items.forEach((li, i) => {
      const on = i === cursor;
      li.setAttribute('aria-selected', String(on));
      li.classList.toggle('on', on);
      if (on) {
        input.setAttribute('aria-activedescendant', li.id);
        li.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function onKeys(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); cursor = (cursor + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cursor = (cursor - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const a = items[cursor] && $('a', items[cursor]);
      if (a) location.href = a.getAttribute('href');
    } else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  }

  function openPalette() {
    if (!palette) buildPalette();
    lastFocus = document.activeElement;
    palette.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      palette.classList.add('on');
      input.value = '';
      render('');
      input.focus();
    });
  }

  function closePalette() {
    if (!palette || palette.hidden) return;
    palette.classList.remove('on');
    document.body.style.overflow = '';
    const done = () => { palette.hidden = true; };
    reduced.matches ? done() : setTimeout(done, 160);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  addEventListener('keydown', (e) => {
    const open = palette && !palette.hidden;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
                   document.activeElement.isContentEditable;

    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open ? closePalette() : openPalette();
    } else if (e.key === '/' && !typing && !open) {
      e.preventDefault();
      openPalette();
    }
  });

  $$('[data-cmd-open]').forEach((b) => b.addEventListener('click', openPalette));


  /* ── 6. Register — Vorschau folgt der Auswahl ─────────────────────────
     Im Showcase liegt links eine Liste, rechts eine Tafel. Zeigen oder
     Fokussieren einer Zeile tauscht das Bild. Die Tafel ist dekorativ:
     jede Zeile ist selbst ein Link auf ihren Bericht, die Vorschau ist
     eine Zugabe für die Maus. Deshalb aria-hidden. */
  const register = $('[data-register]');
  if (register) {
    const stage = $('[data-register-stage]', register);
    const rows = $$('[data-preview]', register);

    if (stage && rows.length) {
      const shots = new Map();
      rows.forEach((row) => {
        const src = row.getAttribute('data-preview');
        if (!src || shots.has(src)) return;
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        shots.set(src, img);
        stage.appendChild(img);
      });

      let active = null;
      /* `lit` nur setzen, wenn wirklich jemand auf die Zeile gezeigt hat.
         Beim ersten Aufbau zeigt die Tafel das erste Projekt, aber die
         Zeile darf nicht schon im Hover-Zustand stehen — das las sich wie
         eine Auswahl, die niemand getroffen hat. */
      const show = (src, light) => {
        if (src !== active) {
          active = src;
          shots.forEach((img, key) => img.classList.toggle('on', key === src));
        }
        if (!light) return;
        const row = rows.find((r) => r.getAttribute('data-preview') === src);
        rows.forEach((r) => r.classList.toggle('lit', r === row));
      };

      rows.forEach((row) => {
        const src = row.getAttribute('data-preview');
        row.addEventListener('pointerenter', () => show(src, true));
        row.addEventListener('focusin', () => show(src, true));
      });
      register.addEventListener('pointerleave', () => {
        rows.forEach((r) => r.classList.remove('lit'));
      });
      show(rows[0].getAttribute('data-preview'), false);
    }
  }
})();
