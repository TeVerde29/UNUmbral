/* =====================================================================
   DESIGN RICRA + APPLE HUMAN INTERFACE DESIGN (TEA GREEN)
   UNUmbral — Horario Universitario, Cursos, Notas & Tareas Offline
   100% Vanilla JS + Dexie.js (IndexedDB). Sin emojis, diseño profesional.
   ===================================================================== */
"use strict";

/* =====================================================================
   1. CONSTANTES, ENUMS Y DÍAS
   ===================================================================== */
const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

const DIAS_LABEL = {
  LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles",
  JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo"
};

const DIAS_CORTO = {
  LUNES: "Lun", MARTES: "Mar", MIERCOLES: "Mié",
  JUEVES: "Jue", VIERNES: "Vie", SABADO: "Sáb", DOMINGO: "Dom"
};

const IMPORTANCIA_INFO = {
  1: { label: "Nivel 1 · Rutina", badge: "Nivel 1", class: "lvl-1", hint: "Nivel 1: Tareas menores, lecturas breves o apuntes generales." },
  2: { label: "Nivel 2 · Leve",   badge: "Nivel 2", class: "lvl-2", hint: "Nivel 2: Revisar materiales o preparar consultas." },
  3: { label: "Nivel 3 · Media",  badge: "Nivel 3", class: "lvl-3", hint: "Nivel 3: Guía de ejercicios, cuestionario semanal." },
  4: { label: "Nivel 4 · Alta",   badge: "Nivel 4", class: "lvl-4", hint: "Nivel 4: Práctica calificada, entrega de avance o informe." },
  5: { label: "Nivel 5 · Crítica",badge: "Nivel 5", class: "lvl-5", hint: "Nivel 5: Examen parcial, examen final o proyecto definitivo." }
};

/* SVG ICON HELPERS PARA REEMPLAZAR EMOJIS */
const ICONS = {
  clock: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  location: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  person: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  tasks: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`,
  book: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
};

/* SISTEMA DE CALIFICACIÓN UNIVERSITARIO (ESCALA VIGESIMAL 0–20)
   Promedio final = (Examen parcial + Examen final + Promedio de prácticas) / 3
   Promedio de prácticas = suma de prácticas calificadas / cantidad calificada */
const NOTA_MAX = 20;
const NOTA_APROBATORIA = 10.5;
const NOTA_UMBRAL_RIESGO = 14; // si necesitas más de esto en lo que falta, el curso está en riesgo
const NOTA_EPS = 1e-9;
const COLOR_CURSO_DEFECTO = "#BAE6FD";

/* Mapa de conversión automática de colores intensos antiguos a tonos pasteles */
const PASTEL_COLOR_MAP = {
  "#38BDF8": "#BAE6FD",
  "#E879F9": "#F5D0FE",
  "#FACC15": "#FEF08A",
  "#4ADE80": "#BBF7D0",
  "#FB923C": "#FED7AA",
  "#818CF8": "#C7D2FE",
  "#F87171": "#FECACA",
  "#2DD4BF": "#99F6E4",
  "#AFC49A": "#DDE8C8",
  "#294635": "#C5D6B8"
};

function normalizarColorPastel(hex) {
  if (!hex) return COLOR_CURSO_DEFECTO;
  const upper = String(hex).trim().toUpperCase();
  if (PASTEL_COLOR_MAP[upper]) return PASTEL_COLOR_MAP[upper];
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(upper) ? upper : COLOR_CURSO_DEFECTO;
}

function sanitizarNota(v) {
  const n = toNota(v);
  if (n === null || n < 0 || n > NOTA_MAX) return null;
  return Math.round(n * 100) / 100;
}

function sanitizarCursoImportado(c) {
  if (!c || typeof c !== "object") return null;
  const nombre = String(c.nombre || "").trim();
  if (!nombre) return null;
  const ev = c.evaluacion && typeof c.evaluacion === "object" ? c.evaluacion : {};
  const practicas = Array.isArray(ev.practicas)
    ? ev.practicas.map((p, idx) => ({
        id: String((p && p.id) || uuid()),
        titulo: String((p && p.titulo) || `Práctica ${idx + 1}`).trim().slice(0, 40),
        nota: sanitizarNota(p && p.nota),
        fecha: typeof (p && p.fecha) === "string" ? p.fecha : null
      }))
    : [];
  const creditos = typeof c.creditos === "number" && c.creditos > 0 ? Math.min(10, Math.max(1, Math.round(c.creditos))) : 3;
  return {
    id: String(c.id || uuid()),
    nombre,
    profesor: String(c.profesor || "").trim(),
    aula: String(c.aula || "").trim(),
    color: normalizarColorPastel(c.color),
    notas: String(c.notas || "").trim(),
    creditos,
    evaluacion: {
      parcial: sanitizarNota(ev.parcial),
      final: sanitizarNota(ev.final),
      fecha_parcial: typeof ev.fecha_parcial === "string" ? ev.fecha_parcial : null,
      fecha_final: typeof ev.fecha_final === "string" ? ev.fecha_final : null,
      practicas
    }
  };
}

const ESTADO_NOTA_INFO = {
  "sin-notas":   { label: "Sin notas",          tone: "st-neutral" },
  "en-curso":    { label: "En curso",           tone: "st-info" },
  "en-riesgo":   { label: "En riesgo",          tone: "st-warn" },
  "asegurado":   { label: "Aprobación segura",  tone: "st-ok" },
  "sin-opcion":  { label: "Sin opción",         tone: "st-bad" },
  "aprobado":    { label: "Aprobado",           tone: "st-ok" },
  "desaprobado": { label: "Desaprobado",        tone: "st-bad" }
};

const COMPONENTE_LABEL = {
  parcial: "el examen parcial",
  final: "el examen final",
  pp: "el promedio de prácticas"
};

/* =====================================================================
   2. BASE DE DATOS LOCAL (IndexedDB via Dexie)
   ===================================================================== */
const db = new Dexie("UmbralDB");
db.version(1).stores({
  clases: "id, materia, dia_semana, hora_inicio, hora_fin, aula, profesor",
  tareas: "id, titulo, materia, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
});

/* Versión 2: catálogo de cursos (con notas) separado de las sesiones del horario.
   - cursos: nombre, profesor, aula, color, notas (comentarios) y evaluacion
   - clases: solo curso_id + día + horas (+ aula opcional si esa sesión es en otra aula)
   - tareas: se vinculan por curso_id ("" = General) */
db.version(2).stores({
  cursos: "id, nombre",
  clases: "id, curso_id, dia_semana",
  tareas: "id, curso_id, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
}).upgrade(async (tx) => {
  const clasesPlanas = await tx.table("clases").toArray();
  const tareasPlanas = await tx.table("tareas").toArray();
  const r = convertirFormatoPlano(clasesPlanas, tareasPlanas, []);
  if (r.cursosNuevos.length) await tx.table("cursos").bulkAdd(r.cursosNuevos);
  await tx.table("clases").clear();
  if (r.clases.length) await tx.table("clases").bulkAdd(r.clases);
  await tx.table("tareas").clear();
  if (r.tareas.length) await tx.table("tareas").bulkAdd(r.tareas);
});

/* Versión 3: convierte colores de cursos a gama pastel y normaliza horas (soporta 12h AM/PM y 24h) */
db.version(3).stores({
  cursos: "id, nombre",
  clases: "id, curso_id, dia_semana",
  tareas: "id, curso_id, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
}).upgrade(async (tx) => {
  await tx.table("cursos").toCollection().modify(c => {
    c.color = normalizarColorPastel(c.color);
  });
  await tx.table("clases").toCollection().modify(cl => {
    cl.hora_inicio = to24Hour(cl.hora_inicio);
    cl.hora_fin = to24Hour(cl.hora_fin);
  });
});

/* Versión 4: eventos, asistencia por sesión, excepciones de calendario y ajustes de ciclo / notificaciones */
db.version(4).stores({
  cursos:      "id, nombre",
  clases:      "id, curso_id, dia_semana",
  tareas:      "id, curso_id, fecha_limite, importancia, completada, fecha_creacion",
  eventos:     "id, curso_id, fecha, tipo",
  asistencia:  "id, curso_id, clase_id, fecha, estado, &[clase_id+fecha]",
  excepciones: "id, fecha, tipo, clase_id",
  ajustes:     "clave"
}).upgrade(async (tx) => {
  await tx.table("cursos").toCollection().modify(c => {
    if (typeof c.creditos !== "number" || c.creditos <= 0) {
      c.creditos = 3;
    }
  });

  const defaults = typeof getAjustesDefaults === "function" ? getAjustesDefaults() : {};
  for (const [clave, valor] of Object.entries(defaults)) {
    const existing = await tx.table("ajustes").get(clave);
    if (!existing) {
      await tx.table("ajustes").put({ clave, valor });
    }
  }
});

/* =====================================================================
   2.1 CAPA DE DATOS: CURSOS, CLASES ENRIQUECIDAS Y MIGRACIÓN
   ===================================================================== */
function normalizarNombre(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function evaluacionVacia() {
  return { parcial: null, final: null, practicas: [] };
}

/**
 * Convierte datos del formato antiguo (cada clase con materia/profesor/color propios)
 * al formato relacional: cursos + clases con curso_id + tareas con curso_id.
 * Reutiliza los cursos existentes que coincidan por nombre (sin distinguir tildes ni mayúsculas).
 * Las clases y tareas que ya tienen curso_id se respetan tal cual.
 */
function convertirFormatoPlano(clasesPlanas, tareasPlanas, cursosExistentes, cursosSueltos) {
  const porNombre = new Map((cursosExistentes || []).map(c => [normalizarNombre(c.nombre), c]));
  const cursosNuevos = [];

  const obtenerCurso = (nombre, datos) => {
    const limpio = String(nombre || "").trim();
    if (!limpio) return null;
    const clave = normalizarNombre(limpio);
    let curso = porNombre.get(clave);
    if (!curso) {
      const d = datos || {};
      curso = {
        id: uuid(),
        nombre: limpio,
        profesor: d.profesor || "",
        aula: d.aula || "",
        color: normalizarColorPastel(d.color || COLOR_CURSO_DEFECTO),
        notas: d.notas || "",
        evaluacion: evaluacionVacia()
      };
      porNombre.set(clave, curso);
      cursosNuevos.push(curso);
    }
    return curso;
  };

  (cursosSueltos || []).forEach(c => obtenerCurso(c.nombre, c));

  const clases = [];
  (clasesPlanas || []).forEach(c => {
    const hInicio = to24Hour(c.hora_inicio);
    const hFin = to24Hour(c.hora_fin);
    if (c.curso_id) {
      clases.push({ id: c.id || uuid(), curso_id: c.curso_id, dia_semana: c.dia_semana, hora_inicio: hInicio, hora_fin: hFin, aula: c.aula || "" });
      return;
    }
    const curso = obtenerCurso(c.materia, { profesor: c.profesor, aula: c.aula, color: c.color, notas: c.notas });
    if (!curso) return;
    clases.push({
      id: c.id || uuid(),
      curso_id: curso.id,
      dia_semana: c.dia_semana,
      hora_inicio: hInicio,
      hora_fin: hFin,
      // Solo se guarda el aula en la sesión si es distinta a la habitual del curso
      aula: c.aula && c.aula !== curso.aula ? c.aula : ""
    });
  });

  const tareas = (tareasPlanas || []).map(t => {
    if (Object.prototype.hasOwnProperty.call(t, "curso_id")) return t;
    const { materia, ...resto } = t;
    const esGeneral = !materia || normalizarNombre(materia) === "general";
    const curso = esGeneral ? null : obtenerCurso(materia, { color: "#DDE8C8" });
    return { ...resto, curso_id: curso ? curso.id : "" };
  });

  return { cursosNuevos, clases, tareas };
}

async function cargarCursos() {
  const list = await db.cursos.toArray();
  list.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
  const map = {};
  list.forEach(c => {
    c.color = normalizarColorPastel(c.color);
    map[c.id] = c;
  });
  return { list, map };
}

/** Une una sesión del horario con los datos de su curso para poder renderizarla. */
function enriquecerClase(clase, cursosMap) {
  const curso = cursosMap[clase.curso_id];
  return {
    ...clase,
    materia: curso ? curso.nombre : "Curso eliminado",
    color: normalizarColorPastel((curso && curso.color) || "#DDE8C8"),
    profesor: (curso && curso.profesor) || "",
    aula: clase.aula || (curso && curso.aula) || ""
  };
}

async function obtenerClasesEnriquecidas() {
  const [clases, { map }] = await Promise.all([db.clases.toArray(), cargarCursos()]);
  return clases.map(c => enriquecerClase(c, map));
}

function enriquecerTarea(tarea, cursosMap) {
  const curso = tarea.curso_id ? cursosMap[tarea.curso_id] : null;
  return { ...tarea, materia: curso ? curso.nombre : "General" };
}

async function obtenerTareasEnriquecidas() {
  const [tareas, { map }] = await Promise.all([db.tareas.toArray(), cargarCursos()]);
  return tareas.map(t => enriquecerTarea(t, map));
}

/* =====================================================================
   2.2 CÁLCULO DE NOTAS (ESCALA 0–20, APRUEBA CON 10.5)
   ===================================================================== */
function toNota(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatNota(n) {
  return n === null || n === undefined ? "—" : n.toFixed(2);
}

/** Redondea hacia arriba a 2 decimales: la nota mínima necesaria nunca debe quedarse corta. */
function ceil2(n) {
  return Math.ceil(n * 100 - NOTA_EPS) / 100;
}

function unirComponentes(claves) {
  const nombres = claves.map(k => COMPONENTE_LABEL[k]);
  if (nombres.length <= 1) return nombres.join("");
  return nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
}

/**
 * Calcula el rendimiento de un curso.
 * - pp: promedio de las prácticas que ya tienen nota (provisional si hay prácticas sin calificar)
 * - promedio: (parcial + final + pp) / 3, solo cuando los 3 componentes existen
 * - acumulado: puntos ya asegurados sobre el promedio final (suma conocida / 3)
 * - requerido: nota promedio necesaria en los componentes faltantes para llegar a 10.5
 */
function calcularRendimiento(evaluacion) {
  const ev = evaluacion || {};
  const parcial = toNota(ev.parcial);
  const final = toNota(ev.final);
  const practicas = Array.isArray(ev.practicas) ? ev.practicas : [];
  const calificadas = practicas.map(p => toNota(p.nota)).filter(n => n !== null);
  const pp = calificadas.length ? calificadas.reduce((a, b) => a + b, 0) / calificadas.length : null;
  const ppProvisional = calificadas.length > 0 && calificadas.length < practicas.length;

  const componentes = { parcial, final, pp };
  const faltantesClaves = Object.keys(componentes).filter(k => componentes[k] === null);
  const conocidos = Object.values(componentes).filter(n => n !== null);
  const sumaConocida = conocidos.reduce((a, b) => a + b, 0);
  const faltantes = faltantesClaves.length;
  const acumulado = sumaConocida / 3;
  const promedio = faltantes === 0 ? acumulado : null;

  let estado;
  let requerido = null;

  if (conocidos.length === 0) {
    estado = "sin-notas";
  } else if (faltantes === 0) {
    estado = promedio >= NOTA_APROBATORIA - NOTA_EPS ? "aprobado" : "desaprobado";
  } else {
    requerido = (NOTA_APROBATORIA * 3 - sumaConocida) / faltantes;
    if (requerido <= NOTA_EPS) estado = "asegurado";
    else if (requerido > NOTA_MAX + NOTA_EPS) estado = "sin-opcion";
    else if (requerido > NOTA_UMBRAL_RIESGO) estado = "en-riesgo";
    else estado = "en-curso";
  }

  return {
    parcial, final, pp, ppProvisional,
    practicasCalificadas: calificadas.length,
    practicasTotal: practicas.length,
    promedio, acumulado, faltantes, faltantesClaves,
    requerido: requerido === null ? null : ceil2(Math.max(0, requerido)),
    estado
  };
}

function mensajeRendimiento(r) {
  const faltaTexto = unirComponentes(r.faltantesClaves);
  const aviso = r.ppProvisional ? " Hay prácticas sin calificar: resultado provisional." : "";
  switch (r.estado) {
    case "sin-notas":
      return "Registra tus notas para ver tu promedio y cuánto necesitas para aprobar.";
    case "aprobado":
      return `Aprobaste con ${formatNota(r.promedio)}.${aviso}`;
    case "desaprobado":
      return `Te faltan ${formatNota(ceil2(NOTA_APROBATORIA - r.promedio))} puntos para llegar a ${NOTA_APROBATORIA}.${aviso}`;
    case "asegurado":
      return `Ya apruebas aunque saques 0 en ${faltaTexto}.`;
    case "sin-opcion":
      return `Aun con 20 en ${faltaTexto} no alcanzarías ${NOTA_APROBATORIA}.`;
    default:
      return r.faltantes === 1
        ? `Necesitas ${formatNota(r.requerido)} en ${faltaTexto} para aprobar.`
        : `Necesitas promediar ${formatNota(r.requerido)} entre ${faltaTexto} para aprobar.`;
  }
}

/* =====================================================================
   3. ESTADO DE LA APLICACIÓN
   ===================================================================== */
const state = {
  currentTab: "view-hoy",
  scheduleMode: "agenda", // "agenda" o "matrix"
  selectedDay: getTodayDayKey(),
  tasksFilter: "pendientes", // pendientes, urgentes, proximas, todas, completadas
  tasksMateriaFilter: "",
  tasksSearchQuery: "",
  matrixCompact: localStorage.getItem("umbral-matrix-compact") !== "false",
  theme: localStorage.getItem("umbral-theme") || localStorage.getItem("uniflow-theme") || "light",
  // Si el modal de curso se abrió desde el formulario de clase, al guardar se vuelve a él
  cursoModalOrigin: null // null | "clase" | { abrirClase: true, dia: "LUNES" }
};

/* =====================================================================
   4. UTILIDADES GENERALES
   ===================================================================== */
const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function pad2(n) { return String(n).padStart(2, "0"); }

/**
 * Convierte cualquier hora ("14:30" o "02:30 PM" o "8:00 am") al formato 24h "HH:MM"
 * requerido por <input type="time"> y el cálculo interno de minutos.
 */
function to24Hour(str) {
  if (!str) return "08:00";
  const s = String(str).trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!m) return "08:00";
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3];
  if (mer === "PM" && h < 12) h += 12;
  else if (mer === "AM" && h === 12) h = 0;
  h = Math.max(0, Math.min(23, h));
  return `${pad2(h)}:${pad2(Math.max(0, Math.min(59, min)))}`;
}

function timeToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = to24Hour(hhmm).split(":").map(Number);
  return h * 60 + m;
}

/** Formatea una cantidad de minutos desde medianoche al formato 12 horas ("08:00 AM", "05:20 PM"). */
function formatMinutes12(totalMins) {
  const mins = ((Math.round(totalMins) % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const mer = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${pad2(h12)}:${pad2(m)} ${mer}`;
}

