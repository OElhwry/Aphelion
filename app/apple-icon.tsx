import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: 36,
        backgroundColor: "#05070d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Outer glow ring */}
      <div
        style={{
          position: "absolute",
          width: 148,
          height: 80,
          border: "7px solid rgba(255,255,255,0.85)",
          borderRadius: "50%",
          top: 50,
          left: 16,
        }}
      />
      {/* Planet circle */}
      <div
        style={{
          position: "absolute",
          width: 68,
          height: 68,
          borderRadius: "50%",
          backgroundColor: "white",
          left: 18,
          top: 56,
        }}
      />
      {/* Star dot */}
      <div
        style={{
          position: "absolute",
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "white",
          right: 26,
          top: 30,
        }}
      />
    </div>,
    { ...size },
  )
}
