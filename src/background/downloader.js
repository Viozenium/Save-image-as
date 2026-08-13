// Consegna del blob convertito a chrome.downloads.

// URL.createObjectURL non è disponibile nei service worker, quindi il blob viene passato come data URL.

const CHUNK_SIZE = 0x8000;

export async function downloadBlob(blob, filename) {
  const url = await blobToDataUrl(blob);
  await chrome.downloads.download({ url, filename });
}

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());

  // La conversione avviene a blocchi, String.fromCharCode su un array intero supererebbe il limite di argomenti per immagini grandi.
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }

  return `data:${blob.type};base64,${btoa(binary)}`;
}
