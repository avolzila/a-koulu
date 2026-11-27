"use strict";

const drivingDialog = byId("driving-dialog");
const drivingContent = byId("driving-content");
const drivingLawUrl = "https://www.finlex.fi/fi/lainsaadanto/2018/729";
let drivingRound;

function readDrivingBest() {
  const saved = progressStorage.read("driving");
  return Object.fromEntries(Object.entries(drivingTopics).flatMap(([id, topic]) => {
    const score = saved?.[id];
    return Number.isInteger(score) && score >= 0 && score <= topic.situations.length ? [[id, score]] : [];
  }));
}

let drivingBest = readDrivingBest();

function renderDrivingBest() {
  for (const [id, topic] of Object.entries(drivingTopics)) {
    const label = byId(`driving-best-${id}`);
    label.hidden = drivingBest[id] === undefined;
    label.textContent = label.hidden ? "" : `Paras tulos ${drivingBest[id]} / ${topic.situations.length}`;
  }
}

function recordDrivingBest() {
  const { topicId, score, review } = drivingRound;
  if (review) return;

  mergeDrivingBest();
  drivingBest[topicId] = Math.max(score, drivingBest[topicId] ?? 0);
  progressStorage.write("driving", drivingBest);
  renderDrivingBest();
}

function mergeDrivingBest() {
  for (const [id, value] of Object.entries(readDrivingBest())) {
    drivingBest[id] = Math.max(value, drivingBest[id] ?? 0);
  }
}

function lawLink(reference) {
  const entry = typeof reference === "number"
    ? { title: `${reference} §`, anchor: `chp_3__sec_${reference}` }
    : drivingLawReferences[reference];
  return `<a href="${drivingLawUrl}#${entry.anchor}" target="_blank" rel="noopener">${entry.title}</a>`;
}

function currentDrivingSituation() {
  return drivingRound.situations[drivingRound.index];
}

function orderedVehicles(order) {
  return order.join(" → ");
}

function focusDrivingHeading() {
  drivingDialog.scrollTop = 0;
  byId("driving-title").focus({ preventScroll: true });
}

function startDrivingRound(topicId, reviewSituations) {
  const topic = drivingTopics[topicId];
  drivingRound = {
    topicId,
    situations: reviewSituations ?? topic.situations,
    review: Boolean(reviewSituations),
    index: 0,
    score: 0,
    errors: [],
    selection: [],
    answered: false,
  };
  byId("driving-dialog-topic").textContent = topic.title;
  renderDrivingSituation();
  if (!drivingDialog.open) drivingDialog.showModal();
  focusDrivingHeading();
}

function drawing(situation) {
  const signs = (situation.map.signs ?? []).map(({ code, x, y, width }) => {
    const style = `left:${x / diagramWidth * 100}%;top:${y / diagramHeight * 100}%;width:${width / diagramWidth * 100}%`;
    return `<img class="driving-map-sign" src="${signImage(`${code}.svg`)}" alt="" style="${style}">`;
  }).join("");
  return `<div class="driving-map-wrap">
    <div class="driving-map ${situation.order ? "driving-map-selectable" : ""}" aria-hidden="true">
      <canvas id="driving-map-canvas" width="840" height="620"></canvas>${signs}
    </div>
    <p class="driving-map-caption">${situation.order ? "Nuolet näyttävät kulkusuunnat." : "Tilanne ylhäältä katsottuna."}</p>
  </div>`;
}

function laneOptions(situation) {
  return `<p class="driving-question" id="driving-question">${escapeHtml(situation.question)}</p>
    <div class="answers" role="group" aria-labelledby="driving-question">
      ${situation.options.map((option, index) => `<button type="button" class="answer" data-lane-answer="${index}">
        <span class="answer-number" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span>${escapeHtml(option)}<span class="driving-option-status"></span></span>
      </button>`).join("")}
    </div>`;
}

function junctionOptions(situation) {
  return `<p class="driving-question" id="driving-question">Missä järjestyksessä tienkäyttäjät kulkevat?</p>
    <p class="driving-instruction">Valitse ensin ajava ja sitten seuraavat. Voit valita kuvasta tai painikkeilla.</p>
    <div class="answers" role="group" aria-labelledby="driving-question">
      ${situation.map.vehicles.map(vehicle => `<button type="button" class="answer driving-vehicle" data-vehicle="${vehicle.id}" aria-pressed="false">
        <span class="driving-vehicle-id" data-vehicle-id="${vehicle.id}" aria-hidden="true">${vehicle.id}</span>
        <span><strong>${vehicle.id}</strong> · ${escapeHtml(vehicle.label)}</span>
        <span class="driving-slot" aria-hidden="true" hidden></span>
      </button>`).join("")}
    </div>
    <p class="driving-order-summary" id="driving-order-summary" role="status">Valittuja tienkäyttäjiä 0 / ${situation.order.length}.</p>
    <div class="driving-order-actions" id="driving-order-actions">
      <button type="button" id="check-driving-order" class="button button-primary" disabled>Tarkista järjestys</button>
      <button type="button" id="reset-driving-order" class="button button-outline" disabled>Tyhjennä</button>
    </div>`;
}

