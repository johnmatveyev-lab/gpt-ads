import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtime-paths";

export type AnalyticsEvent = {
  id: string;
  event: string;
  createdAt: string;
  payload?: Record<string, unknown>;
};

const dataDir = getRuntimeDataDir();
const analyticsPath = path.join(dataDir, "analytics.json");

export async function trackServerEvent(event: AnalyticsEvent) {
  const events = await readEvents();
  events.unshift(event);
  await mkdir(dataDir, { recursive: true });
  await writeFile(analyticsPath, `${JSON.stringify(events.slice(0, 500), null, 2)}\n`, "utf8");
}

async function readEvents() {
  try {
    const raw = await readFile(analyticsPath, "utf8");
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}
