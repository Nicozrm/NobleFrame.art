/* ============================================================================
   NOBLEFRAME ENGINE v3 „ATELIER" — „Brutale Eleganz" in Echtzeit
   ----------------------------------------------------------------------------
   Eine eigenständige, dependency-freie WebGL2-Rendering-Engine:

     · ATELIER-GALERIE          raymarchte 3D-Halle: Gold-Monumente reihen
                                sich alternierend in eigenen Lichtschächten
                                auf schwarzem Marmor mit echten Spiegelungen,
                                flankiert von einer Kolonnade, unter einer
                                Decke mit glimmenden Leuchten-Blenden;
                                die GANZE Seite ist EINE Kamerafahrt — Orbit
                                im Hero, Tracking-Shot durch die Halle beim
                                Scrollen, Triumphrahmen-Finale am CTA
                                (Maus-Look, Film Breathing, audio-reaktiv)
     · DIE AUSSTELLUNG          jede Vitrine zeigt ein anderes Werk (Rahmen,
                                Sphäre mit Orbit-Ringen, Monolith mit
                                schwebender Spitze); geschlossene Raumhülle
                                mit Wänden voller LED-Goldlinien, Kaustiken
                                glitzern in den Lichtpools, Speed-Rush-FOV
     · VITRINEN-ORBIT           die Kamera schwenkt im Zellen-Takt in einen
                                Orbit um jedes Werk und legt sich mit
                                Kran-Schräglage in die Kurven — die Welt
                                dreht sich beim Scrollen; Glasvitrinen aus
                                Messing-Gold umschließen jedes Exponat,
                                Glas-Wisch-Verzerrung bei Scroll-Tempo,
                                Museums-Plakette zeigt live das Exponat
     · CURSOR-GOLDFADEN         ein Seidenfaden aus Gold hängt am Zeiger
                                (Verlet-Kette mit Schwerkraft und Trägheit)
     · DIRECTOR'S CUT           die Seite spielt sich selbst als Kamerafahrt
                                ab (mit Score) — kein Schalter mehr, nur hinter
                                der Showcase-Live-Demo (#film); Eingabe stoppt
     · FAHRT-LETTERBOX          Kino-Balken gleiten bei Scroll-Tempo ins Bild
     · INFO-SLATES              Inhalte materialisieren beim Scrollen als
                                Glas-Tafeln im Editorial-Look; die Engine
                                dimmt ihr Licht hinter jeder Tafel — die
                                goldene Halle weicht dem Text aus
     · GPU-PARTIKEL-ENGINE      bis 300.000 Partikel via Transform Feedback,
                                Curl-Noise-Turbulenzen, Windfeld, Attraktoren
     · FLUID-SIMULATION         Stable Fluids (Advektion, Jacobi-Druck,
                                Vorticity Confinement) — Gold-Rauch, GPU-only
     · VOLUMETRIC LIGHTING      FBM-Nebel, atmosphärisches Leuchten, God Rays
                                (radiales Light-Shaft-Marching)
     · POST-PROCESSING          HDR (RGBA16F), 3-stufige Bloom-Pyramide,
                                ACES-Tonemapping, Chromatic Aberration,
                                Scroll-Motion-Blur, Lens Ghosting,
                                anamorphotische Flares, prozeduraler Lens Dirt
     · SHOCKWAVE-ENGINE         Klick → Druckwelle, Refraktion, Partikelstoß,
                                Fluid-Impuls, Kamera-Shake
     · CINEMATIC CAMERA         Dolly-Drift, Handheld-Noise, Film Breathing,
                                Rack Focus (Depth of Field auf Partikelebene)
     · KARTEN-PHYSIK            3D-Tilt mit Feder-Trägheit auf allen Karten,
                                Gold-Aura auf Primär-Buttons
     · GPU-TYPOGRAFIE           Partikel formieren den Schriftzug im Cold Open
     · PORTAL-TRANSITIONS       Letterbox-Warp mit Gold-Seam beim Seitenwechsel
     · AUDIO-REACTIVE SCORE     generativer WebAudio-Soundtrack (opt-in),
                                Analyser moduliert Bloom, Nebel & Partikel

     · LITE-MODUS               kein WebGL2? Ein Canvas-2D-Fallback übernimmt:
                                Goldstaub, Lichtschächte, Shockwaves, Letterbox,
                                Slates, Score & Director's Cut — die Show läuft
                                auf JEDEM Gerät, vom Smart-TV bis zum Alt-Handy
     · FILM-DEEP-LINK           jede-seite.html#film (oder ?film=1) startet den
                                Director's Cut von selbst — ein bloßer Link-
                                Klick genügt, die Seite spielt sich ab

   CONTENT FIRST: Im Hero läuft das volle Kino; sobald in den Inhalt
   gescrollt wird, treten Halle (18 %), Goldstaub, Nebel und Kamera-Drehung
   weit zurück — der Text ist der Star, die Engine sein Rahmen.

   Volle Power für alle: JEDER Besucher läuft auf ULTRA — kein Governor,
   keine Drosselung, keine Notabschaltung (nur echter WebGL-Context-Loss).
   Barrierefrei: prefers-reduced-motion wird respektiert — die Seite bleibt
   ruhig und inhaltsorientiert, ohne Zwangs-Film und ohne zusätzliche
   Schaltfläche.
   Debug/Testen: ?nfq=off|lite|low|med|high|ultra
   ============================================================================ */
(function () {
'use strict';

if (window.__NF_ENGINE__) return;
window.__NF_ENGINE__ = true;

var params = new URLSearchParams(location.search);
var FORCE = (params.get('nfq') || '').toLowerCase();
var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var AUTOFILM = params.get('film') === '1' || location.hash === '#film';
if (FORCE === 'off') return;
/* Barrierefrei: Wer reduced-motion gesetzt hat, bekommt eine ruhige,
   inhaltsorientierte Seite — kein Zwangs-Film und keine zusätzliche
   Schaltfläche. Der Inhalt steht ohnehin im Mittelpunkt.
   (?nfq=low|med|high|ultra bleibt als Debug-Override erhalten.) */
if (REDUCED && !FORCE) return;

/* ---------------------------------------------------------------- Styles */
var css = document.createElement('style');
css.textContent =
  '.nf-canvas{position:fixed;inset:0;width:100%;height:100%;z-index:900;pointer-events:none;mix-blend-mode:screen;opacity:0;transition:opacity 1.6s ease}' +
  '.nf-canvas.on{opacity:1}' +
  '.nf-canvas.intro{z-index:12001}' +
  '.nf-hud{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:998;font-family:"JetBrains Mono",monospace;font-size:.56rem;letter-spacing:.18em;text-transform:uppercase;color:rgba(201,169,98,.5);pointer-events:none;white-space:nowrap;opacity:0;transition:opacity 1s ease .6s}' +
  '.nf-hud.on{opacity:1}' +
  '@media(max-width:900px){.nf-hud{display:none}}' +
  '.nf-score{position:fixed;right:22px;bottom:calc(38px + env(safe-area-inset-bottom,0px));z-index:1002;background:none;border:none;border-bottom:1px solid rgba(201,169,98,.35);padding:6px 2px;font-family:"JetBrains Mono",monospace;font-size:.62rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(250,250,250,.55);cursor:pointer;transition:color .3s ease,border-color .3s ease,opacity .8s ease;opacity:0}' +
  '.nf-score.show{opacity:1}' +
  '.nf-score:hover,.nf-score:focus-visible{color:#E8D5A3;border-color:#C9A962}' +
  '.nf-score.on{color:#E8D5A3;border-color:#C9A962}' +
  '@media(max-width:768px){.nf-score{right:14px}}' +
  '.nf-portal{position:fixed;inset:0;z-index:11500;pointer-events:none;visibility:hidden}' +
  '.nf-portal.active{visibility:visible}' +
  '.nf-portal .nf-pb{position:absolute;left:0;width:100%;height:50.5%;background:#010101;transition:transform .52s cubic-bezier(.76,0,.24,1)}' +
  '.nf-portal .nf-pb-t{top:0;transform:translateY(-101%);border-bottom:1px solid rgba(201,169,98,.35)}' +
  '.nf-portal .nf-pb-b{bottom:0;transform:translateY(101%);border-top:1px solid rgba(201,169,98,.35)}' +
  '.nf-portal.closed .nf-pb-t,.nf-portal.closed .nf-pb-b{transform:translateY(0)}' +
  '.nf-portal .nf-pseam{position:absolute;top:50%;left:0;width:100%;height:2px;margin-top:-1px;background:linear-gradient(90deg,transparent 8%,#E8D5A3 50%,transparent 92%);opacity:0;transition:opacity .3s ease .25s;filter:blur(.4px)}' +
  '.nf-portal.closed .nf-pseam{opacity:.9}' +
  '.nf-portal.noanim .nf-pb,.nf-portal.noanim .nf-pseam{transition:none}' +
  'body.nf-charging{user-select:none;-webkit-user-select:none}' +
  '.nf-letter{display:inline-block;white-space:pre;will-change:transform}' +
  '.nf-portal .nf-pseam{box-shadow:0 0 34px 5px rgba(201,169,98,.4),0 0 90px 20px rgba(201,169,98,.14)}' +
  /* Während aktiver Karten-Physik übernimmt die Feder das transform komplett —
     transform-Transition raus, alle übrigen Übergänge der Seite bleiben erhalten */
  '.nf-tilting{transition:border-color .4s ease,box-shadow .5s ease,background .4s ease,opacity .4s ease!important}' +
  /* Fahrt-Letterbox: Kino-Balken gleiten bei Scroll-Tempo ins Bild */
  '.nf-lbx{position:fixed;left:0;width:100%;height:6vh;background:#010101;z-index:950;pointer-events:none;will-change:transform}' +
  '.nf-lbx-t{top:0;transform:translateY(-101%);border-bottom:1px solid rgba(201,169,98,.14)}' +
  '.nf-lbx-b{bottom:0;transform:translateY(101%);border-top:1px solid rgba(201,169,98,.14)}' +
  /* Info-Slates: Glas-Tafeln im Editorial-Look — Inhalte werden beim
     Hereinscrollen auf eine Tafel „gefasst" und dadurch über der Halle lesbar */
  '.nf-slate{position:relative;background:linear-gradient(165deg,rgba(4,4,4,.58),rgba(12,10,6,.34));' +
  '-webkit-backdrop-filter:blur(14px) saturate(1.1);backdrop-filter:blur(14px) saturate(1.1);' +
  'border:1px solid rgba(201,169,98,.13);border-top-color:rgba(201,169,98,.3);' +
  'padding:38px 46px;max-width:900px;margin-left:auto;margin-right:auto;overflow:hidden}' +
  '.nf-slate::before{content:"";position:absolute;top:-1px;left:-1px;width:20px;height:20px;' +
  'border-top:1px solid #C9A962;border-left:1px solid #C9A962;opacity:.8}' +
  '.nf-slate::after{content:"";position:absolute;inset:0;pointer-events:none;' +
  'background:linear-gradient(115deg,transparent 42%,rgba(232,213,163,.11) 50%,transparent 58%);transform:translateX(-130%)}' +
  '.nf-slate-in::after{animation:nfSweep 1.3s ease .12s both}' +
  '@keyframes nfSweep{to{transform:translateX(130%)}}' +
  '@media(max-width:768px){.nf-slate{padding:26px 20px}}' +
  /* Unterseiten-Hero: großes Top-Padding wird zu Margin, Glas umschließt nur den Inhalt */
  '.page-hero.nf-slate{max-width:900px;margin:150px auto 30px;padding:44px 46px 36px}' +
  '@media(max-width:768px){.page-hero.nf-slate{margin:110px 14px 20px;padding:30px 18px}}' +
  /* Museums-Plakette: zeigt während der Fahrt live das aktuelle Exponat */
  '.nf-plaque{position:fixed;left:22px;bottom:calc(64px + env(safe-area-inset-bottom,0px));z-index:997;' +
  'font-family:"JetBrains Mono",monospace;font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;' +
  'color:rgba(232,213,163,.78);background:linear-gradient(165deg,rgba(4,4,4,.6),rgba(12,10,6,.35));' +
  'border:1px solid rgba(201,169,98,.2);border-top-color:rgba(201,169,98,.45);padding:10px 14px;' +
  '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);pointer-events:none;' +
  'opacity:0;transform:translateY(8px);transition:opacity .6s ease,transform .6s ease}' +
  '.nf-plaque.on{opacity:1;transform:none}' +
  '@media(max-width:900px){.nf-plaque{display:none}}';
document.head.appendChild(css);

/* ------------------------------------------------------- Portal-Engine
   Reiner DOM-Layer — funktioniert auch, wenn WebGL2 fehlt. */
var Portal = (function () {
  // nf-boot.js übernimmt die Seitenwechsel-Übergänge, sobald es geladen ist —
  // dann hält sich die Portal-Engine zurück (kein doppelter Übergang).
  if (window.__NF_BOOT) return { exitTo: function (h) { location.href = h; } };
  var el = document.createElement('div');
  el.className = 'nf-portal';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<div class="nf-pb nf-pb-t"></div><div class="nf-pb nf-pb-b"></div><div class="nf-pseam"></div>';
  document.body.appendChild(el);
  var busy = false;

  function exitTo(href) {
    if (busy) return;
    busy = true;
    try { sessionStorage.setItem('nf_portal', String(Date.now())); } catch (e) {}
    el.classList.add('active');
    void el.offsetWidth;
    el.classList.add('closed');
    setTimeout(function () { location.href = href; }, 560);
  }

  function arrive() {
    var t = 0;
    try { t = +sessionStorage.getItem('nf_portal') || 0; sessionStorage.removeItem('nf_portal'); } catch (e) {}
    if (!t || Date.now() - t > 6000) return;
    // Auf der Startseite übernimmt das Kino-Intro den Reveal
    var intro = document.getElementById('cineIntro');
    var seenIntro = false;
    try { seenIntro = sessionStorage.getItem('nf_intro') === '1'; } catch (e) {}
    if (intro && !seenIntro) return;
    el.classList.add('noanim', 'active', 'closed');
    void el.offsetWidth;
    el.classList.remove('noanim');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.remove('closed');
        setTimeout(function () { el.classList.remove('active'); }, 700);
      });
    });
  }

  function onClick(e) {
    if (e.defaultPrevented || busy) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || /^(mailto:|tel:|#|javascript:)/i.test(href)) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (!/(\.html?$|\/$)/i.test(url.pathname)) return;
    e.preventDefault();
    exitTo(url.href);
  }

  document.addEventListener('click', onClick);
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { busy = false; el.classList.remove('active', 'closed'); }
  });
  arrive();
  return { exitTo: exitTo };
})();

/* --------------------------------------------------------- WebGL2 Boot */
var canvas = null, gl = null;
if (FORCE !== 'lite') {
  canvas = document.createElement('canvas');
  canvas.className = 'nf-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  try {
    gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'high-performance', preserveDrawingBuffer: false
    });
  } catch (e) { gl = null; }
}
if (!gl) {
  console.info('[NF·Engine] WebGL2 nicht verfügbar — Lite-Modus (Canvas 2D) übernimmt: die Show läuft auf jedem Gerät.');
  bootLite();
  return;
}
document.body.appendChild(canvas);

var extFloat = gl.getExtension('EXT_color_buffer_float');
var HDR = !!extFloat;                       // RGBA16F-Renderziele
var FLUID_OK = !!extFloat;                  // Fluid braucht Float-Rendering

/* ------------------------------------------------------------ Qualität */
var TIERS = [
  { name: 'LOW',   n: 24000,  fluid: 96,  scale: 0.55, rays: 16, jac: 10, sdf: false, vol: 0,  refl: 0 },
  { name: 'MED',   n: 60000,  fluid: 128, scale: 0.70, rays: 22, jac: 14, sdf: true,  vol: 10, refl: 0 },
  { name: 'HIGH',  n: 130000, fluid: 176, scale: 0.85, rays: 30, jac: 18, sdf: true,  vol: 16, refl: 1 },
  { name: 'ULTRA', n: 300000, fluid: 224, scale: 1.00, rays: 42, jac: 22, sdf: true,  vol: 24, refl: 1 }
];
var PMAX = 300000;
/* Volle Power für alle: jeder Besucher — Desktop wie Mobile — startet und
   bleibt auf ULTRA. Kein Governor, keine Drosselung, keine Notabschaltung.
   Wer die Show sehen will, braucht ein Gerät, das sie verdient.
   (?nfq=low|med|high bleibt als Debug-Override erhalten.) */
var tierIdx = 3;
if (FORCE) {
  var fi = { low: 0, med: 1, high: 2, ultra: 3 }[FORCE];
  if (fi !== undefined) tierIdx = fi;
}
function tier() { return TIERS[tierIdx]; }

/* ------------------------------------------------------------- Shaders */
var QUAD_VS =
  '#version 300 es\nlayout(location=0) in vec2 a;out vec2 v_uv;' +
  'void main(){v_uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';

var NOISE_GLSL =
  'float nhash(float n){return fract(sin(n)*43758.5453123);}' +
  'float vnoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);' +
  'float n=dot(i,vec3(1.,57.,113.));' +
  'return mix(mix(mix(nhash(n),nhash(n+1.),f.x),mix(nhash(n+57.),nhash(n+58.),f.x),f.y),' +
  'mix(mix(nhash(n+113.),nhash(n+114.),f.x),mix(nhash(n+170.),nhash(n+171.),f.x),f.y),f.z);}';

