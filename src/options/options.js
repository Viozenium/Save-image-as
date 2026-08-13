// Pagina impostazioni, collega i controlli del form allo storage condiviso.

import { DEFAULTS } from "../shared/constants.js";
import { readSettings, writeSettings } from "../shared/settings.js";
import { applyTheme } from "./theme.js";

// --------------------------------------------
// Elementi DOM

const modeRadios = document.querySelectorAll('input[name="mode"]');
const themeRadios = document.querySelectorAll('input[name="theme"]');
const jpegSlider = document.getElementById("jpeg-quality");
const webpSlider = document.getElementById("webp-quality");
const jpegVal = document.getElementById("jpeg-quality-val");
const webpVal = document.getElementById("webp-quality-val");
const statusEl = document.getElementById("status");

// Finché le impostazioni salvate non sono state caricate le scritture sono sospese, un'interazione in quella finestra verrebbe sovrascritta dal load.
let loaded = false;

// --------------------------------------------
// Feedback visivo "salvato"

let statusTimer = null;

function showSaved() {
  statusEl.classList.add("visible");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusEl.classList.remove("visible"), 1800);
}

// --------------------------------------------
// Utility

function fmt(value) {
  return `${Math.round(Number(value) * 100)}%`;
}

function checkedValue(radios, fallback) {
  for (const radio of radios) {
    if (radio.checked) return radio.value;
  }
  return fallback;
}

function check(name, value) {
  const radio = document.querySelector(
    `input[name="${name}"][value="${value}"]`,
  );
  if (radio) radio.checked = true;
}

// --------------------------------------------
// Salvataggio

async function saveAll() {
  if (!loaded) return;

  const theme = checkedValue(themeRadios, DEFAULTS.theme);
  applyTheme(theme);

  try {
    await writeSettings({
      saveMode: checkedValue(modeRadios, DEFAULTS.saveMode),
      jpegQuality: parseFloat(jpegSlider.value),
      webpQuality: parseFloat(webpSlider.value),
      theme,
    });
    showSaved();
  } catch (err) {
    console.error("Salvataggio fallito:", err);
  }
}

// --------------------------------------------
// Listener

for (const radio of [...modeRadios, ...themeRadios]) {
  radio.addEventListener("change", saveAll);
}
jpegSlider.addEventListener("input", () => {
  jpegVal.textContent = fmt(jpegSlider.value);
});
jpegSlider.addEventListener("change", saveAll);

webpSlider.addEventListener("input", () => {
  webpVal.textContent = fmt(webpSlider.value);
});
webpSlider.addEventListener("change", saveAll);

// --------------------------------------------
// Caricamento impostazioni salvate

async function load() {
  let settings = DEFAULTS;

  try {
    settings = await readSettings();
  } catch (err) {
    console.error("Caricamento fallito, uso i default:", err);
  }

  check("mode", settings.saveMode);
  check("theme", settings.theme);
  applyTheme(settings.theme);

  jpegSlider.value = settings.jpegQuality;
  webpSlider.value = settings.webpQuality;
  jpegVal.textContent = fmt(settings.jpegQuality);
  webpVal.textContent = fmt(settings.webpQuality);

  loaded = true;
}

load();
