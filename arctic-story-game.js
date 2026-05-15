/**
 * Север выбирает твою судьбу — cinematic story game.
 */
(function () {
  const STYLES = [
    {
      id: "ice-queen",
      name: "Ледяная Королева",
      color: "#0ea5e9",
      desc: "Ты несёшь энергию ледяного спокойствия, силы и северной элегантности. Твоя эстетика — cinematic luxury, холодная уверенность и образ героини frozen-вселенной.",
      colors: "серебряный хром, ледяной голубой, морозный белый, холодный жемчужный",
      outfit: "длинное светлое пальто, серебристые детали, объёмный шарф, мягкие зимние текстуры",
      locations: "ледяной дворец, замёрзшее озеро, арктический замок, снежные горы",
      stats: [
        { label: "Северная энергия", value: 96 },
        { label: "Кинематографичность", value: 98 },
        { label: "Энергия величия", value: 94 },
      ],
      prompt:
        "Hyperrealistic cinematic arctic portrait, realistic woman, elegant beige winter coat, silver scarf, frozen palace, aurora borealis, realistic skin texture, snow particles, luxury nordic editorial photography, 9:16",
    },
    {
      id: "aurora-soul",
      name: "Душа Северного Сияния",
      color: "#34d399",
      desc: "Твоя энергия мягкая, сияющая и мистическая, как северное небо. Тебе подходит нежный cinematic-образ с атмосферой света, воздуха и эмоциональной глубины.",
      colors: "сияющий голубой, серебристый свет, нежный cyan, холодный лавандовый",
      outfit: "светлое шерстяное пальто, струящийся шарф, воздушные ткани, мягкие layered-образы",
      locations: "поле северного сияния, ледяное озеро в blue hour, снежная равнина, замёрзший лес",
      stats: [
        { label: "Энергия сияния", value: 97 },
        { label: "Эмоциональная глубина", value: 94 },
        { label: "Мягкая сила", value: 91 },
      ],
      prompt:
        "Hyperrealistic aurora portrait, realistic woman, soft winter fashion, glowing northern lights, icy blue atmosphere, delicate snow particles, emotional cinematic mood, photorealistic editorial style, 9:16",
    },
    {
      id: "cyber-ice",
      name: "Кибер Лёд",
      color: "#22d3ee",
      desc: "Ты соединяешь эстетику будущего и холодную силу визуала. Твой стиль — futuristic winter fashion, chrome, neon и cinematic sci-fi.",
      colors: "chrome silver, neon cyan, тёмно-синий, графитовый",
      outfit: "futuristic trench coat, reflective детали, кибер-шарф, glowing seams, metallic textures",
      locations: "ледяной cyber-город, арктическая лаборатория, futuristic observatory, frozen neon world",
      stats: [
        { label: "Энергия будущего", value: 95 },
        { label: "Неоновая сила", value: 93 },
        { label: "Визуальный эффект", value: 99 },
      ],
      prompt:
        "Hyperrealistic cyber arctic portrait, realistic woman, futuristic silver trench coat, neon cyan glow, frozen cyber city, reflective ice, cinematic sci-fi editorial photography, 9:16",
    },
    {
      id: "dark-blizzard",
      name: "Тёмная Метель",
      color: "#64748b",
      desc: "В тебе есть драматичная глубина, тайна и энергия снежной бури. Тебе подходит образ героини cinematic snowstorm — сильной, загадочной и эмоциональной.",
      colors: "storm gray, графитовый, ледяной синий, холодный чёрный",
      outfit: "тёмное шерстяное пальто, oversized scarf, layered winter style, textured fabrics",
      locations: "снежная буря, ледяной каньон, снежная пустыня, арктическая ночь",
      stats: [
        { label: "Энергия тайны", value: 98 },
        { label: "Сила бури", value: 96 },
        { label: "Драматичность", value: 94 },
      ],
      prompt:
        "Hyperrealistic cinematic snowstorm portrait, realistic woman, dark winter coat, dramatic blizzard, cold flushed cheeks, snow particles, frozen mountains, emotional survival atmosphere, 9:16",
    },
    {
      id: "ice-oracle",
      name: "Ледяной Оракул",
      color: "#a78bfa",
      desc: "Ты похожа на героиню древней северной легенды. В твоём образе много интуиции, магии, тумана и ледяных символов.",
      colors: "ледяной белый, mist blue, серебристый, холодный туман",
      outfit: "layered winter robes, crystal details, меховые элементы, мистические текстуры",
      locations: "ледяной храм, пещера во льдах, северный алтарь, glacier temple",
      stats: [
        { label: "Интуиция", value: 97 },
        { label: "Мистическая энергия", value: 96 },
        { label: "Магия льда", value: 95 },
      ],
      prompt:
        "Hyperrealistic northern oracle portrait, realistic woman, layered winter robes, crystal details, arctic temple, frozen fog, mystical ice atmosphere, cinematic realism, 9:16",
    },
    {
      id: "snow-empress",
      name: "Снежная Императрица",
      color: "#e8d4f0",
      desc: "Твой образ — это роскошь, женственность и величие ледяной империи. Тебе подходит royal winter editorial эстетика и cinematic luxury mood.",
      colors: "жемчужный белый, silver glow, pale cyan, снежный бежевый",
      outfit: "luxury beige coat, мягкий шарф, premium winter fashion, elegant silhouettes",
      locations: "ледяной тронный зал, crystal palace, snowy mountains, frozen empire",
      stats: [
        { label: "Королевская энергия", value: 98 },
        { label: "Эстетика роскоши", value: 96 },
        { label: "Женственная сила", value: 95 },
      ],
      prompt:
        "Hyperrealistic snow empress portrait, realistic woman, luxury beige coat, pearl scarf, crystal palace, frozen throne, cinematic royal winter editorial, 9:16",
    },
  ];

  const HERO_SCREENS = [
    {
      step: "hero1",
      hero: "Ледяная Королева",
      quote: "Твоя энергия спокойна… но в ней скрыта сила.",
      question: "Что ты ищешь в своём образе?",
      options: [
        { text: "Силу", key: "strength", scores: { "ice-queen": 2, "snow-empress": 1 } },
        { text: "Свободу", key: "freedom", scores: { "aurora-soul": 3 } },
        { text: "Магию", key: "magic", scores: { "ice-oracle": 3 } },
        { text: "Себя", key: "self", scores: { "cyber-ice": 3 } },
      ],
    },
    {
      step: "hero2",
      hero: "Хранительница Сияния",
      quote: "Только северное сияние показывает истинную сущность.",
      question: "Что тебя притягивает?",
      options: [
        { text: "Сияние", key: "aurora", scores: { "aurora-soul": 3 } },
        { text: "Буря", key: "storm", scores: { "dark-blizzard": 3 } },
        { text: "Лёд", key: "ice", scores: { "ice-queen": 2, "snow-empress": 2 } },
        { text: "Туман", key: "mist", scores: { "ice-oracle": 2, "dark-blizzard": 1 } },
      ],
    },
    {
      step: "hero3",
      hero: "Кибер-Оракул",
      quote: "Будущее уже видит твой образ.",
      question: "Где ты чувствуешь себя сильнее?",
      options: [
        { text: "Ледяной дворец", key: "palace", scores: { "ice-queen": 2, "snow-empress": 2 } },
        { text: "Cyber-город", key: "cyber", scores: { "cyber-ice": 3 } },
        { text: "Снежная пустыня", key: "wasteland", scores: { "dark-blizzard": 3 } },
        { text: "Северный храм", key: "temple", scores: { "ice-oracle": 3 } },
      ],
    },
  ];

  const SCAN_LINES = [
    "Сканируем cinematic энергию…",
    "Считываем северную ауру…",
    "Открываем ледяной портал…",
  ];
  const SCAN_MS = 3000;
  const RITUAL_MS = 2000;
  const SHARE_URL = "https://zinusik1989-crypto.github.io/Website/#arctic-story-game";

  let root = null;
  let photoObjectUrl = null;
  let picks = { q1: null, q2: null, q3: null };
  let scores = {};
  let finalStyle = null;
  let gameStarted = false;
  let scanTimers = [];
  let ritualTimer = null;
  let scanSession = 0;
  let resultRecorded = false;

  const $ = (sel, ctx = root) => ctx?.querySelector(sel) ?? null;

  function picksSummary() {
    const keys = ["q1", "q2", "q3"];
    const parts = [];
    keys.forEach((key, i) => {
      const pickKey = picks[key];
      if (!pickKey) return;
      const screen = HERO_SCREENS[i];
      const opt = screen?.options?.find((o) => o.key === pickKey);
      parts.push(opt?.text || pickKey);
    });
    return parts.join(" → ");
  }

  function initScores() {
    scores = {};
    STYLES.forEach((s) => {
      scores[s.id] = 0;
    });
  }

  function clearTimers() {
    scanTimers.forEach((id) => clearTimeout(id));
    scanTimers = [];
    if (ritualTimer) {
      clearTimeout(ritualTimer);
      ritualTimer = null;
    }
  }

  function addScores(map) {
    Object.entries(map || {}).forEach(([id, pts]) => {
      scores[id] = (scores[id] || 0) + pts;
    });
  }

  function applyCombos() {
    const { q1, q2, q3 } = picks;
    if (q1 === "strength" && q2 === "ice" && q3 === "palace") scores["ice-queen"] += 8;
    if (q1 === "freedom" && q2 === "aurora") scores["aurora-soul"] += 8;
    if (q1 === "self" && q3 === "cyber") scores["cyber-ice"] += 8;
    if (q2 === "storm" && q3 === "wasteland") scores["dark-blizzard"] += 8;
    if (q1 === "magic" && q2 === "mist" && q3 === "temple") scores["ice-oracle"] += 8;
    if (q1 === "strength" && q3 === "palace" && q2 !== "ice") scores["snow-empress"] += 8;
  }

  function resolveWinner() {
    applyCombos();
    let max = -1;
    const leaders = [];
    STYLES.forEach((s) => {
      const v = scores[s.id] || 0;
      if (v > max) {
        max = v;
        leaders.length = 0;
        leaders.push(s.id);
      } else if (v === max) {
        leaders.push(s.id);
      }
    });
    if (leaders.length === 0) return STYLES[0];
    const id = leaders[Math.floor(Math.random() * leaders.length)];
    return STYLES.find((s) => s.id === id) || STYLES[0];
  }

  function scrollIntoGameView() {
    if (!root) return;
    const header = document.querySelector(".header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const top = root.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function showStep(name, opts = {}) {
    if (!root) return;
    root.querySelectorAll(".arctic-story-game__screen").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.step === name);
    });
    if (opts.scroll !== false && gameStarted) {
      requestAnimationFrame(scrollIntoGameView);
    }
  }

  function showToast(msg, ms = 3200) {
    const t = $("#asgToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => t.classList.remove("is-visible"), ms);
  }

  function spawnSnow(container, count = 28) {
    if (!container) return;
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const flake = document.createElement("span");
      const size = 2 + Math.random() * 4;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.animationDuration = `${4 + Math.random() * 7}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.opacity = String(0.3 + Math.random() * 0.55);
      container.appendChild(flake);
    }
  }

  function revokePhoto() {
    if (photoObjectUrl) {
      URL.revokeObjectURL(photoObjectUrl);
      photoObjectUrl = null;
    }
  }

  function openFilePicker() {
    $("#asgPhotoInput")?.click();
  }

  function setPhoto(file) {
    if (!file) return;
    const isImage =
      (file.type && file.type.startsWith("image/")) ||
      /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name || "");
    if (!isImage) {
      showToast("Выберите изображение (JPG, PNG, WebP)");
      return;
    }
    revokePhoto();
    photoObjectUrl = URL.createObjectURL(file);
    const preview = $("#asgPreview");
    const zone = $("#asgUploadZone");
    if (preview) {
      preview.src = photoObjectUrl;
      preview.alt = "Ваше фото для северного портала";
    }
    zone?.classList.add("has-photo");
    const btn = $("#asgActivatePortal");
    if (btn) btn.disabled = false;
  }

  function runScan() {
    clearTimers();
    const session = ++scanSession;
    showStep("scan", { scroll: true });
    const textEl = $("#asgScanText");
    const line = $(".arctic-story-game__scan-line");
    line?.classList.add("is-active");
    const perLine = SCAN_MS / SCAN_LINES.length;
    SCAN_LINES.forEach((lineText, i) => {
      scanTimers.push(
        setTimeout(() => {
          if (session !== scanSession) return;
          if (textEl) textEl.textContent = lineText;
        }, i * perLine)
      );
    });
    scanTimers.push(
      setTimeout(() => {
        if (session !== scanSession) return;
        line?.classList.remove("is-active");
        renderHeroScreen(0);
        showStep("hero1", { scroll: true });
      }, SCAN_MS)
    );
  }

  function renderHeroScreen(index) {
    const data = HERO_SCREENS[index];
    if (!data || !root) return;
    const screen = root.querySelector(`[data-step="${data.step}"]`);
    if (!screen) return;
    const badge = screen.querySelector(".arctic-story-game__hero-badge");
    const quote = screen.querySelector(".arctic-story-game__hero-quote");
    const question = screen.querySelector(".arctic-story-game__question");
    const opts = screen.querySelector(".arctic-story-game__options");
    if (badge) badge.textContent = data.hero;
    if (quote) quote.textContent = data.quote;
    if (question) question.textContent = data.question;
    if (!opts) return;
    opts.innerHTML = "";
    data.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "arctic-story-game__opt";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => onHeroAnswer(index, opt));
      opts.appendChild(btn);
    });
  }

  function onHeroAnswer(index, opt) {
    const key = `q${index + 1}`;
    picks[key] = opt.key;
    addScores(opt.scores);
    if (index < HERO_SCREENS.length - 1) {
      renderHeroScreen(index + 1);
      showStep(HERO_SCREENS[index + 1].step, { scroll: true });
    } else {
      runRitual();
    }
  }

  function runRitual() {
    clearTimers();
    const session = scanSession;
    showStep("ritual", { scroll: true });
    const ring = $(".arctic-story-game__ritual .arctic-story-game__scan-ring");
    ring?.classList.add("is-pulse");
    ritualTimer = setTimeout(() => {
      if (session !== scanSession) return;
      ring?.classList.remove("is-pulse");
      finalStyle = resolveWinner();
      renderResult(finalStyle);
      showStep("result", { scroll: true });
    }, RITUAL_MS);
  }

  function recordGameResult(style) {
    if (!style || !window.SiteGameResults || resultRecorded) return;
    resultRecorded = true;
    const summary = picksSummary();
    window.SiteGameResults.submit({
      game: "arctic-story-game",
      gameTitle: "Покажи лицо Северу",
      styleId: style.id,
      styleName: style.name,
      picks: { ...picks },
      picksSummary: summary,
      hasPhoto: Boolean(photoObjectUrl),
      photoUploaded: Boolean(photoObjectUrl),
      colors: style.colors,
      outfit: style.outfit,
      locations: style.locations,
      desc: style.desc,
      prompt: style.prompt,
      stats: style.stats,
    });
  }

  function renderResult(style) {
    if (!style) return;
    const hero = $(".arctic-story-game__result-hero");
    const title = $(".arctic-story-game__result-title");
    const desc = $(".arctic-story-game__result-desc");
    const colors = $(".arctic-story-game__result-colors");
    const outfit = $(".arctic-story-game__result-outfit");
    const locations = $(".arctic-story-game__result-locations");
    const prompt = $(".arctic-story-game__prompt");
    const statsEl = $(".arctic-story-game__stats");

    if (hero) hero.style.background = `linear-gradient(135deg, ${style.color}44, rgba(8,18,40,0.55))`;
    if (title) title.textContent = style.name;
    if (desc) desc.textContent = style.desc;
    if (colors) colors.textContent = style.colors;
    if (outfit) outfit.textContent = style.outfit;
    if (locations) locations.textContent = style.locations;
    if (prompt) prompt.textContent = style.prompt;

    if (statsEl) {
      statsEl.innerHTML = "";
      style.stats.forEach((stat) => {
        const row = document.createElement("div");
        row.className = "arctic-story-game__stat";
        row.innerHTML = `
          <p class="arctic-story-game__stat-name">${stat.label}</p>
          <p class="arctic-story-game__stat-val">${stat.value}%</p>
          <div class="arctic-story-game__stat-bar">
            <div class="arctic-story-game__stat-fill" style="--asg-pct: ${stat.value}%"></div>
          </div>`;
        statsEl.appendChild(row);
      });
      requestAnimationFrame(() => {
        statsEl.querySelectorAll(".arctic-story-game__stat-fill").forEach((el) => {
          el.style.width = el.style.getPropertyValue("--asg-pct") || "0%";
        });
      });
    }
    recordGameResult(style);
  }

  function buildShareText() {
    if (!finalStyle) return "";
    return `Мой стиль нейрофотосессии — ${finalStyle.name}. ${finalStyle.desc}`;
  }

  async function shareResult() {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Север выбирает твою судьбу | Зинаида",
          text,
          url: SHARE_URL,
        });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${SHARE_URL}`);
      showToast("Результат скопирован");
    } catch {
      showToast("Скопируйте текст результата вручную");
    }
  }

  function restart() {
    clearTimers();
    scanSession += 1;
    gameStarted = false;
    resultRecorded = false;
    revokePhoto();
    picks = { q1: null, q2: null, q3: null };
    finalStyle = null;
    initScores();
    const preview = $("#asgPreview");
    const zone = $("#asgUploadZone");
    const input = $("#asgPhotoInput");
    if (preview) preview.removeAttribute("src");
    zone?.classList.remove("has-photo");
    if (input) input.value = "";
    const btn = $("#asgActivatePortal");
    if (btn) btn.disabled = true;
    HERO_SCREENS.forEach((_, i) => renderHeroScreen(i));
    showStep("portal", { scroll: false });
  }

  function bindEvents() {
    root.querySelector(".arctic-story-game__btn-portal")?.addEventListener("click", () => {
      gameStarted = true;
      showStep("upload", { scroll: true });
    });

    const zone = $("#asgUploadZone");
    const input = $("#asgPhotoInput");

    zone?.addEventListener("click", () => openFilePicker());
    zone?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilePicker();
      }
    });
    zone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("is-dragover");
    });
    zone?.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone?.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("is-dragover");
      const file = e.dataTransfer?.files?.[0];
      if (file) setPhoto(file);
    });
    input?.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) setPhoto(file);
    });

    $("#asgActivatePortal")?.addEventListener("click", () => {
      if (!photoObjectUrl) {
        showToast("Сначала загрузите фото");
        return;
      }
      gameStarted = true;
      runScan();
    });

    $("#asgCreateAi")?.addEventListener("click", () => {
      alert("Следующий шаг — генерация AI-образа через Make/OpenAI.");
    });
    root.querySelector(".arctic-story-game__btn-share")?.addEventListener("click", shareResult);
    root.querySelector(".arctic-story-game__btn-restart")?.addEventListener("click", restart);
  }

  function ensureVisible() {
    const app = root?.querySelector(".arctic-story-game__app");
    if (app) {
      app.classList.add("is-visible");
      app.classList.remove("reveal");
    }
  }

  function handleHash() {
    if (!root) return;
    if (location.hash === "#arctic-story-game") {
      ensureVisible();
      requestAnimationFrame(scrollIntoGameView);
    }
  }

  function init() {
    root = document.querySelector(".arctic-story-game");
    if (!root) return;
    ensureVisible();
    initScores();
    spawnSnow($("#asgSnow"));
    HERO_SCREENS.forEach((_, i) => renderHeroScreen(i));
    bindEvents();
    showStep("portal", { scroll: false });
    handleHash();
    window.addEventListener("hashchange", handleHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
