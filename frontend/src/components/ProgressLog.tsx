import { Loader2 } from "lucide-react";

interface ProgressLogProps {
  steps: string[];
  running: boolean;
  accentColor: string;
}

export default function ProgressLog({ steps, running, accentColor }: ProgressLogProps) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/[0.06] font-mono text-[13px] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-mist text-[11px]">scraper.log</span>
      </div>
      <div className="px-3.5 py-3 space-y-1.5 max-h-40 overflow-y-auto">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <div key={`${step}-${i}`} className="flex items-start gap-2 animate-rise">
              <span className="text-mist/60 select-none">{`>`}</span>
              <span className={isLast && running ? "text-white" : "text-mist"}>
                {step}
                {isLast && running && <span className="animate-blink">▍</span>}
              </span>
            </div>
          );
        })}
        {running && (
          <div className="flex items-center gap-2 pt-1" style={{ color: accentColor }}>
            <Loader2 size={12} className="animate-spin" />
            <span className="text-[11px]">working…</span>
          </div>
        )}
      </div>
    </div>
  );
}
