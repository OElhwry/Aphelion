import { NextResponse } from "next/server"

// Cache for an hour — the astronaut roster changes rarely, and this keeps us well
// under any rate limits. Proxying server-side also avoids mixed-content/CORS
// issues calling the http-only open-notify API from an https page.
export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch("http://api.open-notify.org/astros.json", {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`open-notify ${res.status}`)
    const data = (await res.json()) as {
      number: number
      people: { name: string; craft: string }[]
    }
    return NextResponse.json({
      number: data.number,
      people: (data.people ?? []).map((p) => ({ name: p.name, craft: p.craft })),
    })
  } catch {
    // Soft-fail: the UI just hides the chip when number is null.
    return NextResponse.json({ number: null, people: [] })
  }
}
