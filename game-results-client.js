/**
 * Результаты мини-игр — только localStorage (тот же домен, что сайт и admin.html).
 * Админка читает через SiteGameResults.readAll().
 */
(function (global) {
  const LOCAL_KEY = "zin_game_results_local_v1";
  const IMPORT_KEY = "zin_game_results_import_v1";
  const MAX_ITEMS = 500;

  function rowKey(r) {
    return `${r.game}|${r.gameTitle || ""}|${r.styleId}|${r.submittedAt || r.storedAt}|${r.picksSummary || ""}|${r.styleName}`;
  }

  function saveLocal(entry) {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      if (!Array.isArray(list)) return;
      list.unshift({ ...entry, storedAt: Date.now() });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
    } catch {
      /* ignore */
    }
  }

  function submit(entry) {
    const payload = {
      ...entry,
      submittedAt: new Date().toISOString(),
      pageUrl: location.href,
    };
    saveLocal(payload);
    return Promise.resolve({ ok: true });
  }

  function readLocal() {
    try {
      const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function readImported() {
    try {
      const list = JSON.parse(localStorage.getItem(IMPORT_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function saveImported(items) {
    localStorage.setItem(IMPORT_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  }

  function readAll() {
    const seen = new Set();
    const out = [];
    [...readLocal(), ...readImported()].forEach((row) => {
      const key = rowKey(row);
      if (seen.has(key)) return;
      seen.add(key);
      out.push(row);
    });
    out.sort((a, b) => {
      const ta = new Date(a.submittedAt || a.storedAt || 0).getTime();
      const tb = new Date(b.submittedAt || b.storedAt || 0).getTime();
      return tb - ta;
    });
    return out;
  }

  function clearLocal() {
    localStorage.removeItem(LOCAL_KEY);
  }

  function clearImported() {
    localStorage.removeItem(IMPORT_KEY);
  }

  function clearAll() {
    clearLocal();
    clearImported();
  }

  function mergeImport(items) {
    if (!Array.isArray(items) || !items.length) return;
    const current = readImported();
    const seen = new Set(readAll().map(rowKey));
    items.forEach((row) => {
      if (!row || typeof row !== "object") return;
      const key = rowKey(row);
      if (seen.has(key)) return;
      seen.add(key);
      current.unshift(row);
    });
    saveImported(current.slice(0, MAX_ITEMS));
  }

  global.SiteGameResults = {
    submit,
    readLocal,
    readImported,
    readAll,
    clearLocal,
    clearImported,
    clearAll,
    mergeImport,
  };
})(typeof window !== "undefined" ? window : globalThis);