/** Formatea cualquier cadena de hora ("17:20" o "05:20 PM") en formato de 12 horas con AM/PM. */
function formatTime12(hhmm) {
  if (!hhmm) return "";
  return formatMinutes12(timeToMinutes(hhmm));
}

function formatTimeRange12(start, end) {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function getContrastTextColor(hex) {
  if (!hex || hex.length < 6) return "#FFFFFF";
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const r = parseInt(h.substring(0, 2), 16) || 0;
  const g = parseInt(h.substring(2, 4), 16) || 0;
  const b = parseInt(h.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 155 ? "#111A13" : "#FFFFFF";
}

function darkenColor(hex, factor = 0.28) {
  if (!hex || hex.length < 6) return "rgba(0,0,0,0.3)";
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  let r = Math.max(0, Math.floor((parseInt(h.substring(0, 2), 16) || 0) * (1 - factor)));
  let g = Math.max(0, Math.floor((parseInt(h.substring(2, 4), 16) || 0) * (1 - factor)));
  let b = Math.max(0, Math.floor((parseInt(h.substring(4, 6), 16) || 0) * (1 - factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

function getTodayDayKey() {
  const map = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
  return map[new Date().getDay()];
}

function formatReadableDate(d) {
  const date = d ? new Date(d) : new Date();
  const options = { weekday: "long", day: "numeric", month: "long" };
  const str = date.toLocaleDateString("es-ES", options);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRelativeDue(isoDateStr) {
  if (!isoDateStr) return { text: "Sin fecha", isUrgent: false, isSoon: false };
  const target = new Date(isoDateStr);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = formatTime12(`${pad2(target.getHours())}:${pad2(target.getMinutes())}`);

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays <= 1 ? `Atrasada hoy (${timeStr})` : `Atrasada (${overdueDays}d)`,
      isUrgent: true,
      isSoon: false
    };
  }

  if (diffHours <= 24) {
    return {
      text: diffHours <= 1 ? `Vence pronto (${timeStr})` : `Hoy a las ${timeStr}`,
      isUrgent: true,
      isSoon: false
    };
  }

  if (diffDays === 1) {
    return {
      text: `Mañana (${timeStr})`,
      isUrgent: false,
      isSoon: true
    };
  }

  if (diffDays <= 7) {
    const dayName = target.toLocaleDateString("es-ES", { weekday: "short" });
    return {
      text: `En ${diffDays}d (${dayName} ${timeStr})`,
      isUrgent: false,
      isSoon: false
    };
  }

  return {
    text: target.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
    isUrgent: false,
    isSoon: false
  };
}

let toastTimer = null;
function showToast(msg, isError) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("error", !!isError);
  el.classList.remove("hidden");
  requestAnimationFrame(() => el.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => { el.classList.add("hidden"); }, 220);
  }, 2600);
}

let activeConfirmCancel = null;

function confirmDialog(title, message) {
  if (activeConfirmCancel) activeConfirmCancel();
  return new Promise((resolve) => {
    const backdrop = $("#modal-confirm-backdrop");
    $("#confirm-title").textContent = title || "¿Confirmar acción?";
    $("#confirm-message").textContent = message;
    backdrop.classList.remove("hidden");

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    function cleanup() {
      activeConfirmCancel = null;
      backdrop.classList.add("hidden");
      $("#btn-confirm-ok").removeEventListener("click", onOk);
      $("#btn-confirm-cancel").removeEventListener("click", onCancel);
    }

    activeConfirmCancel = onCancel;
    $("#btn-confirm-ok").addEventListener("click", onOk);
    $("#btn-confirm-cancel").addEventListener("click", onCancel);
  });
}

function actualizarBadgeTareas(pendingCount) {
  const navCountEl = $("#nav-count-tareas");
  if (!navCountEl) return;
  if (pendingCount > 0) {
    navCountEl.textContent = pendingCount;
    navCountEl.classList.remove("hidden");
  } else {
    navCountEl.classList.add("hidden");
  }
}

/* =====================================================================
   5. GESTIÓN DEL TEMA (DESIGN RICRA LIGHT / DARK)
   ===================================================================== */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("umbral-theme", theme);
  localStorage.setItem("uniflow-theme", theme);

  if (theme === "dark") {
    $("#theme-icon-sun").classList.remove("hidden");
    $("#theme-icon-moon").classList.add("hidden");
    $('meta[name="theme-color"]').setAttribute("content", "#0D140F");
  } else {
    $("#theme-icon-sun").classList.add("hidden");
    $("#theme-icon-moon").classList.remove("hidden");
    $('meta[name="theme-color"]').setAttribute("content", "#F4F6EE");
  }
}

function toggleTheme() {
  applyTheme(state.theme === "dark" ? "light" : "dark");
}

/* =====================================================================
   6. NAVEGACIÓN Y VISTAS
   ===================================================================== */
function switchTab(tabId) {
  state.currentTab = tabId;
  $$(".view-panel").forEach(p => p.classList.toggle("active", p.id === tabId));
  $$(".nav-tab").forEach(b => b.classList.toggle("active", b.dataset.view === tabId));

  if (tabId === "view-hoy") renderHoy();
  else if (tabId === "view-horario") renderHorario();
  else if (tabId === "view-cursos") renderCursos();
  else if (tabId === "view-tareas") renderTareas();
  else if (tabId === "view-ajustes") renderAjustes();

  $("#main-content").scrollTop = 0;
}

/* =====================================================================
   7. VISTA: HOY (DASHBOARD EN TIEMPO REAL)
   ===================================================================== */
async function renderHoy() {
  $("#current-date-label").textContent = formatReadableDate();

  const todayKey = getTodayDayKey();
  const classesToday = (await obtenerClasesEnriquecidas()).filter(c => c.dia_semana === todayKey);
  classesToday.sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

  const badgeEl = $("#badge-clases-hoy");
  badgeEl.textContent = `${classesToday.length} ${classesToday.length === 1 ? "clase" : "clases"}`;

  renderLiveStatusCard(classesToday);

  // Lista de clases de hoy
  const listEl = $("#today-classes-list");
  if (classesToday.length === 0) {
    listEl.innerHTML = `
      <div class="empty-card">
        <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
        <strong>Sin clases programadas para hoy</strong>
        <p>No tienes materias agendadas para el día de hoy.</p>
      </div>`;
  } else {
    listEl.innerHTML = classesToday.map(c => renderClassCardHTML(c)).join("");
    $$(".class-card", listEl).forEach(card => {
      card.addEventListener("click", () => openEditClassModal(card.dataset.id));
    });
  }

  // Radar de tareas urgentes
  const allTasks = await obtenerTareasEnriquecidas();
  const pendingTasks = allTasks.filter(t => !t.completada);
  actualizarBadgeTareas(pendingTasks.length);

  const nowMs = Date.now();
  const urgentTasks = pendingTasks.filter(t => {
    if (t.importancia >= 4) return true;
    if (!t.fecha_limite) return false;
    const diff = new Date(t.fecha_limite).getTime() - nowMs;
    return diff <= (48 * 60 * 60 * 1000);
  });

  urgentTasks.sort((a, b) => {
    const timeA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : 9999999999999;
    const timeB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : 9999999999999;
    if (Math.abs(timeA - timeB) < 3600000) {
      return b.importancia - a.importancia;
    }
    return timeA - timeB;
  });

  const urgentListEl = $("#urgent-tasks-list");
  if (urgentTasks.length === 0) {
    urgentListEl.innerHTML = `
      <div class="empty-card">
        <div class="empty-card-icon-wrap">${ICONS.checkCircle}</div>
        <strong>Todo al día</strong>
        <p>No hay entregas pendientes ni evaluaciones críticas próximas.</p>
      </div>`;
  } else {
    urgentListEl.innerHTML = urgentTasks.slice(0, 5).map(t => renderTaskCardHTML(t)).join("");
    wireTaskCardEvents(urgentListEl);
  }
}

function renderLiveStatusCard(classesToday) {
  const container = $("#live-status-card");
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  if (classesToday.length === 0) {
    container.className = "live-card";
    container.innerHTML = `
      <div class="live-card-eyebrow">
        <span class="live-dot"></span>
        <span>${DIAS_LABEL[getTodayDayKey()]} · Hoy</span>
      </div>
      <div class="live-card-title">Jornada Libre</div>
      <div class="live-card-meta">
        <span class="live-meta-item">No tienes materias registradas para hoy.</span>
      </div>`;
    return;
  }

  // Buscar clase en curso
  const currentClass = classesToday.find(c => {
    const s = timeToMinutes(c.hora_inicio);
    const e = timeToMinutes(c.hora_fin);
    return currentMin >= s && currentMin < e;
  });

  if (currentClass) {
    const s = timeToMinutes(currentClass.hora_inicio);
    const e = timeToMinutes(currentClass.hora_fin);
    const total = e - s;
    const elapsed = currentMin - s;
    const remaining = e - currentMin;
    const pct = Math.min(100, Math.round((elapsed / total) * 100));

    container.className = "live-card in-class";
    container.innerHTML = `
      <div class="live-card-eyebrow">
        <span class="live-dot pulse"></span>
        <span style="color:var(--status-success)">En Curso · ${formatTime12(currentClass.hora_inicio)} a ${formatTime12(currentClass.hora_fin)}</span>
      </div>
      <div class="live-card-title">${escapeHtml(currentClass.materia)}</div>
      <div class="live-card-meta">
        <span class="live-meta-item">${ICONS.location} ${escapeHtml(currentClass.aula || "Sin aula")}</span>
        <span class="live-meta-item">${ICONS.person} ${escapeHtml(currentClass.profesor || "Profesor(a)")}</span>
        <span class="live-meta-item" style="color:var(--deep-leaf);font-weight:600">${ICONS.clock} Restan ${remaining} min</span>
      </div>
      <div class="live-progress-bar">
        <div class="live-progress-fill" style="width: ${pct}%"></div>
      </div>`;
    return;
  }

  // Buscar próxima clase de hoy
  const nextClass = classesToday.find(c => timeToMinutes(c.hora_inicio) > currentMin);

  if (nextClass) {
    const s = timeToMinutes(nextClass.hora_inicio);
    const until = s - currentMin;
    const hours = Math.floor(until / 60);
    const mins = until % 60;
    const countdown = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    container.className = "live-card";
    container.innerHTML = `
      <div class="live-card-eyebrow">
        <span class="live-dot"></span>
        <span>Próxima Clase</span>
      </div>
      <div class="live-card-title">${escapeHtml(nextClass.materia)}</div>
      <div class="live-card-meta">
        <span class="live-meta-item">${ICONS.clock} ${formatTimeRange12(nextClass.hora_inicio, nextClass.hora_fin)} (en ${countdown})</span>
        <span class="live-meta-item">${ICONS.location} ${escapeHtml(nextClass.aula || "Sin aula")}</span>
        <span class="live-meta-item">${ICONS.person} ${escapeHtml(nextClass.profesor || "Profesor(a)")}</span>
      </div>`;
    return;
  }

  // Clases del día concluidas
  container.className = "live-card";
  container.innerHTML = `
    <div class="live-card-eyebrow">
      <span class="live-dot"></span>
      <span>Jornada Finalizada</span>
    </div>
    <div class="live-card-title">Clases del día completadas</div>
    <div class="live-card-meta">
      <span class="live-meta-item">Has cursado las ${classesToday.length} materias programadas para hoy.</span>
    </div>`;
}

function renderClassCardHTML(c) {
  const color = normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO);
  return `
    <div class="class-card" data-id="${c.id}">
      <div class="class-card-stripe" style="background:${color}"></div>
      <div class="class-card-main">
        <div class="class-card-title">${escapeHtml(c.materia)}</div>
        <div class="class-card-details">
          <span class="class-time-tag">${ICONS.clock} ${formatTimeRange12(c.hora_inicio, c.hora_fin)}</span>
          ${c.aula ? `<span class="class-detail-tag">${ICONS.location} ${escapeHtml(c.aula)}</span>` : ""}
          ${c.profesor ? `<span class="class-detail-tag">${ICONS.person} ${escapeHtml(c.profesor)}</span>` : ""}
        </div>
      </div>
      ${ICONS.chevronRight}
    </div>`;
}

