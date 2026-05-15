const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "index.html");
let html = fs.readFileSync(p, "utf8");

const marker = "      <!-- AUDIENCE -->";
if (html.includes('id="arcticIdentity"')) {
  console.log("already inserted");
  process.exit(0);
}

const block = `
      <!-- ARCTIC AI IDENTITY -->
      <section class="section section--soft" id="arctic-identity" aria-label="Arctic AI Identity — подбор образа">
        <motion class="container">
          <div class="sectionHead reveal">
            <h2 class="h2">Arctic AI Identity</h2>
            <p class="muted">
              Загрузите фото, пройдите северное сканирование и выберите cinematic-образ нейрофотосессии.
            </p>
          </div>

          <div class="ai-id reveal" id="arcticIdentity">
            <div class="ai-id__wrap">
              <div class="ai-id__aurora" aria-hidden="true"></motion>
              <div class="ai-id__snow" aria-hidden="true"></motion>

              <div class="ai-id__panel">
                <header class="ai-id__head">
                  <p class="ai-id__kicker">Luxury Arctic AI</p>
                  <h3 class="ai-id__title">Ваш северный образ</h3>
                  <p class="ai-id__sub">Интерактивный подбор стиля нейрофотосессии</p>
                </header>

                <div class="ai-id__body">
                  <motion class="ai-id__step ai-id__step--upload is-active" data-step="upload">
                    <label class="ai-id__drop" id="aiIdDrop">
                      <span class="ai-id__drop-icon" aria-hidden="true">❄</span>
                      <p class="ai-id__drop-text">Перетащите фото сюда<br />или нажмите для выбора</p>
                    </label>
                    <input
                      class="ai-id__file"
                      id="aiIdFile"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      aria-label="Загрузить фото"
                    />
                    <button type="button" class="ai-id__btn ai-id__btn--primary ai-id__btn-pick">
                      Загрузить фото
                    </button>
                  </div>

                  <div class="ai-id__step ai-id__step--scan" data-step="scan">
                    <div class="ai-id__preview-wrap">
                      <img class="ai-id__preview" alt="" decoding="async" />
                      <div class="ai-id__scan-overlay" aria-hidden="true"></motion>
                      <div class="ai-id__scan-line" aria-hidden="true"></motion>
                    </div>
                    <p class="ai-id__stage">AI сканирует ваш образ…</p>
                    <div class="ai-id__progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                      <div class="ai-id__progress-bar"></motion>
                    </div>
                  </div>

                  <div class="ai-id__step" data-step="styles">
                    <p class="ai-id__sub" style="text-align: center; margin: 0">Выберите стиль образа</p>
                    <div class="ai-id__styles" role="listbox" aria-label="Стили нейрофотосессии"></motion>
                  </div>

                  <div class="ai-id__step" data-step="result">
                    <div class="ai-id__result-card" id="aiIdResultCard">
                      <div class="ai-id__result-photo">
                        <img alt="" decoding="async" />
                      </div>
                      <div class="ai-id__result-meta">
                        <p class="ai-id__result-style">Arctic AI Identity</p>
                        <h4 class="ai-id__result-name"></h4>
                        <p class="ai-id__result-desc"></p>
                        <p class="ai-id__result-tagline"></p>
                      </div>
                    </motion>
                    <div class="ai-id__actions">
                      <button type="button" class="ai-id__btn ai-id__btn--primary ai-id__btn-download">
                        Скачать карточку
                      </button>
                      <button type="button" class="ai-id__btn ai-id__btn-share">Поделиться</button>
                      <button type="button" class="ai-id__btn ai-id__btn-retry">Попробовать другой стиль</button>
                      <a class="ai-id__btn ai-id__btn--gold" href="#contacts">Заказать нейрофотосессию</a>
                    </motion>
                  </div>
                </motion>

                <p class="ai-id__privacy">
                  Фото не загружается на сервер и остаётся только в вашем браузере.
                </p>
              </motion>

              <div class="ai-id__toast" role="status" aria-live="polite"></motion>
            </motion>
          </motion>
        </motion>
      </section>

`;

const fixed = block.replace(/<\/?motion\b[^>]*>/g, (m) => {
  if (m.startsWith("</")) return "</motion>".replace("motion", "iv").replace("iv", "div");
  return m.replace("<motion", "<div").replace("motion>", "div>");
});
// safer: replace all motion with div
const clean = block
  .replace(/<motion /g, "<div ")
  .replace(/<\/motion>/g, "</div>")
  .replace(/<motion>/g, "<motion>");

const clean2 = block.replace(/<\/?motion[^>]*>/g, "").replace(/<container/g, "<div class=\"container\"");

// manual clean block - write directly without motion
const CLEAN = `
      <!-- ARCTIC AI IDENTITY -->
      <section class="section section--soft" id="arctic-identity" aria-label="Arctic AI Identity — подбор образа">
        <div class="container">
          <motion class="sectionHead reveal">
`.replace(/<\/?motion[^>]*>/g, "");

fs.writeFileSync(path.join(__dirname, "_arctic-block.html"), "use node to build");