/* Partikel-Simulation (Transform Feedback) */
var SIM_VS =
  '#version 300 es\nprecision highp float;\n' +
  'layout(location=0) in vec4 a_pos;\n' +   // xyz + life
  'layout(location=1) in vec4 a_vel;\n' +   // xyz + seed
  'layout(location=2) in vec4 a_tgt;\n' +   // Formationsziel + hasTarget
  'uniform float u_dt,u_time,u_aspect,u_phase,u_wind,u_fluidOn,u_pointerOn,u_charge;\n' +
  'uniform vec2 u_chargePt;\n' +
  'uniform vec4 u_pointer;\n' +
  'uniform vec4 u_burst;\n' +
  'uniform vec4 u_waves[4];\n' +
  'uniform sampler2D u_fluid;\n' +
  'out vec4 v_pos;out vec4 v_vel;\n' + NOISE_GLSL +
  'vec2 curl2(vec2 p,float t){float e=.14;' +
  'float a=vnoise(vec3(p.x,p.y+e,t)),b=vnoise(vec3(p.x,p.y-e,t));' +
  'float c=vnoise(vec3(p.x+e,p.y,t)),d=vnoise(vec3(p.x-e,p.y,t));' +
  'return vec2(a-b,d-c)/(2.*e);}\n' +
  'void main(){\n' +
  'vec3 p=a_pos.xyz;float life=a_pos.w;vec3 v=a_vel.xyz;float seed=a_vel.w;float dt=u_dt;\n' +
  'vec2 c=curl2(p.xy*1.15+seed*.37,u_time*.05+seed*7.);\n' +
  'v.xy+=c*dt*.22;\n' +
  'v.z+=(vnoise(vec3(p.xy*1.4,u_time*.1+seed))-.5)*dt*.4;\n' +
  'v.y+=(u_wind+.006)*dt;\n' +
  'if(u_fluidOn>.5){vec2 uv=vec2(p.x/u_aspect*.5+.5,p.y*.5+.5);' +
  'vec2 fv=texture(u_fluid,uv).xy*vec2(2.*u_aspect,2.);' +
  'v.xy+=(fv-v.xy)*min(1.,dt*2.2);}\n' +
  'if(u_pointerOn>.5){vec2 d=p.xy-u_pointer.xy;float w=exp(-dot(d,d)*9.);' +
  'vec2 tang=vec2(-d.y,d.x);' +
  'v.xy+=(u_pointer.zw*.55+tang*.5-d*.9)*w*dt*3.;}\n' +
  // Gravitationssenke: Klick halten → Partikel spiralen ins Zentrum
  'if(u_charge>0.){vec2 d=u_chargePt-p.xy;float dl=length(d)+1e-3;' +
  'float w=exp(-dl*dl*2.1)*u_charge;' +
  'v.xy+=((d/dl)*3.1+vec2(-d.y,d.x)/dl*2.7)*w*dt*(2.+u_charge*3.5);}\n' +
  'for(int i=0;i<4;i++){vec4 wv=u_waves[i];if(wv.w<=0.)continue;' +
  'float age=u_time-wv.z;if(age<0.||age>1.3)continue;' +
  'vec2 d=p.xy-wv.xy;float dl=length(d)+1e-4;float r=age*1.7;' +
  'float band=exp(-pow((dl-r)*6.5,2.))*(1.-age*.7);' +
  'v.xy+=(d/dl)*band*wv.w*dt*26.;' +
  'v.z+=band*wv.w*dt*(nhash(seed+float(i))-.5)*8.;}\n' +
  'float damp=.55;\n' +
  'if(u_phase>.5&&a_tgt.w>.5){vec3 dd=a_tgt.xyz-p;v+=dd*dt*9.;damp=5.5;}\n' +
  'if(u_burst.z>0.){vec2 d=p.xy-u_burst.xy;float dl=length(d)+1e-3;' +
  'float k=u_burst.z*(.35+.65*nhash(seed*3.7));' +
  'v.xy+=(d/dl)*k;v.z+=(nhash(seed*9.1)-.5)*k*.6;}\n' +
  'v*=exp(-damp*dt);\n' +
  'float sp=length(v);if(sp>1.4)v*=1.4/sp;\n' +
  'p+=v*dt;\n' +
  'float bx=u_aspect+.15;\n' +
  'if(p.x>bx)p.x=-bx+.02;else if(p.x<-bx)p.x=bx-.02;\n' +
  'if(p.y>1.18)p.y=-1.15;else if(p.y<-1.18)p.y=1.15;\n' +
  'p.z=clamp(p.z,-1.,1.);\n' +
  'life-=dt;\n' +
  'if(life<=0.){float h1=nhash(seed+u_time),h2=nhash(seed*1.7+u_time*1.3),h3=nhash(seed*2.3+u_time*.7);' +
  'p=vec3((h1*2.-1.)*bx,(h2*2.-1.)*1.1,h3*2.-1.);v=vec3(0.);' +
  'life=6.+10.*nhash(seed*4.1+u_time);}\n' +
  'v_pos=vec4(p,life);v_vel=vec4(v,seed);}';

var SIM_FS = '#version 300 es\nprecision mediump float;out vec4 o;void main(){o=vec4(0.);}';

/* Partikel-Rendering (DOF, Twinkle, Gold-Palette) */
var PART_VS =
  '#version 300 es\nprecision highp float;\n' +
  'layout(location=0) in vec4 a_pos;layout(location=1) in vec4 a_vel;\n' +
  'uniform float u_aspect,u_zoom,u_focus,u_time,u_px,u_audio,u_density,u_scrollZ,u_calm;\n' +
  'uniform vec2 u_cam;\n' +
  'out vec3 v_col;out float v_a;\n' +
  'void main(){\n' +
  'vec3 p=a_pos.xyz;float seed=a_vel.w;\n' +
  // Scroll-Dolly: Kamera fährt beim Scrollen durch die Staubtiefe
  'float zz=mod(p.z+u_scrollZ+1.,2.)-1.;\n' +
  'float par=.55+.45*(zz*.5+.5);\n' +
  'vec2 q=(p.xy-u_cam*par)*u_zoom;\n' +
  'gl_Position=vec4(q.x/u_aspect,q.y,0.,1.);\n' +
  'float coc=abs(zz-u_focus);\n' +
  'float size=(1.1+(zz*.5+.5)*1.6)*(1.+coc*2.6)*u_px*(1.+u_audio*.5);\n' +
  'gl_PointSize=clamp(size,1.,14.*u_px);\n' +
  'float h=fract(seed*7.31);\n' +
  'vec3 gold=mix(vec3(1.,.78,.38),vec3(1.,.94,.78),h);\n' +
  'if(h>.93)gold=vec3(1.,.99,.95);\n' +
  'float tw=.6+.4*sin(u_time*(1.+h*3.)+seed*40.);\n' +
  'float fade=smoothstep(0.,1.2,a_pos.w);\n' +
  // u_density = Anteil voll sichtbarer Körner; Rest ist Mikrostaub,
  // der erst durch räumliche Verdichtung (Burst, Formation, Fluid) sichtbar wird
  'float vis=step(1.-u_density,fract(seed*3.71));\n' +
  'gl_PointSize*=mix(.7,1.,vis);\n' +
  'v_col=gold*(.5+1.8*pow(h,6.));\n' +
  'v_a=tw*fade*mix(.08,1.,vis)/(1.+coc*coc*10.);\n' +
  // Content First: im Inhalt tritt der Goldstaub weit zurück
  'v_a*=1.-u_calm*.6;}';

var PART_FS =
  '#version 300 es\nprecision mediump float;\n' +
  'in vec3 v_col;in float v_a;out vec4 o;\n' +
  'void main(){vec2 d=gl_PointCoord-.5;float r2=dot(d,d);' +
  'float a=smoothstep(.25,.0,r2)*v_a;o=vec4(v_col*a,1.);}';

/* Kopieren/Abklingen (Trails = Motion-Blur-Charakter) */
var COPY_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform float u_mult;' +
  'void main(){o=texture(u_t,v_uv)*u_mult;}';

var BRIGHT_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform float u_th;' +
  'void main(){vec3 c=texture(u_t,v_uv).rgb;' +
  'float l=dot(c,vec3(.2126,.7152,.0722));' +
  'o=vec4(c*smoothstep(u_th,u_th+.55,l),1.);}';

var BLUR_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform vec2 u_dir;' +
  'void main(){vec3 c=texture(u_t,v_uv).rgb*.2270270270;' +
  'c+=texture(u_t,v_uv+u_dir*1.3846153846).rgb*.3162162162;' +
  'c+=texture(u_t,v_uv-u_dir*1.3846153846).rgb*.3162162162;' +
  'c+=texture(u_t,v_uv+u_dir*3.2307692308).rgb*.0702702703;' +
  'c+=texture(u_t,v_uv-u_dir*3.2307692308).rgb*.0702702703;' +
  'o=vec4(c,1.);}';

/* God Rays — radiales Marching vom Lichtpunkt */
var RAYS_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform vec2 u_lightUv;uniform int u_n;uniform float u_w;' +
  'void main(){vec2 duv=(u_lightUv-v_uv)*(.92/48.);' +
  'vec2 uv=v_uv;float ill=1.;vec3 acc=vec3(0.);' +
  'for(int i=0;i<48;i++){if(i>=u_n)break;uv+=duv;' +
  'acc+=texture(u_t,uv).rgb*ill;ill*=.936;}' +
  'o=vec4(acc*u_w*vec3(1.,.9,.68),1.);}';

/* Anamorphotische Streaks */
var ANA_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform float u_texelX;' +
  'void main(){vec3 acc=vec3(0.);float ws=0.;' +
  'for(int i=-11;i<=11;i++){float w=exp(-float(i*i)*.016);' +
  'acc+=texture(u_t,v_uv+vec2(float(i)*u_texelX*2.6,0.)).rgb*w;ws+=w;}' +
  'o=vec4(acc/ws*vec3(1.,.9,.72),1.);}';

/* Composite: Volumetrik, Refraktion, CA, Bloom, Rays, Ana, Dirt, ACES */
var COMP_FS =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;\n' +
  'uniform sampler2D u_scene,u_b0,u_b1,u_b2,u_rays,u_ana,u_dirt,u_dye,u_adapt;\n' +
  'uniform float u_aspect,u_time,u_audio,u_exposure,u_ca,u_fluidOn,u_pointerOn,u_intro,u_charge,u_scroll,u_motion,u_calm;\n' +
  'uniform vec2 u_cam,u_light,u_chargePt;\n' +
  'uniform vec4 u_pointer;\n' +
  'uniform vec4 u_waves[4];\n' +
  'uniform vec4 u_slabs[6];\n' +
  'uniform float u_slabW[6];\n' + NOISE_GLSL +
  'float fbm(vec3 p){return vnoise(p)*.55+vnoise(p*2.13)*.28+vnoise(p*4.4)*.17;}\n' +
  'vec3 aces(vec3 x){x*=.6;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}\n' +
  'void main(){\n' +
  'vec2 uv=v_uv;float shock=0.;\n' +
  // Gate Weave: 12-Hz-Filmtransport-Zittern
  'float gw=floor(u_time*12.);\n' +
  'uv+=(vec2(nhash(gw*1.7),nhash(gw*2.3+5.))-.5)*.0016;\n' +
  'for(int i=0;i<4;i++){vec4 wv=u_waves[i];if(wv.w<=0.)continue;' +
  'float age=u_time-wv.z;if(age<0.||age>1.3)continue;' +
  'vec2 d=(v_uv-((wv.xy/vec2(u_aspect,1.))*.5+.5))*vec2(u_aspect,1.);' +
  'float dl=length(d)+1e-4;float r=age*.85;' +
  'float g=exp(-pow((dl-r)*11.,2.))*(1.-age*.75)*wv.w;' +
  'uv-=(d/dl)*g*.028;shock+=g;}\n' +
  // Gravitationslinse beim Aufladen (Klick halten)
  'if(u_charge>0.){vec2 cw=vec2((v_uv.x*2.-1.)*u_aspect,v_uv.y*2.-1.);' +
  'vec2 dch=cw-u_chargePt;float dch2=dot(dch,dch);' +
  'uv-=(dch/(sqrt(dch2)+1e-4))*u_charge*.05*exp(-dch2*5.)/vec2(u_aspect*2.,2.);}\n' +
  // Glas-Wisch: schnelles Scrollen verzerrt das Bild wie durch fließendes Glas
  'if(abs(u_motion)>2e-3){uv+=vec2(vnoise(vec3(uv*12.,u_time*1.7))-.5,' +
  'vnoise(vec3(uv*12.+7.,u_time*1.7))-.5)*min(abs(u_motion)*.7,.0025);}\n' +
  'float ca=u_ca*(1.+shock*7.+u_charge*3.);\n' +
  'vec2 co=(uv-.5)*ca;\n' +
  'vec3 scene;\n' +
  'scene.r=texture(u_scene,uv+co).r;\n' +
  'scene.g=texture(u_scene,uv).g;\n' +
  'scene.b=texture(u_scene,uv-co).b;\n' +
  // Scroll-Motion-Blur: vertikale Bewegungsunschärfe folgt der Scroll-Energie
  'if(abs(u_motion)>1e-4){vec2 mb=vec2(0.,u_motion);\n' +
  'vec3 m1=texture(u_scene,uv+mb).rgb+texture(u_scene,uv-mb).rgb+texture(u_scene,uv+mb*2.2).rgb;\n' +
  'scene=mix(scene,(scene+m1)*.25,clamp(abs(u_motion)*260.,0.,.45));}\n' +
  // Volumetrik: FBM-Nebel + Lichtquelle + Fluid-Rauch + Ringe + Cursor-Aura
  'vec2 w=vec2((uv.x*2.-1.)*u_aspect,uv.y*2.-1.)+u_cam*.3;\n' +
  'float den=fbm(vec3(w*1.25+vec2(u_time*.021,u_time*.012),u_time*.045));\n' +
  'vec2 lw=(w-u_light)*vec2(1.,1.35);\n' +
  'float glow=exp(-length(lw)*1.55)*(.5+.09*sin(u_time*.6)+u_audio*.5);\n' +
  'vec3 fog=vec3(1.,.85,.55)*glow*(.22+.7*den)*(.6-.25*u_intro);\n' +
  'fog+=vec3(.9,.75,.45)*den*den*.05;\n' +
  'if(u_fluidOn>.5)fog+=texture(u_dye,uv).rgb*.9;\n' +
  'for(int i=0;i<4;i++){vec4 wv=u_waves[i];if(wv.w<=0.)continue;' +
  'float age=u_time-wv.z;if(age<0.||age>1.3)continue;' +
  'float dl=length(w-wv.xy);float r=age*1.7;' +
  'float band=exp(-pow((dl-r)*12.,2.))*pow(max(0.,1.-age*.77),1.6);' +
  'fog+=vec3(1.,.86,.55)*band*wv.w*1.5;}\n' +
  'if(u_pointerOn>.5){vec2 pd=w-u_pointer.xy;' +
  'float a=exp(-dot(pd,pd)*14.)*(.3+min(1.,length(u_pointer.zw))*.6);' +
  'fog+=vec3(1.,.88,.6)*a*.34;}\n' +
  // Akkretionsring + Kernglühen der Gravitationssenke
  'if(u_charge>0.){float dc=length(w-u_chargePt);' +
  'float ring=exp(-pow((dc-(.09+.07*u_charge))*26.,2.))*u_charge;' +
  'fog+=vec3(1.,.9,.6)*ring*1.5+vec3(1.,.85,.55)*exp(-dc*dc*18.)*u_charge*.3;}\n' +
  // Scene-Direction: Farbtemperatur wandert mit dem Scroll (Mitte kühler)
  'fog*=mix(vec3(1.),vec3(.88,.94,1.1),sin(u_scroll*3.14159)*.45);\n' +
  // Content First: Nebel und Glühen weichen dem Text
  'fog*=1.-u_calm*.55;\n' +
  'vec3 bloom=texture(u_b0,uv).rgb*.55+texture(u_b1,uv).rgb*.38+texture(u_b2,uv).rgb*.3;\n' +
  'vec3 rays=texture(u_rays,uv).rgb;\n' +
  'vec3 ana=texture(u_ana,uv).rgb*.5;\n' +
  'vec3 dirt=texture(u_dirt,v_uv).rgb;\n' +
  // Lens Ghosting: helle Kerne spiegeln sich an der Optikachse (Mitte)
  'vec2 gax=(vec2(.5)-v_uv)*1.9;\n' +
  'vec3 ghost=texture(u_b1,v_uv+gax*.5).rgb*.5+texture(u_b2,v_uv+gax*.85).rgb*.7;\n' +
  'float gvin=1.-smoothstep(.1,.75,distance(v_uv,vec2(.5)));\n' +
  'vec3 col=scene*u_exposure+fog+bloom*(1.+u_audio*.8)+rays+ana+ghost*vec3(1.,.85,.62)*.06*gvin;\n' +
  'col+=dirt*(bloom+rays)*.7;\n' +
  'col*=1.+shock*.22;\n' +
  // HDR-Eye-Adaption: Belichtung folgt der Szenenluminanz
  'float ad=texture(u_adapt,vec2(.5)).r;\n' +
  'col*=clamp(.22/(ad+.13),.8,1.28);\n' +
  // Info-Slates: das Licht der Halle weicht den Glas-Tafeln weich aus
  'float sdim=1.;\n' +
  'for(int i=0;i<6;i++){vec4 sb=u_slabs[i];if(sb.z<=sb.x)continue;\n' +
  'float m=smoothstep(0.,.022,v_uv.x-sb.x)*smoothstep(0.,.022,sb.z-v_uv.x)*' +
  'smoothstep(0.,.035,v_uv.y-sb.y)*smoothstep(0.,.035,sb.w-v_uv.y);\n' +
  'sdim*=1.-.7*m*u_slabW[i];}\n' +
  'col*=sdim;\n' +
  'col=aces(col);\n' +
  // Film-Gate: Projektor-Flicker + gelegentliche Kratzer
  'col*=1.+.012*sin(u_time*11.7)+.008*sin(u_time*29.3);\n' +
  'float sc=nhash(floor(u_time*4.)+3.);\n' +
  'if(sc>.94){float sx=nhash(floor(u_time*4.)+11.);' +
  'col+=vec3(1.,.95,.8)*exp(-pow((v_uv.x-sx)*300.,2.))*.05*nhash(v_uv.y*90.+floor(u_time*48.));}\n' +
  'o=vec4(col,1.);}';

/* ATELIER-GALERIE: raymarchte 3D-Halle — Gold-Monumente über schwarzen
   Marmorsockeln reihen sich alternierend links/rechts, jedes in seinem
   eigenen volumetrischen Lichtschacht, echte Boden-Spiegelungen.
   Die Kamera orbitiert im Hero ums erste Monument und fährt beim Scrollen
   als durchgehende Tracking-Shot durch die ganze Halle — die komplette
   Seite wird zu EINER Kamerafahrt. */
