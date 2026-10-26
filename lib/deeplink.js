/**
 * UNUmbral — lib/deeplink.js
 * Parseo y enrutamiento puro de deep links, accesos rápidos (shortcuts) y hashes.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.UNUmbralDeepLink = mod;
    Object.assign(root, mod);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /**
   * Parsea una URL o hash de deep link en una acción canónica.
   *
   * @param {string} url - URL nativa (ej: "unumbral://nueva-tarea") o hash web (ej: "#nueva-tarea")
   * @returns {{ accion: "nueva-tarea" | "hoy" | "horario" | "cursos" | "tareas" | "ajustes" | "ninguna", original: string }}
   */
  function parsearRutaDeepLink(url) {
    if (!url || typeof url !== "string") {
      return { accion: "ninguna", original: "" };
    }

    const s = url.trim().toLowerCase();

    if (s.includes("nueva-tarea") || s.includes("new-task") || s.includes("nueva_tarea")) {
      return { accion: "nueva-tarea", original: url };
    }
    if (s.includes("hoy") || s.includes("today")) {
      return { accion: "hoy", original: url };
    }
    if (s.includes("horario") || s.includes("schedule")) {
      return { accion: "horario", original: url };
    }
    if (s.includes("cursos") || s.includes("courses")) {
      return { accion: "cursos", original: url };
    }
    if (s.includes("tareas") || s.includes("tasks")) {
      return { accion: "tareas", original: url };
    }
    if (s.includes("ajustes") || s.includes("settings")) {
      return { accion: "ajustes", original: url };
    }

    return { accion: "ninguna", original: url };
  }

  /**
   * Ejecuta el manejador correspondiente a la ruta deep link parseada.
   */
  function ejecutarAccionDeepLink(ruta, manejadores = {}) {
    if (!ruta || !ruta.accion || ruta.accion === "ninguna") return false;
    const handler = manejadores[ruta.accion];
    if (typeof handler === "function") {
      handler(ruta);
      return true;
    }
    return false;
  }

  return {
    parsearRutaDeepLink,
    ejecutarAccionDeepLink
  };
});
