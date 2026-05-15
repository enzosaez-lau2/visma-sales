export const config = { runtime: 'edge' };

const API_KEY = "cb5a944dadb61a3b7eb51c321a3c4140";
const API_BASE = "https://api.samu.ai";

export default async function handler(req) {
  const url = new URL(req.url);
  const target = url.searchParams.get("path");

  if (!target) {
    return new Response(JSON.stringify({ error: "Missing path param" }), { status: 400 });
  }

  const apiUrl = `${API_BASE}${target}`;

  try {
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        "apiKey": API_KEY,
        "Content-Type": "application/json",
      },
      body: req.method !== "GET" ? req.body : undefined,
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
