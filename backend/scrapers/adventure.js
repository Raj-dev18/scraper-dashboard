/**
 * Adventure (adventuras.in) scraper
 * ----------------------------------
 * Same shape as the Columbia scraper: it fetches products.json, filters
 * down to Columbia-branded products, then downloads the result as a Blob.
 * This harness waits for that real download and reads the file back
 * instead of relying on a return value. Your script below is pasted in
 * unmodified.
 */

const fs = require("fs/promises");
const { openScraperPage } = require("../utils/browser");

const TARGET_URL = "https://adventuras.in";
const DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;

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
          const BASE_URL = "https://adventuras.in";
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
              // ONLY COLUMBIA PRODUCTS
              if (!product.vendor || product.vendor.toLowerCase().trim() !== "columbia") {
                continue;
              }

              const variants = product.variants || {};

              // TRUE if AT LEAST ONE variant/size is available
              const isAvailable = product.variants?.some((variant) => variant.available === true) ?? false;

              // Get first AVAILABLE variant.
              // If nothing is available, fall back to first variant.
              const selectedVariant =
                product.variants?.find((variant) => variant.available === true) || product.variants?.[0] || {};

              allProducts.push({
                product_id: String(product.id),

                source: "adventuras",

                brand: product.vendor || "",

                sku: selectedVariant.sku || "",

                name: product.title || "",

                price: selectedVariant.price || "",

                url: `${BASE_URL}/products/${product.handle}`,

                image_url: product.images?.[0]?.src || "",

                available: isAvailable,

                scraped_at: scrapedAt,
              });
            }

            console.log(`Page ${page} processed | Columbia products collected: ${allProducts.length}`);

            if (data.products.length < LIMIT) {
              console.log("Reached final page.");
              break;
            }

            page++;

            // Small delay between requests
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          const availableProducts = allProducts.filter((product) => product.available === true);

          const unavailableProducts = allProducts.filter((product) => product.available === false);

          console.log("--------------------------------");
          console.log("SCRAPING FINISHED");
          console.log(`Total Columbia Products: ${allProducts.length}`);
          console.log(`Available: ${availableProducts.length}`);
          console.log(`Unavailable: ${unavailableProducts.length}`);
          console.log("--------------------------------");

          const blob = new Blob([JSON.stringify(allProducts, null, 2)], { type: "application/json" });

          const downloadUrl = URL.createObjectURL(blob);

          const a = document.createElement("a");

          a.href = downloadUrl;
          a.download = "adventuras_columbia_products.json";

          document.body.appendChild(a);
          a.click();
          a.remove();

          URL.revokeObjectURL(downloadUrl);

          console.log("Downloaded: adventuras_columbia_products.json");
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

module.exports = { id: "adventure", label: "Adventure", url: TARGET_URL, scrape };
