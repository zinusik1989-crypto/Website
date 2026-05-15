/**
 * Arctic AI Identity — мини-игра + генерация через Make.com webhook.
 */
(function () {
  const STYLES = [
    {
      id: "arctic-queen",
      name: "Arctic Queen",
      short: "Ледяная королева с сиянием",
      desc: "Холодный свет, корона из инея, властный взгляд.",
      tagline: "Власть севера в каждом кадре.",
      palette: "linear-gradient(90deg, #0ea5e9, #67e8f9, #e0f2fe)",
      filter:
        "linear-gradient(180deg, rgba(14,165,233,.25), transparent 50%), radial-gradient(circle at 50% 0%, rgba(103,232,249,.35), transparent 55%)",
      imagePrompt:
        "Ice queen portrait, cold cyan aurora light, frost details, regal editorial arctic fashion in Zapolyarye.",
    },
    {
      id: "nordic-goddess",
      name: "Nordic Goddess",
      short: "Скандинавская богиня света",
      desc: "Мягкий золотой час, тёплый мех, божественное спокойствие.",
      tagline: "Божественный свет полярного неба.",
      palette: "linear-gradient(90deg, #f5e6c8, #c4b5fd, #38bdf8)",
      filter:
        "linear-gradient(180deg, rgba(245,230,200,.2), transparent 45%), radial-gradient(circle at 70% 20%, rgba(196,181,253,.25), transparent 50%)",
      imagePrompt:
        "Nordic goddess portrait, soft golden hour, warm fur, divine calm, Scandinavian luxury editorial.",
    },
    {
      id: "cyber-ice",
      name: "Cyber Ice",
      short: "Неоновый лёд будущего",
      desc: "Кибер-север: неон, глитч, холодный металл.",
      tagline: "Будущее уже замёрзло в красоте.",
      palette: "linear-gradient(90deg, #06b6d4, #a855f7, #22d3ee)",
      filter:
        "linear-gradient(135deg, rgba(6,182,212,.3), rgba(168,85,247,.2)), linear-gradient(0deg, rgba(34,211,238,.15), transparent)",
      imagePrompt:
        "Cyber-arctic portrait, neon cyan and violet, futuristic Zapolyarye, cinematic sci-fi editorial.",
    },
    {
      id: "dark-blizzard",
      name: "Dark Blizzard",
      short: "Тёмная метель и драма",
      desc: "Контраст, тени, снежная буря, кинематограф.",
      tagline: "Драма метели в одном кадре.",
      palette: "linear-gradient(90deg, #1e293b, #475569, #94a3b8)",
      filter:
        "linear-gradient(180deg, rgba(15,23,42,.55), transparent 40%), radial-gradient(circle at 50% 100%, rgba(148,163,184,.2), transparent 60%)",
      imagePrompt:
        "Dark blizzard portrait, dramatic shadows, snow storm, moody cinematic noir arctic editorial.",
    },
    {
      id: "frozen-royalty",
      name: "Frozen Royalty",
      short: "Замёрзшая королевская роскошь",
      desc: "Бархат, жемчуг, ледяные детали haute couture.",
      tagline: "Королевская эстетика вечной зимы.",
      palette: "linear-gradient(90deg, #fce7f3, #e2e8f0, #bae6fd)",
      filter:
        "linear-gradient(180deg, rgba(252,231,243,.22), transparent 50%), radial-gradient(circle at 30% 30%, rgba(186,230,253,.3), transparent 55%)",
      imagePrompt:
        "Frozen royalty portrait, pearls, velvet, ice crystal couture, soft pink and silver winter queen.",
    },
    {
      id: "aurora-soul",
      name: "Aurora Soul",
      short: "Душа северного сияния",
      desc: "Живое сияние, мятный и бирюзовый свет.",
      tagline: "Ваша душа — это северное сияние.",
      palette: "linear-gradient(90deg, #34d399, #22d3ee, #818cf8)",
      filter:
        "radial-gradient(ellipse at 50% 20%, rgba(52,211,153,.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(34,211,238,.25), transparent 50%)",
      imagePrompt:
        "Aurora soul portrait, northern lights, mint and turquoise glow, ethereal spiritual arctic atmosphere.",
    },
  ];

  const SCAN_STAGES = [
    "Анализируем черты лица…",
    "Подбираем северную эстетику…",
    "Создаём cinematic identity…",
  ];

  const SCAN_DURATION_MS = 4200;
  const SHARE_URL = "https://zinusik1989-crypto.github.io/Website/#arctic-identity";

  /** Webhook Make.com (можно переопределить через data-webhook-url на #arcticIdentity) */
  const DEFAULT_WEBHOOK_URL =
    "https://hook.eu1.make.com/53w90r7hodo8c46hfswv949nbkoxog8n";

  let root = null;
  let photoUrl = null;
  let photoFile = null;
  let selectedStyle = null;
  let generatedImageDataUrl = null;
  let generateAbort = null;

  const $ = (sel, ctx = root) => ctx && ctx.querySelector(sel);

  function getWebhookUrl() {
    const custom = root?.dataset.webhookUrl?.trim();
    return (custom || DEFAULT_WEBHOOK_URL).replace(/\s+/g, "");
  }

  function getWebhookHeaders() {
    const headers = { "Content-Type": "application/json" };
    const apiKey = root?.dataset.webhookKey?.trim();
    if (apiKey) headers["x-make-apikey"] = apiKey;
    return headers;
  }

  function getProxyBase() {
    const proxy = root?.dataset.proxyUrl?.trim();
    return proxy ? proxy.replace(/\/$/, "") : "";
  }

  function needsCorsBypass() {
    const mode = root?.dataset.corsMode?.trim();
    if (mode === "off") return false;
    if (mode === "on") return true;
    return (
      location.hostname.includes("github.io") ||
      location.protocol === "file:" ||
      location.hostname === ""
    );
  }

  /** Цепочка способов достучаться до Make (без Vercel). */
  function buildFetchStrategies() {
    const webhook = getWebhookUrl();
    const list = [];
    const proxy = getProxyBase();

    if (proxy) {
      list.push({ url: `${proxy}/api/make-webhook`, kind: "own-proxy" });
      list.push({ url: `${proxy}/.netlify/functions/make-webhook`, kind: "netlify-on-proxy" });
    }

    if (location.hostname.endsWith("netlify.app")) {
      list.push({ url: "/.netlify/functions/make-webhook", kind: "netlify" });
    }

    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      list.push({ url: "/.netlify/functions/make-webhook", kind: "netlify-local" });
      list.push({ url: "/api/make-webhook", kind: "vercel-local" });
    }

    if (needsCorsBypass()) {
      list.push({ url: webhook, kind: "corsproxy" });
    }

    list.push({ url: webhook, kind: "direct" });

    const seen = new Set();
    return list.filter((s) => {
      const key = `${s.kind}:${s.url}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function unwrapMakeData(data) {
    if (!data) return data;
    if (typeof data === "string") {
      try {
        return unwrapMakeData(JSON.parse(data));
      } catch {
        return data;
      }
    }
    if (data.body != null) {
      if (typeof data.body === "string") {
        try {
          return unwrapMakeData(JSON.parse(data.body));
        } catch {
          return data;
        }
      }
      return unwrapMakeData(data.body);
    }
    if (Array.isArray(data) && data.length === 1) return unwrapMakeData(data[0]);
    return data;
  }

  function extractImage(data) {
    const unwrapped = unwrapMakeData(data);
    if (!unwrapped) return null;

    if (typeof unwrapped === "string") {
      if (unwrapped.startsWith("http")) return unwrapped;
      return normalizeImagePayload(unwrapped);
    }

    const urlCandidates = [unwrapped.url, unwrapped.imageUrl, unwrapped.image_url];
    for (const u of urlCandidates) {
      if (typeof u === "string" && u.startsWith("http")) return u;
    }

    const b64Candidates = [
      unwrapped.image,
      unwrapped.imageBase64,
      unwrapped.b64_json,
      unwrapped.result?.image,
      unwrapped.data?.image,
    ];
    for (const raw of b64Candidates) {
      const normalized = normalizeImagePayload(raw);
      if (normalized) return normalized;
    }
    return null;
  }

  function buildGenerationPrompt(style) {
    return [
      "Luxury arctic neuro-photoshoot portrait in Russian Arctic / Zapolyarye.",
      "Cinematic editorial fashion photography, preserve person identity, 8K detail.",
      `Style: ${style.name}.`,
      style.imagePrompt,
      style.desc,
      style.tagline ? `Mood: ${style.tagline}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function normalizeImagePayload(raw) {
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (trimmed.startsWith("data:image")) return trimmed;
    const b64 = trimmed.replace(/^data:image\/\w+;base64,/, "");
    return `data:image/png;base64,${b64}`;
  }

  function resolveFetchUrl(strategy) {
    if (strategy.kind === "corsproxy") {
      return `https://corsproxy.io/?${encodeURIComponent(strategy.url)}`;
    }
    return strategy.url;
  }

  function httpErrorMessage(status, detail) {
    if (status === 401) {
      return (
        "Webhook Make не принимает запросы (401). Откройте Make → модуль Webhook → " +
        "создайте НОВЫЙ webhook, скопируйте URL в data-webhook-url на сайте. " +
        "Если включён API Key — впишите его в data-webhook-key или отключите защиту."
      );
    }
    if (status === 410) {
      return "Сценарий Make выключен или webhook устарел. Включите сценарий (ON) и обновите URL.";
    }
    if (status === 404) {
      return "Webhook Make не найден. Проверьте URL в data-webhook-url.";
    }
    return detail || `Ошибка Make (HTTP ${status})`;
  }

  async function parseMakeResponse(response) {
    const rawText = await response.text();

    if (!response.ok) {
      let detail = rawText.trim().slice(0, 160);
      if (rawText.trim()) {
        try {
          const parsed = unwrapMakeData(JSON.parse(rawText));
          detail = parsed?.error || parsed?.message || parsed?.description || detail;
        } catch {
          /* не JSON — оставляем detail как текст */
        }
      }
      const err = new Error(httpErrorMessage(response.status, detail));
      err.retryable =
        response.status !== 401 &&
        response.status !== 404 &&
        response.status !== 410 &&
        (response.status === 408 || response.status === 429 || response.status >= 500);
      throw err;
    }

    if (!rawText.trim()) {
      const err = new Error("Make вернул пустой ответ. Добавьте модуль Webhook response с JSON.");
      err.retryable = false;
      throw err;
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      const hint =
        rawText.trim() === "Accepted"
          ? "Make принял запрос, но не вернул картинку. Добавьте в сценарий модули OpenAI → Webhook response с JSON {\"image\":\"...\"}."
          : "Make вернул не JSON. В конце сценария нужен модуль Webhook response: {\"image\":\"...\"}";
      const err = new Error(hint);
      err.retryable = false;
      throw err;
    }

    const image = extractImage(data);
    if (!image) {
      const err = new Error(
        'Make не вернул "image" (base64) или url. В Webhook response: {"image":"{{base64}}"}'
      );
      err.retryable = false;
      throw err;
    }
    return image;
  }

  async function tryFetchStrategy(strategy, prompt, signal) {
    const url = resolveFetchUrl(strategy);
    const response = await fetch(url, {
      method: "POST",
      headers: getWebhookHeaders(),
      body: JSON.stringify({ prompt, text: prompt }),
      signal,
    });
    return parseMakeResponse(response);
  }

  function showError(msg) {
    const box = $(".ai-id__error");
    if (box) {
      box.textContent = msg;
      box.hidden = false;
    }
    showToast(msg, 9000);
  }

  function clearError() {
    const box = $(".ai-id__error");
    if (box) {
      box.textContent = "";
      box.hidden = true;
    }
  }

  /**
   * Запрос к Make.com: JSON { prompt } → { image }.
   * На GitHub Pages автоматически используется CORS-прокси (Vercel не нужен).
   */
  async function generateArcticImage(prompt, signal) {
    const strategies = buildFetchStrategies();
    let lastError = null;

    for (const strategy of strategies) {
      try {
        return await tryFetchStrategy(strategy, prompt, signal);
      } catch (err) {
        if (err.name === "AbortError") throw err;
        lastError = err;
        if (err.retryable === false) throw err;
        continue;
      }
    }

    if (lastError instanceof TypeError) {
      throw new Error(
        "Не удалось связаться с Make. Проверьте интернет и что сценарий в Make.com включён (ON)."
      );
    }
    throw lastError || new Error("Не удалось сгенерировать изображение");
  }

  function revokePhoto() {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      photoUrl = null;
    }
    photoFile = null;
  }

  function clearGeneratedImage() {
    generatedImageDataUrl = null;
    const img = $(".ai-id__generated-img");
    if (img) {
      img.removeAttribute("src");
      img.alt = "";
    }
  }

  function showStep(name) {
    root.querySelectorAll(".ai-id__step").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.step === name);
    });
    root.classList.toggle("ai-id--generating", name === "generating");
  }

  function showToast(msg, ms = 3200) {
    const t = $(".ai-id__toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => t.classList.remove("is-visible"), ms);
  }

  function mapApiError(message) {
    const m = String(message || "");
    if (/401|доступ запрещён|webhook-key/i.test(m)) return m;
    if (/Failed to fetch|NetworkError|Load failed|связаться с Make/i.test(m)) {
      return "Нет связи с Make. Проверьте интернет и что сценарий включён (ON).";
    }
    if (/HTTP 404|410|выключен/i.test(m)) return m;
    if (/HTTP 500|502|503|внутри сценария/i.test(m)) {
      return "Ошибка внутри сценария Make. Откройте History → последний запуск → детали.";
    }
    if (/не JSON|не вернул/i.test(m)) return m;
    return m || "Не удалось создать образ. Попробуйте ещё раз.";
  }

  function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve(window.html2canvas);
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.async = true;
      s.onload = () =>
        window.html2canvas ? resolve(window.html2canvas) : reject(new Error("html2canvas failed"));
      s.onerror = () => reject(new Error("load failed"));
      document.head.appendChild(s);
    });
  }

  function spawnSnow(container, count = 28) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const flake = document.createElement("span");
      const size = 2 + Math.random() * 4;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.animationDuration = `${4 + Math.random() * 6}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.opacity = String(0.35 + Math.random() * 0.55);
      container.appendChild(flake);
    }
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Выберите файл изображения (JPG или PNG)");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showToast("Файл слишком большой (макс. 12 МБ)");
      return;
    }
    revokePhoto();
    clearGeneratedImage();
    photoFile = file;
    photoUrl = URL.createObjectURL(file);

    const previews = root.querySelectorAll(".ai-id__preview, .ai-id__result-photo img");
    previews.forEach((img) => {
      img.src = photoUrl;
      img.alt = "Ваше фото для Arctic AI Identity";
    });

    runScan();
  }

  function runScan() {
    showStep("scan");
    const bar = $(".ai-id__progress-bar");
    const progress = $(".ai-id__progress");
    const stageEl = $(".ai-id__stage");
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / SCAN_DURATION_MS);
      const pct = Math.round(t * 100);
      if (bar) bar.style.width = `${pct}%`;
      if (progress) progress.setAttribute("aria-valuenow", String(pct));
      const stageIdx = Math.min(SCAN_STAGES.length - 1, Math.floor(t * SCAN_STAGES.length));
      if (stageEl) stageEl.textContent = SCAN_STAGES[stageIdx];
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        showStyles();
      }
    }
    if (bar) bar.style.width = "0%";
    if (progress) progress.setAttribute("aria-valuenow", "0");
    requestAnimationFrame(tick);
  }

  function renderStyles() {
    const grid = $(".ai-id__styles");
    if (!grid) return;
    grid.innerHTML = "";
    STYLES.forEach((style) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-id__style";
      btn.dataset.styleId = style.id;
      btn.innerHTML = `
        <span class="ai-id__palette" style="background:${style.palette}"></span>
        <span class="ai-id__style-name">${style.name}</span>
        <span class="ai-id__style-desc">${style.short}</span>
        <span class="ai-id__style-cta">Выбрать</span>
      `;
      btn.addEventListener("click", () => selectStyle(style));
      grid.appendChild(btn);
    });
  }

  function showStyles() {
    renderStyles();
    showStep("styles");
  }

  function selectStyle(style) {
    selectedStyle = style;
    clearGeneratedImage();
    root.querySelectorAll(".ai-id__style").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.styleId === style.id);
    });

    const photoWrap = $(".ai-id__result-photo");
    if (photoWrap) photoWrap.style.setProperty("--ai-filter", style.filter);

    const name = $(".ai-id__result-name");
    const desc = $(".ai-id__result-desc");
    const tag = $(".ai-id__result-tagline");
    const label = $(".ai-id__result-style");
    if (name) name.textContent = style.name;
    if (desc) desc.textContent = style.desc;
    if (tag) tag.textContent = `«${style.tagline}»`;
    if (label) label.textContent = "Arctic AI Identity";

    showStep("result");
  }

  function showGeneratedResult(imageDataUrl) {
    generatedImageDataUrl = imageDataUrl;
    const img = $(".ai-id__generated-img");
    const name = $(".ai-id__generated-name");
    if (img) {
      img.src = imageDataUrl;
      img.alt = `AI-фотосессия: ${selectedStyle?.name || "Arctic"}`;
    }
    if (name) name.textContent = selectedStyle?.name || "";
    showStep("generated");
  }

  async function requestGeneration() {
    if (!photoFile || !selectedStyle) {
      showToast("Загрузите фото и выберите стиль");
      return;
    }

    if (generateAbort) generateAbort.abort();
    generateAbort = new AbortController();

    clearError();
    showStep("generating");
    root.querySelectorAll(".ai-id__btn").forEach((b) => {
      b.disabled = true;
    });

    const prompt = buildGenerationPrompt(selectedStyle);

    try {
      const image = await generateArcticImage(prompt, generateAbort.signal);
      clearError();
      showGeneratedResult(image);
      showToast("Ваш арктический образ готов");
    } catch (err) {
      if (err.name === "AbortError") return;
      showStep("result");
      showError(mapApiError(err.message));
    } finally {
      generateAbort = null;
      root.querySelectorAll(".ai-id__btn").forEach((b) => {
        b.disabled = false;
      });
    }
  }

  async function downloadCard() {
    const card = $(".ai-id__result-card");
    if (!card) return;
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(card, {
        backgroundColor: "#030a1a",
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `arctic-ai-identity-${selectedStyle?.id || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Карточка сохранена");
    } catch {
      showToast("Не удалось сохранить PNG. Сделайте скриншот карточки.");
    }
  }

  function downloadGenerated() {
    if (!generatedImageDataUrl) {
      showToast("Сначала сгенерируйте образ");
      return;
    }
    const link = document.createElement("a");
    link.download = `arctic-ai-photoshoot-${selectedStyle?.id || "result"}.png`;
    link.href = generatedImageDataUrl;
    link.click();
    showToast("Изображение сохранено");
  }

  async function dataUrlToFile(dataUrl, filename) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || "image/png" });
  }

  async function shareCard() {
    if (!navigator.share) {
      showToast("Поделиться недоступно в этом браузере");
      return;
    }
    const text = `Мой Arctic AI Identity: ${selectedStyle?.name || "стиль"} — ${selectedStyle?.tagline || ""}\n${SHARE_URL}`;
    try {
      if (photoFile && navigator.canShare?.({ files: [photoFile] })) {
        await navigator.share({
          title: "Arctic AI Identity",
          text,
          files: [photoFile],
        });
      } else {
        await navigator.share({ title: "Arctic AI Identity", text, url: SHARE_URL });
      }
    } catch (err) {
      if (err.name !== "AbortError") showToast("Не удалось поделиться");
    }
  }

  async function shareGenerated() {
    if (!navigator.share) {
      showToast("Поделиться недоступно в этом браузере");
      return;
    }
    const text = `Моя AI-фотосессия Arctic: ${selectedStyle?.name || ""}\n${SHARE_URL}`;
    try {
      const file = await dataUrlToFile(
        generatedImageDataUrl,
        `arctic-ai-${selectedStyle?.id || "photo"}.png`
      );
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "Arctic AI Photoshoot", text, files: [file] });
      } else {
        await navigator.share({ title: "Arctic AI Photoshoot", text, url: SHARE_URL });
      }
    } catch (err) {
      if (err.name !== "AbortError") showToast("Не удалось поделиться");
    }
  }

  function resetToUpload() {
    if (generateAbort) generateAbort.abort();
    selectedStyle = null;
    revokePhoto();
    clearGeneratedImage();
    const previews = root.querySelectorAll(".ai-id__preview, .ai-id__result-photo img");
    previews.forEach((img) => {
      img.removeAttribute("src");
      img.alt = "";
    });
    const bar = $(".ai-id__progress-bar");
    const progress = $(".ai-id__progress");
    if (bar) bar.style.width = "0%";
    if (progress) progress.setAttribute("aria-valuenow", "0");
    showStep("upload");
  }

  function backToStyles() {
    clearGeneratedImage();
    showStyles();
  }

  function bindUpload() {
    const drop = $(".ai-id__drop");
    const input = $(".ai-id__file");
    const pickBtn = $(".ai-id__btn-pick");

    const openPicker = () => input?.click();
    pickBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openPicker();
    });
    drop?.addEventListener("click", openPicker);

    input?.addEventListener("change", () => {
      const f = input.files?.[0];
      if (f) handleFile(f);
      input.value = "";
    });

    ["dragenter", "dragover"].forEach((ev) => {
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach((ev) => {
      drop?.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        if (ev === "drop" && e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]);
      });
    });
  }

  function bindActions() {
    $(".ai-id__btn-generate")?.addEventListener("click", requestGeneration);
    $(".ai-id__btn-regenerate")?.addEventListener("click", requestGeneration);
    $(".ai-id__btn-download")?.addEventListener("click", downloadCard);
    $(".ai-id__btn-download-ai")?.addEventListener("click", downloadGenerated);
    $(".ai-id__btn-share")?.addEventListener("click", shareCard);
    $(".ai-id__btn-share-ai")?.addEventListener("click", shareGenerated);
    $(".ai-id__btn-retry")?.addEventListener("click", resetToUpload);
    $(".ai-id__btn-back-style")?.addEventListener("click", backToStyles);
  }

  function init() {
    root = document.getElementById("arcticIdentity");
    if (!root) return;

    spawnSnow($(".ai-id__snow"));
    bindUpload();
    bindActions();
    showStep("upload");

    window.addEventListener("beforeunload", () => {
      if (generateAbort) generateAbort.abort();
      revokePhoto();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
