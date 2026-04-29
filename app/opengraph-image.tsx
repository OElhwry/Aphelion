import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Aphelion — Solar System Explorer"

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        backgroundColor: "#05070d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Deep-space radial gradient — top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(20,56,110,0.55) 0%, transparent 65%)",
        }}
      />
      {/* Deep-space radial gradient — bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 40% at 50% 100%, rgba(35,81,162,0.38) 0%, transparent 60%)",
        }}
      />

      {/* Icon badge */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 18,
          backgroundColor: "#0c111e",
          border: "1.5px solid rgba(255,255,255,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          marginBottom: 36,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 70,
            height: 38,
            border: "3px solid rgba(255,255,255,0.88)",
            borderRadius: "50%",
            top: 25,
            left: 9,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "white",
            left: 11,
            top: 29,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "white",
            right: 14,
            top: 16,
          }}
        />
      </div>

      {/* Wordmark */}
      <div
        style={{
          color: "rgba(255,255,255,0.96)",
          fontSize: 88,
          fontWeight: 900,
          letterSpacing: "0.32em",
          marginBottom: 18,
          textAlign: "center",
        }}
      >
        APHELION
      </div>

      {/* Cyan divider */}
      <div
        style={{
          width: 56,
          height: 2,
          backgroundColor: "#00d4ff",
          marginBottom: 22,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          color: "rgba(255,255,255,0.58)",
          fontSize: 28,
          letterSpacing: "0.48em",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        SOLAR SYSTEM EXPLORER
      </div>

      {/* URL chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid rgba(0,212,255,0.28)",
          borderRadius: 9999,
          padding: "8px 20px",
        }}
      >
        <div
          style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#00d4ff" }}
        />
        <span style={{ color: "rgba(0,212,255,0.8)", fontSize: 20, letterSpacing: "0.2em" }}>
          aphelion.website
        </span>
      </div>
    </div>,
    { ...size },
  )
}
