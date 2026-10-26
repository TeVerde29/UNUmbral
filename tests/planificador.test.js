const test = require("node:test");
const assert = require("node:assert/strict");
const {
  planificarNotificaciones,
  estaEnSilencio,
  moverFueraDeSilencio
} = require("../lib/planificador.js");

test("estaEnSilencio y moverFueraDeSilencio detectan y ajustan horas nocturnas", () => {
  // 02:00 AM -> en silencio
  const noche = new Date(2026, 9, 26, 2, 0, 0); // 26 Oct 2026 02:00 AM
  assert.equal(estaEnSilencio(noche, "22:00", "07:00"), true);

  const ajustado = moverFueraDeSilencio(noche, "07:00");
  assert.equal(ajustado.getHours(), 7);
  assert.equal(ajustado.getMinutes(), 0);
  assert.equal(ajustado.getDate(), 26); // Mismo día porque es después de medianoche

  // 11:30 PM (23:30) -> en silencio
  const tardeNoche = new Date(2026, 9, 26, 23, 30, 0);
  assert.equal(estaEnSilencio(tardeNoche, "22:00", "07:00"), true);
  const manana = moverFueraDeSilencio(tardeNoche, "07:00");
  assert.equal(manana.getHours(), 7);
  assert.equal(manana.getDate(), 27); // Pasa al día siguiente

  // 03:00 PM -> fuera de silencio
  const dia = new Date(2026, 9, 26, 15, 0, 0);
  assert.equal(estaEnSilencio(dia, "22:00", "07:00"), false);
});

test("genera alertas de clase (30 min y 10 min antes) para clases activas", () => {
  // Ahora: Lunes 26 Oct 2026 a las 08:00 AM
  const ahora = new Date(2026, 9, 26, 8, 0, 0);
  const cursos = [{ id: "c1", nombre: "Cálculo II", aula: "Aula 3", profesor: "Dr. Pérez" }];
  const clases = [{ id: "cl1", curso_id: "c1", dia_semana: "LUNES", hora_inicio: "16:30", hora_fin: "18:00" }];

  const notifs = planificarNotificaciones({
    ahora,
    cursos,
    clases,
    tareas: [],
    eventos: [],
    excepciones: [],
    ajustes: { aviso_clase_min: [30, 10], resumen_activo: false },
    dias: 7
  });

  const claseNotifs = notifs.filter(n => n.canal === "clases");
  assert.equal(claseNotifs.length, 2);

  // 30 min antes de las 16:30 es 16:00
  assert.equal(claseNotifs[0].cuando.getHours(), 16);
  assert.equal(claseNotifs[0].cuando.getMinutes(), 0);
  assert.match(claseNotifs[0].titulo, /en 30 min/);
  assert.match(claseNotifs[0].cuerpo, /Aula 3/);
  assert.match(claseNotifs[0].cuerpo, /Dr\. Pérez/);

  // 10 min antes de las 16:30 es 16:20
  assert.equal(claseNotifs[1].cuando.getHours(), 16);
  assert.equal(claseNotifs[1].cuando.getMinutes(), 20);
  assert.match(claseNotifs[1].titulo, /en 10 min/);
});

test("no programa alertas para clases con excepción cancelada o en día feriado", () => {
  const ahora = new Date(2026, 9, 26, 8, 0, 0); // Lunes 26 Oct
  const cursos = [{ id: "c1", nombre: "Física" }];
  const clases = [{ id: "cl1", curso_id: "c1", dia_semana: "LUNES", hora_inicio: "10:00", hora_fin: "12:00" }];
  const excepciones = [
    { fecha: "2026-10-26", tipo: "cancelada", clase_id: "cl1" }
  ];

  const notifs = planificarNotificaciones({
    ahora,
    cursos,
    clases,
    tareas: [],
    eventos: [],
    excepciones,
    ajustes: { resumen_activo: false },
    dias: 7
  });

  const claseNotifs = notifs.filter(n => n.canal === "clases");
  assert.equal(claseNotifs.length, 0);
});

