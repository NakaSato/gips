import { ProposalListPage } from "@/components/ProposalListPage";
import type { ProposalListItem } from "@/utils/proposals";

// GridTokenX Improvement Proposals — single seed entry.
const items: ProposalListItem[] = [
  {
    number: "1",
    label: "GIP-001",
    href: "/gips/1",
    title: "Energy Token Standard (GRID / GRX)",
    status: "Draft",
    markdownPath: "/gips/gip-1.md",
  },
];

export default function GIPsPage() {
  return (
    <ProposalListPage
      title="All GIPs"
      description="GridTokenX Improvement Proposals"
      items={items}
    />
  );
}
