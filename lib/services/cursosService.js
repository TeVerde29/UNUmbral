/**
 * UNUmbral - Servicio de Cursos (lib/services/cursosService.js)
 * Capa de repositorio desacoplada para gestión de cursos y asignaturas.
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CursosService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function generarId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "curso-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  }

  return {
    async obtenerTodos(db) {
      if (!db || !db.cursos) return [];
      return await db.cursos.toArray();
    },

    async obtenerPorId(db, id) {
      if (!db || !db.cursos || !id) return null;
      return await db.cursos.get(id);
    },

    async crear(db, curso) {
      if (!db || !db.cursos) throw new Error("Base de datos no inicializada");
      const nuevo = {
        id: curso.id || generarId(),
        nombre: (curso.nombre || "").trim() || "Nuevo Curso",
        color: curso.color || "#BAE6FD",
        creditos: Math.max(1, Math.min(10, Number(curso.creditos) || 3)),
        profesor: curso.profesor || "",
        aula: curso.aula || "",
        evaluacion: curso.evaluacion || {
          examen_parcial: null,
          examen_final: null,
          practicas: []
        },
        ciclo_academico: curso.ciclo_academico || null,
        tipo: curso.tipo || "Obligatorio"
      };
      await db.cursos.put(nuevo);
      return nuevo;
    },

    async actualizar(db, id, cambios) {
      if (!db || !db.cursos || !id) return false;
      await db.cursos.update(id, cambios);
      return true;
    },

    async eliminar(db, id) {
      if (!db || !db.cursos || !id) return false;
      // Eliminar curso y clases vinculadas
      await db.cursos.delete(id);
      if (db.clases) {
        const clasesVinculadas = await db.clases.where("curso_id").equals(id).toArray();
        for (const c of clasesVinculadas) {
          await db.clases.delete(c.id);
        }
      }
      return true;
    }
  };
});
