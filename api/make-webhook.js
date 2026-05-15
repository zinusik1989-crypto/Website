/**
 * Прокси для Make.com webhook — обходит CORS (браузер → Vercel → Make).
 * OPENAI_API_KEY не нужен: ключ только в сценарии Make.
 */
const DEFAULT_MAKE_WEBHOOK =
  "https://hook.eu1.make.com/53w90r7hodo8c46hfswv949nbkoxog8n";

function getAllowedOrigins() {
  const raw = process.env.ARCTIC_ALLOWED_ORIGINS || "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([
    "https://zinusik1989-crypto.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5500",
    ...fromEnv,
  ]);
}

function resolveCorsOrigin(requestOrigin) {
  const allowed = getAllowedOrigins();
  if (requestOrigin && allowed.has(requestOrigin)) return requestOrigin;
  if (!requestOrigin) return allowed.values().next().value || "*";
  return null;
}

function setCors(res, origin) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function handler(req, res) {
  const corsOrigin = resolveCorsOrigin(req.headers.origin);

  if (req.method === "OPTIONS") {
    if (!corsOrigin && req.headers.origin) {
      setCors(res, null);
      res.statusCode = 403;
      res.end(JSON.stringify({ error: "Origin not allowed" }));
      return;
    }
    setCors(res, corsOrigin);
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    setCors(res, corsOrigin);
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  if (!corsOrigin && req.headers.origin) {
    setCors(res, null);
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Origin not allowed" }));
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== "object") body = {};

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    setCors(res, corsOrigin);
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Field prompt is required" }));
    return;
  }

  const webhookUrl = (process.env.MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK).replace(/\s+/g, "");

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const text = await upstream.text();
    setCors(res, corsOrigin);
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(text || "{}");
  } catch (err) {
    console.error("[make-webhook]", err);
    setCors(res, corsOrigin);
    res.statusCode = 502;
    res.end(
      JSON.stringify({
        error: "Не удалось связаться с Make.com. Проверьте, что сценарий включён.",
      })
    );
  }
}

module.exports = handler;
