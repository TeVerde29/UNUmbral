const test = require("node:test");
const assert = require("node:assert/strict");
const {
  promedioPracticas,
  calcularRendimientoDetallado,
  promedioPonderado,
  resumenPonderadoCompleto,
  simuladorMeta,
  generarSvgBarrasComparativas,
  generarSvgEvolucionCurso
} = require("../lib/rendimiento.js");

test("promedioPracticas calcula promedio vigesimal ignorando nulls", () => {
  const practicas = [
    { id: "1", nota: 14 },
    { id: "2", nota: null },
    { id: "3", nota: 16 }
  ];
  assert.equal(promedioPracticas(practicas), 15);
  assert.equal(promedioPracticas([]), null);
  assert.equal(promedioPracticas([{ nota: null }]), null);
});

test("calcularRendimientoDetallado calcula promedio vigesimal, acumulado y puntos requeridos", () => {
  // Caso 1: Todas las notas registradas
  // Parcial: 14, Final: 15, Prácticas: 13 -> Promedio: (14 + 15 + 13)/3 = 14
  const evCompleta = {
    parcial: 14,
    final: 15,
    practicas: [{ nota: 12 }, { nota: 14 }] // PP = 13
  };
  const r1 = calcularRendimientoDetallado(evCompleta);
  assert.equal(r1.completo, true);
  assert.equal(r1.promedio, 14);
  assert.equal(r1.aprobado, true);
  assert.equal(r1.estado, "aprobado");

  // Caso 2: Falta el final
  // Parcial: 11, PP: 12. Suma actual: 23. Meta: 31.5. Requerido en final: 8.5
  const evFaltaFinal = {
    parcial: 11,
    final: null,
    practicas: [{ nota: 12 }]
  };
  const r2 = calcularRendimientoDetallado(evFaltaFinal);
  assert.equal(r2.completo, false);
  assert.equal(r2.promedio, null);
  assert.equal(r2.acumulado, 7.67);
  assert.equal(r2.requeridoPorComponente, 8.5);
  assert.equal(r2.estado, "en-curso");

  // Caso 3: Desaprobado sin opción matemática
  // Parcial: 05, PP: 05. Suma: 10. Meta 31.5. Requerido en final: 21.5 (> 20)
  const evSinOpcion = {
    parcial: 5,
    final: null,
    practicas: [{ nota: 5 }]
  };
  const r3 = calcularRendimientoDetallado(evSinOpcion);
  assert.equal(r3.requeridoPorComponente, 21.5);
  assert.equal(r3.estado, "sin-opcion");
});

test("promedioPonderado calcula la media ponderada exacta según créditos", () => {
  const cursos = [
    { creditos: 4, evaluacion: { parcial: 15, final: 15, practicas: [{ nota: 15 }] } }, // 15 * 4 = 60
    { creditos: 3, evaluacion: { parcial: 12, final: 12, practicas: [{ nota: 12 }] } }, // 12 * 3 = 36
    { creditos: 2, evaluacion: { parcial: 18, final: 18, practicas: [{ nota: 18 }] } }  // 18 * 2 = 36
  ];
  // Total créditos = 9, Total puntos = 132 -> 132 / 9 = 14.67
  const pond = promedioPonderado(cursos);
  assert.equal(pond, 14.67);
});

test("simuladorMeta calcula nota uniforme requerida para alcanzar objetivo", () => {
  // Estudiante lleva 2 cursos de 3 créditos (Total 6 créditos). Meta: 15.0 (90 puntos ponderados)
  // Curso 1: Parcial 14, PP 14, falta Final. (Asegurado: 2 componentes de peso 1 = 28 pts)
  // Curso 2: Parcial 16, PP 16, falta Final. (Asegurado: 2 componentes de peso 1 = 32 pts)
  // Total asegurado = 60 pts. Faltan = 30 pts entre los 2 finales (peso 2).
  // Nota requerida uniforme = 30 / 2 = 15.0
  const cursos = [
    { creditos: 3, evaluacion: { parcial: 14, final: null, practicas: [{ nota: 14 }] } },
    { creditos: 3, evaluacion: { parcial: 16, final: null, practicas: [{ nota: 16 }] } }
  ];

  const sim = simuladorMeta(cursos, 15);
  assert.equal(sim.puntosPonderadosObjetivo, 90);
  assert.equal(sim.puntosPonderadosAsegurados, 60);
  assert.equal(sim.puntosPonderadosFaltantes, 30);
  assert.equal(sim.notaRequeridaUniforme, 15);
  assert.equal(sim.esFactible, true);
});

test("generarSvgBarrasComparativas y generarSvgEvolucionCurso devuelven SVG válido", () => {
  const cursos = [
    { nombre: "Cálculo II", promedio: 14.5, acumulado: 14.5, color: "#BAE6FD" },
    { nombre: "Física I", promedio: 9.8, acumulado: 9.8, color: "#FECDD3" }
  ];
  const svgBarras = generarSvgBarrasComparativas(cursos);
  assert.ok(svgBarras.includes("<svg"));
  assert.ok(svgBarras.includes("10.5 Mín."));
  assert.ok(svgBarras.includes("Cálculo II"));
  assert.ok(!svgBarras.includes("NaN"));

  // También debe soportar cursos crudos desde IndexedDB y objeto de opciones sin generar NaN
  const cursosCrudos = [
    { id: "1", nombre: "Auditoría y Sistemas", evaluacion: { parcial: null, final: null, practicas: [] } },
    { id: "2", nombre: "Formulación y Evaluación", evaluacion: { parcial: 14, final: null, practicas: [{ nota: 16 }] } }
  ];
  const svgCrudos = generarSvgBarrasComparativas(cursosCrudos, { width: 400, barHeight: 26 });
  assert.ok(svgCrudos.includes("<svg"));
  assert.ok(!svgCrudos.includes("NaN"));

  const curso = {
    nombre: "Cálculo II",
    evaluacion: { parcial: 14, final: 16, practicas: [{ nota: 13 }, { nota: 15 }] }
  };
  const svgEvolucion = generarSvgEvolucionCurso(curso);
  assert.ok(svgEvolucion.includes("<svg"));
  assert.ok(svgEvolucion.includes("polyline"));
  assert.ok(svgEvolucion.includes("Parcial"));
  assert.ok(!svgEvolucion.includes("NaN"));

  const svgConObjeto = generarSvgEvolucionCurso(curso, { width: 380, height: 160 });
  assert.ok(svgConObjeto.includes("<svg"));
  assert.ok(!svgConObjeto.includes("NaN"));
});
