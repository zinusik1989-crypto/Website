(function () {
  const CMS = window.SiteCMS;
  if (!CMS) return;

  const loginEl = document.getElementById("adminLogin");
  const panelEl = document.getElementById("adminPanel");
  const formEl = document.getElementById("cmsForm");
  const statusEl = document.getElementById("cmsStatus");
  const loginStatusEl = document.getElementById("loginStatus");

  function isAuthed() {
    return sessionStorage.getItem(CMS.SESSION_KEY) === "1";
  }

  function setAuthed(ok) {
    if (ok) sessionStorage.setItem(CMS.SESSION_KEY, "1");
    else sessionStorage.removeItem(CMS.SESSION_KEY);
  }

  function showToast(msg, ok = true) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "rgba(28,20,24,.85)" : "#a31f3d";
  }

  function buildForm() {
    if (!formEl) return;
    formEl.innerHTML = "";
    CMS.schema.forEach((block) => {
      const sec = document.createElement("section");
      sec.className = "admin-section";
      const h = document.createElement("h2");
      h.textContent = block.section;
      sec.appendChild(h);
      const grid = document.createElement("div");
      grid.className = "admin-grid";

      block.fields.forEach((f) => {
        const wrap = document.createElement("div");
        wrap.className = "admin-field" + (f.wide ? " admin-field--full" : "");
        const lab = document.createElement("label");
        lab.htmlFor = `f_${f.key}`;
        lab.textContent = f.label;
        let input;
        if (f.type === "textarea") {
          input = document.createElement("textarea");
          input.rows = f.rows != null ? Math.max(2, Number(f.rows)) : 4;
        } else {
          input = document.createElement("input");
          input.type = "text";
        }
        input.id = `f_${f.key}`;
        input.name = f.key;
        wrap.appendChild(lab);
        wrap.appendChild(input);
        grid.appendChild(wrap);
      });
      sec.appendChild(grid);
      formEl.appendChild(sec);
    });
  }

  function fillForm(data) {
    CMS.schema.forEach((block) => {
      block.fields.forEach((f) => {
        const el = document.getElementById(`f_${f.key}`);
        if (el) el.value = data[f.key] != null ? String(data[f.key]) : "";
      });
    });
  }

  function readForm() {
    const data = { ...CMS.mergeData() };
    CMS.schema.forEach((block) => {
      block.fields.forEach((f) => {
        const el = document.getElementById(`f_${f.key}`);
        if (el) data[f.key] = el.value;
      });
    });
    return data;
  }

  function toggleView() {
    const ok = isAuthed();
    if (loginEl) loginEl.hidden = ok;
    if (panelEl) panelEl.hidden = !ok;
  }

  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = document.getElementById("adminPin")?.value?.trim() ?? "";
    if (pin === CMS.ADMIN_PIN) {
      if (loginStatusEl) loginStatusEl.textContent = "";
      setAuthed(true);
      buildForm();
      fillForm(CMS.mergeData());
      toggleView();
      showToast("Вход выполнен. Не забудьте сохранить изменения.");
    } else {
      if (loginStatusEl) {
        loginStatusEl.textContent = "Неверный PIN.";
        loginStatusEl.style.color = "#a31f3d";
      }
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    setAuthed(false);
    toggleView();
  });

  formEl?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = readForm();
    CMS.save(data);
    showToast("Сохранено в этом браузере (localStorage). Откройте главную — тексты обновятся.");
  });

  document.getElementById("resetBtn")?.addEventListener("click", () => {
    if (!confirm("Сбросить все правки к заводским текстам?")) return;
    CMS.resetToDefaults();
    fillForm(CMS.mergeData());
    showToast("Сброшено. Страница сайта подтянет исходные тексты.");
  });

  document.getElementById("exportBtn")?.addEventListener("click", () => {
    const data = readForm();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zinaida-site-content.json";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("JSON скачан.");
  });

  document.getElementById("importInput")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!imported || typeof imported !== "object") throw new Error("bad");
        const merged = { ...CMS.defaults };
        Object.keys(imported).forEach((k) => {
          const v = imported[k];
          if (v != null && String(v).trim() !== "") merged[k] = v;
        });
        CMS.save(merged);
        fillForm(CMS.mergeData());
        showToast("Импорт выполнен и сохранён.");
      } catch {
        showToast("Не удалось прочитать JSON.", false);
      }
      e.target.value = "";
    };
    reader.readAsText(file, "UTF-8");
  });

  toggleView();
  if (isAuthed()) {
    buildForm();
    fillForm(CMS.mergeData());
  }
})();
