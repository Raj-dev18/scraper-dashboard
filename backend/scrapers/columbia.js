/**
 * Columbia scraper
 * -----------------
 * Your script fetches products.json directly and, when it's done, builds
 * a Blob and clicks a hidden <a download> link to save the file in the
 * browser. There's no return value for page.evaluate() to hand back, so
 * this harness listens for that actual browser download instead and reads
 * the file it produces. Your script below is pasted in unmodified.
 */

const fs = require("fs/promises");
const { openScraperPage } = require("../utils/browser");

const TARGET_URL = "https://www.columbiasportswear.co.in";
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000; // pagination + delays can take a while

async function scrape(onStatus = () => {}) {
  onStatus("Opening website...");
  const { page, close } = await openScraperPage(TARGET_URL);

  try {
    onStatus("Running scraper...");

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: DOWNLOAD_TIMEOUT_MS }),
      page.evaluate(async () => {
        // ============================================================
        // PASTE SCRAPER HERE — unmodified, exactly as provided
        // ============================================================
        (async () => {
          const BASE_URL = "https://www.columbiasportswear.co.in";
          const LIMIT = 250;

          const allProducts = [];
          let page = 1;

          while (true) {
            console.log(`Fetching Page ${page}...`);

            const response = await fetch(`${BASE_URL}/products.json?limit=${LIMIT}&page=${page}`);

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.products || data.products.length === 0) {
              console.log("No more products. Stopping.");
              break;
            }

            const scrapedAt = new Date().toISOString();

            for (const product of data.products) {
              // TRUE if ANY size/variant is available
              const isAvailable = product.variants?.some((variant) => variant.available === true) ?? false;

              // Use first available variant for SKU + price.
              // If all variants are unavailable, fall back to first variant.
              const selectedVariant =
                product.variants?.find((variant) => variant.available === true) || product.variants?.[0] || {};

              allProducts.push({
                product_id: String(product.id),

                source: "columbia",

                brand: product.vendor || "",

                sku: selectedVariant.sku || "",

                name: product.title || "",

                price: selectedVariant.price || "",

                url: `${BASE_URL}/products/${product.handle}`,

                image_url: product.images?.[0]?.src || "",

                // TRUE as long as at least ONE size is available
                available: isAvailable,

                scraped_at: scrapedAt,
              });
            }

            console.log(`Page ${page} processed | Total products collected: ${allProducts.length}`);

            if (data.products.length < LIMIT) {
              console.log("Reached final page.");
              break;
            }

            page++;

            // Small delay
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // Calculate availability stats
          const availableProducts = allProducts.filter((product) => product.available === true);

          const unavailableProducts = allProducts.filter((product) => product.available === false);

          console.log("--------------------------------");
          console.log("SCRAPING FINISHED");
          console.log(`Total Products: ${allProducts.length}`);
          console.log(`Available Products: ${availableProducts.length}`);
          console.log(`Unavailable Products: ${unavailableProducts.length}`);
          console.log("--------------------------------");

          // Download JSON
          const blob = new Blob([JSON.stringify(allProducts, null, 2)], { type: "application/json" });

          const downloadUrl = URL.createObjectURL(blob);

          const a = document.createElement("a");

          a.href = downloadUrl;
          a.download = "columbia_products.json";

          document.body.appendChild(a);
          a.click();
          a.remove();

          URL.revokeObjectURL(downloadUrl);

          console.log("Downloaded: columbia_products.json");
        })();
        // ============================================================
        // END SCRAPER
        // ============================================================
      }),
    ]);

    onStatus("Collecting products...");
    const downloadPath = await download.path();
    if (!downloadPath) {
      const failure = await download.failure();
      throw new Error(`Download did not complete${failure ? `: ${failure}` : ""}`);
    }

    const raw = await fs.readFile(downloadPath, "utf-8");
    return JSON.parse(raw);
  } finally {
    await close();
  }
}

module.exports = { id: "columbia", label: "Columbia", url: TARGET_URL, scrape };
