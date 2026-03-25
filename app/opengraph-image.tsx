import { ImageResponse } from "next/og";

export const alt = "TaoPulse — Bittensor & TAO Analytics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080d14",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 800,
            letterSpacing: "-2px",
            marginBottom: 24,
            display: "flex",
            gap: "8px",
          }}
        >
          <span style={{ color: "white" }}>TAO</span>
          <span style={{ color: "#a855f7" }}>Pulse</span>
        </div>
        <svg viewBox="0 0 200 40" width="400" height="80" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 40 }}>
          <polyline
            points="0,20 60,20 85,15 99,30 115,0 131,40 145,20 155,20 170,28 185,20 200,20"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: "#a855f7",
          }}
        >
          Bittensor &amp; TAO Analytics
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
