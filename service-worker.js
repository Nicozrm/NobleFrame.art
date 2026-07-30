/* NobleFrame – Service Worker (cache-first mit Runtime-Caching) */
const CACHE = "nobleframe-v16";

/* Kern-Seiten, die offline verfügbar sein sollen.
   Einzelne Fehlschläge brechen die Installation NICHT ab (allSettled).
   Relative Pfade: funktionieren auf Root-Domains UND Unterpfaden (z. B. GitHub Pages). */
const CORE = [
  "./",
  "./index.html",
  "./leistungen.html",
  "./signatur.html",
  "./showcase.html",
  "./tools.html",
  "./about.html",
  "./kontakt.html",
  "./faq.html",
  "./karriere.html",
  "./impressum.html",
  "./datenschutz.html",
  "./agb.html",
  "./assets/fonts/fonts.css",
  "./assets/fonts/outfit-latin.woff2",
  "./assets/fonts/cormorant-garamond-latin.woff2",
  "./assets/fonts/jetbrains-mono-latin.woff2",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(CORE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Externe Anfragen (Fonts, Google APIs, etc.) nicht abfangen
  if (url.origin !== self.location.origin) return;
  // OMEGA OS bringt eigenen Service Worker mit – dessen Subpfad NICHT abfangen.
  if (url.pathname.includes("/showcase/omega-os/")) return;

  /* Seiten: network-first. Sonst friert eine einmal gecachte Seite im Browser
     ein und Korrekturen erreichen wiederkehrende Besucher nie. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  /* Statische Assets: cache-first (Schriften und Bilder aendern sich nicht). */
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Nur erfolgreiche Basis-Antworten cachen
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
