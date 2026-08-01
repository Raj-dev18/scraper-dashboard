const express = require("express");
const { saveResults } = require("../utils/results");

const columbia = require("../scrapers/columbia");
const adventure = require("../scrapers/adventure");
const ajio = require("../scrapers/ajio");

const router = express.Router();

// Add a new site by dropping a scraper module in backend/scrapers/ and
// registering it here - the route, id, and label all come from the module.
const SCRAPERS = [columbia, adventure, ajio];

for (const scraper of SCRAPERS) {
  router.post(`/${scraper.id}`, async (req, res) => {
    const startedAt = Date.now();

    // Track status messages so the frontend polling this run (if it
    // reconnects) can see the latest step; also returned in logs below.
    const statusLog = [];
    const onStatus = (message) => {
      statusLog.push({ message, at: Date.now() });
      console.log(`[${scraper.id}] ${message}`);
    };

    try {
      onStatus("Launching browser...");
      const scraperOutput = await scraper.scrape(onStatus);

      onStatus("Saving JSON...");
      const { file, total, available, unavailable } = await saveResults(scraper.id, scraperOutput);

      onStatus("Completed.");
      const timeTakenMs = Date.now() - startedAt;

      res.json({
        success: true,
        site: scraper.id,
        products: total,
        available,
        unavailable,
        file,
        timeTakenMs,
        log: statusLog,
      });
    } catch (err) {
      console.error(`[${scraper.id}] scrape failed:`, err);
      res.status(500).json({
        success: false,
        site: scraper.id,
        error: err.message || "Scrape failed",
        log: statusLog,
      });
    }
  });
}

// GET /api/scrape/sites - lets the frontend discover available scrapers
// instead of hardcoding the list, matching the "just add a scraper file"
// bonus requirement.
router.get("/sites", (req, res) => {
  res.json({
    sites: SCRAPERS.map((s) => ({ id: s.id, label: s.label, url: s.url })),
  });
});

module.exports = router;
