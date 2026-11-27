"use strict";

const theoryDialog = byId("theory-dialog");
const theoryContent = byId("theory-content");
const topicNames = new Map(theoryTopics.map(({ id, name }) => [id, name]));
const questionsByTopic = new Map(theoryTopics.map(({ id }) => [
  id, theoryQuestions.filter(question => question.topic === id),
]));
const mixedLength = 15;
const passReference = 11;
let theoryRound;

function selectTheoryQuestions(scope) {
  if (scope !== "mixed") return shuffle(questionsByTopic.get(scope));

  // Draw one random question from each topic, then fill the rest of the round.
  const representative = [...questionsByTopic.values()].map(questions => shuffle(questions)[0]);
  const remaining = theoryQuestions.filter(question => !representative.includes(question));
  return shuffle([...representative, ...shuffle(remaining).slice(0, mixedLength - representative.length)]);
}

function focusTheoryTitle() {
  theoryDialog.scrollTop = 0;
  byId("theory-title").focus({ preventScroll: true });
}

function showTheorySetup(scope = "mixed") {
  theoryRound = null;
  theoryContent.innerHTML = `
    <h2 id="theory-title" tabindex="-1">Valitse harjoitus</h2>
    <p>Tehtävät ovat Ajokoulun laatimia. Saat vastauksen jälkeen perustelun ja lähteen.</p>
    <form class="quiz-setup" id="theory-setup">
      <label for="theory-scope">Harjoituksen aihe
        <select id="theory-scope">
          <option value="mixed">Kaikki aiheet, sekaharjoitus</option>
          ${theoryTopics.map(({ id, name }) => `<option value="${id}">${escapeHtml(name)}</option>`).join("")}
        </select>
      </label>
      <p id="theory-count" role="status"></p>
      <button class="button button-primary" type="submit">${icon("play")} Aloita teoriaharjoitus</button>
    </form>`;

  const select = byId("theory-scope");
  function showQuestionCount() {
    const count = select.value === "mixed" ? mixedLength : questionsByTopic.get(select.value).length;
    byId("theory-count").textContent = `Kierroksella on ${count} kysymystä.`;
  }
  select.value = scope;
  select.addEventListener("change", showQuestionCount);
  byId("theory-setup").addEventListener("submit", event => {
    event.preventDefault();
    startTheoryRound(select.value);
  });
  showQuestionCount();
  if (!theoryDialog.open) theoryDialog.showModal();
  focusTheoryTitle();
}

function startTheoryRound(scope, retryQuestions) {
  theoryRound = {
    scope,
    review: Boolean(retryQuestions),
    questions: retryQuestions ? shuffle(retryQuestions) : selectTheoryQuestions(scope),
    index: 0,
    score: 0,
    mistakes: [],
    answered: false,
  };
  renderTheoryQuestion();
}

function renderTheoryQuestion() {
  const { index, score, questions } = theoryRound;
  const question = questions[index];
  const options = shuffle(question.choices.map((text, answer) => ({ text, answer })));
  theoryRound.answered = false;

  theoryContent.innerHTML = `
    <div class="quiz-status">
      <span>Kysymys ${index + 1} / ${questions.length}</span><span id="theory-score">Oikein ${score}</span>
    </div>
    <progress id="theory-progress" value="${index}" max="${questions.length}" aria-label="Vastatut teoriakysymykset"></progress>
    <p class="theory-topic">${escapeHtml(topicNames.get(question.topic))}</p>
    <h2 id="theory-title" class="theory-question" tabindex="-1">${escapeHtml(question.prompt)}</h2>
    <div class="answers" role="group" aria-labelledby="theory-title">
      ${options.map(({ text, answer }, position) => `<button class="answer" type="button" data-theory-answer="${answer}">
        <span class="answer-number" aria-hidden="true">${String.fromCharCode(65 + position)}</span>
        <span>${escapeHtml(text)}<span class="theory-answer-state"></span></span>
      </button>`).join("")}
    </div>
    <div class="quiz-feedback" id="theory-feedback" role="status" aria-atomic="true"></div>
    <button class="button button-primary quiz-next" id="theory-next" type="button" hidden>
      ${index + 1 === questions.length ? "Näytä tulos" : "Seuraava kysymys"}
    </button>`;

  theoryContent.querySelector(".answers").addEventListener("click", event => {
    const button = event.target.closest("[data-theory-answer]");
    if (button) answerTheoryQuestion(Number(button.dataset.theoryAnswer));
  });
  byId("theory-next").addEventListener("click", () => {
    theoryRound.index += 1;
    if (theoryRound.index < questions.length) renderTheoryQuestion();
    else renderTheoryResults();
  });
  focusTheoryTitle();
}

