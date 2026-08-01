import { TerminalSquare } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-white/[0.06] bg-void/80 backdrop-blur-xl sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet to-violet-soft flex items-center justify-center shadow-glow">
            <TerminalSquare size={18} className="text-void" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-semibold text-[15px] leading-none tracking-tight">
              Scraper Dashboard
            </p>
            <p className="text-xs text-mist font-mono mt-1">headless: false · viewport 1920×1080</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-mist">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
          API connected
        </div>
      </div>
    </header>
  );
}
