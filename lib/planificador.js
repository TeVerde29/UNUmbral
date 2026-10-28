// lib/planificador.js
// Motor de planificación pura de notificaciones locales para UNUmbral (Fase 2)

const DIAS_SEMANA_MAP = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatearFechaISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function timeStringToMinutes(hhmm) {
  if (!hhmm) return 0;
  const s = String(hhmm).trim().toUpperCase();
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3];
  if (mer === "PM" && h < 12) h += 12;
  else if (mer === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function parseDateTime(fechaStr, horaStr, defaultHora = "23:59") {
  if (!fechaStr) return null;
  let fStr = String(fechaStr).trim();
  let hStr = horaStr;
  if (fStr.includes("T")) {
    const parts = fStr.split("T");
    fStr = parts[0];
    if (!hStr && parts[1]) hStr = parts[1].slice(0, 5);
  }
  const [y, m, d] = fStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const totalMins = timeStringToMinutes(hStr || defaultHora);
  const h = Math.floor(totalMins / 60);
  const min = totalMins % 60;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

function estaEnSilencio(date, desdeStr = "22:00", hastaStr = "07:00") {
  const currentMins = date.getHours() * 60 + date.getMinutes();
  const desdeMins = timeStringToMinutes(desdeStr);
  const hastaMins = timeStringToMinutes(hastaStr);

  if (desdeMins > hastaMins) {
    // Cruza la medianoche (ej: 22:00 a 07:00)
    return currentMins >= desdeMins || currentMins < hastaMins;
  }
  return currentMins >= desdeMins && currentMins < hastaMins;
}

function moverFueraDeSilencio(date, hastaStr = "07:00") {
  const [hHasta, mHasta] = hastaStr.split(":").map(Number);
  const target = new Date(date.getTime());

  // Si la hora es de noche (>= 12:00 PM), pasa a las 7 AM del día siguiente
  if (target.getHours() >= 12) {
    target.setDate(target.getDate() + 1);
  }
  target.setHours(hHasta, mHasta, 0, 0);
  return target;
}

/**
 * Planifica de manera determinista todas las alertas para los próximos N días.
 */
function planificarNotificaciones({
  ahora = new Date(),
  cursos = [],
  clases = [],
  tareas = [],
  eventos = [],
  excepciones = [],
  ajustes = {},
  dias = 14
}) {
  const notificaciones = [];
  const ahoraTime = ahora.getTime();

  const cursosMap = {};
  cursos.forEach(c => { cursosMap[c.id] = c; });

  const avisoClaseMin = Array.isArray(ajustes.aviso_clase_min) ? ajustes.aviso_clase_min : [30, 10];
  const notifClasesActivo = ajustes.notif_clases !== false;
  const notifTareasActivo = ajustes.notif_tareas !== false;
  const notifUrgentesActivo = ajustes.notif_urgentes !== false;
  const resumenActivo = ajustes.resumen_activo !== false;
  const resumenHora = ajustes.resumen_hora || "07:00";
  const silencioActivo = ajustes.silencio_activo !== false;
  const silencioDesde = ajustes.silencio_desde || "22:00";
  const silencioHasta = ajustes.silencio_hasta || "07:00";
  const nivel5IgnoraSilencio = ajustes.nivel5_ignora_silencio !== false;

  // Mapa de excepciones por fecha
  const feriadosSet = new Set();
  const canceladasSet = new Set();
  (excepciones || []).forEach(ex => {
    if (ex.tipo === "feriado") feriadosSet.add(ex.fecha);
    else if (ex.tipo === "cancelada" && ex.clase_id) {
      canceladasSet.add(`${ex.fecha}_${ex.clase_id}`);
    }
  });

  // 1. ALERTAS DE CLASES
  if (notifClasesActivo) {
    for (let i = 0; i < dias; i++) {
      const targetDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
      const fechaISO = formatearFechaISO(targetDate);
      if (feriadosSet.has(fechaISO)) continue;

      const diaNombre = DIAS_SEMANA_MAP[targetDate.getDay()];
      const clasesDelDia = clases.filter(c => c.dia_semana === diaNombre);

      for (const cl of clasesDelDia) {
        if (canceladasSet.has(`${fechaISO}_${cl.id}`)) continue;

        const cur = cl.tipo === "actividad"
          ? { nombre: cl.titulo || "Actividad", aula: cl.aula || "", profesor: "" }
          : (cursosMap[cl.curso_id] || { nombre: "Clase" });
        const claseStart = parseDateTime(fechaISO, cl.hora_inicio);
        if (!claseStart) continue;

        const aula = cl.aula || cur.aula;
        const prof = cur.profesor;
        const metaParts = [];
        if (aula) metaParts.push(`Aula ${aula}`);
        if (prof) metaParts.push(prof);
        const metaDetalle = metaParts.length ? ` · ${metaParts.join(" · ")}` : "";

        for (const minAntes of avisoClaseMin) {
          let alertaTime = new Date(claseStart.getTime() - minAntes * 60000);
          if (alertaTime.getTime() <= ahoraTime) continue;

          if (silencioActivo && estaEnSilencio(alertaTime, silencioDesde, silencioHasta)) {
            alertaTime = moverFueraDeSilencio(alertaTime, silencioHasta);
          }
          if (alertaTime.getTime() <= ahoraTime) continue;

          notificaciones.push({
            cuando: alertaTime,
            canal: "clases",
            titulo: `${cur.nombre} en ${minAntes} min`,
            cuerpo: `${cur.nombre}${metaDetalle}`,
            persistente: false,
            extra: { tipo: "clase", ref_id: cl.id, fecha: fechaISO }
          });
        }
      }
    }
  }

  // 2. ALERTAS DE TAREAS Y ENTREGAS (NIVELES 1-3 y NIVELES 4-5)
  for (const t of tareas) {
    if (t.completada || !t.fecha_limite) continue;
    const cur = cursosMap[t.curso_id];
    const cursoNombre = cur ? cur.nombre : "General";
    const importancia = parseInt(t.importancia, 10) || 3;
    const due = parseDateTime(t.fecha_limite, null, "23:59");
    if (!due || due.getTime() <= ahoraTime) continue;

    // Tareas nivel 1-3
    if (importancia <= 3) {
      if (!notifTareasActivo) continue;
      // Empiezan 48h antes, cada 8h hasta el vencimiento: 48, 40, 32, 24, 16, 8 horas antes
      const horasAntesList = [48, 40, 32, 24, 16, 8];
      for (const hAntes of horasAntesList) {
        let alertaTime = new Date(due.getTime() - hAntes * 3600000);
        if (alertaTime.getTime() <= ahoraTime) continue;

        if (silencioActivo && estaEnSilencio(alertaTime, silencioDesde, silencioHasta)) {
          alertaTime = moverFueraDeSilencio(alertaTime, silencioHasta);
        }
        if (alertaTime.getTime() <= ahoraTime) continue;

        notificaciones.push({
          cuando: alertaTime,
          canal: "tareas",
          titulo: `Vence en ${hAntes} h: ${t.titulo}`,
          cuerpo: `${cursoNombre} · Importancia ${importancia}/5`,
          persistente: false,
          extra: { tipo: "tarea", ref_id: t.id }
        });
      }
    } else {
      // Tareas nivel 4 y 5: cada 8 horas (48h, 40h, 32h, 24h, 16h, 8h, 4h antes de la entrega)
      if (!notifUrgentesActivo) continue;

      const intervalosMs = [
        { ms: 48 * 3600000, label: "48 h" },
        { ms: 40 * 3600000, label: "40 h" },
        { ms: 32 * 3600000, label: "32 h" },
        { ms: 24 * 3600000, label: "24 h" },
        { ms: 16 * 3600000, label: "16 h" },
        { ms: 8 * 3600000, label: "8 h" },
        { ms: 4 * 3600000, label: "4 h" }
      ];

      // Nivel 5: avisos adicionales inminentes (2 h, 30 min, 10 min)
      if (importancia === 5) {
        intervalosMs.push({ ms: 2 * 3600000, label: "2 h" });
        intervalosMs.push({ ms: 30 * 60000, label: "30 min" });
        intervalosMs.push({ ms: 10 * 60000, label: "10 min" });
      }

      for (const item of intervalosMs) {
        let alertaTime = new Date(due.getTime() - item.ms);
        if (alertaTime.getTime() <= ahoraTime) continue;

        const ignoraSilencio = (importancia === 5 && nivel5IgnoraSilencio);
        if (!ignoraSilencio && silencioActivo && estaEnSilencio(alertaTime, silencioDesde, silencioHasta)) {
          alertaTime = moverFueraDeSilencio(alertaTime, silencioHasta);
        }
        if (alertaTime.getTime() <= ahoraTime) continue;

        notificaciones.push({
          cuando: alertaTime,
          canal: "urgente",
          titulo: `CRÍTICO: ${t.titulo} (vence en ${item.label})`,
          cuerpo: `${cursoNombre} · Entrega prioritaria Nivel ${importancia}`,
          persistente: importancia === 5,
          extra: { tipo: "tarea", ref_id: t.id }
        });
      }
    }
  }

  // 3. EVENTOS / EXÁMENES (1 día antes y 2 horas antes)
  for (const ev of eventos) {
    if (!ev.fecha) continue;
    const cur = cursosMap[ev.curso_id];
    const curNom = cur ? cur.nombre : "Evento";
    const evDate = parseDateTime(ev.fecha, ev.hora, "09:00");
    if (!evDate || evDate.getTime() <= ahoraTime) continue;

    // 1 día antes a las 09:00 AM
    const unDiaAntes = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate() - 1, 9, 0, 0);
    if (unDiaAntes.getTime() > ahoraTime) {
      notificaciones.push({
        cuando: unDiaAntes,
        canal: "tareas",
        titulo: `Mañana: ${ev.titulo}`,
        cuerpo: `${curNom} (${ev.tipo.toUpperCase()}) · Prepárate con tiempo`,
        persistente: false,
        extra: { tipo: "evento", ref_id: ev.id }
      });
    }

    // 2 horas antes
    const dosHorasAntes = new Date(evDate.getTime() - 2 * 3600000);
    if (dosHorasAntes.getTime() > ahoraTime) {
      notificaciones.push({
        cuando: dosHorasAntes,
        canal: "urgente",
        titulo: `En 2 h: ${ev.titulo}`,
        cuerpo: `${curNom} · ${ev.tipo.toUpperCase()}`,
        persistente: false,
        extra: { tipo: "evento", ref_id: ev.id }
      });
    }
  }

  // 4. RESUMEN MATUTINO DIARIO
  if (resumenActivo) {
    for (let i = 0; i < dias; i++) {
      const targetDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
      const fechaISO = formatearFechaISO(targetDate);
      if (feriadosSet.has(fechaISO)) continue;

      const summaryDate = parseDateTime(fechaISO, resumenHora);
      if (!summaryDate || summaryDate.getTime() <= ahoraTime) continue;

      const diaNombre = DIAS_SEMANA_MAP[targetDate.getDay()];
      const clasesActivas = clases.filter(c => c.dia_semana === diaNombre && !canceladasSet.has(`${fechaISO}_${c.id}`));
      const tareasQueVencen = tareas.filter(t => !t.completada && t.fecha_limite === fechaISO);
      const eventosDeHoy = eventos.filter(e => e.fecha === fechaISO);

      // Si no hay nada ese día, no enviar
      if (clasesActivas.length === 0 && tareasQueVencen.length === 0 && eventosDeHoy.length === 0) {
        continue;
      }

      const clasesText = `${clasesActivas.length} ${clasesActivas.length === 1 ? "clase" : "clases"}`;
      const tareasText = `${tareasQueVencen.length} ${tareasQueVencen.length === 1 ? "tarea que vence" : "tareas que vencen"}`;
      let cuerpo = `Hoy tienes ${clasesText} y ${tareasText}.`;
      if (eventosDeHoy.length > 0) {
        cuerpo += ` Examen: ${eventosDeHoy[0].titulo}.`;
      }

      notificaciones.push({
        cuando: summaryDate,
        canal: "resumen",
        titulo: "UNUmbral · Resumen de Hoy",
        cuerpo,
        persistente: false,
        extra: { tipo: "resumen", fecha: fechaISO }
      });
    }
  }

  // 5. AVISO DE RENOVACIÓN DE ALERTAS (Día 13 a las 8:00 AM)
  const fechaRenovacion = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 13, 8, 0, 0);
  if (fechaRenovacion.getTime() > ahoraTime) {
    notificaciones.push({
      cuando: fechaRenovacion,
      canal: "resumen",
      titulo: "UNUmbral · Renueva tus alertas",
      cuerpo: "Abre la aplicación para programar automáticamente tus alertas de las próximas dos semanas.",
      persistente: false,
      extra: { tipo: "renovacion" }
    });
  }

  // 6. DEDUPLICACIÓN DE RECORDATORIOS IDÉNTICOS O DE LA MISMA TAREA A LA MISMA HORA
  const vistas = new Set();
  const dedup = [];
  for (const n of notificaciones) {
    // Si dos alertas de la misma tarea caen en el mismo minuto (ej. movidas de la noche a las 7 AM), enviar solo una
    const refKey = n.extra?.ref_id ? `${n.extra.ref_id}_${n.cuando.getTime()}` : `${n.cuando.getTime()}_${n.canal}_${n.titulo}`;
    if (!vistas.has(refKey)) {
      vistas.add(refKey);
      dedup.push(n);
    }
  }

  // 7. ORDENAR POR TIEMPO ASCENDENTE Y TOPE DURO (~400 MÁXIMO)
  dedup.sort((a, b) => a.cuando.getTime() - b.cuando.getTime());
  const finalNotifs = dedup.slice(0, 380);

  // 8. ASIGNAR IDS ENTEROS ÚNICOS ESTABLES
  return finalNotifs.map((n, idx) => ({
    id: idx + 1000,
    cuando: n.cuando,
    canal: n.canal,
    titulo: n.titulo,
    cuerpo: n.cuerpo,
    persistente: Boolean(n.persistente),
    extra: n.extra || {}
  }));
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    planificarNotificaciones,
    estaEnSilencio,
    moverFueraDeSilencio,
    parseDateTime,
    timeStringToMinutes
  };
} else if (typeof window !== "undefined") {
  window.UNUPlanificador = {
    planificarNotificaciones,
    estaEnSilencio,
    moverFueraDeSilencio,
    parseDateTime,
    timeStringToMinutes
  };
}
