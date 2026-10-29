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
const DIAS_SEMANA = DIAS;

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
  layers: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  message: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  ban: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
  rotateCcw: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  alertCircle: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
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
  "#294635": "#C5D6B8",
  "#84CC16": "#ECFCCB",
  "#D946EF": "#FAE8FF",
  "#8B5CF6": "#EDE9FE",
  "#EF4444": "#FEE2E2",
  "#0EA5E9": "#E0F2FE",
  "#78716C": "#F5F5F4"
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
    ciclo_curso: String(c.ciclo_curso || "").trim(),
    tipo_condicion: c.tipo_condicion === "electivo" ? "electivo" : "obligatorio",
    codigo_asignatura: String(c.codigo_asignatura || "").trim(),
    grupo_seccion: String(c.grupo_seccion || "").trim(),
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
  try {
    await tx.table("cursos").toCollection().modify(c => {
      if (typeof c.creditos !== "number" || c.creditos <= 0) {
        c.creditos = 3;
      }
    });

    const defaults = typeof getAjustesDefaults === "function" ? getAjustesDefaults() : {};
    for (const [clave, valor] of Object.entries(defaults)) {
      const existing = await tx.table("ajustes").get(clave).catch(() => null);
      if (!existing) {
        await tx.table("ajustes").put({ clave, valor }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Aviso en upgrade v4:", err);
  }
});

/* Versión 5: Ciclo académico (17 semanas, semana 8 exámenes parciales) y actividades no académicas en horario */
db.version(5).stores({
  ciclos:      "id, nombre, fecha_inicio, fecha_fin, estado",
  cursos:      "id, nombre, ciclo_id",
  clases:      "id, curso_id, dia_semana, ciclo_id, tipo",
  tareas:      "id, curso_id, fecha_limite, importancia, completada, fecha_creacion, ciclo_id",
  eventos:     "id, curso_id, fecha, tipo, ciclo_id",
  asistencia:  "id, curso_id, clase_id, fecha, estado, &[clase_id+fecha]",
  excepciones: "id, fecha, tipo, clase_id",
  ajustes:     "clave"
}).upgrade(async (tx) => {
  try {
    const numCiclos = await tx.table("ciclos").count();
    if (numCiclos === 0) {
      const ajustes = await tx.table("ajustes").toArray();
      const map = {};
      for (const a of ajustes) map[a.clave] = a.valor;
      let inicio = map.ciclo_inicio;
      if (!inicio) {
        inicio = "2026-03-16";
      }
      const fin = typeof calcularFinCiclo17Semanas === "function"
        ? calcularFinCiclo17Semanas(inicio)
        : (map.ciclo_fin || "2026-07-12");
      const cicloInicial = {
        id: "ciclo-inicial",
        nombre: "Ciclo 2026-I",
        fecha_inicio: inicio,
        fecha_fin: fin,
        estado: "activo",
        fecha_creacion: new Date().toISOString()
      };
      await tx.table("ciclos").add(cicloInicial);
      await tx.table("cursos").toCollection().modify(c => {
        if (!c.ciclo_id) c.ciclo_id = cicloInicial.id;
      });
      await tx.table("clases").toCollection().modify(cl => {
        if (!cl.ciclo_id) cl.ciclo_id = cicloInicial.id;
      });
    }
  } catch (e) {
    console.warn("Aviso en upgrade v5:", e);
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
function convertirFormatoPlano(clasesPlanas, tareasPlanas, cursosExistentes, cursosSueltos, cicloId = null) {
  const porNombre = new Map((cursosExistentes || []).map(c => [normalizarNombre(c.nombre), c]));
  const porId = new Map((cursosExistentes || []).filter(c => c && c.id).map(c => [String(c.id), c]));
  const idOriginalACurso = new Map();
  const cursosNuevos = [];

  const obtenerCurso = (nombre, datos, idOriginal) => {
    const limpio = String(nombre || "").trim();
    if (!limpio) return null;
    const clave = normalizarNombre(limpio);
    let curso = porNombre.get(clave);
    if (!curso) {
      const d = datos || {};
      curso = {
        id: uuid(),
        ciclo_id: cicloId || (d && d.ciclo_id) || null,
        nombre: limpio,
        profesor: d.profesor || "",
        aula: d.aula || "",
        color: normalizarColorPastel(d.color || COLOR_CURSO_DEFECTO),
        creditos: (d && typeof d.creditos === "number") ? d.creditos : 3,
        notas: d.notas || "",
        evaluacion: (d && d.evaluacion) ? d.evaluacion : evaluacionVacia()
      };
      porNombre.set(clave, curso);
      porId.set(String(curso.id), curso);
      cursosNuevos.push(curso);
    }
    if (idOriginal !== undefined && idOriginal !== null && idOriginal !== "") {
      idOriginalACurso.set(String(idOriginal), curso);
    }
    idOriginalACurso.set(clave, curso);
    return curso;
  };

  (cursosSueltos || []).forEach(c => obtenerCurso(c.nombre, c, c.id));

  const clases = [];
  (clasesPlanas || []).forEach(c => {
    const hInicio = to24Hour(c.hora_inicio);
    const hFin = to24Hour(c.hora_fin);
    let curso = null;

    // 1. Resolver por ID original asignado en el QR o archivo importado (ej: "0", "1", UUID)
    if (c.curso_id !== undefined && c.curso_id !== null && c.curso_id !== "") {
      const cidStr = String(c.curso_id);
      if (idOriginalACurso.has(cidStr)) {
        curso = idOriginalACurso.get(cidStr);
      } else if (porId.has(cidStr)) {
        curso = porId.get(cidStr);
      }
    }

    // 2. Resolver por nombre de materia o curso_id si viene como texto
    if (!curso) {
      const nombreTexto = String(c.materia || c.curso_id || "").trim();
      if (nombreTexto) {
        const clave = normalizarNombre(nombreTexto);
        if (idOriginalACurso.has(clave)) {
          curso = idOriginalACurso.get(clave);
        } else if (porNombre.has(clave)) {
          curso = porNombre.get(clave);
        }
      }
    }

    // 3. Fallback: buscar en cursosExistentes por ID o nombre normalizado
    if (!curso && c.curso_id) {
      const cursoResuelto = (cursosExistentes || []).find(ce => ce.id === c.curso_id || normalizarNombre(ce.nombre) === normalizarNombre(c.curso_id));
      if (cursoResuelto) curso = cursoResuelto;
    }

    // 4. Si no se resolvió, crear solo si el nombre NO es un índice numérico huérfano (evita cursos "0", "1", etc.)
    if (!curso) {
      const nombreTexto = String(c.materia || c.curso_id || "").trim();
      if (nombreTexto && !/^\d+$/.test(nombreTexto)) {
        curso = obtenerCurso(nombreTexto, { profesor: c.profesor, aula: c.aula, color: c.color, notas: c.notas });
      }
    }

    if (!curso) return;

    clases.push({
      id: c.id || uuid(),
      curso_id: curso.id,
      ciclo_id: cicloId || (curso && curso.ciclo_id) || null,
      tipo: c.tipo || "curso",
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

const CATEGORIAS_ACTIVIDAD = {
  practicas: "Prácticas Pre-Profesionales",
  trabajo: "Trabajo / Empleo",
  estudio: "Estudio / Asesoría",
  taller: "Taller / Salud / Deporte",
  otro: "Actividad General"
};

/** Une una sesión del horario con los datos de su curso o actividad para poder renderizarla. */
function enriquecerClase(clase, cursosMap) {
  if (clase.tipo === "actividad") {
    return {
      ...clase,
      esActividad: true,
      creditos: 0,
      materia: clase.titulo || "Actividad",
      color: normalizarColorPastel(clase.color || "#BAE6FD"),
      profesor: "",
      aula: clase.categoria ? (CATEGORIAS_ACTIVIDAD[clase.categoria] || clase.categoria) : (clase.aula || "Actividad")
    };
  }
  const curso = cursosMap[clase.curso_id];
  return {
    ...clase,
    esActividad: false,
    creditos: (curso && typeof curso.creditos === "number") ? curso.creditos : 3,
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
  tasksViewMode: "list", // "list" o "calendar"
  tasksFilter: "semana", // semana, pendientes, urgentes, proximas, todas, completadas
  tasksMateriaFilter: "",
  tasksSearchQuery: "",
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth() + 1,
  selectedCalDate: null,
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
  // Los cursos usan gama pastel: siempre texto oscuro/negro (#111827) de alto contraste
  return "#111827";
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
  if (navCountEl) {
    if (pendingCount > 0) {
      navCountEl.textContent = pendingCount;
      navCountEl.classList.remove("hidden");
    } else {
      navCountEl.classList.add("hidden");
    }
  }

  // Actualizar aviso / badge nativo persistente en Android (Fase 8)
  if (typeof esNativo === "function" && esNativo()) {
    actualizarBadgeNativo(pendingCount).catch(() => {});
  }
}

async function actualizarBadgeNativo(count) {
  // Se cancela la notificación persistente 99999 para no saturar la barra de estado
  if (!window.Capacitor?.Plugins?.LocalNotifications) return;
  const { LocalNotifications } = window.Capacitor.Plugins;
  await LocalNotifications.cancel({ notifications: [{ id: 99999 }] }).catch(() => {});
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

  const fechaHoyStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
  const excepciones = await db.excepciones.toArray();
  const asistencias = await db.asistencia.toArray();

  const esFeriadoHoy = (typeof esDiaFeriado === "function" ? esDiaFeriado : window.esDiaFeriado)(fechaHoyStr, excepciones);
  const holidayBannerEl = $("#today-holiday-banner");
  if (holidayBannerEl) {
    if (esFeriadoHoy) {
      const fer = excepciones.find(e => e.fecha === fechaHoyStr && e.tipo === "feriado");
      $("#today-holiday-text").textContent = `Hoy es día feriado: ${fer?.motivo || "Día No Laborable"}`;
      holidayBannerEl.classList.remove("hidden");
    } else {
      holidayBannerEl.classList.add("hidden");
    }
  }

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
    listEl.innerHTML = classesToday.map(c => {
      const cancelada = esFeriadoHoy || (typeof esClaseCancelada === "function" ? esClaseCancelada : window.esClaseCancelada)(c.id, c.curso_id, fechaHoyStr, excepciones);
      const exItem = excepciones.find(e => e.fecha === fechaHoyStr && (e.tipo === "feriado" || (e.tipo === "cancelada" && (e.clase_id === c.id || (!e.clase_id && e.curso_id === c.curso_id)))));
      const asistHoy = asistencias.find(a => a.curso_id === c.curso_id && a.fecha === fechaHoyStr);
      return renderClassCardHTML(c, {
        isHoy: true,
        cancelada,
        motivoCancelada: exItem?.motivo || (cancelada ? "Cancelada" : undefined),
        estadoAsistencia: asistHoy ? asistHoy.estado : null
      });
    }).join("");

    $$(".class-card", listEl).forEach(card => {
      card.addEventListener("click", () => openEditClassModal(card.dataset.id));
    });

    wireTodayAttendanceEvents(listEl, classesToday, fechaHoyStr, excepciones, asistencias);
  }

  // Radar de tareas urgentes
  const allTasks = await obtenerTareasEnriquecidas();
  const pendingTasks = allTasks.filter(t => !t.completada);
  actualizarBadgeTareas(pendingTasks.length);

  // Detección de huecos libres de hoy y sugerencias de tareas (Fase 6)
  const secHuecos = $("#section-huecos-libres");
  const listHuecos = $("#today-huecos-list");
  const badgeHuecos = $("#badge-huecos-hoy");

  if (secHuecos && listHuecos && typeof huecosDelDia === "function") {
    const ajustesListHoy = await db.ajustes.toArray();
    const mapAjHoy = {};
    for (const a of ajustesListHoy) mapAjHoy[a.clave] = a.valor;
    const huecos = huecosDelDia(classesToday, {
      fecha: fechaHoyStr,
      excepciones,
      ventanaDesde: mapAjHoy.huecos_ventana_desde || "07:00",
      ventanaHasta: mapAjHoy.huecos_ventana_hasta || "22:00",
      minMinutos: parseInt(mapAjHoy.huecos_min || 30, 10),
      soloEntreClases: true
    });

    if (huecos.length > 0) {
      if (badgeHuecos) {
        badgeHuecos.textContent = `${huecos.length} ${huecos.length === 1 ? "hueco" : "huecos"}`;
      }

      listHuecos.innerHTML = huecos.map(h => {
        let tareasSug = typeof sugerirTareas === "function" ? sugerirTareas(h, pendingTasks) : [];
        if (tareasSug.length === 0 && pendingTasks.length > 0) {
          // Siempre sugerir tareas universitarias pendientes si hay un hueco libre
          tareasSug = [...pendingTasks]
            .sort((a, b) => (b.importancia || 1) - (a.importancia || 1))
            .slice(0, 3);
        }
        const rangoTexto = `${formatTime12(h.inicio)} – ${formatTime12(h.fin)}`;
        const durTexto = typeof formatearDuracion === "function" ? formatearDuracion(h.duracionMinutos) : `${h.duracionMinutos} min`;

        const sugerenciasHtml = tareasSug.length > 0
          ? `<div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
              ${tareasSug.map(t => `
                <div style="background:var(--surface-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <div style="min-width:0; flex:1;">
                    <div style="font-size:12.5px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(t.titulo)}</div>
                    <div style="font-size:11px; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
                      ${t.materia ? `<span style="color:${t.color || 'var(--deep-leaf)'}; font-weight:600;">${escapeHtml(t.materia)}</span> · ` : ""}
                      <span>${ICONS.star} Nivel ${t.importancia || 1}</span>
                      ${t.fecha_limite ? `<span>· Vence: ${escapeHtml(t.fecha_limite.replace('T', ' '))}</span>` : ""}
                    </div>
                  </div>
                  <button type="button" class="btn-secondary btn-sm" data-action="completar-tarea-hueco" data-task-id="${escapeHtml(t.id)}" style="font-size:11px; padding:3px 8px; flex-shrink:0;">
                    ${ICONS.check} Lista
                  </button>
                </div>
              `).join("")}
            </div>`
          : `<p style="font-size:11.5px; color:var(--text-secondary); margin:6px 0 0 0;">No tienes tareas universitarias pendientes. ¡Aprovecha para descansar!</p>`;

        return `
          <div style="background:var(--surface-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-weight:700; font-size:13px; color:var(--text-primary);">${rangoTexto}</span>
                <span style="margin-left:6px; font-size:11px; background:rgba(35,120,70,0.12); color:var(--deep-leaf); padding:2px 7px; border-radius:var(--radius-pill); font-weight:700;">${durTexto} libres</span>
              </div>
            </div>
            ${sugerenciasHtml}
          </div>`;
      }).join("");

      $$('[data-action="completar-tarea-hueco"]', listHuecos).forEach(btn => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const tid = btn.dataset.taskId;
          if (!tid) return;
          await db.tareas.update(tid, { completada: true });
          showToast("¡Tarea completada!");
          if (typeof reprogramarTodo === "function") reprogramarTodo();
          renderHoy();
        });
      });

      secHuecos.classList.remove("hidden");
    } else {
      secHuecos.classList.add("hidden");
    }
  }

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

function formatearTiempoRestanteHMS(diffSeconds) {
  if (diffSeconds <= 0) return "0 s";
  const h = Math.floor(diffSeconds / 3600);
  const m = Math.floor((diffSeconds % 3600) / 60);
  const sec = diffSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0 || h > 0) parts.push(`${m} min`);
  parts.push(`${sec} s`);
  return parts.join(" ");
}

function formatearCuentaAtrasHMS(diffSeconds) {
  if (diffSeconds <= 0) return "0s";
  const h = Math.floor(diffSeconds / 3600);
  const m = Math.floor((diffSeconds % 3600) / 60);
  const s = diffSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
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

  if (state.liveCountdownInterval) {
    clearInterval(state.liveCountdownInterval);
    state.liveCountdownInterval = null;
  }

  if (currentClass) {
    const sSec = timeToMinutes(currentClass.hora_inicio) * 60;
    const eSec = timeToMinutes(currentClass.hora_fin) * 60;
    const curNow = new Date();
    const curSec = curNow.getHours() * 3600 + curNow.getMinutes() * 60 + curNow.getSeconds();
    const totalSec = Math.max(1, eSec - sSec);
    const elapsedSec = Math.max(0, curSec - sSec);
    const diffSec = Math.max(0, eSec - curSec);
    const pct = Math.min(100, Math.round((elapsedSec / totalSec) * 100));

    container.className = "live-card in-class";
    container.innerHTML = `
      <div class="live-card-eyebrow">
        <span class="live-dot pulse"></span>
        <span class="live-badge-in-class">EN CURSO · ${formatTime12(currentClass.hora_inicio)} a ${formatTime12(currentClass.hora_fin)}</span>
      </div>
      <div class="live-card-title">${escapeHtml(currentClass.materia)}</div>
      <div class="live-card-meta">
        <span class="live-meta-item">${ICONS.location} ${escapeHtml(currentClass.aula || "Sin aula")}</span>
        <span class="live-meta-item">${ICONS.person} ${escapeHtml(currentClass.profesor || "Profesor(a)")}</span>
        <span class="live-meta-item live-timer-in-class" id="live-remaining-timer">${ICONS.clock} Restan ${formatearTiempoRestanteHMS(diffSec)}</span>
      </div>
      <div class="live-progress-bar">
        <div class="live-progress-fill" style="width: ${pct}%"></div>
      </div>`;

    state.liveCountdownInterval = setInterval(() => {
      if (state.currentTab !== "view-hoy") {
        clearInterval(state.liveCountdownInterval);
        state.liveCountdownInterval = null;
        return;
      }
      const tickNow = new Date();
      const tickSec = tickNow.getHours() * 3600 + tickNow.getMinutes() * 60 + tickNow.getSeconds();
      if (tickSec >= eSec) {
        clearInterval(state.liveCountdownInterval);
        state.liveCountdownInterval = null;
        renderHoy();
        return;
      }
      const tickRemSec = Math.max(0, eSec - tickSec);
      const tickElapsedSec = Math.max(0, tickSec - sSec);
      const tickPct = Math.min(100, Math.round((tickElapsedSec / totalSec) * 100));
      const timerEl = document.getElementById("live-remaining-timer");
      if (timerEl) {
        timerEl.innerHTML = `${ICONS.clock} Restan ${formatearTiempoRestanteHMS(tickRemSec)}`;
      }
      const fillEl = document.querySelector(".live-card.in-class .live-progress-fill");
      if (fillEl) {
        fillEl.style.width = `${tickPct}%`;
      }
    }, 1000);
    return;
  }

  // Buscar próxima clase de hoy
  const nextClass = classesToday.find(c => timeToMinutes(c.hora_inicio) > currentMin);

  if (nextClass) {
    const [hIni, mIni] = nextClass.hora_inicio.split(":").map(Number);
    const sSec = hIni * 3600 + mIni * 60;
    const curNow = new Date();
    const curSec = curNow.getHours() * 3600 + curNow.getMinutes() * 60 + curNow.getSeconds();
    const untilSec = Math.max(0, sSec - curSec);
    const countdown = formatearCuentaAtrasHMS(untilSec);

    container.className = "live-card";
    container.innerHTML = `
      <div class="live-card-eyebrow">
        <span class="live-dot"></span>
        <span>Próxima Clase</span>
      </div>
      <div class="live-card-title">${escapeHtml(nextClass.materia)}</div>
      <div class="live-card-meta">
        <span class="live-meta-item" id="live-next-class-timer">${ICONS.clock} ${formatTimeRange12(nextClass.hora_inicio, nextClass.hora_fin)} (en <span id="live-next-countdown">${countdown}</span>)</span>
        <span class="live-meta-item">${ICONS.location} ${escapeHtml(nextClass.aula || "Sin aula")}</span>
        <span class="live-meta-item">${ICONS.person} ${escapeHtml(nextClass.profesor || "Profesor(a)")}</span>
      </div>`;

    state.liveCountdownInterval = setInterval(() => {
      if (state.currentTab !== "view-hoy") {
        clearInterval(state.liveCountdownInterval);
        state.liveCountdownInterval = null;
        return;
      }
      const tickNow = new Date();
      const tickSec = tickNow.getHours() * 3600 + tickNow.getMinutes() * 60 + tickNow.getSeconds();
      if (tickSec >= sSec) {
        clearInterval(state.liveCountdownInterval);
        state.liveCountdownInterval = null;
        renderHoy();
        return;
      }
      const tickUntilSec = Math.max(0, sSec - tickSec);
      const countdownEl = document.getElementById("live-next-countdown");
      if (countdownEl) {
        countdownEl.textContent = formatearCuentaAtrasHMS(tickUntilSec);
      }
    }, 1000);
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

function wireTodayAttendanceEvents(container, classesToday, fechaHoyStr, excepciones, asistencias) {
  $$("button[data-action^='asist-']", container).forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const claseId = btn.dataset.claseId;
      const cursoId = btn.dataset.cursoId;
      const nuevoEstado = action.replace("asist-", ""); // 'presente' | 'falta' | 'justificada'

      const c = classesToday.find(x => x.id === claseId);
      const asistPrev = asistencias.find(a => a.curso_id === cursoId && a.fecha === fechaHoyStr);

      if (asistPrev && asistPrev.estado === nuevoEstado) {
        await db.asistencia.delete(asistPrev.id || `${cursoId}_${fechaHoyStr}`);
        showToast("Registro de asistencia retirado.");
      } else {
        if (nuevoEstado === "falta") {
          const clasesDelCurso = await db.clases.where("curso_id").equals(cursoId).toArray();
          const asistCurso = await db.asistencia.where("curso_id").equals(cursoId).toArray();
          const ajustes = await db.ajustes.toArray();
          const mapAjustes = {};
          for (const a of ajustes) mapAjustes[a.clave] = a.valor;
          const cfg = typeof sanitizarAjustes === "function" ? sanitizarAjustes(mapAjustes) : mapAjustes;
          const cicloActivo = await obtenerCicloActivo();
          const fechaIni = cicloActivo?.fecha_inicio || cfg.ciclo_inicio || "2026-01-01";
          const fechaFin = cicloActivo?.fecha_fin || cfg.ciclo_fin || "2026-12-31";

          const resPrev = (typeof resumenAsistencia === "function" ? resumenAsistencia : window.resumenAsistencia)({
            cursoId,
            clasesDelCurso,
            asistencias: asistCurso,
            cicloInicio: fechaIni,
            cicloFin: fechaFin,
            excepciones,
            limiteFaltasPct: cfg.limite_faltas_pct || 30
          });

          const faltasAntes = resPrev.faltas;
          const faltasDespues = (asistPrev?.estado === "falta") ? faltasAntes : faltasAntes + 1;

          const umbralCruzado = (typeof detectarUmbralCruzado === "function" ? detectarUmbralCruzado : window.detectarUmbralCruzado)(faltasAntes, faltasDespues, resPrev.totalSesiones, [10, 20, 30]);

          await db.asistencia.put({
            id: `${cursoId}_${fechaHoyStr}`,
            curso_id: cursoId,
            clase_id: claseId,
            fecha: fechaHoyStr,
            estado: nuevoEstado
          });

          if (umbralCruzado) {
            const restante = Math.max(0, resPrev.maxFaltasPermitidas - faltasDespues);
            const msg = `¡Atención! Has alcanzado el ${umbralCruzado}% de faltas en ${c?.materia || "el curso"}. Te quedan ${restante} faltas permitidas.`;
            showToast(msg, true);
            if (typeof dispararNotificacionInmediata === "function") {
              dispararNotificacionInmediata(`Alerta de Inasistencia (${umbralCruzado}%)`, msg, "urgente");
            }
          } else {
            showToast(`Falta registrada en ${c?.materia || "el curso"}.`);
          }
        } else {
          await db.asistencia.put({
            id: `${cursoId}_${fechaHoyStr}`,
            curso_id: cursoId,
            clase_id: claseId,
            fecha: fechaHoyStr,
            estado: nuevoEstado
          });
          showToast(nuevoEstado === "presente" ? "Asistencia registrada" : "Justificación registrada");
        }
      }

      if (typeof reprogramarTodo === "function") reprogramarTodo();
      renderHoy();
      if ($("#view-cursos") && $("#view-cursos").classList.contains("active")) renderCursos();
    });
  });

  $$("button[data-action='cancelar-sesion']", container).forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const claseId = btn.dataset.claseId;
      const cursoId = btn.dataset.cursoId;
      const c = classesToday.find(x => x.id === claseId);
      const motivo = prompt(`Motivo de suspensión para hoy (${c?.materia || "Clase"}):`, "Profesor no asistió");
      if (motivo !== null && motivo.trim()) {
        await db.excepciones.put({
          id: `ex_${Date.now()}`,
          fecha: fechaHoyStr,
          tipo: "cancelada",
          clase_id: claseId,
          curso_id: cursoId,
          motivo: motivo.trim()
        });
        showToast("Sesión marcada como cancelada.");
        if (typeof reprogramarTodo === "function") reprogramarTodo();
        renderHoy();
      }
    });
  });

  $$("button[data-action='restaurar-sesion']", container).forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const claseId = btn.dataset.claseId;
      const cursoId = btn.dataset.cursoId;
      const ex = excepciones.find(x => x.fecha === fechaHoyStr && x.tipo === "cancelada" && (x.clase_id === claseId || (!x.clase_id && x.curso_id === cursoId)));
      if (ex) {
        await db.excepciones.delete(ex.id);
        showToast("Sesión restaurada.");
        if (typeof reprogramarTodo === "function") reprogramarTodo();
        renderHoy();
      }
    });
  });
}

