/**
 * UNUmbral — lib/huecos.js
 * Detección de bloques de tiempo libre entre clases y sugerencia de tareas
 * que caben en ellos. Lógica pura, sin DOM, sin Dexie, sin Capacitor.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.UNUmbralHuecos = mod;
    Object.assign(root, mod);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /**
   * Convierte "08:30", "08:30 AM", "02:15 PM" a minutos desde medianoche (0..1439).
   */
  function horaAMinutos(str) {
    if (!str || typeof str !== "string") return 0;
    const s = str.trim();
    const match12 = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match12) return 0;
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const meridiem = match12[3] ? match12[3].toUpperCase() : null;

    if (meridiem === "PM" && h < 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
    return Math.max(0, Math.min(1439, h * 60 + m));
  }

  /**
   * Convierte minutos desde medianoche a formato "HH:MM" (24 h).
   */
  function minutosAHora(minutos) {
    const m = Math.max(0, Math.min(1439, Math.floor(minutos)));
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  /**
   * Formatea minutos a formato 12h con AM/PM (ej: "10:30 AM").
   */
  function minutosAHora12(minutos) {
    const m = Math.max(0, Math.min(1439, Math.floor(minutos)));
    let h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${String(h).padStart(2, "0")}:${mm} ${ampm}`;
  }

  /**
   * Formatea una duración en minutos a texto legible en español (ej: "45 min", "1 h 30 min", "2 h").
   */
  function formatearDuracion(minutos) {
    const m = Math.max(0, Math.floor(minutos));
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${rem} min`;
    if (rem === 0) return `${h} h`;
    return `${h} h ${rem} min`;
  }

  /**
   * Determina si una clase está cancelada por una excepción registrada.
   */
  function esClaseCanceladaLocal(claseId, fecha, excepciones = []) {
    if (!claseId || !fecha || !Array.isArray(excepciones)) return false;
    const fechaStr = typeof fecha === "string" ? fecha.slice(0, 10) : fecha.toISOString().slice(0, 10);
    return excepciones.some(e =>
      e &&
      e.fecha === fechaStr &&
      e.tipo === "cancelada" &&
      String(e.clase_id) === String(claseId)
    );
  }

  /**
   * Detecta los huecos libres entre clases de un día.
   *
   * @param {Array} clasesDelDia - Clases que caen en ese día ({ id, hora_inicio, hora_fin, ... })
   * @param {string|object} ventanaDesde - "07:00" o un objeto de opciones
   * @param {string} ventanaHasta - "21:00"
   * @param {number} minMinutos - Mínimo de minutos para considerarlo un hueco (def: 30)
   * @param {Array} excepciones - Excepciones registradas para filtrar canceladas
   * @returns {Array<{ inicio: string, fin: string, inicio12: string, fin12: string, duracionMinutos: number }>}
   */
  function huecosDelDia(
    clasesDelDia = [],
    ventanaDesde = "07:00",
    ventanaHasta = "21:00",
    minMinutos = 30,
    excepciones = []
  ) {
    let opts = {
      ventanaDesde: "07:00",
      ventanaHasta: "21:00",
      minMinutos: 30,
      excepciones: [],
      soloEntreClases: true,
      fecha: null
    };

    if (ventanaDesde && typeof ventanaDesde === "object") {
      opts = Object.assign(opts, ventanaDesde);
    } else {
      opts.ventanaDesde = typeof ventanaDesde === "string" ? ventanaDesde : "07:00";
      opts.ventanaHasta = typeof ventanaHasta === "string" ? ventanaHasta : "21:00";
      opts.minMinutos = typeof minMinutos === "number" ? minMinutos : 30;
      opts.excepciones = Array.isArray(excepciones) ? excepciones : [];
    }

    if (!Array.isArray(clasesDelDia) || clasesDelDia.length === 0) {
      if (opts.soloEntreClases) return [];
      const vIni = horaAMinutos(opts.ventanaDesde);
      const vFin = horaAMinutos(opts.ventanaHasta);
      if (vFin - vIni >= opts.minMinutos) {
        return [{
          inicio: minutosAHora(vIni),
          fin: minutosAHora(vFin),
          inicio12: minutosAHora12(vIni),
          fin12: minutosAHora12(vFin),
          duracionMinutos: vFin - vIni
        }];
      }
      return [];
    }

    // Filtrar clases canceladas
    const activas = clasesDelDia.filter(c => {
      if (!c || !c.hora_inicio || !c.hora_fin) return false;
      if (opts.fecha && esClaseCanceladaLocal(c.id, opts.fecha, opts.excepciones)) return false;
      return true;
    });

    if (activas.length === 0) {
      if (opts.soloEntreClases) return [];
      const vIni = horaAMinutos(opts.ventanaDesde);
      const vFin = horaAMinutos(opts.ventanaHasta);
      if (vFin - vIni >= opts.minMinutos) {
        return [{
          inicio: minutosAHora(vIni),
          fin: minutosAHora(vFin),
          inicio12: minutosAHora12(vIni),
          fin12: minutosAHora12(vFin),
          duracionMinutos: vFin - vIni
        }];
      }
      return [];
    }

    // Convertir a intervalos en minutos
    const intervalos = activas.map(c => {
      const ini = horaAMinutos(c.hora_inicio);
      const fin = horaAMinutos(c.hora_fin);
      return { ini: Math.min(ini, fin), fin: Math.max(ini, fin) };
    }).sort((a, b) => a.ini - b.ini || a.fin - b.fin);

    // Fusionar intervalos superpuestos o continuos
    const fusionados = [];
    for (const cur of intervalos) {
      if (fusionados.length === 0) {
        fusionados.push({ ini: cur.ini, fin: cur.fin });
      } else {
        const last = fusionados[fusionados.length - 1];
        if (cur.ini <= last.fin) {
          last.fin = Math.max(last.fin, cur.fin);
        } else {
          fusionados.push({ ini: cur.ini, fin: cur.fin });
        }
      }
    }

    const huecos = [];

    if (!opts.soloEntreClases) {
      const vIni = horaAMinutos(opts.ventanaDesde);
      if (fusionados[0].ini - vIni >= opts.minMinutos) {
        huecos.push({
          inicio: minutosAHora(vIni),
          fin: minutosAHora(fusionados[0].ini),
          inicio12: minutosAHora12(vIni),
          fin12: minutosAHora12(fusionados[0].ini),
          duracionMinutos: fusionados[0].ini - vIni
        });
      }
    }

    // Huecos entre clases consecutivas
    for (let i = 0; i < fusionados.length - 1; i++) {
      const gapIni = fusionados[i].fin;
      const gapFin = fusionados[i + 1].ini;
      const dur = gapFin - gapIni;
      if (dur >= opts.minMinutos) {
        huecos.push({
          inicio: minutosAHora(gapIni),
          fin: minutosAHora(gapFin),
          inicio12: minutosAHora12(gapIni),
          fin12: minutosAHora12(gapFin),
          duracionMinutos: dur
        });
      }
    }

    if (!opts.soloEntreClases) {
      const vFin = horaAMinutos(opts.ventanaHasta);
      const lastFin = fusionados[fusionados.length - 1].fin;
      if (vFin - lastFin >= opts.minMinutos) {
        huecos.push({
          inicio: minutosAHora(lastFin),
          fin: minutosAHora(vFin),
          inicio12: minutosAHora12(lastFin),
          fin12: minutosAHora12(vFin),
          duracionMinutos: vFin - lastFin
        });
      }
    }

    return huecos;
  }

  /**
   * Cálculo de urgencia local para ordenar tareas si no está cargado lib/prioridad.js
   */
  function calcularUrgenciaLocal(fechaLimite, fechaReferencia = new Date()) {
    if (!fechaLimite) return 0;
    const ref = fechaReferencia instanceof Date ? fechaReferencia.getTime() : new Date(fechaReferencia).getTime();
    const lim = new Date(fechaLimite).getTime();
    if (isNaN(lim)) return 0;
    const diffMs = lim - ref;
    const diffHoras = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) return 10;
    if (diffHoras < 24) return 8;
    if (diffHoras < 48) return 6;
    if (diffHoras < 72) return 4;
    if (diffHoras < 168) return 2;
    return 0;
  }

  /**
   * Sugiere tareas pendientes que caben en un hueco de tiempo libre.
   *
   * @param {{ duracionMinutos: number }} hueco
   * @param {Array} tareasPendientes
   * @param {Date} [fechaReferencia]
   * @returns {Array} Máximo 3 tareas sugeridas, ordenadas por mayor prioridad
   */
  function sugerirTareas(hueco, tareasPendientes = [], fechaReferencia = new Date()) {
    if (!hueco || typeof hueco.duracionMinutos !== "number" || hueco.duracionMinutos <= 0) {
      return [];
    }
    if (!Array.isArray(tareasPendientes) || tareasPendientes.length === 0) {
      return [];
    }

    const maxMin = hueco.duracionMinutos;

    // Filtrar completadas y verificar duración estimada
    const candidatas = [];
    for (const t of tareasPendientes) {
      if (!t || t.completada) continue;
      const dur = Number(t.estimado_min) > 0 ? Number(t.estimado_min) : 45;
      if (dur <= maxMin) {
        const imp = Math.max(1, Math.min(5, Number(t.importancia) || 1));
        const urg = typeof calcularUrgencia === "function"
          ? calcularUrgencia(t.fecha_limite, fechaReferencia)
          : calcularUrgenciaLocal(t.fecha_limite, fechaReferencia);
        const score = typeof puntajePrioridad === "function"
          ? puntajePrioridad(t, fechaReferencia)
          : (imp * 2 + urg);

        candidatas.push({
          tarea: t,
          estimadoMinutos: dur,
          importancia: imp,
          urgencia: urg,
          score
        });
      }
    }

    // Ordenar por score descendente (prioridad), luego duracion descendente (aprovechar mejor el hueco)
    candidatas.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.estimadoMinutos !== a.estimadoMinutos) return b.estimadoMinutos - a.estimadoMinutos;
      const timeA = a.tarea.fecha_limite ? new Date(a.tarea.fecha_limite).getTime() : Infinity;
      const timeB = b.tarea.fecha_limite ? new Date(b.tarea.fecha_limite).getTime() : Infinity;
      return timeA - timeB;
    });

    return candidatas.slice(0, 3).map(c => Object.assign({}, c.tarea, {
      _estimadoMinutos: c.estimadoMinutos,
      _score: c.score
    }));
  }

  return {
    horaAMinutos,
    minutosAHora,
    minutosAHora12,
    formatearDuracion,
    huecosDelDia,
    sugerirTareas
  };
});
