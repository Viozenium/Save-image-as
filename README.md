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
Vai su `chrome://extensions` → **Dettagli → Opzioni estensione**.

| Opzione | Descrizione |
|---|---|
| Formato | Menu contestuale, JPG fisso, PNG fisso o WebP fisso |
| Qualità JPG | Compressione da 10% a 100% (default: 92%) |
| Qualità WebP | Compressione da 10% a 100% (default: 90%) |

### Note
- La conversione avviene nel contesto della pagina tramite `canvas.toBlob()`.
- Su siti con restrizioni CORS l'immagine viene salvata nel formato originale e l'utente viene notificato.
- Non funziona su pagine protette (`chrome://`, PDF, pagine delle estensioni).

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
Go to `chrome://extensions` → **Details → Extension options**.

| Option | Description |
|---|---|
| Format | Context menu, fixed JPG, fixed PNG or fixed WebP |
| JPG Quality | Compression from 10% to 100% (default: 92%) |
| WebP Quality | Compression from 10% to 100% (default: 90%) |

### Notes
- Conversion happens in the page context via `canvas.toBlob()`.
- On sites with CORS restrictions the image will be saved in its original format and the user will be notified.
- Does not work on protected pages (`chrome://`, PDFs, extension pages).

### Motivation
This project was created to save images in a specific format while browsing, avoiding the need to use external tools or online converters each time.

---

## Changelog

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