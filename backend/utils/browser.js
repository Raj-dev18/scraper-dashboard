const { chromium } = require("playwright");

const HEADLESS = process.env.PLAYWRIGHT_HEADLESS === "true";
const VIEWPORT = {
  width: Number(process.env.VIEWPORT_WIDTH || 1920),
  height: Number(process.env.VIEWPORT_HEIGHT || 1080),
};
const NAVIGATION_TIMEOUT_MS = Number(process.env.NAVIGATION_TIMEOUT_MS || 60000);
// How long we're willing to wait for the network to go fully idle before
// giving up and continuing anyway. Real sites often have persistent
// analytics/tracking connections that mean "networkidle" never fires -
// that shouldn't block a scraper that does its own fetch() calls.
const NETWORK_IDLE_TIMEOUT_MS = Number(process.env.NETWORK_IDLE_TIMEOUT_MS || 15000);

/**
 * Launches a fresh Chromium browser + page and navigates to `url`. Always
 * call `close()` (in a finally block) once you're done with the returned
 * page, even if the scraper throws.
 *
 * @param {string} url - the target website to open
 * @returns {Promise<{ browser: import('playwright').Browser, page: import('playwright').Page, close: () => Promise<void> }>}
 */
async function openScraperPage(url) {
  const browser = await chromium.launch({ headless: HEADLESS });

  let page;
  try {
    const context = await browser.newContext({ viewport: VIEWPORT, acceptDownloads: true });
    page = await context.newPage();

    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
    page.setDefaultTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Best-effort only: don't fail the whole scrape just because some
    // background connection (analytics, chat widget, etc.) never settles.
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS }).catch(() => {
      console.warn(`[browser] networkidle wasn't reached within ${NETWORK_IDLE_TIMEOUT_MS}ms for ${url} - continuing anyway.`);
    });
  } catch (err) {
    // Make sure we don't leak a browser process if navigation fails
    await browser.close().catch(() => {});
    throw err;
  }

  const close = async () => {
    await browser.close().catch(() => {});
  };

  return { browser, page, close };
}

module.exports = { openScraperPage };