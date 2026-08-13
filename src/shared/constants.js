// Formati supportati, con l'etichetta mostrata nel menu contestuale e l'estensione usata per il file salvato.

export const FORMAT_LABELS = {
  jpeg: "JPG",
  png: "PNG",
  webp: "WebP",
};

export const FORMAT_EXTENSIONS = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export const DEFAULTS = {
  saveMode: "menu",
  jpegQuality: 0.92,
  webpQuality: 0.9,
  theme: "auto",
};

export function isSupportedFormat(format) {
  return Object.hasOwn(FORMAT_LABELS, format);
}
