/**
 * Согласие на cookies и обработку персональных данных.
 * Сохраняет выбор в localStorage (zin_consent_v1).
 */
(function (global) {
  const STORAGE_KEY = "zin_consent_v1";
  const VERSION = 1;

  function privacyHref() {
    const path = (location.pathname || "").replace(/\\/g, "/");
    if (/\/privacy\.html$/i.test(path) || path.endsWith("/privacy")) return "#main";
    return "./privacy.html";
  }

  function read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || data.v !== VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  function write(partial) {
    const data = {
      v: VERSION,
      cookies: partial.cookies,
      personalData: Boolean(partial.personalData),
      at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
    return data;
  }

  function hasPersonalData() {
    const s = read();
    return Boolean(s && s.personalData);
  }

  function hasOptionalCookies() {
    const s = read();
    return s && s.cookies === "all";
  }

  function dispatch(data) {
    global.dispatchEvent(
      new CustomEvent("zin:consent", { detail: data })
    );
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.classList.remove("is-visible");
    banner.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-cookie-consent");
    window.setTimeout(() => banner.remove(), 320);
  }

  function showBanner() {
    if (document.getElementById("cookieConsent")) return;

    const policyUrl = privacyHref();
    const banner = document.createElement("aside");
    banner.id = "cookieConsent";
    banner.className = "cookieConsent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "cookieConsentTitle");
    banner.setAttribute("aria-describedby", "cookieConsentDesc");
    banner.innerHTML = `
      <div class="cookieConsent__panel">
        <p class="cookieConsent__kicker" id="cookieConsentTitle">Cookies и персональные данные</p>
        <p class="cookieConsent__text" id="cookieConsentDesc">
          Сайт использует файлы cookie и <span class="cookieConsent__nowrap">localStorage</span> для работы интерфейса
          (тема, настройки отображения). С вашего согласия — также для мини-игр и сохранения результатов в браузере.
          Подробнее — в <a class="cookieConsent__link" href="${policyUrl}">политике конфиденциальности</a>.
        </p>
        <label class="cookieConsent__check">
          <input type="checkbox" class="cookieConsent__check-input" id="cookieConsentPd" />
          <span class="cookieConsent__check-text">
            Я соглашаюсь на обработку персональных данных в соответствии с
            <a class="cookieConsent__link" href="${policyUrl}">политикой конфиденциальности</a>
          </span>
        </label>
        <div class="cookieConsent__actions">
          <button type="button" class="cookieConsent__btn cookieConsent__btn--primary" data-consent="all">
            Принять
          </button>
          <button type="button" class="cookieConsent__btn cookieConsent__btn--ghost" data-consent="essential">
            Только необходимые
          </button>
        </div>
      </div>`;

    document.body.appendChild(banner);
    document.body.classList.add("has-cookie-consent");

    const pdCheck = banner.querySelector("#cookieConsentPd");

    banner.querySelector('[data-consent="all"]')?.addEventListener("click", () => {
      if (!pdCheck?.checked) {
        pdCheck?.focus();
        pdCheck?.setAttribute("aria-invalid", "true");
        banner.classList.add("cookieConsent--shake");
        window.setTimeout(() => banner.classList.remove("cookieConsent--shake"), 420);
        return;
      }
      pdCheck?.removeAttribute("aria-invalid");
      const data = write({ cookies: "all", personalData: true });
      hideBanner(banner);
      dispatch(data);
    });

    banner.querySelector('[data-consent="essential"]')?.addEventListener("click", () => {
      const data = write({ cookies: "essential", personalData: false });
      hideBanner(banner);
      dispatch(data);
    });

    requestAnimationFrame(() => {
      banner.classList.add("is-visible");
      banner.setAttribute("aria-hidden", "false");
    });
  }

  function init() {
    const existing = read();
    if (existing) {
      dispatch(existing);
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showBanner, { once: true });
    } else {
      showBanner();
    }
  }

  global.SiteConsent = {
    read,
    hasPersonalData,
    hasOptionalCookies,
    VERSION,
  };

  init();
})(typeof window !== "undefined" ? window : globalThis);
