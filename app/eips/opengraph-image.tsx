import {
  createProposalListOpenGraphImage,
  proposalListOgContentType,
  proposalListOgSize,
} from "@/utils/proposalListOgImage";

export const runtime = "nodejs";
export const alt = "All EIPs on IP.tools";
export const size = proposalListOgSize;
export const contentType = proposalListOgContentType;

export default function Image() {
  return createProposalListOpenGraphImage("eip");
}
