/* ============================================================================
   NF·BOOT — Seitenwechsel-Bootloader
   ----------------------------------------------------------------------------
   Ein leichtgewichtiger, eigenständiger Übergang für JEDEN Seitenwechsel.
   Zeigt beim Klick auf einen internen Link einen ganz kurzen, zur Zielseite
   passenden Bootloader (Rahmen-Mark · Ziel-Titel · Ladelinie) und blendet ihn
   nach der Ankunft wieder weg. Keine Abhängigkeit von der WebGL-Engine — läuft
   auf allen Seiten (Haupt-, Rechts-, Stellen- und 404-Seiten).

   Übernimmt die Portal-Rolle von nf-engine.js: setzt window.__NF_BOOT, damit
   die Engine keinen zweiten, konkurrierenden Übergang startet.
   ============================================================================ */
(function () {
  'use strict';
  if (window.__NF_BOOT) return;
  window.__NF_BOOT = true;

  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Zur Zielseite passender Titel + Unterzeile — jeder Wechsel fühlt sich
     bespoke an ("passend"). Fallback leitet den Namen aus dem Dateinamen ab. */
  var PAGES = {
    'index.html':       ['NobleFrame', 'Zurück zur Ouvertüre'],
    '':                 ['NobleFrame', 'Zurück zur Ouvertüre'],
    'leistungen.html':  ['Leistungen', 'Was wir bauen'],
    'signatur.html':    ['Signatur',   'Dein unverwechselbares Zeichen'],
    'showcase.html':    ['Showcase',   'Live begehbar'],
    'tools.html':       ['Tools',      'Analyse in Sekunden'],
    'about.html':       ['Über Uns',   'Das Atelier hinter dem Rahmen'],
    'kontakt.html':     ['Kontakt',    'Sprechen wir über Ihr Projekt'],
    'faq.html':         ['FAQ',        'Antworten, klar und direkt'],
    'karriere.html':    ['Karriere',   'Werde Teil des Ateliers'],
    'labs.html':        ['Labs',       'Hier entsteht Neues'],
    'impressum.html':   ['Impressum',  'Angaben gemäß § 5 DDG'],
    'datenschutz.html': ['Datenschutz','Ihre Daten, transparent'],
    'agb.html':         ['AGB',        'Die Rahmenbedingungen'],
    'stelle-design.html':  ['Stelle · Design',   'Design & Brand'],
    'stelle-frontend.html':['Stelle · Frontend', 'Code & Interface'],
    'stelle-projekt.html': ['Stelle · Projekt',  'Steuerung & Kunde']
  };

  function labelFor(url) {
    var name = (url.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (PAGES[name]) return PAGES[name];
    var t = name.replace(/\.html?$/, '').replace(/[-_]+/g, ' ').trim();
    if (!t) return ['NobleFrame', ''];
    t = t.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return [t, ''];
  }

  /* ------------------------------------------------------------------ Style */
  var css = '' +
    '.nfb{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;' +
      'background:#000;pointer-events:none;opacity:0;visibility:hidden}' +
    '.nfb.on{visibility:visible;pointer-events:auto;opacity:1}' +
    '.nfb-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,transparent 52%,rgba(0,0,0,.6) 100%)}' +
    '.nfb-grain{position:absolute;inset:0;opacity:.05;mix-blend-mode:screen;' +
      'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'2\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")}' +
    /* Letterbox-Balken — Kino-Anmutung */
    '.nfb-bar{position:absolute;left:0;width:100%;height:50%;background:#010101;transition:transform .5s cubic-bezier(.76,0,.24,1)}' +
    '.nfb-bar-t{top:0;transform:translateY(-101%);border-bottom:1px solid rgba(201,169,98,.32)}' +
    '.nfb-bar-b{bottom:0;transform:translateY(101%);border-top:1px solid rgba(201,169,98,.32)}' +
    '.nfb.closed .nfb-bar-t,.nfb.closed .nfb-bar-b{transform:translateY(0)}' +
    '.nfb-core{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;' +
      'gap:20px;padding:0 24px;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .4s ease,transform .4s ease}' +
    '.nfb.closed .nfb-core{opacity:1;transform:none;transition-delay:.14s}' +
    '.nfb-mark{position:relative;width:60px;height:60px}' +
    '.nfb-mark svg{width:100%;height:100%;display:block}' +
    '.nfb-mark rect,.nfb-mark line{stroke:#C9A962;fill:none}' +
    '.nfb-ring{position:absolute;inset:-11px;border:1px solid rgba(201,169,98,.28);border-radius:50%;' +
      'border-top-color:rgba(232,213,163,.9);animation:nfbSpin 1.15s linear infinite}' +
    '@keyframes nfbSpin{to{transform:rotate(360deg)}}' +
    '.nfb-label{font-family:"Cormorant Garamond",Georgia,serif;font-weight:500;' +
      'font-size:clamp(1.7rem,6.2vw,2.7rem);line-height:1;letter-spacing:.12em;text-transform:uppercase;' +
      'background:linear-gradient(108deg,#8B7355,#C9A962 32%,#F6EAC8 50%,#C9A962 68%,#8B7355);' +
      '-webkit-background-clip:text;background-clip:text;color:transparent}' +
    '.nfb-sub{font-family:"Outfit",system-ui,sans-serif;font-size:clamp(.6rem,2.4vw,.72rem);' +
      'letter-spacing:.34em;text-transform:uppercase;color:rgba(250,250,250,.62)}' +
    '.nfb-track{position:relative;width:min(240px,58vw);height:1px;background:rgba(201,169,98,.16);overflow:hidden;margin-top:4px}' +
    '.nfb-fill{position:absolute;inset:0;transform-origin:left;transform:scaleX(0);' +
      'background:linear-gradient(90deg,#8B7355,#E8D5A3,#C9A962);transition:transform .52s cubic-bezier(.4,0,.2,1)}' +
    '.nfb.go .nfb-fill{transform:scaleX(1)}' +
    '.nfb-code{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:.54rem;letter-spacing:.24em;' +
      'text-transform:uppercase;color:rgba(201,169,98,.5)}' +
    '.nfb-reveal{transition:opacity .45s ease,visibility .45s ease}' +
    '@media (prefers-reduced-motion:reduce){' +
      '.nfb,.nfb *{transition:none!important;animation:none!important}' +
      '.nfb.on{opacity:1}.nfb-ring{display:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  /* ------------------------------------------------------------------- DOM */
  var el = document.createElement('div');
  el.className = 'nfb';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="nfb-vig"></div><div class="nfb-grain"></div>' +
    '<div class="nfb-bar nfb-bar-t"></div><div class="nfb-bar nfb-bar-b"></div>' +
    '<div class="nfb-core">' +
      '<div class="nfb-mark">' +
        '<svg viewBox="0 0 100 100" aria-hidden="true">' +
          '<rect x="5" y="5" width="90" height="90" stroke-width="2"/>' +
          '<rect x="27" y="27" width="46" height="46" stroke-width="1.4" opacity=".6"/>' +
          '<line x1="50" y1="5" x2="50" y2="95" stroke-width=".6" opacity=".4"/>' +
          '<line x1="5" y1="50" x2="95" y2="50" stroke-width=".6" opacity=".4"/>' +
        '</svg><span class="nfb-ring"></span>' +
      '</div>' +
      '<div class="nfb-label" data-nfb-label>NobleFrame</div>' +
      '<div class="nfb-sub" data-nfb-sub></div>' +
      '<div class="nfb-track"><div class="nfb-fill"></div></div>' +
      '<div class="nfb-code" data-nfb-code>NF · TRANSMISSION</div>' +
    '</div>';

  function mount() {
    if (!el.parentNode && document.body) document.body.appendChild(el);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  var lblEl = el.querySelector('[data-nfb-label]');
  var subEl = el.querySelector('[data-nfb-sub]');
  var codeEl = el.querySelector('[data-nfb-code]');
  var busy = false;

  /* ------------------------------------------------------------------ Exit */
  function exitTo(href, meta) {
    if (busy) return;
    busy = true;
    lblEl.textContent = meta[0];
    subEl.textContent = meta[1] || '';
    codeEl.textContent = 'NF · LADE — ' + (meta[0] || '').toUpperCase();
    try { sessionStorage.setItem('nf_boot', String(Date.now())); } catch (e) {}

    mount();
    el.classList.add('on');
    if (REDUCED) { location.href = href; return; }
    void el.offsetWidth;
    el.classList.add('closed');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('go'); });
    });
    setTimeout(function () { location.href = href; }, 640);
  }

  /* -------------------------------------------------------------- Ankunft */
  function arrive() {
    var t = 0;
    try { t = +sessionStorage.getItem('nf_boot') || 0; sessionStorage.removeItem('nf_boot'); } catch (e) {}
    if (!t || Date.now() - t > 8000) return;
    // Auf der Startseite übernimmt das Kino-Intro den Reveal — nicht doppeln.
    if (document.getElementById('cineIntro')) return;
    if (REDUCED) return;

    mount();
    el.classList.add('on', 'closed', 'go');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('nfb-reveal');
        el.classList.remove('closed');
        el.style.opacity = '0';
        setTimeout(function () {
          el.classList.remove('on', 'go', 'nfb-reveal');
          el.style.opacity = '';
        }, 520);
      });
    });
  }

  /* -------------------------------------------------------------- Klicks */
  function onClick(e) {
    if (e.defaultPrevented || busy) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (a.hasAttribute('data-noboot')) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || /^(mailto:|tel:|#|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && (url.hash || url.search === location.search)) return;
    if (!/(\.html?$|\/$)/i.test(url.pathname)) return;
    e.preventDefault();
    exitTo(url.href, labelFor(url));
  }

  document.addEventListener('click', onClick);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { busy = false; el.classList.remove('on', 'closed', 'go', 'nfb-reveal'); el.style.opacity = ''; }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrive);
  else arrive();
})();
