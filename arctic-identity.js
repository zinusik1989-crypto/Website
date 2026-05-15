/**
 * Arctic AI Identity — мини-игра (только клиент, без сервера).
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
    },
  ];

  const SCAN_STAGES = [
    "Анализируем черты лица…",
    "Подбираем северную эстетику…",
    "Создаём cinematic identity…",
  ];

  const SCAN_DURATION_MS = 4200;

  let root = null;
  let photoUrl = null;
  let photoFile = null;
  let selectedStyle = null;

  const $ = (sel, ctx = root) => ctx && ctx.querySelector(sel);

  function revokePhoto() {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      photoUrl = null;
    }
    photoFile = null;
  }

  function showStep(name) {
    root.querySelectorAll(".ai-id__step").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.step === name);
    });
  }

  function showToast(msg, ms = 3200) {
    const t = $(".ai-id__toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => t.classList.remove("is-visible"), ms);
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

  async function shareCard() {
    if (!navigator.share) {
      showToast("Поделиться недоступно в этом браузере");
      return;
    }
    const text = `Мой Arctic AI Identity: ${selectedStyle?.name || "стиль"} — ${selectedStyle?.tagline || ""}\nhttps://zinusik1989-crypto.github.io/Website/#arctic-identity`;
    try {
      if (photoFile && navigator.canShare?.({ files: [photoFile] })) {
        await navigator.share({
          title: "Arctic AI Identity",
          text,
          files: [photoFile],
        });
      } else {
        await navigator.share({ title: "Arctic AI Identity", text, url: window.location.href });
      }
    } catch (err) {
      if (err.name !== "AbortError") showToast("Не удалось поделиться");
    }
  }

  function resetToUpload() {
    selectedStyle = null;
    revokePhoto();
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
    $(".ai-id__btn-download")?.addEventListener("click", downloadCard);
    $(".ai-id__btn-share")?.addEventListener("click", shareCard);
    $(".ai-id__btn-retry")?.addEventListener("click", resetToUpload);
  }

  function init() {
    root = document.getElementById("arcticIdentity");
    if (!root) return;

    spawnSnow($(".ai-id__snow"));
    bindUpload();
    bindActions();
    showStep("upload");

    window.addEventListener("beforeunload", revokePhoto);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