function renderDrivingSituation() {
  const { index, situations, score } = drivingRound;
  const situation = currentDrivingSituation();
  drivingRound.selection = [];
  drivingRound.answered = false;

  drivingContent.innerHTML = `
    <div class="quiz-status"><span>Tilanne ${index + 1} / ${situations.length}</span><span id="driving-score">Oikein ${score}</span></div>
    <progress id="driving-progress" value="${index}" max="${situations.length}" aria-label="Vastatut ajotilanteet"></progress>
    <h2 id="driving-title" tabindex="-1">${escapeHtml(situation.title)}</h2>
    <p class="driving-context">${escapeHtml(situation.context)}</p>
    <div class="driving-workspace">
      ${drawing(situation)}
      <div class="driving-answer-panel">
        ${situation.order ? junctionOptions(situation) : laneOptions(situation)}
      </div>
    </div>
    <div class="quiz-feedback" id="driving-feedback" role="status" aria-atomic="true"></div>
    <button id="driving-next" class="button button-primary quiz-next" type="button" hidden>
      ${index + 1 === situations.length ? "Näytä tulos" : "Seuraava tilanne"}
    </button>`;
  drawDrivingMap(byId("driving-map-canvas"), situation.map);
}

function updateDrivingSelection() {
  const { selection } = drivingRound;
  const situation = currentDrivingSituation();
  for (const button of drivingContent.querySelectorAll("[data-vehicle]")) {
    const position = selection.indexOf(button.dataset.vehicle);
    button.setAttribute("aria-pressed", String(position >= 0));
    const badge = button.querySelector(".driving-slot");
    badge.hidden = position < 0;
    badge.textContent = position + 1;
  }
  byId("driving-order-summary").textContent = selection.length
    ? `Valitsemasi järjestys ${orderedVehicles(selection)}.`
    : `Valittuja tienkäyttäjiä 0 / ${situation.order.length}.`;
  byId("reset-driving-order").disabled = selection.length === 0;
  byId("check-driving-order").disabled = selection.length !== situation.order.length;
  drawDrivingMap(byId("driving-map-canvas"), situation.map, selection);
}

function toggleDrivingVehicle(id) {
  const { selection } = drivingRound;
  const index = selection.indexOf(id);
  if (index < 0) selection.push(id);
  else selection.splice(index, 1);
  updateDrivingSelection();
}

function reportDrivingAnswer(correct, answerDetails) {
  const situation = currentDrivingSituation();
  drivingRound.answered = true;
  if (correct) drivingRound.score += 1;
  else drivingRound.errors.push(situation);

  const feedback = byId("driving-feedback");
  feedback.innerHTML = `<div class="feedback ${correct ? "correct" : "incorrect"}">
    <strong>${correct ? "Oikein!" : "Tämä meni väärin."}</strong>
    ${answerDetails}
    <p>${escapeHtml(situation.explanation)}</p>
    <p class="driving-source">Tieliikennelaki ${situation.law.map(lawLink).join(" · ")}</p>
  </div>`;
  byId("driving-score").textContent = `Oikein ${drivingRound.score}`;
  byId("driving-progress").value = drivingRound.index + 1;
  byId("driving-next").hidden = false;
  feedback.scrollIntoView({ block: "nearest" });
}

function gradeLaneAnswer(choice) {
  const situation = currentDrivingSituation();
  for (const button of drivingContent.querySelectorAll("[data-lane-answer]")) {
    const index = Number(button.dataset.laneAnswer);
    const label = button.querySelector(".driving-option-status");
    button.setAttribute("aria-disabled", "true");
    if (index === situation.correct) {
      button.classList.add("correct");
      label.textContent = "Oikea vastaus";
    } else if (index === choice) {
      button.classList.add("incorrect");
      label.textContent = "Valitsit tämän";
    }
  }
  const correct = choice === situation.correct;
  const details = correct ? "" : paragraphs([`Oikea vaihtoehto on ”${situation.options[situation.correct]}”.`]);
  reportDrivingAnswer(correct, details);
}

