import type { MetadataRoute } from "next"

const SITE = "https://aphelion.website"

// Each world is reachable via a shareable deep link (?planet=…), so list them all
// to widen search coverage and let individual planets surface in results.
const PLANETS = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...PLANETS.map((p) => ({
      url: `${SITE}/?planet=${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ]
}
