/**
 * Абсолютные URL для canonical / Open Graph (до и после CMS).
 * База: data-site-base на <html>, иначе origin + путь к каталогу сайта.
 */
(function () {
  function siteBase() {
    const html = document.documentElement;
    const fromAttr = String(html.getAttribute("data-site-base") || "").trim();
    if (/^https?:\/\//i.test(fromAttr)) return fromAttr.replace(/\/$/, "");
    if (typeof location === "undefined" || location.protocol === "file:") return "";
    let p = location.pathname || "/";
    const dir = /\/$/.test(p) ? p : p.replace(/[^/]*$/, "/");
    const joined = (location.origin + dir).replace(/\/+$/, "");
    return joined || location.origin;
  }

  function abs(path, base) {
    const v = String(path || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const b = (base || siteBase()).replace(/\/$/, "");
    if (!b) return v;
    try {
      return new URL(v.replace(/^\.\//, ""), b + "/").href;
    } catch {
      return v;
    }
  }

  function normalizeCanonical(url) {
    if (!url) return url;
    return url.replace(/\/index\.html$/i, "/").replace(/([^:]\/)\/+/g, "$1");
  }

  function patchHead(opts) {
    const base = (opts && opts.base) || siteBase();
    if (!base) return;

    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) {
      const raw = (opts && opts.canonical) || canon.getAttribute("href") || "./";
      const path = String(raw).replace(/^\.\//, "").replace(/^\//, "");
      const target = path && path !== "index.html" ? path : "";
      canon.setAttribute("href", normalizeCanonical(abs(target || "./", base)));
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      const u = (opts && opts.ogUrl) || ogUrl.getAttribute("content") || "./";
      ogUrl.setAttribute("content", normalizeCanonical(abs(u, base)));
    }

    ["og:image", "twitter:image"].forEach((prop) => {
      const sel =
        prop === "og:image"
          ? 'meta[property="og:image"]'
          : 'meta[name="twitter:image"]';
      const el = document.querySelector(sel);
      if (!el) return;
      const raw = el.getAttribute("content");
      if (raw) el.setAttribute("content", abs(raw, base));
    });
  }

  window.SiteSEO = { siteBase, abs, normalizeCanonical, patchHead };
  patchHead();
})();
