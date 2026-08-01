import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { runScraper } from "../api/client";
import type { RunState, SiteId } from "../types/scraper";

const PROGRESS_STEPS = [
  "Launching browser...",
  "Opening website...",
  "Running scraper...",
  "Collecting products...",
  "Saving JSON...",
];

// The backend runs the whole scrape as one blocking request, so we don't
// get real-time step events. Instead we walk through the same step labels
// on a timer while the request is in flight, then reconcile with the
// server's own log once it responds. It keeps the UI honest about what's
// probably happening without requiring a websocket/SSE layer.
const STEP_INTERVAL_MS = 1400;

export function useScraper(site: SiteId) {
  const [state, setState] = useState<RunState>({ status: "idle", steps: [] });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicker = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(async () => {
    stopTicker();
    setState({ status: "running", steps: [PROGRESS_STEPS[0]] });

    let stepIndex = 0;
    intervalRef.current = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, PROGRESS_STEPS.length - 1);
      setState((prev) =>
        prev.status === "running"
          ? { ...prev, steps: PROGRESS_STEPS.slice(0, stepIndex + 1) }
          : prev
      );
    }, STEP_INTERVAL_MS);

    const response = await runScraper(site);
    stopTicker();

    if (response.success) {
      setState({
        status: "success",
        steps: [...PROGRESS_STEPS, "Completed."],
        result: response,
      });
      toast.success(`${site} scrape completed`);
    } else {
      setState({
        status: "error",
        steps: [...PROGRESS_STEPS.slice(0, stepIndex + 1)],
        error: response.error,
      });
      toast.error(`${site} scrape failed: ${response.error}`);
    }
  }, [site]);

  const reset = useCallback(() => {
    stopTicker();
    setState({ status: "idle", steps: [] });
  }, []);

  return { state, start, reset };
}
