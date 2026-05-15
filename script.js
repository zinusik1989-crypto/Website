/* Luxury landing micro-interactions:
   - reveal on scroll (IntersectionObserver)
   - active nav link highlight (scroll spy; дубли ссылок в шапке и на первом экране синхронизируются)
 */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** id из href вида #contacts или ./index.html#contacts */
function hashIdFromHref(href) {
  if (!href) return null;
  const i = href.indexOf("#");
  if (i === -1) return null;
  const raw = href.slice(i + 1).trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function setupReveal() {
  const nodes = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    {
      threshold: [0, 0.06, 0.12, 0.18],
      rootMargin: "0px 0px 18% 0px",
    }
  );

  nodes.forEach((n) => io.observe(n));
}

function setupScrollSpy() {
  const links = $$(".nav__link");
  if (!links.length || !("IntersectionObserver" in window)) return;

  /** id секции → все ссылки с этим якорем (шапка + полоса на герое) */
  const idToAnchors = new Map();
  links.forEach((a) => {
    const id = hashIdFromHref(a.getAttribute("href") || "");
    if (!id) return;
    if (!document.getElementById(id)) return;
    if (!idToAnchors.has(id)) idToAnchors.set(id, []);
    idToAnchors.get(id).push(a);
  });

  if (!idToAnchors.size) return;

  const sectionToId = new Map();
  idToAnchors.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) sectionToId.set(section, id);
  });

  let currentId = null;
  const setCurrent = (id) => {
    if (currentId === id) return;
    if (currentId) {
      idToAnchors.get(currentId)?.forEach((a) => a.classList.remove("is-active"));
    }
    currentId = id;
    if (currentId) {
      idToAnchors.get(currentId)?.forEach((a) => a.classList.add("is-active"));
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = sectionToId.get(visible.target);
      if (id) setCurrent(id);
    },
    { threshold: [0.2, 0.35, 0.5], rootMargin: "-20% 0px -65% 0px" }
  );

  sectionToId.forEach((_, section) => io.observe(section));
}

function setupSmoothHashOffset() {
  const header = $(".header");
  if (!header) return;

  const scrollToHash = () => {
    const id = hashIdFromHref(window.location.hash || "");
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 10;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? "auto" : "smooth" });
  };

  window.addEventListener("hashchange", () => {
    setTimeout(scrollToHash, 0);
  });

  /* Не перехватываем click по всем якорям: preventDefault ломает прокруг и «хвосты» touchend на мобильных.
     Позиция под sticky-шапкой — через scroll-margin-top в CSS + этот scroll как подстраховка при hashchange/загрузке. */

  const runInitial = () => setTimeout(scrollToHash, 0);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInitial, { once: true });
  } else {
    runInitial();
  }
}

function setupBackToTop() {
  const btn = $("#backToTop");
  if (!btn) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateVisibility = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.classList.toggle("backToTop--visible", y > 320);
  };

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
  window.addEventListener("resize", updateVisibility, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    btn.blur();
  });
}

