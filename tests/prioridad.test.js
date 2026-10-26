const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calcularUrgencia,
  puntajePrioridad,
  agruparSemana,
  generarMatrizMes
} = require("../lib/prioridad.js");

test("calcularUrgencia calcula valores de urgencia según cercanía al vencimiento", () => {
  const ref = new Date(2026, 9, 26, 12, 0, 0); // 26 Oct 2026 12:00

  // Vencida (-2 h) -> 10
  const vencida = new Date(2026, 9, 26, 10, 0, 0);
  assert.equal(calcularUrgencia(vencida, ref), 10);

  // En 6 horas (< 24 h) -> 8
  const en6h = new Date(2026, 9, 26, 18, 0, 0);
  assert.equal(calcularUrgencia(en6h, ref), 8);

  // En 36 horas (< 48 h) -> 6
  const en36h = new Date(2026, 9, 28, 0, 0, 0);
  assert.equal(calcularUrgencia(en36h, ref), 6);

  // En 60 horas (< 72 h) -> 4
  const en60h = new Date(2026, 9, 29, 0, 0, 0);
  assert.equal(calcularUrgencia(en60h, ref), 4);

  // En 5 días (< 7 días) -> 2
  const en5d = new Date(2026, 9, 31, 12, 0, 0);
  assert.equal(calcularUrgencia(en5d, ref), 2);

  // En 15 días (> 7 días) -> 0
  const en15d = new Date(2026, 10, 10, 12, 0, 0);
  assert.equal(calcularUrgencia(en15d, ref), 0);

  // Sin fecha -> 0
  assert.equal(calcularUrgencia(null, ref), 0);
});

test("puntajePrioridad aplica la fórmula importancia * 2 + urgencia", () => {
  const ref = new Date(2026, 9, 26, 12, 0, 0);

  // Tarea nivel 5 vence en 10h (urgencia 8): 5 * 2 + 8 = 18
  const t1 = { importancia: 5, fecha_limite: new Date(2026, 9, 26, 22, 0, 0).toISOString() };
  assert.equal(puntajePrioridad(t1, ref), 18);

  // Tarea nivel 3 vencida (urgencia 10): 3 * 2 + 10 = 16
  const t2 = { importancia: 3, fecha_limite: new Date(2026, 9, 25, 12, 0, 0).toISOString() };
  assert.equal(puntajePrioridad(t2, ref), 16);

  // Tarea nivel 1 en 10 días (urgencia 0): 1 * 2 + 0 = 2
  const t3 = { importancia: 1, fecha_limite: new Date(2026, 10, 10, 12, 0, 0).toISOString() };
  assert.equal(puntajePrioridad(t3, ref), 2);
});

test("agruparSemana clasifica y ordena tareas por prioridad ignorando completadas", () => {
  // Lunes 26 Oct 2026 a las 10:00 AM
  const ref = new Date(2026, 9, 26, 10, 0, 0);

  const tareas = [
    { id: "1", titulo: "Vencida crítica", importancia: 5, fecha_limite: "2026-10-25T18:00", completada: false },
    { id: "2", titulo: "Vencida leve", importancia: 2, fecha_limite: "2026-10-24T12:00", completada: false },
    { id: "3", titulo: "Completada (ignorar)", importancia: 5, fecha_limite: "2026-10-25T12:00", completada: true },
    { id: "4", titulo: "Para hoy tarde", importancia: 4, fecha_limite: "2026-10-26T20:00", completada: false },
    { id: "5", titulo: "Para mañana", importancia: 3, fecha_limite: "2026-10-27T15:00", completada: false },
    { id: "6", titulo: "Jueves de esta semana", importancia: 4, fecha_limite: "2026-10-29T10:00", completada: false },
    { id: "7", titulo: "Próximo mes", importancia: 5, fecha_limite: "2026-11-20T10:00", completada: false },
    { id: "8", titulo: "Sin fecha fija", importancia: 2, fecha_limite: "", completada: false }
  ];

  const grupos = agruparSemana(tareas, ref);

  assert.equal(grupos.vencidas.length, 2);
  assert.equal(grupos.vencidas[0].id, "1"); // Nivel 5 antes que nivel 2

  assert.equal(grupos.hoy.length, 1);
  assert.equal(grupos.hoy[0].id, "4");

  assert.equal(grupos.manana.length, 1);
  assert.equal(grupos.manana[0].id, "5");

  assert.equal(grupos.resto.length, 1);
  assert.equal(grupos.resto[0].id, "6");

  assert.equal(grupos.masAdelante.length, 1);
  assert.equal(grupos.masAdelante[0].id, "7");

  assert.equal(grupos.sinFecha.length, 1);
  assert.equal(grupos.sinFecha[0].id, "8");

  assert.equal(grupos.totalPendientes, 7);
});

test("generarMatrizMes produce cuadrícula válida de 7 columnas", () => {
  // Octubre 2026 (empieza en Jueves 1 Oct, termina en Sábado 31 Oct)
  const hoy = new Date(2026, 9, 26);
  const matriz = generarMatrizMes(2026, 10, hoy);

  // Longitud debe ser múltiplo de 7
  assert.equal(matriz.length % 7, 0);
  assert.ok(matriz.length >= 28 && matriz.length <= 42);

  // La primera celda debe ser Lunes (diaSemana 1)
  assert.equal(matriz[0].diaSemana, 1);

  // La última celda debe ser Domingo (diaSemana 7)
  assert.equal(matriz[matriz.length - 1].diaSemana, 7);

  // Debe marcar esHoy en 2026-10-26
  const celdaHoy = matriz.find(c => c.fecha === "2026-10-26");
  assert.ok(celdaHoy);
  assert.equal(celdaHoy.esHoy, true);
  assert.equal(celdaHoy.esDelMes, true);
});
