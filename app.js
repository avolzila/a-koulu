"use strict";

const categories = [
  { id: "", label: "Kaikki", icon: "grid" },
  { id: "A", label: "Varoitusmerkit", icon: "warning" },
  { id: "B", label: "Etuajo-oikeus ja väistäminen", icon: "yield" },
  { id: "C", label: "Kiellot ja rajoitukset", icon: "ban" },
  { id: "D", label: "Määräysmerkit", icon: "direction" },
  { id: "E", label: "Sääntömerkit", icon: "rule" },
  { id: "F", label: "Opastusmerkit", icon: "sign" },
  { id: "G", label: "Palvelukohteiden opastus", icon: "sign" },
  { id: "H", label: "Lisäkilvet", icon: "extra" },
  { id: "I", label: "Muut liikennemerkit", icon: "sign" },
];

const featuredCodes = ["B6", "C32", "A11", "E1", "B5", "C17", "D5", "A17"];
const basicCodes = [
  ...featuredCodes, "A1", "A13", "A15", "A21", "A24", "A26", "A27", "B1", "B7", "C18", "C28",
  "C34", "C37", "C38", "D1", "D2", "D4", "D6", "E2", "E14", "E15", "E22", "E24", "H19", "H27",
];
const signsByCode = new Map(trafficSigns.map(sign => [sign.code, sign]));
const groupsById = new Map(categories.map(category => [category.id, category]));
const featured = featuredCodes.map(code => signsByCode.get(code));
const orderedSigns = [...featured, ...trafficSigns.filter(sign => !featuredCodes.includes(sign.code))];
const initialLimit = 8;
const morePerPage = 24;
const state = { category: "", learnedOnly: false, limit: initialLimit, detail: null, questionSet: null };
let learned = readLearned();

const byId = id => document.getElementById(id);
const grid = byId("sign-grid");
const search = byId("search");
const categoryList = byId("categories");
const signDialog = byId("sign-dialog");
const quizDialog = byId("quiz-dialog");
const quizContent = byId("quiz-content");
const progressDialog = byId("progress-dialog");

function readLearned() {
  const saved = progressStorage.read("learned");
  return new Set(Array.isArray(saved) ? saved.filter(code => signsByCode.has(code)) : []);
}

function saveLearned() {
  progressStorage.write("learned", learned.size ? [...learned] : null);
}