var SDF_FS =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;\n' +
  'uniform float u_aspect,u_time,u_fade,u_refl,u_scroll,u_hall,u_audio,u_speed;\n' +
  'uniform vec2 u_pos,u_cam,u_mouse;\n' +
  'uniform int u_vol;\n' + NOISE_GLSL +
  'float fbm2(vec3 p){return vnoise(p)*.6+vnoise(p*2.7)*.4;}\n' +
  'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}\n' +
  'float sdBox(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}\n' +
  'float sdFrame(vec3 p,float s,float th,float d){float outr=sdBox(p,vec3(s,s,d));' +
  'float inr=sdBox(p,vec3(s-th,s-th,d*4.));return max(outr,-inr);}\n' +
  'float sdTorus(vec3 p,vec2 t){vec2 q=vec2(length(p.xz)-t.x,p.y);return length(q)-t.y;}\n' +
  'float sdOcta(vec3 p,float s){p=abs(p);return (p.x+p.y+p.z-s)*.57735;}\n' +
  'float sdBoxFrame(vec3 p,vec3 b,float e){p=abs(p)-b;vec3 q=abs(p+e)-e;\n' +
  ' return min(min(\n' +
  '  length(max(vec3(p.x,q.y,q.z),0.))+min(max(p.x,max(q.y,q.z)),0.),\n' +
  '  length(max(vec3(q.x,p.y,q.z),0.))+min(max(q.x,max(p.y,q.z)),0.)),\n' +
  '  length(max(vec3(q.x,q.y,p.z),0.))+min(max(q.x,max(q.y,p.z)),0.));}\n' +
  'const float FLR=-.62;\n' +
  'const float CELL=6.;\n' +
  // Galerie-Zelle: welches Monument gehört zu diesem Weltpunkt?
  'float cellOf(vec3 p){return floor(p.z/CELL+.5);}\n' +
  'float sideOf(float cell){return mix(-.62,.62,mod(cell,2.))*u_pos.x;}\n' +
  'float map(vec3 p){\n' +
  ' float cell=cellOf(p);\n' +
  ' vec3 pp=vec3(p.x-sideOf(cell),p.y,p.z-cell*CELL);\n' +
  // Finale: die letzte Vitrine der Fahrt ist ein Triumphrahmen (1,7-fach)
  ' float endc=floor(-u_hall/CELL+.5);\n' +
  ' float sc=1.+.7*step(cell,endc+.5)*step(endc-.5,cell);\n' +
  // Sockel (statisch) unter dem schwebenden, rotierenden Monument
  ' float pl=sdBox(pp-vec3(0.,-.545,0.),vec3(.32*sc,.075,.32*sc));\n' +
  ' vec3 q=(pp-vec3(0.,.14+.5*(sc-1.),0.))/sc;\n' +
  ' float ph=cell*1.7;\n' +   // jede Vitrine tanzt in eigener Phase
  ' q.xz*=rot(u_time*.16+ph);q.xy*=rot(sin(u_time*.11+ph)*.05);\n' +
  // Die Ausstellung: jede Vitrine zeigt eines von drei Werken —
  // Hero und Finale zeigen immer den NobleFrame-Rahmen
  ' float kind=floor(nhash(cell*3.7+1.3)*3.);\n' +
  ' if(abs(cell)<.5||abs(cell-endc)<.5)kind=0.;\n' +
  ' float mo;\n' +
  ' if(kind<.5){\n' +   // Werk I: der Rahmen
  '  float f1=sdFrame(q,.54,.085,.03);\n' +
  '  vec3 q2=q;q2.xz*=rot(-u_time*.27-ph);\n' +
  '  float f2=sdFrame(q2,.30,.055,.02);\n' +
  '  float b1=sdBox(q,vec3(.010,.52,.010));\n' +
  '  float b2=sdBox(q,vec3(.52,.010,.010));\n' +
  '  mo=min(min(f1,f2),min(b1,b2));\n' +
  ' }else if(kind<1.5){\n' +   // Werk II: Sphäre mit Orbit-Ringen
  '  float sp=length(q)-.28;\n' +
  '  vec3 r1=q;r1.xy*=rot(1.1+u_time*.3);\n' +
  '  float t1=sdTorus(r1,vec2(.44,.02));\n' +
  '  vec3 r2=q;r2.yz*=rot(.6-u_time*.22);\n' +
  '  float t2=sdTorus(r2,vec2(.54,.016));\n' +
  '  mo=min(sp,min(t1,t2));\n' +
  ' }else{\n' +   // Werk III: Monolith mit schwebender Spitze
  '  float mn=sdBox(q-vec3(0.,-.06,0.),vec3(.15,.5,.15));\n' +
  '  float oc=sdOcta(q-vec3(0.,.74+sin(u_time*.8+ph)*.05,0.),.14);\n' +
  '  mo=min(mn,oc);}\n' +
  ' mo*=sc;\n' +
  // Glasvitrine: ein Kanten-Rahmen aus Messing-Gold umschließt jedes Werk,
  // steht auf dem Boden und wächst mit dem Finale mit
  ' float cs=sdBoxFrame(pp-vec3(0.,-.62+.82*sc,0.),vec3(.7,.82,.7)*sc,.011);\n' +
  // Kolonnade: schlanke Säulen flankieren die Halle vom Boden bis zur Decke
  ' float com=sdBox(vec3(abs(p.x)-1.95,p.y-.74,mod(p.z+3.,CELL)-3.),vec3(.055,1.36,.055));\n' +
  ' return min(com,min(pl,min(mo,cs)));}\n' +
  'vec3 norm(vec3 p){vec2 e=vec2(.0015,-.0015);' +
  'return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}\n' +
  'float shadow(vec3 ro,vec3 rd){float res=1.,t=.06;' +
  'for(int i=0;i<14;i++){float h=map(ro+rd*t);res=min(res,9.*h/t);' +
  't+=clamp(h,.03,.3);if(res<.02||t>3.)break;}return clamp(res,0.,1.);}\n' +
  // Lichtschächte der Galerie: Hauptlicht über jedem Monument,
  // schwächeres Fülllicht gegenüber, zwischen den Vitrinen
  'float shaftDen(vec3 p){\n' +
  ' if(p.y<FLR||p.y>2.1)return 0.;\n' +
  ' float cell=cellOf(p);\n' +
  ' float side=sideOf(cell);\n' +
  ' float cz=p.z-cell*CELL;\n' +
  ' float d=0.;\n' +
  ' float r=.16+(1.9-p.y)*.13;\n' +
  ' vec2 a0v=vec2(p.x-side-sin(u_time*.07+cell)*.06,cz);\n' +
  ' d+=exp(-dot(a0v,a0v)/(r*r)*3.2);\n' +
  ' vec2 a1v=vec2(p.x+side*1.3,cz-3.*sign(cz+1e-4));\n' +
  ' d+=exp(-dot(a1v,a1v)/(r*r)*3.2)*.5;\n' +
  ' d*=exp(-(1.9-p.y)*.5)*smoothstep(2.05,1.45,p.y);\n' +   // oben weich auslaufen
  ' d*=.55+.45*fbm2(vec3(p.x*2.2,p.y*1.1-u_time*.12,p.z*2.2));\n' +
  ' return d;}\n' +
  'vec3 volumetric(vec3 ro,vec3 rd,float tmax,float jit){\n' +
  ' if(u_vol<=0)return vec3(0.);\n' +
  ' float ts=tmax/float(u_vol);float t=ts*jit;vec3 acc=vec3(0.);\n' +
  ' for(int i=0;i<24;i++){if(i>=u_vol)break;\n' +
  '  vec3 p=ro+rd*t;float den=shaftDen(p);\n' +
  '  if(den>1e-3){den*=clamp(map(p)*4.5+.3,0.,1.);acc+=vec3(1.,.86,.6)*den*ts;}\n' +
  '  t+=ts;}\n' +
  // Score-Kopplung: die Lichtschächte atmen mit der Filmmusik
  ' return acc*.30*(1.+u_audio*.7);}\n' +
  'vec3 shadeGold(vec3 p,vec3 n,vec3 rd){\n' +
  ' vec3 L=normalize(vec3(.35,.8,.4));\n' +
  ' float dif=max(dot(n,L),0.)*shadow(p+n*.02,L);\n' +
  ' vec3 h=normalize(L-rd);float spe=pow(max(dot(n,h),0.),46.);\n' +
  // anisotroper Zweitglanz: gebürstetes Gold entlang der Rahmenkanten
  ' vec3 tg=normalize(cross(n,vec3(0.,1.,0.))+vec3(1e-4));\n' +
  ' float ha=dot(h,tg);\n' +
  ' float ani=pow(max(dot(n,h),0.),8.)*exp(-ha*ha*26.);\n' +
  ' float fre=pow(1.-max(dot(n,-rd),0.),3.);\n' +
  ' vec3 env=mix(vec3(.13,.08,.035),vec3(1.,.9,.66),n.y*.5+.5);\n' +
  ' vec3 col=vec3(1.,.72,.30)*(.05+.5*dif)+env*fre*.85+vec3(1.,.96,.82)*spe*1.5+vec3(1.,.88,.6)*ani*.6;\n' +
  ' col+=vec3(1.,.86,.6)*shaftDen(p)*.35;\n' +   // Schachtlicht küsst das Gold
  ' return col;}\n' +
  'vec3 shadeFloor(vec3 p,vec3 rd,float jit){\n' +
  // schwarzer Marmor mit feiner Aderung
  ' float vein=pow(smoothstep(.42,.72,fbm2(vec3(p.x*1.7,p.z*2.3,0.))),2.);\n' +
  ' vec3 base=vec3(.006,.0055,.005)+vec3(.028,.024,.02)*vein*.4;\n' +
  ' float fre=.04+.96*pow(clamp(1.+rd.y,0.,1.),4.);\n' +
  ' vec3 rrd=vec3(rd.x,-rd.y,rd.z);\n' +
  ' vec3 refl=vec3(0.);\n' +
  // Monument spiegelt sich im polierten Boden (HIGH/ULTRA)
  ' if(u_refl>.5){float t=.02,d;bool hit=false;\n' +
  '  for(int i=0;i<40;i++){d=map(p+rrd*t);if(d<.002*t+.001){hit=true;break;}t+=d;if(t>4.)break;}\n' +
  '  if(hit){vec3 rp=p+rrd*t;refl=shadeGold(rp,norm(rp),rrd)*exp(-t*.55);}}\n' +
  // Lichtschächte spiegeln — nasser Glanz wie auf einem Filmset
  ' refl+=volumetric(p+vec3(0.,.001,0.),rrd,3.2,jit)*1.4;\n' +
  // Kaustiken: die Lichtpfützen unter den Schächten glitzern lebendig
  ' float pool=shaftDen(vec3(p.x,FLR+.25,p.z));\n' +
  ' float ca=pow(fbm2(vec3(p.x*6.,p.z*6.,u_time*.35)),3.)*pool;\n' +
  ' refl+=vec3(1.,.9,.6)*ca*.5;\n' +
  ' float ao=clamp(map(p+vec3(0.,.05,0.))*2.2,0.,1.);\n' +
  ' return base*ao+refl*fre*ao;}\n' +
  'void main(){\n' +
  ' if(u_fade<=0.){o=vec4(0.);return;}\n' +
  ' vec2 q=(v_uv*2.-1.)*vec2(u_aspect,1.);\n' +
  ' float s=clamp(u_scroll,0.,1.);\n' +
  // Hero → Fahrt: ab leichtem Scroll geht der Orbit in die Tracking-Shot über
  ' float travel=smoothstep(.03,.20,s);\n' +
  ' q.x+=u_pos.y*(1.-travel);\n' +   // Hero: Monument links im Bild
  ' if(u_aspect<1.05)q.y-=.30*(1.-travel);\n' +   // Portrait: Monument höher
  // Kamera A: Orbit um Monument der Zelle 0 (Hero)
  ' float yaw=u_mouse.x*.13+sin(u_time*.05)*.05;\n' +
  ' float pit=.12+u_mouse.y*.07+sin(u_time*.083)*.012;\n' +
  ' float dist=2.85;\n' +
  ' if(u_aspect<1.05)dist+=1.1;\n' +   // Portrait: weiter weg, Monument kompakt
  ' vec3 ta=vec3(sideOf(0.),-.05,0.);\n' +
  ' vec3 ro=ta+vec3(sin(yaw)*cos(pit),sin(pit),cos(yaw)*cos(pit))*dist;\n' +
  // Kamera B: Fahrt im Zellen-Takt — die Kamera schwenkt in einen Orbit
  // um jede Vitrine (Welt dreht sich beim Scrollen), Blick wandert zum Werk
  ' float pz=-s*u_hall;\n' +
  ' float cph=s*u_hall/CELL*3.14159;\n' +   // Phase: pi pro Vitrine
  ' vec3 roT=vec3(-.10*cos(cph+.5)+u_mouse.x*.06,.06+sin(u_time*.5)*.012,pz+2.7);\n' +
  ' vec3 taT=roT+vec3(-.2*cos(cph+1.2)+u_mouse.x*.2,-.16+u_mouse.y*.15,-2.6);\n' +
  ' ro=mix(ro,roT,travel);ta=mix(ta,taT,travel);\n' +
  ' ro.xy+=u_cam*.18;\n' +
  ' vec3 fw=normalize(ta-ro);\n' +
  ' vec3 ri=normalize(cross(fw,vec3(0.,1.,0.)));\n' +
  ' vec3 up=cross(ri,fw);\n' +
  // Kran-Schräglage: die Kamera legt sich in die Kurve, Tempo verstärkt
  ' float bank=.03*sin(cph+.5)*travel-u_speed*.15;\n' +
  ' vec3 ri2=ri*cos(bank)+up*sin(bank);\n' +
  ' up=up*cos(bank)-ri*sin(bank);ri=ri2;\n' +
  // Film Breathing + Speed-Rush: schnelles Scrollen weitet das Sichtfeld
  ' float fov=(1.9+sin(u_time*.23)*.012)*(1.-min(abs(u_speed)*.3,.07));\n' +
  ' vec3 rd=normalize(fw*fov+ri*q.x+up*q.y);\n' +
  ' float jit=nhash(dot(v_uv,vec2(127.1,311.7))+fract(u_time)*13.7);\n' +
  // Analytische Raumhülle: Boden, Decke, zwei Wände — die Halle ist geschlossen
  ' float tF=1e5,tC=1e5,tW=1e5;\n' +
  ' if(rd.y<-.001)tF=(FLR-ro.y)/rd.y;\n' +
  ' if(rd.y>.001)tC=(2.12-ro.y)/rd.y;\n' +
  ' if(abs(rd.x)>.001)tW=((rd.x>0.?2.6:-2.6)-ro.x)/rd.x;\n' +
  ' if(tW<0.)tW=1e5;\n' +
  ' float tA=min(tF,min(tC,tW));\n' +
  ' float far=min(tA,9.);\n' +
  ' float t=.4,d;bool hit=false;\n' +
  ' for(int i=0;i<64;i++){d=map(ro+rd*t);if(d<.0015*t){hit=true;break;}t+=d*.92;if(t>far)break;}\n' +
  ' vec3 col=vec3(0.);float tScene=far;\n' +
  ' if(hit){tScene=t;vec3 p=ro+rd*t;vec3 n=norm(p);\n' +
  // Sockel + Säulen = dunkler Stein, Monumente = Gold
  '  float matk=smoothstep(-.50,-.44,p.y)*step(abs(p.x),1.5);\n' +
  '  vec3 g=shadeGold(p,n,rd);\n' +
  '  vec3 stone=vec3(.02,.018,.016)*(.4+.6*max(dot(n,normalize(vec3(.35,.8,.4))),0.))+g*.15;\n' +
  '  col=mix(stone,g,matk)*.72*exp(-(t-2.2)*.3);\n' +
  ' }else if(tA<9.){tScene=tA;\n' +
  '  if(tA==tF){\n' +
  '   col=shadeFloor(ro+rd*tF,rd,jit)*exp(-(tF-2.2)*.16);\n' +
  '  }else if(tA==tW){\n' +
  // Wände: fast schwarz, goldene LED-Lichtlinien an jeder Zellgrenze
  '   vec3 wp=ro+rd*tW;\n' +
  '   float cwz=mod(wp.z+3.,CELL)-3.;\n' +
  '   float line=exp(-cwz*cwz*300.)*smoothstep(FLR-.1,FLR+.4,wp.y)*smoothstep(2.2,1.6,wp.y);\n' +
  '   line*=.7+.3*sin(u_time*.8+floor((wp.z+3.)/CELL)*2.1);\n' +
  '   col=vec3(.0035,.003,.0025)+vec3(1.,.86,.55)*line*.85+vec3(1.,.88,.6)*shaftDen(wp)*.12;\n' +
  '   col*=exp(-(tW-2.2)*.2);\n' +
  '  }else{\n' +
  // Decke: fast schwarz, mit glimmenden Leuchten-Blenden über jedem Schacht
  '   vec3 cp=ro+rd*tC;\n' +
  '   float c2=cellOf(cp);float cz2=cp.z-c2*CELL;\n' +
  '   vec2 g0=vec2(cp.x-sideOf(c2),cz2);\n' +
  '   vec2 g1=vec2(cp.x+sideOf(c2)*1.3,cz2-3.*sign(cz2+1e-4));\n' +
  '   float fx=exp(-dot(g0,g0)*14.)+exp(-dot(g1,g1)*14.)*.5;\n' +
  '   col=vec3(.004,.0035,.003)+vec3(1.,.9,.65)*fx*.7;\n' +
  '   col*=exp(-(tC-2.2)*.2);}}\n' +
  ' col+=volumetric(ro,rd,min(tScene,7.),jit);\n' +
  // Content First: sobald gelesen wird, zieht sich die Halle massiv zurück —
  // im Hero volle Show, im Inhalt nur noch ein leiser goldener Atem
  ' col*=mix(1.,.18,travel);\n' +
  // Ränder sanft auslaufen lassen — die Szene sitzt im Screen-Blend über der Seite
  ' float edge=smoothstep(1.12,.72,abs(v_uv.x*2.-1.))*smoothstep(1.12,.66,abs(v_uv.y*2.-1.));\n' +
  ' o=vec4(col*u_fade*edge,1.);}';

/* Linien-Renderer: Blitze + Meteore (Bloom macht das Leuchten) */
var LINE_VS =
  '#version 300 es\nprecision highp float;' +
  'layout(location=0) in vec2 a_p;layout(location=1) in float a_t;' +
  'uniform float u_aspect,u_zoom,u_par;uniform vec2 u_cam,u_off;out float v_t;' +
  'void main(){vec2 q=(a_p-u_cam*u_par)*u_zoom;' +
  'gl_Position=vec4(q.x/u_aspect+u_off.x,q.y+u_off.y,0.,1.);v_t=a_t;}';
var LINE_FS =
  '#version 300 es\nprecision mediump float;in float v_t;out vec4 o;' +
  'uniform vec3 u_col;uniform float u_alpha;' +
  'void main(){o=vec4(u_col*u_alpha*v_t,1.);}';

