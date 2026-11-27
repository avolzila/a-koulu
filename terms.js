"use strict";

const termsDialog = byId("terms-dialog");
const termsForm = byId("terms-acceptance");
const termsConfirmation = byId("terms-confirmation");
const acceptTerms = byId("accept-terms");
const closeTerms = termsDialog.querySelector(".close-dialog");
let termsAccepted = false;

function showTerms() {
  termsForm.hidden = termsAccepted;
  byId("terms-scroll-hint").hidden = termsAccepted;
  closeTerms.hidden = !termsAccepted;
  termsDialog.showModal();
  termsDialog.scrollTop = 0;
  byId("terms-title").focus({ preventScroll: true });
}

termsConfirmation.checked = false;
acceptTerms.disabled = true;
termsConfirmation.addEventListener("change", () => {
  acceptTerms.disabled = !termsConfirmation.checked;
});

termsDialog.addEventListener("cancel", event => {
  if (!termsAccepted) event.preventDefault();
});

termsForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!termsConfirmation.checked || termsAccepted) return;

  termsAccepted = true;
  for (const element of document.querySelectorAll("[data-terms-gated]")) element.removeAttribute("inert");
  termsDialog.close();

  const anchor = byId(location.hash.slice(1));
  const landing = anchor?.closest("[data-terms-gated]") ? anchor : null;
  const heading = landing?.querySelector("h1, h2") ?? byId("main-title");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  landing?.scrollIntoView();

  window.dispatchEvent(new Event("terms-accepted"));
});

byId("show-terms").addEventListener("click", showTerms);
showTerms();