function setupAlbumLightbox() {
  const triggers = $$("[data-album]");
  const lb = $("#lightbox");
  if (!triggers.length || !lb) return;

  const imgEl = $(".lightbox__img", lb);
  const titleEl = $(".lightbox__title", lb);
  const dialogEl = $(".lightbox__dialog", lb);
  const countEl = $(".lightbox__count", lb);
  const thumbsEl = $(".lightbox__thumbs", lb);
  const prevBtn = $('[data-lb-prev="true"]', lb);
  const nextBtn = $('[data-lb-next="true"]', lb);

  const KIDS_FILES = [
    "Фото/eRuU0-KZePxdH2xtPvM_KYaJmyf9sQvYHnQr6bdXPvRsV-rOs7YX3AALlFIY2MXxwPaJBgGLbwie-W6wgf0xr_uA.jpg",
    "Фото/kGGtl1PM7Oehm48cT_5n8ilkOtJlMwBHakeW2Sn0wonW3ZSQFozu51vjX8OAljVT1ccHAeKr8WjeRl67BWKGa6JB.jpg",
    "Фото/Koi-gHLQ_IlqPwNjL4MLRmtQTVz_Gfvczr5JhovyDsgMcabHCQwWA3IdDwG7Cc4gTLmXyjGYVs259X15JtzFxG_U.jpg",
    "Фото/tOX80igluWyLMdKEFIQj4ZZ1-j7VcDSDoJRzsw9dj5Qch9pX-zK-7r8KV_CjPAOfQqOCykT0BKdtVerda1ZkXhHQ.jpg",
    "Фото/xPN6XipEXbrFxejWa1B5i0jTtXYT9L4SNbcIZrqbENt0DKN9SXf2vmiiwQ4BVQfRa6jSsp7NNylvgF_KRKua3uf1.jpg",
  ];

  const FAMILY_FILES = [
    "Фото/F3pKiqX_oZI9Wis632FSdcIUcV924uXqUYomiehmQf6OlqlpFjx7TZ-8Qvk5uephfHGp_CJeXHKHhmXA6dJ4j26d.jpg",
    "Фото/IX51jJQkcGq1TXKJw3PxvTmY94ReALJAVpY6jkHT23-yseMBPqIdsXxC2sr4q2-b48FROp9Ono87wv8gZnt7k0Lc.jpg",
    "Фото/P0vCw76IjUNjwRdrx-6ihROi7crNXqCFzcgjxEywlpGKLOLzisFGX6pPi4G6GnUTiJX5dUp9-AgIojlyS9qCVBGK.jpg",
    "Фото/xN0hZRt7R4BhlQ_RSyBtpB9e5B9BwpVeIKJwhfmLZJDppkjuibEh_g72pUV05p0_G40FF5IQjXw1BmZRg1EKJg8s.jpg",
  ];

  /** Альбомы: пустые — лайтбокс не открывается */
  const ALBUM_FILES = {
    arctic: [],
    women: [],
    men: [],
    kids: KIDS_FILES,
    family: FAMILY_FILES,
  };

  let images = [];
  let index = 0;
  let lastFocus = null;
  let currentAlbumTitle = "";

  const buildThumbs = () => {
    thumbsEl.innerHTML = "";
    images.forEach((it, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lightbox__thumb";
      b.setAttribute("aria-label", `Открыть фото ${i + 1}`);
      b.innerHTML = `<img src="${it.src}" alt="" loading="lazy" decoding="async" />`;
      b.addEventListener("click", () => setIndex(i));
      thumbsEl.appendChild(b);
    });
  };

  const setIndex = (i) => {
    index = (i + images.length) % images.length;
    const current = images[index];
    imgEl.src = current.src;
    imgEl.alt = `${currentAlbumTitle} — фото ${index + 1}`;
    countEl.textContent = `${index + 1} / ${images.length}`;

    const thumbs = $$(".lightbox__thumb", thumbsEl);
    thumbs.forEach((t, ti) => t.classList.toggle("is-active", ti === index));
    const active = thumbs[index];
    if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });

    const next = images[(index + 1) % images.length];
    const prev = images[(index - 1 + images.length) % images.length];
    new Image().src = next.src;
    new Image().src = prev.src;
  };

  const open = (startIndex, trigger) => {
    const key = trigger?.getAttribute("data-album");
    const files = key && ALBUM_FILES[key] ? ALBUM_FILES[key] : [];
    if (!files.length) return;
    images = files.map((name) => ({ src: encodeURI(`./${name}`) }));
    currentAlbumTitle =
      trigger?.querySelector(".work__title")?.textContent?.trim() || "Альбом";
    if (titleEl) titleEl.textContent = currentAlbumTitle;
    if (dialogEl) dialogEl.setAttribute("aria-label", `Альбом: ${currentAlbumTitle}`);

    lastFocus = document.activeElement;
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
    buildThumbs();
    setIndex(startIndex);
    $(".lightbox__close", lb)?.focus();
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  };

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => open(0, btn));
  });

  lb.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('[data-lb-close="true"]')) close();
  });

  prevBtn?.addEventListener("click", () => setIndex(index - 1));
  nextBtn?.addEventListener("click", () => setIndex(index + 1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") setIndex(index - 1);
    if (e.key === "ArrowRight") setIndex(index + 1);
  });

  // Touch swipe (minimal)
  let startX = 0;
  let startY = 0;
  lb.addEventListener(
    "touchstart",
    (e) => {
      if (!lb.classList.contains("is-open")) return;
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
    },
    { passive: true }
  );
  lb.addEventListener(
    "touchend",
    (e) => {
      if (!lb.classList.contains("is-open")) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) setIndex(index + 1);
      else setIndex(index - 1);
    },
    { passive: true }
  );
}


function setupMobileViewToggle() {
  const btn = $("#mobileToggle");
  if (!btn) return;

  const STORAGE_KEY = "forceMobile";

  const apply = (enabled) => {
    document.body.classList.toggle("force-mobile", enabled);
    btn.setAttribute(
      "aria-label",
      enabled ? "Выключить мобильную версию" : "Включить мобильную версию"
    );
    btn.title = enabled ? "Мобильная версия: включено" : "Мобильная версия: выключено";
    const icon = $(".mobileToggle__icon", btn);
    if (icon) icon.textContent = enabled ? "🖥" : "📱";
  };

  const init = () => localStorage.getItem(STORAGE_KEY) === "1";
  apply(init());

  btn.addEventListener("click", () => {
    const next = !document.body.classList.contains("force-mobile");
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    apply(next);
  });
}