test("programa alertas de tarea nivel 2 cada 8 h desde 48 h antes y omite tareas completadas", () => {
  // Ahora: 26 Oct a las 00:00. Vencimiento: 28 Oct a las 23:59 (aprox 72 h adelante)
  const ahora = new Date(2026, 9, 26, 0, 0, 0);
  const cursos = [{ id: "c1", nombre: "Algoritmos" }];
  const tareas = [
    { id: "t1", titulo: "Guía 1", curso_id: "c1", fecha_limite: "2026-10-28", importancia: 2, completada: false },
    { id: "t2", titulo: "Completada", curso_id: "c1", fecha_limite: "2026-10-28", importancia: 2, completada: true }
  ];

  const notifs = planificarNotificaciones({
    ahora,
    cursos,
    clases: [],
    tareas,
    eventos: [],
    excepciones: [],
    ajustes: { silencio_activo: false, resumen_activo: false },
    dias: 7
  });

  const tareaNotifs = notifs.filter(n => n.extra?.ref_id === "t1");
  // 48, 40, 32, 24, 16, 8 horas antes = 6 avisos
  assert.equal(tareaNotifs.length, 6);

  // t2 está completada, no debe generar notificaciones
  const completadas = notifs.filter(n => n.extra?.ref_id === "t2");
  assert.equal(completadas.length, 0);
});

test("tarea nivel 5 genera alertas en canal urgente, persistentes y con avisos a 2 h, 30 min y 10 min", () => {
  // Ahora: 28 Oct 12:00. Vencimiento: 28 Oct 23:59
  const ahora = new Date(2026, 9, 28, 12, 0, 0);
  const cursos = [{ id: "c1", nombre: "Sistemas" }];
  const tareas = [
    { id: "t_critica", titulo: "Examen Final", curso_id: "c1", fecha_limite: "2026-10-28", importancia: 5, completada: false }
  ];

  const notifs = planificarNotificaciones({
    ahora,
    cursos,
    clases: [],
    tareas,
    eventos: [],
    excepciones: [],
    ajustes: { silencio_activo: false, resumen_activo: false },
    dias: 3
  });

  const urgentes = notifs.filter(n => n.canal === "urgente");
  assert.ok(urgentes.length > 0);
  assert.equal(urgentes[0].persistente, true);

  // Avisos específicos de 2 h, 30 min, 10 min
  const titulos = urgentes.map(n => n.titulo);
  assert.ok(titulos.some(t => t.includes("2 h")));
  assert.ok(titulos.some(t => t.includes("30 min")));
  assert.ok(titulos.some(t => t.includes("10 min")));
});

test("resumen matutino consolida clases y tareas y se omite si el día está vacío", () => {
  // Ahora: 26 Oct a las 06:00 AM (antes del resumen de las 07:00 AM)
  const ahora = new Date(2026, 9, 26, 6, 0, 0);
  const cursos = [{ id: "c1", nombre: "Cálculo" }];
  const clases = [{ id: "cl1", curso_id: "c1", dia_semana: "LUNES", hora_inicio: "08:00", hora_fin: "10:00" }];
  const tareas = [{ id: "t1", titulo: "Tarea 1", curso_id: "c1", fecha_limite: "2026-10-26", importancia: 3, completada: false }];

  const notifs = planificarNotificaciones({
    ahora,
    cursos,
    clases,
    tareas,
    eventos: [],
    excepciones: [],
    ajustes: { resumen_activo: true, resumen_hora: "07:00", notif_clases: false, notif_tareas: false },
    dias: 2
  });

  const resumenes = notifs.filter(n => n.canal === "resumen" && n.extra?.tipo === "resumen");
  assert.equal(resumenes.length, 1); // Solo el lunes porque el martes no hay clases ni tareas
  assert.equal(resumenes[0].cuando.getHours(), 7);
  assert.match(resumenes[0].cuerpo, /1 clase/);
  assert.match(resumenes[0].cuerpo, /1 tarea/);
});
