/**
 * UNUmbral - Servicio de Asistencia (lib/services/asistenciaService.js)
 * Capa de repositorio desacoplada para gestión de faltas y métricas de asistencia.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AsistenciaService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function generarId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "asist-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  }

  return {
    async obtenerTodas(db) {
      if (!db || !db.asistencia) return [];
      return await db.asistencia.toArray();
    },

    async obtenerPorClase(db, claseId) {
      if (!db || !db.asistencia || !claseId) return [];
      return await db.asistencia.where("clase_id").equals(claseId).toArray();
    },

    async registrarFalta(db, claseId, fecha, motivo) {
      if (!db || !db.asistencia) throw new Error("Base de datos no inicializada");
      const nueva = {
        id: generarId(),
        clase_id: claseId,
        fecha: fecha,
        estado: "FALTA",
        motivo: motivo || ""
      };
      await db.asistencia.put(nueva);
      return nueva;
    },

    async eliminar(db, id) {
      if (!db || !db.asistencia || !id) return false;
      await db.asistencia.delete(id);
      return true;
    }
  };
});
