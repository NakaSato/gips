import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { validEIPs } from "@/data/validEIPs";
import { validRIPs } from "@/data/validRIPs";
import { validCAIPs } from "@/data/validCAIPs";
import type { ValidEIPs } from "@/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The OG image route (app/api/og/route.tsx) is an edge function and only
// needs three fields per proposal (title, status, isERC). Importing the
// full valid-* arrays there (~365KB for validEIPs) blows Vercel's 1MB
// edge-function limit. Precompute a slim per-kind index of just those
// fields, keyed by proposal number, so the route bundles ~120KB instead.
// Regenerate with `bun run gen-og-index` (chained into `bun run eip`).
type OgEntry = { title?: string; status?: string; isERC?: boolean };
type OgMap = Record<string, OgEntry>;

const slim = (proposals: ValidEIPs): OgMap => {
  const out: OgMap = {};
  for (const [key, p] of Object.entries(proposals)) {
    const entry: OgEntry = {};
    if (p.title !== undefined) entry.title = p.title;
    if (p.status !== undefined) entry.status = p.status;
    if (p.isERC) entry.isERC = true;
    out[key] = entry;
  }
  return out;
};

const index = {
  eip: slim(validEIPs),
  rip: slim(validRIPs),
  caip: slim(validCAIPs),
};

const outputPath = path.resolve(__dirname, "../data/og-index.json");
fs.writeFileSync(outputPath, `${JSON.stringify(index)}\n`);

const size = (fs.statSync(outputPath).size / 1024).toFixed(1);
console.log(`OG index written to ${outputPath} (${size} KB)`);
console.log(
  `entries — eip:${Object.keys(index.eip).length} ` +
    `rip:${Object.keys(index.rip).length} caip:${Object.keys(index.caip).length}`
);
