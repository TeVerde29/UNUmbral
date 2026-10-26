const test = require("node:test");
const assert = require("node:assert/strict");
const {
  horaAMinutos,
  minutosAHora,
  minutosAHora12,
  formatearDuracion,
  huecosDelDia,
  sugerirTareas
} = require("../lib/huecos.js");

test("horaAMinutos y conversiones de hora manejan 24h y 12h AM/PM", () => {
  assert.equal(horaAMinutos("08:00"), 480);
  assert.equal(horaAMinutos("08:00 AM"), 480);
  assert.equal(horaAMinutos("12:00 PM"), 720);
  assert.equal(horaAMinutos("02:30 PM"), 870);
  assert.equal(horaAMinutos("14:30"), 870);

  assert.equal(minutosAHora(480), "08:00");
  assert.equal(minutosAHora(870), "14:30");
  assert.equal(minutosAHora12(480), "08:00 AM");
  assert.equal(minutosAHora12(870), "02:30 PM");
  assert.equal(formatearDuracion(45), "45 min");
  assert.equal(formatearDuracion(90), "1 h 30 min");
  assert.equal(formatearDuracion(120), "2 h");
});

test("huecosDelDia detecta intervalos libres entre clases (con 0, 1 y varias clases)", () => {
  // 0 clases -> sin huecos entre clases
  assert.deepEqual(huecosDelDia([]), []);

  // 1 clase -> sin huecos entre clases si soloEntreClases es true
  assert.deepEqual(huecosDelDia([{ id: "c1", hora_inicio: "08:00", hora_fin: "10:00" }]), []);

  // 2 clases con hueco de 2 horas (10:00 a 12:00)
  const clases = [
    { id: "c1", hora_inicio: "08:00", hora_fin: "10:00" },
    { id: "c2", hora_inicio: "12:00", hora_fin: "14:00" }
  ];
  const huecos = huecosDelDia(clases);
  assert.equal(huecos.length, 1);
  assert.equal(huecos[0].inicio, "10:00");
  assert.equal(huecos[0].fin, "12:00");
  assert.equal(huecos[0].duracionMinutos, 120);

  // Clases continuas (08:00-10:00 y 10:00-12:00) -> 0 huecos
  const continuas = [
    { id: "c1", hora_inicio: "08:00", hora_fin: "10:00" },
    { id: "c2", hora_inicio: "10:00", hora_fin: "12:00" }
  ];
  assert.deepEqual(huecosDelDia(continuas), []);

  // Clases superpuestas (08:00-11:00 y 10:00-12:00) -> 0 huecos
  const superpuestas = [
    { id: "c1", hora_inicio: "08:00", hora_fin: "11:00" },
    { id: "c2", hora_inicio: "10:00", hora_fin: "12:00" }
  ];
  assert.deepEqual(huecosDelDia(superpuestas), []);

  // Hueco menor al mínimo de 30 minutos (ej: 15 min entre 10:00 y 10:15) no se incluye
  const clasesConHuecoCorto = [
    { id: "c1", hora_inicio: "08:00", hora_fin: "10:00" },
    { id: "c2", hora_inicio: "10:15", hora_fin: "12:00" }
  ];
  assert.deepEqual(huecosDelDia(clasesConHuecoCorto, { minMinutos: 30 }), []);
});

test("huecosDelDia amplía o crea huecos cuando una clase intermedia está cancelada", () => {
  const clases = [
    { id: "c1", hora_inicio: "08:00", hora_fin: "10:00" },
    { id: "c2", hora_inicio: "10:00", hora_fin: "12:00" }, // cancelada
    { id: "c3", hora_inicio: "14:00", hora_fin: "16:00" }
  ];

  const excepciones = [
    { id: "ex1", tipo: "cancelada", clase_id: "c2", fecha: "2026-10-27" }
  ];

  // Si c2 no estuviera cancelada: hueco entre c2 y c3 sería 12:00-14:00 (120 min)
  // Al estar c2 cancelada: el hueco debe ser de 10:00 a 14:00 (240 min)
  const huecos = huecosDelDia(clases, {
    fecha: "2026-10-27",
    excepciones
  });

  assert.equal(huecos.length, 1);
  assert.equal(huecos[0].inicio, "10:00");
  assert.equal(huecos[0].fin, "14:00");
  assert.equal(huecos[0].duracionMinutos, 240);
});

test("sugerirTareas filtra por tiempo estimado y ordena por prioridad alta", () => {
  const now = new Date("2026-10-26T09:00:00Z");

  const tareas = [
    {
      id: "t1",
      titulo: "Tarea rápida completada",
      completada: true,
      estimado_min: 15,
      importancia: 5
    },
    {
      id: "t2",
      titulo: "Tarea larga que no cabe",
      completada: false,
      estimado_min: 120, // 2 h
      importancia: 5
    },
    {
      id: "t3",
      titulo: "Tarea baja prioridad pero cabe",
      completada: false,
      estimado_min: 30,
      importancia: 1, // prioridad baja
      fecha_limite: "2026-11-10T23:59:00Z"
    },
    {
      id: "t4",
      titulo: "Proyecto crítico urgente que cabe",
      completada: false,
      estimado_min: 60,
      importancia: 5, // prioridad muy alta
      fecha_limite: "2026-10-26T20:00:00Z" // vence hoy
    },
    {
      id: "t5",
      titulo: "Lectura mediana (por defecto 45 min)",
      completada: false,
      estimado_min: null, // por defecto 45 min
      importancia: 3,
      fecha_limite: "2026-10-27T10:00:00Z"
    }
  ];

  const hueco = { inicio: "10:00", fin: "11:30", duracionMinutos: 90 };
  const sugeridas = sugerirTareas(hueco, tareas, now);

  // Deben ser máximo 3
  assert.ok(sugeridas.length <= 3);

  // La primera debe ser t4 (prioridad alta y vence hoy)
  assert.equal(sugeridas[0].id, "t4");

  // La completada t1 y la demasiado larga t2 no deben estar
  assert.ok(!sugeridas.some(t => t.id === "t1"));
  assert.ok(!sugeridas.some(t => t.id === "t2"));

  // t5 y t3 deben estar presentes en orden
  assert.equal(sugeridas[1].id, "t5");
  assert.equal(sugeridas[2].id, "t3");
});