function icon(name) {
  return `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

function escapeHtml(value) {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, character => replacements[character]);
}

function signImage(filename) {
  return `./assets/signs/${filename}`;
}

function paragraphs(lines) {
  return lines.map(line => `<p>${escapeHtml(line)}</p>`).join("");
}

function groupOf(sign) {
  return sign.code[0];
}

function normalize(value) {
  return value.toLocaleLowerCase("fi").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function searchText(sign) {
  const variants = sign.images.map(([code, , label]) => `${code} ${label ?? ""}`).join(" ");
  return normalize(`${sign.code} ${sign.name} ${sign.search ?? ""} ${variants}`);
}

const searchable = new Map(trafficSigns.map(sign => [sign.code, searchText(sign)]));

function matchingImage(sign) {
  const query = normalize(search.value.trim());
  return sign.images.find(([code]) => code.includes(".") && normalize(code) === query) ?? sign.images[0];
}

function matchesSign(sign, words) {
  const haystack = searchable.get(sign.code);
  return words.every(word => {
    if (!/^[a-i]\d+(?:\.\d+)*$/.test(word)) return haystack.includes(word);
    return [sign.code, ...sign.images.map(([code]) => code)].some(code => normalize(code) === word);
  });
}

function signCard(sign) {
  const [imageCode, filename] = matchingImage(sign);
  const visibleCode = search.value.trim() ? imageCode : sign.code;
  const checked = learned.has(sign.code);
  return `<button class="sign-card" type="button" data-code="${sign.code}" data-group="${groupOf(sign)}">
    <span class="sign-stage">
      <img src="${signImage(filename)}" alt="" loading="lazy" decoding="async">
      ${checked ? `<span class="learned-badge">${icon("check")}<span class="sr-only">Opittu. </span></span>` : ""}
    </span>
    <span class="sign-card-label">
      <span><span class="sign-code">${visibleCode}</span><span class="card-name">${escapeHtml(sign.name)}</span></span>
      <span class="card-chevron">${icon("chevron")}</span>
    </span>
  </button>`;
}

function renderCatalog({ append = false } = {}) {
  const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
  const source = state.category || words.length ? trafficSigns : orderedSigns;
  const results = source.filter(sign =>
    (!state.category || groupOf(sign) === state.category) &&
    (!state.learnedOnly || learned.has(sign.code)) &&
    matchesSign(sign, words),
  );
  const visible = results.slice(0, state.limit);
  const previousCount = append ? grid.childElementCount : 0;

  if (append) {
    grid.insertAdjacentHTML("beforeend", visible.slice(previousCount).map(signCard).join(""));
    grid.children[previousCount]?.focus({ preventScroll: true });
  } else {
    grid.innerHTML = visible.map(signCard).join("");
  }

  for (const button of categoryList.querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(button.dataset.category === state.category));
  }
  byId("learned-filter").setAttribute("aria-pressed", String(state.learnedOnly));
  byId("catalog-count").textContent = results.length
    ? `Näytetään ${visible.length} / ${results.length} merkkiä`
    : "0 merkkiä";
  byId("pagination").hidden = visible.length >= results.length;
  byId("empty-state").hidden = results.length > 0;
  byId("empty-message").textContent = state.learnedOnly && !words.length && !state.category
    ? "Opittuja merkkejä ei vielä ole. Voit merkitä merkin opituksi avaamalla sen tiedot."
    : "Rajauksilla ei löytynyt merkkejä. Kokeile toista hakusanaa tai merkkiryhmää.";
}

function resetCatalogLimit() {
  state.limit = initialLimit;
  renderCatalog();
}

function setLearnedFilter(onlyLearned) {
  state.learnedOnly = onlyLearned;
  resetCatalogLimit();
}

function updateLearnedTotal() {
  byId("learned-total").textContent = learned.size === 1 ? "1 opittu merkki" : `${learned.size} opittua merkkiä`;
}

function setDetailImage(index) {
  const sign = state.detail;
  const [code, file, label] = sign.images[index];
  const image = byId("detail-image");
  image.src = signImage(file);
  image.alt = `${sign.name}, ${label ?? code}`;
  byId("detail-code").textContent = code === sign.code ? code : `${sign.code} · ${code}`;
  for (const button of byId("variant-list").querySelectorAll("button")) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.variant) === index));
  }
}

function updateLearnedButton() {
  const checked = learned.has(state.detail.code);
  const button = byId("toggle-learned");
  button.setAttribute("aria-pressed", String(checked));
  button.querySelector("span").textContent = checked ? "Opittu" : "Merkitse opituksi";
  button.setAttribute("aria-label", checked ? "Opittu, poista merkintä" : "Merkitse opituksi");
}

function showSign(sign, image = sign.images[0]) {
  state.detail = sign;
  const group = groupOf(sign);
  const law = sign.law ?? [];
  byId("sign-category").textContent = groupsById.get(group).label;
  byId("detail-display").dataset.group = group;
  byId("sign-title").textContent = sign.name;
  byId("sign-explanation").innerHTML = paragraphs(sign.tip ? [sign.tip] : law);
  byId("legal-text").hidden = !sign.tip || !law.length;
  byId("legal-text").open = false;
  byId("sign-law").innerHTML = paragraphs(sign.tip ? law : []);
  byId("sign-source").href = `https://www.finlex.fi/fi/lainsaadanto/2018/729#attachment_${categories.findIndex(category => category.id === group) + 2}`;

  byId("variants").hidden = sign.images.length < 2;
  byId("variant-list").innerHTML = sign.images.map(([code, file, customLabel], index) => {
    const label = customLabel ?? (code === sign.code ? `Kuva ${index + 1}` : code);
    return `<button type="button" data-variant="${index}" aria-pressed="false">
      <img src="${signImage(file)}" alt="" loading="lazy"><span>${escapeHtml(label)}</span>
    </button>`;
  }).join("");
  setDetailImage(Math.max(0, sign.images.indexOf(image)));
  updateLearnedButton();
  signDialog.scrollTop = 0;
  signDialog.showModal();
}