/**
 * Анимация главного заголовка (аналог React SplitText + GSAP):
 * буквы появляются снизу с задержкой, триггер — ScrollTrigger (как в примере с threshold/rootMargin).
 * Без платного плагина SplitText: разбиение на символы вручную, после cms.js (текст из CMS уже подставлен).
 */
function setupHeroTitleSplit() {
  const h1 = $(".hero .hero__title");
  if (!h1 || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const plain = h1.textContent.trim();
  if (!plain) return;

  const delaySec = 0.05; /* 50 ms между буквами, как delay={50} в примере */
  const duration = 1.4;
  const ease = "power3.out";
  const from = { opacity: 0, y: 40 };
  const to = { opacity: 1, y: 0 };

  const run = () => {
    h1.setAttribute("aria-label", plain);
    h1.textContent = "";
    const frag = document.createDocumentFragment();
    for (let i = 0; i < plain.length; i++) {
      const ch = plain[i];
      const wrap = document.createElement("span");
      wrap.className = "split-charWrap";
      wrap.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.className = "split-char";
      inner.textContent = ch === " " ? "\u00a0" : ch;
      wrap.appendChild(inner);
      frag.appendChild(wrap);
    }
    h1.appendChild(frag);

    gsap.registerPlugin(ScrollTrigger);

    const targets = h1.querySelectorAll(".split-char");
    const heroEl = h1.closest(".hero") || h1;

    const titleAlreadyInView = () => {
      const r = h1.getBoundingClientRect();
      const vh =
        (window.visualViewport && window.visualViewport.height) ||
        window.innerHeight ||
        document.documentElement.clientHeight ||
        1;
      /* На мобиле первый экран целиком в вьюпорте — ScrollTrigger с «нижней» точкой старта часто не срабатывает */
      return r.top < vh * 0.97 && r.bottom > vh * 0.02;
    };

    const tweenCommon = {
      ...to,
      duration,
      ease,
      stagger: delaySec,
      willChange: "transform, opacity",
      force3D: true,
      onComplete: () => {
        gsap.set(targets, { willChange: "auto" });
      },
    };

    const startTween = () => {
      if (titleAlreadyInView()) {
        gsap.fromTo(targets, { ...from }, {
          ...tweenCommon,
          delay: 0.06,
        });
      } else {
        gsap.fromTo(targets, { ...from }, {
          ...tweenCommon,
          scrollTrigger: {
            trigger: heroEl,
            start: "top bottom",
            once: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        });
      }
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(startTween);
    });
  };

  if (document.fonts && document.fonts.ready) {
    let started = false;
    const kick = () => {
      if (started) return;
      started = true;
      run();
    };
    const t = window.setTimeout(kick, 2200);
    document.fonts.ready
      .then(() => {
        window.clearTimeout(t);
        kick();
      })
      .catch(() => {
        window.clearTimeout(t);
        kick();
      });
  } else {
    run();
  }
}

/** После смены ширины / ориентации пересчитываем триггеры (мобильный десктоп, safe-area, клавиатура). */
function setupScrollTriggerRefreshOnResize() {
  if (typeof ScrollTrigger === "undefined") return;

  let timeoutId = 0;
  const refresh = () => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  };

  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("orientationchange", refresh, { passive: true });
  window.addEventListener("load", refresh, { once: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", refresh, { passive: true });
  }
}

function setupPolarThemeToggle() {
  const btn = $("#polarThemeToggle");
  if (!btn) return;

  const STORAGE_KEY = "polarTheme";

  const apply = (theme) => {
    const isDay = theme === "day";
    document.body.classList.toggle("theme-day", isDay);
    document.body.classList.toggle("theme-dark", !isDay);
    btn.setAttribute("aria-pressed", String(isDay));
    btn.setAttribute(
      "aria-label",
      isDay ? "Включить полярную ночь" : "Включить полярный день"
    );
    btn.title = isDay ? "Полярный день" : "Полярная ночь";
    btn.dataset.theme = theme;
    window.dispatchEvent(new CustomEvent("polar-theme-change", { detail: { theme } }));
  };

  const saved = localStorage.getItem(STORAGE_KEY);
  apply(saved === "day" ? "day" : "night");

  btn.addEventListener("click", () => {
    const next = document.body.classList.contains("theme-day") ? "night" : "day";
    localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  });
}

setupReveal();
setupPolarThemeToggle();
setupMobileViewToggle();
setupScrollSpy();
setupSmoothHashOffset();
setupBackToTop();
setupAlbumLightbox();
setupHeroTitleSplit();
setupScrollTriggerRefreshOnResize();

