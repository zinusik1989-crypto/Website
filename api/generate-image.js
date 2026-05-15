const { readFile } = require("node:fs/promises");
const { IncomingForm } = require("formidable");

const OPENAI_EDITS_URL = "https://api.openai.com/v1/images/edits";
const MODEL = "gpt-image-1";
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const STYLE_PROMPTS = {
  "arctic-queen":
    "Ice queen aesthetic: cold cyan and ice-blue light, subtle frost on hair and shoulders, regal powerful gaze, aurora rim light, haute couture arctic fashion.",
  "nordic-goddess":
    "Nordic goddess of light: soft golden hour glow, warm fur textures, divine calm expression, Scandinavian luxury editorial, gentle snow haze.",
  "cyber-ice":
    "Cyber-arctic future: neon cyan and violet accents, glitch-free cinematic sci-fi, cold metal reflections, futuristic Zapolyarye portrait.",
  "dark-blizzard":
    "Dark blizzard drama: high contrast, deep shadows, snow particles in wind, moody cinematic noir arctic portrait, editorial Vogue darkness.",
  "frozen-royalty":
    "Frozen royalty: pearl and velvet luxury, ice crystal jewelry, soft pink and silver palette, haute couture winter queen portrait.",
  "aurora-soul":
    "Aurora soul: living northern lights in background, mint and turquoise glow on skin, ethereal spiritual arctic portrait, dreamy atmosphere.",
};

const BASE_PROMPT =
  "Luxury arctic neuro-photoshoot portrait in Zapolyarye / Russian Arctic. Editorial fashion photography, cinematic depth, preserve the person's face and identity from the reference photo, natural skin texture, professional retouching, 8K detail.";

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

function json(res, status, body, corsOrigin) {
  setCors(res, corsOrigin);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: MAX_FILE_BYTES,
      maxFields: 8,
      allowEmptyFiles: false,
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function firstField(fields, name) {
  const v = fields[name];
  if (Array.isArray(v)) return (v[0] || "").trim();
  return (v || "").trim();
}

function firstFile(files, name) {
  const v = files[name];
  if (Array.isArray(v)) return v[0];
  return v;
}

function buildPrompt(styleId, styleName, userPrompt) {
  const stylePart = STYLE_PROMPTS[styleId] || `Style: ${styleName || styleId}.`;
  const extra = userPrompt ? ` Additional direction: ${userPrompt}` : "";
  return `${BASE_PROMPT} ${stylePart}${extra}`;
}

function bufferToDataUrl(buffer, mime) {
  const b64 = Buffer.from(buffer).toString("base64");
  return `data:${mime};base64,${b64}`;
}

async function callOpenAiEdit({ imageDataUrl, prompt }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY is not configured on the server");
    err.status = 503;
    throw err;
  }

  const body = {
    model: MODEL,
    prompt,
    images: [{ image_url: imageDataUrl }],
    input_fidelity: "high",
    size: "1024x1536",
    quality: "high",
    output_format: "png",
    n: 1,
  };

  const response = await fetch(OPENAI_EDITS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      data?.error?.message ||
      data?.error?.code ||
      `OpenAI API error (${response.status})`;
    const err = new Error(msg);
    err.status = response.status >= 500 ? 502 : 400;
    throw err;
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    const err = new Error("OpenAI returned no image data");
    err.status = 502;
    throw err;
  }

  return {
    image: `data:image/png;base64,${b64}`,
    revisedPrompt: data?.data?.[0]?.revised_prompt || null,
  };
}

async function handler(req, res) {
  const corsOrigin = resolveCorsOrigin(req.headers.origin);

  if (req.method === "OPTIONS") {
    if (!corsOrigin && req.headers.origin) {
      return json(res, 403, { error: "Origin not allowed" }, null);
    }
    setCors(res, corsOrigin);
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" }, corsOrigin);
  }

  if (!corsOrigin && req.headers.origin) {
    return json(res, 403, { error: "Origin not allowed" }, null);
  }

  try {
    const { fields, files } = await parseMultipart(req);
    const file = firstFile(files, "image");

    if (!file?.filepath) {
      return json(res, 400, { error: "Image file is required (field: image)" }, corsOrigin);
    }

    const styleId = firstField(fields, "styleId");
    const styleName = firstField(fields, "styleName");
    const userPrompt = firstField(fields, "prompt");

    if (!styleId) {
      return json(res, 400, { error: "styleId is required" }, corsOrigin);
    }

    const fileBuffer = await readFile(file.filepath);
    if (fileBuffer.length > MAX_FILE_BYTES) {
      return json(res, 400, { error: "Image too large (max 10 MB)" }, corsOrigin);
    }

    const mime = file.mimetype || "image/jpeg";
    if (!mime.startsWith("image/")) {
      return json(res, 400, { error: "Invalid file type" }, corsOrigin);
    }

    const imageDataUrl = bufferToDataUrl(fileBuffer, mime);
    const prompt = buildPrompt(styleId, styleName, userPrompt);

    const result = await callOpenAiEdit({ imageDataUrl, prompt });

    return json(
      res,
      200,
      {
        ok: true,
        image: result.image,
        styleId,
        revisedPrompt: result.revisedPrompt,
      },
      corsOrigin
    );
  } catch (err) {
    console.error("[generate-image]", err);
    const status = err.status || (err.code === "LIMIT_FILE_SIZE" ? 400 : 500);
    const message =
      status === 500
        ? "Не удалось сгенерировать изображение. Попробуйте позже."
        : err.message || "Bad request";
    return json(res, status, { error: message }, corsOrigin);
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
