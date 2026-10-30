/**
 * UNUmbral - Módulo Vista de Tareas (lib/views/tareasView.js)
 * Filtrado, agrupamiento por plazos y formateo de tarjetas de tareas.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Views = root.Views || {};
    root.Views.Tareas = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function filtrarTareas(tareas, opciones = {}) {
    const { filter = "semana", query = "", materiaFilter = "" } = opciones;
    let resultado = tareas || [];

    if (materiaFilter) {
      resultado = resultado.filter(t => (t._subjectKey || t.curso_id) === materiaFilter);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      resultado = resultado.filter(t =>
        (t.titulo && t.titulo.toLowerCase().includes(q)) ||
        (t.notas && t.notas.toLowerCase().includes(q)) ||
        (t.materia && t.materia.toLowerCase().includes(q))
      );
    }

    if (filter === "pendientes") {
      resultado = resultado.filter(t => !t.completada);
    } else if (filter === "completadas") {
      resultado = resultado.filter(t => t.completada);
    } else if (filter === "criticas") {
      resultado = resultado.filter(t => !t.completada && (t.importancia === 4 || t.importancia === 5));
    }

    return resultado;
  }

  function clasificarPorPlazo(tareas) {
    const hoy = [];
    const semana = [];
    const adelante = [];
    const sinFecha = [];

    const now = new Date();
    const hoyMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    tareas.forEach(t => {
      if (!t.fecha_limite) {
        sinFecha.push(t);
        return;
      }
      const target = new Date(t.fecha_limite);
      if (isNaN(target.getTime())) {
        sinFecha.push(t);
        return;
      }
      const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
      const diffDays = Math.round((targetMidnight - hoyMidnight) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        hoy.push(t);
      } else if (diffDays <= 7) {
        semana.push(t);
      } else {
        adelante.push(t);
      }
    });

    return { hoy, semana, adelante, sinFecha };
  }

  return {
    filtrarTareas,
    clasificarPorPlazo
  };
});