/* Soft-Body-Seide: Verlet-Bänder mit fließendem Gold-Sheen */
var RIB_VS =
  '#version 300 es\nprecision highp float;' +
  'layout(location=0) in vec2 a_p;layout(location=1) in vec2 a_uv;' +
  'uniform float u_aspect,u_zoom,u_par;uniform vec2 u_cam;out vec2 v_uv;' +
  'void main(){vec2 q=(a_p-u_cam*u_par)*u_zoom;' +
  'gl_Position=vec4(q.x/u_aspect,q.y,0.,1.);v_uv=a_uv;}';
var RIB_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform float u_time,u_alpha;' +
  'void main(){float edge=pow(sin(3.14159*v_uv.y),1.6);' +
  'float sheen=.35+.65*pow(sin(v_uv.x*12.-u_time*1.7)*.5+.5,3.);' +
  'float ends=smoothstep(0.,.08,v_uv.x)*smoothstep(1.,.92,v_uv.x);' +
  'o=vec4(vec3(1.,.84,.5)*edge*sheen*ends*u_alpha,1.);}';

/* HDR-Auto-Exposure: Luminanz-Reduktion + zeitliche Adaption (Eye Adaption) */
var AVG_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;' +
  'void main(){float s=0.;' +
  'for(int i=0;i<5;i++)for(int j=0;j<5;j++){' +
  'vec3 c=texture(u_t,vec2((float(i)+.5)/5.,(float(j)+.5)/5.)).rgb;' +
  's+=dot(c,vec3(.2126,.7152,.0722));}' +
  'o=vec4(s/25.,0.,0.,1.);}';
var ADAPT_FS =
  '#version 300 es\nprecision mediump float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_lum,u_prev;uniform float u_k;' +
  'void main(){float l=texture(u_lum,vec2(.5)).r;float p=texture(u_prev,vec2(.5)).r;' +
  'o=vec4(mix(p,l,u_k),0.,0.,1.);}';

/* -------- Fluid (Stable Fluids) -------- */
var FL_ADVECT =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_vel,u_src;uniform float u_dt,u_diss;' +
  'void main(){vec2 uv=v_uv-u_dt*texture(u_vel,v_uv).xy;' +
  'o=texture(u_src,uv)/(1.+u_diss*u_dt);}';

var FL_SPLAT =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_t;uniform vec2 u_point;uniform vec3 u_color;' +
  'uniform float u_radius,u_aspect;' +
  'void main(){vec2 p=v_uv-u_point;p.x*=u_aspect;' +
  'float d=exp(-dot(p,p)/u_radius);' +
  'o=vec4(texture(u_t,v_uv).xyz+u_color*d,1.);}';

var FL_CURL =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_vel;uniform vec2 u_texel;' +
  'void main(){' +
  'float L=texture(u_vel,v_uv-vec2(u_texel.x,0.)).y;' +
  'float R=texture(u_vel,v_uv+vec2(u_texel.x,0.)).y;' +
  'float B=texture(u_vel,v_uv-vec2(0.,u_texel.y)).x;' +
  'float T=texture(u_vel,v_uv+vec2(0.,u_texel.y)).x;' +
  'o=vec4(.5*((R-L)-(T-B)),0.,0.,1.);}';

var FL_VORT =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_vel,u_curl;uniform vec2 u_texel;uniform float u_dt,u_str;' +
  'void main(){' +
  'float L=texture(u_curl,v_uv-vec2(u_texel.x,0.)).x;' +
  'float R=texture(u_curl,v_uv+vec2(u_texel.x,0.)).x;' +
  'float B=texture(u_curl,v_uv-vec2(0.,u_texel.y)).x;' +
  'float T=texture(u_curl,v_uv+vec2(0.,u_texel.y)).x;' +
  'float C=texture(u_curl,v_uv).x;' +
  'vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));' +
  'f/=length(f)+1e-4;f*=u_str*C*vec2(1.,-1.);' +
  'o=vec4(texture(u_vel,v_uv).xy+f*u_dt,0.,1.);}';

var FL_DIV =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_vel;uniform vec2 u_texel;' +
  'void main(){' +
  'float L=texture(u_vel,v_uv-vec2(u_texel.x,0.)).x;' +
  'float R=texture(u_vel,v_uv+vec2(u_texel.x,0.)).x;' +
  'float B=texture(u_vel,v_uv-vec2(0.,u_texel.y)).y;' +
  'float T=texture(u_vel,v_uv+vec2(0.,u_texel.y)).y;' +
  'o=vec4(.5*((R-L)+(T-B)),0.,0.,1.);}';

var FL_JACOBI =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_p,u_div;uniform vec2 u_texel;' +
  'void main(){' +
  'float L=texture(u_p,v_uv-vec2(u_texel.x,0.)).x;' +
  'float R=texture(u_p,v_uv+vec2(u_texel.x,0.)).x;' +
  'float B=texture(u_p,v_uv-vec2(0.,u_texel.y)).x;' +
  'float T=texture(u_p,v_uv+vec2(0.,u_texel.y)).x;' +
  'float d=texture(u_div,v_uv).x;' +
  'o=vec4((L+R+B+T-d)*.25,0.,0.,1.);}';

var FL_GRAD =
  '#version 300 es\nprecision highp float;in vec2 v_uv;out vec4 o;' +
  'uniform sampler2D u_p,u_vel;uniform vec2 u_texel;' +
  'void main(){' +
  'float L=texture(u_p,v_uv-vec2(u_texel.x,0.)).x;' +
  'float R=texture(u_p,v_uv+vec2(u_texel.x,0.)).x;' +
  'float B=texture(u_p,v_uv-vec2(0.,u_texel.y)).x;' +
  'float T=texture(u_p,v_uv+vec2(0.,u_texel.y)).x;' +
  'vec2 v=texture(u_vel,v_uv).xy-.5*vec2(R-L,T-B);' +
  'o=vec4(v,0.,1.);}';

/* --------------------------------------------------------- GL-Helfer */
function compile(type, src) {
  var s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('[NF·Engine] Shader-Fehler:', gl.getShaderInfoLog(s), src.slice(0, 120));
    return null;
  }
  return s;
}
function program(vsSrc, fsSrc, tfVaryings) {
  var vs = compile(gl.VERTEX_SHADER, vsSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;
  var p = gl.createProgram();
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  if (tfVaryings) gl.transformFeedbackVaryings(p, tfVaryings, gl.SEPARATE_ATTRIBS);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[NF·Engine] Link-Fehler:', gl.getProgramInfoLog(p));
    return null;
  }
  var u = {};
  return {
    p: p,
    u: function (name) {
      if (!(name in u)) u[name] = gl.getUniformLocation(p, name);
      return u[name];
    }
  };
}
function makeTex(w, h, internal, format, type, filter) {
  var t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
  return t;
}
function makeFBO(w, h, internal, format, type, filter) {
  var t = makeTex(w, h, internal, format, type, filter);
  var f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return { f: f, t: t, w: w, h: h };
}
function makeDouble(w, h, internal, format, type, filter) {
  return { a: makeFBO(w, h, internal, format, type, filter), b: makeFBO(w, h, internal, format, type, filter),
    swap: function () { var x = this.a; this.a = this.b; this.b = x; } };
}
function delFBO(o) { if (!o) return; gl.deleteFramebuffer(o.f); gl.deleteTexture(o.t); }
function delDouble(o) { if (!o) return; delFBO(o.a); delFBO(o.b); }
function bindFBO(o) { gl.bindFramebuffer(gl.FRAMEBUFFER, o ? o.f : null); gl.viewport(0, 0, o ? o.w : canvas.width, o ? o.h : canvas.height); }
function bindTex(unit, t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); }

/* Programme */
var pSim   = program(SIM_VS, SIM_FS, ['v_pos', 'v_vel']);
var pPart  = program(PART_VS, PART_FS);
var pCopy  = program(QUAD_VS, COPY_FS);
var pBright= program(QUAD_VS, BRIGHT_FS);
var pBlur  = program(QUAD_VS, BLUR_FS);
var pRays  = program(QUAD_VS, RAYS_FS);
var pAna   = program(QUAD_VS, ANA_FS);
var pComp  = program(QUAD_VS, COMP_FS);
var pSDF   = program(QUAD_VS, SDF_FS);
var pLine  = program(LINE_VS, LINE_FS);
var pRib   = program(RIB_VS, RIB_FS);
var pAvg   = program(QUAD_VS, AVG_FS);
var pAdapt = program(QUAD_VS, ADAPT_FS);
var pAdv, pSplat, pCurl, pVort, pDiv, pJac, pGrad;
if (FLUID_OK) {
  pAdv  = program(QUAD_VS, FL_ADVECT);
  pSplat= program(QUAD_VS, FL_SPLAT);
  pCurl = program(QUAD_VS, FL_CURL);
  pVort = program(QUAD_VS, FL_VORT);
  pDiv  = program(QUAD_VS, FL_DIV);
  pJac  = program(QUAD_VS, FL_JACOBI);
  pGrad = program(QUAD_VS, FL_GRAD);
  if (!(pAdv && pSplat && pCurl && pVort && pDiv && pJac && pGrad)) FLUID_OK = false;
}
if (!(pSim && pPart && pCopy && pBright && pBlur && pRays && pAna && pComp &&
      pSDF && pLine && pRib && pAvg && pAdapt)) {
  console.error('[NF·Engine] Shader-Kompilierung fehlgeschlagen — Engine aus.');
  canvas.remove();
  return;
}

/* Fullscreen-Quad */
var quadVAO = gl.createVertexArray();
gl.bindVertexArray(quadVAO);
var quadBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.bindVertexArray(null);
function drawQuad() { gl.bindVertexArray(quadVAO); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.bindVertexArray(null); }

/* ---------------------------------------------------- Partikel-Puffer */
var aspect = 1;
var posData = new Float32Array(PMAX * 4);
var velData = new Float32Array(PMAX * 4);
var tgtData = new Float32Array(PMAX * 4);
(function seedParticles() {
  var a = window.innerWidth / Math.max(1, window.innerHeight);
  for (var i = 0; i < PMAX; i++) {
    posData[i * 4]     = (Math.random() * 2 - 1) * (a + 0.1);
    posData[i * 4 + 1] = Math.random() * 2.2 - 1.1;
    posData[i * 4 + 2] = Math.random() * 2 - 1;
    posData[i * 4 + 3] = 2 + Math.random() * 14;
    velData[i * 4 + 3] = Math.random() * 100 + 1;
  }
})();
function makeVBO(data, usage) {
  var b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage);
  return b;
}
var bufs = {
  posA: makeVBO(posData, gl.DYNAMIC_COPY), velA: makeVBO(velData, gl.DYNAMIC_COPY),
  posB: makeVBO(posData, gl.DYNAMIC_COPY), velB: makeVBO(velData, gl.DYNAMIC_COPY),
  tgt: makeVBO(tgtData, gl.STATIC_DRAW)
};
function simVAO(pos, vel) {
  var v = gl.createVertexArray();
  gl.bindVertexArray(v);
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vel);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, bufs.tgt);
  gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return v;
}
function renderVAO(pos, vel) {
  var v = gl.createVertexArray();
  gl.bindVertexArray(v);
  gl.bindBuffer(gl.ARRAY_BUFFER, pos);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vel);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  return v;
}
var vaoSimA = simVAO(bufs.posA, bufs.velA);   // liest A → schreibt B
var vaoSimB = simVAO(bufs.posB, bufs.velB);   // liest B → schreibt A
var vaoRenA = renderVAO(bufs.posA, bufs.velA);
var vaoRenB = renderVAO(bufs.posB, bufs.velB);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
var tfToB = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfToB);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufs.posB);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, bufs.velB);
var tfToA = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tfToA);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, bufs.posA);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, bufs.velA);
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
var pingA = true;   // true: A ist aktueller Lese-Zustand

/* ---------------------------------------------- Framebuffer / Targets */
var HDR_IFMT = HDR ? gl.RGBA16F : gl.RGBA8;
var HDR_TYPE = HDR ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
var BLOOM_TH = HDR ? 0.75 : 0.42;
var scene, bright, blur0, blur1, blur2, raysT, anaT, sdfT;
var fl = null;   // Fluid-Targets