function renderClassCardHTML(c, opts = {}) {
  const color = normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO);
  const cancelada = Boolean(opts.cancelada);
  const isHoy = Boolean(opts.isHoy);
  const motivoCancelada = opts.motivoCancelada;
  const est = opts.estadoAsistencia;
  const esAct = Boolean(c.esActividad);

  return `
    <div class="class-card ${cancelada ? "is-cancelled" : ""}" data-id="${c.id}" data-curso-id="${c.curso_id || ""}">
      <div class="class-card-stripe" style="background:${color}"></div>
      <div class="class-card-main">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <div class="class-card-title">${escapeHtml(c.materia)}</div>
          ${cancelada ? `<span style="font-size:10.5px;padding:2px 6px;border-radius:var(--radius-pill);background:rgba(210,50,50,0.15);color:var(--status-danger);font-weight:600;">${escapeHtml(motivoCancelada || "Cancelada")}</span>` : ""}
          ${esAct ? `<span style="font-size:10.5px;padding:2px 6px;border-radius:var(--radius-pill);background:var(--surface-subtle);color:var(--text-secondary);font-weight:600;">Actividad</span>` : ""}
        </div>
        <div class="class-card-details">
          <span class="class-time-tag">${ICONS.clock} ${formatTimeRange12(c.hora_inicio, c.hora_fin)}</span>
          ${c.aula ? `<span class="class-detail-tag">${ICONS.location} ${escapeHtml(c.aula)}</span>` : ""}
          ${c.profesor ? `<span class="class-detail-tag">${ICONS.person} ${escapeHtml(c.profesor)}</span>` : ""}
          ${!esAct && c.creditos ? `<span class="class-detail-tag">${c.creditos} Créditos</span>` : ""}
        </div>
        ${isHoy && !esAct ? (
          !cancelada ? `
            <div class="class-card-attendance" onclick="event.stopPropagation();">
              <button type="button" class="asist-pill-btn ${est === "presente" ? "active-presente" : ""}" data-action="asist-presente" data-clase-id="${c.id}" data-curso-id="${c.curso_id || ""}">
                ${ICONS.check} Asistí
              </button>
              <button type="button" class="asist-pill-btn ${est === "falta" ? "active-falta" : ""}" data-action="asist-falta" data-clase-id="${c.id}" data-curso-id="${c.curso_id || ""}">
                ${ICONS.x} Falté
              </button>
              <button type="button" class="asist-pill-btn ${est === "justificada" ? "active-justificada" : ""}" data-action="asist-justificada" data-clase-id="${c.id}" data-curso-id="${c.curso_id || ""}">
                ${ICONS.message} Justif.
              </button>
              <button type="button" class="asist-pill-btn" style="margin-left:auto;opacity:0.8;" data-action="cancelar-sesion" data-clase-id="${c.id}" data-curso-id="${c.curso_id || ""}" title="Cancelar solo la sesión de hoy">
                ${ICONS.ban} Cancelar
              </button>
            </div>
          ` : `
            <div class="class-card-attendance" onclick="event.stopPropagation();">
              <button type="button" class="asist-pill-btn" data-action="restaurar-sesion" data-clase-id="${c.id}" data-curso-id="${c.curso_id || ""}">
                ${ICONS.rotateCcw} Restaurar sesión
              </button>
            </div>
          `
        ) : ""}
      </div>
      ${ICONS.chevronRight}
    </div>`;
}

/* =====================================================================
   8. VISTA: HORARIO SEMANAL
   ===================================================================== */

/* =====================================================================
   6.5 GESTIÓN DE CICLO ACADÉMICO (17 SEMANAS)
   ===================================================================== */
async function obtenerCicloActivo() {
  try {
    const activo = await db.ciclos.where("estado").equals("activo").first();
    if (activo && activo.id !== "ciclo-inicial") return activo;
    if (activo && activo.id === "ciclo-inicial") {
      const tieneCursos = await db.cursos.count();
      if (tieneCursos > 0) return activo;
    }
    const fallback = await db.ciclos.toCollection().first();
    if (fallback && fallback.id !== "ciclo-inicial") return fallback;
    return null;
  } catch (err) {
    console.warn("Aviso al obtener ciclo activo:", err);
    return null;
  }
}

function openNewCicloModal(opts) {
  state.cicloModalCallback = (opts && opts.onSaved) || null;
  $("#modal-ciclo-title").textContent = "Nuevo Ciclo Académico (17 Semanas)";
  $("#ciclo-id").value = "";
  $("#ciclo-nombre").value = "";

  // Proponer el lunes más próximo
  const d = new Date();
  const day = d.getDay(); // 0 Dom, 1 Lun, ...
  const diffToMonday = day === 0 ? 1 : (day === 1 ? 0 : 8 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + (day <= 3 && day > 0 ? (1 - day) : diffToMonday));
  const mondayStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(monday);

  $("#ciclo-fecha-inicio").value = mondayStr;
  $("#ciclo-form-error").classList.add("hidden");
  actualizarPreviewCiclo();

  $("#modal-ciclo-backdrop").classList.remove("hidden");
  $("#ciclo-nombre").focus();
}

function openEditCicloModal(ciclo) {
  state.cicloModalCallback = null;
  $("#modal-ciclo-title").textContent = "Editar Ciclo Académico";
  $("#ciclo-id").value = ciclo.id;
  $("#ciclo-nombre").value = ciclo.nombre || "";
  $("#ciclo-fecha-inicio").value = ciclo.fecha_inicio || "";
  $("#ciclo-form-error").classList.add("hidden");
  actualizarPreviewCiclo();

  $("#modal-ciclo-backdrop").classList.remove("hidden");
}

function closeModalCiclo() {
  $("#modal-ciclo-backdrop").classList.add("hidden");
  state.cicloModalCallback = null;
}

function actualizarPreviewCiclo() {
  const inicioVal = $("#ciclo-fecha-inicio").value;
  const finPreviewEl = $("#ciclo-preview-fin");
  const s8PreviewEl = $("#ciclo-preview-sem8");
  const s17PreviewEl = $("#ciclo-preview-sem17");
  const avisoEl = $("#ciclo-dia-aviso");
  if (!inicioVal) {
    if (finPreviewEl) finPreviewEl.textContent = "Elige fecha de inicio";
    if (s8PreviewEl) s8PreviewEl.textContent = "-";
    if (s17PreviewEl) s17PreviewEl.textContent = "-";
    return;
  }

  const [y, m, d] = inicioVal.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const esLunes = dt.getDay() === 1;

  if (avisoEl) {
    if (!esLunes) {
      avisoEl.textContent = "Atención: La fecha seleccionada no es lunes. El ciclo académico debe iniciar un día lunes.";
      avisoEl.style.color = "var(--status-danger)";
    } else {
      avisoEl.textContent = "Válido: Inicia en día lunes (17 semanas continuas).";
      avisoEl.style.color = "var(--deep-leaf)";
    }
  }

  const finCalc = typeof calcularFinCiclo17Semanas === "function" ? calcularFinCiclo17Semanas(inicioVal) : "";
  const semanas = typeof proyectarSemanasCiclo === "function" ? proyectarSemanasCiclo(inicioVal) : [];
  const s8 = semanas.find(s => s.numero === 8);
  const s17 = semanas.find(s => s.numero === 17);

  if (finPreviewEl) finPreviewEl.textContent = `${finCalc} (17 semanas)`;
  if (s8PreviewEl) s8PreviewEl.textContent = s8 ? `${s8.inicio} al ${s8.fin}` : "-";
  if (s17PreviewEl) s17PreviewEl.textContent = s17 ? `${s17.inicio} al ${s17.fin}` : "-";
}

async function guardarCiclo(e) {
  e.preventDefault();
  const id = $("#ciclo-id").value || uuid();
  const nombre = $("#ciclo-nombre").value.trim();
  const inicioVal = $("#ciclo-fecha-inicio").value;
  const errorEl = $("#ciclo-form-error");
  errorEl.classList.add("hidden");

  if (!nombre) {
    errorEl.textContent = "Ingresa el nombre del ciclo (ej. 2026-I).";
    errorEl.classList.remove("hidden");
    return;
  }

  if (!inicioVal) {
    errorEl.textContent = "Selecciona la fecha de inicio del ciclo.";
    errorEl.classList.remove("hidden");
    return;
  }

  const [y, m, d] = inicioVal.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getDay() !== 1) {
    errorEl.textContent = "El ciclo académico debe iniciar obligatoriamente un día lunes.";
    errorEl.classList.remove("hidden");
    return;
  }

  const fecha_fin = typeof calcularFinCiclo17Semanas === "function"
    ? calcularFinCiclo17Semanas(inicioVal)
    : "";

  if (!$("#ciclo-id").value) {
    await db.ciclos.where("estado").equals("activo").modify({ estado: "archivado" });
  }

  const registro = {
    id,
    nombre,
    fecha_inicio: inicioVal,
    fecha_fin,
    estado: "activo",
    fecha_creacion: new Date().toISOString()
  };

  await db.ciclos.put(registro);

  // Sincronizar ajustes globales
  await db.ajustes.put({ clave: "ciclo_inicio", valor: inicioVal });
  await db.ajustes.put({ clave: "ciclo_fin", valor: fecha_fin });

  closeModalCiclo();
  showToast(`Ciclo "${nombre}" guardado.`);

  if (typeof state.cicloModalCallback === "function") {
    const cb = state.cicloModalCallback;
    state.cicloModalCallback = null;
    cb();
  }

  if (typeof reprogramarTodo === "function") reprogramarTodo();
  refrescarVistaActual();
}

async function confirmarArchivarCiclo(ciclo) {
  const ok = await confirmDialog(
    "Finalizar Ciclo Académico",
    `¿Deseas dar por concluido y archivar el ciclo "${ciclo.nombre}"?\n\nAl archivar, se limpiará el horario de clases de la semana para dar paso al nuevo ciclo, conservando todo el historial de calificaciones, asignaturas y registros de asistencia.`
  );
  if (!ok) return;

  await db.ciclos.update(ciclo.id, { estado: "archivado", fecha_archivado: new Date().toISOString() });

  showToast(`Ciclo "${ciclo.nombre}" archivado. Horario semanal reiniciado.`);
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  renderHorario();
}

async function renderCicloRoadmap() {
  const headerEl = $("#cycle-active-header");
  const listEl = $("#cycle-weeks-list");
  if (!headerEl || !listEl) return;

  const ciclo = await obtenerCicloActivo();
  if (!ciclo) {
    headerEl.innerHTML = `
      <div class="empty-card" style="margin: 0;">
        <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
        <strong>No hay un Ciclo Académico activo</strong>
        <p>Configura tu ciclo académico de 17 semanas para proyectar exámenes, asistencias y clases.</p>
        <button type="button" class="btn-primary btn-sm" id="btn-crear-primer-ciclo" style="margin-top: 10px;">Configurar Ciclo Académico</button>
      </div>`;
    listEl.innerHTML = "";
    const btn = $("#btn-crear-primer-ciclo", headerEl);
    if (btn) btn.addEventListener("click", () => openNewCicloModal());
    return;
  }

  const hoyStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
  const semanas = typeof proyectarSemanasCiclo === "function"
    ? proyectarSemanasCiclo(ciclo.fecha_inicio, hoyStr)
    : [];

  const semanaActual = semanas.find(s => s.esActual);
  const haConcluido = hoyStr > ciclo.fecha_fin;
  let progressPct = 0;
  if (haConcluido) {
    progressPct = 100;
  } else if (semanaActual) {
    progressPct = Math.round((semanaActual.numero / 17) * 100);
  }

  headerEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--text-primary);">${escapeHtml(ciclo.nombre)}</h3>
          <span class="cycle-badge-active" style="padding: 2px 8px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700; background: var(--accent-sage-soft); color: var(--deep-leaf);">Activo</span>
          ${haConcluido ? `<span style="background: rgba(210,50,50,0.15); color: var(--status-danger); padding: 2px 8px; border-radius: var(--radius-pill); font-size: 11px; font-weight: 700;">17 Semanas Concluidas</span>` : ""}
        </div>
        <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-secondary);">
          ${ciclo.fecha_inicio} al ${ciclo.fecha_fin} · 17 Semanas académicas
          ${semanaActual ? `· <strong>Semana ${semanaActual.numero} en curso</strong>` : (haConcluido ? "· Semestre completado" : "· Ciclo por iniciar")}
        </p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <button type="button" class="btn-secondary btn-sm" id="btn-editar-ciclo-activo">Editar Ciclo</button>
        <button type="button" class="btn-secondary btn-sm" id="btn-archivar-ciclo-activo" style="color: var(--status-danger); border-color: rgba(210,50,50,0.3);">Archivar / Finalizar</button>
      </div>
    </div>
    <div style="margin-top: 12px; background: var(--border-subtle); height: 6px; border-radius: 3px; overflow: hidden;">
      <div style="width: ${progressPct}%; background: var(--accent-teal); height: 100%; transition: width 0.3s ease;"></div>
    </div>`;

  const btnEdit = $("#btn-editar-ciclo-activo", headerEl);
  if (btnEdit) btnEdit.addEventListener("click", () => openEditCicloModal(ciclo));

  const btnArch = $("#btn-archivar-ciclo-activo", headerEl);
  if (btnArch) btnArch.addEventListener("click", () => confirmarArchivarCiclo(ciclo));

  const [eventos, tareas] = await Promise.all([
    db.eventos.toArray().catch(() => []),
    db.tareas.toArray().catch(() => [])
  ]);

  listEl.innerHTML = semanas.map(s => {
    const isExamenParcial = s.numero === 8;
    const isExamenFinal = s.numero === 17;
    const isCurrent = s.esActual;

    const evSemana = eventos.filter(ev => ev.fecha >= s.inicio && ev.fecha <= s.fin);
    const tarSemana = tareas.filter(t => t.fecha_limite && t.fecha_limite.slice(0, 10) >= s.inicio && t.fecha_limite.slice(0, 10) <= s.fin);

    let cardClasses = ["cycle-week-card"];
    if (isCurrent) cardClasses.push("is-current");
    if (isExamenParcial) cardClasses.push("is-exam");
    if (isExamenFinal) cardClasses.push("is-final");

    return `
      <div class="${cardClasses.join(" ")}" data-week="${s.numero}">
        <div class="cycle-week-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="cycle-week-num">Semana ${s.numero}</span>
            ${isCurrent ? `<span class="cycle-tag-badge is-current-badge">Actual</span>` : ""}
            ${isExamenParcial ? `<span class="cycle-tag-badge is-exam-badge">Exámenes Parciales</span>` : ""}
            ${isExamenFinal ? `<span class="cycle-tag-badge is-final-badge">Exámenes Finales</span>` : ""}
          </div>
          <span class="cycle-week-dates">${s.inicio} — ${s.fin}</span>
        </div>
        <div class="cycle-week-content">
          ${isExamenParcial ? `<div class="cycle-week-highlight">Semana 8: Evaluaciones Parciales Universitarias. Dedicada a exámenes según rol institucional.</div>` : ""}
          ${isExamenFinal ? `<div class="cycle-week-highlight">Semana 17: Evaluaciones Finales y Cierre de Actas Académicas.</div>` : ""}
          ${evSemana.length > 0 || tarSemana.length > 0 ? `
            <div class="cycle-week-items">
              ${evSemana.map(ev => `<span class="cycle-item-chip">${ICONS.calendar} ${escapeHtml(ev.titulo || ev.tipo)}</span>`).join("")}
              ${tarSemana.map(t => `<span class="cycle-item-chip">${ICONS.check} ${escapeHtml(t.titulo)}</span>`).join("")}
            </div>
          ` : `
            <div style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">${isExamenParcial ? "Evaluación parcial central" : (isExamenFinal ? "Cierre y entrega de promedios" : "Sesiones lectivas regulares")}</div>
          `}
        </div>
      </div>`;
  }).join("");
}

async function renderHorario() {
  const container = $("#schedule-container");
  const cycleContainer = $("#cycle-container");
  const dayTabsEl = $("#day-tabs-container");
  const matrixToolbarEl = $("#matrix-toolbar");

  $("#btn-mode-agenda").classList.toggle("active", state.scheduleMode === "agenda");
  $("#btn-mode-matrix").classList.toggle("active", state.scheduleMode === "matrix");
  const btnCycle = $("#btn-mode-cycle");
  if (btnCycle) btnCycle.classList.toggle("active", state.scheduleMode === "cycle");

  if (state.scheduleMode === "cycle") {
    dayTabsEl.classList.add("hidden");
    if (matrixToolbarEl) matrixToolbarEl.classList.add("hidden");
    container.classList.add("hidden");
    if (cycleContainer) {
      cycleContainer.classList.remove("hidden");
      await renderCicloRoadmap();
    }
    return;
  }

  if (cycleContainer) cycleContainer.classList.add("hidden");
  container.classList.remove("hidden");

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

      const duracionMin = Math.max(0, timeToMinutes(c.hora_fin) - timeToMinutes(c.hora_inicio));
      const esCorta = duracionMin <= 35 || height <= 38;

      cardsHtml += `
        <div class="matrix-cell-card gcal-event-card ${esCorta ? 'is-short-block' : ''}"
             data-id="${c.id}"
             style="top:${top}px; height:${height}px; left:${leftStyle}; width:${widthStyle}; background:${color}; color:${textColor}; border-color:${borderColor}; border-left-color:${borderColor};${esCorta ? 'padding: 2px 6px; display: flex; align-items: center; overflow: hidden;' : ''}"
             title="${escapeHtml(c.materia)} (${rangoHora12})${c.aula ? ' · ' + escapeHtml(c.aula) : ''}${c.profesor ? ' · ' + escapeHtml(c.profesor) : ''}">
          <div class="matrix-cell-card-title" style="${esCorta ? 'font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;' : ''}">${escapeHtml(c.materia)}</div>
          ${esCorta ? "" : `
            <div class="matrix-cell-card-time">${rangoHora12}</div>
            ${c.aula ? `<div class="matrix-cell-card-aula" title="Aula: ${escapeHtml(c.aula)}"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${escapeHtml(c.aula)}</div>` : ""}
            ${c.profesor ? `<div class="matrix-cell-card-prof" title="Profesor: ${escapeHtml(c.profesor)}"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> ${escapeHtml(c.profesor)}</div>` : ""}
          `}
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

  const isCalendar = state.tasksViewMode === "calendar";
  const btnList = $("#btn-tasks-mode-list");
  const btnCal = $("#btn-tasks-mode-cal");
  if (btnList) btnList.classList.toggle("active", !isCalendar);
  if (btnCal) btnCal.classList.toggle("active", isCalendar);

  const searchBox = $("#tasks-search-container");
  const filterChips = $("#tasks-filter-chips");
  const subjectFilter = $(".subject-filter-container");
  const listEl = $("#all-tasks-list");
  const calContainer = $("#tasks-calendar-container");

  if (isCalendar) {
    if (searchBox) searchBox.classList.add("hidden");
    if (filterChips) filterChips.classList.add("hidden");
    if (subjectFilter) subjectFilter.classList.add("hidden");
    if (listEl) listEl.classList.add("hidden");
    if (calContainer) calContainer.classList.remove("hidden");
    await renderCalendarioMensual();
    return;
  } else {
    if (searchBox) searchBox.classList.remove("hidden");
    if (filterChips) filterChips.classList.remove("hidden");
    if (subjectFilter) subjectFilter.classList.remove("hidden");
    if (listEl) listEl.classList.remove("hidden");
    if (calContainer) calContainer.classList.add("hidden");
  }

  // Si el curso filtrado fue eliminado, volver a "Todas"
  if (state.tasksMateriaFilter && !subjectMap[state.tasksMateriaFilter]) state.tasksMateriaFilter = "";

  const subjectsList = Object.values(subjectMap).sort((a, b) => a.materia.localeCompare(b.materia, "es"));
  const totalPendingCount = allTasks.filter(t => !t.completada).length;
  actualizarBadgeTareas(totalPendingCount);

  renderSubjectFilterUI(subjectsList, allTasks, totalPendingCount, subjectMap);

  // MODO ESTA SEMANA (Agrupado por prioridad y fecha)
  if (state.tasksFilter === "semana") {
    let pool = allTasks;
    if (state.tasksMateriaFilter) {
      pool = pool.filter(t => t._subjectKey === state.tasksMateriaFilter);
    }
    if (state.tasksSearchQuery) {
      const q = state.tasksSearchQuery.toLowerCase();
      pool = pool.filter(t => (t.titulo || "").toLowerCase().includes(q) || (t.materia || "").toLowerCase().includes(q));
    }

    const grupos = (typeof agruparSemana === "function" ? agruparSemana : window.agruparSemana)(pool, new Date());

    if (grupos.totalPendientes === 0) {
      listEl.innerHTML = `
        <div class="empty-card">
          <div class="empty-card-icon-wrap">${ICONS.checkCircle}</div>
          <strong>¡Todo al día esta semana!</strong>
          <p>No tienes tareas pendientes urgentes para estos días.</p>
        </div>`;
      return;
    }

    let html = "";
    const renderGroup = (titulo, items, badgeClass) => {
      if (!items || items.length === 0) return "";
      return `
        <div class="week-group-header">
          <span class="week-group-title">${titulo}</span>
          <span class="week-group-badge ${badgeClass}">${items.length}</span>
        </div>
        ${items.map(t => renderTaskCardHTML(t)).join("")}
      `;
    };

    html += renderGroup("Tareas Vencidas", grupos.vencidas, "danger");
    html += renderGroup("Para Hoy", grupos.hoy, "warning");
    html += renderGroup("Para Mañana", grupos.manana, "neutral");
    html += renderGroup("Esta Semana", grupos.resto, "neutral");
    html += renderGroup("Más Adelante", grupos.masAdelante, "neutral");
    html += renderGroup("Sin Fecha Límite", grupos.sinFecha, "neutral");

    listEl.innerHTML = html;
    wireTaskCardEvents(listEl);
    return;
  }

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

