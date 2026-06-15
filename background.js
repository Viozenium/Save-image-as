// --------------------------------------------
// Inizializzazione menu

function initMenus() {
  chrome.storage.sync.get("saveMode", (data) => {
    menusCreated = false;
    createMenus(data.saveMode || "menu");
  });
}

chrome.runtime.onInstalled.addListener(initMenus);
chrome.runtime.onStartup.addListener(initMenus);

// --------------------------------------------
// Creazione context menu

let menusCreated = false;

const FORMAT_LABELS = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

function createMenus(mode) {
  if (menusCreated) return;
  menusCreated = true;

  chrome.contextMenus.removeAll(() => {
    if (mode === "menu") {
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
    } else {
      const label = FORMAT_LABELS[mode] ?? mode.toUpperCase();

      chrome.contextMenus.create({
        id: "save-direct",
        title: `Salva immagine come ${label}`,
        contexts: ["image"],
      });
    }
  });
}

// --------------------------------------------
// Aggiornamento menu al cambio impostazioni

chrome.storage.onChanged.addListener((changes) => {
  if (changes.saveMode) {
    menusCreated = false;
    createMenus(changes.saveMode.newValue);
  }
});

// --------------------------------------------
// Utility: nome file

function getFileNameFromUrl(url, extension) {
  try {
    const parsedUrl = new URL(url);
    let name = parsedUrl.pathname
      .split("/")
      .pop()
      .split("?")[0]
      .replace(/\.[^/.]+$/, "")
      .trim();

    return (name || "image") + "." + extension;
  } catch {
    return "image." + extension;
  }
}

// --------------------------------------------
// Conversione immagine (eseguita nella tab via executeScript)

function convertImage(url, format, quality) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob);

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext("2d");
            if (format === "jpeg") {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
            const qualityArg = format === "png" ? undefined : quality;
            canvas.toBlob(
              (outputBlob) => {
                if (!outputBlob) {
                  reject(new Error("Conversione canvas fallita"));
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () =>
                  reject(new Error("Lettura blob fallita"));
                reader.readAsDataURL(outputBlob);
              },
              "image/" + format,
              qualityArg,
            );
          } catch (err) {
            reject(err);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Errore caricamento immagine"));
        };

        img.src = objectUrl;
      })
      .catch((err) => reject(new Error("Fetch fallito: " + err.message)));
  });
}

// --------------------------------------------
// Gestione click sul menu

chrome.contextMenus.onClicked.addListener((info, tab) => {
  chrome.storage.sync.get(
    ["saveMode", "jpegQuality", "webpQuality"],
    async (data) => {
      const mode = data.saveMode || "menu";
      const jpegQuality = data.jpegQuality ?? 0.92;
      const webpQuality = data.webpQuality ?? 0.9;

      let format = null;

      if (mode === "menu") {
        if (info.menuItemId === "save-as-jpeg") format = "jpeg";
        if (info.menuItemId === "save-as-png") format = "png";
        if (info.menuItemId === "save-as-webp") format = "webp";
      } else {
        format = mode;
      }

      if (!format) return;

      const quality = format === "jpeg" ? jpegQuality : webpQuality;
      const extension = format === "jpeg" ? "jpg" : format;
      const imageUrl = info.srcUrl;
      const filename = getFileNameFromUrl(imageUrl, extension);

      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: convertImage,
          args: [imageUrl, format, quality],
        });

        const dataUrl = result?.result;
        if (!dataUrl) throw new Error("Nessun dato ricevuto dalla conversione");

        await chrome.downloads.download({ url: dataUrl, filename });
      } catch (err) {
        console.warn("Conversione fallita, uso fallback diretto:", err);
        try {
          await chrome.downloads.download({ url: imageUrl, filename });

          await chrome.notifications.create({
            type: "basic",
            iconUrl: "icons/icon.png",
            title: "Salvataggio in formato originale",
            message:
              "Impossibile convertire l'immagine (pagina protetta o cross-origin). " +
              "Il file è stato salvato nel formato originale.",
          });
        } catch (e) {
          console.error("Fallback fallito:", e);
        }
      }
    },
  );
});
