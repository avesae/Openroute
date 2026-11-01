import { ImageResponse } from "next/og";

export const alt = "Openroute — tours worldwide from Helsinki";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Картинка для соцсетей по умолчанию (для страниц без своего фото). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #142012 0%, #24401a 60%, #a3e635 140%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#a3e635" }} />
          Openroute
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Tours worldwide from Helsinki</div>
          <div style={{ fontSize: 34, color: "#d9f99d" }}>Beach · Sightseeing · Ski · Tailor-made · 24/7 support</div>
        </div>
      </div>
    ),
    size,
  );
}
