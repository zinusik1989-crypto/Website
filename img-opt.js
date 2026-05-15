/**
 * Пути к WebP-версиям рядом с PNG/JPG (генерируются scripts/optimize-images.ps1).
 */
(function (global) {
  function toWebp(path) {
    if (!path || typeof path !== "string") return path;
    return path.replace(/\.(png|jpe?g)(\?.*)?$/i, ".webp$2");
  }

  global.SiteImg = { toWebp };
})(typeof window !== "undefined" ? window : globalThis);
