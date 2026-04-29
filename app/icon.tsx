import { ImageResponse } from "next/og"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: "#05070d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Orbit ring */}
      <div
        style={{
          position: "absolute",
          width: 52,
          height: 28,
          border: "2.5px solid rgba(255,255,255,0.9)",
          borderRadius: "50%",
          top: 18,
          left: 6,
        }}
      />
      {/* Planet circle */}
      <div
        style={{
          position: "absolute",
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "white",
          left: 7,
          top: 20,
        }}
      />
      {/* Star dot */}
      <div
        style={{
          position: "absolute",
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "white",
          right: 9,
          top: 11,
        }}
      />
    </div>,
    { ...size },
  )
}
