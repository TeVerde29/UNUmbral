const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadAppContext() {
  const root = path.resolve(__dirname, "..");
  const code = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  function DummyDexie() {
    this.version = () => ({ stores: () => ({ upgrade: () => {} }) });
  }

  const sandbox = {
    window: { crypto: { randomUUID: () => "uuid-" + Math.random().toString(36).slice(2, 9) } },
    crypto: { randomUUID: () => "uuid-" + Math.random().toString(36).slice(2, 9) },
    document: {
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: { setAttribute: () => {} }
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    navigator: {},
    Dexie: DummyDexie,
    setInterval: () => {},
    setTimeout: () => {},
    clearTimeout: () => {},
    requestAnimationFrame: (fn) => fn(),
    console
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { sandbox, code, html };
}

test("DOM IDs referenced in app.js exist in index.html or dynamic templates", () => {
  const { code, html } = loadAppContext();
  const allDefinedIds = new Set([...(html + code).matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const jsIds = [...code.matchAll(/\$\("#([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
  const missing = jsIds.filter(id => !allDefinedIds.has(id));
  assert.deepEqual(missing, []);
});

test("to24Hour and formatTime12 handle 12h AM/PM and 24h formats", () => {
  const { sandbox } = loadAppContext();
  assert.equal(sandbox.to24Hour("08:00 AM"), "08:00");
  assert.equal(sandbox.to24Hour("12:00 PM"), "12:00");
  assert.equal(sandbox.to24Hour("12:00 AM"), "00:00");
  assert.equal(sandbox.to24Hour("05:20 PM"), "17:20");
  assert.equal(sandbox.to24Hour("19:50"), "19:50");
  assert.equal(sandbox.formatTime12("17:20"), "05:20 PM");
  assert.equal(sandbox.formatTime12("08:00"), "08:00 AM");
});

test("normalizarColorPastel converts legacy colors and blocks unsafe strings", () => {
  const { sandbox } = loadAppContext();
  assert.equal(sandbox.normalizarColorPastel("#38BDF8"), "#BAE6FD");
  assert.equal(sandbox.normalizarColorPastel("#F5D0FE"), "#F5D0FE");
  assert.equal(sandbox.normalizarColorPastel("red; position:fixed"), "#BAE6FD");
  assert.equal(sandbox.normalizarColorPastel(""), "#BAE6FD");
});

test("calcularRendimiento computes 0-20 scale and 10.5 threshold accurately", () => {
  const { sandbox } = loadAppContext();

  const r1 = sandbox.calcularRendimiento({ parcial: null, final: null, practicas: [] });
  assert.equal(r1.estado, "sin-notas");

  const r2 = sandbox.calcularRendimiento({
    parcial: 12,
    final: null,
    practicas: [{ id: "1", titulo: "P1", nota: 14 }, { id: "2", titulo: "P2", nota: 16 }]
  });
  assert.equal(r2.pp, 15);
  assert.equal(r2.faltantes, 1);
  assert.equal(r2.requerido, 4.5); // 31.5 - (12 + 15) = 4.5
  assert.equal(r2.estado, "en-curso");

  const r3 = sandbox.calcularRendimiento({
    parcial: 10,
    final: 11,
    practicas: [{ id: "1", titulo: "P1", nota: 10.5 }]
  });
  assert.equal(r3.promedio, 10.5);
  assert.equal(r3.estado, "aprobado");

  const r4 = sandbox.calcularRendimiento({
    parcial: 5,
    final: null,
    practicas: [{ id: "1", titulo: "P1", nota: 5 }]
  });
  assert.equal(r4.estado, "sin-opcion");
});

test("sanitizarCursoImportado clamps out-of-range grades and sanitizes colors", () => {
  const { sandbox } = loadAppContext();
  const clean = sandbox.sanitizarCursoImportado({
    nombre: " Redes ",
    color: "javascript:alert(1)",
    evaluacion: {
      parcial: 15,
      final: 25,
      practicas: [{ titulo: "Lab 1", nota: 18 }, { titulo: "Lab 2", nota: -3 }]
    }
  });
  assert.equal(clean.nombre, "Redes");
  assert.equal(clean.color, "#BAE6FD");
  assert.equal(clean.evaluacion.parcial, 15);
  assert.equal(clean.evaluacion.final, null);
  assert.equal(clean.evaluacion.practicas[0].nota, 18);
  assert.equal(clean.evaluacion.practicas[1].nota, null);
});

test("index.html defaults to light theme and correct theme-color", () => {
  const { html } = loadAppContext();
  assert.match(html, /<html\s+lang="es"\s+data-theme="light">/);
  assert.match(html, /<meta\s+name="theme-color"\s+content="#F4F6EE">/);
});

test("calcularLimitesTimeline adapts bounds to real class hours", () => {
  const { sandbox } = loadAppContext();
  const classes = [
    { hora_inicio: "08:00 AM", hora_fin: "10:30 AM" },
    { hora_inicio: "02:50 PM", hora_fin: "04:30 PM" },
    { hora_inicio: "05:20 PM", hora_fin: "07:00 PM" },
    { hora_inicio: "07:30 PM", hora_fin: "09:10 PM" }
  ];
  const bounds = sandbox.calcularLimitesTimeline(classes);
  assert.equal(bounds.startHour, 8);
  assert.equal(bounds.endHour, 22);
  assert.equal(bounds.totalHours, 14);

  const afternoonClasses = [
    { hora_inicio: "14:00", hora_fin: "18:00" },
    { hora_inicio: "18:30", hora_fin: "20:00" }
  ];
  const boundsAfternoon = sandbox.calcularLimitesTimeline(afternoonClasses);
  assert.equal(boundsAfternoon.startHour, 14);
  assert.equal(boundsAfternoon.endHour, 20);
});

test("computeDayEventPositions places irregular hours and handles parallel overlaps", () => {
  const { sandbox } = loadAppContext();
  const dayClasses = [
    { id: "c1", materia: "Matemática", hora_inicio: "02:50 PM", hora_fin: "04:30 PM" }
  ];
  const startHour = 8;
  const positions = sandbox.computeDayEventPositions(dayClasses, startHour, 1.0);
  assert.equal(positions.length, 1);
  assert.equal(positions[0].top, 410); // 14:50 (890 min) - 08:00 (480 min) = 410px
  assert.equal(positions[0].height, 98); // 100 min duration - 2px gap = 98px
  assert.equal(positions[0].leftStyle, "3px");
  assert.equal(positions[0].widthStyle, "calc(100% - 6px)");

  // Solapamiento: 2 clases a la misma hora
  const overlappingClasses = [
    { id: "o1", materia: "Teoría", hora_inicio: "10:00 AM", hora_fin: "12:00 PM" },
    { id: "o2", materia: "Laboratorio", hora_inicio: "11:00 AM", hora_fin: "01:00 PM" }
  ];
  const overlapPositions = sandbox.computeDayEventPositions(overlappingClasses, startHour, 1.0);
  assert.equal(overlapPositions.length, 2);
  assert.equal(overlapPositions[0].widthStyle, "calc(50% - 4px)");
  assert.equal(overlapPositions[1].widthStyle, "calc(50% - 4px)");
  assert.equal(overlapPositions[0].leftStyle, "calc(2px + 0%)");
  assert.equal(overlapPositions[1].leftStyle, "calc(2px + 50%)");
});


test("formatRelativeDue formats calendar days accurately avoiding premature 'Hoy'", () => {
  const { sandbox } = loadAppContext();
  const now = new Date();

  // Tarea de manana a las 11:00 AM (nunca debe decir 'Hoy' aunque falten menos de 24 horas)
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0, 0);
  const dueTomorrow = sandbox.formatRelativeDue(tomorrow.toISOString());
  assert.equal(dueTomorrow.text, "Mañana a las 11:00 AM");
  assert.equal(dueTomorrow.isUrgent, false);
  assert.equal(dueTomorrow.isSoon, true);

  // Tarea de ayer a las 10:00 AM
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 10, 0, 0);
  const dueYesterday = sandbox.formatRelativeDue(yesterday.toISOString());
  assert.equal(dueYesterday.text, "Atrasada ayer (10:00 AM)");
  assert.equal(dueYesterday.isUrgent, true);
});


test("formatRelativeDue formats today deadline as 'Hasta las HH:MM AM/PM'", () => {
  const { sandbox } = loadAppContext();
  // Simulate morning at 09:00 AM so 12:00 PM is later today
  const morningRef = new Date(2026, 9, 30, 9, 0, 0);
  const todayTarget = new Date(2026, 9, 30, 12, 0, 0);
  const due = sandbox.formatRelativeDue(todayTarget.toISOString(), morningRef);
  assert.equal(due.text, "Hasta las 12:00 PM");
  assert.equal(due.isUrgent, true);
});

test("formatearCuentaRegresivaEntrega formats 'Restan Xh Ymin Zseg' and handles deadlines correctly", () => {
  const { sandbox } = loadAppContext();

  // 2h 15min 8seg
  const res1 = sandbox.formatearCuentaRegresivaEntrega(2 * 3600 + 15 * 60 + 8);
  assert.equal(res1.text, "Restan 2h 15min 8seg");
  assert.equal(res1.urgencyClass, "urgent");
  assert.equal(res1.isOverdue, false);

  // 45min 12seg
  const res2 = sandbox.formatearCuentaRegresivaEntrega(45 * 60 + 12);
  assert.equal(res2.text, "Restan 45min 12seg");
  assert.equal(res2.urgencyClass, "urgent");

  // 30seg
  const res3 = sandbox.formatearCuentaRegresivaEntrega(30);
  assert.equal(res3.text, "Restan 30seg");
  assert.equal(res3.urgencyClass, "urgent");

  // 2d 3h 10min 5seg
  const res4 = sandbox.formatearCuentaRegresivaEntrega(2 * 86400 + 3 * 3600 + 10 * 60 + 5);
  assert.equal(res4.text, "Restan 2d 3h 10min 5seg");
  assert.equal(res4.urgencyClass, "normal");

  // Overdue
  const resOverdue = sandbox.formatearCuentaRegresivaEntrega(0);
  assert.equal(resOverdue.text, "Plazo culminado");
  assert.equal(resOverdue.isOverdue, true);
  assert.equal(resOverdue.urgencyClass, "overdue");
});

test("renderTaskCardHTML includes countdown badge and 'Hasta las' badge for today's tasks", () => {
  const { sandbox } = loadAppContext();
  // Reference at 09:00 AM on 2026-10-30, target at 12:00 PM (3 hours remaining)
  const morningRef = new Date(2026, 9, 30, 9, 0, 0);
  const todayDue = new Date(2026, 9, 30, 12, 0, 0).toISOString();

  const task = {
    id: "task-1",
    titulo: "Entrega de Carta de Aceptación",
    notas: "Entregar 3 juegos",
    materia: "Prácticas pre Profesionales 2",
    importancia: 5,
    fecha_limite: todayDue,
    completada: false
  };

  const html = sandbox.renderTaskCardHTML(task, morningRef);
  assert.match(html, /task-countdown-badge/);
  assert.match(html, /Restan /);
  assert.match(html, /Hasta las 12:00 PM/);

  // When completed, countdown badge is not rendered
  const completedTask = { ...task, completada: true };
  const completedHtml = sandbox.renderTaskCardHTML(completedTask);
  assert.doesNotMatch(completedHtml, /task-countdown-badge/);
});


test("safeHtml auto-escapes dynamic values and preserves rawHtml safely", () => {
  const { sandbox } = loadAppContext();
  const dangerousString = '<script>alert("xss")</script>';
  const safeBadge = sandbox.rawHtml('<span>Badge Seguro</span>');

  const result = sandbox.safeHtml`<div class="card">${dangerousString} - ${safeBadge}</div>`.toString();
  assert.match(result, /&lt;script&gt;alert\(&quot;xss&quot;\)&lt;\/script&gt;/);
  assert.match(result, /<span>Badge Seguro<\/span>/);
  assert.doesNotMatch(result, /<script>/);
});

test("renderTaskCardHTML utilizes safeHtml for automatic defense against malicious input", () => {
  const { sandbox } = loadAppContext();
  const maliciousTask = {
    id: "task-evil",
    titulo: 'Título Malicioso <img src=x onerror=alert(1)>',
    notas: 'Nota con <iframe src="evil.com"></iframe>',
    materia: 'Materia & <bold>',
    importancia: 4,
    fecha_limite: "2026-11-01T10:00:00.000Z",
    completada: false
  };

  const html = sandbox.renderTaskCardHTML(maliciousTask);
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /<iframe/);
  assert.match(html, /&lt;img src=x/);
  assert.match(html, /&lt;iframe/);
});