/* =====================================================================
   8. VISTA: HORARIO SEMANAL
   ===================================================================== */
async function renderHorario() {
  const container = $("#schedule-container");
  const dayTabsEl = $("#day-tabs-container");
  const matrixToolbarEl = $("#matrix-toolbar");

  $("#btn-mode-agenda").classList.toggle("active", state.scheduleMode === "agenda");
  $("#btn-mode-matrix").classList.toggle("active", state.scheduleMode === "matrix");

  const allClasses = await obtenerClasesEnriquecidas();
  const cursosCount = await db.cursos.count();
  const emptyAction = cursosCount === 0
    ? { label: "Registrar mi primer curso", hint: "Primero registra tus cursos (nombre, profesor, aula y color); luego solo eliges el curso y la hora." }
    : null;

  if (state.scheduleMode === "agenda") {
    dayTabsEl.classList.remove("hidden");
    if (matrixToolbarEl) matrixToolbarEl.classList.add("hidden");

    $$(".day-tab", dayTabsEl).forEach(btn => {
      btn.classList.toggle("active", btn.dataset.day === state.selectedDay);
    });

    const dayClasses = allClasses.filter(c => c.dia_semana === state.selectedDay);
    dayClasses.sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

    if (dayClasses.length === 0) {
      container.innerHTML = `
        <div class="empty-card" style="margin-top:14px;">
          <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
          <strong>Sin clases para el ${DIAS_LABEL[state.selectedDay].toLowerCase()}</strong>
          <p>${emptyAction ? emptyAction.hint : "Elige uno de tus cursos y asígnale la hora en este día."}</p>
          <button class="btn-primary btn-sm" id="btn-add-class-empty" style="margin-top:10px;">${emptyAction ? emptyAction.label : "Añadir Clase"}</button>
        </div>`;
      const btn = $("#btn-add-class-empty", container);
      if (btn) btn.addEventListener("click", () => openNewClassModal(state.selectedDay));
      return;
    }

    container.innerHTML = `
      <div class="cards-list" style="margin-top:8px;">
        ${dayClasses.map(c => renderClassCardHTML(c)).join("")}
      </div>`;

    $$(".class-card", container).forEach(card => {
      card.addEventListener("click", () => openEditClassModal(card.dataset.id));
    });

  } else {
    // MODO MATRIZ SEMANAL (PARRILLA ACADÉMICA)
    dayTabsEl.classList.add("hidden");
    if (matrixToolbarEl) matrixToolbarEl.classList.remove("hidden");

    if (allClasses.length === 0) {
      if (matrixToolbarEl) matrixToolbarEl.classList.add("hidden");
      container.innerHTML = `
        <div class="empty-card">
          <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
          <strong>Horario no configurado</strong>
          <p>${emptyAction ? emptyAction.hint : "Asigna día y hora a tus cursos para ver la distribución semanal."}</p>
          <button class="btn-primary btn-sm" id="btn-add-class-empty-mat" style="margin-top:10px;">${emptyAction ? emptyAction.label : "Añadir Clase"}</button>
        </div>`;
      const btn = $("#btn-add-class-empty-mat", container);
      if (btn) btn.addEventListener("click", () => openNewClassModal("LUNES"));
      return;
    }

    container.innerHTML = renderMatrixTableHTML(allClasses);

    // Eventos para editar al pulsar una celda
    $$(".matrix-cell-card", container).forEach(card => {
      card.addEventListener("click", () => openEditClassModal(card.dataset.id));
    });

    wireMatrixJumpBar(container);
  }
}

/* =====================================================================
   LÍNEA DE TIEMPO CONTINUA TIPO GOOGLE CALENDAR (DESIGN RICRA)
   ===================================================================== */

/**
 * Calcula los límites de horas (inicio y fin) de forma adaptativa según los
 * horarios reales de las clases ingresadas por el estudiante.
 */
function calcularLimitesTimeline(classes) {
  let minMinutes = 480;  // 08:00 AM por defecto
  let maxMinutes = 1320; // 10:00 PM por defecto

  if (classes && classes.length > 0) {
    const classStarts = classes.map(c => timeToMinutes(c.hora_inicio));
    const classEnds = classes.map(c => timeToMinutes(c.hora_fin));
    const earliest = Math.min(...classStarts);
    const latest = Math.max(...classEnds);

    let startH = Math.floor(earliest / 60);
    let endH = Math.ceil(latest / 60);

    // Permite adaptarse a horas reales: no antes de las 06:00 AM, no después de las 24:00
    startH = Math.max(6, Math.min(22, startH));
    endH = Math.min(24, Math.max(startH + 2, endH));

    minMinutes = startH * 60;
    maxMinutes = endH * 60;
  }

  const startHour = Math.floor(minMinutes / 60);
  const endHour = Math.ceil(maxMinutes / 60);
  return { startHour, endHour, totalHours: Math.max(1, endHour - startHour) };
}

/**
 * Posiciona los bloques de clase en una columna continua calculando su 'top'
 * y 'height' proporcionales al minuto exacto, y distribuyendo en columnas
 * paralelas las clases que tengan solapamiento temporal (algoritmo tipo Google Calendar).
 */
function computeDayEventPositions(dayClasses, startHour, pxPerMin) {
  if (!dayClasses || dayClasses.length === 0) return [];

  const events = dayClasses.map(c => {
    const start = timeToMinutes(c.hora_inicio);
    const end = Math.max(start + 15, timeToMinutes(c.hora_fin));
    return { classObj: c, start, end };
  }).sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const clusters = [];
  let currentCluster = [];
  let clusterEnd = -1;

  for (const ev of events) {
    if (currentCluster.length === 0) {
      currentCluster.push(ev);
      clusterEnd = ev.end;
    } else if (ev.start < clusterEnd) {
      currentCluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.end);
    } else {
      clusters.push(currentCluster);
      currentCluster = [ev];
      clusterEnd = ev.end;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const positioned = [];
  const startTimelineMin = startHour * 60;

  for (const cluster of clusters) {
    const columns = [];
    const eventCols = [];

    for (const ev of cluster) {
      let placed = false;
      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        if (columns[colIdx] <= ev.start) {
          columns[colIdx] = ev.end;
          eventCols.push({ ev, colIdx });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push(ev.end);
        eventCols.push({ ev, colIdx: columns.length - 1 });
      }
    }

    const totalCols = columns.length;
    for (const { ev, colIdx } of eventCols) {
      const top = Math.max(0, (ev.start - startTimelineMin) * pxPerMin);
      const height = Math.max(26, (ev.end - ev.start) * pxPerMin - 2);

      let leftStyle = "3px";
      let widthStyle = "calc(100% - 6px)";

      if (totalCols > 1) {
        const colWidthPct = 100 / totalCols;
        leftStyle = `calc(2px + ${colIdx * colWidthPct}%)`;
        widthStyle = `calc(${colWidthPct}% - 4px)`;
      }

      positioned.push({
        c: ev.classObj,
        top,
        height,
        leftStyle,
        widthStyle
      });
    }
  }

  return positioned;
}

function renderMatrixTableHTML(classes) {
  const hasSunday = classes.some(c => c.dia_semana === "DOMINGO");
  const hasSaturday = classes.some(c => c.dia_semana === "SABADO");

  const activeDays = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];
  if (hasSaturday || hasSunday) activeDays.push("SABADO");
  if (hasSunday) activeDays.push("DOMINGO");

  const bounds = calcularLimitesTimeline(classes);
  const { startHour, endHour, totalHours } = bounds;
  const PX_PER_HOUR = 60;
  const PX_PER_MIN = 1.0;
  const totalHeight = totalHours * PX_PER_HOUR;

  const classesByDay = {};
  activeDays.forEach(d => {
    classesByDay[d] = classes.filter(c => c.dia_semana === d);
  });

  const todayKey = getTodayDayKey();
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isTimeInRange = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;

  const hoursList = [];
  for (let h = startHour; h <= endHour; h++) {
    hoursList.push(h);
  }

  // Encabezados de días
  const headerDaysHtml = activeDays.map(d => {
    const isToday = d === todayKey;
    const count = classesByDay[d].length;
    const countLabel = count === 1 ? "1 clase" : `${count} clases`;
    return `
      <div class="gcal-header-day ${isToday ? "is-today" : ""}" data-day="${d}">
        <div class="gcal-day-title">${escapeHtml(d)}</div>
        <div class="gcal-day-meta">
          ${isToday ? `<span class="gcal-today-badge">Hoy</span>` : ""}
          <span class="gcal-day-count">${countLabel}</span>
        </div>
      </div>`;
  }).join("");

  // Ticks de la columna de tiempo (horas en punto en 12h)
  const timeTicksHtml = hoursList.map(h => {
    const topPx = (h - startHour) * PX_PER_HOUR;
    const label = formatMinutes12(h * 60);
    return `
      <div class="gcal-time-tick" style="top:${topPx}px;">
        <span class="gcal-time-tick-label">${label}</span>
      </div>`;
  }).join("");

  // Columnas de días continuas
  const dayColumnsHtml = activeDays.map(d => {
    const isToday = d === todayKey;
    const dayClasses = classesByDay[d];
    const positionedCards = computeDayEventPositions(dayClasses, startHour, PX_PER_MIN);

    let cardsHtml = "";
    positionedCards.forEach(({ c, top, height, leftStyle, widthStyle }) => {
      const color = normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO);
      const textColor = getContrastTextColor(color);
      const borderColor = darkenColor(color, 0.28);
      const rangoHora12 = formatTimeRange12(c.hora_inicio, c.hora_fin);

      cardsHtml += `
        <div class="matrix-cell-card gcal-event-card"
             data-id="${c.id}"
             style="top:${top}px; height:${height}px; left:${leftStyle}; width:${widthStyle}; background:${color}; color:${textColor}; border-color:${borderColor}; border-left-color:${borderColor};"
             title="${escapeHtml(c.materia)} (${rangoHora12})${c.aula ? ' · ' + escapeHtml(c.aula) : ''}${c.profesor ? ' · ' + escapeHtml(c.profesor) : ''}">
          <div class="matrix-cell-card-title">${escapeHtml(c.materia)}</div>
          <div class="matrix-cell-card-time">${rangoHora12}</div>
          ${c.aula ? `<div class="matrix-cell-card-aula" title="Aula: ${escapeHtml(c.aula)}"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${escapeHtml(c.aula)}</div>` : ""}
          ${c.profesor ? `<div class="matrix-cell-card-prof" title="Profesor: ${escapeHtml(c.profesor)}"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${escapeHtml(c.profesor)}</div>` : ""}
        </div>`;
    });

    // Línea indicadora de hora actual si el día es hoy
    let currentTimeLineHtml = "";
    if (isToday && isTimeInRange) {
      const curTop = Math.round((currentMinutes - startHour * 60) * PX_PER_MIN);
      currentTimeLineHtml = `
        <div class="gcal-current-time-line" style="top:${curTop}px;" title="Hora actual: ${formatMinutes12(currentMinutes)}">
          <span class="gcal-current-time-dot"></span>
        </div>`;
    }

    return `
      <div class="gcal-day-column ${isToday ? "is-today" : ""}" data-day="${d}" style="height:${totalHeight}px;">
        ${currentTimeLineHtml}
        ${cardsHtml}
      </div>`;
  }).join("");

  return `
    <div class="matrix-scroll-wrapper gcal-wrapper" id="gcal-scroll-wrapper">
      <div class="gcal-content" style="--gcal-days:${activeDays.length};">
        <!-- Fila de Encabezados (Sticky Top) -->
        <div class="gcal-header-row">
          <div class="gcal-corner-cell">HORA</div>
          <div class="gcal-days-header-strip">
            ${headerDaysHtml}
          </div>
        </div>

        <!-- Cuerpo Continuo Tipo Google Calendar -->
        <div class="gcal-body-row">
          <div class="gcal-time-column" style="height:${totalHeight}px;">
            ${timeTicksHtml}
          </div>
          <div class="gcal-days-canvas">
            ${dayColumnsHtml}
          </div>
        </div>
      </div>
    </div>
    <p class="form-hint" style="margin-top:10px;text-align:center">Toca cualquier clase para ver o editar sus detalles. Desliza horizontalmente para navegar entre días.</p>`;
}

