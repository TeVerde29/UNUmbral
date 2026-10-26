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
