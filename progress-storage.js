"use strict";

const progressStorage = (() => {
  const consentKey = "ajokoulu.tallennuslupa.v1";
  const keys = { learned: "ajokoulu.opitut.v1", driving: "ajokoulu.ajotilanteet.v1" };
  const lifetime = 180 * 24 * 60 * 60 * 1000;

  function clear() {
    localStorage.removeItem(consentKey);
    for (const key of Object.values(keys)) localStorage.removeItem(key);
  }

  function allowed() {
    try {
      const expiry = Number(localStorage.getItem(consentKey));
      if (!Number.isFinite(expiry) || expiry <= 0) return false;
      if (expiry > Date.now()) return true;
      clear();
    } catch {
      // Practice can continue in memory if the browser blocks storage.
    }
    return false;
  }

  function notify(enabled, options) {
    window.dispatchEvent(new CustomEvent("progress-storage-change", { detail: { enabled, ...options } }));
  }

  function choose(enabled) {
    const wasEnabled = allowed();
    try {
      if (enabled) localStorage.setItem(consentKey, String(Date.now() + lifetime));
      else clear();
    } catch {
      return false;
    }
    notify(enabled, { saveCurrent: enabled, discardCurrent: wasEnabled && !enabled });
    return true;
  }

  function read(type) {
    if (!allowed()) return null;
    try {
      return JSON.parse(localStorage.getItem(keys[type]));
    } catch {
      return null;
    }
  }

  function write(type, value) {
    if (!allowed()) return;
    try {
      if (value === null) localStorage.removeItem(keys[type]);
      else localStorage.setItem(keys[type], JSON.stringify(value));
    } catch {
      // Practice can continue in memory if the browser blocks storage.
    }
  }

  window.addEventListener("storage", event => {
    if (event.key !== consentKey && event.key !== null) return;
    const enabled = allowed();
    notify(enabled, { discardCurrent: !enabled });
  });

  return { allowed, choose, keys, read, write };
})();
