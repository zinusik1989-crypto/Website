/**
 * Arctic AI Identity — креативный квиз «Кто вы на Севере?» (без генерации фото).
 */
(function () {
  const STYLES = [
    {
      id: "arctic-queen",
      name: "Arctic Queen",
      archetypeRu: "Ледяная королева",
      emoji: "👑",
      short: "Ледяная королева с сиянием",
      desc: "Холодный свет, корона из инея, властный взгляд.",
      tagline: "Власть севера в каждом кадре.",
      revealHook: "Вас не спорят — вас запоминают. Холодный свет, который режет ленту.",
      palette: "linear-gradient(135deg, #0ea5e9 0%, #67e8f9 45%, #e0f2fe 100%)",
    },
    {
      id: "nordic-goddess",
      name: "Nordic Goddess",
      archetypeRu: "Богиня полярного света",
      emoji: "✨",
      short: "Скандинавская богиня света",
      desc: "Мягкий золотой час, тёплый мех, божественное спокойствие.",
      tagline: "Божественный свет полярного неба.",
      revealHook: "К вам тянутся без объяснений. Тепло, которое выглядит дороже слов.",
      palette: "linear-gradient(135deg, #f5e6c8 0%, #c4b5fd 50%, #38bdf8 100%)",
    },
    {
      id: "cyber-ice",
      name: "Cyber Ice",
      archetypeRu: "Повелитель неонового льда",
      emoji: "⚡",
      short: "Неоновый лёд будущего",
      desc: "Кибер-север: неон, глитч, холодный металл.",
      tagline: "Будущее уже замёрзло в красоте.",
      revealHook: "Вы не из прошлого — вы из завтра. Лента замирает на вашем кадре.",
      palette: "linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #22d3ee 100%)",
    },
    {
      id: "dark-blizzard",
      name: "Dark Blizzard",
      archetypeRu: "Хозяин тёмной метели",
      emoji: "🌑",
      short: "Тёмная метель и драма",
      desc: "Контраст, тени, снежная буря, кинематограф.",
      tagline: "Драма метели в одном кадре.",
      revealHook: "В вас есть тень, от которой невозможно отвести взгляд. Кино, а не селфи.",
      palette: "linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%)",
    },
    {
      id: "frozen-royalty",
      name: "Frozen Royalty",
      archetypeRu: "Королева вечной зимы",
      emoji: "💎",
      short: "Замёрзшая королевская роскошь",
      desc: "Бархат, жемчуг, ледяные детали haute couture.",
      tagline: "Королевская эстетика вечной зимы.",
      revealHook: "Вас считывают как premium до первой строчки bio. Жемчуг, лёд, без компромиссов.",
      palette: "linear-gradient(135deg, #fce7f3 0%, #e2e8f0 45%, #bae6fd 100%)",
    },
    {
      id: "aurora-soul",
      name: "Aurora Soul",
      archetypeRu: "Душа северного сияния",
      emoji: "🌌",
      short: "Душа северного сияния",
      desc: "Живое сияние, мятный и бирюзовый свет.",
      tagline: "Ваша душа — это северное сияние.",
      revealHook: "Вы — тот самый кадр, который сохраняют. Сияние, которое не повторить.",
      palette: "linear-gradient(135deg, #34d399 0%, #22d3ee 50%, #818cf8 100%)",
    },
  ];

  const QUIZ = [
    {
      tag: "Интрига",
      q: "Что вы хотите, чтобы люди почувствовали за 3 секунды в ленте?",
      options: [
        { emoji: "❄️", text: "Меня нельзя игнорировать", sub: "Власть и холод", scores: { "arctic-queen": 3, "frozen-royalty": 1 } },
        { emoji: "✨", text: "Тепло и доверие", sub: "«Хочу к ней/нему»", scores: { "nordic-goddess": 3, "aurora-soul": 1 } },
        { emoji: "⚡", text: "Шок: это будущее", sub: "Не как у всех", scores: { "cyber-ice": 3 } },
        { emoji: "🌑", text: "Напряжение и тайна", sub: "Кино, не селфи", scores: { "dark-blizzard": 3 } },
      ],
    },
    {
      tag: "Правда",
      q: "Какая фраза про вас ближе всего?",
      options: [
        { emoji: "👑", text: "Я задаю правила", sub: "Не прошу — выбирают", scores: { "arctic-queen": 2, "frozen-royalty": 2 } },
        { emoji: "🕊️", text: "Меня любят за спокойствие", sub: "Мягкая сила", scores: { "nordic-goddess": 3 } },
        { emoji: "🔮", text: "Я чувствую тренд раньше других", sub: "На шаг впереди", scores: { "cyber-ice": 2, "aurora-soul": 2 } },
        { emoji: "🖤", text: "Мне нравится быть загадкой", sub: "Меньше слов — больше взгляда", scores: { "dark-blizzard": 3 } },
      ],
    },
    {
      tag: "Образ",
      q: "Ваш идеальный полярный вечер — это…",
      options: [
        { emoji: "🏔️", text: "Трон изо льда и сияние", sub: "Editorial, не пляж", scores: { "arctic-queen": 3, "frozen-royalty": 1 } },
        { emoji: "🧣", text: "Мех, свечи, золотой час", sub: "Уют, который выглядит дорого", scores: { "nordic-goddess": 3 } },
        { emoji: "🌃", text: "Неон, метель, город", sub: "Blade Runner на Севере", scores: { "cyber-ice": 3, "dark-blizzard": 1 } },
        { emoji: "💫", text: "Сияние над тишиной", sub: "Магия без крика", scores: { "aurora-soul": 3 } },
      ],
    },
    {
      tag: "Цель",
      q: "Зачем вам сильный визуал прямо сейчас?",
      options: [
        { emoji: "📈", text: "Продать экспертность дороже", sub: "Цена = восприятие", scores: { "frozen-royalty": 2, "arctic-queen": 2 } },
        { emoji: "💬", text: "Чтобы писали в директ", sub: "Вовлечение и доверие", scores: { "nordic-goddess": 2, "aurora-soul": 2 } },
        { emoji: "🔥", text: "Вырваться из «как у всех»", sub: "Запомниться", scores: { "cyber-ice": 2, "dark-blizzard": 2 } },
        { emoji: "🎯", text: "Один кадр — и вы «тот самый»", sub: "Личный бренд", scores: { "aurora-soul": 2, "arctic-queen": 1, "frozen-royalty": 1 } },
      ],
    },
    {
      tag: "Финал",
      q: "Честно: что вас бесит в обычных фото?",
      options: [
        { emoji: "😶", text: "«Нормально» = никто не заметил", sub: "Хочу wow", scores: { "cyber-ice": 2, "aurora-soul": 2, "arctic-queen": 1 } },
        { emoji: "📱", text: "Как у всех в stories", sub: "Нужен свой код", scores: { "dark-blizzard": 2, "frozen-royalty": 2 } },
        { emoji: "🌫️", text: "Нет эмоции и света", sub: "Плоско и дёшево", scores: { "nordic-goddess": 2, "aurora-soul": 1 } },
        { emoji: "🪞", text: "Не чувствую себя в кадре", sub: "Хочу узнать свой archetype", scores: { "arctic-queen": 1, "nordic-goddess": 1, "frozen-royalty": 1, "dark-blizzard": 1, "cyber-ice": 1, "aurora-soul": 1 } },
      ],
    },
  ];

  const DECODE_LINES = [
    "Считываем ваш полярный код…",
    "Сверяем с 6 archetype Севера…",
    "Находим свет, который «ваш»…",
    "Готовим формулировку, от которой щёлкает…",
  ];

  const SHARE_URL = "https://zinusik1989-crypto.github.io/Website/#arctic-identity";

  let root = null;
  let quizIndex = 0;
  let quizScores = {};
  let answers = [];
  let resultStyle = null;
  let matchPercent = 0;

  const $ = (sel, ctx = root) => ctx && ctx.querySelector(sel);

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

  function resetQuiz() {
    quizIndex = 0;
    answers = [];
    resultStyle = null;
    quizScores = {};
    STYLES.forEach((s) => {
      quizScores[s.id] = 0;
    });
    updateQuizBar();
  }

  function updateQuizBar() {
    const bar = $(".ai-id__quiz-bar-fill");
    const label = $(".ai-id__quiz-bar-label");
    const pct = Math.round((quizIndex / QUIZ.length) * 100);
    if (bar) bar.style.width = `${pct}%`;
    if (label) label.textContent = quizIndex === 0 ? "Старт" : `${quizIndex} / ${QUIZ.length}`;
  }

  function addScores(scores) {
    Object.entries(scores).forEach(([id, pts]) => {
      quizScores[id] = (quizScores[id] || 0) + pts;
    });
  }

  function computeResult() {
    let best = STYLES[0].id;
    let max = -1;
    let second = 0;
    STYLES.forEach((s) => {
      const v = quizScores[s.id] || 0;
      if (v > max) {
        second = max;
        max = v;
        best = s.id;
      } else if (v > second) {
        second = v;
      }
    });
    const total = Object.values(quizScores).reduce((a, b) => a + b, 0) || 1;
    const dominance = max / total;
    matchPercent = Math.min(97, Math.max(84, Math.round(82 + dominance * 18 + (max - second) * 2)));
    return STYLES.find((s) => s.id === best);
  }

  function renderQuiz() {
    const q = QUIZ[quizIndex];
    const tag = $(".ai-id__quiz-tag");
    const progress = $(".ai-id__quiz-progress");
    const question = $(".ai-id__quiz-question");
    const opts = $(".ai-id__quiz-options");
    const back = $(".ai-id__btn-quiz-back");
    if (tag) tag.textContent = q.tag;
    if (progress) progress.textContent = `Вопрос ${quizIndex + 1} из ${QUIZ.length}`;
    if (question) question.textContent = q.q;
    if (back) back.hidden = quizIndex === 0;
    updateQuizBar();
    if (!opts) return;
    opts.innerHTML = "";
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-id__quiz-opt";
      btn.innerHTML = `
        <span class="ai-id__quiz-opt-emoji" aria-hidden="true">${opt.emoji}</span>
        <span class="ai-id__quiz-opt-text">
          <span class="ai-id__quiz-opt-main">${opt.text}</span>
          <span class="ai-id__quiz-opt-sub">${opt.sub}</span>
        </span>`;
      btn.addEventListener("click", () => {
        addScores(opt.scores);
        answers.push(opt.text);
        quizIndex += 1;
        if (quizIndex >= QUIZ.length) runDecode();
        else renderQuiz();
      });
      opts.appendChild(btn);
    });
  }

  function runDecode() {
    resultStyle = computeResult();
    showStep("decode");
    const line = $(".ai-id__decode-line");
    const bar = $(".ai-id__decode-bar-fill");
    let i = 0;
    const start = performance.now();
    const duration = 3200;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (bar) bar.style.width = `${Math.round(t * 100)}%`;
      const idx = Math.min(DECODE_LINES.length - 1, Math.floor(t * DECODE_LINES.length));
      if (line && idx !== i) {
        i = idx;
        line.textContent = DECODE_LINES[i];
        line.classList.remove("is-pulse");
        void line.offsetWidth;
        line.classList.add("is-pulse");
      }
      if (t < 1) requestAnimationFrame(tick);
      else showReveal(resultStyle);
    };
    if (line) line.textContent = DECODE_LINES[0];
    if (bar) bar.style.width = "0%";
    requestAnimationFrame(tick);
  }

  function showReveal(style) {
    if (!style) return;
    resultStyle = style;
    const hero = $(".ai-id__reveal-hero");
    const emoji = $(".ai-id__reveal-emoji");
    const archetype = $(".ai-id__reveal-archetype");
    const name = $(".ai-id__reveal-name");
    const hook = $(".ai-id__reveal-hook");
    const desc = $(".ai-id__reveal-desc");
    const tag = $(".ai-id__reveal-tagline");
    const match = $(".ai-id__reveal-match");
    const code = $(".ai-id__reveal-code");

    if (hero) hero.style.background = style.palette;
    if (emoji) emoji.textContent = style.emoji;
    if (archetype) archetype.textContent = style.archetypeRu;
    if (name) name.textContent = style.name;
    if (hook) hook.textContent = style.revealHook;
    if (desc) desc.textContent = style.desc;
    if (tag) tag.textContent = `«${style.tagline}»`;
    if (match) match.textContent = `${matchPercent}%`;
    if (code) code.textContent = style.id.replace(/-/g, " · ").toUpperCase();

    showStep("reveal");
    showToast("Ваш северный archetype раскрыт");
  }

  function buildShareText() {
    if (!resultStyle) return "";
    return `Мой северный archetype — ${resultStyle.archetypeRu} (${resultStyle.name}). Совпадение ${matchPercent}%. ${resultStyle.revealHook}`;
  }

  async function shareResult() {
    const text = buildShareText();
    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(`${text}\n${SHARE_URL}`);
        showToast("Текст скопирован — вставьте в stories");
      } catch {
        showToast("Скопируйте результат вручную");
      }
      return;
    }
    try {
      await navigator.share({
        title: "Кто я на Севере? | Зинаида",
        text,
        url: SHARE_URL,
      });
    } catch (e) {
      if (e.name !== "AbortError") showToast("Не удалось поделиться");
    }
  }

  function restart() {
    resetQuiz();
    renderQuiz();
    showStep("quiz");
  }

  function bindQuiz() {
    $(".ai-id__btn-intro-start")?.addEventListener("click", () => {
      resetQuiz();
      renderQuiz();
      showStep("quiz");
    });
    $(".ai-id__btn-quiz-back")?.addEventListener("click", () => {
      if (quizIndex > 0) {
        quizIndex -= 1;
        answers.pop();
        renderQuiz();
      }
    });
    $(".ai-id__btn-retry")?.addEventListener("click", restart);
    $(".ai-id__btn-share")?.addEventListener("click", shareResult);
  }

  function spawnSnow(container, count = 24) {
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

  function init() {
    root = document.getElementById("arcticIdentity");
    if (!root) return;
    resetQuiz();
    spawnSnow($(".ai-id__snow"));
    bindQuiz();
    showStep("intro");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
