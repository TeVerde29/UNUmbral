/* =====================================================================
   DESIGN RICRA + APPLE HUMAN INTERFACE DESIGN (TEA GREEN)
   UniFlow — Horario Universitario & Tareas Offline
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
  chevronRight: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>`
};

/* =====================================================================
   2. BASE DE DATOS LOCAL (IndexedDB via Dexie)
   ===================================================================== */
const db = new Dexie("UniFlowDB");
db.version(1).stores({
  clases: "id, materia, dia_semana, hora_inicio, hora_fin, aula, profesor",
  tareas: "id, titulo, materia, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
});

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
  theme: localStorage.getItem("uniflow-theme") || "dark"
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

function timeToMinutes(hhmm) {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
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

  const timeStr = `${pad2(target.getHours())}:${pad2(target.getMinutes())}`;

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

function confirmDialog(title, message) {
  return new Promise((resolve) => {
    const backdrop = $("#modal-confirm-backdrop");
    $("#confirm-title").textContent = title || "¿Confirmar acción?";
    $("#confirm-message").textContent = message;
    backdrop.classList.remove("hidden");

    const onOk = () => { cleanup(); resolve(true); };
    const onCancel = () => { cleanup(); resolve(false); };

    function cleanup() {
      backdrop.classList.add("hidden");
      $("#btn-confirm-ok").removeEventListener("click", onOk);
      $("#btn-confirm-cancel").removeEventListener("click", onCancel);
    }

    $("#btn-confirm-ok").addEventListener("click", onOk);
    $("#btn-confirm-cancel").addEventListener("click", onCancel);
  });
}

/* =====================================================================
   5. GESTIÓN DEL TEMA (DESIGN RICRA LIGHT / DARK)
   ===================================================================== */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
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
  const classesToday = await db.clases.where("dia_semana").equals(todayKey).toArray();
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
  const allTasks = await db.tareas.toArray();
  const pendingTasks = allTasks.filter(t => !t.completada);

  const navCountEl = $("#nav-count-tareas");
  if (pendingTasks.length > 0) {
    navCountEl.textContent = pendingTasks.length;
    navCountEl.classList.remove("hidden");
  } else {
    navCountEl.classList.add("hidden");
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
        <span style="color:var(--status-success)">En Curso · ${currentClass.hora_inicio} a ${currentClass.hora_fin}</span>
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
        <span class="live-meta-item">${ICONS.clock} ${nextClass.hora_inicio} – ${nextClass.hora_fin} (en ${countdown})</span>
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
  const color = c.color || "#AFC49A";
  return `
    <div class="class-card" data-id="${c.id}">
      <div class="class-card-stripe" style="background:${color}"></div>
      <div class="class-card-main">
        <div class="class-card-title">${escapeHtml(c.materia)}</div>
        <div class="class-card-details">
          <span class="class-time-tag">${ICONS.clock} ${c.hora_inicio} – ${c.hora_fin}</span>
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

  $("#btn-mode-agenda").classList.toggle("active", state.scheduleMode === "agenda");
  $("#btn-mode-matrix").classList.toggle("active", state.scheduleMode === "matrix");

  const allClasses = await db.clases.toArray();

  if (state.scheduleMode === "agenda") {
    dayTabsEl.classList.remove("hidden");

    $$(".day-tab", dayTabsEl).forEach(btn => {
      btn.classList.toggle("active", btn.dataset.day === state.selectedDay);
    });

    const dayClasses = allClasses.filter(c => c.dia_semana === state.selectedDay);
    dayClasses.sort((a, b) => timeToMinutes(a.hora_inicio) - timeToMinutes(b.hora_inicio));

    if (dayClasses.length === 0) {
      container.innerHTML = `
        <div class="empty-card" style="margin-top:14px;">
          <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
          <strong>Sin materias para el ${DIAS_LABEL[state.selectedDay].toLowerCase()}</strong>
          <p>Pulsa el botón de abajo para registrar tu primera clase en este día.</p>
          <button class="btn-primary btn-sm" id="btn-add-class-empty" style="margin-top:10px;">Añadir Materia</button>
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
    // MODO MATRIZ SEMANAL
    dayTabsEl.classList.add("hidden");

    if (allClasses.length === 0) {
      container.innerHTML = `
        <div class="empty-card">
          <div class="empty-card-icon-wrap">${ICONS.calendar}</div>
          <strong>Horario no configurado</strong>
          <p>Registra tus clases para visualizar la distribución semanal.</p>
          <button class="btn-primary btn-sm" id="btn-add-class-empty-mat" style="margin-top:10px;">Añadir Materia</button>
        </div>`;
      const btn = $("#btn-add-class-empty-mat", container);
      if (btn) btn.addEventListener("click", () => openNewClassModal("LUNES"));
      return;
    }

    container.innerHTML = renderMatrixTableHTML(allClasses);
    $$(".matrix-cell-block", container).forEach(b => {
      b.addEventListener("click", () => openEditClassModal(b.dataset.id));
    });
  }
}

