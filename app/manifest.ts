import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aphelion | Solar System Explorer",
    short_name: "Aphelion",
    description:
      "An interactive 3D journey through the solar system. Explore planets, discover space facts, and test your knowledge.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/aphelion-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    categories: ["education", "entertainment"],
  }
}