function wireMatrixJumpBar(container) {
  const scrollWrapper = $(".matrix-scroll-wrapper", container);
  if (!scrollWrapper) return;

  // Actualizar visibilidad de chips de fin de semana según los días visibles en el DOM
  const hasSab = Boolean($('.gcal-day-column[data-day="SABADO"]', scrollWrapper));
  const hasDom = Boolean($('.gcal-day-column[data-day="DOMINGO"]', scrollWrapper));
  const chipSab = $('[data-jump="SABADO"]', $("#matrix-toolbar"));
  const chipDom = $('[data-jump="DOMINGO"]', $("#matrix-toolbar"));
  if (chipSab) chipSab.style.display = hasSab ? "" : "none";
  if (chipDom) chipDom.style.display = hasDom ? "" : "none";

  const jumpChips = $$(".matrix-jump-chip", $("#matrix-toolbar"));
  jumpChips.forEach(chip => {
    chip.onclick = () => {
      jumpChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const target = chip.dataset.jump;
      if (target === "all") {
        scrollWrapper.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const targetCol = $(`.gcal-day-column[data-day="${target}"]`, scrollWrapper);
        if (targetCol) {
          const wrapperRect = scrollWrapper.getBoundingClientRect();
          const colRect = targetCol.getBoundingClientRect();
          const timeCol = $(".gcal-time-column", scrollWrapper);
          const timeWidth = timeCol ? timeCol.offsetWidth : 72;
          const scrollDelta = colRect.left - wrapperRect.left - timeWidth;
          scrollWrapper.scrollBy({ left: scrollDelta, behavior: "smooth" });
        }
      }
    };
  });
}

/* =====================================================================
   INTERFAZ DEL SELECTOR Y FILTRO DE ASIGNATURAS (DESIGN RICRA)
   ===================================================================== */
function seleccionarFiltroAsignatura(subjectKey) {
  state.tasksMateriaFilter = subjectKey;
  const menu = $("#subject-dropdown-menu");
  const btn = $("#btn-subject-dropdown-toggle");
  if (menu) menu.classList.add("hidden");
  if (btn) {
    btn.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }
  renderTareas();
}

function renderSubjectFilterUI(subjectsList, allTasks, totalPendingCount, subjectMap) {
  const currentSub = state.tasksMateriaFilter ? subjectMap[state.tasksMateriaFilter] : null;

  // 1. Actualizar disparador / botón selector
  const dotEl = $("#subject-indicator-dot");
  const labelEl = $("#subject-current-label");
  const countEl = $("#subject-current-count");

  if (dotEl && labelEl && countEl) {
    if (currentSub) {
      dotEl.style.background = normalizarColorPastel(currentSub.color);
      labelEl.textContent = currentSub.materia;
      countEl.textContent = `${currentSub.taskCount}`;
    } else {
      dotEl.style.background = "var(--tea-green)";
      labelEl.textContent = "Todas las materias";
      countEl.textContent = `${totalPendingCount}`;
    }
  }

  // 2. Menú desplegable Popover
  const hintEl = $("#subject-dropdown-total-hint");
  if (hintEl) {
    hintEl.textContent = `${subjectsList.length} ${subjectsList.length === 1 ? "materia" : "materias"}`;
  }

  const optionsContainer = $("#subject-dropdown-options");
  if (optionsContainer) {
    const isAllSelected = !state.tasksMateriaFilter;
    let optionsHtml = `
      <div class="subject-dropdown-item ${isAllSelected ? "selected" : ""}" role="option" aria-selected="${isAllSelected ? "true" : "false"}" data-subject="">
        <span class="subject-item-indicator" style="background:var(--tea-green)"></span>
        <div class="subject-item-info">
          <span class="subject-item-title">Todas las materias</span>
          <span class="subject-item-sub">Ver tareas de todas las asignaturas (${allTasks.length} registradas)</span>
        </div>
        <span class="subject-item-count">${totalPendingCount}</span>
        ${isAllSelected ? `<svg class="subject-item-check" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>` : ""}
      </div>`;

    subjectsList.forEach(sub => {
      const isSelected = state.tasksMateriaFilter === sub.key;
      const subtitle = [sub.aula, sub.profesor].filter(Boolean).join(" · ") || "Asignatura del horario";
      const safeColor = normalizarColorPastel(sub.color);

      optionsHtml += `
        <div class="subject-dropdown-item ${isSelected ? "selected" : ""}" role="option" aria-selected="${isSelected ? "true" : "false"}" data-subject="${escapeHtml(sub.key)}">
          <span class="subject-item-indicator" style="background:${safeColor}"></span>
          <div class="subject-item-info">
            <span class="subject-item-title">${escapeHtml(sub.materia)}</span>
            <span class="subject-item-sub">${escapeHtml(subtitle)}</span>
          </div>
          <span class="subject-item-count">${sub.taskCount}</span>
          ${isSelected ? `<svg class="subject-item-check" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>` : ""}
        </div>`;
    });

    optionsContainer.innerHTML = optionsHtml;

    $$(".subject-dropdown-item", optionsContainer).forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        seleccionarFiltroAsignatura(item.dataset.subject);
      };
    });
  }

  // 3. Chips horizontales táctiles para celular
  const chipsContainer = $("#subject-quick-chips");
  if (chipsContainer) {
    if (subjectsList.length === 0) {
      chipsContainer.innerHTML = "";
    } else {
      let chipsHtml = `
        <button type="button" class="subject-quick-chip ${!state.tasksMateriaFilter ? "active" : ""}" data-subject="">
          <span class="subject-quick-chip-dot" style="background:var(--tea-green)"></span>
          <span>Todas</span>
          <span class="subject-quick-chip-count">${totalPendingCount}</span>
        </button>`;

      subjectsList.forEach(sub => {
        const isSelected = state.tasksMateriaFilter === sub.key;
        const safeColor = normalizarColorPastel(sub.color);
        chipsHtml += `
          <button type="button" class="subject-quick-chip ${isSelected ? "active" : ""}" data-subject="${escapeHtml(sub.key)}">
            <span class="subject-quick-chip-dot" style="background:${safeColor}"></span>
            <span>${escapeHtml(sub.materia)}</span>
            <span class="subject-quick-chip-count">${sub.taskCount}</span>
          </button>`;
      });

      chipsContainer.innerHTML = chipsHtml;

      $$(".subject-quick-chip", chipsContainer).forEach(chip => {
        chip.onclick = () => seleccionarFiltroAsignatura(chip.dataset.subject);
      });
    }
  }
}

/* =====================================================================
   9. VISTA: TAREAS (FILTROS Y ESCALA 1 A 5)
   ===================================================================== */
async function renderTareas() {
  const [rawTasks, { list: cursos, map: cursosMap }] = await Promise.all([db.tareas.toArray(), cargarCursos()]);
  const allTasks = rawTasks.map(t => enriquecerTarea(t, cursosMap));

  // Mapa de asignaturas por clave (id del curso, o "general" para tareas sin curso)
  const subjectMap = {};
  cursos.forEach(c => {
    subjectMap[c.id] = {
      key: c.id,
      materia: c.nombre,
      color: c.color || COLOR_CURSO_DEFECTO,
      aula: c.aula || "",
      profesor: c.profesor || "",
      taskCount: 0
    };
  });

  allTasks.forEach(t => {
    const key = t.curso_id && subjectMap[t.curso_id] ? t.curso_id : "general";
    if (!subjectMap[key]) {
      subjectMap[key] = { key, materia: "General", color: "#AFC49A", aula: "", profesor: "", taskCount: 0 };
    }
    t._subjectKey = key;
    if (!t.completada) subjectMap[key].taskCount++;
  });

  // Si el curso filtrado fue eliminado, volver a "Todas"
  if (state.tasksMateriaFilter && !subjectMap[state.tasksMateriaFilter]) state.tasksMateriaFilter = "";

  const subjectsList = Object.values(subjectMap).sort((a, b) => a.materia.localeCompare(b.materia, "es"));
  const totalPendingCount = allTasks.filter(t => !t.completada).length;
  actualizarBadgeTareas(totalPendingCount);

  renderSubjectFilterUI(subjectsList, allTasks, totalPendingCount, subjectMap);

  let list = allTasks;
  const nowMs = Date.now();

  if (state.tasksFilter === "pendientes") {
    list = list.filter(t => !t.completada);
  } else if (state.tasksFilter === "urgentes") {
    list = list.filter(t => !t.completada && t.importancia >= 4);
  } else if (state.tasksFilter === "proximas") {
    list = list.filter(t => {
      if (t.completada || !t.fecha_limite) return false;
      const diff = new Date(t.fecha_limite).getTime() - nowMs;
      return diff <= (72 * 60 * 60 * 1000);
    });
  } else if (state.tasksFilter === "completadas") {
    list = list.filter(t => t.completada);
  }

  if (state.tasksMateriaFilter) {
    list = list.filter(t => t._subjectKey === state.tasksMateriaFilter);
  }

  if (state.tasksSearchQuery) {
    const q = state.tasksSearchQuery.toLowerCase();
    list = list.filter(t => (t.titulo || "").toLowerCase().includes(q) || (t.materia || "").toLowerCase().includes(q));
  }

  list.sort((a, b) => {
    if (a.completada !== b.completada) return a.completada ? 1 : -1;
    const timeA = a.fecha_limite ? new Date(a.fecha_limite).getTime() : 9999999999999;
    const timeB = b.fecha_limite ? new Date(b.fecha_limite).getTime() : 9999999999999;
    if (Math.abs(timeA - timeB) < 1800000) {
      return b.importancia - a.importancia;
    }
    return timeA - timeB;
  });

  const listEl = $("#all-tasks-list");
  if (list.length === 0) {
    listEl.innerHTML = `
      <div class="empty-card">
        <div class="empty-card-icon-wrap">${ICONS.tasks}</div>
        <strong>No se encontraron tareas</strong>
        <p>No existen registros activos en la categoría seleccionada.</p>
      </div>`;
    return;
  }

  listEl.innerHTML = list.map(t => renderTaskCardHTML(t)).join("");
  wireTaskCardEvents(listEl);
}

function renderTaskCardHTML(t) {
  const imp = IMPORTANCIA_INFO[t.importancia] || IMPORTANCIA_INFO[3];
  const due = formatRelativeDue(t.fecha_limite);
  const dueClass = due.isUrgent ? "urgent" : (due.isSoon ? "soon" : "");

  return `
    <div class="task-card ${t.completada ? "completed" : ""}" data-id="${t.id}">
      <div class="task-check-circle" data-action="toggle" title="Alternar estado de finalización">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="task-card-content" data-action="edit">
        <div class="task-card-header">
          <div class="task-card-title">${escapeHtml(t.titulo)}</div>
        </div>
        ${t.notas ? `<div class="task-card-desc">${escapeHtml(t.notas)}</div>` : ""}
        <div class="task-card-meta">
          <span class="subject-pill">${escapeHtml(t.materia || "General")}</span>
          <span class="importance-gauge ${imp.class}">${imp.badge}</span>
          <span class="due-badge ${dueClass}">${ICONS.clock} ${due.text}</span>
        </div>
      </div>
    </div>`;
}

function wireTaskCardEvents(containerEl) {
  $$('[data-action="toggle"]', containerEl).forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const card = btn.closest(".task-card");
      const id = card.dataset.id;
      const task = await db.tareas.get(id);
      if (!task) return;
      const nextStatus = !task.completada;
      await db.tareas.update(id, { completada: nextStatus });
      showToast(nextStatus ? "Tarea marcada como completada." : "Tarea reabierta.");
      if (typeof reprogramarTodo === "function") reprogramarTodo();
      if (state.currentTab === "view-hoy") renderHoy();
      else renderTareas();
    });
  });

  $$('[data-action="edit"]', containerEl).forEach(el => {
    el.addEventListener("click", () => {
      const card = el.closest(".task-card");
      openEditTaskModal(card.dataset.id);
    });
  });
}