function renderMatrixTableHTML(classes) {
  let minHour = 7;
  let maxHour = 21;

  classes.forEach(c => {
    const h1 = Math.floor(timeToMinutes(c.hora_inicio) / 60);
    const h2 = Math.ceil(timeToMinutes(c.hora_fin) / 60);
    if (h1 < minHour) minHour = Math.max(0, h1);
    if (h2 > maxHour) maxHour = Math.min(24, h2);
  });

  const hours = [];
  for (let h = minHour; h < maxHour; h++) hours.push(h);

  const byDayAndHour = {};
  DIAS.forEach(d => { byDayAndHour[d] = {}; });

  classes.forEach(c => {
    const startHour = Math.floor(timeToMinutes(c.hora_inicio) / 60);
    byDayAndHour[c.dia_semana][startHour] = c;
  });

  let ths = DIAS.map(d => `<th>${DIAS_CORTO[d]}</th>`).join("");
  let rowsHtml = "";

  hours.forEach(h => {
    let cells = "";
    DIAS.forEach(d => {
      const c = byDayAndHour[d][h];
      if (c) {
        const color = c.color || "#AFC49A";
        cells += `<td>
          <div class="matrix-cell-block" data-id="${c.id}" style="background:${color}22;color:${color};border-left:3px solid ${color};" title="${escapeHtml(c.materia)} (${c.hora_inicio}-${c.hora_fin})">
            ${escapeHtml(c.materia)}
          </div>
        </td>`;
      } else {
        cells += `<td></td>`;
      }
    });

    rowsHtml += `
      <tr>
        <td class="matrix-hour-col">${pad2(h)}:00</td>
        ${cells}
      </tr>`;
  });

  return `
    <div class="matrix-scroll-wrapper">
      <table class="matrix-grid-table">
        <thead>
          <tr>
            <th class="matrix-hour-col">Hora</th>
            ${ths}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
    <p class="form-hint" style="margin-top:10px;text-align:center">Toca cualquier bloque para ver y editar los detalles de la asignatura.</p>`;
}

/* =====================================================================
   9. VISTA: TAREAS (FILTROS Y ESCALA 1 A 5)
   ===================================================================== */
