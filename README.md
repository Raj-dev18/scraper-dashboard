# Scraper Dashboard

React (Vite + TS + Tailwind) frontend talking to an Express + Playwright
backend. The frontend never touches Playwright directly — it just calls
the API and displays progress + results.

```
frontend (React)  →  HTTP API  →  backend (Express)  →  Playwright  →  target site
```

## 1. Install

```bash
cd backend
npm install        # also runs `playwright install chromium` via postinstall
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

## 2. Run

Two terminals:

```bash
# terminal 1
cd backend
npm run dev         # http://localhost:4000

# terminal 2
cd frontend
npm run dev          # http://localhost:5173
```

Open http://localhost:5173, pick a card, click **Start Scraping**.

## 3. Your scrapers are already wired in

Each site has its own file in `backend/scrapers/`, with your DevTools
script pasted in unmodified:

- `backend/scrapers/columbia.js` → `https://www.columbiasportswear.co.in`
- `backend/scrapers/adventure.js` → `https://adventuras.in`
- `backend/scrapers/ajio.js` → `https://www.ajio.com`

Your scripts don't all finish the same way, so each file's harness (the
code *around* the `// PASTE SCRAPER HERE` block) matches what your script
actually does:

- **Columbia & Adventure** click a hidden `<a download>` link to save a
  Blob when they finish. The harness listens for that real browser
  download event and reads the resulting file — nothing in your script
  needed to change.
- **AJIO** doesn't auto-download; it stores results on
  `window.__AJIO_PRODUCTS__` and sets `window.__AJIO_SCRAPER_DONE__ = true`
  when finished. The harness waits for that flag, then reads the array
  straight off the page.

⚠️ **AJIO note**: your script always sets `available: null` on every
product (it doesn't compute stock status), so AJIO's Available /
Unavailable counters on the dashboard won't be meaningful — only the total
product count reflects reality. Columbia and Adventure both compute real
`true`/`false` availability, so their counters work as expected.

If your scraper logic ever changes, just replace the code between the
`// PASTE SCRAPER HERE` and `// END SCRAPER` markers in the relevant file
— leave everything outside that block alone.

The backend saves whatever comes back to:

```
backend/downloads/columbia_products.json
backend/downloads/adventure_products.json
backend/downloads/ajio_products.json
```

and reports `products` / `available` / `unavailable` counts back to the
dashboard. Availability is inferred from an `available`, `inStock`,
`in_stock`, or `isAvailable` field on each product if present — see
`backend/utils/results.js` if your field is named something else.

## 4. Add a new site (Amazon, Myntra, Flipkart, ...)

1. Copy whichever existing scraper file is the closest match for how the
   new script finishes — `columbia.js`/`adventure.js` if it triggers a
   browser download, `ajio.js` if it parks data on `window` instead — to
   `backend/scrapers/<site>.js`, update `TARGET_URL`, `id`, and `label`,
   and paste in that site's scraper.
2. Register it in `backend/routes/scrape.js` (add it to the `SCRAPERS` array
   — this alone creates `POST /api/scrape/<site>`).
3. Add a matching card entry in `frontend/src/App.tsx`'s `SITES` array with
   a label, description, and accent color.

That's it — no other wiring needed.

## Notes

- Playwright launches **headful** (`headless:false`) by default so you can
  watch it work while testing — flip `PLAYWRIGHT_HEADLESS=true` in
  `backend/.env` once you're ready to run it unattended.
- Viewport is fixed at 1920×1080 and the backend waits for `networkidle`
  before running your scraper.
- "Download Excel" is a placeholder button for now, as requested.
