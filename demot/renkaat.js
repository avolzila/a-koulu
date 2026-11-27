"use strict";

const reactionTime = 1;
const surfaces = {
  dry: { label: "Kuiva", deceleration: { summer: 9, winter: 7.5 } },
  wet: { label: "Märkä", deceleration: { summer: 6, winter: 4.5 } },
  ice: { label: "Jää", deceleration: { summer: 0.7, winter: 1.5 } },
  snow: { label: "Lumi", deceleration: { summer: 1.2, winter: 3 } }
};
const tyres = { summer: "Kesärenkaat", winter: "Talvirenkaat" };
const numberFormat = new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 1 });

const demo = document.getElementById("demo");
const controls = demo.querySelector("form");
const speedInput = document.getElementById("speed");
const results = demo.querySelector(".demo-results");
const axisLabels = document.querySelectorAll("#chart-axis span");
const chartRows = Array.from(demo.querySelectorAll(".chart-row"), row => ({
  tyre: row.dataset.tyre,
  total: row.querySelector(".chart-total"),
  reaction: row.querySelector(".reaction"),
  braking: row.querySelector(".braking")
}));

function distanceLabel(distance) {
  return `${numberFormat.format(distance)}\u00a0m`;
}

function stoppingDistances(metresPerSecond, deceleration) {
  const reaction = metresPerSecond * reactionTime;
  const braking = metresPerSecond ** 2 / (2 * deceleration);
  return { reaction, braking, total: reaction + braking };
}

function chartInterval(maximum) {
  const target = maximum / (axisLabels.length - 1);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  return [1, 2, 2.5, 5, 10].map(step => step * magnitude).find(step => step >= target);
}

function render(announce = false) {
  const speed = speedInput.valueAsNumber;
  const metresPerSecond = speed / 3.6;
  const surfaceKey = controls.elements.surface.value;
  const tyre = controls.elements.tyre.value;
  const visibility = Number(controls.elements.headlight.value);
  const surface = surfaces[surfaceKey];
  const summer = stoppingDistances(metresPerSecond, surface.deceleration.summer);
  const winter = stoppingDistances(metresPerSecond, surface.deceleration.winter);
  const distances = { summer, winter };
  const selected = distances[tyre];
  const speedLabel = `${speed} km/h`;
  const context = `${tyres[tyre]} · ${surface.label} · ${speedLabel}`;
  const step = chartInterval(Math.max(summer.total, winter.total, visibility));
  const chartMaximum = step * (axisLabels.length - 1);
  const intervalDistance = distanceLabel(step);
  const intervalTime = `${numberFormat.format(step / metresPerSecond)}\u00a0s`;

  speedInput.setAttribute("aria-valuetext", `${speed} kilometriä tunnissa`);
  document.getElementById("speed-value").textContent = speedLabel;
  results.dataset.surface = surfaceKey;
  document.getElementById("result-context").textContent = context;
  document.getElementById("total-distance").textContent = distanceLabel(selected.total);
  document.getElementById("reaction-distance").textContent = distanceLabel(selected.reaction);
  document.getElementById("braking-distance").textContent = distanceLabel(selected.braking);
  document.getElementById("visibility-distance").textContent = distanceLabel(visibility);
  results.style.setProperty("--visibility-position", `${100 * visibility / chartMaximum}%`);

  for (const row of chartRows) {
    const values = distances[row.tyre];
    row.total.textContent = distanceLabel(values.total);
    row.reaction.style.width = `${100 * values.reaction / chartMaximum}%`;
    row.braking.style.width = `${100 * values.braking / chartMaximum}%`;
  }
  axisLabels.forEach((label, index) => {
    label.textContent = index === axisLabels.length - 1 ? distanceLabel(chartMaximum) : numberFormat.format(index * step);
  });
  document.getElementById("chart-interval-distance").textContent = intervalDistance;
  document.getElementById("chart-interval-time").textContent = intervalTime;

  const longerWith = summer.total > winter.total ? "kesärenkailla" : "talvirenkailla";
  const difference = distanceLabel(Math.abs(summer.total - winter.total));
  document.getElementById("comparison-note").textContent = `Tällä nopeudella ja kelillä pysähtymismatka on ${longerWith} ${difference} pidempi.`;
  const visibilityDifference = Math.round((selected.total - visibility) * 10) / 10;
  let visibilityNote = "Valituilla renkailla pysähtymismatka ja havaintoetäisyys ovat mallissa yhtä pitkät.";
  if (visibilityDifference !== 0) {
    const comparison = visibilityDifference > 0 ? "pidempi" : "lyhyempi";
    visibilityNote = `Valituilla renkailla pysähtymismatka on mallissa ${distanceLabel(Math.abs(visibilityDifference))} ${comparison} kuin havaintoetäisyys.`;
  }
  document.getElementById("visibility-note").textContent = visibilityNote;
  const modelValues = document.getElementById("model-values");
  modelValues.textContent = `Valitun pinnan hidastuvuus mallissa on kesärenkailla ${numberFormat.format(surface.deceleration.summer)} m/s² ja talvirenkailla ${numberFormat.format(surface.deceleration.winter)} m/s².`;

  if (announce) {
    const intervalReadout = demo.querySelector(".chart-interval").textContent;
    document.getElementById("result-announcement").textContent =
      `${context}. Pysähtymismatka ${distanceLabel(selected.total)}, josta reaktiomatka ${distanceLabel(selected.reaction)} ja jarrutusmatka ${distanceLabel(selected.braking)}. Kesärenkailla yhteensä ${distanceLabel(summer.total)}. Talvirenkailla yhteensä ${distanceLabel(winter.total)}. Havaintoetäisyys ${distanceLabel(visibility)}. ${visibilityNote} ${intervalReadout}`;
  }
}

controls.addEventListener("submit", event => event.preventDefault());
speedInput.addEventListener("input", () => render());
controls.addEventListener("change", () => render(true));
window.addEventListener("pageshow", () => render());
render();
document.getElementById("model-values").hidden = false;
demo.hidden = false;