async function renderTareas() {
  const allTasks = await db.tareas.toArray();
  const allClasses = await db.clases.toArray();

  const selectMateria = $("#select-filter-materia");
  const uniqueSubjects = Array.from(new Set(allClasses.map(c => c.materia))).filter(Boolean).sort();
  allTasks.forEach(t => {
    if (t.materia && !uniqueSubjects.includes(t.materia)) uniqueSubjects.push(t.materia);
  });

  selectMateria.innerHTML = `<option value="">Todas las materias (${allTasks.length})</option>` +
    uniqueSubjects.map(s => `<option value="${escapeHtml(s)}" ${state.tasksMateriaFilter === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("");

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
    list = list.filter(t => t.materia === state.tasksMateriaFilter);
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
   10. MODAL: AGREGAR / EDITAR CLASE (HORARIO)
   ===================================================================== */
async function populateSubjectDatalist() {
  const classes = await db.clases.toArray();
  const subjects = Array.from(new Set(classes.map(c => c.materia))).filter(Boolean);
  const datalist = $("#datalist-materias");
  datalist.innerHTML = subjects.map(s => `<option value="${escapeHtml(s)}">`).join("");
}

function openNewClassModal(preselectedDay) {
  $("#modal-class-title").textContent = "Añadir Materia al Horario";
  $("#class-id").value = "";
  $("#class-materia").value = "";
  $("#class-dia").value = preselectedDay || state.selectedDay || "LUNES";
  $("#class-hora-inicio").value = "08:00";
  $("#class-hora-fin").value = "10:00";
  $("#class-aula").value = "";
  $("#class-profesor").value = "";
  $("#class-color").value = "#AFC49A";
  $("#class-notas").value = "";
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.add("hidden");

  $$(".color-swatch", $("#class-color-picker")).forEach(s => {
    s.classList.toggle("selected", s.dataset.color === "#AFC49A");
  });

  populateSubjectDatalist();
  $("#modal-class-backdrop").classList.remove("hidden");
  $("#class-materia").focus();
}

async function openEditClassModal(id) {
  const c = await db.clases.get(id);
  if (!c) return;

  $("#modal-class-title").textContent = "Editar Materia";
  $("#class-id").value = c.id;
  $("#class-materia").value = c.materia || "";
  $("#class-dia").value = c.dia_semana || "LUNES";
  $("#class-hora-inicio").value = c.hora_inicio || "08:00";
  $("#class-hora-fin").value = c.hora_fin || "10:00";
  $("#class-aula").value = c.aula || "";
  $("#class-profesor").value = c.profesor || "";
  $("#class-color").value = c.color || "#AFC49A";
  $("#class-notas").value = c.notas || "";
  $("#class-form-error").classList.add("hidden");
  $("#btn-delete-class").classList.remove("hidden");

  $$(".color-swatch", $("#class-color-picker")).forEach(s => {
    s.classList.toggle("selected", s.dataset.color === (c.color || "#AFC49A"));
  });

  populateSubjectDatalist();
  $("#modal-class-backdrop").classList.remove("hidden");
}

function closeClassModal() {
  $("#modal-class-backdrop").classList.add("hidden");
}

/* =====================================================================
   11. MODAL: AGREGAR / EDITAR TAREA
   ===================================================================== */
async function populateTaskSubjectSelect(currentVal) {
  const classes = await db.clases.toArray();
  const subjects = Array.from(new Set(classes.map(c => c.materia))).filter(Boolean).sort();
  const sel = $("#task-materia");
  sel.innerHTML = `<option value="General">General / Otra</option>` +
    subjects.map(s => `<option value="${escapeHtml(s)}" ${s === currentVal ? "selected" : ""}>${escapeHtml(s)}</option>`).join("");
}

function openNewTaskModal(defaultMateria) {
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

  populateTaskSubjectSelect(defaultMateria || "");
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

  await populateTaskSubjectSelect(t.materia);
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

async function exportScheduleForFriends() {
  const classes = await db.clases.toArray();
  if (classes.length === 0) {
    showToast("No hay materias en el horario para compartir.", true);
    return;
  }

  const exportPayload = {
    tipo: "uniflow-horario-compartido",
    version: 1,
    fecha_creacion: new Date().toISOString(),
    clases: classes.map(c => ({
      materia: c.materia,
      dia_semana: c.dia_semana,
      hora_inicio: c.hora_inicio,
      hora_fin: c.hora_fin,
      aula: c.aula || "",
      profesor: c.profesor || "",
      color: c.color || "#AFC49A",
      notas: c.notas || ""
    }))
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Horario_Semestre_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Archivo de horario exportado.");
}

async function importScheduleFromFriends(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || !Array.isArray(data.clases)) {
      throw new Error("El archivo no tiene el formato de horario compatible.");
    }

    const confirm = await confirmDialog(
      "Importar Horario",
      `Se incorporarán ${data.clases.length} clases al horario. ¿Deseas continuar?`
    );
    if (!confirm) return;

    for (const c of data.clases) {
      await db.clases.put({
        id: uuid(),
        materia: c.materia,
        dia_semana: c.dia_semana,
        hora_inicio: c.hora_inicio,
        hora_fin: c.hora_fin,
        aula: c.aula || "",
        profesor: c.profesor || "",
        color: c.color || "#AFC49A",
        notas: c.notas || ""
      });
    }

    showToast(`Se importaron ${data.clases.length} clases.`);
    switchTab("view-horario");
  } catch (err) {
    console.error(err);
    showToast("Error al importar el archivo: " + err.message, true);
  }
}

async function exportFullBackup() {
  const [classes, tasks] = await Promise.all([
    db.clases.toArray(),
    db.tareas.toArray()
  ]);

  const payload = {
    tipo: "uniflow-backup-total",
    version: 1,
    fecha_creacion: new Date().toISOString(),
    clases: classes,
    tareas: tasks
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `UniFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia de seguridad generada.");
}

async function importFullBackup(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.clases && !data.tareas) {
      throw new Error("El archivo no corresponde a un respaldo válido de UniFlow.");
    }

    const ok = await confirmDialog(
      "Restaurar Copia",
      "Esto integrará las clases y tareas del respaldo a la base de datos actual. ¿Continuar?"
    );
    if (!ok) return;

    if (Array.isArray(data.clases)) {
      for (const c of data.clases) await db.clases.put(c);
    }
    if (Array.isArray(data.tareas)) {
      for (const t of data.tareas) await db.tareas.put(t);
    }

    showToast("Copia de seguridad restaurada.");
    switchTab("view-hoy");
  } catch (err) {
    console.error(err);
    showToast("Error al restaurar: " + err.message, true);
  }
}

