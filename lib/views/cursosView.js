/**
 * UNUmbral - Módulo Vista de Cursos (lib/views/cursosView.js)
 * Métricas académicas y formateo de estado para la vista de cursos y notas.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Views = root.Views || {};
    root.Views.Cursos = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function calcularEstadoAprobacion(evaluacion, cfg = {}) {
    const umbralAprobatorio = cfg.nota_aprobatoria || 10.5;
    const umbralRiesgo = cfg.nota_umbral_riesgo || 14;

    const p = evaluacion?.examen_parcial;
    const f = evaluacion?.examen_final;
    const practicas = evaluacion?.practicas || [];

    const practicasValidas = practicas
      .filter(x => x !== null && x !== undefined && !isNaN(Number(x)))
      .map(Number);

    const promP = practicasValidas.length > 0
      ? practicasValidas.reduce((a, b) => a + b, 0) / practicasValidas.length
      : null;

    let componentesCalificados = 0;
    let sumaPonderada = 0;

    if (p !== null && p !== undefined && !isNaN(Number(p))) {
      componentesCalificados++;
      sumaPonderada += Number(p);
    }
    if (f !== null && f !== undefined && !isNaN(Number(f))) {
      componentesCalificados++;
      sumaPonderada += Number(f);
    }
    if (promP !== null) {
      componentesCalificados++;
      sumaPonderada += promP;
    }

    if (componentesCalificados === 0) {
      return {
        acumulado: null,
        estado: "Sin notas",
        estadoClase: "sin-calificar",
        mensaje: "Registra tus evaluaciones para proyectar el curso."
      };
    }

    const acumulado = Number((sumaPonderada / 3).toFixed(2));
    if (componentesCalificados === 3) {
      const aprobado = acumulado >= umbralAprobatorio;
      return {
        acumulado,
        estado: aprobado ? "Aprobado" : "Desaprobado",
        estadoClase: aprobado ? "aprobado" : "desaprobado",
        mensaje: aprobado ? "¡Has alcanzado la nota aprobatoria!" : "Nota final debajo del umbral mínimo."
      };
    }

    const puntosRequeridos = Math.max(0, umbralAprobatorio * 3 - sumaPonderada);
    const faltantes = 3 - componentesCalificados;
    const notaNecesaria = Number((puntosRequeridos / faltantes).toFixed(2));
    const enRiesgo = notaNecesaria > umbralRiesgo;

    return {
      acumulado,
      estado: enRiesgo ? "En riesgo" : "En curso",
      estadoClase: enRiesgo ? "en-riesgo" : "en-curso",
      notaNecesaria,
      mensaje: `Necesitas ${notaNecesaria.toFixed(2)} en lo que falta para aprobar.`
    };
  }

  return {
    calcularEstadoAprobacion
  };
});
