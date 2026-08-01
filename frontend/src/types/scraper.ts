export type SiteId = "columbia" | "adventure" | "ajio" | string;

export interface SiteConfig {
  id: SiteId;
  label: string;
  description: string;
  accent: string; // tailwind color token, e.g. "site-columbia"
  glow: string; // hex used for box-shadow / rgba glows
}

export interface ScrapeLogEntry {
  message: string;
  at: number;
}

export interface ScrapeSuccessResponse {
  success: true;
  site: SiteId;
  products: number;
  available: number;
  unavailable: number;
  file: string;
  timeTakenMs: number;
  log: ScrapeLogEntry[];
}

export interface ScrapeErrorResponse {
  success: false;
  site: SiteId;
  error: string;
  log: ScrapeLogEntry[];
}

export type ScrapeResponse = ScrapeSuccessResponse | ScrapeErrorResponse;

export type RunStatus = "idle" | "running" | "success" | "error";

export interface RunState {
  status: RunStatus;
  steps: string[];
  result?: ScrapeSuccessResponse;
  error?: string;
}