const MESES_LABEL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"
];

async function renderCalendarioMensual() {
  const anio = state.calendarYear;
  const mes = state.calendarMonth;
  const hoy = new Date();

  const titleEl = $("#cal-month-title");
  if (titleEl) {
    titleEl.textContent = `${MESES_LABEL[mes - 1]} ${anio}`;
  }

  const [clases, tareas, eventos, excepciones, { map: cursosMap }, cicloActivo, ajustes] = await Promise.all([
    obtenerClasesEnriquecidas(),
    db.tareas.toArray(),
    db.eventos.toArray(),
    db.excepciones.toArray(),
    cargarCursos(),
    obtenerCicloActivo(),
    db.ajustes.toArray()
  ]);

  const mapAjustes = {};
  for (const a of ajustes) mapAjustes[a.clave] = a.valor;
  const cfg = typeof sanitizarAjustes === "function" ? sanitizarAjustes(mapAjustes) : mapAjustes;
  const fechaIniCiclo = cicloActivo?.fecha_inicio || cfg.ciclo_inicio || null;
  const fechaFinCiclo = cicloActivo?.fecha_fin || cfg.ciclo_fin || (fechaIniCiclo && typeof calcularFinCiclo17Semanas === "function" ? calcularFinCiclo17Semanas(fechaIniCiclo) : null);

  const COLORES_IMPORTANCIA_TAREA = {
    1: "#FACC15",
    2: "#FBBF24",
    3: "#FB923C",
    4: "#F87171",
    5: "#EF4444"
  };

  const matriz = (typeof generarMatrizMes === "function" ? generarMatrizMes : window.generarMatrizMes)(anio, mes, hoy);
  const gridEl = $("#cal-days-grid");
  if (!gridEl) return;

  gridEl.innerHTML = matriz.map(celda => {
    const fecha = celda.fecha;
    const diaNum = celda.dia;
    const esHoy = celda.esHoy;
    const esDelMes = celda.esDelMes;
    const isSelected = state.selectedCalDate === fecha;

    const feriado = (typeof esDiaFeriado === "function" ? esDiaFeriado : window.esDiaFeriado)(fecha, excepciones);
    const dentroDelCiclo = (!fechaIniCiclo || fecha >= fechaIniCiclo) && (!fechaFinCiclo || fecha <= fechaFinCiclo);
    const dayKey = DIAS_SEMANA[celda.diaSemana - 1];
    // Solo proyectar clases si la fecha está dentro de las 17 semanas del ciclo académico activo
    const clasesDelDia = (!dentroDelCiclo || feriado) ? [] : clases.filter(c => c.dia_semana === dayKey && !(typeof esClaseCancelada === "function" ? esClaseCancelada : window.esClaseCancelada)(c.id, c.curso_id, fecha, excepciones));
    const tareasDelDia = tareas.filter(t => t.fecha_limite && t.fecha_limite.startsWith(fecha));
    const eventosDelDia = eventos.filter(e => e.fecha === fecha);

    let indicatorsHtml = "";
    if (feriado) {
      indicatorsHtml += `<span class="cal-dot" style="background:var(--status-warning);" title="Feriado"></span>`;
    }
    eventosDelDia.slice(0, 2).forEach(ev => {
      indicatorsHtml += `<span class="cal-diamond" style="background:#ef4444;" title="Evento: ${escapeHtml(ev.titulo)}"></span>`;
    });
    clasesDelDia.slice(0, 3).forEach(c => {
      const color = normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO);
      indicatorsHtml += `<span class="cal-dot" style="background:${color};" title="Clase: ${escapeHtml(c.materia)}"></span>`;
    });
    tareasDelDia.slice(0, 3).forEach(t => {
      const imp = Math.min(5, Math.max(1, Number(t.importancia) || 3));
      const color = t.completada ? "#10B981" : (COLORES_IMPORTANCIA_TAREA[imp] || "#FB923C");
      indicatorsHtml += `<span class="cal-dot" style="background:${color};" title="Tarea (Nivel ${imp}): ${escapeHtml(t.titulo)}"></span>`;
    });

    const tareasPendientes = tareasDelDia.filter(t => !t.completada);
    const tieneTareasPendientes = tareasPendientes.length > 0;
    const tieneTareas = tareasDelDia.length > 0;

    let borderStyle = "";
    if (tieneTareasPendientes) {
      const maxImp = Math.max(...tareasPendientes.map(t => Math.min(5, Math.max(1, Number(t.importancia) || 3))));
      const borderCol = COLORES_IMPORTANCIA_TAREA[maxImp] || "#FB923C";
      borderStyle = `style="--task-border-color: ${borderCol};"`;
    }

    const cellClasses = [
      "cal-cell",
      !esDelMes ? "is-other-month" : "",
      esHoy ? "is-today" : "",
      isSelected ? "is-selected" : "",
      tieneTareasPendientes ? "has-pending-task" : (tieneTareas ? "has-completed-task" : "")
    ].filter(Boolean).join(" ");

    return `
      <div class="${cellClasses}" data-date="${fecha}" ${borderStyle}>
        <span class="cal-day-num">${diaNum}</span>
        <div class="cal-cell-indicators">
          ${indicatorsHtml}
        </div>
      </div>
    `;
  }).join("");

  $$(".cal-cell", gridEl).forEach(cell => {
    cell.addEventListener("click", () => {
      const fecha = cell.dataset.date;
      state.selectedCalDate = fecha;
      $$(".cal-cell", gridEl).forEach(c => c.classList.toggle("is-selected", c.dataset.date === fecha));
      renderCalDayDetail(fecha, clases, tareas, eventos, excepciones, cursosMap);
    });
  });

  const hoyStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(hoy);
  const fechaTarget = state.selectedCalDate || hoyStr;
  state.selectedCalDate = fechaTarget;
  const targetCell = $(`[data-date="${fechaTarget}"]`, gridEl);
  if (targetCell) targetCell.classList.add("is-selected");
  renderCalDayDetail(fechaTarget, clases, tareas, eventos, excepciones, cursosMap);
}

async function renderCalDayDetail(fechaStr, clases, tareas, eventos, excepciones, cursosMap) {
  const panel = $("#cal-day-detail");
  if (!panel) return;

  if (!clases || !tareas || !eventos || !excepciones || !cursosMap) {
    [clases, tareas, eventos, excepciones, { map: cursosMap }] = await Promise.all([
      obtenerClasesEnriquecidas(),
      db.tareas.toArray(),
      db.eventos.toArray(),
      db.excepciones.toArray(),
      cargarCursos()
    ]);
  }

  const partes = fechaStr.split("-").map(Number);
  const d = new Date(partes[0], partes[1] - 1, partes[2]);
  const jsDay = d.getDay();
  const diaSemana = jsDay === 0 ? 7 : jsDay;
  const dayKey = DIAS_SEMANA[diaSemana - 1];

  $("#cal-day-detail-title").textContent = `${formatReadableDate(d)}`;

  const feriado = (typeof esDiaFeriado === "function" ? esDiaFeriado : window.esDiaFeriado)(fechaStr, excepciones);
  const ferObj = excepciones.find(e => e.fecha === fechaStr && e.tipo === "feriado");

  const clasesDelDia = feriado ? [] : clases.filter(c => c.dia_semana === dayKey);
  const tareasDelDia = tareas.filter(t => t.fecha_limite && t.fecha_limite.startsWith(fechaStr));
  const eventosDelDia = eventos.filter(e => e.fecha === fechaStr);

  $("#cal-day-detail-sub").textContent = `${clasesDelDia.length} ${clasesDelDia.length === 1 ? 'clase' : 'clases'} · ${tareasDelDia.length} ${tareasDelDia.length === 1 ? 'tarea' : 'tareas'}${eventosDelDia.length ? ` · ${eventosDelDia.length} evento(s)` : ''}`;

  const listEl = $("#cal-day-items-list");
  let itemsHtml = "";

  if (feriado) {
    itemsHtml += `
      <div class="holiday-banner" style="margin-bottom:6px;">
        <span>${ICONS.star} Feriado: ${escapeHtml(ferObj?.motivo || "Día No Laborable")}</span>
      </div>`;
  }

  eventosDelDia.forEach(ev => {
    const cursoNombre = cursosMap[ev.curso_id]?.nombre || "Curso";
    itemsHtml += `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;border-radius:var(--radius-sm);font-size:12px;">
        <div>
          <strong style="color:#ef4444;">${ev.tipo.toUpperCase()}: ${escapeHtml(ev.titulo)}</strong>
          <div style="color:var(--text-secondary);font-size:11px;">${escapeHtml(cursoNombre)}${ev.hora ? ` · ${formatTime12(ev.hora)}` : ""}${ev.aula ? ` · ${escapeHtml(ev.aula)}` : ""}</div>
        </div>
      </div>
    `;
  });

  clasesDelDia.forEach(c => {
    const cancelada = (typeof esClaseCancelada === "function" ? esClaseCancelada : window.esClaseCancelada)(c.id, c.curso_id, fechaStr, excepciones);
    const color = normalizarColorPastel(c.color || COLOR_CURSO_DEFECTO);
    itemsHtml += `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface-subtle);border-left:3px solid ${color};border-radius:var(--radius-sm);font-size:12px;opacity:${cancelada ? 0.6 : 1};">
        <div style="flex:1;">
          <strong>${escapeHtml(c.materia)}</strong>
          <div style="color:var(--text-secondary);font-size:11px;">
            ${formatTimeRange12(c.hora_inicio, c.hora_fin)} ${c.aula ? `· ${escapeHtml(c.aula)}` : ""}${cancelada ? " · (Cancelada)" : ""}
          </div>
        </div>
      </div>
    `;
  });

  tareasDelDia.forEach(t => {
    const cursoNombre = cursosMap[t.curso_id]?.nombre || "General";
    itemsHtml += `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface-subtle);border-radius:var(--radius-sm);font-size:12px;border:1px solid var(--border-hairline);">
        <span style="color:${t.completada ? '#10b981' : '#f59e0b'};display:inline-flex;align-items:center;">${t.completada ? ICONS.check : '<span style="font-size:10px;">○</span>'}</span>
        <div style="flex:1;">
          <span style="${t.completada ? 'text-decoration:line-through;opacity:0.7;' : ''}">${escapeHtml(t.titulo)}</span>
          <div style="color:var(--text-secondary);font-size:11px;">${escapeHtml(cursoNombre)} · Nivel ${t.importancia || 3}</div>
        </div>
      </div>
    `;
  });

  if (!itemsHtml) {
    itemsHtml = `<p class="practicas-empty" style="padding:10px;">Sin actividades registradas para este día.</p>`;
  }

  listEl.innerHTML = itemsHtml;
  panel.classList.remove("hidden");
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
          ${t.enlace ? `<a href="${escapeHtml(t.enlace)}" target="_blank" rel="noopener noreferrer" class="task-enlace-badge" onclick="event.stopPropagation();" title="Abrir enlace"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> Enlace</a>` : ""}
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
  const [{ list: cursos }, clases, asistencias, excepciones, cicloActivo, ajustes] = await Promise.all([
    cargarCursos(),
    db.clases.toArray(),
    db.asistencia.toArray(),
    db.excepciones.toArray(),
    obtenerCicloActivo(),
    db.ajustes.toArray()
  ]);
  const resumenEl = $("#cursos-resumen");
  const listEl = $("#cursos-list");

  const mapAjustes = {};
  for (const a of ajustes) mapAjustes[a.clave] = a.valor;
  const cfg = typeof sanitizarAjustes === "function" ? sanitizarAjustes(mapAjustes) : mapAjustes;
  const fechaIni = cicloActivo?.fecha_inicio || cfg.ciclo_inicio || "2026-03-16";
  const fechaFin = cicloActivo?.fecha_fin || cfg.ciclo_fin || "2026-07-12";
  const limiteFaltasPct = cfg.limite_faltas_pct || 30;

  if (cursos.length === 0) {
    resumenEl.innerHTML = "";
    resumenEl.classList.add("hidden");
    let cicloBannerHTML = "";
    if (!cicloActivo) {
      cicloBannerHTML = `
        <div class="empty-card" style="border:1.5px dashed var(--accent-teal); background:rgba(82,183,136,0.08); margin-bottom:14px; text-align:center;">
          <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
          <strong style="font-size:14px; color:var(--text-primary);">Ciclo Académico Requerido</strong>
          <p style="font-size:12px; color:var(--text-secondary); margin:6px 0 10px;">Para registrar asignaturas y organizar tu horario universitario, primero debes definir tu Ciclo Académico (17 semanas).</p>
          <button class="btn-primary btn-sm" id="btn-crear-ciclo-banner">Configurar Ciclo Académico</button>
        </div>`;
    }
    listEl.innerHTML = `
      ${cicloBannerHTML}
      <div class="empty-card">
        <div class="empty-card-icon-wrap">${ICONS.book}</div>
        <strong>Aún no registras cursos</strong>
        <p>Registra cada curso una sola vez con su profesor, aula y color. Luego armas el horario eligiendo el curso y la hora, y aquí llevas tus notas.</p>
        <button class="btn-primary btn-sm" id="btn-add-curso-empty" style="margin-top:10px;">Registrar Curso</button>
      </div>`;
    const btnCicloBanner = $("#btn-crear-ciclo-banner", listEl);
    if (btnCicloBanner) {
      btnCicloBanner.addEventListener("click", () => openNewCicloModal({ onSaved: () => renderCursos() }));
    }
    $("#btn-add-curso-empty", listEl).addEventListener("click", () => openNewCursoModal());
    return;
  }

  const sesionesPorCurso = {};
  clases.forEach(c => {
    const s = sesionesPorCurso[c.curso_id] || (sesionesPorCurso[c.curso_id] = { count: 0, minutos: 0 });
    s.count++;
    s.minutos += Math.max(0, timeToMinutes(c.hora_fin) - timeToMinutes(c.hora_inicio));
  });

  const fnResumen = typeof resumenAsistencia === "function" ? resumenAsistencia : window.resumenAsistencia;
  const filas = cursos.map(c => {
    const clasesCurso = clases.filter(cl => cl.curso_id === c.id);
    let asistRes = null;
    if (fnResumen) {
      asistRes = fnResumen({
        cursoId: c.id,
        clasesDelCurso: clasesCurso,
        asistencias,
        cicloInicio: fechaIni,
        cicloFin: fechaFin,
        excepciones,
        limiteFaltasPct
      });
    }
    return {
      curso: c,
      r: calcularRendimiento(c.evaluacion),
      sesiones: sesionesPorCurso[c.id] || { count: 0, minutos: 0 },
      asist: asistRes
    };
  });

  resumenEl.classList.remove("hidden");
  renderResumenCiclo(filas.map(f => f.r), cursos);

  listEl.innerHTML = filas.map(f => renderCursoCardHTML(f.curso, f.r, f.sesiones, f.asist)).join("");

  $$('[data-action="notas"]', listEl).forEach(btn => {
    btn.addEventListener("click", () => openNotasModal(btn.closest(".course-card").dataset.id));
  });
  $$('[data-action="asistencia"]', listEl).forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAsistenciaModal(btn.dataset.id || btn.closest(".course-card").dataset.id);
    });
  });
  $$('[data-action="edit-curso"]', listEl).forEach(btn => {
    btn.addEventListener("click", () => openEditCursoModal(btn.closest(".course-card").dataset.id));
  });
}

let graficosRendimientoVisibles = false;
let cursosCacheadosParaGrafico = [];