/* =====================================================================
   9.5 VISTA: MIS CURSOS Y NOTAS
   ===================================================================== */
function refrescarVistaActual() {
  const t = state.currentTab;
  if (t === "view-hoy") renderHoy();
  else if (t === "view-horario") renderHorario();
  else if (t === "view-cursos") renderCursos();
  else if (t === "view-tareas") renderTareas();
}

async function renderCursos() {
  const [{ list: cursos }, clases] = await Promise.all([cargarCursos(), db.clases.toArray()]);
  const resumenEl = $("#cursos-resumen");
  const listEl = $("#cursos-list");

  if (cursos.length === 0) {
    resumenEl.innerHTML = "";
    resumenEl.classList.add("hidden");
    listEl.innerHTML = `
      <div class="empty-card">
        <div class="empty-card-icon-wrap">${ICONS.book}</div>
        <strong>Aún no registras cursos</strong>
        <p>Registra cada curso una sola vez con su profesor, aula y color. Luego armas el horario eligiendo el curso y la hora, y aquí llevas tus notas.</p>
        <button class="btn-primary btn-sm" id="btn-add-curso-empty" style="margin-top:10px;">Registrar Curso</button>
      </div>`;
    $("#btn-add-curso-empty", listEl).addEventListener("click", () => openNewCursoModal());
    return;
  }

  const sesionesPorCurso = {};
  clases.forEach(c => {
    const s = sesionesPorCurso[c.curso_id] || (sesionesPorCurso[c.curso_id] = { count: 0, minutos: 0 });
    s.count++;
    s.minutos += Math.max(0, timeToMinutes(c.hora_fin) - timeToMinutes(c.hora_inicio));
  });

  const filas = cursos.map(c => ({
    curso: c,
    r: calcularRendimiento(c.evaluacion),
    sesiones: sesionesPorCurso[c.id] || { count: 0, minutos: 0 }
  }));

  resumenEl.classList.remove("hidden");
  renderResumenCiclo(filas.map(f => f.r));

  listEl.innerHTML = filas.map(f => renderCursoCardHTML(f.curso, f.r, f.sesiones)).join("");

  $$('[data-action="notas"]', listEl).forEach(btn => {
    btn.addEventListener("click", () => openNotasModal(btn.closest(".course-card").dataset.id));
  });
  $$('[data-action="edit-curso"]', listEl).forEach(btn => {
    btn.addEventListener("click", () => openEditCursoModal(btn.closest(".course-card").dataset.id));
  });
}

function renderResumenCiclo(resultados) {
  const completos = resultados.filter(r => r.promedio !== null);
  const aprobados = resultados.filter(r => r.estado === "aprobado" || r.estado === "asegurado").length;
  const enRiesgo = resultados.filter(r => ["en-riesgo", "sin-opcion", "desaprobado"].includes(r.estado)).length;
  const promedioCiclo = completos.length
    ? completos.reduce((acc, r) => acc + r.promedio, 0) / completos.length
    : null;

  $("#cursos-resumen").innerHTML = `
    <div class="overview-tile">
      <span class="overview-value">${resultados.length}</span>
      <span class="overview-label">Cursos</span>
    </div>
    <div class="overview-tile st-ok">
      <span class="overview-value">${aprobados}</span>
      <span class="overview-label">Aprobados</span>
    </div>
    <div class="overview-tile ${enRiesgo ? "st-warn" : ""}">
      <span class="overview-value">${enRiesgo}</span>
      <span class="overview-label">En riesgo</span>
    </div>
    <div class="overview-tile" title="Promedio simple de los cursos con las 3 notas completas">
      <span class="overview-value">${formatNota(promedioCiclo)}</span>
      <span class="overview-label">Prom. ciclo${completos.length ? ` (${completos.length})` : ""}</span>
    </div>`;
}

function gradeCellHTML(label, valor) {
  return `
    <span class="grade-cell ${valor === null ? "is-empty" : ""}">
      <span class="grade-cell-label">${label}</span>
      <span class="grade-cell-value">${formatNota(valor)}</span>
    </span>`;
}

function renderCursoCardHTML(c, r, ses) {
  const info = ESTADO_NOTA_INFO[r.estado];
  const color = escapeHtml(c.color || COLOR_CURSO_DEFECTO);
  const horas = ses.minutos ? `${Number((ses.minutos / 60).toFixed(1))} h/sem` : "";
  const sesionesTxt = ses.count
    ? `${ses.count} ${ses.count === 1 ? "sesión" : "sesiones"}${horas ? " · " + horas : ""}`
    : "Sin horario";
  const ppLabel = r.practicasTotal ? `Prácticas ${r.practicasCalificadas}/${r.practicasTotal}` : "Prácticas";
  const tienePromedio = r.promedio !== null;
  const valorCentral = tienePromedio ? r.promedio : (r.estado === "sin-notas" ? null : r.acumulado);
  const nombre = escapeHtml(c.nombre);

  return `
    <article class="course-card" data-id="${escapeHtml(c.id)}">
      <span class="class-card-stripe" style="background:${color}"></span>
      <button type="button" class="course-card-main" data-action="notas" aria-label="Ver y registrar notas de ${nombre}">
        <span class="course-card-head">
          <span class="class-card-title">${nombre}</span>
          <span class="class-card-details">
            ${c.profesor ? `<span class="class-detail-tag">${ICONS.person} ${escapeHtml(c.profesor)}</span>` : ""}
            ${c.aula ? `<span class="class-detail-tag">${ICONS.location} ${escapeHtml(c.aula)}</span>` : ""}
            <span class="class-detail-tag">${ICONS.layers} ${sesionesTxt}</span>
          </span>
        </span>
        <span class="grade-strip">
          ${gradeCellHTML("Parcial", r.parcial)}
          ${gradeCellHTML(ppLabel, r.pp)}
          ${gradeCellHTML("Final", r.final)}
          <span class="grade-cell grade-cell-avg ${info.tone}">
            <span class="grade-cell-label">${tienePromedio ? "Promedio" : "Acumulado"}</span>
            <span class="grade-cell-value">${formatNota(valorCentral)}</span>
          </span>
        </span>
        <span class="course-card-footer">
          <span class="grade-status-pill ${info.tone}">${info.label}</span>
          <span class="course-hint">${escapeHtml(mensajeRendimiento(r))}</span>
        </span>
      </button>
      <button type="button" class="icon-btn course-edit-btn" data-action="edit-curso" aria-label="Editar datos de ${nombre}" title="Editar curso">${ICONS.edit}</button>
    </article>`;
}

/* =====================================================================
   9.6 MODAL: NUEVO / EDITAR CURSO (CATÁLOGO)
   ===================================================================== */
function setCursoColor(color) {
  $("#curso-color").value = color;
  $$(".color-swatch", $("#curso-color-picker")).forEach(s => {
    s.classList.toggle("selected", s.dataset.color === color);
  });
}

async function openNewCursoModal(origin) {
  state.cursoModalOrigin = origin || null;
  $("#modal-curso-title").textContent = "Nuevo Curso";
  $("#curso-id").value = "";
  $("#curso-nombre").value = "";
  $("#curso-profesor").value = "";
  $("#curso-aula").value = "";
  $("#curso-creditos").value = "3";
  $("#curso-notas").value = "";
  $("#curso-form-error").classList.add("hidden");
  $("#btn-delete-curso").classList.add("hidden");
  $("#curso-sesiones-info").classList.add("hidden");

  // Proponer un color que aún no use otro curso
  const usados = new Set((await db.cursos.toArray()).map(c => c.color));
  const paleta = $$(".color-swatch", $("#curso-color-picker")).map(s => s.dataset.color);
  setCursoColor(paleta.find(c => !usados.has(c)) || paleta[0]);

  $("#modal-curso-backdrop").classList.remove("hidden");
  $("#curso-nombre").focus();
}

async function openEditCursoModal(id) {
  const c = await db.cursos.get(id);
  if (!c) return;
  state.cursoModalOrigin = null;

  $("#modal-curso-title").textContent = "Editar Curso";
  $("#curso-id").value = c.id;
  $("#curso-nombre").value = c.nombre || "";
  $("#curso-profesor").value = c.profesor || "";
  $("#curso-aula").value = c.aula || "";
  $("#curso-creditos").value = c.creditos || 3;
  $("#curso-notas").value = c.notas || "";
  setCursoColor(c.color || COLOR_CURSO_DEFECTO);
  $("#curso-form-error").classList.add("hidden");
  $("#btn-delete-curso").classList.remove("hidden");

  const sesiones = await db.clases.where("curso_id").equals(id).count();
  const infoEl = $("#curso-sesiones-info");
  infoEl.textContent = sesiones
    ? `Aparece en ${sesiones} ${sesiones === 1 ? "sesión" : "sesiones"} del horario. Los cambios se reflejan en todas.`
    : "Este curso aún no tiene horario asignado.";
  infoEl.classList.remove("hidden");

  $("#modal-curso-backdrop").classList.remove("hidden");
}

function closeCursoModal() {
  $("#modal-curso-backdrop").classList.add("hidden");
  state.cursoModalOrigin = null;
}

async function guardarCurso(e) {
  e.preventDefault();
  const id = $("#curso-id").value;
  const nombre = $("#curso-nombre").value.trim();
  const errorEl = $("#curso-form-error");
  errorEl.classList.add("hidden");

  if (!nombre) {
    errorEl.textContent = "El nombre del curso es obligatorio.";
    errorEl.classList.remove("hidden");
    return;
  }

  const existentes = await db.cursos.toArray();
  const duplicado = existentes.find(c => c.id !== id && normalizarNombre(c.nombre) === normalizarNombre(nombre));
  if (duplicado) {
    errorEl.textContent = `Ya tienes registrado el curso "${duplicado.nombre}".`;
    errorEl.classList.remove("hidden");
    return;
  }

  const creditosRaw = parseInt($("#curso-creditos").value, 10);
  const creditos = Number.isFinite(creditosRaw) && creditosRaw > 0 ? Math.min(10, Math.max(1, creditosRaw)) : 3;

  const previo = id ? existentes.find(c => c.id === id) : null;
  const curso = {
    id: id || uuid(),
    nombre,
    profesor: $("#curso-profesor").value.trim(),
    aula: $("#curso-aula").value.trim(),
    color: $("#curso-color").value || COLOR_CURSO_DEFECTO,
    creditos,
    notas: $("#curso-notas").value.trim(),
    evaluacion: (previo && previo.evaluacion) || evaluacionVacia()
  };

  await db.cursos.put(curso);
  const origin = state.cursoModalOrigin;
  closeCursoModal();
  showToast(previo ? "Curso actualizado." : "Curso registrado.");

  if (origin === "clase") {
    // Volver al formulario de clase con el curso recién creado ya elegido
    await populateClassCursoSelect(curso.id);
  } else if (origin && origin.abrirClase) {
    await openNewClassModal(origin.dia, curso.id);
  }
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  refrescarVistaActual();
}

