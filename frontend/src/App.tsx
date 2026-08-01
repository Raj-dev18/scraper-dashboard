import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import ScraperCard from "./components/ScraperCard";
import type { SiteConfig } from "./types/scraper";

// Adding a new target: create backend/scrapers/<id>.js, register it in
// backend/routes/scrape.js, then add one entry here.
const SITES: SiteConfig[] = [
  {
    id: "columbia",
    label: "Explore Columbia",
    description: "Outdoor apparel & gear catalog",
    accent: "site-columbia",
    glow: "#2DD4BF",
  },
  {
    id: "adventure",
    label: "Explore Adventure",
    description: "Adventure & travel gear listings",
    accent: "site-adventure",
    glow: "#FB923C",
  },
  {
    id: "ajio",
    label: "Explore AJIO",
    description: "Fashion & lifestyle marketplace",
    accent: "site-ajio",
    glow: "#F472B6",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-grid bg-grid">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#12141C",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "13px",
          },
        }}
      />
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-mono text-violet-soft tracking-widest uppercase mb-3">
            playwright · headful · 1920×1080
          </p>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl leading-tight tracking-tight">
            Point it at a site.
            <br />
            Watch it collect the data.
          </h1>
          <p className="text-mist mt-3 text-[15px] leading-relaxed">
            Each card below drives a real Chromium browser through your own scraper
            script, then hands the results back here as JSON.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SITES.map((site) => (
            <ScraperCard key={site.id} site={site} />
          ))}
        </div>
      </main>
    </div>
  );
}
