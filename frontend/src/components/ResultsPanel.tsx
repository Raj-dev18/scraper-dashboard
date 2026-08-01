import { CheckCircle2, Download, FileSpreadsheet, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { downloadUrl } from "../api/client";
import type { ScrapeSuccessResponse } from "../types/scraper";

interface ResultsPanelProps {
  result: ScrapeSuccessResponse;
  accentColor: string;
  onReset: () => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}m ${rest}s`;
}

export default function ResultsPanel({ result, accentColor, onReset }: ResultsPanelProps) {
  const stats = [
    { label: "Total Products", value: result.products },
    { label: "Available", value: result.available },
    { label: "Unavailable", value: result.unavailable },
    { label: "Time Taken", value: formatDuration(result.timeTakenMs) },
  ];

  return (
    <div className="space-y-4 animate-rise">
      <div className="flex items-center gap-2 text-sm" style={{ color: accentColor }}>
        <CheckCircle2 size={16} />
        <span className="font-medium">Scrape completed</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2.5">
            <p className="text-[11px] text-mist uppercase tracking-wide">{stat.label}</p>
            <p className="font-display font-semibold text-lg mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <a
          href={downloadUrl(result.file)}
          download
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-sm font-medium py-2.5 transition-colors"
        >
          <Download size={15} />
          Download JSON
        </a>
        <button
          type="button"
          onClick={() => toast("Excel export is coming soon", { icon: "🛠️" })}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-sm font-medium py-2.5 text-mist transition-colors"
        >
          <FileSpreadsheet size={15} />
          Download Excel
        </button>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-mist hover:text-white transition-colors mx-auto"
      >
        <RotateCcw size={12} />
        Run again
      </button>
    </div>
  );
}