function answerTheoryQuestion(choice) {
  if (theoryRound.answered) return;
  const question = theoryRound.questions[theoryRound.index];
  const correct = choice === question.correct;
  theoryRound.answered = true;
  if (correct) theoryRound.score += 1;
  else theoryRound.mistakes.push(question);

  for (const button of theoryContent.querySelectorAll("[data-theory-answer]")) {
    const answer = Number(button.dataset.theoryAnswer);
    const label = button.querySelector(".theory-answer-state");
    button.setAttribute("aria-disabled", "true");
    if (answer === question.correct) {
      button.classList.add("correct");
      label.textContent = "Oikea vastaus";
    } else if (answer === choice) {
      button.classList.add("incorrect");
      label.textContent = "Valitsit tämän";
    }
  }

  const feedback = byId("theory-feedback");
  feedback.innerHTML = `<div class="feedback ${correct ? "correct" : "incorrect"}">
    <strong>${correct ? "Oikein!" : "Vastaus meni väärin."}</strong>
    ${correct ? "" : `<p>Oikea vastaus on ”${escapeHtml(question.choices[question.correct])}”</p>`}
    <p>${escapeHtml(question.explanation)}</p>
    <p class="theory-source"><a href="${escapeHtml(question.source.url)}" target="_blank" rel="noopener">${escapeHtml(question.source.label)}</a></p>
  </div>`;
  byId("theory-score").textContent = `Oikein ${theoryRound.score}`;
  byId("theory-progress").value = theoryRound.index + 1;
  byId("theory-next").hidden = false;
  feedback.scrollIntoView({ block: "nearest" });
}

function renderTheoryResults() {
  const { score, questions, mistakes, scope, review } = theoryRound;
  const reference = scope === "mixed" && !review
    ? `<p>B-luokan teoriakokeen sanallisessa osiossa vaaditaan ${passReference} oikeaa vastausta ${mixedLength}:stä.
        <a class="theory-source" href="${theoryRegulation}" target="_blank" rel="noopener">Traficomin teoriakoemääräys</a></p>`
    : "";
  theoryContent.innerHTML = `
    <h2 id="theory-title" tabindex="-1">${score} / ${questions.length} oikein</h2>
    ${reference}
    <p>${mistakes.length ? `Voit kerrata väärin vastatut tehtävät (${mistakes.length}).` : "Vastasit kaikkiin kierroksen kysymyksiin oikein."}</p>
    <div class="dialog-actions">
      ${mistakes.length ? '<button class="button button-primary" type="button" id="theory-retry">Kertaa virheet</button>' : ""}
      <button class="button ${mistakes.length ? "button-outline" : "button-primary"}" type="button" id="theory-new-round">Uusi kierros</button>
    </div>`;
  byId("theory-retry")?.addEventListener("click", () => startTheoryRound(scope, mistakes));
  byId("theory-new-round").addEventListener("click", () => showTheorySetup(scope));
  focusTheoryTitle();
}

byId("theory-bank-size").textContent = `${theoryQuestions.length} kysymystä · ${theoryTopics.length} aihepiiriä`;
byId("start-theory").addEventListener("click", event => {
  event.currentTarget.focus({ preventScroll: true });
  showTheorySetup();
});
