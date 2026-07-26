/* NobleFrame – Service Worker (cache-first mit Runtime-Caching) */
const CACHE = "nobleframe-v15";

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
  "./nf-boot.js",
  "./nf-engine.js",
  "./site.webmanifest"
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
