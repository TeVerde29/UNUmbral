/**
 * UNUmbral - Módulo Vista Hoy (lib/views/hoyView.js)
 * Lógica de estado en vivo, saludos contextuales y tarjetas de clase activa.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Views = root.Views || {};
    root.Views.Hoy = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function obtenerSaludo(horaActual) {
    const h = typeof horaActual === "number" ? horaActual : new Date().getHours();
    if (h >= 5 && h < 12) return "Buenos días";
    if (h >= 12 && h < 19) return "Buenas tardes";
    return "Buenas noches";
  }

  function determinarClaseActiva(clasesHoy, minutosActuales, opciones = {}) {
    if (!clasesHoy || clasesHoy.length === 0) return { activa: null, proxima: null };

    const { fecha, excepciones = [], esClaseCancelada, esFeriado = false } = opciones;
    if (esFeriado) return { activa: null, proxima: null, esFeriado: true };

    const clasesValidas = (fecha && typeof esClaseCancelada === "function")
      ? clasesHoy.filter(c => !esClaseCancelada(c.id, c.curso_id, fecha, excepciones))
      : clasesHoy;

    if (clasesValidas.length === 0) return { activa: null, proxima: null, canceladas: true };

    function horaAMin(hhmm) {
      if (!hhmm) return 0;
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + (m || 0);
    }

    const activa = clasesValidas.find(c => {
      const s = horaAMin(c.hora_inicio);
      const e = horaAMin(c.hora_fin);
      return minutosActuales >= s && minutosActuales < e;
    }) || null;

    const proxima = !activa
      ? clasesValidas.find(c => horaAMin(c.hora_inicio) > minutosActuales) || null
      : null;

    return { activa, proxima };
  }

  return {
    obtenerSaludo,
    determinarClaseActiva
  };
});