function renderResumenCiclo(resultados, cursos = []) {
  if (cursos && cursos.length > 0) {
    cursosCacheadosParaGrafico = cursos;
  }
  const completos = resultados.filter(r => r.promedio !== null);
  const aprobados = resultados.filter(r => r.estado === "aprobado" || r.estado === "asegurado").length;
  const enRiesgo = resultados.filter(r => ["en-riesgo", "sin-opcion", "desaprobado"].includes(r.estado)).length;
  const promedioCiclo = completos.length
    ? completos.reduce((acc, r) => acc + r.promedio, 0) / completos.length
    : null;

  let ponderadoInfo = null;
  if (typeof resumenPonderadoCompleto === "function" && cursos && cursos.length > 0) {
    ponderadoInfo = resumenPonderadoCompleto(cursos);
  }

  const ponderadoHtml = ponderadoInfo && ponderadoInfo.creditosCalificados > 0
    ? `<div class="overview-tile" title="Promedio ponderado por créditos (${ponderadoInfo.creditosCalificados} de ${ponderadoInfo.totalCreditos} créditos evaluados)">
        <span class="overview-value">${formatNota(ponderadoInfo.promedioPonderado)}</span>
        <span class="overview-label">Ponderado (${ponderadoInfo.creditosCalificados} Créditos)</span>
      </div>`
    : "";

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
      <span class="overview-label">Prom. simple${completos.length ? ` (${completos.length})` : ""}</span>
    </div>
    ${ponderadoHtml}`;

  const toolbar = $("#rendimiento-toolbar");
  if (toolbar) {
    if (cursos && cursos.length > 0) {
      toolbar.classList.remove("hidden");
    } else {
      toolbar.classList.add("hidden");
    }
  }

  actualizarGraficosRendimiento(cursos);
}

function toggleGraficosRendimiento() {
  graficosRendimientoVisibles = !graficosRendimientoVisibles;
  const cont = $("#contenedor-graficos-svg");
  const btn = $("#btn-toggle-graficos");
  if (!cont) return;

  if (graficosRendimientoVisibles) {
    cont.classList.remove("hidden");
    if (btn) btn.innerHTML = `${ICONS.chart} Ocultar Gráfica`;
    actualizarGraficosRendimiento(cursosCacheadosParaGrafico);
  } else {
    cont.classList.add("hidden");
    if (btn) btn.innerHTML = `${ICONS.chart} Comparativa Gráfica`;
  }
}

function actualizarGraficosRendimiento(cursos = []) {
  if (cursos && cursos.length > 0) {
    cursosCacheadosParaGrafico = cursos;
  }
  const cont = $("#contenedor-graficos-svg");
  const wrap = $("#grafico-barras-svg-wrap");
  if (!cont || !wrap || cont.classList.contains("hidden")) return;

  if (!cursosCacheadosParaGrafico || cursosCacheadosParaGrafico.length === 0) {
    wrap.innerHTML = `<p style="font-size:12px; color:var(--text-secondary); text-align:center; padding:10px 0;">No hay cursos registrados para graficar.</p>`;
    return;
  }

  if (typeof generarSvgBarrasComparativas === "function") {
    wrap.innerHTML = generarSvgBarrasComparativas(cursosCacheadosParaGrafico, { width: 400, barHeight: 26 });
  }
}

async function openSimuladorModal() {
  const cursos = await db.cursos.toArray();
  const input = $("#simulador-meta-input");
  if (input && !input.value) {
    input.value = "14.0";
  }
  await actualizarSimulador(cursos);
  $("#modal-simulador-backdrop").classList.remove("hidden");
}

function closeSimuladorModal() {
  $("#modal-simulador-backdrop").classList.add("hidden");
}

async function actualizarSimulador(cursosPreloaded) {
  const cursos = cursosPreloaded || await db.cursos.toArray();
  const input = $("#simulador-meta-input");
  const meta = parseFloat(input ? input.value : 14) || 14;

  if (typeof simuladorMeta !== "function") return;
  const sim = simuladorMeta(cursos, meta);

  const credTotEl = $("#sim-creditos-totales");
  if (credTotEl) credTotEl.textContent = sim.sumaCreditos;
  const ptsAsegEl = $("#sim-puntos-asegurados");
  if (ptsAsegEl) ptsAsegEl.textContent = sim.puntosPonderadosAsegurados.toFixed(1);
  const ptsFaltEl = $("#sim-puntos-faltantes");
  if (ptsFaltEl) ptsFaltEl.textContent = sim.puntosPonderadosFaltantes.toFixed(1);
  const notaReqEl = $("#sim-nota-requerida");
  if (notaReqEl) notaReqEl.textContent = sim.yaAlcanzada ? "0.0" : sim.notaRequeridaUniforme.toFixed(1);

  const badge = $("#simulador-factible-badge");
  const alerta = $("#simulador-alerta-msg");

  if (sim.yaAlcanzada) {
    if (badge) {
      badge.textContent = "¡Meta Alcanzada!";
      badge.className = "badge-tag-success";
      badge.style.background = "rgba(46,125,50,0.18)";
      badge.style.color = "#1b6338";
    }
    if (alerta) {
      alerta.style.background = "rgba(46,125,50,0.12)";
      alerta.style.color = "#1b6338";
      alerta.textContent = "¡Excelente! Con tus notas aseguradas actuales ya has superado tu promedio objetivo.";
    }
  } else if (sim.esFactible) {
    if (badge) {
      badge.textContent = "Factible";
      badge.className = "badge-tag-success";
      badge.style.background = "rgba(46,125,50,0.18)";
      badge.style.color = "#1b6338";
    }
    if (alerta) {
      alerta.style.background = "rgba(46,125,50,0.12)";
      alerta.style.color = "#1b6338";
      alerta.textContent = `Necesitas promediar ${sim.notaRequeridaUniforme.toFixed(1)} en tus evaluaciones faltantes para alcanzar la meta ponderada de ${sim.meta.toFixed(1)}.`;
    }
  } else {
    if (badge) {
      badge.textContent = "Inalcanzable";
      badge.className = "badge-tag-urgent";
      badge.style.background = "rgba(220,53,69,0.15)";
      badge.style.color = "#a71d2a";
    }
    if (alerta) {
      alerta.style.background = "rgba(220,53,69,0.12)";
      alerta.style.color = "#a71d2a";
      alerta.textContent = `Matemáticamente inalcanzable: se requeriría una nota promedio de ${sim.notaRequeridaUniforme.toFixed(1)} (superior al máximo de 20.0) en las evaluaciones pendientes.`;
    }
  }

  const list = $("#simulador-cursos-list");
  if (!list) return;

  if (sim.cursosSim.length === 0) {
    list.innerHTML = `<p style="font-size:12px; color:var(--text-secondary); text-align:center;">No hay cursos registrados para simular.</p>`;
    return;
  }

  list.innerHTML = sim.cursosSim.map(c => {
    const infoEstado = ESTADO_NOTA_INFO[c.rendimiento.estado] || { label: c.rendimiento.estado, tone: "st-neutral" };
    const faltantesTexto = c.componentesFaltantes === 0
      ? "Evaluaciones completas"
      : `${c.componentesFaltantes} componente(s) faltante(s)`;

    return `
      <div style="background:var(--surface-subtle); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:11px 13px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div style="min-width:0; flex:1;">
          <div style="font-weight:700; font-size:13.5px; color:var(--text-primary); line-height:1.3; margin-bottom:2px;">${escapeHtml(c.nombre)}</div>
          <div style="font-size:11.5px; color:var(--text-secondary); line-height:1.3;">${c.creditos} Créditos · ${faltantesTexto}</div>
        </div>
        <div style="text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:3px;">
          <div style="font-weight:700; font-size:14.5px; color:var(--deep-leaf); font-family:var(--font-mono);">${c.rendimiento.promedio !== null ? formatNota(c.rendimiento.promedio) : (c.rendimiento.sinNotas ? "—" : formatNota(c.rendimiento.acumulado))}</div>
          <span class="grade-status-pill ${infoEstado.tone}" style="font-size:10px; padding:2px 7px;">${infoEstado.label}</span>
        </div>
      </div>`;
  }).join("");
}

function gradeCellHTML(label, valor) {
  return `
    <span class="grade-cell ${valor === null ? "is-empty" : ""}">
      <span class="grade-cell-label">${label}</span>
      <span class="grade-cell-value">${formatNota(valor)}</span>
    </span>`;
}

function renderCursoCardHTML(c, r, ses, asist = null) {
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

  const faltasCount = asist ? (asist.faltas || 0) : 0;
  const faltasTxt = asist ? (faltasCount > 0 ? `${faltasCount} ${faltasCount === 1 ? "falta" : "faltas"}` : "0 faltas") : "Asistencia";
  const asistBadgeClass = asist && faltasCount > 0 ? (asist.enRiesgo ? "course-asist-badge danger-faltas" : "course-asist-badge has-faltas") : "course-asist-badge";

  return `
    <article class="course-card" data-id="${escapeHtml(c.id)}">
      <span class="class-card-stripe" style="background:${color}"></span>
      <div class="course-card-main" data-action="notas" role="button" tabindex="0" aria-label="Ver y registrar notas de ${nombre}">
        <span class="course-card-head">
          <span class="class-card-title">${nombre}</span>
          <span class="class-card-details">
            ${c.creditos ? `<span class="class-detail-tag">${c.creditos} Créditos</span>` : ""}
            ${c.ciclo_curso ? `<span class="class-detail-tag">Ciclo ${escapeHtml(c.ciclo_curso)}</span>` : ""}
            ${c.tipo_condicion === "electivo" ? `<span class="class-detail-tag" style="color:var(--status-warning);font-weight:600;">Electivo</span>` : ""}
            
            ${c.grupo_seccion ? `<span class="class-detail-tag">Gr. ${escapeHtml(c.grupo_seccion)}</span>` : ""}
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
          <button type="button" class="asist-pill-btn ${asistBadgeClass}" data-action="asistencia" data-id="${escapeHtml(c.id)}" title="Ver registro y control de faltas (${faltasTxt})">
            ${ICONS.chart} ${faltasTxt}
          </button>
        </span>
      </div>
      <button type="button" class="icon-btn course-edit-btn" data-action="edit-curso" aria-label="Editar datos de ${nombre}" title="Editar curso">${ICONS.edit}</button>
    </article>`;
}

/* =====================================================================
   9.6 MODAL: NUEVO / EDITAR CURSO (CATÁLOGO)
   ===================================================================== */
const MAPA_PASTEL_A_SWATCH = {
  "#BAE6FD": "#38BDF8", "#BBF7D0": "#34D399", "#FEF08A": "#FBBF24",
  "#FECACA": "#F87171", "#DDD6FE": "#A78BFA", "#FED7AA": "#FB923C",
  "#DCFCE7": "#4ADE80", "#F5D0FE": "#E879F9", "#C7D2FE": "#818CF8",
  "#FFE4E6": "#FB7185", "#99F6E4": "#2DD4BF", "#ECFCCB": "#A3E635",
  "#FEF9C3": "#FACC15", "#E9D5FF": "#C084FC", "#CFFAFE": "#06B6D4",
  "#FFEDD5": "#EA580C", "#DBEAFE": "#60A5FA", "#D1FAE5": "#10B981",
  "#F1F5F9": "#94A3B8"
};

async function actualizarDisponibilidadColores(pickerEl, colorActualPermitido = null, idEntidadActual = null) {
  if (!pickerEl) return;
  const [cursos, clases] = await Promise.all([
    db.cursos.toArray(),
    db.clases.where("tipo").equals("actividad").toArray()
  ]);

  const coloresEnUso = new Set();
  for (const c of cursos) {
    if (c.id !== idEntidadActual && c.color) {
      const up = c.color.toUpperCase();
      coloresEnUso.add(up);
      if (MAPA_PASTEL_A_SWATCH[up]) coloresEnUso.add(MAPA_PASTEL_A_SWATCH[up]);
      const norm = normalizarColorPastel(up);
      if (norm) coloresEnUso.add(norm.toUpperCase());
    }
  }
  for (const act of clases) {
    if (act.id !== idEntidadActual && act.color) {
      const up = act.color.toUpperCase();
      coloresEnUso.add(up);
      if (MAPA_PASTEL_A_SWATCH[up]) coloresEnUso.add(MAPA_PASTEL_A_SWATCH[up]);
      const norm = normalizarColorPastel(up);
      if (norm) coloresEnUso.add(norm.toUpperCase());
    }
  }

  const permitidos = new Set();
  if (colorActualPermitido) {
    const upP = colorActualPermitido.toUpperCase();
    permitidos.add(upP);
    if (MAPA_PASTEL_A_SWATCH[upP]) permitidos.add(MAPA_PASTEL_A_SWATCH[upP]);
    const norm = normalizarColorPastel(upP);
    if (norm) permitidos.add(norm.toUpperCase());
  }

  const swatches = $$(".color-swatch", pickerEl);
  let primerDisponible = null;
  let seleccionadoVisible = false;

  swatches.forEach(s => {
    const swColor = (s.dataset.color || "").toUpperCase();
    const esTomado = !permitidos.has(swColor) && coloresEnUso.has(swColor);
    if (esTomado) {
      s.style.display = "none";
      s.classList.remove("selected");
    } else {
      s.style.display = "";
      if (!primerDisponible) primerDisponible = s;
      if (s.classList.contains("selected")) seleccionadoVisible = true;
    }
  });

  if (!seleccionadoVisible && primerDisponible) {
    primerDisponible.click();
  }
}

function setCursoColor(color) {
  const cUpper = (color || "#38BDF8").toUpperCase();
  $("#curso-color").value = cUpper;
  $$(".color-swatch", $("#curso-color-picker")).forEach(s => {
    const swUpper = (s.dataset.color || "").toUpperCase();
    s.classList.toggle("selected", swUpper === cUpper || MAPA_PASTEL_A_SWATCH[cUpper] === swUpper);
  });
}

async function openNewCursoModal(origin) {
  const cicloActivo = await obtenerCicloActivo();
  if (!cicloActivo) {
    showToast("Debes registrar un Ciclo Académico antes de crear asignaturas.");
    openNewCicloModal({ onSaved: () => openNewCursoModal(origin) });
    return;
  }

  state.cursoModalOrigin = origin || null;
  $("#modal-curso-title").textContent = "Nuevo Curso";
  $("#curso-id").value = "";
  $("#curso-nombre").value = "";
  $("#curso-profesor").value = "";
  $("#curso-aula").value = "";
  $("#curso-creditos").value = "3";
  $("#curso-notas").value = "";
  if ($("#curso-ciclo-academico")) $("#curso-ciclo-academico").value = "";
  if ($("#curso-tipo")) $("#curso-tipo").value = "obligatorio";
  
  if ($("#curso-grupo")) $("#curso-grupo").value = "";
  $("#curso-form-error").classList.add("hidden");
  $("#btn-delete-curso").classList.add("hidden");
  $("#curso-sesiones-info").classList.add("hidden");

  await actualizarDisponibilidadColores($("#curso-color-picker"), null, null);

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
  if ($("#curso-ciclo-academico")) $("#curso-ciclo-academico").value = c.ciclo_curso || "";
  if ($("#curso-tipo")) $("#curso-tipo").value = c.tipo_condicion || "obligatorio";
  
  if ($("#curso-grupo")) $("#curso-grupo").value = c.grupo_seccion || "";
  setCursoColor(c.color || COLOR_CURSO_DEFECTO);
  await actualizarDisponibilidadColores($("#curso-color-picker"), c.color, c.id);

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

  const cicloActivo = await obtenerCicloActivo();
  const previo = id ? existentes.find(c => c.id === id) : null;
  const curso = {
    id: id || uuid(),
    ciclo_id: previo?.ciclo_id || cicloActivo?.id || "",
    ciclo_curso: ($("#curso-ciclo-academico")?.value || "").trim(),
    tipo_condicion: $("#curso-tipo")?.value || "obligatorio",
    
    grupo_seccion: ($("#curso-grupo")?.value || "").trim(),
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

  const evoWrap = $("#notas-evolucion-svg-wrap");
  if (evoWrap && typeof generarSvgEvolucionCurso === "function") {
    const cursoTemp = {
      nombre: ($("#modal-notas-title") && $("#modal-notas-title").textContent) || "Curso",
      evaluacion
    };
    evoWrap.innerHTML = generarSvgEvolucionCurso(cursoTemp, { width: 380, height: 160 });
  }
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


/* =====================================================================
   SELECTOR DE HORAS 12H Y ACTIVIDADES NO ACADÉMICAS
   ===================================================================== */
function init12HourSelectors() {
  const selIniH = $("#select-hora-inicio-h");
  const selIniM = $("#select-hora-inicio-m");
  const selFinH = $("#select-hora-fin-h");
  const selFinM = $("#select-hora-fin-m");
  if (!selIniH || !selIniM || !selFinH || !selFinM) return;

  const hoursOpts = [];
  for (let h = 1; h <= 12; h++) {
    const val = pad2(h);
    hoursOpts.push(`<option value="${val}">${val}</option>`);
  }
  const hoursHtml = hoursOpts.join("");
  selIniH.innerHTML = hoursHtml;
  selFinH.innerHTML = hoursHtml;

  const minOpts = [];
  for (let m = 0; m < 60; m += 5) {
    const val = pad2(m);
    minOpts.push(`<option value="${val}">${val}</option>`);
  }
  const minHtml = minOpts.join("");
  selIniM.innerHTML = minHtml;
  selFinM.innerHTML = minHtml;

  const onChangeInicio = () => sincronizar24hDesde12("inicio");
  const onChangeFin = () => sincronizar24hDesde12("fin");

  selIniH.addEventListener("change", onChangeInicio);
  selIniM.addEventListener("change", onChangeInicio);
  selFinH.addEventListener("change", onChangeFin);
  selFinM.addEventListener("change", onChangeFin);

  const btnAmPmIni = $("#btn-hora-inicio-ampm");
  if (btnAmPmIni) {
    btnAmPmIni.addEventListener("click", () => {
      btnAmPmIni.textContent = btnAmPmIni.textContent.trim().toUpperCase() === "AM" ? "PM" : "AM";
      sincronizar24hDesde12("inicio");
    });
  }

  const btnAmPmFin = $("#btn-hora-fin-ampm");
  if (btnAmPmFin) {
    btnAmPmFin.addEventListener("click", () => {
      btnAmPmFin.textContent = btnAmPmFin.textContent.trim().toUpperCase() === "AM" ? "PM" : "AM";
      sincronizar24hDesde12("fin");
    });
  }
}

function actualizarSelector12hDesde24(prefix, hora24Str) {
  const hSel = $(`#select-hora-${prefix}-h`);
  const mSel = $(`#select-hora-${prefix}-m`);
  const ampmBtn = $(`#btn-hora-${prefix}-ampm`);
  const hintEl = $(`#hint-hora-${prefix}`);
  const hiddenInput = $(`#class-hora-${prefix}`);
  if (!hSel || !mSel || !ampmBtn) return;

  const [hRaw, mRaw] = (hora24Str || "08:00").split(":").map(Number);
  let h = isNaN(hRaw) ? 8 : hRaw;
  let m = isNaN(mRaw) ? 0 : mRaw;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const h12Str = pad2(h12);

  const mRedondeado = Math.min(55, Math.round(m / 5) * 5);
  const mStr = pad2(mRedondeado);

  hSel.value = h12Str;
  mSel.value = mStr;
  ampmBtn.textContent = ampm;

  const formatted24 = `${pad2(h)}:${pad2(mRedondeado)}`;
  if (hiddenInput) hiddenInput.value = formatted24;
  if (hintEl) hintEl.textContent = `${h12Str}:${mStr} ${ampm}`;
}

function sincronizar24hDesde12(prefix) {
  const hSel = $(`#select-hora-${prefix}-h`);
  const mSel = $(`#select-hora-${prefix}-m`);
  const ampmBtn = $(`#btn-hora-${prefix}-ampm`);
  const hintEl = $(`#hint-hora-${prefix}`);
  const hiddenInput = $(`#class-hora-${prefix}`);
  if (!hSel || !mSel || !ampmBtn) return;

  const h12 = parseInt(hSel.value, 10) || 12;
  const m = parseInt(mSel.value, 10) || 0;
  const ampm = ampmBtn.textContent.trim().toUpperCase();

  let h24 = h12 % 12;
  if (ampm === "PM") h24 += 12;
  const hora24 = `${pad2(h24)}:${pad2(m)}`;

  if (hiddenInput) hiddenInput.value = hora24;
  if (hintEl) hintEl.textContent = `${pad2(h12)}:${pad2(m)} ${ampm}`;
}

function setClassTypeMode(mode) {
  const isActividad = mode === "actividad";
  const hiddenTipo = $("#class-tipo");
  if (hiddenTipo) hiddenTipo.value = isActividad ? "actividad" : "curso";

  const btnCurso = $("#btn-class-type-curso");
  const btnAct = $("#btn-class-type-actividad");
  if (btnCurso) btnCurso.classList.toggle("active", !isActividad);
  if (btnAct) btnAct.classList.toggle("active", isActividad);

  const grpCurso = $("#group-class-curso");
  const grpAct = $("#group-class-actividad");
  if (grpCurso) grpCurso.classList.toggle("hidden", isActividad);
  if (grpAct) grpAct.classList.toggle("hidden", !isActividad);

  const titleEl = $("#modal-class-title");
  if (titleEl) {
    const isEdit = Boolean($("#class-id").value);
    titleEl.textContent = isActividad
      ? (isEdit ? "Editar Actividad / Trabajo" : "Añadir Actividad o Trabajo")
      : (isEdit ? "Editar Asignatura en Horario" : "Añadir Asignatura al Horario");
  }

  if (isActividad) {
    const curId = $("#class-id").value || null;
    const curColor = $("#class-actividad-color").value || null;
    actualizarDisponibilidadColores($("#class-actividad-color-picker"), curColor, curId);
  }
}

function setActividadColor(color) {
  const cUpper = (color || "#38BDF8").toUpperCase();
  const hiddenCol = $("#class-actividad-color");
  if (hiddenCol) hiddenCol.value = cUpper;
  const picker = $("#class-actividad-color-picker");
  if (picker) {
    $$(".color-swatch", picker).forEach(s => {
      const swUpper = (s.dataset.color || "").toUpperCase();
      s.classList.toggle("selected", swUpper === cUpper || MAPA_PASTEL_A_SWATCH[cUpper] === swUpper);
    });
  }
}

function actualizarHintsHoraClase() {
  actualizarSelector12hDesde24("inicio", $("#class-hora-inicio").value || "08:00");
  actualizarSelector12hDesde24("fin", $("#class-hora-fin").value || "10:00");
}

async function openNewClassModal(preselectedDay, preselectedCursoId) {
  const dia = preselectedDay || state.selectedDay || "LUNES";
  const count = await db.cursos.count();

  $("#modal-class-title").textContent = "Añadir al Horario";
  $("#class-id").value = "";
  $("#class-dia").value = dia;
  $("#class-hora-inicio").value = "08:00";
  $("#class-hora-fin").value = "10:00";
  $("#class-aula").value = "";
  $("#class-actividad-titulo").value = "";
  $("#class-actividad-categoria").value = "practicas";
  setActividadColor("#38BDF8");
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.add("hidden");

  actualizarSelector12hDesde24("inicio", "08:00");
  actualizarSelector12hDesde24("fin", "10:00");

  await actualizarDisponibilidadColores($("#class-actividad-color-picker"), null, null);

  if (count === 0) {
    setClassTypeMode("actividad");
  } else {
    setClassTypeMode("curso");
    await populateClassCursoSelect(preselectedCursoId || "");
  }
  $("#modal-class-backdrop").classList.remove("hidden");
}

async function openEditClassModal(id) {
  const c = await db.clases.get(id);
  if (!c) return;

  $("#class-id").value = c.id;
  $("#class-dia").value = c.dia_semana || "LUNES";
  const hIni24 = to24Hour(c.hora_inicio || "08:00");
  const hFin24 = to24Hour(c.hora_fin || "10:00");
  $("#class-hora-inicio").value = hIni24;
  $("#class-hora-fin").value = hFin24;
  $("#class-aula").value = c.aula || "";
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.remove("hidden");

  actualizarSelector12hDesde24("inicio", hIni24);
  actualizarSelector12hDesde24("fin", hFin24);

  if (c.tipo === "actividad") {
    setClassTypeMode("actividad");
    $("#class-actividad-titulo").value = c.titulo || "";
    $("#class-actividad-categoria").value = c.categoria || "practicas";
    setActividadColor(c.color || "#38BDF8");
    await actualizarDisponibilidadColores($("#class-actividad-color-picker"), c.color, c.id);
  } else {
    setClassTypeMode("curso");
    await populateClassCursoSelect(c.curso_id);
  }
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
  if ($("#task-enlace")) $("#task-enlace").value = "";

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
  if ($("#task-enlace")) $("#task-enlace").value = t.enlace || "";
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
  const listaAjustes12h = [
    ["ajuste-resumen", "#ajuste-resumen-hora", "#badge-resumen-hora", map.resumen_hora ?? "07:00"],
    ["ajuste-silencio-desde", "#ajuste-silencio-desde", "#badge-silencio-desde", map.silencio_desde ?? "22:00"],
    ["ajuste-silencio-hasta", "#ajuste-silencio-hasta", "#badge-silencio-hasta", map.silencio_hasta ?? "07:00"],
    ["ajuste-huecos-desde", "#ajuste-huecos-desde", "#badge-huecos-desde", map.huecos_ventana_desde ?? "07:00"],
    ["ajuste-huecos-hasta", "#ajuste-huecos-hasta", "#badge-huecos-hasta", map.huecos_ventana_hasta ?? "22:00"]
  ];
  listaAjustes12h.forEach(([pfx, hid, bdg, val]) => {
    configurarSelectorAjuste12h(pfx, hid, bdg);
    fijarHora12EnAjuste(pfx, hid, bdg, val);
  });
}



function configurarSelectorAjuste12h(prefix, hiddenInputId, badgeId) {
  const hSel = $(`#select-${prefix}-h`);
  const mSel = $(`#select-${prefix}-m`);
  const ampmBtn = $(`#btn-${prefix}-ampm`);
  const badgeEl = $(badgeId);
  const hiddenInput = $(hiddenInputId);
  if (!hSel || !mSel || !ampmBtn || !hiddenInput) return;

  if (hSel.children.length === 0) {
    const hours = [];
    for (let h = 1; h <= 12; h++) hours.push(`<option value="${pad2(h)}">${pad2(h)}</option>`);
    hSel.innerHTML = hours.join("");

    const mins = [];
    for (let m = 0; m < 60; m += 5) mins.push(`<option value="${pad2(m)}">${pad2(m)}</option>`);
    mSel.innerHTML = mins.join("");
  }

  const syncToHidden = () => {
    const h12 = parseInt(hSel.value, 10) || 12;
    const m = parseInt(mSel.value, 10) || 0;
    const ampm = ampmBtn.textContent.trim().toUpperCase();
    let h24 = h12 % 12;
    if (ampm === "PM") h24 += 12;
    const hora24 = `${pad2(h24)}:${pad2(m)}`;
    hiddenInput.value = hora24;
    const text12 = `${pad2(h12)}:${pad2(m)} ${ampm}`;
    if (badgeEl) badgeEl.textContent = text12;
  };

  hSel.onchange = syncToHidden;
  mSel.onchange = syncToHidden;
  ampmBtn.onclick = () => {
    const isAm = ampmBtn.textContent.trim().toUpperCase() === "AM";
    ampmBtn.textContent = isAm ? "PM" : "AM";
    ampmBtn.classList.toggle("is-pm", isAm);
    syncToHidden();
  };
}

function fijarHora12EnAjuste(prefix, hiddenInputId, badgeId, hora24Str) {
  const hSel = $(`#select-${prefix}-h`);
  const mSel = $(`#select-${prefix}-m`);
  const ampmBtn = $(`#btn-${prefix}-ampm`);
  const badgeEl = $(badgeId);
  const hiddenInput = $(hiddenInputId);
  if (!hSel || !mSel || !ampmBtn || !hiddenInput) return;

  const [hRaw, mRaw] = (hora24Str || "07:00").split(":").map(Number);
  let h = isNaN(hRaw) ? 7 : hRaw;
  let m = isNaN(mRaw) ? 0 : mRaw;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const h12Str = pad2(h12);
  const mRedondeado = Math.min(55, Math.round(m / 5) * 5);
  const mStr = pad2(mRedondeado);

  hSel.value = h12Str;
  mSel.value = mStr;
  ampmBtn.textContent = ampm;
  ampmBtn.classList.toggle("is-pm", ampm === "PM");

  const formatted24 = `${pad2(h)}:${pad2(mRedondeado)}`;
  hiddenInput.value = formatted24;
  if (badgeEl) badgeEl.textContent = `${h12Str}:${mStr} ${ampm}`;
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

async function renderAjustes() {
  await cargarAjustesUI();
  await renderAjustesExcepciones();
}

async function renderAjustesExcepciones() {
  const listEl = $("#ajustes-excepciones-lista");
  if (!listEl) return;
  const excepciones = await db.excepciones.toArray();
  const cursos = await db.cursos.toArray();
  const cursoMap = new Map(cursos.map(c => [c.id, c.nombre]));

  if (excepciones.length === 0) {
    listEl.innerHTML = `<p class="practicas-empty">No hay excepciones ni feriados registrados.</p>`;
    return;
  }

  excepciones.sort((a, b) => (a.fecha > b.fecha ? 1 : -1));
  listEl.innerHTML = excepciones.map(ex => {
    const cursoNombre = ex.curso_id ? (cursoMap.get(ex.curso_id) || "Curso") : "Todos los cursos";
    const tipoLabel = ex.tipo === "feriado" ? "Feriado" : "Clase cancelada";
    return `
      <div class="exception-item">
        <div class="exception-item-details">
          <strong>${tipoLabel}: ${escapeHtml(ex.motivo || "Sin motivo")}</strong>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">
            ${ex.fecha} · <span>${escapeHtml(cursoNombre)}</span>
          </div>
        </div>
        <button type="button" class="btn-danger btn-sm" data-action="delete-excepcion" data-id="${ex.id}" style="padding:4px 8px;font-size:11px;">Eliminar</button>
      </div>
    `;
  }).join("");

  $$("button[data-action='delete-excepcion']", listEl).forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await confirmDialog("Eliminar excepción", "¿Deseas eliminar este registro de feriado/cancelación?");
      if (ok) {
        await db.excepciones.delete(btn.dataset.id);
        showToast("Excepción eliminada.");
        if (typeof reprogramarTodo === "function") reprogramarTodo();
        renderAjustesExcepciones();
        if ($("#view-hoy").classList.contains("active")) renderHoy();
        if ($("#view-cursos").classList.contains("active")) renderCursos();
      }
    });
  });
}

