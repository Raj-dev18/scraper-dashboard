require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const scrapeRoutes = require("./routes/scrape");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.use("/api/scrape", scrapeRoutes);

// Serve saved JSON files so the frontend's "Download JSON" button can
// link straight to /downloads/<file>.json
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Scraper dashboard API running at http://localhost:${PORT}`);
});