function allocTargets() {
  delDouble(scene); delFBO(bright);
  delDouble(blur0); delDouble(blur1); delDouble(blur2);
  delFBO(raysT); delFBO(anaT); delFBO(sdfT);
  var W = canvas.width, H = canvas.height;
  var h2w = W >> 1 || 1, h2h = H >> 1 || 1;
  var q4w = W >> 2 || 1, q4h = H >> 2 || 1;
  var e8w = W >> 3 || 1, e8h = H >> 3 || 1;
  scene = makeDouble(W, H, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  bright = makeFBO(h2w, h2h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  blur0 = makeDouble(h2w, h2h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  blur1 = makeDouble(q4w, q4h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  blur2 = makeDouble(e8w, e8h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  raysT = makeFBO(q4w, q4h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  anaT = makeFBO(q4w, q4h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  sdfT = makeFBO(h2w, h2h, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.LINEAR);
  [scene.a, scene.b].forEach(function (o) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, o.f);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
  });
}
/* Auto-Exposure-State (1×1, überlebt Resizes) */
var lumT = makeFBO(1, 1, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.NEAREST);
var adapt = makeDouble(1, 1, HDR_IFMT, gl.RGBA, HDR_TYPE, gl.NEAREST);

/* Dynamische Geometrie: Blitze/Meteore (Linien) + Seidenbänder (Strips) */
function dynVAO(strideFloats, attribs) {
  var buf = gl.createBuffer();
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  attribs.forEach(function (a) {
    gl.enableVertexAttribArray(a[0]);
    gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, strideFloats * 4, a[2] * 4);
  });
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return { buf: buf, vao: vao };
}
var lineGeo = dynVAO(3, [[0, 2, 0], [1, 1, 2]]);   // x,y,intensity
var ribGeo  = dynVAO(4, [[0, 2, 0], [1, 2, 2]]);   // x,y,u,v
function allocFluid() {
  if (!FLUID_OK) return;
  if (fl) { delDouble(fl.vel); delDouble(fl.dye); delDouble(fl.prs); delFBO(fl.div); delFBO(fl.curl); }
  var res = tier().fluid;
  var vw = Math.max(8, Math.round(res * aspect)), vh = res;
  var dw = Math.min(512, vw * 2), dh = Math.min(512, vh * 2);
  fl = {
    vel: makeDouble(vw, vh, gl.RG16F, gl.RG, gl.HALF_FLOAT, gl.LINEAR),
    dye: makeDouble(dw, dh, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.LINEAR),
    prs: makeDouble(vw, vh, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST),
    div: makeFBO(vw, vh, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST),
    curl: makeFBO(vw, vh, gl.R16F, gl.RED, gl.HALF_FLOAT, gl.NEAREST),
    texel: [1 / vw, 1 / vh]
  };
}

/* Lens-Dirt-Textur (prozedural, einmalig) */
var dirtTex = (function () {
  var c = document.createElement('canvas');
  c.width = c.height = 256;
  var x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256);
  for (var i = 0; i < 70; i++) {
    var r = 2 + Math.random() * 26;
    var g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    var a = 0.02 + Math.random() * 0.09;
    g.addColorStop(0, 'rgba(255,246,225,' + a + ')');
    g.addColorStop(1, 'rgba(255,246,225,0)');
    x.save();
    x.translate(Math.random() * 256, Math.random() * 256);
    if (Math.random() < 0.3) x.scale(3 + Math.random() * 3, 0.5);
    x.fillStyle = g;
    x.beginPath(); x.arc(0, 0, r, 0, 6.2832); x.fill();
    x.restore();
  }
  var t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  return t;
})();

/* ------------------------------------------------------------ Resize */
function resize() {
  var pr = Math.min(window.devicePixelRatio || 1, 2) * tier().scale;
  var w = Math.max(2, Math.round(window.innerWidth * pr));
  var h = Math.max(2, Math.round(window.innerHeight * pr));
  canvas.width = w; canvas.height = h;
  aspect = window.innerWidth / Math.max(1, window.innerHeight);
  allocTargets();
  allocFluid();
}
resize();
var rszT = 0;
window.addEventListener('resize', function () {
  clearTimeout(rszT); rszT = setTimeout(resize, 160);
});

/* ------------------------------------------------------- Engine-State */
var simTime = 0, lastNow = 0, running = true, dead = false;
var pointer = { x: 0, y: 0, vx: 0, vy: 0, on: 0, lastX: 0, lastY: 0, lastT: 0 };
var waves = [];                    // {x,y,t0,str}
var wavesArr = new Float32Array(16);
var burst = { x: 0, y: 0, str: 0 };
var phase = 0;                     // 1 = Text-Formation (Cold Open)
var audioLevel = 0;
var scrollWind = 0, lastScrollY = window.scrollY;
var cam = { x: 0, y: 0, zoom: 1, focus: 0.15, focusTgt: 0.15, shake: 0, shakeV: 0 };
var lightW = [0, 0.45];            // Lichtquelle (Weltkoordinaten, oben Mitte)
var splatQueue = [];
var charge = 0, charging = false, chargeT0 = 0, chargePt = [0, 0];
var bolts = [];                    // Blitze: {strips:[Float32Array], t0, dur, alpha}
var meteors = [];                  // Meteore: {x,y,vx,vy,t0,dur,trail:[]}
var scrollProgress = 0, scrollZ = 0, sdfFade = 1, hallLen = 20;
var mSmooth = { x: 0, y: 0 };   // geglättete Maus für den Atelier-Kamera-Look
var contentCalm = 0;            // 0 = Hero-Kino, 1 = Lesemodus (Effekte treten zurück)
var motionAmt = 0;              // Scroll-Energie → Motion Blur im Composite
var frameCount = 0, fpsAccum = 0, fpsTime = 0;
var fpsNow = 60;

/* Cold Open: läuft das Kino-Intro gerade frisch? */
var introEl = document.getElementById('cineIntro');
var introSeen = false;
try { introSeen = sessionStorage.getItem('nf_intro') === '1'; } catch (e) {}
var freshIntro = !!introEl && !introSeen;
var live = !freshIntro;
if (freshIntro) canvas.classList.add('intro');

function goLive() {
  if (live) return;
  live = true;
  if (phase === 1) {
    burst.x = 0; burst.y = 0.08; burst.str = 2.2;
    cam.shakeV += 1.4;
  }
  phase = 0;
  canvas.classList.remove('intro');
}
window.addEventListener('nf:golive', goLive);
setTimeout(goLive, 8200);   // Failsafe, falls das Event nie kommt

/* Formation startet kurz nach Engine-Beginn, Explosion beim Reveal */
if (freshIntro) setTimeout(function () { if (!live) phase = 1; }, 1000);

/* --------------------------------- GPU-Typografie: Textziele sampeln */
function sampleTextTargets() {
  var word = 'NOBLEFRAME';
  var c = document.createElement('canvas');
  c.width = 720; c.height = 150;
  var x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#fff';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  try { x.letterSpacing = '8px'; } catch (e) {}
  x.font = '500 86px "Cormorant Garamond", Georgia, serif';
  x.fillText(word.toUpperCase(), 360, 78);
  var img = x.getImageData(0, 0, c.width, c.height).data;
  var pts = [];
  for (var py = 0; py < c.height; py += 2) {
    for (var px = 0; px < c.width; px += 2) {
      if (img[(py * c.width + px) * 4 + 3] > 100) pts.push([px, py]);
    }
  }
  if (!pts.length) return;
  var a = window.innerWidth / Math.max(1, window.innerHeight);
  var worldW = Math.min(1.4 * a, 2.6);
  var scaleF = worldW / c.width;
  var cy = 0.08;   // Titel sitzt bei ~46 % Viewport-Höhe
  var K = Math.min(PMAX, Math.max(30000, Math.floor(tier().n * 0.55)));
  for (var i = 0; i < K; i++) {
    var pt = pts[(Math.random() * pts.length) | 0];
    tgtData[i * 4]     = (pt[0] - c.width / 2) * scaleF + (Math.random() - 0.5) * 0.006;
    tgtData[i * 4 + 1] = -(pt[1] - c.height / 2) * scaleF + cy + (Math.random() - 0.5) * 0.006;
    tgtData[i * 4 + 2] = (Math.random() - 0.5) * 0.12;
    tgtData[i * 4 + 3] = 1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, bufs.tgt);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, tgtData);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}
if (freshIntro) {
  var sampled = false;
  var doSample = function () { if (!sampled) { sampled = true; try { sampleTextTargets(); } catch (e) {} } };
  if (document.fonts && document.fonts.load) {
    Promise.race([
      document.fonts.load('500 86px "Cormorant Garamond"'),
      new Promise(function (r) { setTimeout(r, 700); })
    ]).then(doSample, doSample);
  } else setTimeout(doSample, 60);
}

/* ------------------------------------------------------------ Eingabe */
function toWorld(cx, cy) {
  return [((cx / window.innerWidth) * 2 - 1) * aspect, -((cy / window.innerHeight) * 2 - 1)];
}
var lastSplatT = 0;
window.addEventListener('pointermove', function (e) {
  var w = toWorld(e.clientX, e.clientY);
  var now = performance.now();
  var dt = Math.max(1, now - pointer.lastT) / 1000;
  pointer.vx = (w[0] - pointer.lastX) / dt;
  pointer.vy = (w[1] - pointer.lastY) / dt;
  var sp = Math.hypot(pointer.vx, pointer.vy);
  if (sp > 3) { pointer.vx *= 3 / sp; pointer.vy *= 3 / sp; sp = 3; }
  pointer.x = w[0]; pointer.y = w[1];
  pointer.lastX = w[0]; pointer.lastY = w[1]; pointer.lastT = now;
  pointer.on = 1;
  if (FLUID_OK && fl && sp > 0.05 && now - lastSplatT > 16) {
    lastSplatT = now;
    var k = Math.min(1, sp * 0.6);
    splatQueue.push({
      x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight,
      dx: pointer.vx * 0.09 / aspect, dy: pointer.vy * 0.09,
      r: 0.0022, col: [0.055 * k, 0.04 * k, 0.016 * k], vel: true
    });
  }
}, { passive: true });
window.addEventListener('pointerleave', function () { pointer.on = 0; });

/* Klick = Shockwave. Klick HALTEN (auf freier Fläche, Maus) = Gravitations-
   senke lädt auf; beim Loslassen entlädt sie sich als große Druckwelle,
   ab hoher Ladung mit Gold-Blitzen. */
document.addEventListener('pointerdown', function (e) {
  var w = toWorld(e.clientX, e.clientY);
  var interactive = e.target && e.target.closest &&
    e.target.closest('a,button,input,textarea,select,label,summary');
  if (!interactive && e.pointerType === 'mouse' && e.button === 0) {
    charging = true; chargeT0 = simTime; chargePt = [w[0], w[1]];
    document.body.classList.add('nf-charging');
  }
  waves.push({ x: w[0], y: w[1], t0: simTime, str: 0.7 });
  if (waves.length > 4) waves.shift();
  cam.shakeV += 0.7;
  cam.focusTgt = (Math.abs(w[0]) * 0.7 + Math.abs(w[1]) * 0.5) % 1 * 1.4 - 0.4;   // Rack Focus
  if (FLUID_OK && fl) {
    splatQueue.push({ x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight,
      dx: 0, dy: 0.05, r: 0.004, col: [0.5, 0.38, 0.16], vel: false });
  }
}, { passive: true });
function releaseCharge(e) {
  if (!charging) return;
  charging = false;
  document.body.classList.remove('nf-charging');
  var c = charge;
  if (c < 0.15) return;
  var w = e && e.clientX !== undefined ? toWorld(e.clientX, e.clientY) : chargePt;
  waves.push({ x: w[0], y: w[1], t0: simTime, str: 0.9 + c * 1.7 });
  if (waves.length > 4) waves.shift();
  burst.x = w[0]; burst.y = w[1]; burst.str = 0.7 + c * 1.5;
  cam.shakeV += 0.8 + c * 1.8;
  if (c > 0.45) spawnBolts(w[0], w[1], 2 + Math.round(c * 2), 0.9);
  if (FLUID_OK && fl) {
    splatQueue.push({ x: (w[0] / aspect) * 0.5 + 0.5, y: w[1] * 0.5 + 0.5,
      dx: 0, dy: 0, r: 0.006 + c * 0.006, col: [0.6 * c, 0.45 * c, 0.18 * c], vel: false });
  }
}
document.addEventListener('pointerup', releaseCharge, { passive: true });
document.addEventListener('pointercancel', releaseCharge, { passive: true });
window.addEventListener('blur', function () { releaseCharge(null); });
window.addEventListener('scroll', function () {
  var y = window.scrollY;
  scrollWind = Math.max(-0.5, Math.min(0.5, (y - lastScrollY) * 0.004));
  lastScrollY = y;
}, { passive: true });

/* Ambiente Rauchfahnen */
setInterval(function () {
  if (!FLUID_OK || !fl || document.hidden || dead) return;
  splatQueue.push({
    x: 0.15 + Math.random() * 0.7, y: 0.02,
    dx: (Math.random() - 0.5) * 0.01, dy: 0.02 + Math.random() * 0.02,
    r: 0.005, col: [0, 0, 0], vel: true
  });
  splatQueue.push({
    x: 0.15 + Math.random() * 0.7, y: 0.02,
    dx: 0, dy: 0,
    r: 0.005, col: [0.09, 0.065, 0.025], vel: false
  });
}, 2400);

/* ------------------------------------------ Blitz-Engine (prozedural) */
function makeStrip(x0, y0, x1, y1, jag) {
  var pts = [[x0, y0], [x1, y1]];
  for (var it = 0; it < 5; it++) {
    var next = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      var dx = b[0] - a[0], dy = b[1] - a[1];
      var len = Math.hypot(dx, dy) || 1e-4;
      var off = (Math.random() - 0.5) * len * jag;
      next.push(a, [mx - dy / len * off, my + dx / len * off]);
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  var arr = new Float32Array(pts.length * 3);
  for (i = 0; i < pts.length; i++) {
    arr[i * 3] = pts[i][0];
    arr[i * 3 + 1] = pts[i][1];
    arr[i * 3 + 2] = 1 - (i / (pts.length - 1)) * 0.7;   // Taper zum Ende
  }
  return arr;
}
function spawnBolts(x, y, n, alpha) {
  for (var i = 0; i < n; i++) {
    var ang = Math.random() * Math.PI * 2;
    var len = 0.45 + Math.random() * 0.65;
    var strips = [makeStrip(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, 0.55)];
    if (Math.random() < 0.8) {
      var bx = x + Math.cos(ang) * len * 0.45, by = y + Math.sin(ang) * len * 0.45;
      var ba = ang + (Math.random() - 0.5) * 1.8;
      strips.push(makeStrip(bx, by, bx + Math.cos(ba) * len * 0.4, by + Math.sin(ba) * len * 0.4, 0.7));
    }
    bolts.push({ strips: strips, t0: simTime, dur: 0.26 + Math.random() * 0.14, alpha: alpha, seed: Math.random() * 9 });
  }
  if (bolts.length > 10) bolts.splice(0, bolts.length - 10);
}
/* Fernes Wetterleuchten nahe der Lichtquelle */
(function ambientLightning() {
  setTimeout(function loop() {
    if (!dead && !document.hidden && live) {
      spawnBolts(lightW[0] + (Math.random() - 0.5) * 0.7, lightW[1] + 0.1 + Math.random() * 0.3, 1, 0.28);
    }
    setTimeout(loop, 17000 + Math.random() * 21000);
  }, 12000);
})();

/* -------------------------------------------------- Meteor-Scheduler */
(function meteorLoop() {
  setTimeout(function loop() {
    if (!dead && !document.hidden && live) {
      var dir = Math.random() < 0.5 ? 1 : -1;
      meteors.push({
        x: -dir * (aspect + 0.2), y: 0.35 + Math.random() * 0.6,
        vx: dir * (0.9 + Math.random() * 0.7), vy: -(0.15 + Math.random() * 0.3),
        t0: simTime, dur: 2.6, trail: []
      });
      if (meteors.length > 3) meteors.shift();
    }
    setTimeout(loop, 9000 + Math.random() * 14000);
  }, 6000);
})();
function updateMeteors(dt) {
  meteors = meteors.filter(function (m) { return simTime - m.t0 < m.dur; });
  meteors.forEach(function (m) {
    m.x += m.vx * dt; m.y += m.vy * dt;
    m.trail.push([m.x, m.y]);
    if (m.trail.length > 16) m.trail.shift();
  });
}

/* ----------------------- Soft-Body-Seide (Verlet-Bänder im Windfeld) */
function jNoise(x, y, t) {
  var n = Math.sin(x * 127.1 + y * 311.7 + t * 74.7) * 43758.5453;
  return n - Math.floor(n);
}
function Ribbon(depth, phase, width, alpha) {
  this.par = depth; this.phase = phase; this.width = width; this.alpha = alpha;
  this.N = 42;
  this.nodes = [];
  var x0 = (Math.random() - 0.5) * aspect, y0 = 0.3 + Math.random() * 0.5;
  for (var i = 0; i < this.N; i++) {
    this.nodes.push({ x: x0 + i * 0.028, y: y0, px: x0 + i * 0.028, py: y0 });
  }
  this.verts = new Float32Array(this.N * 2 * 4);
}
Ribbon.prototype.update = function (dt, t) {
  var L = 0.028, n = this.nodes;
  // Drift-Ziel (Lissajous) hält das Band elegant in der oberen Bildhälfte
  var tx = Math.sin(t * 0.09 + this.phase) * aspect * 0.55;
  var ty = 0.35 + Math.sin(t * 0.067 + this.phase * 2.3) * 0.38;
  var cx = 0, cy = 0, i;
  for (i = 0; i < this.N; i++) { cx += n[i].x; cy += n[i].y; }
  cx /= this.N; cy /= this.N;
  for (i = 0; i < this.N; i++) {
    var p = n[i];
    var wx = (jNoise(p.x * 1.3, p.y * 1.3, t * 0.4 + this.phase) - 0.5) * 0.5;
    var wy = (jNoise(p.x * 1.3 + 31, p.y * 1.3 + 17, t * 0.4 + this.phase) - 0.5) * 0.42;
    var ax = wx + (tx - cx) * 0.32 + Math.sin(t * 0.9 + i * 0.4 + this.phase) * 0.05;
    var ay = wy + (ty - cy) * 0.32;
    // Cursor schiebt die Seide beiseite
    var dxp = p.x - pointer.x, dyp = p.y - pointer.y;
    var d2 = dxp * dxp + dyp * dyp;
    if (pointer.on && d2 < 0.16) { var f = (0.16 - d2) * 5; ax += dxp * f; ay += dyp * f; }
    var nx = p.x + (p.x - p.px) * 0.975 + ax * dt * dt;
    var ny = p.y + (p.y - p.py) * 0.975 + ay * dt * dt;
    p.px = p.x; p.py = p.y; p.x = nx; p.y = ny;
  }
  for (var k = 0; k < 3; k++) {
    for (i = 0; i < this.N - 1; i++) {
      var a = n[i], b = n[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y;
      var dist = Math.hypot(dx, dy) || 1e-5;
      var diff = (dist - L) / dist * 0.5;
      a.x += dx * diff; a.y += dy * diff;
      b.x -= dx * diff; b.y -= dy * diff;
    }
  }
  // Triangle-Strip extrudieren (Breite atmet zu den Enden aus)
  for (i = 0; i < this.N; i++) {
    var p0 = n[Math.max(0, i - 1)], p1 = n[Math.min(this.N - 1, i + 1)];
    var ddx = p1.x - p0.x, ddy = p1.y - p0.y;
    var dl = Math.hypot(ddx, ddy) || 1e-5;
    var w = this.width * Math.sin(Math.PI * (i / (this.N - 1)));
    var oxn = -ddy / dl * w, oyn = ddx / dl * w;
    var u = i / (this.N - 1), o = i * 8;
    this.verts[o] = n[i].x + oxn; this.verts[o + 1] = n[i].y + oyn;
    this.verts[o + 2] = u; this.verts[o + 3] = 0;
    this.verts[o + 4] = n[i].x - oxn; this.verts[o + 5] = n[i].y - oyn;
    this.verts[o + 6] = u; this.verts[o + 7] = 1;
  }
};
var ribbons = [new Ribbon(0.72, 0, 0.021, 0.55), new Ribbon(0.86, 3.7, 0.014, 0.4)];

/* Cursor-Goldfaden: ein Seidenfaden aus Gold hängt am Zeiger und
   zieht als Verlet-Kette mit Schwerkraft und Trägheit hinterher */
function CursorThread() {
  this.par = 0; this.alpha = 0; this.N = 30;
  this.nodes = [];
  for (var i = 0; i < this.N; i++) this.nodes.push({ x: 0, y: 0, px: 0, py: 0 });
  this.verts = new Float32Array(this.N * 2 * 4);
  this.fine = window.matchMedia('(pointer:fine)').matches;
}
CursorThread.prototype.update = function (dt, t) {
  var tgtA = (this.fine && pointer.on) ? 0.38 : 0;
  var wake = this.alpha < 0.02 && tgtA > 0;
  this.alpha += (tgtA - this.alpha) * Math.min(1, dt * 3);
  if (this.alpha < 0.01) return;
  var n = this.nodes, L = 0.016, i;
  if (wake) {
    for (i = 0; i < this.N; i++) {
      n[i].x = n[i].px = pointer.x;
      n[i].y = n[i].py = pointer.y;
    }
  }
  n[0].px = n[0].x; n[0].py = n[0].y;
  n[0].x = pointer.x; n[0].y = pointer.y;
  for (i = 1; i < this.N; i++) {
    var p = n[i];
    var wob = (jNoise(p.x * 2.1, p.y * 2.1, t * 0.6 + i) - 0.5) * 0.3;
    var nx = p.x + (p.x - p.px) * 0.94 + wob * dt * dt;
    var ny = p.y + (p.y - p.py) * 0.94 - 0.5 * dt * dt;   // Seide sinkt sanft
    p.px = p.x; p.py = p.y; p.x = nx; p.y = ny;
  }
  for (var k = 0; k < 3; k++) {
    for (i = 1; i < this.N; i++) {
      var a = n[i - 1], b = n[i];
      var dx = b.x - a.x, dy = b.y - a.y;
      var dist = Math.hypot(dx, dy) || 1e-5;
      b.x = a.x + dx / dist * L;
      b.y = a.y + dy / dist * L;
    }
  }
  for (i = 0; i < this.N; i++) {
    var p0 = n[Math.max(0, i - 1)], p1 = n[Math.min(this.N - 1, i + 1)];
    var ddx = p1.x - p0.x, ddy = p1.y - p0.y;
    var dl = Math.hypot(ddx, ddy) || 1e-5;
    var u = i / (this.N - 1);
    var w = 0.0085 * (1 - u * 0.85);
    var oxn = -ddy / dl * w, oyn = ddx / dl * w;
    var o = i * 8;
    this.verts[o] = n[i].x + oxn; this.verts[o + 1] = n[i].y + oyn;
    this.verts[o + 2] = u; this.verts[o + 3] = 0;
    this.verts[o + 4] = n[i].x - oxn; this.verts[o + 5] = n[i].y - oyn;
    this.verts[o + 6] = u; this.verts[o + 7] = 1;
  }
};
ribbons.push(new CursorThread());

/* -------------------- Per-Letter-Physik (Logo + Hero-Titel, AAA UI) */
var Letters = (function () {
  var items = [];
  function split(el) {
    if (!el || el.dataset.nfSplit) return;
    el.dataset.nfSplit = '1';
    var txt = el.textContent;
    el.textContent = '';
    Array.prototype.forEach.call(txt, function (ch) {
      var s = document.createElement('span');
      s.className = 'nf-letter';
      s.textContent = ch;
      el.appendChild(s);
      items.push({ el: s, x: 0, y: 0, vx: 0, vy: 0 });
    });
  }
  function init() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.logo-text').forEach(split);
    split(document.querySelector('.hero-title .title-line:first-child .title-word'));
  }
  var mx = -1e4, my = -1e4;
  window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
  function update(dt) {
    if (!items.length) return;
    var R = 120, k = 130, damp = 11;
    for (var i = 0; i < items.length; i++) {
      var l = items[i];
      var r = l.el.getBoundingClientRect();
      if (r.width === 0) continue;
      var cx = r.left + r.width / 2 - l.x, cy = r.top + r.height / 2 - l.y;
      var dx = cx - mx, dy = cy - my;
      var d = Math.hypot(dx, dy);
      var fx = 0, fy = 0;
      if (d < R && d > 0.01) {
        var f = (1 - d / R) * 2400;
        fx = dx / d * f; fy = dy / d * f;
      }
      l.vx += (fx - l.x * k - l.vx * damp) * dt;
      l.vy += (fy - l.y * k - l.vy * damp) * dt;
      l.x += l.vx * dt; l.y += l.vy * dt;
      if (Math.abs(l.x) > 0.1 || Math.abs(l.y) > 0.1 || Math.abs(l.vx) + Math.abs(l.vy) > 1) {
        l.el.style.transform = 'translate(' + l.x.toFixed(1) + 'px,' + l.y.toFixed(1) + 'px) rotate(' + (l.x * 0.15).toFixed(2) + 'deg)';
      } else if (l.el.style.transform) {
        l.el.style.transform = '';
      }
    }
  }
  init();
  return { update: update };
})();

/* ---------------- Karten-Physik: 3D-Tilt mit Feder-Trägheit ----------------
   Karten besitzen Masse: der Tilt folgt der Maus über eine gedämpfte Feder,
   der Hover-Lift federt nach. Übernimmt transform komplett (CSS-Override oben). */
var Cards = (function () {
  var items = [];
  function init() {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    var els = document.querySelectorAll('.service-card,.why-card,.work-card');
    Array.prototype.forEach.call(els, function (el) {
      var it = { el: el, rx: 0, ry: 0, lf: 0, vrx: 0, vry: 0, vlf: 0,
                 trx: 0, tyr: 0, tlf: 0, on: false, live: false };
      el.addEventListener('pointerenter', function () {
        it.on = true; it.tlf = -7;
        el.classList.add('nf-tilting');
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
        var py = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
        it.tyr = px * 6.5; it.trx = -py * 5.5;
      }, { passive: true });
      el.addEventListener('pointerleave', function () {
        it.on = false; it.trx = 0; it.tyr = 0; it.tlf = 0;
      });
      items.push(it);
    });
  }
  function update(dt) {
    var k = 130, dmp = 14;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.on && !it.live) continue;
      it.vrx += ((it.trx - it.rx) * k - it.vrx * dmp) * dt;
      it.vry += ((it.tyr - it.ry) * k - it.vry * dmp) * dt;
      it.vlf += ((it.tlf - it.lf) * k - it.vlf * dmp) * dt;
      it.rx += it.vrx * dt; it.ry += it.vry * dt; it.lf += it.vlf * dt;
      var idle = !it.on && Math.abs(it.rx) < 0.02 && Math.abs(it.ry) < 0.02 &&
                 Math.abs(it.lf) < 0.05 &&
                 Math.abs(it.vrx) + Math.abs(it.vry) + Math.abs(it.vlf) < 0.1;
      if (idle) {
        it.live = false;
        it.el.style.transform = '';
        it.el.classList.remove('nf-tilting');
        continue;
      }
      it.live = true;
      it.el.style.transform = 'perspective(950px) translateY(' + it.lf.toFixed(2) +
        'px) rotateX(' + it.rx.toFixed(2) + 'deg) rotateY(' + it.ry.toFixed(2) + 'deg)';
    }
  }
  init();
  return { update: update };
})();

/* -------------- Info-Slates: Glas-Tafeln, die die Fahrt lesbar machen --------------
   Inhalte materialisieren als Glas-Paneele (CSS oben), und die Engine dimmt ihr
   Licht hinter jeder Tafel ab — die goldene Halle weicht dem Text aus. Bis zu
   6 sichtbare Tafeln wandern pro Frame als UV-Rechtecke in den Composite-Shader. */
var SLABS_MAX = 6;
var slabArr = new Float32Array(SLABS_MAX * 4);
var slabWArr = new Float32Array(SLABS_MAX);
var Slates = (function () {
  var items = [];
  function init() {
    var els = document.querySelectorAll(
      '.section-header,.intro-lead,.intro-body,.pull-quote,.cta-container,.teaser-content,.page-hero');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var it = e.target.__nfSlate;
        if (!it) return;
        it.vis = e.isIntersecting;
        if (e.isIntersecting) e.target.classList.add('nf-slate-in');
      });
    }, { rootMargin: '10% 0px 10% 0px' });
    Array.prototype.forEach.call(els, function (el) {
      el.classList.add('nf-slate');
      var it = { el: el, vis: false, w: 0 };
      el.__nfSlate = it;
      items.push(it);
      io.observe(el);
    });
  }
  function update(dt) {
    var n = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      it.w += ((it.vis ? 1 : 0) - it.w) * Math.min(1, dt * 5);
      if (n >= SLABS_MAX || it.w < 0.02) continue;
      var r = it.el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > window.innerHeight + 40 || r.width === 0) continue;
      slabArr[n * 4]     = r.left / window.innerWidth;
      slabArr[n * 4 + 1] = 1 - r.bottom / window.innerHeight;
      slabArr[n * 4 + 2] = r.right / window.innerWidth;
      slabArr[n * 4 + 3] = 1 - r.top / window.innerHeight;
      slabWArr[n] = it.w;
      n++;
    }
    for (var k = n; k < SLABS_MAX; k++) {
      slabWArr[k] = 0;
      slabArr[k * 4] = 0; slabArr[k * 4 + 1] = 0; slabArr[k * 4 + 2] = 0; slabArr[k * 4 + 3] = 0;
    }
  }
  init();
  return { update: update };
})();