async function eliminarCurso() {
  const id = $("#curso-id").value;
  if (!id) return;
  const curso = await db.cursos.get(id);
  if (!curso) return;

  const [nClases, nTareas] = await Promise.all([
    db.clases.where("curso_id").equals(id).count(),
    db.tareas.where("curso_id").equals(id).count()
  ]);

  let msg = `Se eliminará "${curso.nombre}" con sus notas`;
  msg += nClases ? ` y sus ${nClases} ${nClases === 1 ? "sesión" : "sesiones"} del horario.` : ".";
  if (nTareas) msg += ` ${nTareas} ${nTareas === 1 ? "tarea pasará" : "tareas pasarán"} a General.`;

  const ok = await confirmDialog("Eliminar Curso", msg);
  if (!ok) return;

  await db.transaction("rw", db.cursos, db.clases, db.tareas, async () => {
    await db.clases.where("curso_id").equals(id).delete();
    await db.tareas.where("curso_id").equals(id).modify({ curso_id: "" });
    await db.cursos.delete(id);
  });

  closeCursoModal();
  showToast("Curso eliminado.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  refrescarVistaActual();
}

/* =====================================================================
   9.7 MODAL: REGISTRO DE NOTAS (PARCIAL, FINAL Y PRÁCTICAS)
   ===================================================================== */
function practicaRowHTML(p, idx) {
  const titulo = p.titulo || `Práctica ${idx + 1}`;
  const nota = p.nota === null || p.nota === undefined ? "" : p.nota;
  return `
    <div class="practica-row" data-id="${escapeHtml(p.id || uuid())}">
      <input type="text" class="field practica-titulo" value="${escapeHtml(titulo)}" maxlength="40" aria-label="Nombre de la evaluación ${idx + 1}">
      <input type="number" class="field grade-input practica-nota" value="${escapeHtml(nota)}" min="0" max="20" step="0.01" inputmode="decimal" placeholder="—" aria-label="Nota de la evaluación ${idx + 1}">
      <button type="button" class="icon-btn practica-remove" aria-label="Quitar evaluación ${idx + 1}" title="Quitar">${ICONS.close}</button>
    </div>`;
}

function renderPracticasRows(practicas) {
  const list = $("#practicas-list");
  list.innerHTML = practicas.length
    ? practicas.map((p, i) => practicaRowHTML(p, i)).join("")
    : `<p class="practicas-empty">Aún no agregas prácticas. Pueden ser prácticas calificadas, tareas, laboratorios o trabajos: todas se promedian.</p>`;
}

/** Lee y valida el formulario de notas. Las notas fuera de 0–20 se marcan y no se cuentan. */
function leerEvaluacionDelFormulario() {
  const errores = [];
  const validar = (input, nombre) => {
    input.classList.remove("invalid");
    if (input.validity && input.validity.badInput) {
      input.classList.add("invalid");
      errores.push(`${nombre}: escribe un número válido.`);
      return null;
    }
    const raw = input.value.trim();
    if (raw === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > NOTA_MAX) {
      input.classList.add("invalid");
      errores.push(`${nombre}: la nota debe estar entre 0 y ${NOTA_MAX}.`);
      return null;
    }
    return Math.round(n * 100) / 100;
  };

  const parcial = validar($("#nota-parcial"), "Examen parcial");
  const final = validar($("#nota-final"), "Examen final");
  const practicas = $$(".practica-row", $("#practicas-list")).map((row, i) => {
    const titulo = $(".practica-titulo", row).value.trim() || `Práctica ${i + 1}`;
    return { id: row.dataset.id || uuid(), titulo, nota: validar($(".practica-nota", row), titulo) };
  });

  return { evaluacion: { parcial, final, practicas }, errores };
}

function actualizarResumenNotas() {
  const { evaluacion } = leerEvaluacionDelFormulario();
  const r = calcularRendimiento(evaluacion);
  const info = ESTADO_NOTA_INFO[r.estado];
  const tienePromedio = r.promedio !== null;
  const valor = tienePromedio ? r.promedio : r.acumulado;
  const etiqueta = tienePromedio ? "Promedio final" : "Acumulado";
  const pct = Math.min(100, Math.max(0, (valor / NOTA_MAX) * 100));
  const marca = (NOTA_APROBATORIA / NOTA_MAX) * 100;
  const valorTxt = r.estado === "sin-notas" ? "—" : formatNota(valor);

  const resumenEl = $("#notas-resumen");
  resumenEl.className = `grade-summary ${info.tone}`;
  resumenEl.innerHTML = `
    <div class="grade-summary-top">
      <div class="grade-summary-main">
        <span class="grade-summary-label">${etiqueta}</span>
        <span class="grade-summary-value">${valorTxt}<small>/ 20</small></span>
      </div>
      <span class="grade-status-pill ${info.tone}">${info.label}</span>
    </div>
    <div class="grade-progress" role="img" aria-label="${etiqueta}: ${valorTxt} de 20. Mínimo aprobatorio ${NOTA_APROBATORIA}.">
      <div class="grade-progress-fill" style="width:${pct}%"></div>
      <span class="grade-progress-mark" style="left:${marca}%"></span>
    </div>
    <div class="grade-progress-scale" aria-hidden="true">
      <span>0</span>
      <span class="grade-progress-scale-mark" style="left:${marca}%">${NOTA_APROBATORIA}</span>
      <span>20</span>
    </div>
    <p class="grade-summary-msg">${escapeHtml(mensajeRendimiento(r))}</p>`;

  const ppEl = $("#practicas-promedio");
  ppEl.textContent = r.pp === null
    ? "Promedio: —"
    : `Promedio: ${formatNota(r.pp)}${r.ppProvisional ? ` (${r.practicasCalificadas} de ${r.practicasTotal})` : ""}`;
}

async function openNotasModal(id) {
  const curso = await db.cursos.get(id);
  if (!curso) return;
  const ev = curso.evaluacion || evaluacionVacia();

  $("#notas-curso-id").value = id;
  $("#modal-notas-title").textContent = curso.nombre;
  $("#notas-curso-sub").textContent = [curso.profesor, curso.aula].filter(Boolean).join(" · ") || "Registro de notas";
  $("#notas-curso-dot").style.background = curso.color || COLOR_CURSO_DEFECTO;
  $("#nota-parcial").value = ev.parcial === null || ev.parcial === undefined ? "" : ev.parcial;
  $("#nota-final").value = ev.final === null || ev.final === undefined ? "" : ev.final;
  renderPracticasRows(Array.isArray(ev.practicas) ? ev.practicas : []);
  $("#notas-form-error").classList.add("hidden");
  actualizarResumenNotas();
  $$(".field.invalid", $("#form-notas")).forEach(f => f.classList.remove("invalid"));

  $("#modal-notas-backdrop").classList.remove("hidden");
}

function closeNotasModal() {
  $("#modal-notas-backdrop").classList.add("hidden");
}

function agregarPractica() {
  const list = $("#practicas-list");
  const empty = $(".practicas-empty", list);
  if (empty) empty.remove();
  const idx = $$(".practica-row", list).length;
  list.insertAdjacentHTML("beforeend", practicaRowHTML({ id: uuid(), titulo: `Práctica ${idx + 1}`, nota: null }, idx));
  $(".practica-nota", list.lastElementChild).focus();
  actualizarResumenNotas();
}

async function guardarNotas(e) {
  e.preventDefault();
  const id = $("#notas-curso-id").value;
  const errorEl = $("#notas-form-error");
  const { evaluacion, errores } = leerEvaluacionDelFormulario();

  if (errores.length) {
    errorEl.textContent = errores[0] + (errores.length > 1 ? ` (y ${errores.length - 1} más)` : "");
    errorEl.classList.remove("hidden");
    return;
  }
  errorEl.classList.add("hidden");

  await db.cursos.update(id, { evaluacion });
  closeNotasModal();
  showToast("Notas guardadas.");
  refrescarVistaActual();
}

/* =====================================================================
   10. MODAL: AGREGAR / EDITAR CLASE (HORARIO)
   Solo se elige el curso ya registrado + día + horas. El aula es opcional
   y solo se guarda si esa sesión es en un aula distinta a la habitual.
   ===================================================================== */
async function populateClassCursoSelect(selectedId) {
  const { list } = await cargarCursos();
  const sel = $("#class-curso");
  sel.innerHTML =
    `<option value="" disabled ${selectedId ? "" : "selected"}>Elige un curso…</option>` +
    list.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? "selected" : ""}>${escapeHtml(c.nombre)}</option>`).join("");
  await actualizarPreviewCursoClase();
}

async function actualizarPreviewCursoClase() {
  const id = $("#class-curso").value;
  const el = $("#class-curso-preview");
  const curso = id ? await db.cursos.get(id) : null;

  if (!curso) {
    el.classList.add("hidden");
    el.innerHTML = "";
    $("#class-aula").placeholder = "Aula habitual del curso";
    return;
  }

  const detalle = [curso.profesor, curso.aula].filter(Boolean).join(" · ") || "Sin profesor ni aula registrados";
  el.innerHTML = `
    <span class="curso-preview-dot" style="background:${escapeHtml(curso.color || COLOR_CURSO_DEFECTO)}"></span>
    <span class="curso-preview-text">
      <strong>${escapeHtml(curso.nombre)}</strong>
      <span>${escapeHtml(detalle)}</span>
    </span>`;
  el.classList.remove("hidden");
  $("#class-aula").placeholder = curso.aula ? `Habitual: ${curso.aula}` : "Ej: Aula 204, Lab B (opcional)";
}

function actualizarHintsHoraClase() {
  const hIni = $("#hint-hora-inicio");
  const hFin = $("#hint-hora-fin");
  if (hIni) hIni.textContent = formatTime12($("#class-hora-inicio").value || "08:00");
  if (hFin) hFin.textContent = formatTime12($("#class-hora-fin").value || "10:00");
}

async function openNewClassModal(preselectedDay, preselectedCursoId) {
  const dia = preselectedDay || state.selectedDay || "LUNES";
  const count = await db.cursos.count();
  if (count === 0) {
    showToast("Primero registra el curso; luego le asignas la hora.");
    openNewCursoModal({ abrirClase: true, dia });
    return;
  }

  $("#modal-class-title").textContent = "Añadir Clase al Horario";
  $("#class-id").value = "";
  $("#class-dia").value = dia;
  $("#class-hora-inicio").value = "08:00";
  $("#class-hora-fin").value = "10:00";
  $("#class-aula").value = "";
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.add("hidden");
  actualizarHintsHoraClase();

  await populateClassCursoSelect(preselectedCursoId || "");
  $("#modal-class-backdrop").classList.remove("hidden");
  $("#class-curso").focus();
}

async function openEditClassModal(id) {
  const c = await db.clases.get(id);
  if (!c) return;

  $("#modal-class-title").textContent = "Editar Clase";
  $("#class-id").value = c.id;
  $("#class-dia").value = c.dia_semana || "LUNES";
  $("#class-hora-inicio").value = to24Hour(c.hora_inicio || "08:00");
  $("#class-hora-fin").value = to24Hour(c.hora_fin || "10:00");
  $("#class-aula").value = c.aula || "";
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.remove("hidden");
  actualizarHintsHoraClase();

  await populateClassCursoSelect(c.curso_id);
  $("#modal-class-backdrop").classList.remove("hidden");
}

function closeClassModal() {
  $("#modal-class-backdrop").classList.add("hidden");
}

/* =====================================================================
   11. MODAL: AGREGAR / EDITAR TAREA
   ===================================================================== */
async function populateTaskSubjectSelect(currentCursoId) {
  const { list } = await cargarCursos();
  const sel = $("#task-curso");
  sel.innerHTML = `<option value="">General / Otra</option>` +
    list.map(c => `<option value="${escapeHtml(c.id)}" ${c.id === currentCursoId ? "selected" : ""}>${escapeHtml(c.nombre)}</option>`).join("");
}

function openNewTaskModal(defaultCursoId) {
  $("#modal-task-title").textContent = "Nueva Tarea";
  $("#task-id").value = "";
  $("#task-titulo").value = "";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);
  const isoLocal = `${tomorrow.getFullYear()}-${pad2(tomorrow.getMonth()+1)}-${pad2(tomorrow.getDate())}T23:59`;
  $("#task-fecha").value = isoLocal;

  $("#task-importancia").value = "3";
  setImportanceStars(3);

  $("#task-descripcion").value = "";
  $("#task-completada").checked = false;
  $("#task-form-error").classList.add("hidden");
  $("#btn-delete-task").classList.add("hidden");

  populateTaskSubjectSelect(defaultCursoId || "");
  $("#modal-task-backdrop").classList.remove("hidden");
  $("#task-titulo").focus();
}

async function openEditTaskModal(id) {
  const t = await db.tareas.get(id);
  if (!t) return;

  $("#modal-task-title").textContent = "Editar Tarea";
  $("#task-id").value = t.id;
  $("#task-titulo").value = t.titulo || "";
  $("#task-fecha").value = t.fecha_limite || "";
  $("#task-importancia").value = t.importancia || 3;
  setImportanceStars(t.importancia || 3);
  $("#task-descripcion").value = t.notas || "";
  $("#task-completada").checked = !!t.completada;
  $("#task-form-error").classList.add("hidden");
  $("#btn-delete-task").classList.remove("hidden");

  await populateTaskSubjectSelect(t.curso_id || "");
  $("#modal-task-backdrop").classList.remove("hidden");
}

function closeTaskModal() {
  $("#modal-task-backdrop").classList.add("hidden");
}

function setImportanceStars(val) {
  $("#task-importancia").value = val;
  $$(".imp-star-btn", $("#task-importance-selector")).forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.val) === parseInt(val));
  });
  const info = IMPORTANCIA_INFO[val] || IMPORTANCIA_INFO[3];
  $("#imp-hint-label").textContent = info.hint;
}

/* =====================================================================
   12. VISTA: AJUSTES, COMPARTIR & BACKUPS
   ===================================================================== */
function renderAjustes() {
  cargarAjustesUI();
  if (navigator.storage && navigator.storage.persisted) {
    navigator.storage.persisted().then(persisted => {
      const dot = $("#db-indicator-dot");
      const text = $("#db-indicator-text");
      if (persisted) {
        dot.className = "db-indicator ok";
        text.textContent = "Almacenamiento persistente activo en el dispositivo";
      } else {
        dot.className = "db-indicator";
        dot.style.background = "var(--status-warning)";
        text.textContent = "Almacenamiento estándar activo";
      }
    });
  }
}

async function getAjuste(clave, fallback) {
  try {
    const entry = await db.ajustes.get(clave);
    return entry !== undefined ? entry.valor : fallback;
  } catch {
    return fallback;
  }
}

async function setAjuste(clave, valor) {
  try {
    await db.ajustes.put({ clave, valor });
  } catch (err) {
    console.warn("Error guardando ajuste:", clave, err);
  }
}

async function cargarAjustesUI() {
  const defaults = typeof getAjustesDefaults === "function" ? getAjustesDefaults() : {};
  let ajustesList = [];
  try {
    ajustesList = await db.ajustes.toArray();
  } catch (err) {
    console.warn("Error cargando ajustes:", err);
  }

  const map = { ...defaults };
  ajustesList.forEach(a => {
    map[a.clave] = a.valor;
  });

  const setVal = (id, val) => { const el = $(id); if (el) el.value = val ?? ""; };
  const setChk = (id, val) => { const el = $(id); if (el) el.checked = Boolean(val); };

  setVal("#ajuste-ciclo-inicio", map.ciclo_inicio);
  setVal("#ajuste-ciclo-fin", map.ciclo_fin);
  setVal("#ajuste-limite-faltas", map.limite_faltas_pct ?? 30);

  setChk("#ajuste-notif-clases", map.notif_clases);
  setChk("#ajuste-notif-tareas", map.notif_tareas);
  setChk("#ajuste-notif-urgentes", map.notif_urgentes);
  setChk("#ajuste-nivel5-silencio", map.nivel5_ignora_silencio);
  setChk("#ajuste-resumen-activo", map.resumen_activo);

  setVal("#ajuste-resumen-hora", map.resumen_hora ?? "07:00");
  setVal("#ajuste-silencio-desde", map.silencio_desde ?? "22:00");
  setVal("#ajuste-silencio-hasta", map.silencio_hasta ?? "07:00");

  setVal("#ajuste-huecos-desde", map.huecos_ventana_desde ?? "07:00");
  setVal("#ajuste-huecos-hasta", map.huecos_ventana_hasta ?? "22:00");
  setVal("#ajuste-huecos-min", map.huecos_min ?? 30);
}

async function guardarAjustesUI() {
  const getVal = (id, dflt) => $(id) ? $(id).value : dflt;
  const getChk = (id, dflt) => $(id) ? $(id).checked : dflt;

  const inicio = getVal("#ajuste-ciclo-inicio", "");
  const fin = getVal("#ajuste-ciclo-fin", "");
  if (inicio && fin && inicio >= fin) {
    alert("La fecha de inicio del ciclo debe ser anterior a la fecha de fin.");
    return;
  }

  const updates = {
    ciclo_inicio: inicio || null,
    ciclo_fin: fin || null,
    limite_faltas_pct: parseInt(getVal("#ajuste-limite-faltas", "30"), 10) || 30,
    notif_clases: getChk("#ajuste-notif-clases", true),
    notif_tareas: getChk("#ajuste-notif-tareas", true),
    notif_urgentes: getChk("#ajuste-notif-urgentes", true),
    nivel5_ignora_silencio: getChk("#ajuste-nivel5-silencio", true),
    resumen_activo: getChk("#ajuste-resumen-activo", true),
    resumen_hora: getVal("#ajuste-resumen-hora", "07:00"),
    silencio_desde: getVal("#ajuste-silencio-desde", "22:00"),
    silencio_hasta: getVal("#ajuste-silencio-hasta", "07:00"),
    huecos_ventana_desde: getVal("#ajuste-huecos-desde", "07:00"),
    huecos_ventana_hasta: getVal("#ajuste-huecos-hasta", "22:00"),
    huecos_min: parseInt(getVal("#ajuste-huecos-min", "30"), 10) || 30
  };

  const clean = typeof sanitizarAjustes === "function" ? sanitizarAjustes(updates) : updates;
  for (const [clave, valor] of Object.entries(clean)) {
    await db.ajustes.put({ clave, valor });
  }

  showToast("Ajustes guardados correctamente.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
}

async function exportScheduleForFriends() {
  const [{ list: cursos, map: cursosMap }, classes] = await Promise.all([
    cargarCursos(),
    db.clases.toArray()
  ]);

  if (classes.length === 0 && cursos.length === 0) {
    showToast("No hay cursos ni horario para compartir.", true);
    return;
  }

  // Exporta cursos sin las notas personales + sesiones enriquecidas en formato 12h AM/PM y colores pasteles
  const exportPayload = {
    tipo: "unumbral-horario-compartido",
    version: 2,
    fecha_creacion: new Date().toISOString(),
    cursos: cursos.map(c => ({
      nombre: c.nombre,
      profesor: c.profesor || "",
      aula: c.aula || "",
      color: normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO),
      notas: c.notas || ""
    })),
    clases: classes.map(c => {
      const cur = cursosMap[c.curso_id];
      return {
        materia: cur ? cur.nombre : "Curso",
        dia_semana: c.dia_semana,
        hora_inicio: formatTime12(c.hora_inicio),
        hora_fin: formatTime12(c.hora_fin),
        aula: c.aula || (cur && cur.aula) || "",
        profesor: (cur && cur.profesor) || "",
        color: normalizarColorPastel((cur && cur.color) || COLOR_CURSO_DEFECTO),
        notas: (cur && cur.notas) || ""
      };
    })
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `UNUmbral_Horario_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Archivo de horario exportado.");
}

