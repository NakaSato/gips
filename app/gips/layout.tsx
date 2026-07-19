import { getBaseUrl, getMetadata } from "@/utils";

export const metadata = getMetadata({
  title: "GIPs | GridTokenX Improvement Proposals",
  description:
    "GridTokenX Improvement Proposals (GIPs) — open standards for P2P energy trading, tokenized RECs, carbon certificates, and platform governance.",
  images: `${getBaseUrl()}/gridtokenx-logo.svg`,
});

export default function GIPsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