/* ---------- Museums-Plakette: Live-Info zum Exponat während der Fahrt ----------
   Rechnet dieselbe Zellen-Hash-Formel wie der Shader nach und zeigt an,
   welche Vitrine die Kamera gerade passiert. */
var Plaque = (function () {
  var el = document.createElement('div');
  el.className = 'nf-plaque';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  var WERKE = ['Werk I · Der Rahmen', 'Werk II · Die Sphäre', 'Werk III · Der Monolith'];
  var lastCell = -1, shown = false;
  function nh(n) { var s = Math.sin(n) * 43758.5453123; return s - Math.floor(s); }
  function update() {
    var travel = Math.min(1, Math.max(0, (scrollProgress - 0.03) / 0.17));
    var want = travel > 0.6;
    if (want !== shown) { shown = want; el.classList.toggle('on', want); }
    if (!want) return;
    var count = Math.round(scrollProgress * hallLen / 6);
    if (count === lastCell) return;
    lastCell = count;
    var endc = Math.round(hallLen / 6);
    var kind = (count === 0 || count === endc) ? 0 : Math.floor(nh(-count * 3.7 + 1.3) * 3);
    var num = String(count + 1);
    el.textContent = 'Vitrine ' + (num.length < 2 ? '0' + num : num) + ' — ' + WERKE[kind];
  }
  return { update: update };
})();

/* ------------- Fahrt-Letterbox: Kino-Balken folgen dem Scroll-Tempo -------------
   Schnelles Scrollen = die Fahrt „schneidet" ins Breitbild; steht die Kamera,
   ziehen sich die Balken wieder zurück. */
var Letterbox = (function () {
  var t = document.createElement('div'); t.className = 'nf-lbx nf-lbx-t';
  var b = document.createElement('div'); b.className = 'nf-lbx nf-lbx-b';
  t.setAttribute('aria-hidden', 'true'); b.setAttribute('aria-hidden', 'true');
  document.body.appendChild(t); document.body.appendChild(b);
  var v = 0;
  function update(dt) {
    var tgt = Math.max(0, Math.min(0.8, (Math.abs(scrollWind) - 0.16) * 3));
    v += (tgt - v) * Math.min(1, dt * (tgt > v ? 6 : 2.2));
    if (v < 0.002) { v = 0; }
    var off = (1 - v) * 101;
    t.style.transform = 'translateY(' + (-off).toFixed(1) + '%)';
    b.style.transform = 'translateY(' + off.toFixed(1) + '%)';
  }
  return { update: update };
})();

/* Gold-Aura: Primär-Buttons hauchen beim Hover eine goldene Fluid-Fahne aus */
var lastAura = 0;
document.addEventListener('pointerover', function (e) {
  if (!e.target || !e.target.closest) return;
  var b = e.target.closest('.btn-primary,.nav-cta,.mobile-menu-cta,.newsletter-btn,.cookie-accept');
  if (!b || !FLUID_OK || !fl) return;
  var now = performance.now();
  if (now - lastAura < 450) return;
  lastAura = now;
  var r = b.getBoundingClientRect();
  var cx = (r.left + r.width / 2) / window.innerWidth;
  var cy = 1 - (r.top + r.height / 2) / window.innerHeight;
  splatQueue.push({ x: cx, y: cy, dx: 0, dy: 0.035, r: 0.003, col: [0, 0, 0], vel: true });
  splatQueue.push({ x: cx, y: cy, dx: 0, dy: 0, r: 0.0035, col: [0.16, 0.12, 0.05], vel: false });
}, true);

/* ------------------------------------------------- Audio-Score-Engine */
var Score = (function () {
  var ctx = null, master = null, analyser = null, freqData = null, on = false;
  var padOscs = [], chordTimer = null, pingTimer = null, noiseGain = null, filter = null;
  var CHORDS = [
    [110.00, 164.81, 220.00, 261.63],   // A-Moll
    [98.00, 146.83, 196.00, 246.94],    // G-Dur
    [87.31, 130.81, 174.61, 220.00],    // F-Dur
    [110.00, 164.81, 207.65, 261.63]    // A-Moll/maj-Färbung
  ];
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    analyser = ctx.createAnalyser(); analyser.fftSize = 256;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    // Drone
    [55, 55.4].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = i ? 0.05 : 0.08;
      o.connect(g); g.connect(master); o.start();
    });
    // Pad
    filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
    filter.frequency.value = 520; filter.Q.value = 0.7;
    filter.connect(master);
    CHORDS[0].forEach(function (f) {
      var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = 0.035;
      o.connect(g); g.connect(filter); o.start();
      padOscs.push(o);
    });
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    var lfoG = ctx.createGain(); lfoG.gain.value = 260;
    lfo.connect(lfoG); lfoG.connect(filter.frequency); lfo.start();
    // Luft (gefiltertes Rauschen)
    var nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    var d = nb.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = 620; bp.Q.value = 0.6;
    noiseGain = ctx.createGain(); noiseGain.gain.value = 0.012;
    ns.connect(bp); bp.connect(noiseGain); noiseGain.connect(master); ns.start();
    var nlfo = ctx.createOscillator(); nlfo.frequency.value = 0.08;
    var nlfoG = ctx.createGain(); nlfoG.gain.value = 0.009;
    nlfo.connect(nlfoG); nlfoG.connect(noiseGain.gain); nlfo.start();
    // Akkordwechsel
    var ci = 0;
    chordTimer = setInterval(function () {
      ci = (ci + 1) % CHORDS.length;
      CHORDS[ci].forEach(function (f, i) {
        if (padOscs[i]) padOscs[i].frequency.setTargetAtTime(f, ctx.currentTime, 3.5);
      });
    }, 16000);
    // Glitzer-Pings
    var PENTA = [880, 1108.73, 1318.51, 1760, 2217.46];
    pingTimer = setInterval(function () {
      if (!on) return;
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.value = PENTA[(Math.random() * PENTA.length) | 0];
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.6);
      o.connect(g); g.connect(master);
      o.start(); o.stop(ctx.currentTime + 2.8);
    }, 5200 + Math.random() * 3000);
  }
  function start() {
    if (!ctx) { try { build(); } catch (e) { console.warn('[NF·Engine] Audio nicht verfügbar', e); return; } }
    ctx.resume().then(function () {
      on = true;
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
    });
  }
  function stop() {
    if (!ctx) return;
    on = false;
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  }
  function level() {
    if (!on || !analyser) return 0;
    analyser.getByteFrequencyData(freqData);
    var s = 0;
    for (var i = 2; i < 40; i++) s += freqData[i];
    return Math.min(1, (s / 38 / 255) * 2.2);
  }
  return {
    start: start, stop: stop, level: level,
    isOn: function () { return on; }
  };
})();

/* Score-Button */
var scoreBtn = document.createElement('button');
scoreBtn.className = 'nf-score';
scoreBtn.type = 'button';
scoreBtn.title = 'Filmmusik an/aus (generativer Score)';
scoreBtn.setAttribute('aria-pressed', 'false');
scoreBtn.textContent = '♪ Score';
document.body.appendChild(scoreBtn);
setTimeout(function () { scoreBtn.classList.add('show'); }, freshIntro ? 7200 : 1500);
scoreBtn.addEventListener('click', function () {
  if (Score.isOn()) {
    Score.stop();
    scoreBtn.classList.remove('on');
    scoreBtn.setAttribute('aria-pressed', 'false');
    try { sessionStorage.removeItem('nf_score'); } catch (e) {}
  } else {
    Score.start();
    scoreBtn.classList.add('on');
    scoreBtn.setAttribute('aria-pressed', 'true');
    try { sessionStorage.setItem('nf_score', '1'); } catch (e) {}
  }
});
/* Score lief auf der letzten Seite → beim ersten Klick/Tap weiterspielen */
try {
  if (sessionStorage.getItem('nf_score') === '1') {
    var resume = function () {
      Score.start();
      scoreBtn.classList.add('on');
      scoreBtn.setAttribute('aria-pressed', 'true');
      document.removeEventListener('pointerdown', resume);
    };
    document.addEventListener('pointerdown', resume, { once: true });
  }
} catch (e) {}

/* -------------- Director's Cut: die Seite spielt sich selbst ab --------------
   Eine langsame, gleichmäßige Kamerafahrt durch die ganze Ausstellung —
   inklusive Score. Jede Nutzer-Eingabe (Scrollen, Tippen, Taste) stoppt sofort. */
var Director = (function () {
  /* Kein „▶ Film"-Schalter mehr auf den Seiten — der Director's Cut existiert
     nur noch als Mechanik hinter der Showcase-Live-Demo (?film=1 / #film). */
  var playing = false, raf = 0, lastT = 0;
  function stop() {
    if (!playing) return;
    playing = false;
    document.documentElement.style.scrollBehavior = '';
    cancelAnimationFrame(raf);
  }
  function tick(now) {
    if (!playing) return;
    var dt = Math.min(0.1, (now - lastT) / 1000);
    lastT = now;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var v = 58 + Math.min(46, window.innerHeight * 0.035);   // px/s — gemächliche Fahrt
    window.scrollTo(0, window.scrollY + v * dt);
    if (window.scrollY >= max - 2) { stop(); return; }
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (playing) return;
    playing = true;
    if (!Score.isOn()) scoreBtn.click();   // der Film läuft mit Musik
    /* CSS scroll-behavior:smooth würde die Mini-Schritte der Fahrt verschlucken —
       während des Films fährt die Kamera selbst, also direkt scrollen */
    document.documentElement.style.scrollBehavior = 'auto';
    lastT = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function userStop() { stop(); }
  window.addEventListener('wheel', userStop, { passive: true });
  window.addEventListener('touchstart', userStop, { passive: true });
  window.addEventListener('keydown', userStop);
  document.addEventListener('pointerdown', userStop, true);
  return { start: start, stop: stop, isOn: function () { return playing; } };
})();

/* „Bloßer Link-Klick": #film bzw. ?film=1 startet den Director's Cut von
   selbst — die Seite spielt sich ab, sobald sie geladen ist. (Der Score
   klinkt sich ein, sobald der Browser Audio erlaubt; jede Eingabe stoppt.) */
if (AUTOFILM) {
  setTimeout(function () {
    if (!Director.isOn()) Director.start();
  }, freshIntro ? 7600 : 1400);
}

/* HUD */
var hud = document.createElement('div');
hud.className = 'nf-hud';
hud.setAttribute('aria-hidden', 'true');
document.body.appendChild(hud);
setTimeout(function () { hud.classList.add('on'); }, freshIntro ? 7200 : 1200);
function fmtHud() {
  var t = tier();
  hud.textContent = 'NF·Engine v3 — ' + Math.round(t.n / 1000) + 'K Partikel · ' +
    (FLUID_OK ? 'Fluid ' + t.fluid + '²' : 'Fluid aus') +
    (t.sdf ? ' · Atelier' : '') + ' · ' +
    Math.round(fpsNow) + ' FPS · ' + t.name;
}

/* --------------------------------------------------------- Fluid-Step */
function fluidStep(dt) {
  if (!FLUID_OK || !fl) return;
  gl.disable(gl.BLEND);
  // Splats
  while (splatQueue.length) {
    var s = splatQueue.shift();
    if (s.vel) {
      gl.useProgram(pSplat.p);
      bindFBO(fl.vel.b);
      bindTex(0, fl.vel.a.t);
      gl.uniform1i(pSplat.u('u_t'), 0);
      gl.uniform2f(pSplat.u('u_point'), s.x, s.y);
      gl.uniform3f(pSplat.u('u_color'), s.dx, s.dy, 0);
      gl.uniform1f(pSplat.u('u_radius'), s.r);
      gl.uniform1f(pSplat.u('u_aspect'), aspect);
      drawQuad();
      fl.vel.swap();
    }
    if (s.col[0] + s.col[1] + s.col[2] > 0) {
      gl.useProgram(pSplat.p);
      bindFBO(fl.dye.b);
      bindTex(0, fl.dye.a.t);
      gl.uniform1i(pSplat.u('u_t'), 0);
      gl.uniform2f(pSplat.u('u_point'), s.x, s.y);
      gl.uniform3f(pSplat.u('u_color'), s.col[0], s.col[1], s.col[2]);
      gl.uniform1f(pSplat.u('u_radius'), s.r * 1.6);
      gl.uniform1f(pSplat.u('u_aspect'), aspect);
      drawQuad();
      fl.dye.swap();
    }
  }
  // Vorticity Confinement
  gl.useProgram(pCurl.p);
  bindFBO(fl.curl);
  bindTex(0, fl.vel.a.t);
  gl.uniform1i(pCurl.u('u_vel'), 0);
  gl.uniform2f(pCurl.u('u_texel'), fl.texel[0], fl.texel[1]);
  drawQuad();
  gl.useProgram(pVort.p);
  bindFBO(fl.vel.b);
  bindTex(0, fl.vel.a.t); bindTex(1, fl.curl.t);
  gl.uniform1i(pVort.u('u_vel'), 0);
  gl.uniform1i(pVort.u('u_curl'), 1);
  gl.uniform2f(pVort.u('u_texel'), fl.texel[0], fl.texel[1]);
  gl.uniform1f(pVort.u('u_dt'), dt);
  gl.uniform1f(pVort.u('u_str'), 14);
  drawQuad();
  fl.vel.swap();
  // Divergenz
  gl.useProgram(pDiv.p);
  bindFBO(fl.div);
  bindTex(0, fl.vel.a.t);
  gl.uniform1i(pDiv.u('u_vel'), 0);
  gl.uniform2f(pDiv.u('u_texel'), fl.texel[0], fl.texel[1]);
  drawQuad();
  // Druck abklingen lassen und Jacobi-Iterationen
  gl.useProgram(pCopy.p);
  bindFBO(fl.prs.b);
  bindTex(0, fl.prs.a.t);
  gl.uniform1i(pCopy.u('u_t'), 0);
  gl.uniform1f(pCopy.u('u_mult'), 0.8);
  drawQuad();
  fl.prs.swap();
  gl.useProgram(pJac.p);
  gl.uniform2f(pJac.u('u_texel'), fl.texel[0], fl.texel[1]);
  for (var i = 0; i < tier().jac; i++) {
    bindFBO(fl.prs.b);
    bindTex(0, fl.prs.a.t); bindTex(1, fl.div.t);
    gl.uniform1i(pJac.u('u_p'), 0);
    gl.uniform1i(pJac.u('u_div'), 1);
    drawQuad();
    fl.prs.swap();
  }
  // Gradient abziehen
  gl.useProgram(pGrad.p);
  bindFBO(fl.vel.b);
  bindTex(0, fl.prs.a.t); bindTex(1, fl.vel.a.t);
  gl.uniform1i(pGrad.u('u_p'), 0);
  gl.uniform1i(pGrad.u('u_vel'), 1);
  gl.uniform2f(pGrad.u('u_texel'), fl.texel[0], fl.texel[1]);
  drawQuad();
  fl.vel.swap();
  // Advektion (Geschwindigkeit, dann Farbe)
  gl.useProgram(pAdv.p);
  bindFBO(fl.vel.b);
  bindTex(0, fl.vel.a.t); bindTex(1, fl.vel.a.t);
  gl.uniform1i(pAdv.u('u_vel'), 0);
  gl.uniform1i(pAdv.u('u_src'), 1);
  gl.uniform1f(pAdv.u('u_dt'), dt);
  gl.uniform1f(pAdv.u('u_diss'), 0.35);
  drawQuad();
  fl.vel.swap();
  gl.useProgram(pAdv.p);
  bindFBO(fl.dye.b);
  bindTex(0, fl.vel.a.t); bindTex(1, fl.dye.a.t);
  gl.uniform1i(pAdv.u('u_vel'), 0);
  gl.uniform1i(pAdv.u('u_src'), 1);
  gl.uniform1f(pAdv.u('u_dt'), dt);
  gl.uniform1f(pAdv.u('u_diss'), 0.6);
  drawQuad();
  fl.dye.swap();
}

/* ------------------------------------------------------ Partikel-Step */
function particleStep(dt) {
  gl.useProgram(pSim.p);
  gl.uniform1f(pSim.u('u_dt'), dt);
  gl.uniform1f(pSim.u('u_time'), simTime);
  gl.uniform1f(pSim.u('u_aspect'), aspect);
  gl.uniform1f(pSim.u('u_phase'), phase);
  gl.uniform1f(pSim.u('u_wind'), scrollWind);
  gl.uniform1f(pSim.u('u_fluidOn'), FLUID_OK && fl ? 1 : 0);
  gl.uniform1f(pSim.u('u_pointerOn'), pointer.on);
  gl.uniform1f(pSim.u('u_charge'), charge);
  gl.uniform2f(pSim.u('u_chargePt'), chargePt[0], chargePt[1]);
  gl.uniform4f(pSim.u('u_pointer'), pointer.x, pointer.y, pointer.vx, pointer.vy);
  gl.uniform4f(pSim.u('u_burst'), burst.x, burst.y, burst.str, 0);
  gl.uniform4fv(pSim.u('u_waves'), wavesArr);
  if (FLUID_OK && fl) { bindTex(0, fl.vel.a.t); gl.uniform1i(pSim.u('u_fluid'), 0); }
  // TF-Zielpuffer dürfen an keinem anderen Bindepunkt hängen (ANGLE-Validierung)
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.enable(gl.RASTERIZER_DISCARD);
  gl.bindVertexArray(pingA ? vaoSimA : vaoSimB);
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, pingA ? tfToB : tfToA);
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, tier().n);
  gl.endTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
  gl.bindVertexArray(null);
  gl.disable(gl.RASTERIZER_DISCARD);
  pingA = !pingA;
  burst.str = 0;   // Burst wirkt genau einen Sim-Frame
}

