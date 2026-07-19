import _proposalCounts from "@/data/proposal-counts.json";
import type { ProposalListKind } from "@/utils/proposals";

// Deduped proposal count per kind, precomputed by
// scripts/genProposalCounts.ts. Imported by the OG image edge functions
// so they render "{N} proposals" without bundling the full valid-*
// arrays (see that script for the size rationale).
export const proposalCounts: Record<ProposalListKind, number> =
  _proposalCounts;
