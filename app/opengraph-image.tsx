// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
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
      {/* Czysty wektor SVG korony zamiast niewidocznego znaku Unicode */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "16px" }}
        >
          <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
        </svg>
        <span style={{ fontSize: 52, fontWeight: 900, color: "#4ade80" }}>
          ChessTactics
        </span>
      </div>

      <div style={{ fontSize: 62, fontWeight: 900, marginBottom: 20 }}>
        Audio Coach &amp; Blindfold AI
      </div>

      <div
        style={{
          fontSize: 26,
          color: "#a8a29e",
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        Graj w szachy i trenuj taktykę w ciemno wyłącznie za pomocą głosu
      </div>
    </div>,
    { ...size },
  );
}
