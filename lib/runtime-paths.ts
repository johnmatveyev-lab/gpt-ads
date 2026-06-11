import path from "node:path";

export function getRuntimeDataDir() {
  return process.env.VERCEL ? path.join("/tmp", "gpt-ads-website") : path.join(process.cwd(), ".data");
}