function gradeDrivingOrder() {
  const situation = currentDrivingSituation();
  const { selection } = drivingRound;
  if (selection.length !== situation.order.length) return;

  const correct = situation.order.every((id, index) => id === selection[index]);
  for (const button of drivingContent.querySelectorAll("[data-vehicle]")) {
    button.setAttribute("aria-disabled", "true");
  }
  // Retain the check button for focus until the user proceeds to the next situation.
  byId("check-driving-order").setAttribute("aria-disabled", "true");
  byId("reset-driving-order").disabled = true;
  reportDrivingAnswer(correct, paragraphs([`Oikea ajojärjestys ${orderedVehicles(situation.order)}.`]));
}

function renderDrivingResults() {
  const { score, situations, errors, review } = drivingRound;
  recordDrivingBest();
  drivingContent.innerHTML = `
    <h2 id="driving-title" tabindex="-1">${score} / ${situations.length} oikein</h2>
    ${errors.length ? `<p>Kertaa tilanteet, joissa vastaus meni väärin.</p>
      <ul class="quiz-results-list">${errors.map(situation => `<li>${escapeHtml(situation.title)}</li>`).join("")}</ul>`
      : "<p>Ratkaisit kaikki kierroksen tilanteet oikein.</p>"}
    <div class="dialog-actions">
      ${errors.length ? '<button type="button" class="button button-primary" id="review-driving">Kertaa virheet</button>' : ""}
      <button type="button" class="button ${errors.length ? "button-outline" : "button-primary"}" id="restart-driving">
        ${review ? "Aloita koko harjoitus" : "Harjoittele uudelleen"}
      </button>
      <button type="button" class="button button-outline" id="finish-driving">Palaa ajotilanteisiin</button>
    </div>`;
  focusDrivingHeading();
}

function vehicleAtPoint(event) {
  const { x, y, width, height } = event.target.getBoundingClientRect();
  const pointX = (event.clientX - x) / width * diagramWidth;
  const pointY = (event.clientY - y) / height * diagramHeight;
  return currentDrivingSituation().map.vehicles.find(vehicle => {
    const radians = vehicle.angle * Math.PI / 180;
    const dx = pointX - vehicle.x;
    const dy = pointY - vehicle.y;
    return Math.abs(dx * Math.cos(radians) + dy * Math.sin(radians)) <= 21 &&
      Math.abs(dy * Math.cos(radians) - dx * Math.sin(radians)) <= 29;
  });
}

for (const button of document.querySelectorAll("[data-start-driving]")) {
  button.addEventListener("click", () => {
    button.focus({ preventScroll: true });
    startDrivingRound(button.dataset.startDriving);
  });
}

for (const canvas of document.querySelectorAll("[data-driving-preview]")) {
  drawDrivingMap(canvas, drivingTopics[canvas.dataset.drivingPreview].situations[0].map);
}

drivingContent.addEventListener("click", event => {
  const button = event.target.closest("button");

  if (button?.id === "driving-next") {
    drivingRound.index += 1;
    if (drivingRound.index === drivingRound.situations.length) renderDrivingResults();
    else {
      renderDrivingSituation();
      focusDrivingHeading();
    }
    return;
  }
  if (button?.id === "review-driving") {
    startDrivingRound(drivingRound.topicId, drivingRound.errors);
    return;
  }
  if (button?.id === "restart-driving") {
    startDrivingRound(drivingRound.topicId);
    return;
  }
  if (button?.id === "finish-driving") {
    drivingDialog.close();
    return;
  }
  if (drivingRound.answered) return;

  if (button?.dataset.laneAnswer !== undefined) {
    gradeLaneAnswer(Number(button.dataset.laneAnswer));
  } else if (button?.dataset.vehicle) {
    toggleDrivingVehicle(button.dataset.vehicle);
  } else if (button?.id === "check-driving-order") {
    gradeDrivingOrder();
  } else if (button?.id === "reset-driving-order") {
    drivingRound.selection = [];
    updateDrivingSelection();
    drivingContent.querySelector("[data-vehicle]")?.focus();
  } else if (event.target.id === "driving-map-canvas" && currentDrivingSituation().order) {
    const vehicle = vehicleAtPoint(event);
    if (vehicle) toggleDrivingVehicle(vehicle.id);
  }
});

window.addEventListener("storage", event => {
  if (event.key !== progressStorage.keys.driving || !progressStorage.allowed()) return;
  drivingBest = readDrivingBest();
  renderDrivingBest();
});

window.addEventListener("progress-storage-change", ({ detail }) => {
  if (detail.enabled) mergeDrivingBest();
  if (detail.discardCurrent) drivingBest = {};
  if (detail.saveCurrent && Object.keys(drivingBest).length) progressStorage.write("driving", drivingBest);
  renderDrivingBest();
});

renderDrivingBest();
