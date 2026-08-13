// Costruzione del menu contestuale e mappatura voce cliccata - formato.

import { FORMAT_LABELS, isSupportedFormat } from "../shared/constants.js";

const MENU_ITEM_PATTERN = /^save-as-(\w+)$/;

// Le ricostruzioni vengono serializzate, removeAll() è asincrona e due aggiornamenti ravvicinati creerebbero id duplicati.
let queue = Promise.resolve();

export function syncMenus(mode) {
  queue = queue
    .then(() => rebuild(mode))
    .catch((err) => console.error("Aggiornamento menu fallito:", err));
  return queue;
}

async function rebuild(mode) {
  await chrome.contextMenus.removeAll();

  if (mode === "menu") {
    createSubmenu();
  } else {
    createDirectItem(mode);
  }
}

function createSubmenu() {
  chrome.contextMenus.create({
    id: "save-image",
    title: "Salva immagine come...",
    contexts: ["image"],
  });

  for (const [format, label] of Object.entries(FORMAT_LABELS)) {
    chrome.contextMenus.create({
      id: `save-as-${format}`,
      parentId: "save-image",
      title: label,
      contexts: ["image"],
    });
  }
}

function createDirectItem(mode) {
  const label = FORMAT_LABELS[mode] ?? String(mode).toUpperCase();

  chrome.contextMenus.create({
    id: "save-direct",
    title: `Salva immagine come ${label}`,
    contexts: ["image"],
  });
}

// In modalità formato fisso la voce è una sola, quindi il formato viene dalle impostazioni, in modalità menu viene dall'id della voce cliccata.
export function resolveFormat(mode, menuItemId) {
  if (mode !== "menu") return isSupportedFormat(mode) ? mode : null;

  const match = MENU_ITEM_PATTERN.exec(String(menuItemId));
  return match && isSupportedFormat(match[1]) ? match[1] : null;
}
