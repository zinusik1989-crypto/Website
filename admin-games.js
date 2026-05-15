/**
 * Админка: результаты мини-игр из localStorage (только после PIN).
 */
(function () {
  if (!window.SiteCMS) return;

  const panel = document.getElementById("adminGamesPanel");
  if (!panel) return;

  const statusEl = document.getElementById("adminGamesStatus");
  const tbody = document.getElementById("adminGamesTbody");
  const countEl = document.getElementById("adminGamesCount");
  const importInput = document.getElementById("adminGamesImport");

  let cachedItems = [];

  function setStatus(msg, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "rgba(28,20,24,.85)" : "#a31f3d";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(iso);
    }
  }

  function gameLabel(id) {
    if (id === "arctic-wheel") return "Колесо судьбы";
    if (id === "arctic-story-game") return "Север выбирает";
    return id || "—";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderTable(items) {
    cachedItems = items;
    if (countEl) countEl.textContent = String(items.length);
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!items.length) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="6" class="admin-games__empty">Пока нет записей. Пройдите игру на главной в этом же браузере или импортируйте JSON.</td>';
      tbody.appendChild(tr);
      return;
    }
    items.forEach((row, i) => {
      const tr = document.createElement("tr");
      const stats =
        Array.isArray(row.stats) && row.stats.length
          ? row.stats.map((s) => `${s.label}: ${s.value}%`).join("; ")
          : "";
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${formatDate(row.submittedAt || row.storedAt)}</td>
        <td>${gameLabel(row.game)}</td>
        <td><strong>${escapeHtml(row.styleName || row.styleId || "—")}</strong></td>
        <td>${row.gender === "m" ? "М" : row.gender === "f" ? "Ж" : row.hasPhoto ? "фото" : "—"}</td>
        <td class="admin-games__desc">${escapeHtml((row.desc || stats || "").slice(0, 120))}${
        (row.desc || stats || "").length > 120 ? "…" : ""
      }</td>`;
      tbody.appendChild(tr);
    });
  }

  function refresh() {
    const items = window.SiteGameResults?.readAll?.() || [];
    renderTable(items);
    const localN = window.SiteGameResults?.readLocal?.().length || 0;
    const impN = window.SiteGameResults?.readImported?.().length || 0;
    setStatus(
      items.length
        ? `Всего ${items.length} (с сайта: ${localN}, импорт: ${impN}). Данные только в этом браузере.`
        : "Нет записей. Откройте главную, пройдите игру, затем обновите список."
    );
  }

  function downloadBlob(filename, mime, content) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportJson() {
    if (!cachedItems.length) {
      setStatus("Нет данных для выгрузки.", false);
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(
      `zinaida-game-results-${stamp}.json`,
      "application/json",
      JSON.stringify({ exportedAt: new Date().toISOString(), items: cachedItems }, null, 2)
    );
    setStatus(`Скачан JSON: ${cachedItems.length} записей.`);
  }

  function exportCsv() {
    if (!cachedItems.length) {
      setStatus("Нет данных для выгрузки.", false);
      return;
    }
    const cols = [
      "submittedAt",
      "game",
      "styleId",
      "styleName",
      "gender",
      "colors",
      "outfit",
      "locations",
      "desc",
      "prompt",
      "pageUrl",
    ];
    const esc = (v) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const lines = [cols.join(",")];
    cachedItems.forEach((row) => {
      lines.push(cols.map((c) => esc(row[c])).join(","));
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadBlob(`zinaida-game-results-${stamp}.csv`, "text/csv;charset=utf-8", "\uFEFF" + lines.join("\n"));
    setStatus(`Скачан CSV: ${cachedItems.length} записей.`);
  }

  function clearAll() {
    if (!confirm("Удалить все результаты игр в этом браузере (с сайта и импорт)?")) return;
    window.SiteGameResults?.clearAll?.();
    setStatus("Все записи удалены.");
    refresh();
  }

  function importJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const items = Array.isArray(data) ? data : data.items;
        if (!Array.isArray(items)) throw new Error("bad");
        window.SiteGameResults.mergeImport(items);
        refresh();
        setStatus(`Импортировано записей: ${items.length}.`);
      } catch {
        setStatus("Не удалось прочитать JSON.", false);
      }
      if (importInput) importInput.value = "";
    };
    reader.readAsText(file, "UTF-8");
  }

  document.getElementById("adminGamesRefresh")?.addEventListener("click", refresh);
  document.getElementById("adminGamesExportJson")?.addEventListener("click", exportJson);
  document.getElementById("adminGamesExportCsv")?.addEventListener("click", exportCsv);
  document.getElementById("adminGamesClearAll")?.addEventListener("click", clearAll);
  importInput?.addEventListener("change", (e) => {
    importJson(e.target.files?.[0]);
  });

  window.AdminGames = { refresh };

  refresh();
})();
