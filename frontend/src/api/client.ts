import axios from "axios";
import type { ScrapeResponse, SiteId } from "../types/scraper";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5 * 60 * 1000, // scrapes can take a while - 5 minute ceiling
});

export async function runScraper(site: SiteId): Promise<ScrapeResponse> {
  try {
    const { data } = await api.post<ScrapeResponse>(`/api/scrape/${site}`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return err.response.data as ScrapeResponse;
    }
    return {
      success: false,
      site,
      error: err instanceof Error ? err.message : "Network error",
      log: [],
    };
  }
}

export function downloadUrl(file: string): string {
  // file comes back as "downloads/columbia_products.json"
  return `${API_BASE_URL}/${file}`;
}