function refreshLearned(changedCode) {
  updateLearnedTotal();
  if (state.learnedOnly) {
    renderCatalog();
    return;
  }
  const card = grid.querySelector(`[data-code="${changedCode}"]`);
  if (card) card.outerHTML = signCard(signsByCode.get(changedCode));
}

function renderLearnedProgress() {
  byId("progress-description").textContent =
    `${learned.size} / ${trafficSigns.length} merkkiä opittu. Voit merkitä oppimasi merkit merkkikirjastossa.`;
  byId("progress-groups").innerHTML = categories.slice(1).map(({ id, label }) => {
    const group = trafficSigns.filter(sign => groupOf(sign) === id);
    const count = group.filter(sign => learned.has(sign.code)).length;
    return `<div><div class="progress-row"><span>${label}</span><span>${count} / ${group.length}</span></div>
      <progress value="${count}" max="${group.length}" aria-label="${label}"></progress></div>`;
  }).join("");
}

function showProgress() {
  renderLearnedProgress();
  progressDialog.showModal();
}

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function quizPool(selection) {
  if (selection === "basics") return basicCodes.map(code => signsByCode.get(code));
  return trafficSigns.filter(sign => selection === "all" || groupOf(sign) === selection);
}

function quizOptions(sign, pool) {
  const names = new Set([sign.name]);
  const candidates = [
    ...shuffle(pool.filter(candidate => groupOf(candidate) === groupOf(sign))),
    ...shuffle(pool),
    ...shuffle(trafficSigns),
  ];
  const distractors = [];
  for (const candidate of candidates) {
    if (names.has(candidate.name)) continue;
    names.add(candidate.name);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }
  return shuffle([sign, ...distractors]);
}

function focusQuizHeading() {
  quizDialog.scrollTop = 0;
  byId("quiz-title").focus({ preventScroll: true });
}

function showQuizSetup(selection = state.category || "basics") {
  state.questionSet = null;
  quizContent.innerHTML = `
    <h2 id="quiz-title" tabindex="-1">Tunnistatko merkin?</h2>
    <p>Valitse merkin oikea nimi. Saat jokaisesta vastauksesta palautteen ja näet lopuksi tuloksesi.</p>
    <form class="quiz-setup" id="quiz-setup">
      <label for="quiz-scope">Harjoituksen merkit
        <select id="quiz-scope">
          <option value="basics">Keskeiset liikennemerkit</option>
          <option value="all">Kaikki liikennemerkit</option>
          ${categories.slice(1).map(({ id, label }) => `<option value="${id}">${label}</option>`).join("")}
        </select>
      </label>
      <p id="quiz-length" role="status"></p>
      <button class="button button-primary" type="submit">${icon("play")} Aloita kierros</button>
    </form>`;
  const scope = byId("quiz-scope");
  const updateLength = () => {
    const count = Math.min(10, quizPool(scope.value).length);
    byId("quiz-length").textContent = `Kierroksella on ${count} kysymystä.`;
  };
  scope.value = selection;
  scope.addEventListener("change", updateLength);
  byId("quiz-setup").addEventListener("submit", event => {
    event.preventDefault();
    startRound(scope.value);
  });
  updateLength();
  if (!quizDialog.open) quizDialog.showModal();
  focusQuizHeading();
}