/* ------------------------------------------------------------- Render */
function render(dt) {
  // 1) Trails: vorheriges Bild framerate-unabhängig abklingen lassen
  gl.disable(gl.BLEND);
  gl.useProgram(pCopy.p);
  bindFBO(scene.b);
  bindTex(0, scene.a.t);
  gl.uniform1i(pCopy.u('u_t'), 0);
  gl.uniform1f(pCopy.u('u_mult'), Math.exp(-9.5 * dt));
  drawQuad();

  // 1b) Atelier-Showroom (halbe Auflösung) rendern und additiv einblenden
  var sdfOn = tier().sdf && sdfFade > 0.02;
  if (sdfOn) {
    gl.useProgram(pSDF.p);
    bindFBO(sdfT);
    gl.uniform1f(pSDF.u('u_aspect'), aspect);
    gl.uniform1f(pSDF.u('u_time'), simTime);
    gl.uniform1f(pSDF.u('u_fade'), sdfFade);
    gl.uniform1f(pSDF.u('u_refl'), tier().refl);
    gl.uniform1i(pSDF.u('u_vol'), tier().vol);
    gl.uniform1f(pSDF.u('u_scroll'), scrollProgress);
    gl.uniform1f(pSDF.u('u_hall'), hallLen);
    gl.uniform1f(pSDF.u('u_audio'), audioLevel);
    gl.uniform1f(pSDF.u('u_speed'), scrollWind);
    // u_pos.x = Seitenabstand-Skalierung der Vitrinen (Portrait enger),
    // u_pos.y = Bildachsen-Shift im Hero (Monument links, Portrait mittig)
    gl.uniform2f(pSDF.u('u_pos'), aspect > 1.05 ? 1 : 0.72, aspect > 1.05 ? 0.55 : 0);
    gl.uniform2f(pSDF.u('u_cam'), cam.x, cam.y);
    gl.uniform2f(pSDF.u('u_mouse'), mSmooth.x, mSmooth.y);
    drawQuad();
  }
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  bindFBO(scene.b);
  if (sdfOn) {
    gl.useProgram(pCopy.p);
    bindTex(0, sdfT.t);
    gl.uniform1i(pCopy.u('u_t'), 0);
    gl.uniform1f(pCopy.u('u_mult'), 1);
    drawQuad();
  }

  // 1c) Soft-Body-Seidenbänder
  gl.useProgram(pRib.p);
  gl.uniform1f(pRib.u('u_aspect'), aspect);
  gl.uniform1f(pRib.u('u_zoom'), cam.zoom);
  gl.uniform1f(pRib.u('u_time'), simTime);
  gl.uniform2f(pRib.u('u_cam'), cam.x, cam.y);
  gl.bindVertexArray(ribGeo.vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, ribGeo.buf);
  for (var ri = 0; ri < ribbons.length; ri++) {
    var rb = ribbons[ri];
    gl.uniform1f(pRib.u('u_par'), rb.par);
    gl.uniform1f(pRib.u('u_alpha'), rb.alpha * (1 - contentCalm * 0.5));
    gl.bufferData(gl.ARRAY_BUFFER, rb.verts, gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, rb.N * 2);
  }
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // 2) Partikel additiv
  gl.useProgram(pPart.p);
  gl.uniform1f(pPart.u('u_aspect'), aspect);
  gl.uniform1f(pPart.u('u_zoom'), cam.zoom);
  gl.uniform1f(pPart.u('u_focus'), cam.focus);
  gl.uniform1f(pPart.u('u_time'), simTime);
  gl.uniform1f(pPart.u('u_px'), canvas.height / 900);
  gl.uniform1f(pPart.u('u_audio'), audioLevel);
  gl.uniform1f(pPart.u('u_density'), Math.min(1, 28000 / tier().n));
  gl.uniform1f(pPart.u('u_scrollZ'), scrollZ);
  gl.uniform1f(pPart.u('u_calm'), contentCalm);
  gl.uniform2f(pPart.u('u_cam'), cam.x, cam.y);
  gl.bindVertexArray(pingA ? vaoRenA : vaoRenB);
  gl.drawArrays(gl.POINTS, 0, tier().n);
  gl.bindVertexArray(null);

  // 2b) Blitze + Meteore (Linien, Bloom übernimmt das Leuchten)
  if (bolts.length || meteors.length) {
    gl.useProgram(pLine.p);
    gl.uniform1f(pLine.u('u_aspect'), aspect);
    gl.uniform1f(pLine.u('u_zoom'), cam.zoom);
    gl.uniform1f(pLine.u('u_par'), 0.8);
    gl.uniform2f(pLine.u('u_cam'), cam.x, cam.y);
    gl.bindVertexArray(lineGeo.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineGeo.buf);
    var px = 2 / canvas.width, py = 2 / canvas.height;
    var offs = [[0, 0], [px, 0], [-px, 0], [0, py], [0, -py]];
    function strokeStrip(arr, col, alpha) {
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW);
      for (var k = 0; k < offs.length; k++) {
        gl.uniform2f(pLine.u('u_off'), offs[k][0], offs[k][1]);
        gl.uniform3f(pLine.u('u_col'), col[0], col[1], col[2]);
        gl.uniform1f(pLine.u('u_alpha'), alpha * (k === 0 ? 1 : 0.45));
        gl.drawArrays(gl.LINE_STRIP, 0, arr.length / 3);
      }
    }
    bolts.forEach(function (b) {
      var age = (simTime - b.t0) / b.dur;
      var flick = 0.55 + 0.45 * Math.sin(simTime * 90 + b.seed * 20);
      var a = b.alpha * flick * (1 - age) * 2.2;
      b.strips.forEach(function (s) { strokeStrip(s, [1, 0.92, 0.7], a); });
    });
    meteors.forEach(function (m) {
      if (m.trail.length < 2) return;
      var arr = new Float32Array(m.trail.length * 3);
      for (var j = 0; j < m.trail.length; j++) {
        arr[j * 3] = m.trail[j][0];
        arr[j * 3 + 1] = m.trail[j][1];
        arr[j * 3 + 2] = Math.pow(j / (m.trail.length - 1), 2);
      }
      var lifeA = Math.min(1, (m.dur - (simTime - m.t0)) * 2);
      strokeStrip(arr, [1, 0.9, 0.65], 1.6 * lifeA);
    });
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  gl.disable(gl.BLEND);
  scene.swap();
  var sceneTex = scene.a.t;

  // 2c) Auto-Exposure: Luminanz messen + zeitlich adaptieren
  gl.useProgram(pAvg.p);
  bindFBO(lumT);
  bindTex(0, sceneTex);
  gl.uniform1i(pAvg.u('u_t'), 0);
  drawQuad();
  gl.useProgram(pAdapt.p);
  bindFBO(adapt.b);
  bindTex(0, lumT.t); bindTex(1, adapt.a.t);
  gl.uniform1i(pAdapt.u('u_lum'), 0);
  gl.uniform1i(pAdapt.u('u_prev'), 1);
  gl.uniform1f(pAdapt.u('u_k'), 1 - Math.exp(-dt * 1.6));
  drawQuad();
  adapt.swap();

  // 3) Brightpass
  gl.useProgram(pBright.p);
  bindFBO(bright);
  bindTex(0, sceneTex);
  gl.uniform1i(pBright.u('u_t'), 0);
  gl.uniform1f(pBright.u('u_th'), BLOOM_TH);
  drawQuad();

  // 4) God Rays (Viertel-Auflösung)
  var lightUv = [((lightW[0] / aspect) + 1) * 0.5, (lightW[1] + 1) * 0.5];
  gl.useProgram(pRays.p);
  bindFBO(raysT);
  bindTex(0, bright.t);
  gl.uniform1i(pRays.u('u_t'), 0);
  gl.uniform2f(pRays.u('u_lightUv'), lightUv[0], lightUv[1]);
  gl.uniform1i(pRays.u('u_n'), tier().rays);
  gl.uniform1f(pRays.u('u_w'), 0.05 * (1 + audioLevel * 0.8));
  drawQuad();

  // 5) Bloom-Pyramide (½ → ¼ → ⅛)
  function blurInto(dbl, srcTex) {
    gl.useProgram(pBlur.p);
    gl.uniform1i(pBlur.u('u_t'), 0);
    bindFBO(dbl.a);
    bindTex(0, srcTex);
    gl.uniform2f(pBlur.u('u_dir'), 1 / dbl.a.w, 0);
    drawQuad();
    bindFBO(dbl.b);
    bindTex(0, dbl.a.t);
    gl.uniform2f(pBlur.u('u_dir'), 0, 1 / dbl.a.h);
    drawQuad();
    return dbl.b.t;
  }
  var b0 = blurInto(blur0, bright.t);
  gl.useProgram(pCopy.p);
  bindFBO(blur1.b);
  bindTex(0, b0);
  gl.uniform1i(pCopy.u('u_t'), 0);
  gl.uniform1f(pCopy.u('u_mult'), 1);
  drawQuad();
  var b1 = blurInto(blur1, blur1.b.t);
  gl.useProgram(pCopy.p);
  bindFBO(blur2.b);
  bindTex(0, b1);
  gl.uniform1i(pCopy.u('u_t'), 0);
  gl.uniform1f(pCopy.u('u_mult'), 1);
  drawQuad();
  var b2 = blurInto(blur2, blur2.b.t);

  // 6) Anamorphotische Streaks
  gl.useProgram(pAna.p);
  bindFBO(anaT);
  bindTex(0, bright.t);
  gl.uniform1i(pAna.u('u_t'), 0);
  gl.uniform1f(pAna.u('u_texelX'), 1 / bright.w);
  drawQuad();

  // 7) Composite (inkl. Volumetrik) → Canvas
  gl.useProgram(pComp.p);
  bindFBO(null);
  bindTex(0, sceneTex); gl.uniform1i(pComp.u('u_scene'), 0);
  bindTex(1, b0); gl.uniform1i(pComp.u('u_b0'), 1);
  bindTex(2, b1); gl.uniform1i(pComp.u('u_b1'), 2);
  bindTex(3, b2); gl.uniform1i(pComp.u('u_b2'), 3);
  bindTex(4, raysT.t); gl.uniform1i(pComp.u('u_rays'), 4);
  bindTex(5, anaT.t); gl.uniform1i(pComp.u('u_ana'), 5);
  bindTex(6, dirtTex); gl.uniform1i(pComp.u('u_dirt'), 6);
  if (FLUID_OK && fl) { bindTex(7, fl.dye.a.t); gl.uniform1i(pComp.u('u_dye'), 7); }
  bindTex(8, adapt.a.t); gl.uniform1i(pComp.u('u_adapt'), 8);
  gl.uniform1f(pComp.u('u_charge'), charge);
  gl.uniform1f(pComp.u('u_scroll'), scrollProgress);
  gl.uniform1f(pComp.u('u_motion'), motionAmt);
  gl.uniform1f(pComp.u('u_calm'), contentCalm);
  gl.uniform2f(pComp.u('u_chargePt'), chargePt[0], chargePt[1]);
  gl.uniform1f(pComp.u('u_aspect'), aspect);
  gl.uniform1f(pComp.u('u_time'), simTime);
  gl.uniform1f(pComp.u('u_audio'), audioLevel);
  gl.uniform1f(pComp.u('u_exposure'), 1.05 + audioLevel * 0.35);
  gl.uniform1f(pComp.u('u_ca'), 0.0016);
  gl.uniform1f(pComp.u('u_fluidOn'), FLUID_OK && fl ? 1 : 0);
  gl.uniform1f(pComp.u('u_pointerOn'), pointer.on);
  gl.uniform1f(pComp.u('u_intro'), phase === 1 ? 1 : 0);
  gl.uniform2f(pComp.u('u_cam'), cam.x, cam.y);
  gl.uniform2f(pComp.u('u_light'), lightW[0], lightW[1]);
  gl.uniform4f(pComp.u('u_pointer'), pointer.x, pointer.y, pointer.vx, pointer.vy);
  gl.uniform4fv(pComp.u('u_waves'), wavesArr);
  gl.uniform4fv(pComp.u('u_slabs'), slabArr);
  gl.uniform1fv(pComp.u('u_slabW'), slabWArr);
  drawQuad();
}

/* ---------------------------------------------------- Kamera + Loop */
function updateCamera(dt) {
  var t = simTime;
  // Dolly-Drift (Lissajous) + Handheld-Noise
  var drift = 0.02;
  var hh = 0.006;
  cam.shakeV -= cam.shake * 90 * dt;
  cam.shakeV *= Math.exp(-7 * dt);
  cam.shake += cam.shakeV * dt;
  var shakeAmp = cam.shake * 0.03;
  cam.x = Math.sin(t * 0.11) * drift + Math.sin(t * 1.7) * hh + Math.sin(t * 47) * shakeAmp;
  cam.y = Math.cos(t * 0.07) * drift * 0.7 + Math.cos(t * 2.3) * hh + Math.cos(t * 53) * shakeAmp
        - Math.min(window.scrollY, 3000) * 0.00002;
  // Film Breathing + Shock-Punch
  cam.zoom = 1 + Math.sin(t * 0.23) * 0.008 + Math.abs(cam.shake) * 0.05;
  // Rack Focus / Focus Pull
  cam.focus += (cam.focusTgt - cam.focus) * Math.min(1, dt * 2.4);
  cam.focusTgt += (0.15 + Math.sin(t * 0.17) * 0.25 - cam.focusTgt) * Math.min(1, dt * 0.12);
  // Scene-Direction: Scroll-Fortschritt steuert Licht, Dolly und Monument
  var doc = document.documentElement;
  scrollProgress = Math.min(1, window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight));
  scrollZ = window.scrollY * 0.0006;
  // Galerie-Fahrt: die Szene bleibt die ganze Seite aktiv (kein Fade mehr);
  // Hallenlänge skaliert mit der Seitenhöhe (~1 Vitrine pro 1,2 Viewports)
  hallLen = Math.max(16, (doc.scrollHeight / Math.max(1, window.innerHeight) - 1) * 5);
  lightW[0] = Math.sin(t * 0.05) * 0.18 + Math.sin(scrollProgress * 6.283) * 0.2;
  lightW[1] = 0.5 + Math.sin(t * 0.083) * 0.06 - scrollProgress * 0.22;
  scrollWind *= Math.exp(-3 * dt);
  // Kamera-Look: Maus weich nachziehen; Scroll-Energie → Motion Blur
  mSmooth.x += (pointer.x / Math.max(aspect, 0.001) - mSmooth.x) * Math.min(1, dt * 3.5);
  mSmooth.y += (pointer.y - mSmooth.y) * Math.min(1, dt * 3.5);
  motionAmt += (scrollWind * 0.011 - motionAmt) * Math.min(1, dt * 9);
  contentCalm = Math.min(1, Math.max(0, (scrollProgress - 0.03) / 0.17));
}
function packWaves() {
  wavesArr.fill(0);
  var alive = [];
  for (var i = 0; i < waves.length; i++) {
    if (simTime - waves[i].t0 <= 1.3) alive.push(waves[i]);
  }
  waves = alive;
  for (i = 0; i < Math.min(4, waves.length); i++) {
    wavesArr[i * 4] = waves[i].x;
    wavesArr[i * 4 + 1] = waves[i].y;
    wavesArr[i * 4 + 2] = waves[i].t0;
    wavesArr[i * 4 + 3] = waves[i].str;
  }
}
/* Kein Governor mehr — nur noch FPS-Messung fürs HUD. ULTRA bleibt ULTRA. */
function governor(dt) {
  fpsAccum++; fpsTime += dt;
  if (fpsTime < 2) return;
  fpsNow = fpsAccum / fpsTime;
  fpsAccum = 0; fpsTime = 0;
  fmtHud();
}
/* Nur noch für echten GPU-Verlust (Context Lost) — nie wegen Performance. */
function shutdown() {
  if (dead) return;
  dead = true; running = false;
  console.info('[NF·Engine] WebGL-Kontext verloren — Engine stoppt, Website läuft normal weiter.');
  canvas.classList.remove('on');
  hud.classList.remove('on');
  setTimeout(function () { canvas.remove(); }, 1800);
}
canvas.addEventListener('webglcontextlost', function (e) {
  e.preventDefault();
  shutdown();
});
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) lastNow = 0;   // dt-Sprung nach Tab-Wechsel vermeiden
});

