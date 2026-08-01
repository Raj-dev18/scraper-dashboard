import { AlertTriangle, Play, Store } from "lucide-react";
import { useScraper } from "../hooks/useScraper";
import type { SiteConfig } from "../types/scraper";
import ProgressLog from "./ProgressLog";
import ResultsPanel from "./ResultsPanel";

interface ScraperCardProps {
  site: SiteConfig;
}

export default function ScraperCard({ site }: ScraperCardProps) {
  const { state, start, reset } = useScraper(site.id);
  const isRunning = state.status === "running";

  return (
    <div
      className="glass rounded-2xl p-6 flex flex-col gap-5 transition-all duration-300 hover:border-white/[0.12] relative overflow-hidden"
      style={{
        boxShadow: state.status === "running" ? `0 0 50px -20px ${site.glow}` : undefined,
      }}
    >
      <div
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: site.glow }}
      />

      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.08]"
            style={{ backgroundColor: `${site.glow}1A` }}
          >
            <Store size={18} style={{ color: site.glow }} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base leading-none">{site.label}</h3>
            <p className="text-xs text-mist mt-1.5 max-w-[22ch]">{site.description}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[3.25rem] flex flex-col justify-center relative">
        {state.status === "idle" && (
          <p className="text-sm text-mist/70">Ready to scrape. This opens a live browser window.</p>
        )}

        {(state.status === "running" || state.status === "error") && (
          <ProgressLog steps={state.steps} running={isRunning} accentColor={site.glow} />
        )}

        {state.status === "error" && (
          <div className="mt-3 flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state.status === "success" && state.result && (
          <ResultsPanel result={state.result} accentColor={site.glow} onReset={reset} />
        )}
      </div>

      {state.status !== "success" && (
        <button
          type="button"
          onClick={start}
          disabled={isRunning}
          className="mt-auto group relative flex items-center justify-center gap-2 rounded-xl py-3 font-display font-medium text-sm text-void transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${site.glow}, #8B7CF6)`,
          }}
        >
          <Play size={15} className="fill-void" />
          {isRunning ? "Scraping…" : state.status === "error" ? "Retry Scraping" : "Start Scraping"}
        </button>
      )}
    </div>
  );
}