function startRound(selection, retry) {
  const pool = quizPool(selection);
  state.questionSet = {
    selection,
    questions: shuffle(retry ?? pool).slice(0, 10),
    pool,
    index: 0,
    answer: null,
    correct: 0,
    mistakes: [],
  };
  renderQuestion();
}

function renderQuestion() {
  const round = state.questionSet;
  const sign = round.questions[round.index];
  const [code, filename] = sign.images[0];
  round.answer = null;
  quizContent.innerHTML = `
    <div class="quiz-status"><span>Kysymys ${round.index + 1} / ${round.questions.length}</span><span>Oikein ${round.correct}</span></div>
    <progress value="${round.index}" max="${round.questions.length}" aria-label="Vastatut kysymykset"></progress>
    <div class="question-image"><img src="${signImage(filename)}" alt="Tunnistettava liikennemerkki. Tunnus ${code}."></div>
    <h2 id="quiz-title" tabindex="-1">Mikä liikennemerkki on kuvassa?</h2>
    <div class="answers" role="group" aria-labelledby="quiz-title">
      ${quizOptions(sign, round.pool).map((option, index) => `<button class="answer" data-answer="${option.code}" type="button">
        <span class="answer-number" aria-hidden="true">${index + 1}</span><span>${escapeHtml(option.name)}</span>
        <span class="sr-only" data-answer-status></span>
      </button>`).join("")}
    </div>
    <div class="quiz-feedback" id="quiz-feedback" role="status" aria-atomic="true"></div>
    <button id="quiz-next" class="button button-primary quiz-next" type="button" hidden>
      ${round.index + 1 === round.questions.length ? "Näytä tulos" : "Seuraava kysymys"}
    </button>`;
  byId("quiz-next").addEventListener("click", () => {
    round.index += 1;
    if (round.index < round.questions.length) renderQuestion();
    else renderResults();
  });
  focusQuizHeading();
}

function answerQuestion(code) {
  const round = state.questionSet;
  if (round.answer !== null) return;

  const sign = round.questions[round.index];
  const isCorrect = code === sign.code;
  round.answer = code;
  if (isCorrect) round.correct += 1;
  else round.mistakes.push(sign);

  for (const button of quizContent.querySelectorAll("[data-answer]")) {
    button.setAttribute("aria-disabled", "true");
    if (button.dataset.answer === sign.code) {
      button.classList.add("correct");
      button.querySelector("[data-answer-status]").textContent = " Oikea vastaus.";
    } else if (code === button.dataset.answer) {
      button.classList.add("incorrect");
      button.querySelector("[data-answer-status]").textContent = " Väärä vastaus.";
    }
  }

  const feedback = isCorrect ? `Oikein! ${sign.name}` : `Oikea vastaus on ${sign.name}.`;
  const explanation = sign.tip ?? sign.law?.[0];
  byId("quiz-feedback").innerHTML = `<div class="feedback ${isCorrect ? "correct" : "incorrect"}">
    <strong>${escapeHtml(feedback)}</strong>${explanation ? paragraphs([explanation]) : ""}
  </div>`;
  quizContent.querySelector("progress").value = round.index + 1;
  quizContent.querySelector(".quiz-status span:last-child").textContent = `Oikein ${round.correct}`;
  byId("quiz-next").hidden = false;
}