var shownFrames = 0;
function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  if (!lastNow) { lastNow = now; return; }
  var dt = Math.min(0.05, (now - lastNow) / 1000);
  lastNow = now;
  if (dt <= 0) return;
  simTime += dt;
  audioLevel += (Score.level() - audioLevel) * Math.min(1, dt * 5);
  if (charging) {
    charge = Math.min(1, (simTime - chargeT0) / 1.3);
    chargePt = [pointer.x, pointer.y];
    if (charge > 0.5) cam.shakeV += dt * charge * 1.4;   // Rumpeln beim Aufladen
  } else {
    charge *= Math.exp(-6 * dt);
    if (charge < 0.004) charge = 0;
  }
  updateCamera(dt);
  packWaves();
  updateMeteors(dt);
  bolts = bolts.filter(function (b) { return simTime - b.t0 < b.dur; });
  for (var ri = 0; ri < ribbons.length; ri++) ribbons[ri].update(dt, simTime);
  Letters.update(dt);
  Cards.update(dt);
  Letterbox.update(dt);
  Slates.update(dt);
  Plaque.update();
  fluidStep(dt);
  particleStep(dt);
  render(dt);
  governor(dt);
  if (++shownFrames === 2) canvas.classList.add('on');
}
requestAnimationFrame(frame);
fmtHud();

console.info('[NF·Engine] v3 „Atelier" bereit — volle Power:', tier().name, '·',
  tier().n.toLocaleString('de-DE'), 'Partikel ·', HDR ? 'HDR-Pipeline' : 'LDR-Fallback',
  '·', FLUID_OK ? 'Fluid an' : 'Fluid aus');

/* Kleine öffentliche API (Konsole / Debug) */
window.NFEngine = {
  version: 3,
  tier: function () { return tier().name; },
  setTier: function (name) {
    var i = TIERS.findIndex(function (t) { return t.name === String(name).toUpperCase(); });
    if (i >= 0) { tierIdx = i; resize(); fmtHud(); }
  },
  score: Score,
  director: Director,
  portal: Portal
};

/* ============================================================================
   LITE-MODUS — Canvas-2D-Fallback: „Alle Animationen auf allen Geräten."
   Läuft, wenn WebGL2 fehlt (Alt-Geräte, Sparbrowser, manche Smart-TVs) oder
   per ?nfq=lite erzwungen wird. Kein Gerät bleibt vor verschlossener Tür:
   Goldstaub-Feld, wandernde Lichtschächte, Klick-Shockwaves, Scroll-Parallaxe,
   Fahrt-Letterbox, Info-Slates, generativer Score und Director's Cut.
   (Als gehoistete Funktionsdeklaration bewusst ganz unten: der ULTRA-Pfad
   darüber bleibt unangetastet.) */
function bootLite() {
  var c2 = document.createElement('canvas');
  c2.className = 'nf-canvas';
  c2.setAttribute('aria-hidden', 'true');
  var x = c2.getContext('2d');
  if (!x) { console.info('[NF·Engine] Kein Canvas verfügbar — Website läuft ohne Effekte.'); return; }
  document.body.appendChild(c2);

  var W = 2, H = 2, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = c2.width = Math.max(2, Math.round(window.innerWidth * DPR));
    H = c2.height = Math.max(2, Math.round(window.innerHeight * DPR));
  }
  resize();
  var rszT = 0;
  window.addEventListener('resize', function () { clearTimeout(rszT); rszT = setTimeout(resize, 160); });

  /* Goldstaub-Sprite: weicher radialer Kern, einmal gerendert */
  var spr = document.createElement('canvas');
  spr.width = spr.height = 64;
  (function () {
    var sx = spr.getContext('2d');
    var g = sx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,205,1)');
    g.addColorStop(0.22, 'rgba(255,206,124,.6)');
    g.addColorStop(1, 'rgba(255,180,80,0)');
    sx.fillStyle = g;
    sx.fillRect(0, 0, 64, 64);
  })();

  /* Partikelfeld: x,y normalisiert, z = Tiefe (Parallaxe), seed, vx, vy */
  var N = Math.max(600, Math.min(2200, Math.round(window.innerWidth * window.innerHeight / 900)));
  var P = new Float32Array(N * 6);
  for (var i = 0; i < N; i++) {
    P[i * 6]     = Math.random();
    P[i * 6 + 1] = Math.random();
    P[i * 6 + 2] = Math.random();
    P[i * 6 + 3] = Math.random() * 1000;
    P[i * 6 + 4] = 0;
    P[i * 6 + 5] = 0;
  }

  var T = 0, lastNow = 0, audioLevel = 0;
  var ptr = { x: 0.5, y: 0.5, on: 0 };
  window.addEventListener('pointermove', function (e) {
    ptr.x = e.clientX / Math.max(1, window.innerWidth);
    ptr.y = e.clientY / Math.max(1, window.innerHeight);
    ptr.on = 1;
  }, { passive: true });
  window.addEventListener('pointerleave', function () { ptr.on = 0; });

  /* Klick → Shockwave-Ring + Partikelstoß (nicht auf Links/Buttons) */
  var rings = [];
  document.addEventListener('pointerdown', function (e) {
    var interactive = e.target && e.target.closest &&
      e.target.closest('a,button,input,textarea,select,label,summary');
    if (interactive) return;
    var cx = e.clientX / Math.max(1, window.innerWidth);
    var cy = e.clientY / Math.max(1, window.innerHeight);
    rings.push({ x: cx, y: cy, t0: T });
    if (rings.length > 4) rings.shift();
    for (var i = 0; i < N; i++) {
      var dx = P[i * 6] - cx, dy = P[i * 6 + 1] - cy;
      var d2 = dx * dx + dy * dy;
      if (d2 < 0.045) {
        var f = (0.045 - d2) * 10;
        P[i * 6 + 4] += dx * f;
        P[i * 6 + 5] += dy * f;
      }
    }
  }, { passive: true });

  /* Scroll-Energie: treibt Letterbox, Parallaxe und Wind */
  var scrollWind = 0, lastScrollY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    scrollWind = Math.max(-0.5, Math.min(0.5, (y - lastScrollY) * 0.004));
    lastScrollY = y;
  }, { passive: true });

  /* Fahrt-Letterbox (identisches Verhalten wie im ULTRA-Pfad) */
  var lbT = document.createElement('div'); lbT.className = 'nf-lbx nf-lbx-t';
  var lbB = document.createElement('div'); lbB.className = 'nf-lbx nf-lbx-b';
  lbT.setAttribute('aria-hidden', 'true'); lbB.setAttribute('aria-hidden', 'true');
  document.body.appendChild(lbT); document.body.appendChild(lbB);
  var lbV = 0;
  function letterbox(dt) {
    var tgt = Math.max(0, Math.min(0.8, (Math.abs(scrollWind) - 0.16) * 3));
    lbV += (tgt - lbV) * Math.min(1, dt * (tgt > lbV ? 6 : 2.2));
    if (lbV < 0.002) lbV = 0;
    var off = (1 - lbV) * 101;
    lbT.style.transform = 'translateY(' + (-off).toFixed(1) + '%)';
    lbB.style.transform = 'translateY(' + off.toFixed(1) + '%)';
  }

  /* Info-Slates: Glas-Tafeln + Licht-Sweep (CSS trägt die Optik) */
  (function () {
    var els = document.querySelectorAll(
      '.section-header,.intro-lead,.intro-body,.pull-quote,.cta-container,.teaser-content,.page-hero');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('nf-slate-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '10% 0px 10% 0px' });
    Array.prototype.forEach.call(els, function (el) {
      el.classList.add('nf-slate');
      io.observe(el);
    });
  })();

  /* Kompakter generativer Score (Drohne + Pad + Glitzer-Pings) */
  var LScore = (function () {
    var ctx = null, master = null, analyser = null, freqData = null, on = false;
    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0;
      analyser = ctx.createAnalyser(); analyser.fftSize = 256;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      master.connect(analyser); analyser.connect(ctx.destination);
      [55, 55.4].forEach(function (f, i) {
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
        var g = ctx.createGain(); g.gain.value = i ? 0.05 : 0.08;
        o.connect(g); g.connect(master); o.start();
      });
      var filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
      filter.frequency.value = 520; filter.Q.value = 0.7; filter.connect(master);
      [110, 164.81, 220, 261.63].forEach(function (f) {
        var o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
        var g = ctx.createGain(); g.gain.value = 0.035;
        o.connect(g); g.connect(filter); o.start();
      });
      var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      var lfoG = ctx.createGain(); lfoG.gain.value = 260;
      lfo.connect(lfoG); lfoG.connect(filter.frequency); lfo.start();
      var PENTA = [880, 1108.73, 1318.51, 1760, 2217.46];
      setInterval(function () {
        if (!on) return;
        var o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.value = PENTA[(Math.random() * PENTA.length) | 0];
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.6);
        o.connect(g); g.connect(master);
        o.start(); o.stop(ctx.currentTime + 2.8);
      }, 6200);
    }
    function start() {
      if (!ctx) { try { build(); } catch (e) { console.warn('[NF·Engine] Audio nicht verfügbar', e); return; } }
      ctx.resume().then(function () {
        on = true;
        master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);
      });
    }
    function stop() {
      if (!ctx) return;
      on = false;
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
    function level() {
      if (!on || !analyser) return 0;
      analyser.getByteFrequencyData(freqData);
      var s = 0;
      for (var i = 2; i < 40; i++) s += freqData[i];
      return Math.min(1, (s / 38 / 255) * 2.2);
    }
    return { start: start, stop: stop, level: level, isOn: function () { return on; } };
  })();

  /* Score-Schalter */
  var scoreBtn = document.createElement('button');
  scoreBtn.className = 'nf-score';
  scoreBtn.type = 'button';
  scoreBtn.title = 'Filmmusik an/aus (generativer Score)';
  scoreBtn.setAttribute('aria-pressed', 'false');
  scoreBtn.textContent = '♪ Score';
  document.body.appendChild(scoreBtn);
  setTimeout(function () { scoreBtn.classList.add('show'); }, 1500);
  scoreBtn.addEventListener('click', function () {
    if (LScore.isOn()) {
      LScore.stop();
      scoreBtn.classList.remove('on');
      scoreBtn.setAttribute('aria-pressed', 'false');
      try { sessionStorage.removeItem('nf_score'); } catch (e) {}
    } else {
      LScore.start();
      scoreBtn.classList.add('on');
      scoreBtn.setAttribute('aria-pressed', 'true');
      try { sessionStorage.setItem('nf_score', '1'); } catch (e) {}
    }
  });
  try {
    if (sessionStorage.getItem('nf_score') === '1') {
      var resume = function () {
        LScore.start();
        scoreBtn.classList.add('on');
        scoreBtn.setAttribute('aria-pressed', 'true');
      };
      document.addEventListener('pointerdown', resume, { once: true });
    }
  } catch (e) {}

  /* Director's Cut — kein Schalter mehr, nur die Mechanik für die
     Showcase-Live-Demo (?film=1 / #film). Jede Eingabe stoppt die Fahrt. */
  var playing = false, filmRaf = 0, filmLastT = 0;
  function filmStop() {
    if (!playing) return;
    playing = false;
    document.documentElement.style.scrollBehavior = '';
    cancelAnimationFrame(filmRaf);
  }
  function filmTick(now) {
    if (!playing) return;
    var dt = Math.min(0.1, (now - filmLastT) / 1000);
    filmLastT = now;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var v = 58 + Math.min(46, window.innerHeight * 0.035);
    window.scrollTo(0, window.scrollY + v * dt);
    if (window.scrollY >= max - 2) { filmStop(); return; }
    filmRaf = requestAnimationFrame(filmTick);
  }
  function filmStart() {
    if (playing) return;
    playing = true;
    if (!LScore.isOn()) scoreBtn.click();
    document.documentElement.style.scrollBehavior = 'auto';   // smooth würde die Fahrt verschlucken
    filmLastT = performance.now();
    filmRaf = requestAnimationFrame(filmTick);
  }
  function filmUserStop() { filmStop(); }
  window.addEventListener('wheel', filmUserStop, { passive: true });
  window.addEventListener('touchstart', filmUserStop, { passive: true });
  window.addEventListener('keydown', filmUserStop);
  document.addEventListener('pointerdown', filmUserStop, true);
  if (AUTOFILM) setTimeout(function () { if (!playing) filmStart(); }, 1400);

  /* HUD */
  var hud = document.createElement('div');
  hud.className = 'nf-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.textContent = 'NF·Engine Lite — Canvas-Modus · ' + N.toLocaleString('de-DE') + ' Partikel';
  document.body.appendChild(hud);
  setTimeout(function () { hud.classList.add('on'); }, 1200);

  /* Render: additiver Goldstaub + drei wandernde Lichtschächte + Ringe */
  function frame(now) {
    requestAnimationFrame(frame);
    if (!lastNow) { lastNow = now; return; }
    var dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    if (dt <= 0) return;
    T += dt;
    audioLevel += (LScore.level() - audioLevel) * Math.min(1, dt * 5);
    scrollWind *= Math.exp(-3 * dt);
    letterbox(dt);
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';

    /* Lichtschächte: weiche Goldpools, die langsam durchs Bild wandern */
    for (var L = 0; L < 3; L++) {
      var lx = (0.5 + Math.sin(T * 0.05 + L * 2.1) * 0.38) * W;
      var ly = (0.22 + Math.cos(T * 0.04 + L * 1.7) * 0.14 + L * 0.06) * H;
      var lr = (0.32 + 0.06 * Math.sin(T * 0.11 + L)) * Math.max(W, H);
      var lg = x.createRadialGradient(lx, ly, 0, lx, ly, lr);
      var la = 0.05 + 0.02 * Math.sin(T * 0.3 + L * 2.3) + audioLevel * 0.04;
      lg.addColorStop(0, 'rgba(255,205,130,' + la.toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(255,180,80,0)');
      x.fillStyle = lg;
      x.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
    }

    /* Shockwave-Ringe */
    for (var r = rings.length - 1; r >= 0; r--) {
      var rg = rings[r];
      var age = T - rg.t0;
      if (age > 1.3) { rings.splice(r, 1); continue; }
      var rad = age * 0.85 * Math.max(W, H) * 0.5;
      x.strokeStyle = 'rgba(255,214,140,' + ((1 - age / 1.3) * 0.5).toFixed(3) + ')';
      x.lineWidth = Math.max(1, (1 - age / 1.3) * 5 * DPR);
      x.beginPath();
      x.arc(rg.x * W, rg.y * H, rad, 0, 6.2832);
      x.stroke();
    }

    /* Goldstaub */
    var scrollPar = window.scrollY / Math.max(1, window.innerHeight);
    for (var i = 0; i < N; i++) {
      var o = i * 6;
      var px = P[o], py = P[o + 1], pz = P[o + 2], seed = P[o + 3];
      /* sanfte Drift aus überlagerten Sinusfeldern (Curl-Ersatz) */
      var ax = Math.sin(py * 6.3 + T * 0.21 + seed) * 0.008 +
               Math.sin(py * 17 + T * 0.12 + seed * 2.1) * 0.004;
      var ay = Math.cos(px * 5.1 + T * 0.17 + seed) * 0.008 - 0.004 - scrollWind * 0.05;
      if (ptr.on) {
        var dx = px - ptr.x, dy = py - ptr.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 0.03) {
          var f = (0.03 - d2) * 6;
          ax += (-dy) * f * 0.5 - dx * f * 0.3;
          ay += (dx) * f * 0.5 - dy * f * 0.3;
        }
      }
      P[o + 4] = (P[o + 4] + ax * dt * 60) * Math.exp(-1.6 * dt);
      P[o + 5] = (P[o + 5] + ay * dt * 60) * Math.exp(-1.6 * dt);
      px += P[o + 4] * dt; py += P[o + 5] * dt;
      if (px > 1.05) px -= 1.1; else if (px < -0.05) px += 1.1;
      if (py > 1.05) py -= 1.1; else if (py < -0.05) py += 1.1;
      P[o] = px; P[o + 1] = py;
      var yy = py + scrollPar * (pz - 0.5) * 0.12;
      yy = yy - Math.floor(yy);
      var tw = 0.55 + 0.45 * Math.sin(T * (1 + pz * 2.4) + seed * 40);
      var size = (2.2 + pz * 5.5) * DPR * tw * (1 + audioLevel * 0.5);
      x.globalAlpha = (0.24 + pz * 0.5) * tw;
      x.drawImage(spr, px * W - size / 2, yy * H - size / 2, size, size);
    }
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
  }
  requestAnimationFrame(frame);
  setTimeout(function () { c2.classList.add('on'); }, 60);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) lastNow = 0;
  });

  console.info('[NF·Engine] Lite-Modus (Canvas 2D) bereit —',
    N.toLocaleString('de-DE'), 'Partikel · Letterbox · Slates · Score · Director’s Cut');
  window.NFEngine = { version: 3, tier: function () { return 'LITE'; } };
}

})();
