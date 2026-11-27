"use strict";

const diagramWidth = 420;
const diagramHeight = 310;
const roadSurface = "#455653";
const roadEdge = "#abbba9";
const junctionCorner = 11;
const carColors = { A: "#1a5c96", B: "#9b3346", C: "#f1c052" };
const carText = { A: "#fff", B: "#fff", C: "#30291a" };

function drawDrivingMap(canvas, map, selection = []) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.save();
  context.setTransform(canvas.width / diagramWidth, 0, 0, canvas.height / diagramHeight, 0, 0);
  context.fillStyle = "#dfe9dc";
  context.fillRect(0, 0, diagramWidth, diagramHeight);

  function block(x, y, width, height, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    // Older Safari versions can draw the same corners using arcTo.
    if (typeof context.roundRect === "function") {
      context.roundRect(x, y, width, height, radius);
    } else {
      const right = x + width;
      const bottom = y + height;
      const corner = Math.min(radius, width / 2, height / 2);
      context.moveTo(x + corner, y);
      context.arcTo(right, y, right, bottom, corner);
      context.arcTo(right, bottom, x, bottom, corner);
      context.arcTo(x, bottom, x, y, corner);
      context.arcTo(x, y, right, y, corner);
      context.closePath();
    }
    context.fill();
  }

  function stroke(data, color, width, dash = []) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(dash);
    context.stroke(new Path2D(data));
    context.setLineDash([]);
  }

  function circle(x, y, radius, fill) {
    context.fillStyle = fill;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function text(label, x, y, fill, font) {
    context.fillStyle = fill;
    context.font = font;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, x, y + 1);
  }

  function number(label, x, y) {
    circle(x, y, 14, "#f6f8ed");
    text(label, x, y, "#233e33", "bold 17px system-ui");
  }

  function arrowHead(x, y, angle, color, size = 8) {
    context.save();
    context.translate(x, y);
    context.rotate(angle * Math.PI / 180);
    stroke(`M${-size} ${size} L0 0 L${size} ${size}`, color, 3);
    context.restore();
  }

  function road(path, width) {
    stroke(path, roadEdge, width + 16);
    stroke(path, roadSurface, width);
  }

  function roadArea(outline) {
    stroke(outline, roadEdge, 16);
    context.fillStyle = roadSurface;
    context.fill(new Path2D(outline));
  }

  function intersectionRoad({ left, right, top, bottom, north = true }) {
    const r = junctionCorner;
    const northEdge = north
      ? `H${left - r} Q${left} ${top} ${left} ${top - r}
         V-24 H${right} V${top - r} Q${right} ${top} ${right + r} ${top}`
      : "";
    roadArea(`M-24 ${top} ${northEdge} H444 V${bottom}
      H${right + r} Q${right} ${bottom} ${right} ${bottom + r}
      V334 H${left} V${bottom + r} Q${left} ${bottom} ${left - r} ${bottom} H-24 Z`);
  }

  function line(path) {
    stroke(path, "#dae4d9", 2.15, [10, 9]);
  }

  function way(path, x, y, rotation, color = "#f5f7ec") {
    stroke(path, color, 4.2);
    arrowHead(x, y, rotation, color);
  }

  for (const [x, y, radius] of [
    [27, 24, 8], [51, 45, 12], [31, 69, 7], [366, 39, 10], [388, 52, 8], [382, 21, 7],
    [34, 272, 10], [58, 249, 7], [65, 284, 10], [372, 278, 12], [392, 252, 7],
  ]) {
    circle(x + 3, y + 3, radius, "#c4d4c1");
    circle(x, y, radius, "#b4ccb0");
  }

  if (map.kind === "laneJunction") {
    const [first, second] = map.lanes;
    const twoWay = Boolean(map.markings);
    const left = twoWay ? 161 : 154;
    const right = twoWay ? 331 : 266;
    intersectionRoad({ left, right, top: 76, bottom: 164 });
    line(`M0 120 H${left - junctionCorner} M${right + junctionCorner} 120 H420`);
    if (twoWay) {
      line("M217 0 V65 M217 175 V310 M275 175 V310");
      way("M190 200 V226", 190, 226, 180, "#c7d3cb");
    } else {
      line("M210 0 V65 M210 175 V310");
    }
    if (map.markings) {
      way(`M${first} 230 V193`, first, 193, 0);
      way(`M${second} 230 V209 Q${second} 197 ${second + 9} 197 H${second + 17}`, second + 17, 197, 90);
    } else {
      way(`M${first} 230 V202`, first, 202, 0, "#c5d3c8");
      way(`M${second} 230 V202`, second, 202, 0, "#c5d3c8");
    }
  } else if (map.kind === "twoLanes") {
    road("M210 -100 V410", 136);
    line("M210 0 V310");
    for (const x of [176, 244]) way(`M${x} 100 V65`, x, 65, 0, "#cbd9ce");
  } else if (map.kind === "turnLanes") {
    intersectionRoad({ left: 163, right: 257, top: 67, bottom: 235, north: false });
    line("M0 147 H152 M268 147 H420 M210 246 V310 M268 191 H420");
    for (const [y, label] of [[169, 1], [213, 2]]) {
      way(`M313 ${y} H340`, 340, y, 90, "#dce6da");
      number(label, 376, y);
    }
  } else if (map.kind === "merge") {
    roadArea(`M-24 114 H444 V214 H360
      C251 214 193 235 123 336 H60
      C91 290 125 244 155 221 Q163 214 149 214 H-24 Z`);
    line("M0 164 H420 M173 214 H337");
    way("M288 136 H333", 333, 136, 90, "#dce6da");
    way("M288 191 H333", 333, 191, 90, "#dce6da");
  } else if (map.kind === "roundabout") {
    roadArea(`M168 -24 H252 V61 Q252 68 261 74
      A95 95 0 0 1 290 103 Q296 112 303 112 H444 V196 H303 Q296 196 290 205
      A95 95 0 0 1 261 234 Q252 240 252 247 V334 H168 V247 Q168 240 159 234
      A95 95 0 0 1 130 205 Q124 196 117 196 H-24 V112 H117 Q124 112 130 103
      A95 95 0 0 1 159 74 Q168 68 168 61 Z`);
    circle(210, 154, 53, roadEdge);
    circle(210, 154, 47, "#a9c2a2");
    circle(212, 153, 37, "#c9d9bf");
    line("M210 0 V57 M210 252 V310 M0 154 H109 M310 154 H420");
  } else {
    const parking = map.kind === "parking";
    if (parking) {
      block(115, 243, 192, 90, 14, roadEdge);
      block(122, 250, 178, 75, 11, "#627471");
      for (const x of [137, 156, 267, 287]) stroke(`M${x} 275 V310`, "#dce6da", 1.8);
    }
    intersectionRoad({ left: 163, right: 257, top: 108, bottom: 202, north: !parking });
    line("M0 155 H152 M268 155 H420 M210 213 V310");
    if (!parking) line("M210 0 V97");
    if (map.stopLine) stroke("M211 213 H255", "#f7f9ee", 4);
    if (map.kind === "crossing") {
      stroke("M319 55 V108 M319 202 V256", "#a4c9b0", 20);
      stroke("M319 109 V201", "#d7e6d5", 14, [3, 8]);
    }
  }

  map.lanes?.forEach((x, index) => number(index + 1, x, 272));

  for (const vehicle of map.vehicles ?? []) {
    const color = carColors[vehicle.id];
    if (vehicle.route) {
      stroke(vehicle.route, "#f5f7ec", 5);
      stroke(vehicle.route, color, 3, [6, 5]);
      const [x, y, angle] = vehicle.end;
      arrowHead(x, y, angle, "#fcfcf3", 7);
      arrowHead(x, y, angle, color, 5);
    }
  }

  for (const vehicle of map.vehicles ?? []) {
    const { id, x, y, angle, type } = vehicle;
    const color = carColors[id];
    const selected = selection.indexOf(id);
    context.save();
    context.translate(x, y);
    context.rotate(angle * Math.PI / 180);

    if (type === "bike") {
      context.rotate(-angle * Math.PI / 180);
      circle(0, 0, 16, "#f8f8ef");
      circle(0, 0, 13, color);
    } else {
      block(-16, -24, 32, 49, 9, "#263c38");
      block(-15, -26, 30, 51, 9, "#f8f8ef");
      block(-12.5, -23.5, 25, 46, 7, color);
      block(-10, -14, 20, 7, 2.5, "#e8f2ed");
      block(-9, 13, 18, 5, 2, "#293d3a");
      block(-9, -22, 4, 3, 1, "#fff4cc");
      block(5, -22, 4, 3, 1, "#fff4cc");
      context.rotate(-angle * Math.PI / 180);
    }

    text(id, 0, 0, carText[id], "bold 15px system-ui");
    if (selected >= 0) {
      circle(18, -18, 12, "#1c4936");
      text(selected + 1, 18, -18, "#fff", "bold 15px system-ui");
    }
    context.restore();
  }

  context.restore();
}
