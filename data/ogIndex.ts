import _ogIndex from "@/data/og-index.json";

// Slim per-kind proposal index (title/status/isERC only), precomputed by
// scripts/genOgIndex.ts. Imported by the OG image edge route so it does
// not bundle the full valid-* arrays (see that script for the rationale).
export type OgProposal = {
  title?: string;
  status?: string;
  isERC?: boolean;
};

type OgIndex = Record<"eip" | "rip" | "caip", Record<string, OgProposal>>;

export const ogIndex: OgIndex = _ogIndex;