async function openModalExcepcion(opts = {}) {
  const cursos = await db.cursos.toArray();
  const selCurso = $("#excepcion-curso");
  selCurso.innerHTML = `<option value="">Aplica a todas las clases</option>` +
    cursos.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</option>`).join("");

  $("#excepcion-fecha").value = opts.fecha || (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
  $("#excepcion-tipo").value = opts.tipo || "feriado";
  $("#excepcion-motivo").value = opts.motivo || "";
  if (opts.cursoId) selCurso.value = opts.cursoId;

  $("#modal-excepcion-backdrop").classList.remove("hidden");
  $("#excepcion-motivo").focus();
}

function closeModalExcepcion() {
  $("#modal-excepcion-backdrop").classList.add("hidden");
}

async function guardarExcepcion() {
  const fecha = $("#excepcion-fecha").value;
  const tipo = $("#excepcion-tipo").value;
  const motivo = $("#excepcion-motivo").value.trim();
  const curso_id = $("#excepcion-curso").value || null;

  if (!fecha || !motivo) {
    showToast("Fecha y motivo son obligatorios.", true);
    return;
  }

  const id = `ex_${Date.now()}`;
  await db.excepciones.put({
    id,
    fecha,
    tipo,
    motivo,
    curso_id
  });

  closeModalExcepcion();
  showToast(tipo === "feriado" ? "Feriado registrado." : "Cancelación registrada.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  renderAjustesExcepciones();
  if ($("#view-hoy").classList.contains("active")) renderHoy();
}

async function openAsistenciaModal(cursoId) {
  const c = await db.cursos.get(cursoId);
  if (!c) return;

  const clasesDelCurso = await db.clases.where("curso_id").equals(cursoId).toArray();
  const asistencias = await db.asistencia.where("curso_id").equals(cursoId).toArray();
  const excepciones = await db.excepciones.toArray();
  const ajustes = await db.ajustes.toArray();
  const mapAjustes = {};
  for (const a of ajustes) mapAjustes[a.clave] = a.valor;
  const cfg = typeof sanitizarAjustes === "function" ? sanitizarAjustes(mapAjustes) : mapAjustes;

  // Buscar primero el ciclo asociado al curso, o activo, o el último registrado aunque haya concluido
  let ciclo = null;
  if (c.ciclo_id) {
    ciclo = await db.ciclos.get(c.ciclo_id);
  }
  if (!ciclo) {
    ciclo = await obtenerCicloActivo();
  }
  if (!ciclo) {
    const todosCiclos = await db.ciclos.toArray();
    if (todosCiclos.length > 0) ciclo = todosCiclos[todosCiclos.length - 1];
  }
  const cicloActivo = ciclo;
  const fechaIni = ciclo?.fecha_inicio || cfg.ciclo_inicio || "2026-01-01";
  const fechaFin = ciclo?.fecha_fin || cfg.ciclo_fin || (typeof calcularFinCiclo17Semanas === "function" ? calcularFinCiclo17Semanas(fechaIni) : "2026-12-31");

  const res = (typeof resumenAsistencia === "function" ? resumenAsistencia : window.resumenAsistencia)({
    cursoId,
    clasesDelCurso,
    asistencias,
    cicloInicio: fechaIni,
    cicloFin: fechaFin,
    excepciones,
    limiteFaltasPct: cfg.limite_faltas_pct || 30
  });

  $("#asist-modal-title").textContent = `Asistencia: ${c.nombre}`;
  $("#asist-ciclo-rango").textContent = cicloActivo
    ? `Ciclo: ${cicloActivo.nombre} (${fechaIni} al ${fechaFin})`
    : (cfg.ciclo_inicio && cfg.ciclo_fin
      ? `Ciclo: ${cfg.ciclo_inicio} al ${cfg.ciclo_fin}`
      : "Ciclo: Configura inicio y fin en Ciclo Académico");
  $("#asist-total-sesiones").textContent = res.totalSesiones;
  $("#asist-faltas-registradas").textContent = `${res.faltas} (${res.justificadas || 0} justif.)`;
  $("#asist-max-faltas").textContent = res.maxFaltasPermitidas;
  $("#asist-faltas-restantes").textContent = res.faltasRestantes;
  $("#asist-faltas-restantes").style.color = res.enRiesgo ? "var(--status-danger)" : (res.faltasRestantes <= 2 ? "var(--status-warning)" : "var(--deep-leaf)");
  $("#asist-pct-faltas").textContent = `${res.porcentajeFaltasCiclo}%`;

  $("#asist-progreso-texto").textContent = `${res.porcentajeFaltasCiclo}% (Límite: ${res.limiteFaltasPct}%) · ${res.justificadas || 0} justificadas`;
  const fillPct = Math.min(100, (res.porcentajeFaltasCiclo / (res.limiteFaltasPct || 30)) * 100);
  const fillEl = $("#asist-progress-fill");
  fillEl.style.width = `${fillPct}%`;
  fillEl.style.backgroundColor = res.enRiesgo ? "var(--status-danger)" : (res.porcentajeFaltasCiclo >= 20 ? "var(--status-warning)" : "var(--accent-teal)");

  const listEl = $("#asist-sesiones-lista");
  let sesiones = res.todasLasSesiones;

  if (sesiones.length === 0 && asistencias.length > 0) {
    sesiones = asistencias.map(a => ({
      fecha: a.fecha,
      diaSemana: new Date(a.fecha + "T12:00:00").getDay() || 7,
      claseId: a.clase_id || "",
      horaInicio: "08:00",
      horaFin: "10:00",
      cancelada: false,
      feriado: false
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  if (sesiones.length === 0) {
    listEl.innerHTML = `<p class="practicas-empty">No hay sesiones calculadas. Asigna un horario semanal a este curso en Horario o verifica las fechas del ciclo académico.</p>`;
  } else {
    const hoyStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
    listEl.innerHTML = sesiones.map(s => {
      const asist = asistencias.find(a => (s.claseId && a.clase_id === s.claseId && a.fecha === s.fecha) || a.fecha === s.fecha);
      let est = "pendiente";
      let esPorDefecto = false;
      if (asist) {
        est = asist.estado;
      } else if (s.cancelada) {
        est = s.feriado ? "feriado" : "cancelada";
      } else if (s.fecha < hoyStr) {
        est = "presente";
        esPorDefecto = true;
      }

      let badgeHtml = "";
      if (s.cancelada) {
        badgeHtml = `<span class="badge-subtle">${s.feriado ? "Feriado" : "Cancelada"}</span>`;
      } else if (est === "falta") {
        badgeHtml = `<span class="badge-asist-falta">Inasistencia</span>`;
      } else if (est === "justificada") {
        badgeHtml = `<span class="badge-asist-justificada">Falta Justificada</span>`;
      } else if (est === "presente") {
        badgeHtml = `<span class="badge-asist-presente">${esPorDefecto ? "Asistido (por defecto)" : "Asistencia registrada"}</span>`;
      } else {
        badgeHtml = `<span class="badge-subtle">Pendiente</span>`;
      }

      const diaNombre = DIAS_LABEL[DIAS_SEMANA[s.diaSemana - 1]] || "";
      const rangoHora = s.horaInicio && s.horaFin ? ` · ${formatTimeRange12(s.horaInicio, s.horaFin)}` : "";

      return `
        <div class="asist-session-row">
          <div class="asist-session-info">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <strong>${s.fecha}</strong>
              <span style="color:var(--text-secondary);font-size:11.5px;">${diaNombre}${rangoHora}</span>
              ${badgeHtml}
            </div>
            ${s.motivo ? `<div style="font-size:11px;color:var(--status-warning);margin-top:2px;">${escapeHtml(s.motivo)}</div>` : ""}
          </div>
          <div class="asist-session-actions" style="display:flex;gap:4px;flex-shrink:0;">
            ${s.cancelada ? `<span style="font-size:11px;padding:3px 8px;border-radius:var(--radius-pill);background:var(--surface-subtle);color:var(--text-secondary);">${s.feriado ? "Feriado" : "Cancelada"}</span>` : `
              <button type="button" class="asist-pill-btn ${est === "presente" ? "active-presente" : ""}" data-action="set-asist" data-curso-id="${cursoId}" data-clase-id="${s.claseId || ""}" data-fecha="${s.fecha}" data-estado="presente" title="Marcar como presente">${ICONS.check} <span>Presente</span></button>
              <button type="button" class="asist-pill-btn ${est === "falta" ? "active-falta" : ""}" data-action="set-asist" data-curso-id="${cursoId}" data-clase-id="${s.claseId || ""}" data-fecha="${s.fecha}" data-estado="falta" title="Marcar como inasistencia">${ICONS.x} <span>Falta</span></button>
              <button type="button" class="asist-pill-btn ${est === "justificada" ? "active-justificada" : ""}" data-action="set-asist" data-curso-id="${cursoId}" data-clase-id="${s.claseId || ""}" data-fecha="${s.fecha}" data-estado="justificada" title="Marcar como falta justificada">${ICONS.message} <span>Justif.</span></button>
            `}
          </div>
        </div>
      `;
    }).join("");

    $$("button[data-action='set-asist']", listEl).forEach(btn => {
      btn.addEventListener("click", async () => {
        const f = btn.dataset.fecha;
        const nuevo = btn.dataset.estado;
        const claseId = btn.dataset.claseId || "";
        if (nuevo === "presente" && f > hoyStr) {
          showToast("No puedes registrar asistencia para una fecha futura.", true);
          return;
        }
        const curAsist = asistencias.find(a => (claseId && a.clase_id === claseId && a.fecha === f) || a.fecha === f);
        if (curAsist && curAsist.estado === nuevo) {
          if (curAsist.id) {
            await db.asistencia.delete(curAsist.id);
          }
          await db.asistencia.where("fecha").equals(f).and(a => a.curso_id === cursoId).delete();
        } else {
          await db.asistencia.put({
            id: curAsist?.id || (claseId ? `${cursoId}_${claseId}_${f}` : `${cursoId}_${f}`),
            curso_id: cursoId,
            clase_id: claseId,
            fecha: f,
            estado: nuevo
          });
        }
        if (typeof reprogramarTodo === "function") reprogramarTodo();
        await openAsistenciaModal(cursoId);
        await renderCursos();
        if ($("#view-hoy") && $("#view-hoy").classList.contains("active")) await renderHoy();
      });
    });
  }

  $("#modal-asistencia-backdrop").classList.remove("hidden");
}

function closeAsistenciaModal() {
  $("#modal-asistencia-backdrop").classList.add("hidden");
}

async function openModalEvento(eventoId = null, defaultCursoId = null) {
  const cursos = await db.cursos.toArray();
  const sel = $("#evento-curso");
  sel.innerHTML = cursos.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</option>`).join("");

  if (eventoId) {
    const ev = await db.eventos.get(eventoId);
    if (!ev) return;
    $("#evento-id").value = ev.id;
    $("#evento-titulo").value = ev.titulo || "";
    $("#evento-tipo").value = ev.tipo || "parcial";
    sel.value = ev.curso_id || "";
    $("#evento-fecha").value = ev.fecha || "";
    $("#evento-hora").value = ev.hora || "";
    $("#evento-aula").value = ev.aula || "";
    $("#evento-notas").value = ev.notas || "";
    $("#btn-eliminar-evento").classList.remove("hidden");
    $("#evento-modal-title").textContent = "Editar Evento Académico";
  } else {
    $("#evento-id").value = "";
    $("#evento-titulo").value = "";
    $("#evento-tipo").value = "parcial";
    if (defaultCursoId) sel.value = defaultCursoId;
    $("#evento-fecha").value = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
    $("#evento-hora").value = "";
    $("#evento-aula").value = "";
    $("#evento-notas").value = "";
    $("#btn-eliminar-evento").classList.add("hidden");
    $("#evento-modal-title").textContent = "Nuevo Evento Académico";
  }

  $("#modal-evento-backdrop").classList.remove("hidden");
  $("#evento-titulo").focus();
}

function closeModalEvento() {
  $("#modal-evento-backdrop").classList.add("hidden");
}

async function guardarEvento() {
  const titulo = $("#evento-titulo").value.trim();
  const tipo = $("#evento-tipo").value;
  const curso_id = $("#evento-curso").value;
  const fecha = $("#evento-fecha").value;
  const hora = $("#evento-hora").value || null;
  const aula = $("#evento-aula").value.trim() || null;
  const notas = $("#evento-notas").value.trim() || null;
  const id = $("#evento-id").value || `ev_${Date.now()}`;

  if (!titulo || !fecha || !curso_id) {
    showToast("Título, fecha y curso son obligatorios.", true);
    return;
  }

  await db.eventos.put({
    id,
    titulo,
    tipo,
    curso_id,
    fecha,
    hora,
    aula,
    notas
  });

  closeModalEvento();
  showToast("Evento académico guardado.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
}

async function eliminarEvento() {
  const id = $("#evento-id").value;
  if (!id) return;
  const ok = await confirmDialog("Eliminar Evento", "¿Deseas eliminar este evento académico permanentemente?");
  if (!ok) return;
  await db.eventos.delete(id);
  closeModalEvento();
  showToast("Evento académico eliminado.");
  if (typeof reprogramarTodo === "function") reprogramarTodo();
}


/**
 * Limpia cursos numéricos fantasma ("0", "1", "2"...) que hayan quedado de importaciones fallidas previas
 * y reasocia sus clases a los cursos reales correspondientes.
 */
async function limpiarCursosResidualesNumericos() {
  try {
    const [cursos, clases] = await Promise.all([db.cursos.toArray(), db.clases.toArray()]);
    const cursosNumericos = cursos.filter(c => /^\d+$/.test((c.nombre || "").trim()));
    if (cursosNumericos.length === 0) return;

    const cursosReales = cursos.filter(c => !/^\d+$/.test((c.nombre || "").trim()));
    const idsABorrar = [];

    await db.transaction("rw", db.cursos, db.clases, async () => {
      for (const cNum of cursosNumericos) {
        const numIdx = parseInt(cNum.nombre.trim(), 10);
        const cursoRealDestino = (numIdx >= 0 && numIdx < cursosReales.length) ? cursosReales[numIdx] : null;
        const clasesAsociadas = clases.filter(k => k.curso_id === cNum.id);
        if (cursoRealDestino && clasesAsociadas.length > 0) {
          for (const k of clasesAsociadas) {
            await db.clases.update(k.id, { curso_id: cursoRealDestino.id });
          }
        }
        idsABorrar.push(cNum.id);
      }
      if (idsABorrar.length) {
        await db.cursos.bulkDelete(idsABorrar);
      }
    });
  } catch (err) {
    console.warn("Limpieza de cursos numéricos omitida:", err);
  }
}

/**
 * Deduplica clases en la base de datos que compartan el mismo curso, día y rango horario.
 */
async function deduplicarClasesEnBd() {
  try {
    const clases = await db.clases.toArray();
    const vistas = new Set();
    const idsDuplicados = [];
    for (const c of clases) {
      const sig = `${c.curso_id}|${c.dia_semana}|${to24Hour(c.hora_inicio)}|${to24Hour(c.hora_fin)}`;
      if (vistas.has(sig)) {
        idsDuplicados.push(c.id);
      } else {
        vistas.add(sig);
      }
    }
    if (idsDuplicados.length > 0) {
      await db.clases.bulkDelete(idsDuplicados);
    }
  } catch (err) {
    console.warn("Deduplicación de clases omitida:", err);
  }
}

/**
 * Exporta o comparte un archivo JSON/texto de forma universal:
 * 1. Si está en el APK Android con puente nativo, lo guarda en Descargas/UNUmbral.
 * 2. Si está en un dispositivo móvil con Web Share API (navigator.canShare con File), abre la hoja de compartir nativa.
 * 3. En navegador web (Chrome móvil/PC), descarga mediante enlace en el DOM y revoca con delay de 10s.
 */
async function descargarOCompartirJson(payloadObj, nombreArchivo, toastExito = "Archivo exportado.") {
  const jsonStr = typeof payloadObj === "string" ? payloadObj : JSON.stringify(payloadObj, null, 2);

  // 1. APK Android nativo con UNUmbralNative: guardar directo en Descargas
  if (window.UNUmbralNative && typeof window.UNUmbralNative.saveTextFile === "function") {
    try {
      const guardado = window.UNUmbralNative.saveTextFile(jsonStr, nombreArchivo, "application/json");
      if (guardado) {
        showToast(`Archivo guardado en Descargas/UNUmbral: ${nombreArchivo}`);
        return true;
      }
    } catch (e) {
      console.warn("Fallo puente nativo saveTextFile:", e);
    }
  }

  // 2. Dispositivo móvil con Web Share API (WhatsApp, Drive, Files, etc.)
  const esMovil = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (typeof esNativo === "function" && esNativo());
  if (esMovil && typeof navigator !== "undefined" && typeof navigator.share === "function" && typeof File !== "undefined") {
    try {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const file = new File([blob], nombreArchivo, { type: "application/json" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: nombreArchivo,
          text: "Horario compartido desde UNUmbral"
        });
        showToast(toastExito);
        return true;
      }
    } catch (shareErr) {
      if (shareErr && shareErr.name === "AbortError") {
        return true;
      }
      console.warn("Web Share no completado, usando descarga estándar:", shareErr);
    }
  }

  // 3. Descarga web estándar con soporte para Chrome móvil (DOM append + delay en revokeObjectURL)
  try {
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 10000);
    showToast(toastExito);
    return true;
  } catch (err) {
    console.error("Error al exportar archivo:", err);
    showToast("Error al exportar el archivo: " + err.message, true);
    return false;
  }
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

  const nombreArchivo = `UNUmbral_Horario_${new Date().toISOString().slice(0, 10)}.json`;
  await descargarOCompartirJson(exportPayload, nombreArchivo, "Archivo de horario exportado.");
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
    const clasesExistentes = await db.clases.toArray();
    const cicloActivo = await obtenerCicloActivo();
    const r = convertirFormatoPlano(data.clases || [], [], existentes, data.cursos || [], cicloActivo?.id);

    const firmasExistentes = new Set(clasesExistentes.map(c =>
      `${c.curso_id}|${c.dia_semana}|${to24Hour(c.hora_inicio)}|${to24Hour(c.hora_fin)}`
    ));

    const clasesParaInsertar = [];
    for (const c of r.clases) {
      const sig = `${c.curso_id}|${c.dia_semana}|${to24Hour(c.hora_inicio)}|${to24Hour(c.hora_fin)}`;
      if (!firmasExistentes.has(sig)) {
        firmasExistentes.add(sig);
        clasesParaInsertar.push({ ...c, id: uuid() });
      }
    }

    await db.transaction("rw", db.cursos, db.clases, async () => {
      if (r.cursosNuevos.length) await db.cursos.bulkPut(r.cursosNuevos);
      if (clasesParaInsertar.length) await db.clases.bulkPut(clasesParaInsertar);
    });

    await limpiarCursosResidualesNumericos();
    await deduplicarClasesEnBd();

    showToast(`Horario importado (${r.cursosNuevos.length} cursos nuevos, ${clasesParaInsertar.length} clases agregadas).`);
    switchTab("view-horario");
  } catch (err) {
    console.error(err);
    showToast("Error al importar el archivo: " + err.message, true);
  }
}

/* =====================================================================
   12.5 COMPARTIR E IMPORTAR HORARIO POR QR OFFLINE (FASE 7)
   ===================================================================== */
let qrPartesActuales = [];
let qrParteIndiceActual = 0;
let partesQrAcumuladas = [];
let qrScannerStream = null;

async function openModalQrSchedule() {
  const [cursosRaw, clasesRaw] = await Promise.all([
    db.cursos.toArray(),
    db.clases.toArray()
  ]);
  if (cursosRaw.length === 0 && clasesRaw.length === 0) {
    showToast("No tienes cursos ni clases para compartir por QR.", true);
    return;
  }

  // Deduplicar cursos por nombre y clases por (curso, día, hora_inicio, hora_fin)
  const cursosUnicos = [];
  const mapaNombreACursoId = new Map();
  const mapaIdOriginalAUnico = new Map();

  for (const c of cursosRaw) {
    const key = (c.nombre || "").trim().toLowerCase();
    if (key && mapaNombreACursoId.has(key)) {
      mapaIdOriginalAUnico.set(c.id, mapaNombreACursoId.get(key));
    } else {
      if (key) mapaNombreACursoId.set(key, c.id);
      mapaIdOriginalAUnico.set(c.id, c.id);
      cursosUnicos.push(c);
    }
  }

  const idsCursosValidos = new Set(cursosUnicos.map(c => c.id));
  const mapaIdANombre = new Map(cursosUnicos.map(c => [c.id, c.nombre]));
  const clasesUnicas = [];
  const vistasClase = new Set();

  for (const k of clasesRaw) {
    // Solo compartir horario de cursos universitarios (excluir actividades personales o laborales)
    if (k.tipo === "actividad") continue;
    const cid = mapaIdOriginalAUnico.get(k.curso_id) || k.curso_id;
    if (!idsCursosValidos.has(cid)) continue;
    const sig = `${cid}|${k.dia_semana}|${k.hora_inicio}|${k.hora_fin}`;
    if (vistasClase.has(sig)) continue;
    vistasClase.add(sig);
    clasesUnicas.push({ ...k, curso_id: cid });
  }

  const cicloActivo = await obtenerCicloActivo();

  // QR optimizado: comparte ciclo académico, catálogo de cursos y horario semanal (sin notas ni faltas personales)
  const horarioCompartido = {
    tipo: "unumbral-horario-compartido",
    version: 3,
    exportado_el: new Date().toISOString(),
    ciclo: cicloActivo ? {
      nombre: cicloActivo.nombre,
      fecha_inicio: cicloActivo.fecha_inicio,
      fecha_fin: cicloActivo.fecha_fin
    } : null,
    cursos: cursosUnicos.map(c => ({
      id: c.id,
      nombre: c.nombre,
      color: c.color,
      aula: c.aula,
      profesor: c.profesor,
      creditos: c.creditos || 3
    })),
    clases: clasesUnicas.map(k => ({
      curso_id: mapaIdANombre.get(k.curso_id) || "",
      dia_semana: k.dia_semana,
      hora_inicio: k.hora_inicio,
      hora_fin: k.hora_fin,
      aula: k.aula
    }))
  };

  try {
    // Límite de 600 caracteres: con compresión Deflate interna, hasta 8-9 cursos caben en 1 solo código QR de cuadros grandes (~77x77 módulos)
    // Si excede ese volumen, el sistema lo divide automáticamente en 2 partes
    qrPartesActuales = (typeof comprimirHorarioParaQr === "function" ? comprimirHorarioParaQr : window.comprimirHorarioParaQr)(horarioCompartido, 600);
  } catch (err) {
    showToast("Error generando código QR: " + err.message, true);
    return;
  }

  qrParteIndiceActual = 0;
  renderQrEnDisplay(qrPartesActuales[0]);

  const multiControls = $("#qr-multipart-controls");
  if (multiControls) {
    if (qrPartesActuales.length > 1) {
      multiControls.classList.remove("hidden");
      const indicator = $("#qr-part-indicator");
      if (indicator) indicator.textContent = `Parte 1 de ${qrPartesActuales.length}`;
    } else {
      multiControls.classList.add("hidden");
    }
  }

  $("#modal-qr-schedule-backdrop").classList.remove("hidden");
}

