// Unico punto di accesso a chrome.storage, il resto del codice lavora su un oggetto impostazioni già completo di default.

import { DEFAULTS } from "./constants.js";

export async function readSettings() {
  const stored = await chrome.storage.sync.get(Object.keys(DEFAULTS));

  const settings = { ...DEFAULTS };
  for (const [key, value] of Object.entries(stored)) {
    if (value !== undefined) settings[key] = value;
  }

  return settings;
}

export async function writeSettings(values) {
  await chrome.storage.sync.set(values);
}

// Notifica il cambio di una singola chiave nell'area "sync".
export function onSettingChanged(key, callback) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (changes[key]) callback(changes[key].newValue);
  });
}
