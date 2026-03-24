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
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 20,
          }}
        >
          TaoPulse
        </div>
        <div
          style={{
            fontSize: 36,
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
