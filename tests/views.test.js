const test = require("node:test");
const assert = require("node:assert/strict");

const TareasView = require("../lib/views/tareasView");
const CursosView = require("../lib/views/cursosView");
const HoyView = require("../lib/views/hoyView");
const HorarioView = require("../lib/views/horarioView");

test("TareasView filtra y clasifica tareas adecuadamente", () => {
  const now = new Date();
  const hoyStr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString();
  const semanaStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0).toISOString();
  const futuroStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15, 10, 0).toISOString();

  const tareas = [
    { id: "1", titulo: "Práctica Calificada 1", materia: "Algoritmos", importancia: 5, fecha_limite: hoyStr, completada: false },
    { id: "2", titulo: "Ensayo Filosófico", materia: "Filosofía", importancia: 2, fecha_limite: semanaStr, completada: true },
    { id: "3", titulo: "Proyecto Final", materia: "Algoritmos", importancia: 4, fecha_limite: futuroStr, completada: false }
  ];

  // Filtro por texto y pendientes
  const resQuery = TareasView.filtrarTareas(tareas, { filter: "pendientes", query: "Algoritmos" });
  assert.equal(resQuery.length, 2);

  // Clasificación por plazo
  const plazos = TareasView.clasificarPorPlazo(tareas);
  assert.equal(plazos.hoy.length, 1);
  assert.equal(plazos.hoy[0].id, "1");
  assert.equal(plazos.semana.length, 1);
  assert.equal(plazos.semana[0].id, "2");
  assert.equal(plazos.adelante.length, 1);
  assert.equal(plazos.adelante[0].id, "3");
});

test("CursosView calcula estados de aprobación y notas necesarias", () => {
  // Caso sin notas
  const resVacio = CursosView.calcularEstadoAprobacion({});
  assert.equal(resVacio.estado, "Sin notas");
  assert.equal(resVacio.acumulado, null);

  // Caso aprobado con 3 componentes: Parcial 16, Final 15, Prácticas [14, 16] (promedio 15) -> Acumulado = 15.33
  const resAprobado = CursosView.calcularEstadoAprobacion({
    examen_parcial: 16,
    examen_final: 15,
    practicas: [14, 16]
  });
  assert.equal(resAprobado.estado, "Aprobado");
  assert.equal(resAprobado.acumulado, 15.33);

  // Caso en riesgo: Parcial 05, Prácticas [06] -> acumulado bajo
  const resRiesgo = CursosView.calcularEstadoAprobacion({
    examen_parcial: 5,
    examen_final: null,
    practicas: [6]
  });
  assert.equal(resRiesgo.estado, "En riesgo");
  assert.ok(resRiesgo.notaNecesaria > 14);
});

test("HoyView determina saludos y clase activa", () => {
  assert.equal(HoyView.obtenerSaludo(8), "Buenos días");
  assert.equal(HoyView.obtenerSaludo(14), "Buenas tardes");
  assert.equal(HoyView.obtenerSaludo(21), "Buenas noches");

  const clases = [
    { id: "c1", materia: "Cálculo I", hora_inicio: "08:00", hora_fin: "10:00" },
    { id: "c2", materia: "Física I", hora_inicio: "10:30", hora_fin: "12:30" }
  ];

  // A las 09:00 (540 min), c1 está activa
  const resActiva = HoyView.determinarClaseActiva(clases, 540);
  assert.equal(resActiva.activa?.id, "c1");

  // A las 10:15 (615 min), ninguna activa, c2 es la próxima
  const resHueco = HoyView.determinarClaseActiva(clases, 615);
  assert.equal(resHueco.activa, null);
  assert.equal(resHueco.proxima?.id, "c2");
});

test("HorarioView calcula límites y porcentajes de posicionamiento", () => {
  const clases = [
    { hora_inicio: "07:30", hora_fin: "09:30" },
    { hora_inicio: "18:00", hora_fin: "20:00" }
  ];

  const limites = HorarioView.calcularLimitesTimeline(clases);
  assert.equal(limites.minHora, 6);
  assert.equal(limites.maxHora, 21);

  const pos = HorarioView.calcularPosicionClase(clases[0], 6, 15);
  assert.ok(pos.top > 0);
  assert.ok(pos.height > 0);
});
