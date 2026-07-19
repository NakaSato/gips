import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { validEIPs } from "@/data/validEIPs";
import { validRIPs } from "@/data/validRIPs";
import { validCAIPs } from "@/data/validCAIPs";
import { getProposalListItems, type ProposalListKind } from "@/utils/proposals";
import type { ValidEIPs } from "@/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Precompute the deduped proposal count per kind so the OG image edge
// functions can render "{N} proposals" without bundling the full
// valid-* arrays (validEIPs alone is ~365KB, which blows Vercel's 1MB
// edge-function limit). Counts must stay in sync with the dedup/include
// logic in getProposalListItems — this script reuses it, so they cannot
// drift as long as this runs after fetchValidEIPs.
const source: Record<ProposalListKind, ValidEIPs> = {
  eip: validEIPs,
  erc: validEIPs,
  rip: validRIPs,
  caip: validCAIPs,
};

const counts = Object.fromEntries(
  (Object.keys(source) as ProposalListKind[]).map((kind) => [
    kind,
    getProposalListItems(source[kind], kind).length,
  ])
) as Record<ProposalListKind, number>;

const outputPath = path.resolve(__dirname, "../data/proposal-counts.json");
fs.writeFileSync(outputPath, `${JSON.stringify(counts, null, 2)}\n`);

console.log("Proposal counts written to", outputPath);
console.log(counts);
