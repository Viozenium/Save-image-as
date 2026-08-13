// Notifiche all'utente.

const ICON_URL = "assets/icons/icon.png";

export async function notifyConversionFailed() {
  await chrome.notifications.create({
    type: "basic",
    iconUrl: ICON_URL,
    title: "Salvataggio non riuscito",
    message:
      "Impossibile convertire l'immagine. " +
      "Il file originale non è stato scaricato: senza conversione non può " +
      "essere reso sicuro.",
  });
}