function closeModalQrSchedule() {
  $("#modal-qr-schedule-backdrop").classList.add("hidden");
}

function renderQrEnDisplay(textoQr) {
  const container = $("#qr-display-container");
  if (!container) return;

  if (typeof qrcode === "function") {
    try {
      const qr = qrcode(0, "L");
      qr.addData(textoQr);
      qr.make();
      container.innerHTML = qr.createSvgTag({ scalable: true, margin: 4 });
      const svg = container.querySelector("svg");
      if (svg) {
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";
        svg.style.shapeRendering = "crispEdges";
      }
      return;
    } catch (err) {
      console.error("Error generando QR:", err);
    }
  }

  container.innerHTML = `<p style="font-size:12px; color:var(--text-secondary); text-align:center;">Librería QR no disponible.</p>`;
}

function mostrarSiguienteParteQr() {
  if (qrPartesActuales.length <= 1) return;
  qrParteIndiceActual = (qrParteIndiceActual + 1) % qrPartesActuales.length;
  renderQrEnDisplay(qrPartesActuales[qrParteIndiceActual]);
  const indicator = $("#qr-part-indicator");
  if (indicator) indicator.textContent = `Parte ${qrParteIndiceActual + 1} de ${qrPartesActuales.length}`;
}

function mostrarAnteriorParteQr() {
  if (qrPartesActuales.length <= 1) return;
  qrParteIndiceActual = (qrParteIndiceActual - 1 + qrPartesActuales.length) % qrPartesActuales.length;
  renderQrEnDisplay(qrPartesActuales[qrParteIndiceActual]);
  const indicator = $("#qr-part-indicator");
  if (indicator) indicator.textContent = `Parte ${qrParteIndiceActual + 1} de ${qrPartesActuales.length}`;
}

function incrustarFirmaQrEnCanvas(ctx, width, textoQr) {
  try {
    const bytes = new TextEncoder().encode(textoQr);
    const totalBits = (bytes.length + 2) * 8;
    if (totalBits + 16 > width * 4) return;
    const header = [bytes.length >> 8, bytes.length & 0xff, ...bytes];
    const imgData = ctx.getImageData(0, 0, width, 4);
    const d = imgData.data;
    // Magic "U1" en los primeros 16 píxeles (canal B: 254=1, 255=0)
    const magic = [0x55, 0x31, ...header];
    let bitIdx = 0;
    for (let i = 0; i < magic.length; i++) {
      for (let b = 7; b >= 0; b--) {
        const bit = (magic[i] >> b) & 1;
        const px = bitIdx * 4;
        if (px + 2 < d.length) {
          d[px] = 255;
          d[px + 1] = 255;
          d[px + 2] = bit ? 254 : 255;
          d[px + 3] = 255;
        }
        bitIdx++;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Ignorar si no aplica
  }
}

function extraerFirmaQrDeImagen(img) {
  try {
    const w = img.naturalWidth || img.width;
    if (!w || w < 100) return null;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = 4;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, 4, 0, 0, w, 4);
    const d = ctx.getImageData(0, 0, w, 4).data;
    const readByte = (byteOffset) => {
      let val = 0;
      for (let b = 0; b < 8; b++) {
        const px = (byteOffset * 8 + b) * 4;
        const bit = d[px + 2] === 254 ? 1 : 0;
        val = (val << 1) | bit;
      }
      return val;
    };
    if (readByte(0) !== 0x55 || readByte(1) !== 0x31) return null;
    const len = (readByte(2) << 8) | readByte(3);
    if (len <= 0 || len > 4000 || (len + 4) * 8 > w * 4) return null;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      out[i] = readByte(4 + i);
    }
    const str = new TextDecoder().decode(out);
    return str.startsWith("UNU1:") ? str : null;
  } catch {
    return null;
  }
}

function descargarQrPng() {
  if (!qrPartesActuales || qrPartesActuales.length === 0) return;
  const canvas = $("#qr-export-canvas");
  if (!canvas || typeof qrcode !== "function") return;

  try {
    const textoActual = qrPartesActuales[qrParteIndiceActual];
    const qr = qrcode(0, "L");
    qr.addData(textoActual);
    qr.make();
    const count = qr.getModuleCount();
    const cellSize = 10;
    const margin = 32;
    canvas.width = count * cellSize + margin * 2;
    canvas.height = count * cellSize + margin * 2;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(margin + c * cellSize, margin + r * cellSize, cellSize, cellSize);
        }
      }
    }
    incrustarFirmaQrEnCanvas(ctx, canvas.width, textoActual);

    const fileName = `UNUmbral_Horario_QR_${new Date().toISOString().slice(0, 10)}.png`;
    const dataUrl = canvas.toDataURL("image/png");

    // 1. Si estamos en el APK Android con nuestro puente nativo MediaStore, guardar directo en Galería
    if (window.UNUmbralNative && typeof window.UNUmbralNative.saveQrImage === "function") {
      const guardado = window.UNUmbralNative.saveQrImage(dataUrl, fileName);
      if (guardado) {
        showToast("Imagen QR guardada en tu Galería (álbum UNUmbral).");
        return;
      }
    }

    // 2. Fallback para navegador web / PWA
    const link = document.createElement("a");
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Imagen QR guardada correctamente.");
  } catch (err) {
    showToast("Error guardando imagen QR: " + err.message, true);
  }
}

async function openModalQrScanner() {
  partesQrAcumuladas = [];
  const statusEl = $("#qr-scanner-status");
  if (statusEl) statusEl.textContent = "Abriendo cámara… Apunta al código QR o sube una imagen.";
  const txtManual = $("#textarea-qr-manual");
  if (txtManual) txtManual.value = "";

  const camWrap = $("#qr-camera-wrap");
  const video = $("#qr-scanner-video");

  $("#modal-qr-scanner-backdrop").classList.remove("hidden");

  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function" && video && camWrap) {
    try {
      qrScannerStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 1.0 }
        },
        audio: false
      });
      video.srcObject = qrScannerStream;
      camWrap.classList.remove("hidden");
      await video.play().catch(() => {});
      if (statusEl) statusEl.textContent = "Apunta la cámara al código QR de UNUmbral o carga una foto.";
      iniciarDeteccionCamara(video);
    } catch {
      camWrap.classList.add("hidden");
      if (statusEl) statusEl.textContent = "Permiso de cámara no otorgado o cámara no disponible. Carga una foto del código QR.";
    }
  } else if (camWrap) {
    camWrap.classList.add("hidden");
    if (statusEl) statusEl.textContent = "Carga una foto del código QR o pega el código de texto.";
  }
}

function closeModalQrScanner() {
  if (qrScannerStream) {
    qrScannerStream.getTracks().forEach(t => t.stop());
    qrScannerStream = null;
  }
  const video = $("#qr-scanner-video");
  if (video) video.srcObject = null;
  $("#modal-qr-scanner-backdrop").classList.add("hidden");
}

async function iniciarDeteccionCamara(video) {
  const detector = ("BarcodeDetector" in window) ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
  const scanCanvas = document.createElement("canvas");
  const scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });

  let activa = true;

  async function tick() {
    if (!activa || !qrScannerStream || $("#modal-qr-scanner-backdrop").classList.contains("hidden")) {
      return;
    }
    try {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        // 1. BarcodeDetector nativo primero (evalúa el stream completo por hardware sin pérdida de nitidez)
        if (detector) {
          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              activa = false;
              procesarTextoQrEscaneado(barcodes[0].rawValue);
              return;
            }
          } catch {
            // Seguir con jsQR recortado
          }
        }

        // 2. jsQR enfocado en el centro 1:1 del visor (recorte central de alta resolución)
        if (typeof window.jsQR === "function" && scanCtx) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const cropSize = Math.round(Math.min(vw, vh) * 0.85);
          const sx = Math.round((vw - cropSize) / 2);
          const sy = Math.round((vh - cropSize) / 2);
          const targetDim = Math.min(cropSize, 720);

          scanCanvas.width = targetDim;
          scanCanvas.height = targetDim;
          scanCtx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, targetDim, targetDim);
          const imgData = scanCtx.getImageData(0, 0, targetDim, targetDim);
          const code = window.jsQR(imgData.data, targetDim, targetDim, { inversionAttempts: "attemptBoth" });
          if (code && code.data) {
            activa = false;
            procesarTextoQrEscaneado(code.data);
            return;
          }
        }
      }
    } catch {
      // Ignorar cuadros en transición
    }

    if (activa && qrScannerStream && !$("#modal-qr-scanner-backdrop").classList.contains("hidden")) {
      setTimeout(tick, 140);
    }
  }

  tick();
}

function cargarImagenDesdeArchivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = reader.result;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function intentarJsQrEnRegion(img, sx, sy, sw, sh, targetMaxDim, binarizeThreshold = null) {
  if (typeof window.jsQR !== "function") return null;
  const canvas = document.createElement("canvas");
  const scale = targetMaxDim / Math.max(sw, sh);
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  if (binarizeThreshold !== null) {
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = lum < binarizeThreshold ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  const code = window.jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" });
  return code && code.data ? code.data : null;
}

async function procesarArchivoImagenQr(file) {
  if (!file) return;
  const statusEl = $("#qr-scanner-status");
  if (statusEl) statusEl.textContent = "Analizando imagen de código QR...";

  try {
    const img = await cargarImagenDesdeArchivo(file);
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    // 0. Si es un PNG generado directamente con "Guardar imagen QR", lectura instantánea sin pérdida
    const firmaDirecta = extraerFirmaQrDeImagen(img);
    if (firmaDirecta) {
      procesarTextoQrEscaneado(firmaDirecta);
      return;
    }

    // 1. Detección nativa por BarcodeDetector (instantánea y con aceleración GPU)
    if ("BarcodeDetector" in window) {
      try {
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(img);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          procesarTextoQrEscaneado(barcodes[0].rawValue);
          return;
        }
      } catch {
        // Fallback a escaneo multiescala
      }
    }

    // 2. Intentar jsQR en imagen completa a distintas escalas (normal y binarizada)
    for (const dim of [800, 1200, 550, 1600]) {
      const res = intentarJsQrEnRegion(img, 0, 0, iw, ih, dim, null) ||
                  intentarJsQrEnRegion(img, 0, 0, iw, ih, dim, 160);
      if (res) {
        procesarTextoQrEscaneado(res);
        return;
      }
    }

    // 3. Intentar jsQR en recortes de pantalla (incluyendo bottom-sheet donde se ubica el modal en el celular)
    const crops = [
      [iw * 0.08, ih * 0.44, iw * 0.84, ih * 0.42], // Bottom-sheet QR exacto
      [0, ih * 0.36, iw, ih * 0.56],                 // Mitad inferior de captura de pantalla
      [iw * 0.08, ih * 0.18, iw * 0.84, ih * 0.56], // Centro de pantalla
      [iw * 0.10, ih * 0.25, iw * 0.80, ih * 0.60]  // Centro-bajo
    ];
    for (const [sx, sy, sw, sh] of crops) {
      for (const dim of [750, 1100]) {
        const res = intentarJsQrEnRegion(img, sx, sy, sw, sh, dim, null) ||
                    intentarJsQrEnRegion(img, sx, sy, sw, sh, dim, 160);
        if (res) {
          procesarTextoQrEscaneado(res);
          return;
        }
      }
    }
  } catch (err) {
    console.warn("Fallo analizando imagen QR:", err);
  }

  showToast("No se detectó un código QR legible en la imagen. Usa 'Guardar imagen QR' o sube una captura nítida.", true);
  if (statusEl) statusEl.textContent = "No se detectó código QR en la imagen.";
}

async function procesarTextoQrEscaneado(rawText) {
  if (!rawText) return;
  const text = rawText.trim();

  let res;
  try {
    res = (typeof descomprimirHorarioDeQr === "function" ? descomprimirHorarioDeQr : window.descomprimirHorarioDeQr)(text);
  } catch (err) {
    showToast("QR no compatible: " + err.message, true);
    return;
  }

  if (res.esMultiparte) {
    partesQrAcumuladas.push(res);
    const ensamble = (typeof ensamblarQrMultiparte === "function" ? ensamblarQrMultiparte : window.ensamblarQrMultiparte)(partesQrAcumuladas);
    if (!ensamble.completo) {
      const msg = `Parte ${res.parte} de ${res.total} leída con éxito. Faltan partes: ${ensamble.faltantes.join(", ")}.`;
      showToast(msg);
      const statusEl = $("#qr-scanner-status");
      if (statusEl) statusEl.textContent = msg;
      return;
    }
    res = { esMultiparte: false, horario: ensamble.horario };
  }

  const horario = res.horario;
  closeModalQrScanner();

  const totalCursos = Array.isArray(horario.cursos) ? horario.cursos.length : 0;
  const totalClases = Array.isArray(horario.clases) ? horario.clases.length : 0;

  const ok = await confirmDialog(
    "Importar Horario por QR",
    `¿Deseas importar el horario escaneado con ${totalCursos} cursos y ${totalClases} clases?`
  );
  if (!ok) return;

  await ejecutarImportacionHorario(horario);
}

async function ejecutarImportacionHorario(data) {
  const existentes = await db.cursos.toArray();
  const clasesExistentes = await db.clases.toArray();
  let cicloActivo = await obtenerCicloActivo();

  // Si el QR contiene ciclo académico, verificar si existe o crearlo y activarlo
  let cicloIdAUsar = cicloActivo?.id || null;
  if (data.ciclo && data.ciclo.nombre && data.ciclo.fecha_inicio) {
    const ciclos = await db.ciclos.toArray();
    const coincide = ciclos.find(ci =>
      ci.nombre.toLowerCase().trim() === data.ciclo.nombre.toLowerCase().trim() ||
      ci.fecha_inicio === data.ciclo.fecha_inicio
    );
    if (coincide) {
      cicloIdAUsar = coincide.id;
    } else {
      const nuevoCiclo = {
        id: `ciclo_${Date.now()}`,
        nombre: data.ciclo.nombre,
        fecha_inicio: data.ciclo.fecha_inicio,
        fecha_fin: data.ciclo.fecha_fin || (typeof calcularFinCiclo17Semanas === "function" ? calcularFinCiclo17Semanas(data.ciclo.fecha_inicio) : ""),
        estado: "activo",
        fecha_creacion: new Date().toISOString()
      };
      await db.ciclos.put(nuevoCiclo);
      cicloIdAUsar = nuevoCiclo.id;
    }
  }

  const r = convertirFormatoPlano(data.clases || [], [], existentes, data.cursos || [], cicloIdAUsar);

  const firmasExistentes = new Set(clasesExistentes.map(c =>
    `${c.curso_id}|${c.dia_semana}|${to24Hour(c.hora_inicio)}|${to24Hour(c.hora_fin)}`
  ));

  const clasesParaInsertar = [];
  for (const c of r.clases) {
    const sig = `${c.curso_id}|${c.dia_semana}|${to24Hour(c.hora_inicio)}|${to24Hour(c.hora_fin)}`;
    if (!firmasExistentes.has(sig)) {
      firmasExistentes.add(sig);
      clasesParaInsertar.push({ ...c, id: uuid() });
    }
  }

  const asistenciasParaInsertar = [];
  if (Array.isArray(data.asistencias) && data.asistencias.length > 0) {
    for (const a of data.asistencias) {
      const realCurso = r.porId.get(String(a.curso_id));
      const targetCid = realCurso ? realCurso.id : a.curso_id;
      if (targetCid && a.fecha && a.estado) {
        asistenciasParaInsertar.push({
          id: `${targetCid}_${a.fecha}`,
          curso_id: targetCid,
          fecha: a.fecha,
          estado: a.estado,
          tipo_registro: "qr_import",
          modificado_el: new Date().toISOString()
        });
      }
    }
  }

  await db.transaction("rw", db.cursos, db.clases, db.asistencia, async () => {
    if (r.cursosNuevos.length) await db.cursos.bulkPut(r.cursosNuevos);
    if (clasesParaInsertar.length) await db.clases.bulkPut(clasesParaInsertar);
    if (asistenciasParaInsertar.length) await db.asistencia.bulkPut(asistenciasParaInsertar);
  });

  await limpiarCursosResidualesNumericos();
  await deduplicarClasesEnBd();

  showToast(`Horario importado (${r.cursosNuevos.length} cursos nuevos, ${clasesParaInsertar.length} clases agregadas).`);
  if (typeof reprogramarTodo === "function") reprogramarTodo();
  switchTab("view-horario");
}

