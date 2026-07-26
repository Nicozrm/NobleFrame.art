# NobleFrame — Deploy

Statische Seite + OMEGA-OS-Showcase unter `/showcase/omega-os/`.
Alle internen Pfade sind relativ — die Seite läuft daher auf Root-Domains
(Cloudflare, eigene Domain) **und** auf Unterpfaden (GitHub Pages) ohne Anpassung.

## GitHub Pages (Live-Deploy, automatisch)

Jeder Push auf `main` deployt automatisch über GitHub Actions
(`.github/workflows/deploy-pages.yml`) nach:

**https://nicozrmn.github.io/NobleFrame/**

- Beim ersten Lauf aktiviert der Workflow GitHub Pages selbst (Quelle: „GitHub Actions").
- Manuell auslösen: Repo > Actions > „Deploy to GitHub Pages" > Run workflow.
- Cloudflare-spezifische Dateien (`functions/`, `wrangler.toml`, `_headers`) werden
  nicht mit ausgeliefert.
- Hinweis: GitHub Pages ist rein statisch — der Egregore-KI-Proxy (`/api/egregore`)
  läuft dort nicht. OMEGA OS bootet vollständig; nur die KI-Antworten bleiben aus.

## Cloudflare Pages (mit KI-Proxy)

```
npx wrangler pages deploy .
```
`functions/` (Egregore-KI-Proxy für OMEGA OS) wird automatisch mitdeployed.

### Secret (für OMEGA-OS-KI „Egregore")
Pages-Projekt > Settings > Environment variables > **ANTHROPIC_API_KEY** (Secret).
Ohne Schlüssel bootet OMEGA OS vollständig; nur die KI-Antworten bleiben aus.

Lokal testen:
```
echo "ANTHROPIC_API_KEY=sk-ant-..." > .dev.vars
npx wrangler pages dev .
```

## Struktur
- `*.html` — NobleFrame-Seiten (Root)
- `showcase/omega-os/` — gebautes OMEGA OS (index.html, bundle.js, icons, SW, manifest)
- `functions/api/egregore.js` — serverseitiger KI-Proxy (`POST /api/egregore`, nur Cloudflare)
- `_headers`, `wrangler.toml` — Cloudflare-Pages-Konfiguration
- `.github/workflows/deploy-pages.yml` — GitHub-Pages-Deploy
