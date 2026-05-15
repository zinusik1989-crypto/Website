/**
 * Колесо северной судьбы — квиз + колесо + результат (женский / мужской образ).
 */
(function () {
  const STYLES = [
    {
      id: "ice-queen",
      names: { f: "Ледяная Королева", m: "Ледяной Король" },
      color: "#0ea5e9",
      desc: {
        f: "Ты несёшь энергию ледяного спокойствия, силы и северной элегантности. Твоя эстетика — cinematic luxury, холодная уверенность и образ героини frozen-вселенной.",
        m: "Ты несёшь энергию ледяного спокойствия, силы и северной элегантности. Твоя эстетика — cinematic luxury, холодная уверенность и образ героя frozen-вселенной.",
      },
      colors: "серебряный хром, ледяной голубой, морозный белый, холодный жемчужный",
      outfit: {
        f: "длинное светлое пальто, luxury winter couture, серебристые детали, объёмные шарфы, мягкие текстуры, элегантный минимализм",
        m: "светлое пальто с чётким кроем, luxury winter menswear, серебристые акценты, объёмный шарф, структурные слои, элегантный минимализм",
      },
      locations:
        "ледяной дворец, замёрзшее озеро, арктический замок, снежные горы, северное сияние над ледником",
      stats: {
        f: [
          { label: "Северная энергия", value: 96 },
          { label: "Кинематографичность", value: 98 },
          { label: "Энергия величия", value: 94 },
        ],
        m: [
          { label: "Северная энергия", value: 96 },
          { label: "Кинематографичность", value: 98 },
          { label: "Энергия величия", value: 94 },
        ],
      },
    },
    {
      id: "aurora-soul",
      names: { f: "Душа Северного Сияния", m: "Душа Северного Сияния" },
      color: "#34d399",
      desc: {
        f: "Твоя энергия мягкая, сияющая и мистическая, как северное небо. Тебе подходит нежный cinematic-образ с атмосферой света, воздуха и эмоциональной глубины.",
        m: "Твоя энергия спокойная, сияющая и мистическая, как северное небо. Тебе подходит cinematic-образ с атмосферой света, воздуха и глубины.",
      },
      colors: "сияющий голубой, серебристый свет, нежный cyan, холодный лавандовый",
      outfit: {
        f: "светлые шерстяные пальто, струящиеся шарфы, воздушные ткани, мягкие layered-образы, светящиеся детали",
        m: "светлое шерстяное пальто, струящийся шарф, воздушные слои, мягкий layered-look, светящиеся акценты",
      },
      locations:
        "поле северного сияния, ледяное озеро в blue hour, снежная равнина, замёрзший лес, туманная арктика",
      stats: {
        f: [
          { label: "Энергия сияния", value: 97 },
          { label: "Эмоциональная глубина", value: 94 },
          { label: "Мягкая сила", value: 91 },
        ],
        m: [
          { label: "Энергия сияния", value: 97 },
          { label: "Эмоциональная глубина", value: 94 },
          { label: "Спокойная сила", value: 91 },
        ],
      },
    },
    {
      id: "cyber-ice",
      names: { f: "Кибер Лёд", m: "Кибер Лёд" },
      color: "#22d3ee",
      desc: {
        f: "Ты соединяешь эстетику будущего и холодную силу визуала. Твой стиль — futuristic winter fashion, chrome, neon и cinematic sci-fi.",
        m: "Ты соединяешь эстетику будущего и холодную силу визуала. Твой стиль — futuristic winter fashion, chrome, neon и cinematic sci-fi.",
      },
      colors: "chrome silver, neon cyan, тёмно-синий, графитовый",
      outfit: {
        f: "futuristic trench coat, reflective детали, кибер-шарфы, glowing seams, metallic textures, futuristic winter layers",
        m: "futuristic trench coat, reflective панели, кибер-шарф, glowing seams, металлические текстуры, futuristic winter layers",
      },
      locations:
        "ледяной cyber-город, арктическая лаборатория, futuristic observatory, frozen neon world, ледяной мегаполис",
      stats: {
        f: [
          { label: "Энергия будущего", value: 95 },
          { label: "Неоновая сила", value: 93 },
          { label: "Визуальный эффект", value: 99 },
        ],
        m: [
          { label: "Энергия будущего", value: 95 },
          { label: "Неоновая сила", value: 93 },
          { label: "Визуальный эффект", value: 99 },
        ],
      },
    },
    {
      id: "dark-blizzard",
      names: { f: "Тёмная Метель", m: "Тёмная Метель" },
      color: "#64748b",
      desc: {
        f: "В тебе есть драматичная глубина, тайна и энергия снежной бури. Тебе подходит образ героини cinematic snowstorm — сильной, загадочной и эмоциональной.",
        m: "В тебе есть драматичная глубина, тайна и энергия снежной бури. Тебе подходит образ героя cinematic snowstorm — сильного, загадочного и эмоционального.",
      },
      colors: "storm gray, графитовый, ледяной синий, холодный чёрный",
      outfit: {
        f: "тёмные шерстяные пальто, oversized scarves, layered winter style, textured fabrics, dramatic silhouettes",
        m: "тёмное шерстяное пальто, объёмный шарф, layered winter style, фактурные ткани, драматичный силуэт",
      },
      locations:
        "снежная буря, ледяной каньон, frozen wasteland, снежная пустыня, арктическая ночь",
      stats: {
        f: [
          { label: "Энергия тайны", value: 98 },
          { label: "Сила бури", value: 96 },
          { label: "Драматичность", value: 94 },
        ],
        m: [
          { label: "Энергия тайны", value: 98 },
          { label: "Сила бури", value: 96 },
          { label: "Драматичность", value: 94 },
        ],
      },
    },
    {
      id: "ice-oracle",
      names: { f: "Ледяной Оракул", m: "Ледяной Оракул" },
      color: "#a78bfa",
      desc: {
        f: "Ты похожа на героиню древней северной легенды. В твоём образе много интуиции, магии, тумана и ледяных символов.",
        m: "Ты похож на героя древней северной легенды. В твоём образе много интуиции, магии, тумана и ледяных символов.",
      },
      colors: "ледяной белый, mist blue, серебристый, холодный туман",
      outfit: {
        f: "layered winter robes, crystal details, меховые элементы, мистические текстуры, арктическая шаманская эстетика",
        m: "layered winter coat, crystal details, меховые акценты, мистические текстуры, арктическая шаманская эстетика",
      },
      locations:
        "ледяной храм, пещера во льдах, frozen ritual cave, северный алтарь, glacier temple",
      stats: {
        f: [
          { label: "Интуиция", value: 97 },
          { label: "Мистическая энергия", value: 96 },
          { label: "Магия льда", value: 95 },
        ],
        m: [
          { label: "Интуиция", value: 97 },
          { label: "Мистическая энергия", value: 96 },
          { label: "Магия льда", value: 95 },
        ],
      },
    },
    {
      id: "snow-empress",
      names: { f: "Снежная Императрица", m: "Снежный Император" },
      color: "#e8d4f0",
      desc: {
        f: "Твой образ — это роскошь, женственность и величие ледяной империи. Тебе подходит royal winter editorial эстетика и cinematic luxury mood.",
        m: "Твой образ — это роскошь, статус и величие ледяной империи. Тебе подходит royal winter editorial эстетика и cinematic luxury mood.",
      },
      colors: "жемчужный белый, silver glow, pale cyan, снежный бежевый",
      outfit: {
        f: "luxury beige coat, мягкие шарфы, premium winter fashion, elegant silhouettes, royal nordic style",
        m: "luxury beige coat, шерстяной шарф, premium winter menswear, чёткий силуэт, royal nordic style",
      },
      locations:
        "ледяной тронный зал, crystal palace, snowy mountains, frozen empire, северный дворец",
      stats: {
        f: [
          { label: "Королевская энергия", value: 98 },
          { label: "Эстетика роскоши", value: 96 },
          { label: "Женственная сила", value: 95 },
        ],
        m: [
          { label: "Королевская энергия", value: 98 },
          { label: "Эстетика роскоши", value: 96 },
          { label: "Харизматичная сила", value: 95 },
        ],
      },
    },
  ];

  const SEGMENT_COLORS = ["#0ea5e9", "#34d399", "#06b6d4", "#475569", "#a78bfa", "#f5e6c8"];

  function getQuiz(gender) {
    const live = gender === "m" ? "жил" : "жила";
    return [
      {
        q: "Какой холод тебе ближе?",
        options: [
          { text: "Лёд", scores: { "ice-queen": 2, "snow-empress": 1 } },
          { text: "Туман", scores: { "ice-oracle": 2, "dark-blizzard": 2 } },
          { text: "Снег", scores: { "dark-blizzard": 2, "snow-empress": 1 } },
          { text: "Северное сияние", scores: { "aurora-soul": 3 } },
        ],
      },
      {
        q: "Что скрывает твоя энергия?",
        options: [
          { text: "Тайну", scores: { "dark-blizzard": 2, "ice-oracle": 2 } },
          { text: "Силу", scores: { "ice-queen": 2, "cyber-ice": 1 } },
          { text: "Мягкость", scores: { "aurora-soul": 3 } },
          { text: "Хаос", scores: { "cyber-ice": 3 } },
        ],
      },
      {
        q: `Где бы ты ${live} в ледяной вселенной?`,
        options: [
          { text: "Ледяной дворец", scores: { "ice-queen": 2, "snow-empress": 2 } },
          { text: "Северный храм", scores: { "ice-oracle": 3 } },
          { text: "Кибер-ледник", scores: { "cyber-ice": 3 } },
          { text: "Снежная пустыня", scores: { "dark-blizzard": 3 } },
        ],
      },
      {
        q: "Что ты хочешь почувствовать в нейрофотосессии?",
        options: [
          { text: "Величие", scores: { "ice-queen": 2, "snow-empress": 2 } },
          { text: "Магию", scores: { "ice-oracle": 3 } },
          { text: "Свободу", scores: { "aurora-soul": 2, "cyber-ice": 1 } },
          { text: "Кинематографичность", scores: { "cyber-ice": 2, "dark-blizzard": 2 } },
        ],
      },
    ];
  }

  const SPIN_MIN_MS = 4000;
  const SPIN_MAX_MS = 6000;
  const SCAN_MS = 2000;
  const EXTRA_TURNS = 5;
  const QUIZ_WEIGHT = 0.6;
  const SHARE_URL = "https://zinusik1989-crypto.github.io/Website/#arctic-wheel";

  let root = null;
  let wheel = null;
  let gender = "f";
  let quizIndex = 0;
  let quizScores = {};
  let answerHistory = [];
  let finalStyle = null;
  let spinning = false;

  const $ = (sel, ctx = root) => ctx?.querySelector(sel) ?? null;

  function styleField(style, field) {
    const v = style[field];
    if (typeof v === "string") return v;
    if (v && typeof v === "object") return v[gender] || v.f || "";
    return "";
  }

  function getStyleName(style) {
    return style.names[gender] || style.names.f;
  }

  function getStyleStats(style) {
    return style.stats[gender] || style.stats.f;
  }

  function scrollIntoGameView() {
    if (!root) return;
    const header = document.querySelector(".header");
    const headerH = header ? header.getBoundingClientRect().height : 64;
    const top = root.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  let wheelStarted = false;

  function showStep(name, opts = {}) {
    if (!root) return;
    root.querySelectorAll(".arctic-wheel-section__screen").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.step === name);
    });
    if (opts.scroll !== false && wheelStarted) {
      requestAnimationFrame(scrollIntoGameView);
    }
  }

  function showToast(msg, ms = 3200) {
    const t = $("#arcticWheelToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => t.classList.remove("is-visible"), ms);
  }

  function resetQuizScores() {
    quizScores = {};
    answerHistory = [];
    STYLES.forEach((s) => {
      quizScores[s.id] = 0;
    });
  }

  function addScores(scores) {
    Object.entries(scores).forEach(([id, pts]) => {
      quizScores[id] = (quizScores[id] || 0) + pts;
    });
  }

  function subtractScores(scores) {
    if (!scores) return;
    Object.entries(scores).forEach(([id, pts]) => {
      quizScores[id] = Math.max(0, (quizScores[id] || 0) - pts);
    });
  }

  function getQuizWinnerId() {
    let best = STYLES[0].id;
    let max = -1;
    STYLES.forEach((s) => {
      const v = quizScores[s.id] || 0;
      if (v > max) {
        max = v;
        best = s.id;
      }
    });
    return best;
  }

  function resolveFinalStyle(wheelIndex) {
    const quizId = getQuizWinnerId();
    const wheelId = STYLES[wheelIndex].id;
    const useQuiz = Math.random() < QUIZ_WEIGHT;
    const id = useQuiz ? quizId : wheelId;
    return STYLES.find((s) => s.id === id) || STYLES[0];
  }

  function styleIndex(style) {
    return STYLES.findIndex((s) => s.id === style.id);
  }

  function buildWheelGradient() {
    const seg = 360 / STYLES.length;
    const parts = STYLES.map((s, i) => {
      const c = SEGMENT_COLORS[i] || s.color;
      return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
    });
    return `conic-gradient(from -90deg, ${parts.join(", ")})`;
  }

  function buildLabels() {
    const ring = $("#arcticWheelLabels");
    if (!ring) return;
    ring.innerHTML = "";
    const seg = 360 / STYLES.length;
    STYLES.forEach((style, i) => {
      const el = document.createElement("span");
      el.className = "arctic-wheel-section__label";
      let label = getStyleName(style);
      if (label.length > 16) {
        const parts = label.split(" ");
        label = parts.length > 1 ? `${parts[0]}\n${parts.slice(1).join(" ")}` : label;
      }
      el.textContent = label;
      const radius =
        getComputedStyle(root).getPropertyValue("--aw-label-radius").trim() || "-118%";
      const angle = -90 + i * seg + seg / 2;
      el.style.transform = `rotate(${angle}deg) translateY(${radius}) rotate(${-angle}deg)`;
      ring.appendChild(el);
    });
  }

  function spawnSnow(container, count = 32) {
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

  function updateQuizBar() {
    const fill = $(".arctic-wheel-section__quiz-bar-fill");
    const label = $(".arctic-wheel-section__quiz-progress");
    const total = getQuiz(gender).length;
    const pct = Math.round((quizIndex / total) * 100);
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `Вопрос ${Math.min(quizIndex + 1, total)} из ${total}`;
  }

  function renderQuiz() {
    const quiz = getQuiz(gender);
    const q = quiz[quizIndex];
    const question = $(".arctic-wheel-section__quiz-question");
    const opts = $(".arctic-wheel-section__quiz-options");
    const back = $(".arctic-wheel-section__btn-quiz-back");
    if (question) question.textContent = q.q;
    if (back) back.hidden = quizIndex === 0;
    updateQuizBar();
    if (!opts) return;
    opts.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "arctic-wheel-section__quiz-opt";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => {
        answerHistory.push({ ...opt.scores });
        addScores(opt.scores);
        quizIndex += 1;
        if (quizIndex >= quiz.length) {
          buildLabels();
          showStep("wheel");
        } else {
          renderQuiz();
        }
      });
      opts.appendChild(btn);
    });
  }

  function rotationForIndex(index) {
    const seg = 360 / STYLES.length;
    return 360 * EXTRA_TURNS + (360 - index * seg - seg / 2);
  }

  function runScanThenResult() {
    showStep("scan");
    const scanLine = $(".arctic-wheel-section__scan-line");
    scanLine?.classList.add("is-active");
    setTimeout(() => {
      scanLine?.classList.remove("is-active");
      renderResult(finalStyle);
      showStep("result");
    }, SCAN_MS);
  }

  function renderResult(style) {
    if (!style) return;
    const hero = $(".arctic-wheel-section__result-hero");
    const kicker = $(".arctic-wheel-section__result-kicker");
    const title = $(".arctic-wheel-section__result-title");
    const desc = $(".arctic-wheel-section__result-desc");
    const colors = $(".arctic-wheel-section__result-colors");
    const outfit = $(".arctic-wheel-section__result-outfit");
    const locations = $(".arctic-wheel-section__result-locations");
    const statsEl = $(".arctic-wheel-section__result-stats");

    if (kicker) {
      kicker.textContent =
        gender === "m" ? "Твой северный мужской стиль" : "Твой северный женский стиль";
    }
    if (hero) hero.style.background = `linear-gradient(135deg, ${style.color}44, rgba(8,18,40,0.55))`;
    if (title) title.textContent = getStyleName(style);
    if (desc) desc.textContent = styleField(style, "desc");
    if (colors) colors.textContent = style.colors;
    if (outfit) outfit.textContent = styleField(style, "outfit");
    if (locations) locations.textContent = style.locations;

    if (statsEl) {
      statsEl.innerHTML = "";
      getStyleStats(style).forEach((stat) => {
        const row = document.createElement("div");
        row.className = "arctic-wheel-section__stat";
        row.innerHTML = `
          <p class="arctic-wheel-section__stat-name">${stat.label}</p>
          <p class="arctic-wheel-section__stat-val">${stat.value}%</p>
          <div class="arctic-wheel-section__stat-bar">
            <div class="arctic-wheel-section__stat-fill" style="--aw-pct: ${stat.value}%"></div>
          </div>`;
        statsEl.appendChild(row);
      });
      requestAnimationFrame(() => {
        statsEl.querySelectorAll(".arctic-wheel-section__stat-fill").forEach((el) => {
          el.style.width = el.style.getPropertyValue("--aw-pct") || "0%";
        });
      });
    }
  }

  function spinWheel() {
    if (spinning || !wheel) return;
    spinning = true;
    const btn = $("#arcticWheelSpin");
    if (btn) btn.disabled = true;

    const wheelRandomIndex = Math.floor(Math.random() * STYLES.length);
    finalStyle = resolveFinalStyle(wheelRandomIndex);
    const landIndex = styleIndex(finalStyle);
    const targetDeg = rotationForIndex(landIndex);
    const duration = SPIN_MIN_MS + Math.random() * (SPIN_MAX_MS - SPIN_MIN_MS);

    wheel.classList.add("is-spinning");
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wheel.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0.85, 0.18, 1)`;
        wheel.style.transform = `rotate(${targetDeg}deg)`;
      });
    });

    const onEnd = (e) => {
      if (e.propertyName !== "transform") return;
      wheel.removeEventListener("transitionend", onEnd);
      wheel.classList.remove("is-spinning");
      spinning = false;
      if (btn) btn.disabled = false;
      runScanThenResult();
    };
    wheel.addEventListener("transitionend", onEnd);
  }

  function buildShareText() {
    if (!finalStyle) return "";
    return `Мой стиль нейрофотосессии — ${getStyleName(finalStyle)}. ${styleField(finalStyle, "desc")}`;
  }

  async function shareResult() {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Колесо северной судьбы | Зинаида",
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

  function setGender(g) {
    gender = g === "m" ? "m" : "f";
    root.querySelectorAll(".arctic-wheel-section__gender-opt").forEach((btn) => {
      const on = btn.dataset.gender === gender;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    buildLabels();
  }

  function restart() {
    if (spinning) return;
    wheelStarted = false;
    quizIndex = 0;
    finalStyle = null;
    resetQuizScores();
    if (wheel) {
      wheel.style.transition = "none";
      wheel.style.transform = "rotate(0deg)";
    }
    showStep("hero", { scroll: false });
  }

  function startRitual() {
    quizIndex = 0;
    resetQuizScores();
    renderQuiz();
    showStep("quiz");
  }

  function bindEvents() {
    root.querySelectorAll(".arctic-wheel-section__gender-opt").forEach((btn) => {
      btn.addEventListener("click", () => setGender(btn.dataset.gender));
    });
    $(".arctic-wheel-section__btn-start")?.addEventListener("click", () => {
      wheelStarted = true;
      startRitual();
    });
    $(".arctic-wheel-section__btn-quiz-back")?.addEventListener("click", () => {
      if (quizIndex > 0) {
        quizIndex -= 1;
        const last = answerHistory.pop();
        subtractScores(last);
        renderQuiz();
      }
    });
    $("#arcticWheelSpin")?.addEventListener("click", spinWheel);
    $("#arcticWheelCreate")?.addEventListener("click", () => {
      alert("Следующий шаг — генерация AI-образа через Make/OpenAI.");
    });
    $(".arctic-wheel-section__btn-share")?.addEventListener("click", shareResult);
    $(".arctic-wheel-section__btn-restart")?.addEventListener("click", restart);
  }

  function init() {
    root = document.querySelector(".arctic-wheel-section");
    if (!root) return;
    const app = root.querySelector(".arctic-wheel-section__app");
    app?.classList.add("is-visible");
    app?.classList.remove("reveal");
    wheel = $("#arcticWheelDisk");
    if (wheel) wheel.style.background = buildWheelGradient();
    setGender("f");
    spawnSnow($("#arcticWheelSnow"));
    resetQuizScores();
    bindEvents();
    showStep("hero", { scroll: false });

    let resizeTid;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTid);
      resizeTid = setTimeout(buildLabels, 180);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
