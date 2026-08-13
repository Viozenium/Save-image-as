// Punto di ingresso del service worker, registra i listener e collega fra loro i moduli.

// I listener vanno registrati sincronicamente all'avvio del modulo, altrimenti Chrome non riesce a risvegliare il worker per gli eventi, per questo gli import sono statici e non ci sono import() dinamici.

import { FORMAT_EXTENSIONS } from "../shared/constants.js";
import { readSettings, onSettingChanged } from "../shared/settings.js";
import { syncMenus, resolveFormat } from "./menus.js";
import { getFileNameFromUrl } from "./filename.js";
import { convertImage } from "./converter.js";
import { downloadBlob } from "./downloader.js";
import { notifyConversionFailed } from "./notifier.js";

async function initMenus() {
  const { saveMode } = await readSettings();
  await syncMenus(saveMode);
}

chrome.runtime.onInstalled.addListener(initMenus);
chrome.runtime.onStartup.addListener(initMenus);

onSettingChanged("saveMode", (mode) => syncMenus(mode));

chrome.contextMenus.onClicked.addListener(async (info) => {
  const settings = await readSettings();
  const format = resolveFormat(settings.saveMode, info.menuItemId);

  if (!format || !info.srcUrl) return;

  const quality =
    format === "jpeg" ? settings.jpegQuality : settings.webpQuality;
  const filename = getFileNameFromUrl(info.srcUrl, FORMAT_EXTENSIONS[format]);

  try {
    const converted = await convertImage(info.srcUrl, format, quality);
    await downloadBlob(converted, filename);
  } catch (err) {
    console.error("Conversione fallita:", err);
    await notifyConversionFailed();
  }
});
