import { ImageResponse } from "next/og";
import { proposalCounts } from "@/data/proposalCounts";
import { proposalListMetadata } from "@/utils/proposalListMetadata";
import type { ProposalListKind } from "@/utils/proposals";

export const proposalListOgSize = {
  width: 2144,
  height: 1122,
};

export const proposalListOgContentType = "image/png";

export const createProposalListOpenGraphImage = async (
  kind: ProposalListKind
) => {
  const config = proposalListMetadata[kind];
  // Use the precomputed count instead of loading the full valid-* arrays,
  // which would blow the 1MB edge-function limit (validEIPs is ~365KB).
  const proposalCount = proposalCounts[kind];

  const fontData = await fetch(
    new URL("../assets/Poppins-Bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const imgArrayBuffer = await fetch(
    new URL("../public/og/base.png", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const buffer = Buffer.from(imgArrayBuffer);
  const imgUrl = `data:image/png;base64,${buffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          backgroundImage: `url('${imgUrl}')`,
          backgroundSize: "100% 100%",
          width: "100%",
          height: "100%",
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Poppins",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 160,
            right: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 118,
            borderRadius: "20px",
            padding: "0 44px",
            background: "#27272A",
            color: "#D4D4D8",
            fontSize: 52,
            lineHeight: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              transform: "translateY(5px)",
            }}
          >
            {proposalCount} proposals
          </div>
        </div>
        <div
          style={{
            marginTop: 160,
            marginLeft: 150,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              marginTop: 60,
              fontSize: 150,
              fontWeight: "bold",
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {config.heading}
          </div>
        </div>
      </div>
    ),
    {
      ...proposalListOgSize,
      fonts: [
        {
          name: "Poppins",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
};