async function loadDemoSemester() {
  const ok = await confirmDialog(
    "Cargar Semestre Modelo",
    "Se incorporarán materias y evaluaciones representativas para probar el sistema. ¿Continuar?"
  );
  if (!ok) return;

  const demoClasses = [
    { id: uuid(), materia: "Cálculo II", dia_semana: "LUNES", hora_inicio: "08:00", hora_fin: "10:00", aula: "Aula 204", profesor: "Dr. Mendoza", color: "#AFC49A" },
    { id: uuid(), materia: "Física Aplicada", dia_semana: "LUNES", hora_inicio: "10:30", hora_fin: "12:30", aula: "Lab Central", profesor: "Dra. Soto", color: "#4F7256" },
    { id: uuid(), materia: "Algoritmos y Estructuras", dia_semana: "MARTES", hora_inicio: "09:00", hora_fin: "12:00", aula: "Lab Sistemas 3", profesor: "Ing. Morales", color: "#294635" },
    { id: uuid(), materia: "Cálculo II", dia_semana: "MIERCOLES", hora_inicio: "08:00", hora_fin: "10:00", aula: "Aula 204", profesor: "Dr. Mendoza", color: "#AFC49A" },
    { id: uuid(), materia: "Base de Datos", dia_semana: "MIERCOLES", hora_inicio: "14:00", hora_fin: "17:00", aula: "Lab Sistemas 1", profesor: "Prof. Vidal", color: "#35687A" },
    { id: uuid(), materia: "Algoritmos y Estructuras", dia_semana: "JUEVES", hora_inicio: "10:00", hora_fin: "12:00", aula: "Lab Sistemas 3", profesor: "Ing. Morales", color: "#294635" },
    { id: uuid(), materia: "Física Aplicada", dia_semana: "VIERNES", hora_inicio: "08:30", hora_fin: "11:30", aula: "Aula 102", profesor: "Dra. Soto", color: "#4F7256" }
  ];

  const now = new Date();
  const d1 = new Date(now.getTime() + 18 * 3600000).toISOString().slice(0, 16);
  const d2 = new Date(now.getTime() + 48 * 3600000).toISOString().slice(0, 16);
  const d3 = new Date(now.getTime() + 96 * 3600000).toISOString().slice(0, 16);
  const d4 = new Date(now.getTime() + 140 * 3600000).toISOString().slice(0, 16);

  const demoTasks = [
    { id: uuid(), titulo: "Guía 3: Integrales triples y coordenadas polares", materia: "Cálculo II", fecha_limite: d1, importancia: 3, completada: false, notas: "Ejercicios del 1 al 15 del temario oficial." },
    { id: uuid(), titulo: "Primer Examen Parcial: Grafos y Árboles", materia: "Algoritmos y Estructuras", fecha_limite: d2, importancia: 5, completada: false, notas: "Evaluación presencial en laboratorio." },
    { id: uuid(), titulo: "Informe de Laboratorio: Movimiento Armónico", materia: "Física Aplicada", fecha_limite: d3, importancia: 4, completada: false, notas: "Formato institucional con análisis de incertidumbre." },
    { id: uuid(), titulo: "Diseño del Modelo Entidad-Relación", materia: "Base de Datos", fecha_limite: d4, importancia: 4, completada: false, notas: "Caso de estudio de plataforma de gestión." },
    { id: uuid(), titulo: "Descarga de diapositivas del curso", materia: "Cálculo II", fecha_limite: "", importancia: 1, completada: true, notas: "" }
  ];

  await db.clases.bulkPut(demoClasses);
  await db.tareas.bulkPut(demoTasks);

  showToast("Datos de demostración incorporados.");
  switchTab("view-hoy");
}

