/**
 * Колесо северного образа — изолированный модуль (GitHub Pages, без backend).
 */
(function () {
  const STYLES = [
    {
      id: "arctic-queen",
      name: "Arctic Queen",
      color: "#0ea5e9",
      desc: "Ты несёшь энергию ледяного спокойствия, силы и королевской эстетики.",
      stats: [
        { label: "Frozen Energy", value: 96 },
        { label: "Cinematic Aura", value: 98 },
        { label: "Northern Presence", value: 92 },
      ],
    },
    {
      id: "aurora-soul",
      name: "Aurora Soul",
      color: "#34d399",
      desc: "Твоя энергия мягкая, сияющая и мистическая, как северное небо.",
      stats: [
        { label: "Aurora Light", value: 97 },
        { label: "Dream Energy", value: 94 },
        { label: "Soft Power", value: 91 },
      ],
    },
    {
      id: "cyber-ice",
      name: "Cyber Ice",
      color: "#22d3ee",
      desc: "Ты соединяешь холодную эстетику будущего и сильный визуальный характер.",
      stats: [
        { label: "Future Energy", value: 95 },
        { label: "Neon Power", value: 93 },
        { label: "Visual Impact", value: 99 },
      ],
    },
    {
      id: "dark-blizzard",
      name: "Dark Blizzard",
      color: "#64748b",
      desc: "В тебе есть драматичная глубина, тайна и энергия снежной бури.",
      stats: [
        { label: "Mystery", value: 98 },
        { label: "Storm Energy", value: 96 },
        { label: "Drama Mood", value: 94 },
      ],
    },
    {
      id: "frozen-oracle",
      name: "Frozen Oracle",
      color: "#a78bfa",
      desc: "Ты похожа на героиню древней северной легенды с интуицией и магией.",
      stats: [
        { label: "Intuition", value: 97 },
        { label: "Mystic Aura", value: 96 },
        { label: "Ice Magic", value: 95 },
      ],
    },
    {
      id: "snow-empress",
      name: "Snow Empress",
      color: "#fce7f3",
      desc: "Твой образ — это роскошь, женственность и величие ледяной империи.",
      stats: [
        { label: "Royal Energy", value: 98 },
        { label: "Luxury Mood", value: 96 },
        { label: "Elegance", value: 95 },
      ],
    },
  ];

  const SEGMENT_COLORS = [
    "#0ea5e9",
    "#34d399",
    "#06b6d4",
    "#475569",
    "#a78bfa",
    "#e8d4f0",
  ];

  const SPIN_MIN_MS = 4000;
  const SPIN_MAX_MS = 6000;
  const EXTRA_TURNS = 5;

  let root = null;
  let wheel = null;
  let spinning = false;

  function $(sel, ctx = root) {
    return ctx?.querySelector(sel) ?? null;
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
    const ring = wheel?.querySelector("#arcticWheelLabels") || $("#arcticWheelLabels");
    if (!ring) return;
    ring.innerHTML = "";
    const seg = 360 / STYLES.length;
    STYLES.forEach((style, i) => {
      const el = document.createElement("span");
      el.className = "arctic-wheel-section__label";
      el.textContent = style.name;
      const angle = -90 + i * seg + seg / 2;
      el.style.transform = `rotate(${angle}deg) translateY(-118%) rotate(${-angle}deg)`;
      ring.appendChild(el);
    });
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

  function pickRandomIndex() {
    return Math.floor(Math.random() * STYLES.length);
  }

  function rotationForIndex(index) {
    const seg = 360 / STYLES.length;
    return 360 * EXTRA_TURNS + (360 - index * seg - seg / 2);
  }

  function renderResult(style) {
    const card = $("#arcticWheelResult");
    const hero = $(".arctic-wheel-section__result-hero");
    const title = $(".arctic-wheel-section__result-title");
    const desc = $(".arctic-wheel-section__result-desc");
    const statsEl = $(".arctic-wheel-section__stats");
    if (!card || !style) return;

    if (hero) {
      hero.style.background = `linear-gradient(135deg, ${style.color}33, rgba(8,18,40,0.5))`;
    }
    if (title) title.textContent = style.name;
    if (desc) desc.textContent = style.desc;

    if (statsEl) {
      statsEl.innerHTML = "";
      style.stats.forEach((stat) => {
        const row = document.createElement("div");
        row.className = "arctic-wheel-section__stat";
        row.innerHTML = `
          <p class="arctic-wheel-section__stat-name">${stat.label}</p>
          <p class="arctic-wheel-section__stat-val">${stat.value}%</p>
          <div class="arctic-wheel-section__stat-bar">
            <div class="arctic-wheel-section__stat-fill" style="--aw-stat: ${stat.value}%"></div>
          </div>`;
        statsEl.appendChild(row);
      });
    }

    card.hidden = false;
    card.classList.remove("is-visible");
    statsEl?.querySelectorAll(".arctic-wheel-section__stat-fill").forEach((el) => {
      el.style.width = "0%";
    });
    requestAnimationFrame(() => {
      card.classList.add("is-visible");
      statsEl?.querySelectorAll(".arctic-wheel-section__stat-fill").forEach((el) => {
        el.style.width = el.style.getPropertyValue("--aw-stat") || "0%";
      });
    });
  }

  function spin() {
    if (spinning || !wheel) return;
    spinning = true;
    const btn = $("#arcticWheelSpin");
    const result = $("#arcticWheelResult");
    if (btn) btn.disabled = true;
    if (result) {
      result.classList.remove("is-visible");
      result.hidden = true;
    }

    const index = pickRandomIndex();
    const style = STYLES[index];
    const targetDeg = rotationForIndex(index);
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

    const onEnd = () => {
      wheel.removeEventListener("transitionend", onEnd);
      wheel.classList.remove("is-spinning");
      spinning = false;
      if (btn) btn.disabled = false;
      renderResult(style);
    };
    wheel.addEventListener("transitionend", onEnd);
  }

  function bindEvents() {
    $("#arcticWheelSpin")?.addEventListener("click", spin);
    $("#arcticWheelCreate")?.addEventListener("click", () => {
      alert("Здесь будет генерация AI-образа через Make/OpenAI");
    });
  }

  function init() {
    root = document.querySelector(".arctic-wheel-section");
    if (!root) return;
    wheel = $("#arcticWheelDisk");
    if (wheel) wheel.style.background = buildWheelGradient();
    buildLabels();
    spawnSnow($("#arcticWheelSnow"));
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
