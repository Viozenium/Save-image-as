// Costruzione del nome file a partire dall'URL dell'immagine.

// L'URL è una sorgente non fidata, quindi il nome va sanificato, i caratteri bidirezionali permettono di mascherare a schermo l'estensione reale e i separatori di percorso fanno rigettare il download da Chrome.

// Intervalli rimossi, per codepoint, controlli C0, DEL, e gli override bidirezionali LRM/RLM, LRE-RLO/PDF e i marcatori di isolamento.
const STRIPPED_RANGES = [
  [0x0000, 0x001f],
  [0x007f, 0x007f],
  [0x200e, 0x200f],
  [0x202a, 0x202e],
  [0x2066, 0x2069],
];

const INVALID_CHARS = /[<>:"/\\|?*]/g;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const MAX_BASE_LENGTH = 100;

function stripUnsafeChars(name) {
  let out = "";

  for (const char of name) {
    const cp = char.codePointAt(0);
    const stripped = STRIPPED_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
    if (!stripped) out += char;
  }

  return out;
}

export function sanitizeBaseName(name) {
  let clean = stripUnsafeChars(name)
    .replace(INVALID_CHARS, "_")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "")
    .replace(/[. ]+$/, "");

  if (WINDOWS_RESERVED.test(clean)) clean = `_${clean}`;
  if (clean.length > MAX_BASE_LENGTH) clean = clean.slice(0, MAX_BASE_LENGTH);

  return clean || "image";
}

export function getFileNameFromUrl(url, extension) {
  let base = "image";

  try {
    const parsed = new URL(url);

    // data: e blob: non hanno un nome utile, il pathname è l'intero payload.
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      const last = parsed.pathname.split("/").pop() || "";
      let decoded = last;
      try {
        decoded = decodeURIComponent(last);
      } catch {
        // sequenze percent malformate: si tiene il valore grezzo
      }
      base = decoded.replace(/\.[^.]+$/, "");
    }
  } catch {
    // URL non valido: si resta su "image"
  }

  return `${sanitizeBaseName(base)}.${extension}`;
}
