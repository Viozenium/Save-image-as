const DEFAULTS = {
  saveMode: "menu",
  jpegQuality: 0.92,
  webpQuality: 0.9,
};

// --------------------------------------------
// Elementi DOM

const radios = document.querySelectorAll('input[name="mode"]');
const jpegSlider = document.getElementById("jpeg-quality");
const webpSlider = document.getElementById("webp-quality");
const jpegVal = document.getElementById("jpeg-quality-val");
const webpVal = document.getElementById("webp-quality-val");
const statusEl = document.getElementById("status");

// --------------------------------------------
// Feedback visivo "salvato"

let statusTimer = null;

function showSaved() {
  statusEl.classList.add("visible");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => statusEl.classList.remove("visible"), 1800);
}

// --------------------------------------------
// Utility: formatta qualità come percentuale

function fmt(val) {
  return Math.round(val * 100) + "%";
}

// --------------------------------------------
// Salvataggio

function saveAll() {
  const selected = document.querySelector('input[name="mode"]:checked');
  if (!selected) return;

  chrome.storage.sync.set(
    {
      saveMode: selected.value,
      jpegQuality: parseFloat(jpegSlider.value),
      webpQuality: parseFloat(webpSlider.value),
    },
    showSaved,
  );
}

// --------------------------------------------
// Listener

radios.forEach((r) => r.addEventListener("change", saveAll));

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

chrome.storage.sync.get(Object.keys(DEFAULTS), (data) => {
  const mode = data.saveMode ?? DEFAULTS.saveMode;
  const jpegQuality = data.jpegQuality ?? DEFAULTS.jpegQuality;
  const webpQuality = data.webpQuality ?? DEFAULTS.webpQuality;

  const radio = document.querySelector(`input[value="${mode}"]`);
  if (radio) radio.checked = true;

  jpegSlider.value = jpegQuality;
  webpSlider.value = webpQuality;
  jpegVal.textContent = fmt(jpegQuality);
  webpVal.textContent = fmt(webpQuality);
});
