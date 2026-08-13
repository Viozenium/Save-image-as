# Save Image As

## Italiano

Estensione Chrome leggera per salvare immagini in JPG, PNG o WebP direttamente dal menu contestuale, con qualità di compressione configurabile.

### Descrizione
L'estensione aggiunge una voce al menu contestuale del browser che consente di salvare le immagini nel formato desiderato.
È pensata per chi ha la necessità di convertire rapidamente le immagini durante la navigazione, senza passare per editor o convertitori online.

### Requisiti
1. Google Chrome (o browser basato su Chromium).
2. Installazione manuale tramite modalità sviluppatore.

### Installazione
1. Scarica o clona questa repository
2. Apri Chrome e vai su `chrome://extensions`
3. Attiva la **Modalità sviluppatore** (in alto a destra)
4. Clicca su **Carica estensione non pacchettizzata**
5. Seleziona la cartella del progetto

### Utilizzo
1. Fai clic destro su qualsiasi immagine in una pagina web
2. Seleziona **"Salva immagine come..."** dal menu contestuale
3. Scegli il formato desiderato (se la modalità è impostata su "Chiedi ogni volta")

### Impostazioni
Vai su `chrome://extensions` -> **Dettagli -> Opzioni estensione**.

| Opzione | Descrizione |
|---|---|
| Formato | Menu contestuale, JPG fisso, PNG fisso o WebP fisso |
| Qualità JPG | Compressione da 10% a 100% (default: 92%) |
| Qualità WebP | Compressione da 10% a 100% (default: 90%) |
| Aspetto | Tema chiaro, scuro o automatico (default: automatico) |

### Struttura del progetto

```
manifest.json
assets/icons/
src/
  shared/          codice condiviso fra service worker e pagina opzioni
    constants.js     formati supportati e valori di default
    settings.js      unico punto di accesso a chrome.storage
  background/
    service-worker.js  entry point: registra i listener e collega i moduli
    menus.js           menu contestuale e mappatura voce -> formato
    converter.js       fetch, decodifica e ri-codifica dell'immagine
    filename.js        costruzione e sanificazione del nome file
    downloader.js      consegna del blob a chrome.downloads
    notifier.js        notifiche all'utente
  options/
    options.html       markup
    options.css        stili e temi
    options.js         collegamento fra controlli e storage
    theme.js           applicazione del tema
```

Il service worker usa i moduli ES (`"type": "module"` nel manifest).
I listener sono registrati sincronicamente nell'entry point e tutti gli import sono statici, con `import()` dinamici Chrome non riuscirebbe a risvegliare il worker per gli eventi.

### Note
- La conversione avviene interamente nel service worker tramite `createImageBitmap()` e `OffscreenCanvas`: non viene iniettato codice nelle pagine visitate.
- L'orientamento EXIF viene applicato prima della conversione, così le foto ruotate non escono storte.
- Le immagini SVG non sono supportate; GIF e WebP animati vengono convertiti al primo fotogramma.
- Le sorgenti non `http`/`https` (ad esempio `blob:` o `chrome://`) possono non essere raggiungibili.

### Sicurezza
Il re-encode via canvas è una sanificazione, l'immagine viene decodificata a pixel e ri-codificata, quindi **metadati, payload appesi in coda al file e polyglot** (file che sono insieme immagine valida e archivio o eseguibile) non arrivano mai al disco.
Anche il nome file viene sanificato, inclusi i caratteri bidirezionali che permettono di mascherare a schermo l'estensione reale.

Se la conversione fallisce, il file originale **non** viene scaricato e l'utente riceve una notifica.

L'estensione richiede il permesso su tutti i siti (`<all_urls>`) per poter scaricare le immagini indipendentemente dalle restrizioni CORS della pagina.

### Motivazione
Questo progetto nasce dalla necessità di salvare immagini in un formato specifico durante la navigazione, evitando di dover usare strumenti esterni o convertitori online ad ogni occasione.

---

## English

This Chrome extension allows you to save any image directly from the context menu as JPG, PNG or WebP, with configurable compression quality, without needing external tools.

### Description
The extension adds an entry to the browser's context menu that allows you to save images in the desired format. It is designed for users who need to quickly convert images while browsing, without relying on editors or online converters.

