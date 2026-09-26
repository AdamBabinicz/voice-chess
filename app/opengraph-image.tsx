// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChessTactics Audio Coach";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0c0a09",
        border: "16px solid #166534",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44, color: "#4ade80", marginBottom: 16 }}>
        ♔ ChessTactics
      </div>
      <div style={{ fontSize: 64, fontWeight: "bold", marginBottom: 20 }}>
        Audio Coach & Blindfold AI
      </div>
      <div style={{ fontSize: 28, color: "#a8a29e", maxWidth: 900 }}>
        Graj w szachy i trenuj taktykę w ciemno wyłącznie za pomocą głosu
      </div>
    </div>,
    { ...size },
  );
}
