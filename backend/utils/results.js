const fs = require("fs/promises");
const path = require("path");

const DOWNLOADS_DIR = path.join(__dirname, "..", "downloads");

/**
 * Your scraper can return products in whatever shape it wants. This just
 * looks for a few common "is this in stock" field names so the dashboard
 * can show Available / Unavailable counts without you having to reshape
 * your data. If none of these fields exist, everything is counted as
 * "available" and unavailable stays 0 — tweak AVAILABILITY_FIELDS below if
 * your scraper uses a different key.
 */
const AVAILABILITY_FIELDS = ["available", "inStock", "in_stock", "isAvailable"];

function isAvailable(product) {
  for (const field of AVAILABILITY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(product, field)) {
      return Boolean(product[field]);
    }
  }
  return true;
}

/**
 * @param {unknown} scraperOutput - whatever page.evaluate() returned
 */
function summarize(scraperOutput) {
  const products = Array.isArray(scraperOutput)
    ? scraperOutput
    : Array.isArray(scraperOutput?.products)
    ? scraperOutput.products
    : [];

  const total = products.length;
  const available = products.filter((p) => p && typeof p === "object" && isAvailable(p)).length;
  const unavailable = total - available;

  return { products, total, available, unavailable };
}

/**
 * Saves scraper output to backend/downloads/<siteId>_products.json
 * @param {string} siteId - e.g. "columbia"
 * @param {unknown} scraperOutput - raw return value of page.evaluate()
 */
async function saveResults(siteId, scraperOutput) {
  await fs.mkdir(DOWNLOADS_DIR, { recursive: true });

  const fileName = `${siteId}_products.json`;
  const filePath = path.join(DOWNLOADS_DIR, fileName);
  const relativePath = path.join("downloads", fileName);

  const { products, total, available, unavailable } = summarize(scraperOutput);

  await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");

  return {
    file: relativePath.replace(/\\/g, "/"),
    total,
    available,
    unavailable,
  };
}

module.exports = { saveResults, DOWNLOADS_DIR };
