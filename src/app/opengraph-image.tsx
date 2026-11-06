import { ImageResponse } from "next/og";

// The card shown when the site is shared on LinkedIn, Slack, X, LINE, etc.
export const alt = "Nurarat Sangreuang — Full-stack Developer. NurOS portfolio.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background:
            "radial-gradient(circle at 12% 18%, #6d3bd6 0, transparent 45%), radial-gradient(circle at 88% 12%, #e0527a 0, transparent 42%), radial-gradient(circle at 75% 92%, #ff8a4c 0, transparent 45%), radial-gradient(circle at 8% 90%, #1f6fd1 0, transparent 45%), #0d0b1e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #fb923c, #f43f5e 50%, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 800,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 30, letterSpacing: 8, opacity: 0.75 }}>NurOS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Nurarat Sangreuang</div>
          <div style={{ fontSize: 40, marginTop: 18, opacity: 0.85 }}>Full-stack Developer · .NET & Next.js · Bangkok</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
          <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "rgba(16,185,129,0.25)", border: "2px solid rgba(110,231,183,0.6)" }}>
            Open to UK roles · visa sponsorship or remote
          </div>
        </div>
      </div>
    ),
    size,
  );
}
