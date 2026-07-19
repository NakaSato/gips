import {
  createProposalListOpenGraphImage,
  proposalListOgContentType,
  proposalListOgSize,
} from "@/utils/proposalListOgImage";

export const runtime = "nodejs";
export const alt = "All RIPs on IP.tools";
export const size = proposalListOgSize;
export const contentType = proposalListOgContentType;

export default function Image() {
  return createProposalListOpenGraphImage("rip");
}