function renderResults() {
  const round = state.questionSet;
  quizContent.innerHTML = `
    <h2 id="quiz-title" tabindex="-1">${round.correct} / ${round.questions.length} oikein</h2>
    ${round.mistakes.length ? `<p>Kertaa kierroksella väärin menneet merkit.</p>
      <ul class="quiz-results-list">${round.mistakes.map(sign =>
        `<li><button type="button" data-review="${sign.code}">${sign.code} · ${escapeHtml(sign.name)}</button></li>`,
      ).join("")}</ul>` : "<p>Tunnistit kaikki kierroksen merkit.</p>"}
    <div class="dialog-actions">
      ${round.mistakes.length ? '<button type="button" id="quiz-retry" class="button button-primary">Kertaa virheet</button>' : ""}
      <button type="button" id="quiz-restart" class="button ${round.mistakes.length ? "button-outline" : "button-primary"}">Uusi kierros</button>
    </div>`;
  byId("quiz-retry")?.addEventListener("click", () => startRound(round.selection, round.mistakes));
  byId("quiz-restart").addEventListener("click", () => showQuizSetup(round.selection));
  focusQuizHeading();
}

categoryList.innerHTML = categories.map(({ id, icon: symbol, label }) =>
  `<button type="button" data-category="${id}" aria-pressed="false">${icon(symbol)} ${label}</button>`,
).join("");
categoryList.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  resetCatalogLimit();
});

search.addEventListener("input", resetCatalogLimit);
byId("learned-filter").addEventListener("click", () => setLearnedFilter(!state.learnedOnly));
byId("reset-filters").addEventListener("click", () => {
  search.value = "";
  state.category = "";
  setLearnedFilter(false);
  search.focus();
});
byId("show-more").addEventListener("click", () => {
  state.limit += morePerPage;
  renderCatalog({ append: true });
});
grid.addEventListener("click", event => {
  const card = event.target.closest("[data-code]");
  if (!card) return;
  const sign = signsByCode.get(card.dataset.code);
  showSign(sign, matchingImage(sign));
});
byId("variant-list").addEventListener("click", event => {
  const button = event.target.closest("[data-variant]");
  if (button) setDetailImage(Number(button.dataset.variant));
});
byId("toggle-learned").addEventListener("click", () => {
  const { code } = state.detail;
  if (learned.has(code)) learned.delete(code);
  else learned.add(code);
  saveLearned();
  updateLearnedButton();
  refreshLearned(code);
});
byId("show-progress").addEventListener("click", showProgress);
byId("show-learned").addEventListener("click", () => {
  progressDialog.close();
  state.category = "";
  search.value = "";
  setLearnedFilter(true);
  byId("merkkikirjasto").scrollIntoView();
  byId("learned-filter").focus({ preventScroll: true });
});

for (const button of document.querySelectorAll("[data-start-quiz]")) {
  button.addEventListener("click", () => showQuizSetup());
}
quizContent.addEventListener("click", event => {
  const answer = event.target.closest("[data-answer]");
  const review = event.target.closest("[data-review]");
  if (answer) answerQuestion(answer.dataset.answer);
  if (review) showSign(signsByCode.get(review.dataset.review));
});

for (const dialog of document.querySelectorAll("dialog")) {
  dialog.querySelector(".close-dialog").addEventListener("click", () => dialog.close());
}

function renderLearnedChange() {
  updateLearnedTotal();
  renderCatalog();
  if (signDialog.open) updateLearnedButton();
  if (progressDialog.open) renderLearnedProgress();
}

window.addEventListener("storage", event => {
  if (event.key !== progressStorage.keys.learned || !progressStorage.allowed()) return;
  learned = readLearned();
  renderLearnedChange();
});

window.addEventListener("progress-storage-change", ({ detail }) => {
  if (detail.enabled) learned = new Set([...readLearned(), ...learned]);
  if (detail.discardCurrent) learned.clear();
  if (detail.saveCurrent) saveLearned();
  renderLearnedChange();
});

signDialog.addEventListener("close", () => {
  if (quizDialog.open || document.activeElement !== document.body || !state.detail) return;
  (grid.querySelector(`[data-code="${state.detail.code}"]`) ?? byId("learned-filter")).focus();
});

byId("sign-total").textContent = `${trafficSigns.length} liikennemerkkiä`;
updateLearnedTotal();
renderCatalog();
