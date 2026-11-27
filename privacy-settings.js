"use strict";

const storageDialog = byId("storage-dialog");
const storageStatus = byId("storage-status");
const allowStorageButton = byId("allow-progress-storage");
const disableStorageButton = byId("disable-progress-storage");

function updateStorageSettings(message) {
  const enabled = progressStorage.allowed();
  byId("progress-storage-summary").textContent = enabled
    ? "Edistymisen tallennus on käytössä"
    : "Edistyminen näkyy tällä käyttökerralla";
  byId("progress-storage-detail").textContent = enabled
    ? "Opitut merkit ja parhaat ajotilannetulokset tallentuvat tähän selaimeen."
    : "Halutessasi voit säilyttää edistymisen seuraavaa käyntiä varten.";
  storageStatus.textContent = message ?? (enabled ? "Tallennus on käytössä." : "Tallennus on pois käytöstä.");
  allowStorageButton.hidden = enabled;
  disableStorageButton.textContent = enabled ? "Peru suostumus ja poista tiedot" : "Jatka ilman tallennusta";
}

function openStorageSettings() {
  updateStorageSettings();
  if (!storageDialog.open) storageDialog.showModal();
}

function chooseStorage(enabled) {
  if (!progressStorage.choose(enabled)) {
    updateStorageSettings(enabled
      ? "Selain ei salli tallennusta. Voit jatkaa harjoittelua tällä käyttökerralla."
      : "Selaintallennusta ei voitu tyhjentää. Voit poistaa Ajokoulun tiedot selaimesi sivustoasetuksista.");
  } else if (!enabled) {
    updateStorageSettings("Tallennus on pois käytöstä. Aiemmin tallennetut edistymistiedot on poistettu.");
  }
  storageStatus.focus();
}

for (const button of document.querySelectorAll("[data-storage-settings]")) {
  button.addEventListener("click", openStorageSettings);
}
allowStorageButton.addEventListener("click", () => chooseStorage(true));
disableStorageButton.addEventListener("click", () => chooseStorage(false));
window.addEventListener("progress-storage-change", () => updateStorageSettings());
window.addEventListener("focus", () => updateStorageSettings());

function openLinkedStorageSettings() {
  if (termsAccepted && location.hash === "#tallennusasetukset") openStorageSettings();
}

window.addEventListener("hashchange", openLinkedStorageSettings);
window.addEventListener("terms-accepted", openLinkedStorageSettings);
storageDialog.addEventListener("close", () => {
  if (location.hash !== "#tallennusasetukset") return;
  history.replaceState(history.state, "", location.pathname + location.search);
  document.querySelector(".brand").focus();
});

updateStorageSettings();