async function exportFullBackup() {
  const [ciclos, cursos, classes, tasks, eventos, asistencia, excepciones, ajustes] = await Promise.all([
    db.ciclos.toArray(),
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
    version: 5,
    fecha_creacion: new Date().toISOString(),
    ciclos: ciclos || [],
    cursos,
    clases: classes,
    tareas: tasks,
    eventos: eventos || [],
    asistencia: asistencia || [],
    excepciones: excepciones || [],
    ajustes: ajustes || []
  };

  const nombreArchivo = `UNUmbral_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  await descargarOCompartirJson(payload, nombreArchivo, "Copia de seguridad generada.");
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

    await db.transaction("rw", [db.ciclos, db.cursos, db.clases, db.tareas, db.eventos, db.asistencia, db.excepciones, db.ajustes], async () => {
      if (Array.isArray(data.ciclos) && data.ciclos.length > 0) {
        await db.ciclos.bulkPut(data.ciclos);
      }
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
    "Cargar Semestre Modelo (UNU)",
    "Se configurará un Ciclo Académico completo (17 semanas), asignaturas con créditos y notas, actividades extracurriculares (prácticas, talleres), tareas presentadas y por hacer, asistencias y perfil estudiantil. ¿Continuar?"
  );
  if (!ok) return;

  const fnFecha = typeof fechaAString === "function" ? fechaAString : window.fechaAString;
  const hoy = new Date();

  // Calcular un lunes reciente (hace 3 semanas) para tener sesiones pasadas y futuras
  const day = hoy.getDay();
  const diffToCurrentMonday = day === 0 ? -6 : 1 - day;
  const lunesActual = new Date(hoy);
  lunesActual.setDate(hoy.getDate() + diffToCurrentMonday);

  // Iniciar el ciclo hace 3 semanas
  const lunesInicio = new Date(lunesActual);
  lunesInicio.setDate(lunesActual.getDate() - 21);
  const inicioCicloStr = fnFecha(lunesInicio);
  const finCicloStr = typeof calcularFinCiclo17Semanas === "function"
    ? calcularFinCiclo17Semanas(inicioCicloStr)
    : "2027-01-10";

  // 1. Ciclo Académico activo
  const cicloId = "ciclo_unu_2026_2";
  const demoCiclo = {
    id: cicloId,
    nombre: "Ciclo 2026-II",
    fecha_inicio: inicioCicloStr,
    fecha_fin: finCicloStr,
    estado: "activo",
    creado_por_usuario: true,
    fecha_creacion: new Date().toISOString()
  };

  // 2. Perfil del Estudiante UNU
  const demoPerfil = {
    nombre: "Alex Mendoza Ríos",
    codigo: "0002120456",
    facultad: "Facultad de Ingeniería de Sistemas e Ingeniería Civil",
    escuela: "Escuela Profesional de Ingeniería de Sistemas",
    telefono: "961849201",
    correo: "alex.mendoza@unu.edu.pe"
  };

  // 3. Cursos Universitarios UNU
  const cIA = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Inteligencia Artificial y Sistemas Expertos",
    ciclo_curso: "IX",
    tipo_condicion: "obligatorio",
    codigo_asignatura: "SI-501",
    grupo_seccion: "A",
    profesor: "Dr. Agurto",
    aula: "Aula 1",
    color: "#BAE6FD",
    creditos: 4,
    notas: "Repositorio GitHub del curso y laboratorio de redes neuronales.",
    evaluacion: {
      parcial: 14.5,
      final: null,
      practicas: [
        { id: uuid(), titulo: "Lab 1: Algoritmos de Búsqueda A*", nota: 15 },
        { id: uuid(), titulo: "Lab 2: Agentes Inteligentes", nota: 13 },
        { id: uuid(), titulo: "Avance Proyecto Heurístico", nota: 16 }
      ]
    }
  };

  const cTop = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Tópicos Avanzados en Ingeniería de Software",
    ciclo_curso: "IX",
    tipo_condicion: "obligatorio",
    codigo_asignatura: "SI-502",
    grupo_seccion: "A",
    profesor: "Ing. Chaparro",
    aula: "Laboratorio de Redes",
    color: "#C7D2FE",
    creditos: 4,
    notas: "Arquitectura hexagonal, microservicios y despliegue CI/CD.",
    evaluacion: {
      parcial: 12.0,
      final: 15.0,
      practicas: [
        { id: uuid(), titulo: "Pipeline CI/CD con Docker", nota: 14 },
        { id: uuid(), titulo: "Documentación Arquitectura C4", nota: 16 }
      ]
    }
  };

  const cDist = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Sistemas Distribuidos",
    ciclo_curso: "IX",
    tipo_condicion: "obligatorio",
    codigo_asignatura: "SI-503",
    grupo_seccion: "A",
    profesor: "Ing. Mendoza",
    aula: "Lab Sistemas",
    color: "#FED7AA",
    creditos: 4,
    notas: "Algoritmo de consenso Raft y tolerancia a fallas bizantinas.",
    evaluacion: {
      parcial: 8.0,
      final: null,
      practicas: [
        { id: uuid(), titulo: "Práctica 1: Sockets TCP", nota: 9 },
        { id: uuid(), titulo: "Práctica 2: RPC con gRPC", nota: 8.5 }
      ]
    }
  };

  const cForm = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Formulación y Evaluación de Proyectos TI",
    ciclo_curso: "IX",
    tipo_condicion: "obligatorio",
    codigo_asignatura: "SI-504",
    grupo_seccion: "B",
    profesor: "Dra. Vargas",
    aula: "Aula 204",
    color: "#BBF7D0",
    creditos: 3,
    notas: "Metodología PMBOK, flujo de caja proyectado y TIR/VAN.",
    evaluacion: {
      parcial: 13.0,
      final: null,
      practicas: [
        { id: uuid(), titulo: "Control 1: Estudio de Mercado", nota: 12 },
        { id: uuid(), titulo: "Flujo de Caja y Análisis VAN", nota: 14 }
      ]
    }
  };

  const cAud = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Auditoría y Seguridad en Informática",
    ciclo_curso: "IX",
    tipo_condicion: "obligatorio",
    codigo_asignatura: "SI-505",
    grupo_seccion: "A",
    profesor: "Ing. Silva",
    aula: "Lab Virtual",
    color: "#F5D0FE",
    creditos: 3,
    notas: "Norma ISO 27001, pentesting ético y pruebas OWASP Top 10.",
    evaluacion: {
      parcial: 13.5,
      final: null,
      practicas: [
        { id: uuid(), titulo: "Informe Auditoría OWASP", nota: 14.5 }
      ]
    }
  };

  const cCloud = {
    id: uuid(),
    ciclo_id: cicloId,
    nombre: "Cloud Computing y Serverless",
    ciclo_curso: "IX",
    tipo_condicion: "electivo",
    codigo_asignatura: "SI-508",
    grupo_seccion: "A",
    profesor: "Ing. Pezo",
    aula: "Laboratorio Cloud",
    color: "#FEF08A",
    creditos: 3,
    notas: "Infraestructura como código con Terraform y arquitecturas serverless en AWS.",
    evaluacion: {
      parcial: 16.0,
      final: null,
      practicas: [
        { id: uuid(), titulo: "Microservicio Serverless", nota: 17 },
        { id: uuid(), titulo: "Infraestructura Terraform", nota: 16 }
      ]
    }
  };

  const demoCursos = [cIA, cTop, cDist, cForm, cAud, cCloud];

  // 4. Clases Académicas y ACTIVIDADES NO ACADÉMICAS
  const demoClasses = [
    // Clases regulares
    { id: uuid(), curso_id: cIA.id,   tipo: "curso", dia_semana: "LUNES",     hora_inicio: "16:30", hora_fin: "19:00", aula: "Aula 1", profesor: "Dr. Agurto" },
    { id: uuid(), curso_id: cTop.id,  tipo: "curso", dia_semana: "LUNES",     hora_inicio: "19:00", hora_fin: "21:30", aula: "Lab Redes", profesor: "Ing. Chaparro" },
    { id: uuid(), curso_id: cIA.id,   tipo: "curso", dia_semana: "MARTES",    hora_inicio: "14:00", hora_fin: "16:30", aula: "Aula 1", profesor: "Dr. Agurto" },
    { id: uuid(), curso_id: cForm.id, tipo: "curso", dia_semana: "MARTES",    hora_inicio: "19:50", hora_fin: "21:30", aula: "Aula 204", profesor: "Dra. Vargas" },
    { id: uuid(), curso_id: cAud.id,  tipo: "curso", dia_semana: "MIERCOLES", hora_inicio: "14:50", hora_fin: "16:30", aula: "Lab Virtual", profesor: "Ing. Silva" },
    { id: uuid(), curso_id: cDist.id, tipo: "curso", dia_semana: "MIERCOLES", hora_inicio: "19:50", hora_fin: "21:30", aula: "Lab Sistemas", profesor: "Ing. Mendoza" },
    { id: uuid(), curso_id: cDist.id, tipo: "curso", dia_semana: "JUEVES",    hora_inicio: "19:50", hora_fin: "21:30", aula: "Lab Sistemas", profesor: "Ing. Mendoza" },
    { id: uuid(), curso_id: cAud.id,  tipo: "curso", dia_semana: "VIERNES",   hora_inicio: "14:50", hora_fin: "16:30", aula: "Lab Virtual", profesor: "Ing. Silva" },
    { id: uuid(), curso_id: cForm.id, tipo: "curso", dia_semana: "VIERNES",   hora_inicio: "17:20", hora_fin: "19:00", aula: "Aula 204", profesor: "Dra. Vargas" },
    { id: uuid(), curso_id: cCloud.id,tipo: "curso", dia_semana: "SABADO",    hora_inicio: "08:30", hora_fin: "11:00", aula: "Lab Cloud", profesor: "Ing. Pezo" },

    // Actividades No Académicas (Trabajo / Prácticas / Taller de media hora)
    {
      id: uuid(),
      curso_id: "",
      materia: "Prácticas Pre-Profesionales OTI",
      tipo: "actividad",
      dia_semana: "LUNES",
      hora_inicio: "08:00",
      hora_fin: "12:00",
      aula: "Oficina TI - UNU",
      profesor: "Ing. Castillo (Tutor)",
      color: "#DDE8C8"
    },
    {
      id: uuid(),
      curso_id: "",
      materia: "Gimnasio Universitario",
      tipo: "actividad",
      dia_semana: "MIERCOLES",
      hora_inicio: "18:00",
      hora_fin: "18:30", // Bloque de 30 min (ideal para probar texto compacto)
      aula: "Complejo Deportivo UNU",
      profesor: "",
      color: "#FEE2E2"
    },
    {
      id: uuid(),
      curso_id: "",
      materia: "Club de Programación Competitiva",
      tipo: "actividad",
      dia_semana: "SABADO",
      hora_inicio: "11:30",
      hora_fin: "13:30",
      aula: "Auditorio Sistemas",
      profesor: "Comité de Estudiantes",
      color: "#99F6E4"
    }
  ];

  // 5. Tareas: Presentadas (hechas) y Pendientes (por hacer)
  const d1 = new Date(hoy.getTime() + 24 * 3600000).toISOString().slice(0, 16);
  const d2 = new Date(hoy.getTime() + 48 * 3600000).toISOString().slice(0, 16);
  const d3 = new Date(hoy.getTime() + 96 * 3600000).toISOString().slice(0, 16);
  const d4 = new Date(hoy.getTime() + 140 * 3600000).toISOString().slice(0, 16);

  const demoTasks = [
    // Tareas pendientes por hacer
    { id: uuid(), titulo: "Entrega Proyecto: Agente Inteligente A*", curso_id: cIA.id, fecha_limite: d1, importancia: 5, completada: false, fecha_creacion: hoy.toISOString(), notas: "Implementación en Python con interfaz gráfica interactiva." },
    { id: uuid(), titulo: "Informe de Auditoría Web OWASP Top 10", curso_id: cAud.id, fecha_limite: d2, importancia: 4, completada: false, fecha_creacion: hoy.toISOString(), notas: "Reporte de escaneo estático y pruebas de inyección SQL." },
    { id: uuid(), titulo: "Estudio de Mercado y Matriz VAN/TIR", curso_id: cForm.id, fecha_limite: d3, importancia: 4, completada: false, fecha_creacion: hoy.toISOString(), notas: "Modelo de inversión y tasa de descuento del 12%." },
    { id: uuid(), titulo: "Laboratorio RPC con gRPC en Go", curso_id: cDist.id, fecha_limite: d4, importancia: 3, completada: false, fecha_creacion: hoy.toISOString(), notas: "Protocol buffers y serialización binaria distribuida." },

    // Tareas ya presentadas y completadas
    { id: uuid(), titulo: "Pipeline CI/CD con GitHub Actions y Docker", curso_id: cTop.id, fecha_limite: "", importancia: 4, completada: true, fecha_creacion: hoy.toISOString(), notas: "Pruebas unitarias automatizadas y build exitoso." },
    { id: uuid(), titulo: "Informe Mensual de Prácticas OTI (Mes 1)", curso_id: "", materia: "Prácticas Pre-Profesionales OTI", fecha_limite: "", importancia: 5, completada: true, fecha_creacion: hoy.toISOString(), notas: "Firmado por el supervisor del área de redes." },
    { id: uuid(), titulo: "Lectura Consenso Distribuido Raft", curso_id: cDist.id, fecha_limite: "", importancia: 2, completada: true, fecha_creacion: hoy.toISOString(), notas: "Resumen de los estados Follower, Candidate y Leader." },
    { id: uuid(), titulo: "Despliegue de Función Serverless en AWS Lambda", curso_id: cCloud.id, fecha_limite: "", importancia: 3, completada: true, fecha_creacion: hoy.toISOString(), notas: "Integración con API Gateway y base DynamoDB." }
  ];

  // 6. Asistencias de ejemplo (incluye 2 faltas en Sistemas Distribuidos para ver la alerta)
  const fechaFalta1 = new Date(lunesActual);
  fechaFalta1.setDate(lunesActual.getDate() - 5); // Miércoles pasado
  const fFalta1Str = fnFecha(fechaFalta1);

  const fechaFalta2 = new Date(lunesActual);
  fechaFalta2.setDate(lunesActual.getDate() - 4); // Jueves pasado
  const fFalta2Str = fnFecha(fechaFalta2);

  const demoAsistencias = [
    { id: `${cDist.id}_${fFalta1Str}`, curso_id: cDist.id, fecha: fFalta1Str, estado: "falta" },
    { id: `${cDist.id}_${fFalta2Str}`, curso_id: cDist.id, fecha: fFalta2Str, estado: "falta" },
    { id: `${cForm.id}_${fFalta1Str}`, curso_id: cForm.id, fecha: fFalta1Str, estado: "justificada" }
  ];

  // 7. Guardar en Base de Datos Local
  await db.transaction("rw", db.ciclos, db.cursos, db.clases, db.tareas, db.asistencia, db.ajustes, async () => {
    await db.ciclos.put(demoCiclo);
    await db.ajustes.put({ clave: "perfil_estudiante", valor: demoPerfil });
    await db.ajustes.put({ clave: "ciclo_inicio", valor: inicioCicloStr });
    await db.ajustes.put({ clave: "ciclo_fin", valor: finCicloStr });
    await db.cursos.bulkPut(demoCursos);
    await db.clases.bulkPut(demoClasses);
    await db.tareas.bulkPut(demoTasks);
    await db.asistencia.bulkPut(demoAsistencias);
  });

  await cargarPerfilEstudiante();
  showToast("Semestre Modelo UNU cargado con ciclo, notas, actividades, tareas y asistencia.");
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
  const tipo = $("#class-tipo")?.value || "curso";
  const dia_semana = $("#class-dia").value;
  const hora_inicio = $("#class-hora-inicio").value;
  const hora_fin = $("#class-hora-fin").value;
  const aula = $("#class-aula").value.trim();
  const errorEl = $("#class-form-error");

  errorEl.classList.add("hidden");

  let curso_id = "";
  let titulo = "";
  let categoria = "";
  let color = COLOR_CURSO_DEFECTO;

  if (tipo === "actividad") {
    titulo = $("#class-actividad-titulo").value.trim();
    categoria = $("#class-actividad-categoria").value;
    color = $("#class-actividad-color").value || "#BAE6FD";
    if (!titulo) {
      errorEl.textContent = "El nombre o título de la actividad es obligatorio.";
      errorEl.classList.remove("hidden");
      return;
    }
  } else {
    curso_id = $("#class-curso").value;
    if (!curso_id) {
      errorEl.textContent = "Selecciona un curso de la lista.";
      errorEl.classList.remove("hidden");
      return;
    }
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
    const nombreConflicto = conflict.tipo === "actividad"
      ? (conflict.titulo || "otra actividad")
      : ((cursosMap[conflict.curso_id] && cursosMap[conflict.curso_id].nombre) || "otra clase");
    errorEl.textContent = `Conflicto de horario con "${nombreConflicto}" (${formatTimeRange12(conflict.hora_inicio, conflict.hora_fin)}, ${DIAS_LABEL[conflict.dia_semana]}).`;
    errorEl.classList.remove("hidden");
    return;
  }

  const cicloActivo = await obtenerCicloActivo();
  const ciclo_id = cicloActivo?.id || "";

  if (tipo === "actividad") {
    await db.clases.put({ id, tipo: "actividad", titulo, categoria, color, curso_id: "", dia_semana, hora_inicio, hora_fin, aula, ciclo_id });
    showToast("Actividad guardada en el horario.");
  } else {
    await db.clases.put({ id, tipo: "curso", curso_id, dia_semana, hora_inicio, hora_fin, aula, ciclo_id });
    showToast("Clase guardada en el horario.");
  }

  closeClassModal();
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
  const estimado_min = null;
  const enlace = ($("#task-enlace")?.value || "").trim();
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

  await db.tareas.put({ id, titulo, curso_id, fecha_limite, importancia, estimado_min, completada, fecha_creacion, notas, enlace });
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



/* =====================================================================
   13. EVENTOS Y FORMULARIOS
   ===================================================================== */

/* =====================================================================
   6.8 PERFIL DEL ESTUDIANTE (UNU) Y REPORTE DE FIN DE CICLO
   ===================================================================== */
async function cargarPerfilEstudiante() {
  const reg = await db.ajustes.get("perfil_estudiante");
  const p = reg?.valor || {};
  if ($("#perfil-nombre")) $("#perfil-nombre").value = p.nombre || "";
  if ($("#perfil-codigo")) $("#perfil-codigo").value = p.codigo || "";
  if ($("#perfil-telefono")) $("#perfil-telefono").value = p.telefono || "";
  if ($("#perfil-facultad")) $("#perfil-facultad").value = p.facultad || "";
  if ($("#perfil-escuela")) $("#perfil-escuela").value = p.escuela || "";
  if ($("#perfil-correo")) $("#perfil-correo").value = p.correo || "";
}

async function guardarPerfilEstudiante(e) {
  if (e) e.preventDefault();
  const perfil = {
    nombre: ($("#perfil-nombre")?.value || "").trim(),
    codigo: ($("#perfil-codigo")?.value || "").trim(),
    telefono: ($("#perfil-telefono")?.value || "").trim(),
    facultad: ($("#perfil-facultad")?.value || "").trim(),
    escuela: ($("#perfil-escuela")?.value || "").trim(),
    correo: ($("#perfil-correo")?.value || "").trim()
  };
  await db.ajustes.put({ clave: "perfil_estudiante", valor: perfil });
  showToast("Perfil de estudiante guardado exitosamente.");
}

let estadoUltimoReporte = null;

async function openReporteFinCicloModal() {
  const [{ list: cursos }, clases, asistencias, excepciones, cicloActivo, ajustes, regPerfil] = await Promise.all([
    cargarCursos(),
    db.clases.toArray(),
    db.asistencia.toArray(),
    db.excepciones.toArray(),
    obtenerCicloActivo(),
    db.ajustes.toArray(),
    db.ajustes.get("perfil_estudiante")
  ]);

  const mapAjustes = {};
  for (const a of ajustes) mapAjustes[a.clave] = a.valor;
  const cfg = typeof sanitizarAjustes === "function" ? sanitizarAjustes(mapAjustes) : mapAjustes;
  const perfil = regPerfil?.valor || {};

  const fechaIni = cicloActivo?.fecha_inicio || cfg.ciclo_inicio || "2026-03-16";
  const fechaFin = cicloActivo?.fecha_fin || cfg.ciclo_fin || "2026-07-12";
  const limiteFaltasPct = cfg.limite_faltas_pct || 30;

  const fnResumen = typeof resumenAsistencia === "function" ? resumenAsistencia : window.resumenAsistencia;

  let totalCreditosMatriculados = 0;
  let totalCreditosAprobados = 0;
  let sumaPonderada = 0;
  let sumaCreditosConNota = 0;
  let sumaSimple = 0;
  let cursosConNotaCount = 0;

  let totalSesionesGlobales = 0;
  let totalFaltasGlobales = 0;
  let totalJustificadasGlobales = 0;
  let totalHorasLectivasSemana = 0;

  const cursosReporte = cursos.map(c => {
    const r = calcularRendimiento(c.evaluacion);
    const clasesCurso = clases.filter(cl => cl.curso_id === c.id);

    let minutosSemana = 0;
    clasesCurso.forEach(cl => {
      minutosSemana += Math.max(0, timeToMinutes(cl.hora_fin) - timeToMinutes(cl.hora_inicio));
    });
    totalHorasLectivasSemana += (minutosSemana / 60);

    const cr = c.creditos || 3;
    totalCreditosMatriculados += cr;

    let asistRes = null;
    if (fnResumen) {
      asistRes = fnResumen({
        cursoId: c.id,
        clasesDelCurso: clasesCurso,
        asistencias,
        cicloInicio: fechaIni,
        cicloFin: fechaFin,
        excepciones,
        limiteFaltasPct
      });
      totalSesionesGlobales += (asistRes.totalSesiones || 0);
      totalFaltasGlobales += (asistRes.faltas || 0);
      totalJustificadasGlobales += (asistRes.justificadas || 0);
    }

    const notaFinal = r.promedio !== null ? r.promedio : (r.estado === "sin-notas" ? null : r.acumulado);
    const aprobado = notaFinal !== null && notaFinal >= 10.5;
    if (aprobado) totalCreditosAprobados += cr;

    if (notaFinal !== null) {
      sumaPonderada += (notaFinal * cr);
      sumaCreditosConNota += cr;
      sumaSimple += notaFinal;
      cursosConNotaCount++;
    }

    return {
      id: c.id,
      nombre: c.nombre,
      ciclo_curso: c.ciclo_curso || "-",
      tipo_condicion: c.tipo_condicion || "obligatorio",
      codigo: c.codigo_asignatura || "-",
      creditos: cr,
      rendimiento: r,
      notaFinal,
      aprobado,
      asistencia: asistRes
    };
  });

  const pps = sumaCreditosConNota > 0 ? (sumaPonderada / sumaCreditosConNota) : null;
  const promedioSimple = cursosConNotaCount > 0 ? (sumaSimple / cursosConNotaCount) : null;
  const horasTotales17Semanas = Math.round(totalHorasLectivasSemana * 17);

  const totalAsistidas = Math.max(0, totalSesionesGlobales - totalFaltasGlobales);
  const pctAsistenciaGlobal = totalSesionesGlobales > 0 ? Math.round((totalAsistidas / totalSesionesGlobales) * 100) : 100;

  // Diagnóstico Institucional UNU
  let diagnostico = "";
  let diagTipo = "st-ok";
  if (cursos.length === 0) {
    diagnostico = "Aún no tienes asignaturas registradas para este ciclo académico.";
    diagTipo = "st-neutral";
  } else if (totalCreditosAprobados === totalCreditosMatriculados && totalCreditosMatriculados > 0) {
    diagnostico = "¡Ciclo Invictor! Has culminado satisfactoriamente el 100% de tus créditos matriculados sin observaciones reglamentarias.";
    diagTipo = "st-ok";
  } else if (totalCreditosAprobados >= totalCreditosMatriculados * 0.7) {
    diagnostico = "Rendimiento regular. Se sugiere reforzar asignaturas pendientes en el siguiente periodo para mantener el avance curricular.";
    diagTipo = "st-warn";
  } else {
    diagnostico = "Rendimiento observado. Revisa tu plan curricular y considera asesoría académica para recuperar créditos el próximo semestre.";
    diagTipo = "st-bad";
  }

  estadoUltimoReporte = {
    cicloNombre: cicloActivo?.nombre || "Ciclo Académico",
    fechaIni,
    fechaFin,
    perfil,
    pps,
    promedioSimple,
    totalCreditosMatriculados,
    totalCreditosAprobados,
    horasTotales17Semanas,
    pctAsistenciaGlobal,
    totalSesionesGlobales,
    totalFaltasGlobales,
    totalJustificadasGlobales,
    diagnostico,
    cursos: cursosReporte
  };

  const bodyEl = $("#reporte-ciclo-body");
  if (!bodyEl) return;

  const nombreEstudiante = perfil.nombre || "Estudiante";
  const codigoEst = perfil.codigo ? `Cód. ${escapeHtml(perfil.codigo)}` : "Sin código registrado";
  const carrera = perfil.escuela || "Escuela Profesional";
  const fac = perfil.facultad ? ` · ${escapeHtml(perfil.facultad)}` : "";

  bodyEl.innerHTML = `
    <div class="report-header-banner">
      <div class="report-inst-title">Universidad Nacional de Ucayali · UNUmbral Local</div>
      <div class="report-student-name">${escapeHtml(nombreEstudiante)}</div>
      <div class="report-student-meta">
        <strong>${codigoEst}</strong> · ${escapeHtml(carrera)}${fac}
      </div>
      <div class="report-student-meta" style="margin-top:4px; font-weight:600; color:var(--deep-leaf);">
        Semestre Académico: ${escapeHtml(cicloActivo?.nombre || "Ciclo Actual")} (${fechaIni} al ${fechaFin} · 17 Semanas)
      </div>
    </div>

    <div class="report-stats-grid">
      <div class="report-stat-card">
        <div class="report-stat-val">${pps !== null ? formatNota(pps) : "—"}</div>
        <div class="report-stat-lbl">Promedio Ponderado (PPS)</div>
      </div>
      <div class="report-stat-card">
        <div class="report-stat-val">${promedioSimple !== null ? formatNota(promedioSimple) : "—"}</div>
        <div class="report-stat-lbl">Promedio Simple</div>
      </div>
      <div class="report-stat-card">
        <div class="report-stat-val">${totalCreditosAprobados} / ${totalCreditosMatriculados}</div>
        <div class="report-stat-lbl">Créditos Aprobados</div>
      </div>
      <div class="report-stat-card">
        <div class="report-stat-val">${pctAsistenciaGlobal}%</div>
        <div class="report-stat-lbl">Asistencia (${totalFaltasGlobales} faltas)</div>
      </div>
      <div class="report-stat-card">
        <div class="report-stat-val">${horasTotales17Semanas} h</div>
        <div class="report-stat-lbl">Horas de Clase (17 Sem)</div>
      </div>
    </div>

    <div class="report-table-wrap">
      <table class="report-table">
        <thead>
          <tr>
            <th>Asignatura</th>
            <th style="text-align:center;">Ciclo</th>
            <th style="text-align:center;">Tipo</th>
            <th style="text-align:center;">Créditos</th>
            <th style="text-align:center;">Faltas</th>
            <th style="text-align:center;">Nota Final</th>
            <th style="text-align:center;">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${cursosReporte.map(c => `
            <tr>
              <td>
                <div style="font-weight:700;">${escapeHtml(c.nombre)}</div>
                ${c.codigo !== "-" ? `<div style="font-size:10px;color:var(--text-secondary);">${escapeHtml(c.codigo)}</div>` : ""}
              </td>
              <td style="text-align:center;">${escapeHtml(c.ciclo_curso)}</td>
              <td style="text-align:center;text-transform:capitalize;">${escapeHtml(c.tipo_condicion)}</td>
              <td style="text-align:center;font-weight:600;">${c.creditos}</td>
              <td style="text-align:center;">${c.asistencia ? c.asistencia.faltas : 0}</td>
              <td style="text-align:center;font-family:var(--font-mono);font-weight:700;">${c.notaFinal !== null ? formatNota(c.notaFinal) : "—"}</td>
              <td style="text-align:center;">
                <span class="grade-status-pill ${c.aprobado ? 'st-ok' : (c.notaFinal === null ? 'st-neutral' : 'st-bad')}" style="font-size:10px;padding:2px 7px;">
                  ${c.aprobado ? "Aprobado" : (c.notaFinal === null ? "En curso" : "Desaprobado")}
                </span>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="report-feedback-box">
      <div class="report-feedback-title">Diagnóstico y Recomendaciones Académicas:</div>
      <div>${escapeHtml(diagnostico)}</div>
    </div>
  `;

  $("#modal-reporte-ciclo-backdrop").classList.remove("hidden");
}

function closeReporteFinCicloModal() {
  $("#modal-reporte-ciclo-backdrop").classList.add("hidden");
}

function descargarReporteComoImagen(reporte) {
  if (!reporte) return;
  const canvas = document.createElement("canvas");
  const W = 1200;
  const H = 1550;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Fondo limpio marfil/blanco
  ctx.fillStyle = "#FDFBF7";
  ctx.fillRect(0, 0, W, H);

  // Marco exterior
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Cabecera superior verde institucional
  ctx.fillStyle = "#22432C";
  ctx.fillRect(20, 20, W - 40, 160);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 26px system-ui, -apple-system, sans-serif";
  ctx.fillText("UNIVERSIDAD NACIONAL DE UCAYALI", 60, 75);

  ctx.font = "18px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#A3E635";
  ctx.fillText("UNUmbral · Récord Académico y Balance de Fin de Ciclo (17 Semanas)", 60, 110);

  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#E2E8F0";
  ctx.fillText(`Semestre: ${reporte.cicloNombre} (${reporte.fechaIni} al ${reporte.fechaFin})`, 60, 142);

  // Caja del Estudiante
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(60, 210, W - 120, 130, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(reporte.perfil?.nombre || "Estudiante UNU", 85, 255);

  ctx.font = "16px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#475569";
  const codTxt = reporte.perfil?.codigo ? `Cód: ${reporte.perfil.codigo}` : "Sin código";
  ctx.fillText(`${codTxt}   |   ${reporte.perfil?.escuela || "Escuela Profesional"}`, 85, 290);
  ctx.fillText(reporte.perfil?.facultad || "Facultad Universitaria", 85, 318);

  // Bloques de Estadísticas Principales
  const stats = [
    { val: reporte.pps !== null ? Number(reporte.pps).toFixed(2) : "—", lbl: "Promedio Ponderado" },
    { val: reporte.promedioSimple !== null ? Number(reporte.promedioSimple).toFixed(2) : "—", lbl: "Promedio Simple" },
    { val: `${reporte.totalCreditosAprobados}/${reporte.totalCreditosMatriculados}`, lbl: "Créditos Aprobados" },
    { val: `${reporte.pctAsistenciaGlobal}%`, lbl: "Asistencia Global" },
    { val: `${reporte.horasTotales17Semanas} h`, lbl: "Horas Lectivas (17 Sem)" }
  ];

  const statW = (W - 120 - 40) / 5;
  stats.forEach((st, idx) => {
    const sx = 60 + idx * (statW + 10);
    ctx.fillStyle = "#F8FAFC";
    ctx.strokeStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.roundRect(sx, 365, statW, 95, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#22432C";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.fillText(st.val, sx + statW / 2, 412);

    ctx.fillStyle = "#64748B";
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.fillText(st.lbl, sx + statW / 2, 440);
  });
  ctx.textAlign = "left";

  // Tabla de Cursos
  let currentY = 500;
  ctx.fillStyle = "#22432C";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.fillText("DETALLE DE ASIGNATURAS Y RENDIMIENTO:", 60, currentY);
  currentY += 20;

  // Header tabla
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(60, currentY, W - 120, 36);
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.fillText("ASIGNATURA", 75, currentY + 23);
  ctx.fillText("CICLO", 520, currentY + 23);
  ctx.fillText("CONDICIÓN", 620, currentY + 23);
  ctx.fillText("CRÉDITOS", 750, currentY + 23);
  ctx.fillText("FALTAS", 870, currentY + 23);
  ctx.fillText("NOTA FINAL", 960, currentY + 23);
  ctx.fillText("ESTADO", 1060, currentY + 23);

  currentY += 36;
  ctx.font = "14px system-ui, -apple-system, sans-serif";

  reporte.cursos.forEach((c, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    ctx.fillRect(60, currentY, W - 120, 38);
    ctx.strokeStyle = "#E2E8F0";
    ctx.strokeRect(60, currentY, W - 120, 38);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
    ctx.fillText(c.nombre.slice(0, 38), 75, currentY + 24);

    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(c.ciclo_curso || "-", 525, currentY + 24);
    ctx.fillText(c.tipo_condicion || "Obligatorio", 625, currentY + 24);
    ctx.fillText(String(c.creditos), 770, currentY + 24);
    ctx.fillText(String(c.asistencia ? c.asistencia.faltas : 0), 885, currentY + 24);

    ctx.font = "bold 15px monospace";
    ctx.fillStyle = c.aprobado ? "#15803D" : (c.notaFinal !== null ? "#DC2626" : "#64748B");
    ctx.fillText(c.notaFinal !== null ? Number(c.notaFinal).toFixed(1) : "—", 980, currentY + 24);

    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(c.aprobado ? "APROBADO" : (c.notaFinal !== null ? "DESAPROBADO" : "EN CURSO"), 1060, currentY + 24);

    currentY += 38;
  });

  // Caja de Diagnóstico / Feedback
  currentY += 24;
  ctx.fillStyle = "#EFF6FF";
  ctx.strokeStyle = "#93C5FD";
  ctx.beginPath();
  ctx.roundRect(60, currentY, W - 120, 110, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1E40AF";
  ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
  ctx.fillText("DIAGNÓSTICO ACADÉMICO Y BALANCE INSTITUCIONAL:", 85, currentY + 36);

  ctx.fillStyle = "#1E293B";
  ctx.font = "15px system-ui, -apple-system, sans-serif";
  ctx.fillText(reporte.diagnostico, 85, currentY + 70);

  // Pie de Página
  const fechaHoy = new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
  ctx.fillStyle = "#64748B";
  ctx.font = "13px system-ui, -apple-system, sans-serif";
  ctx.fillText(`Generado localmente por UNUmbral · 100% Offline · Fecha de emisión: ${fechaHoy}`, 60, H - 40);

  // Descarga como archivo de imagen
  const link = document.createElement("a");
  link.download = `UNUmbral-Reporte-${(reporte.cicloNombre || "Ciclo").replace(/\s+/g, "_")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

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

    const btnGestionarCicloCursos = $("#btn-gestionar-ciclo-cursos");
  if (btnGestionarCicloCursos) {
    btnGestionarCicloCursos.addEventListener("click", async () => {
      const cicloActivo = await obtenerCicloActivo();
      if (cicloActivo) {
        openEditCicloModal(cicloActivo);
      } else {
        openNewCicloModal({ onSaved: () => renderCursos() });
      }
    });
  }
  $("#btn-add-curso").addEventListener("click", () => openNewCursoModal());
  $("#btn-add-task").addEventListener("click", () => openNewTaskModal());
  $("#btn-add-class").addEventListener("click", () => openNewClassModal());
  $("#btn-ver-todas-tareas").addEventListener("click", () => switchTab("view-tareas"));

  $("#btn-mode-agenda").addEventListener("click", () => { state.scheduleMode = "agenda"; renderHorario(); });
  $("#btn-mode-matrix").addEventListener("click", () => { state.scheduleMode = "matrix"; renderHorario(); });
  const btnModeCycle = $("#btn-mode-cycle");
  if (btnModeCycle) {
    btnModeCycle.addEventListener("click", () => { state.scheduleMode = "cycle"; renderHorario(); });
  }

  // Eventos del modal de Ciclo Académico

  // Perfil del Estudiante
  const formPerfil = $("#form-perfil-estudiante");
  if (formPerfil) formPerfil.addEventListener("submit", guardarPerfilEstudiante);

  // Modal Política de Privacidad
  const btnVerPriv = $("#btn-ver-privacidad");
  if (btnVerPriv) btnVerPriv.addEventListener("click", () => $("#modal-privacidad-backdrop").classList.remove("hidden"));
  const btnCerrarPriv = $("#modal-privacidad-close");
  if (btnCerrarPriv) btnCerrarPriv.addEventListener("click", () => $("#modal-privacidad-backdrop").classList.add("hidden"));
  const btnEntendidoPriv = $("#btn-privacidad-entendido");
  if (btnEntendidoPriv) btnEntendidoPriv.addEventListener("click", () => $("#modal-privacidad-backdrop").classList.add("hidden"));

  // Modal Reporte Fin de Ciclo
  const btnReporteCiclo = $("#btn-reporte-ciclo");
  if (btnReporteCiclo) btnReporteCiclo.addEventListener("click", openReporteFinCicloModal);
  const btnCerrarRep = $("#btn-cerrar-reporte-ciclo");
  if (btnCerrarRep) btnCerrarRep.addEventListener("click", closeReporteFinCicloModal);
  const btnCloseRepX = $("#modal-reporte-close");
  if (btnCloseRepX) btnCloseRepX.addEventListener("click", closeReporteFinCicloModal);
  const btnDescargarImg = $("#btn-descargar-reporte-img");
  if (btnDescargarImg) btnDescargarImg.addEventListener("click", () => descargarReporteComoImagen(estadoUltimoReporte));

  const modRepBackdrop = $("#modal-reporte-ciclo-backdrop");
  if (modRepBackdrop) {
    modRepBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-reporte-ciclo-backdrop") closeReporteFinCicloModal();
    });
  }
  const modPrivBackdrop = $("#modal-privacidad-backdrop");
  if (modPrivBackdrop) {
    modPrivBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-privacidad-backdrop") $("#modal-privacidad-backdrop").classList.add("hidden");
    });
  }

  $("#modal-ciclo-close").addEventListener("click", closeModalCiclo);
  $("#btn-cancel-ciclo").addEventListener("click", closeModalCiclo);
  $("#modal-ciclo-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-ciclo-backdrop") closeModalCiclo();
  });
  $("#form-ciclo").addEventListener("submit", guardarCiclo);
  $("#ciclo-fecha-inicio").addEventListener("input", actualizarPreviewCiclo);

  // Inicializar selector 12h y paleta de actividades
  init12HourSelectors();
  const actPicker = $("#class-actividad-color-picker");
  if (actPicker) {
    $$(".color-swatch", actPicker).forEach(s => {
      s.addEventListener("click", () => setActividadColor(s.dataset.color));
    });
  }
  $("#btn-class-type-curso").addEventListener("click", () => setClassTypeMode("curso"));
  $("#btn-class-type-actividad").addEventListener("click", () => setClassTypeMode("actividad"));

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

  const btnTasksList = $("#btn-tasks-mode-list");
  if (btnTasksList) {
    btnTasksList.addEventListener("click", () => {
      state.tasksViewMode = "list";
      renderTareas();
    });
  }

  const btnTasksCal = $("#btn-tasks-mode-cal");
  if (btnTasksCal) {
    btnTasksCal.addEventListener("click", () => {
      state.tasksViewMode = "calendar";
      renderTareas();
    });
  }

  const btnCalPrev = $("#btn-cal-prev");
  if (btnCalPrev) {
    btnCalPrev.addEventListener("click", () => {
      state.calendarMonth--;
      if (state.calendarMonth < 1) {
        state.calendarMonth = 12;
        state.calendarYear--;
      }
      renderCalendarioMensual();
    });
  }

  const btnCalNext = $("#btn-cal-next");
  if (btnCalNext) {
    btnCalNext.addEventListener("click", () => {
      state.calendarMonth++;
      if (state.calendarMonth > 12) {
        state.calendarMonth = 1;
        state.calendarYear++;
      }
      renderCalendarioMensual();
    });
  }

  const btnCalToday = $("#btn-cal-today");
  if (btnCalToday) {
    btnCalToday.addEventListener("click", () => {
      const now = new Date();
      state.calendarYear = now.getFullYear();
      state.calendarMonth = now.getMonth() + 1;
      state.selectedCalDate = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(now);
      renderCalendarioMensual();
    });
  }

  const btnCalAddEv = $("#btn-cal-add-event");
  if (btnCalAddEv) {
    btnCalAddEv.addEventListener("click", () => {
      openModalEvento(null, null);
      if (state.selectedCalDate) $("#evento-fecha").value = state.selectedCalDate;
    });
  }

  const btnCalAddTask = $("#btn-cal-add-task");
  if (btnCalAddTask) {
    btnCalAddTask.addEventListener("click", () => {
      openNewTaskModal();
      if (state.selectedCalDate) $("#task-fecha").value = state.selectedCalDate + "T23:59";
    });
  }

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
  // Actualización en tiempo real de badges en formato 12 horas
  [
    ["#ajuste-resumen-hora", "#badge-resumen-hora"],
    ["#ajuste-silencio-desde", "#badge-silencio-desde"],
    ["#ajuste-silencio-hasta", "#badge-silencio-hasta"],
    ["#ajuste-huecos-desde", "#badge-huecos-desde"],
    ["#ajuste-huecos-hasta", "#badge-huecos-hasta"]
  ].forEach(([inpId, badgeId]) => {
    const el = $(inpId);
    if (el) {
      el.addEventListener("input", () => {
        const b = $(badgeId);
        if (b && el.value) b.textContent = formatTime12(el.value);
      });
    }
  });

  $("#btn-load-demo").addEventListener("click", loadDemoSemester);
  $("#btn-clear-data").addEventListener("click", clearAllData);



  const btnSaveAjustes = $("#btn-save-ajustes");
  if (btnSaveAjustes) {
    btnSaveAjustes.addEventListener("click", guardarAjustesUI);
  }

  // Eventos de Asistencia y Feriados (Fase 3)
  const btnMarcarFeriado = $("#btn-marcar-feriado-hoy");
  if (btnMarcarFeriado) {
    btnMarcarFeriado.addEventListener("click", () => {
      openModalExcepcion({
        fecha: (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date()),
        tipo: "feriado"
      });
    });
  }

  const btnDesmarcarFeriado = $("#btn-desmarcar-feriado-hoy");
  if (btnDesmarcarFeriado) {
    btnDesmarcarFeriado.addEventListener("click", async () => {
      const hoyStr = (typeof fechaAString === "function" ? fechaAString : window.fechaAString)(new Date());
      const fer = await db.excepciones.where("fecha").equals(hoyStr).filter(e => e.tipo === "feriado").first();
      if (fer) {
        await db.excepciones.delete(fer.id);
        showToast("Feriado retirado de hoy.");
        if (typeof reprogramarTodo === "function") reprogramarTodo();
        renderHoy();
      }
    });
  }

  // Modal Asistencia
  const btnCloseAsist = $("#btn-close-asistencia-modal");
  if (btnCloseAsist) btnCloseAsist.addEventListener("click", closeAsistenciaModal);
  const modalAsistBackdrop = $("#modal-asistencia-backdrop");
  if (modalAsistBackdrop) {
    modalAsistBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-asistencia-backdrop") closeAsistenciaModal();
    });
  }

  // Modal Excepciones
  const btnAbrirNuevaEx = $("#btn-abrir-nueva-excepcion");
  if (btnAbrirNuevaEx) {
    btnAbrirNuevaEx.addEventListener("click", () => openModalExcepcion());
  }
  const btnCloseEx = $("#btn-close-excepcion-modal");
  if (btnCloseEx) btnCloseEx.addEventListener("click", closeModalExcepcion);
  const btnCancelEx = $("#btn-cancel-excepcion");
  if (btnCancelEx) btnCancelEx.addEventListener("click", closeModalExcepcion);
  const btnGuardarEx = $("#btn-guardar-excepcion");
  if (btnGuardarEx) btnGuardarEx.addEventListener("click", guardarExcepcion);
  const modalExBackdrop = $("#modal-excepcion-backdrop");
  if (modalExBackdrop) {
    modalExBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-excepcion-backdrop") closeModalExcepcion();
    });
  }

  // Modal Eventos
  const btnCloseEv = $("#btn-close-evento-modal");
  if (btnCloseEv) btnCloseEv.addEventListener("click", closeModalEvento);
  const btnCancelEv = $("#btn-cancel-evento");
  if (btnCancelEv) btnCancelEv.addEventListener("click", closeModalEvento);
  const btnGuardarEv = $("#btn-guardar-evento");
  if (btnGuardarEv) btnGuardarEv.addEventListener("click", guardarEvento);
  const btnEliminarEv = $("#btn-eliminar-evento");
  if (btnEliminarEv) btnEliminarEv.addEventListener("click", eliminarEvento);
  const modalEvBackdrop = $("#modal-evento-backdrop");
  if (modalEvBackdrop) {
    modalEvBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-evento-backdrop") closeModalEvento();
    });
  }

  // Rendimiento y Simulador (Fase 5)
  const btnToggleGraf = $("#btn-toggle-graficos");
  if (btnToggleGraf) {
    btnToggleGraf.addEventListener("click", toggleGraficosRendimiento);
  }
  const btnAbrirSim = $("#btn-abrir-simulador");
  if (btnAbrirSim) {
    btnAbrirSim.addEventListener("click", openSimuladorModal);
  }
  const btnCloseSim = $("#btn-close-simulador-modal");
  if (btnCloseSim) {
    btnCloseSim.addEventListener("click", closeSimuladorModal);
  }
  const modalSimBackdrop = $("#modal-simulador-backdrop");
  if (modalSimBackdrop) {
    modalSimBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-simulador-backdrop") closeSimuladorModal();
    });
  }
  const inputSimMeta = $("#simulador-meta-input");
  if (inputSimMeta) {
    inputSimMeta.addEventListener("input", () => actualizarSimulador());
  }

  // Compartir e Importar por QR (Fase 7)
  const btnCompartirQr = $("#btn-compartir-qr");
  if (btnCompartirQr) btnCompartirQr.addEventListener("click", openModalQrSchedule);
  const btnCloseQrModal = $("#btn-close-qr-modal");
  if (btnCloseQrModal) btnCloseQrModal.addEventListener("click", closeModalQrSchedule);
  const modalQrBackdrop = $("#modal-qr-schedule-backdrop");
  if (modalQrBackdrop) {
    modalQrBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-qr-schedule-backdrop") closeModalQrSchedule();
    });
  }
  const btnPrevQr = $("#btn-prev-qr-part");
  if (btnPrevQr) btnPrevQr.addEventListener("click", mostrarAnteriorParteQr);
  const btnNextQr = $("#btn-next-qr-part");
  if (btnNextQr) btnNextQr.addEventListener("click", mostrarSiguienteParteQr);
  const btnDescargarQr = $("#btn-descargar-qr-png");
  if (btnDescargarQr) btnDescargarQr.addEventListener("click", descargarQrPng);

  const btnEscanearQr = $("#btn-escanear-qr");
  if (btnEscanearQr) btnEscanearQr.addEventListener("click", openModalQrScanner);
  const btnCloseScanner = $("#btn-close-qr-scanner");
  if (btnCloseScanner) btnCloseScanner.addEventListener("click", closeModalQrScanner);
  const modalScannerBackdrop = $("#modal-qr-scanner-backdrop");
  if (modalScannerBackdrop) {
    modalScannerBackdrop.addEventListener("click", (e) => {
      if (e.target.id === "modal-qr-scanner-backdrop") closeModalQrScanner();
    });
  }
  const inputQrFile = $("#input-qr-image-file");
  if (inputQrFile) {
    inputQrFile.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        procesarArchivoImagenQr(e.target.files[0]);
        e.target.value = "";
      }
    });
  }
  const btnProcManual = $("#btn-procesar-qr-manual");
  if (btnProcManual) {
    btnProcManual.addEventListener("click", () => {
      const txt = $("#textarea-qr-manual");
      if (txt && txt.value) procesarTextoQrEscaneado(txt.value);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeClassModal();
      closeCursoModal();
      closeNotasModal();
      closeTaskModal();
      closeAsistenciaModal();
      closeModalExcepcion();
      closeModalEvento();
      closeSimuladorModal();
      closeModalQrSchedule();
      closeModalQrScanner();
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

function inicializarDeepLinks() {
  const manejarUrl = (url) => {
    if (!url) return;
    const ruta = typeof parsearRutaDeepLink === "function" ? parsearRutaDeepLink(url) : null;
    if (!ruta || ruta.accion === "ninguna") return;
    ejecutarAccionDeepLink(ruta, {
      "nueva-tarea": () => {
        openNewTaskModal();
      },
      "hoy": () => {
        switchTab("view-hoy");
      },
      "horario": () => {
        switchTab("view-horario");
      },
      "cursos": () => {
        switchTab("view-cursos");
      },
      "tareas": () => {
        switchTab("view-tareas");
      },
      "ajustes": () => {
        switchTab("view-ajustes");
      }
    });
  };

  // Capacitor App URL Open listener (Shortcuts nativos y deep links unumbral://)
  if (window.Capacitor?.Plugins?.App) {
    try {
      window.Capacitor.Plugins.App.addListener("appUrlOpen", (data) => {
        manejarUrl(data?.url);
      });
    } catch (err) {
      console.warn("No se pudo registrar listener de appUrlOpen:", err);
    }
  }

  // Hash web
  window.addEventListener("hashchange", () => {
    manejarUrl(window.location.hash);
  });

  if (window.location.hash) {
    setTimeout(() => manejarUrl(window.location.hash), 150);
  }
}

/* =====================================================================
   14. INICIALIZACIÓN
   ===================================================================== */
async function init() {
  applyTheme(state.theme);

  const dateEl = $("#current-date-label");
  if (dateEl) dateEl.textContent = formatReadableDate();

  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  if ("serviceWorker" in navigator && (typeof esNativo !== "function" || !esNativo())) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  try {
    await Promise.race([
      db.open(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout IndexedDB")), 3000))
    ]);
    await checkAndMigrateLegacyDB();
    await limpiarCursosResidualesNumericos();
    await deduplicarClasesEnBd();
  } catch (err) {
    console.warn("Aviso abriendo IndexedDB:", err);
  }

  try {
    wireGlobalEvents();
    await cargarPerfilEstudiante();
  } catch (err) {
    console.error("Error en wireGlobalEvents:", err);
  }
  switchTab("view-hoy");
  inicializarDeepLinks();

  if (typeof inicializarSistemaNotificaciones === "function") {
    inicializarSistemaNotificaciones().catch(err => console.warn("Error inicializando notificaciones:", err));
  }

  setInterval(() => {
    if (state.currentTab === "view-hoy") renderHoy();
  }, 60000);
}

if (typeof window !== "undefined" && typeof document !== "undefined" && typeof document.getElementById === "function") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
