import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // --- CORS: OPTIONS（プリフライト） ---
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    })
  }

  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return new Response(JSON.stringify({ error: "lat/lng required" }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400
    })
  }

  // ★ Photon API（無料・安定）
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`

  const result = await fetch(url)
  const data = await result.json()

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  })
})