### Requirements
1. Google Chrome (or Chromium-based browser).
2. Manual installation via developer mode (see Installation).

### Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the project folder

### Usage
1. Right-click on any image on a web page
2. Select **"Save image as..."** from the context menu
3. Choose the desired format (if mode is set to "Ask every time")

### Settings
Go to `chrome://extensions` -> **Details -> Extension options**.

| Option | Description |
|---|---|
| Format | Context menu, fixed JPG, fixed PNG or fixed WebP |
| JPG Quality | Compression from 10% to 100% (default: 92%) |
| WebP Quality | Compression from 10% to 100% (default: 90%) |
| Appearance | Light, dark or automatic theme (default: automatic) |

### Project structure

```
manifest.json
assets/icons/
src/
  shared/          code shared between service worker and options page
    constants.js     supported formats and default values
    settings.js      single access point to chrome.storage
  background/
    service-worker.js  entry point: registers listeners and wires modules
    menus.js           context menu and menu item -> format mapping
    converter.js       image fetch, decode and re-encode
    filename.js        filename building and sanitization
    downloader.js      hands the blob to chrome.downloads
    notifier.js        user notifications
  options/
    options.html       markup
    options.css        styles and themes
    options.js         wires controls to storage
    theme.js           theme application
```

The service worker uses ES modules (`"type": "module"` in the manifest).
Listeners are registered synchronously in the entry point and all imports are static, with dynamic `import()` Chrome would fail to wake the worker for events.

### Notes
- Conversion happens entirely in the service worker via `createImageBitmap()` and `OffscreenCanvas`: no code is injected into visited pages.
- EXIF orientation is applied before conversion, so rotated photos are not saved sideways.
- SVG images are not supported; animated GIF and WebP are converted to their first frame.
- Non-`http`/`https` sources (e.g. `blob:` or `chrome://`) may not be reachable.

### Security
Canvas re-encoding acts as a sanitizerm the image is decoded to pixels and re-encoded, so **metadata, payloads appended to the file, and polyglots** (files that are both a valid image and an archive or executable) never reach the disk
Filenames are sanitized too, including the bidirectional characters that can visually disguise the real extension.

If conversion fails, the original file is **not** downloaded and the user is notified.

The extension requires all-sites access (`<all_urls>`) in order to fetch images regardless of the page's CORS restrictions.

### Motivation
This project was created to save images in a specific format while browsing, avoiding the need to use external tools or online converters each time.

---

## Changelog

### v1.1.0
- Conversione spostata nel service worker (`createImageBitmap` + `OffscreenCanvas`), funziona su immagini cross-origin, dentro iframe e su pagine con CSP restrittiva.
- Rimosso il fallback al download del file originale, senza conversione l'immagine non viene salvata.
- Rimossi i permessi `scripting` e `activeTab`, aggiunto `host_permissions` su tutti i siti.
- Nome file sanificato, decodifica percent, rimozione di caratteri di controllo e override bidirezionali, gestione dei nomi riservati Windows e delle sorgenti `data:`/`blob:`.
- Applicato l'orientamento EXIF prima della conversione.
- Corretta la creazione duplicata delle voci di menu al cambio rapido delle impostazioni.
- Pagina impostazioni rifinita, tema chiaro/scuro/automatico selezionabile, stati di selezione e focus visibili, rispetto di `prefers-reduced-motion`.
- Progetto riorganizzato in `src/` con moduli separati per responsabilità (background, opzioni, codice condiviso).

### v1.0.0
- Prima versione pubblica.
- Menu contestuale con sottomenu JPG / PNG / WebP.
- Modalità formato fisso configurabile dalla pagina delle impostazioni.
- Qualità di compressione configurabile per JPG e WebP tramite slider.
- Feedback visivo "Impostazioni salvate ✓" nella pagina delle opzioni.
- Salvataggio automatico delle impostazioni senza pulsante di conferma.
- Notifica in caso di fallback al formato originale (errore CORS o pagina protetta).
- Conversione tramite `canvas.toBlob()` nel contesto della pagina.
- Fallback al download diretto in caso di errore di conversione.