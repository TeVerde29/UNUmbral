/**
 * UNUmbral - Servicio de Tareas (lib/services/tareasService.js)
 * Capa de repositorio desacoplada para gestión de tareas académicas.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TareasService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function generarId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "task-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  }

  return {
    async obtenerTodas(db) {
      if (!db || !db.tareas) return [];
      return await db.tareas.toArray();
    },

    async obtenerPorId(db, id) {
      if (!db || !db.tareas || !id) return null;
      return await db.tareas.get(id);
    },

    async crear(db, tarea) {
      if (!db || !db.tareas) throw new Error("Base de datos no inicializada");
      const nueva = {
        id: tarea.id || generarId(),
        titulo: (tarea.titulo || "").trim() || "Nueva Tarea",
        notas: tarea.notas || "",
        materia: tarea.materia || "",
        curso_id: tarea.curso_id || null,
        importancia: Number(tarea.importancia) || 3,
        fecha_limite: tarea.fecha_limite || null,
        completada: Boolean(tarea.completada),
        creada_en: tarea.creada_en || new Date().toISOString(),
        enlace: tarea.enlace || ""
      };
      await db.tareas.put(nueva);
      return nueva;
    },

    async actualizar(db, id, cambios) {
      if (!db || !db.tareas || !id) return false;
      await db.tareas.update(id, cambios);
      return true;
    },

    async alternarEstado(db, id) {
      if (!db || !db.tareas || !id) return null;
      const tarea = await db.tareas.get(id);
      if (!tarea) return null;
      const siguienteEstado = !tarea.completada;
      await db.tareas.update(id, { completada: siguienteEstado });
      return siguienteEstado;
    },

    async eliminar(db, id) {
      if (!db || !db.tareas || !id) return false;
      await db.tareas.delete(id);
      return true;
    },

    async contarPendientes(db) {
      if (!db || !db.tareas) return 0;
      const todas = await db.tareas.toArray();
      return todas.filter(t => !t.completada).length;
    }
  };
});
