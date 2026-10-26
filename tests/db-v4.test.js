const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");

const { getAjustesDefaults, sanitizarAjustes } = require("../lib/ajustes.js");

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

test("getAjustesDefaults returns complete v4 settings defaults", () => {
  const defaults = getAjustesDefaults();
  assert.equal(defaults.ciclo_inicio, null);
  assert.equal(defaults.ciclo_fin, null);
  assert.deepEqual(defaults.aviso_clase_min, [30, 10]);
  assert.equal(defaults.resumen_activo, true);
  assert.equal(defaults.resumen_hora, "07:00");
  assert.equal(defaults.silencio_activo, true);
  assert.equal(defaults.silencio_desde, "22:00");
  assert.equal(defaults.silencio_hasta, "07:00");
  assert.equal(defaults.nivel5_ignora_silencio, true);
  assert.equal(defaults.limite_faltas_pct, 30);
  assert.equal(defaults.huecos_ventana_desde, "07:00");
  assert.equal(defaults.huecos_ventana_hasta, "22:00");
  assert.equal(defaults.huecos_min, 30);
  assert.equal(defaults.notif_clases, true);
  assert.equal(defaults.notif_tareas, true);
  assert.equal(defaults.notif_urgentes, true);
});

test("sanitizarAjustes validates types, clamps bounds, and handles null/missing", () => {
  const clean = sanitizarAjustes({
    ciclo_inicio: "2026-03-15",
    ciclo_fin: "invalid-date",
    limite_faltas_pct: 120, // should clamp or ignore
    aviso_clase_min: [45, "invalid", 15],
    resumen_hora: "06:30"
  });

  assert.equal(clean.ciclo_inicio, "2026-03-15");
  assert.equal(clean.ciclo_fin, null); // rejected invalid date
  assert.equal(clean.limite_faltas_pct, 30); // preserved default because > 100
  assert.deepEqual(clean.aviso_clase_min, [45, 15]);
  assert.equal(clean.resumen_hora, "06:30");
});

test("sanitizarCursoImportado handles creditos (defaults to 3) and optional evaluation dates", () => {
  const { sandbox } = loadAppContext();
  const c1 = sandbox.sanitizarCursoImportado({
    nombre: "Cálculo II",
    color: "#BAE6FD"
  });
  assert.equal(c1.creditos, 3);
  assert.equal(c1.evaluacion.fecha_parcial, null);
  assert.equal(c1.evaluacion.fecha_final, null);

  const c2 = sandbox.sanitizarCursoImportado({
    nombre: "Física III",
    creditos: 5,
    evaluacion: {
      parcial: 14,
      fecha_parcial: "2026-05-10",
      practicas: [
        { titulo: "Lab 1", nota: 16, fecha: "2026-04-02" }
      ]
    }
  });
  assert.equal(c2.creditos, 5);
  assert.equal(c2.evaluacion.fecha_parcial, "2026-05-10");
  assert.equal(c2.evaluacion.practicas[0].fecha, "2026-04-02");
});

test("DOM IDs in app.js for ajustes and creditos exist in index.html", () => {
  const { code, html } = loadAppContext();
  const allDefinedIds = new Set([...(html + code).matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  const requiredIds = [
    "ajuste-ciclo-inicio",
    "ajuste-ciclo-fin",
    "ajuste-limite-faltas",
    "ajuste-notif-clases",
    "ajuste-notif-tareas",
    "ajuste-notif-urgentes",
    "ajuste-nivel5-silencio",
    "ajuste-resumen-activo",
    "ajuste-resumen-hora",
    "ajuste-silencio-desde",
    "ajuste-silencio-hasta",
    "ajuste-huecos-desde",
    "ajuste-huecos-hasta",
    "ajuste-huecos-min",
    "btn-save-ajustes",
    "curso-creditos"
  ];
  for (const id of requiredIds) {
    assert.ok(allDefinedIds.has(id), `Missing ID: ${id}`);
  }
});