async function clearAllData() {
  const ok = await confirmDialog(
    "Vaciar Base de Datos",
    "¿Confirmas la eliminación total de materias y tareas registradas?"
  );
  if (!ok) return;

  await db.clases.clear();
  await db.tareas.clear();
  showToast("Base de datos reiniciada.");
  switchTab("view-hoy");
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
  $("#btn-quick-create-task").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
    openNewTaskModal();
  });
  $("#btn-quick-create-class").addEventListener("click", () => {
    $("#modal-quick-backdrop").classList.add("hidden");
    openNewClassModal();
  });

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

  $("#select-filter-materia").addEventListener("change", (e) => {
    state.tasksMateriaFilter = e.target.value;
    renderTareas();
  });

  $("#input-search-tasks").addEventListener("input", (e) => {
    state.tasksSearchQuery = e.target.value;
    renderTareas();
  });

  $$(".color-swatch", $("#class-color-picker")).forEach(s => {
    s.addEventListener("click", () => {
      $$(".color-swatch", $("#class-color-picker")).forEach(x => x.classList.remove("selected"));
      s.classList.add("selected");
      $("#class-color").value = s.dataset.color;
    });
  });

  $("#modal-class-close").addEventListener("click", closeClassModal);
  $("#btn-cancel-class").addEventListener("click", closeClassModal);
  $("#modal-class-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-class-backdrop") closeClassModal();
  });

  $("#form-class").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#class-id").value || uuid();
    const materia = $("#class-materia").value.trim();
    const dia_semana = $("#class-dia").value;
    const hora_inicio = $("#class-hora-inicio").value;
    const hora_fin = $("#class-hora-fin").value;
    const aula = $("#class-aula").value.trim();
    const profesor = $("#class-profesor").value.trim();
    const color = $("#class-color").value || "#AFC49A";
    const notas = $("#class-notas").value.trim();
    const errorEl = $("#class-form-error");

    errorEl.classList.add("hidden");

    if (timeToMinutes(hora_fin) <= timeToMinutes(hora_inicio)) {
      errorEl.textContent = "La hora de fin debe ser posterior a la hora de inicio.";
      errorEl.classList.remove("hidden");
      return;
    }

    const sameDayClasses = await db.clases.where("dia_semana").equals(dia_semana).toArray();
    const startM = timeToMinutes(hora_inicio);
    const endM = timeToMinutes(hora_fin);

    const conflict = sameDayClasses.find(c => c.id !== id &&
      overlaps(startM, endM, timeToMinutes(c.hora_inicio), timeToMinutes(c.hora_fin)));

    if (conflict) {
      errorEl.textContent = `Conflicto de horario con "${conflict.materia}" (${conflict.hora_inicio}–${conflict.hora_fin}, ${DIAS_LABEL[conflict.dia_semana]}).`;
      errorEl.classList.remove("hidden");
      return;
    }

    await db.clases.put({ id, materia, dia_semana, hora_inicio, hora_fin, aula, profesor, color, notas });
    closeClassModal();
    showToast("Materia guardada.");
    if (state.currentTab === "view-hoy") renderHoy();
    else renderHorario();
  });

  $("#btn-delete-class").addEventListener("click", async () => {
    const id = $("#class-id").value;
    if (!id) return;
    const ok = await confirmDialog("Eliminar Materia", "¿Deseas quitar esta materia de tu horario?");
    if (!ok) return;
    await db.clases.delete(id);
    closeClassModal();
    showToast("Materia eliminada.");
    if (state.currentTab === "view-hoy") renderHoy();
    else renderHorario();
  });

  $$(".imp-star-btn", $("#task-importance-selector")).forEach(btn => {
    btn.addEventListener("click", () => setImportanceStars(parseInt(btn.dataset.val)));
  });

  $("#modal-task-close").addEventListener("click", closeTaskModal);
  $("#btn-cancel-task").addEventListener("click", closeTaskModal);
  $("#modal-task-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-task-backdrop") closeTaskModal();
  });

  $("#form-task").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#task-id").value || uuid();
    const titulo = $("#task-titulo").value.trim();
    const materia = $("#task-materia").value || "General";
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

    await db.tareas.put({ id, titulo, materia, fecha_limite, importancia, completada, fecha_creacion, notas });
    closeTaskModal();
    showToast("Tarea guardada.");
    if (state.currentTab === "view-hoy") renderHoy();
    else renderTareas();
  });

  $("#btn-delete-task").addEventListener("click", async () => {
    const id = $("#task-id").value;
    if (!id) return;
    const ok = await confirmDialog("Eliminar Tarea", "¿Deseas eliminar esta tarea permanentemente?");
    if (!ok) return;
    await db.tareas.delete(id);
    closeTaskModal();
    showToast("Tarea eliminada.");
    if (state.currentTab === "view-hoy") renderHoy();
    else renderTareas();
  });

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeClassModal();
      closeTaskModal();
      $("#modal-quick-backdrop").classList.add("hidden");
      $("#modal-confirm-backdrop").classList.add("hidden");
    }
  });
}

/* =====================================================================
   14. INICIALIZACIÓN
   ===================================================================== */
async function init() {
  applyTheme(state.theme);

  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  try {
    await db.open();
  } catch (err) {
    console.error("Error abriendo IndexedDB:", err);
  }

  wireGlobalEvents();
  switchTab("view-hoy");

  setInterval(() => {
    if (state.currentTab === "view-hoy") renderHoy();
  }, 60000);
}

document.addEventListener("DOMContentLoaded", init);