async function importScheduleFromFriends(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || (!Array.isArray(data.clases) && !Array.isArray(data.cursos))) {
      throw new Error("El archivo no tiene el formato de horario compatible.");
    }

    const totalClases = Array.isArray(data.clases) ? data.clases.length : 0;
    const confirm = await confirmDialog(
      "Importar Horario",
      `Se incorporarán los cursos y ${totalClases} sesiones al horario. ¿Deseas continuar?`
    );
    if (!confirm) return;

    const existentes = await db.cursos.toArray();
    const r = convertirFormatoPlano(data.clases || [], [], existentes, data.cursos || []);

    await db.transaction("rw", db.cursos, db.clases, async () => {
      if (r.cursosNuevos.length) await db.cursos.bulkPut(r.cursosNuevos);
      for (const c of r.clases) {
        await db.clases.put({ ...c, id: uuid() });
      }
    });

    showToast(`Horario importado (${r.cursosNuevos.length} cursos nuevos, ${r.clases.length} clases).`);
    switchTab("view-horario");
  } catch (err) {
    console.error(err);
    showToast("Error al importar el archivo: " + err.message, true);
  }
}

async function exportFullBackup() {
  const [cursos, classes, tasks, eventos, asistencia, excepciones, ajustes] = await Promise.all([
    db.cursos.toArray(),
    db.clases.toArray(),
    db.tareas.toArray(),
    db.eventos.toArray(),
    db.asistencia.toArray(),
    db.excepciones.toArray(),
    db.ajustes.toArray()
  ]);

  const payload = {
    tipo: "unumbral-backup-total",
    version: 4,
    fecha_creacion: new Date().toISOString(),
    cursos,
    clases: classes,
    tareas: tasks,
    eventos: eventos || [],
    asistencia: asistencia || [],
    excepciones: excepciones || [],
    ajustes: ajustes || []
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `UNUmbral_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia de seguridad generada.");
}

async function importFullBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || (!data.cursos && !data.clases && !data.tareas)) {
      throw new Error("El archivo no corresponde a un respaldo válido de UNUmbral.");
    }

    const ok = await confirmDialog(
      "Restaurar Copia",
      "Esto integrará los cursos, notas, clases, tareas, eventos y asistencia del respaldo a la base de datos actual. ¿Continuar?"
    );
    if (!ok) return;

    await db.transaction("rw", [db.cursos, db.clases, db.tareas, db.eventos, db.asistencia, db.excepciones, db.ajustes], async () => {
      if (Array.isArray(data.cursos) && data.cursos.length > 0) {
        const cursosSanitizados = data.cursos.map(sanitizarCursoImportado).filter(Boolean);
        if (cursosSanitizados.length) await db.cursos.bulkPut(cursosSanitizados);
      }
      const existentes = await db.cursos.toArray();
      const r = convertirFormatoPlano(data.clases || [], data.tareas || [], existentes, []);
      if (r.cursosNuevos.length) await db.cursos.bulkPut(r.cursosNuevos);
      if (r.clases.length) await db.clases.bulkPut(r.clases);
      if (r.tareas.length) await db.tareas.bulkPut(r.tareas);

      if (Array.isArray(data.eventos) && data.eventos.length) {
        await db.eventos.bulkPut(data.eventos);
      }
      if (Array.isArray(data.asistencia) && data.asistencia.length) {
        await db.asistencia.bulkPut(data.asistencia);
      }
      if (Array.isArray(data.excepciones) && data.excepciones.length) {
        await db.excepciones.bulkPut(data.excepciones);
      }
      if (Array.isArray(data.ajustes) && data.ajustes.length) {
        await db.ajustes.bulkPut(data.ajustes);
      }
    });

    showToast("Copia de seguridad restaurada.");
    await cargarAjustesUI();
    switchTab("view-hoy");
  } catch (err) {
    console.error(err);
    showToast("Error al restaurar: " + err.message, true);
  }
}

async function loadDemoSemester() {
  const ok = await confirmDialog(
    "Cargar Semestre Modelo",
    "Se incorporarán cursos con notas de ejemplo (escala 0–20), horario semanal y tareas para probar el sistema. ¿Continuar?"
  );
  if (!ok) return;

  const cIA   = { id: uuid(), nombre: "Inteligencia Artificial y Sistemas Expertos", profesor: "Dr. Agurto", aula: "Aula 1", color: "#BAE6FD", notas: "Repositorio del curso y guías de laboratorio", evaluacion: { parcial: 14, final: null, practicas: [{ id: uuid(), titulo: "Práctica 1", nota: 15 }, { id: uuid(), titulo: "Práctica 2", nota: 13 }, { id: uuid(), titulo: "Trabajo heurísticas", nota: 16 }] } };
  const cTop  = { id: uuid(), nombre: "Tópicos Avanzados en Ingeniería de Software", profesor: "Ing. Chaparro", aula: "Laboratorio de Redes", color: "#C7D2FE", notas: "Arquitectura limpia y despliegue continuo", evaluacion: { parcial: 12, final: 15, practicas: [{ id: uuid(), titulo: "Lab CI/CD", nota: 14 }, { id: uuid(), titulo: "Entrega Arquitectura", nota: 16 }] } };
  const cForm = { id: uuid(), nombre: "Formulación y Evaluación de Proyectos", profesor: "Dra. Vargas", aula: "Aula 204", color: "#BBF7D0", notas: "Flujo de caja, VAN y TIR", evaluacion: { parcial: 9, final: null, practicas: [{ id: uuid(), titulo: "Control 1", nota: 10 }, { id: uuid(), titulo: "Avance Estudio Mercado", nota: 11 }] } };
  const cAud  = { id: uuid(), nombre: "Auditoría y Seguridad en Informática", profesor: "Ing. Silva", aula: "Lab Sistemas", color: "#F5D0FE", notas: "Normativa ISO 27001 y pruebas OWASP", evaluacion: { parcial: 13, final: null, practicas: [{ id: uuid(), titulo: "Informe OWASP", nota: 14 }, { id: uuid(), titulo: "Práctica 2", nota: null }] } };
  const cDist = { id: uuid(), nombre: "Sistemas Distribuidos", profesor: "Ing. Mendoza", aula: "Lab Redes", color: "#FED7AA", notas: "Consenso Raft y tolerancia a fallos", evaluacion: { parcial: 8, final: null, practicas: [{ id: uuid(), titulo: "Práctica 1", nota: 9 }, { id: uuid(), titulo: "Laboratorio RPC", nota: 8 }] } };
  const cPrac = { id: uuid(), nombre: "Prácticas Pre Profesionales II", profesor: "Ing. Castillo", aula: "Oficina de TI", color: "#FEF08A", notas: "Supervisión e informes mensuales", evaluacion: { parcial: 17, final: 18, practicas: [{ id: uuid(), titulo: "Informe 1", nota: 17 }, { id: uuid(), titulo: "Informe 2", nota: 18 }] } };

  const demoCursos = [cIA, cTop, cForm, cAud, cDist, cPrac];

  const demoClasses = [
    { id: uuid(), curso_id: cIA.id,   dia_semana: "LUNES",     hora_inicio: "16:30", hora_fin: "19:00", aula: "" },
    { id: uuid(), curso_id: cTop.id,  dia_semana: "LUNES",     hora_inicio: "19:00", hora_fin: "21:30", aula: "" },
    { id: uuid(), curso_id: cIA.id,   dia_semana: "MARTES",    hora_inicio: "14:00", hora_fin: "16:30", aula: "" },
    { id: uuid(), curso_id: cForm.id, dia_semana: "MARTES",    hora_inicio: "19:50", hora_fin: "21:30", aula: "" },
    { id: uuid(), curso_id: cAud.id,  dia_semana: "MIERCOLES", hora_inicio: "14:50", hora_fin: "16:30", aula: "" },
    { id: uuid(), curso_id: cDist.id, dia_semana: "MIERCOLES", hora_inicio: "19:50", hora_fin: "21:30", aula: "" },
    { id: uuid(), curso_id: cDist.id, dia_semana: "JUEVES",    hora_inicio: "19:50", hora_fin: "21:30", aula: "" },
    { id: uuid(), curso_id: cAud.id,  dia_semana: "VIERNES",   hora_inicio: "14:50", hora_fin: "16:30", aula: "" },
    { id: uuid(), curso_id: cForm.id, dia_semana: "VIERNES",   hora_inicio: "17:20", hora_fin: "19:00", aula: "" },
    { id: uuid(), curso_id: cPrac.id, dia_semana: "SABADO",    hora_inicio: "09:00", hora_fin: "12:20", aula: "" }
  ];

  const now = new Date();
  const d1 = new Date(now.getTime() + 24 * 3600000).toISOString().slice(0, 16);
  const d2 = new Date(now.getTime() + 48 * 3600000).toISOString().slice(0, 16);
  const d3 = new Date(now.getTime() + 96 * 3600000).toISOString().slice(0, 16);
  const d4 = new Date(now.getTime() + 140 * 3600000).toISOString().slice(0, 16);

  const demoTasks = [
    { id: uuid(), titulo: "Entrega de Proyecto: Agente de Búsqueda Heurística", curso_id: cIA.id, fecha_limite: d1, importancia: 5, completada: false, fecha_creacion: now.toISOString(), notas: "Implementación de algoritmo A* con heurística admisible." },
    { id: uuid(), titulo: "Informe de Auditoría de Seguridad Web OWASP", curso_id: cAud.id, fecha_limite: d2, importancia: 4, completada: false, fecha_creacion: now.toISOString(), notas: "Escaneo de vulnerabilidades y matriz de riesgos." },
    { id: uuid(), titulo: "Estudio de Mercado y Flujo de Caja", curso_id: cForm.id, fecha_limite: d3, importancia: 4, completada: false, fecha_creacion: now.toISOString(), notas: "Cálculo del VAN y TIR con escenarios de sensibilidad." },
    { id: uuid(), titulo: "Implementación de Consenso Raft", curso_id: cDist.id, fecha_limite: d4, importancia: 3, completada: false, fecha_creacion: now.toISOString(), notas: "Módulo de elección de líder y replicación de log." },
    { id: uuid(), titulo: "Bitácora semanal de actividades prácticas", curso_id: cPrac.id, fecha_limite: "", importancia: 2, completada: true, fecha_creacion: now.toISOString(), notas: "Firmada por el supervisor institucional." }
  ];

  await db.transaction("rw", db.cursos, db.clases, db.tareas, async () => {
    await db.cursos.bulkPut(demoCursos);
    await db.clases.bulkPut(demoClasses);
    await db.tareas.bulkPut(demoTasks);
  });

  showToast("Semestre modelo cargado con cursos, notas y horario.");
  switchTab("view-cursos");
}

async function clearAllData() {
  const ok = await confirmDialog(
    "Vaciar Base de Datos",
    "¿Confirmas la eliminación total de cursos, notas, horario y tareas registradas?"
  );
  if (!ok) return;

  await db.transaction("rw", db.cursos, db.clases, db.tareas, async () => {
    await db.cursos.clear();
    await db.clases.clear();
    await db.tareas.clear();
  });
  showToast("Base de datos reiniciada.");
  switchTab("view-hoy");
}

async function guardarClase(e) {
  e.preventDefault();
  const id = $("#class-id").value || uuid();
  const curso_id = $("#class-curso").value;
  const dia_semana = $("#class-dia").value;
  const hora_inicio = $("#class-hora-inicio").value;
  const hora_fin = $("#class-hora-fin").value;
  const aula = $("#class-aula").value.trim();
  const errorEl = $("#class-form-error");

  errorEl.classList.add("hidden");

  if (!curso_id) {
    errorEl.textContent = "Selecciona un curso de la lista.";
    errorEl.classList.remove("hidden");
    return;
  }

  if (timeToMinutes(hora_fin) <= timeToMinutes(hora_inicio)) {
    errorEl.textContent = "La hora de fin debe ser posterior a la hora de inicio.";
    errorEl.classList.remove("hidden");
    return;
  }

  const [sameDayClasses, { map: cursosMap }] = await Promise.all([
    db.clases.where("dia_semana").equals(dia_semana).toArray(),
    cargarCursos()
  ]);
  const startM = timeToMinutes(hora_inicio);
  const endM = timeToMinutes(hora_fin);

  const conflict = sameDayClasses.find(c => c.id !== id &&
    overlaps(startM, endM, timeToMinutes(c.hora_inicio), timeToMinutes(c.hora_fin)));

  if (conflict) {
    const nombreConflicto = (cursosMap[conflict.curso_id] && cursosMap[conflict.curso_id].nombre) || "otra clase";
    errorEl.textContent = `Conflicto de horario con "${nombreConflicto}" (${formatTimeRange12(conflict.hora_inicio, conflict.hora_fin)}, ${DIAS_LABEL[conflict.dia_semana]}).`;
    errorEl.classList.remove("hidden");
    return;
  }

  await db.clases.put({ id, curso_id, dia_semana, hora_inicio, hora_fin, aula });
  closeClassModal();
  showToast("Clase guardada en el horario.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  refrescarVistaActual();
}

async function eliminarClase() {
  const id = $("#class-id").value;
  if (!id) return;
  const ok = await confirmDialog("Quitar del Horario", "¿Deseas quitar esta sesión del horario? El curso y sus notas se conservan.");
  if (!ok) return;
  await db.clases.delete(id);
  closeClassModal();
  showToast("Sesión eliminada del horario.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  refrescarVistaActual();
}

async function guardarTarea(e) {
  e.preventDefault();
  const id = $("#task-id").value || uuid();
  const titulo = $("#task-titulo").value.trim();
  const curso_id = $("#task-curso").value || "";
  const fecha_limite = $("#task-fecha").value;
  const importancia = parseInt($("#task-importancia").value) || 3;
  const notas = $("#task-descripcion").value.trim();
  const completada = $("#task-completada").checked;
  const errorEl = $("#task-form-error");

  errorEl.classList.add("hidden");

  if (!titulo) {
    errorEl.textContent = "El título de la tarea es obligatorio.";
    errorEl.classList.remove("hidden");
    return;
  }

  const fecha_creacion = (await db.tareas.get(id))?.fecha_creacion || new Date().toISOString();

  await db.tareas.put({ id, titulo, curso_id, fecha_limite, importancia, completada, fecha_creacion, notas });
  closeTaskModal();
  showToast("Tarea guardada.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  if (state.currentTab === "view-hoy") renderHoy();
  else renderTareas();
}

async function eliminarTarea() {
  const id = $("#task-id").value;
  if (!id) return;
  const ok = await confirmDialog("Eliminar Tarea", "¿Deseas eliminar esta tarea permanentemente?");
  if (!ok) return;
  await db.tareas.delete(id);
  closeTaskModal();
  showToast("Tarea eliminada.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  if (state.currentTab === "view-hoy") renderHoy();
  else renderTareas();
}

async function scheduleTestNotification() {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) {
    showToast("Las alertas programadas requieren instalar el APK en Android. (En web este modo es simulado).");
    setTimeout(() => {
      showToast("🔔 [Simulación] ¡Alerta en 10 s! Cálculo II en 10 min · Aula 3 · Dr. Pérez");
    }, 10000);
    return;
  }

  try {
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== "granted") {
      alert("Debes permitir las notificaciones en el sistema para recibir alertas.");
      return;
    }

    const atDate = new Date(Date.now() + 10000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: "UNUmbral · Prueba de Alerta",
          body: "¡Alerta offline funcionando! Tu clase o tarea te avisará a tiempo.",
          schedule: { at: atDate, allowWhileIdle: true },
          smallIcon: "ic_stat_icon",
          iconColor: "#22432C"
        }
      ]
    });
    showToast("Alerta programada en 10 s. Puedes cerrar la app para probarla.");
  } catch (err) {
    console.error("Error programando notificación de prueba:", err);
    showToast("Error programando notificación: " + (err.message || err));
  }
}

/* =====================================================================
   13. EVENTOS Y FORMULARIOS
   ===================================================================== */
function wireGlobalEvents() {
  $$(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.view));
  });

  $("#btn-theme-toggle").addEventListener("click", toggleTheme);

  $("#btn-quick-add").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.remove("hidden");
  });
  $("#btn-quick-cancel").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
  });
  $("#modal-quick-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-quick-backdrop") $("#modal-quick-backdrop").classList.add("hidden");
  });
  $("#btn-quick-create-curso").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
    openNewCursoModal();
  });
  $("#btn-quick-create-task").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
    openNewTaskModal();
  });
  $("#btn-quick-create-class").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
    openNewClassModal();
  });

  $("#btn-add-curso").addEventListener("click", () => openNewCursoModal());
  $("#btn-add-task").addEventListener("click", () => openNewTaskModal());
  $("#btn-add-class").addEventListener("click", () => openNewClassModal());
  $("#btn-ver-todas-tareas").addEventListener("click", () => switchTab("view-tareas"));

  $("#btn-mode-agenda").addEventListener("click", () => { state.scheduleMode = "agenda"; renderHorario(); });
  $("#btn-mode-matrix").addEventListener("click", () => { state.scheduleMode = "matrix"; renderHorario(); });

  $$(".day-tab", $("#day-tabs-container")).forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedDay = btn.dataset.day;
      renderHorario();
    });
  });

  $$(".chip", $("#tasks-filter-chips")).forEach(chip => {
    chip.addEventListener("click", () => {
      $$(".chip", $("#tasks-filter-chips")).forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      state.tasksFilter = chip.dataset.filter;
      renderTareas();
    });
  });

  const btnSubjectDropdown = $("#btn-subject-dropdown-toggle");
  const menuSubjectDropdown = $("#subject-dropdown-menu");
  if (btnSubjectDropdown && menuSubjectDropdown) {
    btnSubjectDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      const isClosed = menuSubjectDropdown.classList.contains("hidden");
      menuSubjectDropdown.classList.toggle("hidden", !isClosed);
      btnSubjectDropdown.classList.toggle("open", isClosed);
      btnSubjectDropdown.setAttribute("aria-expanded", isClosed ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      const wrapper = btnSubjectDropdown.closest(".subject-dropdown-wrapper");
      if (wrapper && !wrapper.contains(e.target)) {
        menuSubjectDropdown.classList.add("hidden");
        btnSubjectDropdown.classList.remove("open");
        btnSubjectDropdown.setAttribute("aria-expanded", "false");
      }
    });
  }

  $("#input-search-tasks").addEventListener("input", (e) => {
    state.tasksSearchQuery = e.target.value;
    renderTareas();
  });

  // Eventos del modal de Curso (catálogo)
  $$(".color-swatch", $("#curso-color-picker")).forEach(s => {
    s.addEventListener("click", () => setCursoColor(s.dataset.color));
  });
  $("#modal-curso-close").addEventListener("click", closeCursoModal);
  $("#btn-cancel-curso").addEventListener("click", closeCursoModal);
  $("#modal-curso-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-curso-backdrop") closeCursoModal();
  });
  $("#form-curso").addEventListener("submit", guardarCurso);
  $("#btn-delete-curso").addEventListener("click", eliminarCurso);

  // Eventos del modal de Notas (0–20, parcial + final + prácticas)
  $("#modal-notas-close").addEventListener("click", closeNotasModal);
  $("#btn-cancel-notas").addEventListener("click", closeNotasModal);
  $("#modal-notas-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-notas-backdrop") closeNotasModal();
  });
  $("#btn-add-practica").addEventListener("click", agregarPractica);
  $("#nota-parcial").addEventListener("input", actualizarResumenNotas);
  $("#nota-final").addEventListener("input", actualizarResumenNotas);
  $("#practicas-list").addEventListener("input", actualizarResumenNotas);
  $("#practicas-list").addEventListener("click", (e) => {
    const rm = e.target.closest(".practica-remove");
    if (!rm) return;
    rm.closest(".practica-row").remove();
    if ($$(".practica-row", $("#practicas-list")).length === 0) {
      renderPracticasRows([]);
    }
    actualizarResumenNotas();
  });
  $("#form-notas").addEventListener("submit", guardarNotas);

  // Eventos del modal de Clase (asignación al horario)
  $("#class-curso").addEventListener("change", actualizarPreviewCursoClase);
  $("#class-hora-inicio").addEventListener("input", actualizarHintsHoraClase);
  $("#class-hora-fin").addEventListener("input", actualizarHintsHoraClase);
  $("#btn-new-curso-from-class").addEventListener("click", () => openNewCursoModal("clase"));
  $("#modal-class-close").addEventListener("click", closeClassModal);
  $("#btn-cancel-class").addEventListener("click", closeClassModal);
  $("#modal-class-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-class-backdrop") closeClassModal();
  });
  $("#form-class").addEventListener("submit", guardarClase);
  $("#btn-delete-class").addEventListener("click", eliminarClase);

  // Eventos del modal de Tarea
  $$(".imp-star-btn", $("#task-importance-selector")).forEach(btn => {
    btn.addEventListener("click", () => setImportanceStars(parseInt(btn.dataset.val)));
  });
  $("#modal-task-close").addEventListener("click", closeTaskModal);
  $("#btn-cancel-task").addEventListener("click", closeTaskModal);
  $("#modal-task-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-task-backdrop") closeTaskModal();
  });
  $("#form-task").addEventListener("submit", guardarTarea);
  $("#btn-delete-task").addEventListener("click", eliminarTarea);

  // Eventos de Ajustes y Backups
  $("#btn-export-schedule").addEventListener("click", exportScheduleForFriends);
  $("#input-import-schedule").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      importScheduleFromFriends(e.target.files[0]);
      e.target.value = "";
    }
  });

  $("#btn-export-backup").addEventListener("click", exportFullBackup);
  $("#input-import-backup").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      importFullBackup(e.target.files[0]);
      e.target.value = "";
    }
  });

  $("#btn-load-demo").addEventListener("click", loadDemoSemester);
  $("#btn-clear-data").addEventListener("click", clearAllData);

  const btnTestNotif = $("#btn-test-notification");
  if (btnTestNotif) {
    btnTestNotif.addEventListener("click", scheduleTestNotification);
  }

  const btnSaveAjustes = $("#btn-save-ajustes");
  if (btnSaveAjustes) {
    btnSaveAjustes.addEventListener("click", guardarAjustesUI);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeClassModal();
      closeCursoModal();
      closeNotasModal();
      closeTaskModal();
      $("#modal-quick-backdrop").classList.add("hidden");
      if (activeConfirmCancel) activeConfirmCancel();
    }
  });
}

/* =====================================================================
   MIGRACIÓN DE COMPATIBILIDAD DESDE UNIFLOW A UNUMBRAL
   ===================================================================== */
async function checkAndMigrateLegacyDB() {
  try {
    const count = await db.cursos.count();
    if (count === 0 && window.indexedDB) {
      const oldDb = new Dexie("UniFlowDB");
      await oldDb.open().catch(() => {});
      if (oldDb.isOpen()) {
        const oldClases = await oldDb.table("clases").toArray().catch(() => []);
        const oldTareas = await oldDb.table("tareas").toArray().catch(() => []);
        if (oldClases.length > 0 || oldTareas.length > 0) {
          const r = convertirFormatoPlano(oldClases, oldTareas, []);
          if (r.cursosNuevos.length) await db.cursos.bulkPut(r.cursosNuevos);
          if (r.clases.length) await db.clases.bulkPut(r.clases);
          if (r.tareas.length) await db.tareas.bulkPut(r.tareas);
        }
        oldDb.close();
      }
    }
  } catch (err) {
    console.warn("Migración legacy omitida:", err);
  }
}

/* =====================================================================
   14. INICIALIZACIÓN
   ===================================================================== */
async function init() {
  applyTheme(state.theme);

  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  if ("serviceWorker" in navigator && (typeof esNativo !== "function" || !esNativo())) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  try {
    await db.open();
    await checkAndMigrateLegacyDB();
  } catch (err) {
    console.error("Error abriendo IndexedDB:", err);
  }

  wireGlobalEvents();
  switchTab("view-hoy");

  if (typeof inicializarSistemaNotificaciones === "function") {
    inicializarSistemaNotificaciones().catch(err => console.warn("Error inicializando notificaciones:", err));
  }

  setInterval(() => {
    if (state.currentTab === "view-hoy") renderHoy();
  }, 60000);
}

document.addEventListener("DOMContentLoaded", init);
