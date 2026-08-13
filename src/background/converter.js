// Conversione immagine.
// Tutto avviene nel service worker: la fetch, che con host_permissions non è soggetta alla CORS della pagina, e la ri-codifica via OffscreenCanvas.
// Il re-encode produce solo dati pixel, quindi metadati, payload appesi al file e polyglot non arrivano mai al disco.

export async function convertImage(url, format, quality) {
  const sourceBlob = await fetchImage(url);
  const bitmap = await decode(sourceBlob);

  try {
    return await encode(bitmap, format, quality);
  } finally {
    bitmap.close();
  }
}

async function fetchImage(url) {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.blob();
}

function decode(blob) {
  // "from-image" applica l'orientamento EXIF, che il re-encode scarterebbe.
  return createImageBitmap(blob, { imageOrientation: "from-image" });
}

async function encode(bitmap, format, quality) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");

  // JPEG non ha canale alpha, senza fondo la trasparenza diventa nera.
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(bitmap, 0, 0);

  const blob = await canvas.convertToBlob({
    type: `image/${format}`,
    quality: format === "png" ? undefined : quality,
  });

  // Se il browser non sa codificare il formato richiesto ripiega su PNG in silenzio.
  // Senza questo controllo il file avrebbe l'estensione sbagliata.
  if (blob.type !== `image/${format}`) {
    throw new Error(`Codifica ${format} non supportata dal browser`);
  }

  return blob;
}
