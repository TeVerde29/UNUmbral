/**
 * UNUmbral - Módulo Vista de Horario (lib/views/horarioView.js)
 * Algoritmos de cálculo de límites y posicionamiento temporal del horario semanal.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Views = root.Views || {};
    root.Views.Horario = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function horaAMinutos(hhmm) {
    if (!hhmm) return 0;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + (m || 0);
  }

  function calcularLimitesTimeline(clases) {
    let minHora = 7;
    let maxHora = 22;

    if (clases && clases.length > 0) {
      let earliest = 24 * 60;
      let latest = 0;
      for (const c of clases) {
        const s = horaAMinutos(c.hora_inicio);
        const e = horaAMinutos(c.hora_fin);
        if (s < earliest) earliest = s;
        if (e > latest) latest = e;
      }
      if (earliest < 24 * 60) {
        minHora = Math.max(5, Math.floor(earliest / 60) - 1);
        maxHora = Math.min(23, Math.ceil(latest / 60) + 1);
      }
    }

    return { minHora, maxHora };
  }

  function calcularPosicionClase(clase, minHora, totalHoras) {
    const s = horaAMinutos(clase.hora_inicio);
    const e = horaAMinutos(clase.hora_fin);
    const startOffsetMin = s - minHora * 60;
    const durMin = Math.max(15, e - s);
    const totalMin = totalHoras * 60;

    const topPct = (startOffsetMin / totalMin) * 100;
    const heightPct = (durMin / totalMin) * 100;

    return {
      top: Math.max(0, topPct),
      height: Math.max(2, heightPct)
    };
  }

  return {
    calcularLimitesTimeline,
    calcularPosicionClase
  };
});
