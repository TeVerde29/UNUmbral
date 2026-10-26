// lib/ajustes.js
// Valores por defecto y validación de la configuración de UNUmbral (Fase 1)

const AJUSTES_DEFAULTS = Object.freeze({
  ciclo_inicio: null,
  ciclo_fin: null,
  aviso_clase_min: [30, 10],
  resumen_activo: true,
  resumen_hora: "07:00",
  silencio_activo: true,
  silencio_desde: "22:00",
  silencio_hasta: "07:00",
  nivel5_ignora_silencio: true,
  limite_faltas_pct: 30,
  huecos_ventana_desde: "07:00",
  huecos_ventana_hasta: "22:00",
  huecos_min: 30,
  notif_clases: true,
  notif_tareas: true,
  notif_urgentes: true
});

function getAjustesDefaults() {
  return JSON.parse(JSON.stringify(AJUSTES_DEFAULTS));
}

function sanitizarAjustes(input) {
  const defaults = getAjustesDefaults();
  if (!input || typeof input !== "object") return defaults;

  const res = { ...defaults };

  if (typeof input.ciclo_inicio === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.ciclo_inicio)) {
    res.ciclo_inicio = input.ciclo_inicio;
  } else if (input.ciclo_inicio === null) {
    res.ciclo_inicio = null;
  }

  if (typeof input.ciclo_fin === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.ciclo_fin)) {
    res.ciclo_fin = input.ciclo_fin;
  } else if (input.ciclo_fin === null) {
    res.ciclo_fin = null;
  }

  if (Array.isArray(input.aviso_clase_min)) {
    res.aviso_clase_min = input.aviso_clase_min
      .map(Number)
      .filter(n => Number.isFinite(n) && n > 0 && n <= 120);
  }

  if (typeof input.resumen_activo === "boolean") res.resumen_activo = input.resumen_activo;
  if (typeof input.resumen_hora === "string") res.resumen_hora = input.resumen_hora;

  if (typeof input.silencio_activo === "boolean") res.silencio_activo = input.silencio_activo;
  if (typeof input.silencio_desde === "string") res.silencio_desde = input.silencio_desde;
  if (typeof input.silencio_hasta === "string") res.silencio_hasta = input.silencio_hasta;

  if (typeof input.nivel5_ignora_silencio === "boolean") res.nivel5_ignora_silencio = input.nivel5_ignora_silencio;

  if (typeof input.limite_faltas_pct === "number" && input.limite_faltas_pct > 0 && input.limite_faltas_pct <= 100) {
    res.limite_faltas_pct = Math.round(input.limite_faltas_pct);
  }

  if (typeof input.huecos_ventana_desde === "string") res.huecos_ventana_desde = input.huecos_ventana_desde;
  if (typeof input.huecos_ventana_hasta === "string") res.huecos_ventana_hasta = input.huecos_ventana_hasta;
  if (typeof input.huecos_min === "number" && input.huecos_min >= 10) res.huecos_min = Math.round(input.huecos_min);

  if (typeof input.notif_clases === "boolean") res.notif_clases = input.notif_clases;
  if (typeof input.notif_tareas === "boolean") res.notif_tareas = input.notif_tareas;
  if (typeof input.notif_urgentes === "boolean") res.notif_urgentes = input.notif_urgentes;

  return res;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { AJUSTES_DEFAULTS, getAjustesDefaults, sanitizarAjustes };
} else if (typeof window !== "undefined") {
  window.AJUSTES_DEFAULTS = AJUSTES_DEFAULTS;
  window.getAjustesDefaults = getAjustesDefaults;
  window.sanitizarAjustes = sanitizarAjustes;
}
