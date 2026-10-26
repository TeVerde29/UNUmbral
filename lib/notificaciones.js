// lib/notificaciones.js
// Integración de notificaciones locales de Capacitor con debounce y sincronización con Dexie (Fase 2)

let reprogramarTimer = null;

async function crearCanalesNotificacion() {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return;

  try {
    await LocalNotifications.createChannel({
      id: "clases",
      name: "Avisos de Clases",
      description: "Notificaciones 30 y 10 minutos antes de cada clase programada",
      importance: 4,
      visibility: 1,
      vibration: true
    });

    await LocalNotifications.createChannel({
      id: "tareas",
      name: "Recordatorios de Tareas",
      description: "Alertas para entregas académicas nivel 1 a 3",
      importance: 3,
      visibility: 1,
      vibration: true
    });

    await LocalNotifications.createChannel({
      id: "resumen",
      name: "Resumen Matutino",
      description: "Resumen diario matutino con las actividades del día",
      importance: 3,
      visibility: 1,
      vibration: false
    });

    await LocalNotifications.createChannel({
      id: "urgente",
      name: "Alertas Urgentes (Nivel 4 y 5)",
      description: "Alertas insistentes de máxima prioridad para exámenes y entregas críticas",
      importance: 5,
      visibility: 1,
      vibration: true
    });
  } catch (err) {
    console.warn("Error creando canales de notificación:", err);
  }
}

async function registrarAccionesNotificacion() {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return;

  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: "TAREA_ACTIONS",
          actions: [
            { id: "completar", title: "Completada" },
            { id: "posponer", title: "Recordar en 1 h" }
          ]
        }
      ]
    });

    LocalNotifications.addListener("localNotificationActionPerformed", async (action) => {
      const extra = action.notification?.extra || {};
      const actionId = action.actionId;

      if (actionId === "completar" && extra.ref_id) {
        if (typeof db !== "undefined") {
          await db.tareas.update(extra.ref_id, { completada: true });
          if (typeof showToast === "function") showToast("Tarea marcada como completada.");
          reprogramarTodo();
          if (typeof refrescarVistaActual === "function") refrescarVistaActual();
        }
      } else if (actionId === "posponer" && extra.ref_id) {
        // Posponer 1 hora
        const postergada = new Date(Date.now() + 60 * 60000);
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 8000) + 1000,
              title: action.notification.title,
              body: action.notification.body,
              schedule: { at: postergada, allowWhileIdle: true },
              smallIcon: "ic_stat_icon",
              largeIcon: "ic_stat_logo",
              iconColor: "#294635",
              channelId: action.notification.channelId || "tareas",
              extra: action.notification.extra
            }
          ]
        });
        if (typeof showToast === "function") showToast("Alerta pospuesta por 1 hora.");
      } else {
        // Tocar notificación: abrir vista según tipo
        if (extra.tipo === "tarea" && typeof switchTab === "function") {
          switchTab("view-tareas");
        } else if (typeof switchTab === "function") {
          switchTab("view-hoy");
        }
      }
    });
  } catch (err) {
    console.warn("Error registrando listeners de notificación:", err);
  }
}

/**
 * Reconstruye y programa las notificaciones locales con debounce.
 */
function reprogramarTodo() {
  if (reprogramarTimer) clearTimeout(reprogramarTimer);

  reprogramarTimer = setTimeout(async () => {
    const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
    if (!LocalNotifications) return;

    try {
      if (typeof db === "undefined" || !db.isOpen()) return;

      const [cursos, clases, tareas, eventos, excepciones, ajustesList] = await Promise.all([
        db.cursos.toArray(),
        db.clases.toArray(),
        db.tareas.toArray(),
        db.eventos ? db.eventos.toArray() : [],
        db.excepciones ? db.excepciones.toArray() : [],
        db.ajustes.toArray()
      ]);

      const defaults = typeof getAjustesDefaults === "function" ? getAjustesDefaults() : {};
      const ajustesMap = { ...defaults };
      ajustesList.forEach(a => { ajustesMap[a.clave] = a.valor; });

      const planificarFn = window.UNUPlanificador?.planificarNotificaciones ||
        (typeof planificarNotificaciones === "function" ? planificarNotificaciones : null);

      if (!planificarFn) return;

      const notifsPlaneadas = planificarFn({
        ahora: new Date(),
        cursos,
        clases,
        tareas,
        eventos,
        excepciones,
        ajustes: ajustesMap,
        dias: 14
      });

      // Cancelar notificaciones pendientes previas
      const pending = await LocalNotifications.getPending();
      if (pending && Array.isArray(pending.notifications) && pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      // Programar nuevas alertas
      if (notifsPlaneadas.length > 0) {
        const payload = notifsPlaneadas.map(n => ({
          id: n.id,
          title: n.titulo,
          body: n.cuerpo,
          channelId: n.canal,
          ongoing: n.persistente,
          autoCancel: !n.persistente,
          smallIcon: "ic_stat_icon",
          largeIcon: "ic_stat_logo",
          iconColor: "#294635",
          actionTypeId: n.extra?.tipo === "tarea" ? "TAREA_ACTIONS" : undefined,
          schedule: { at: n.cuando, allowWhileIdle: true },
          extra: n.extra
        }));

        await LocalNotifications.schedule({ notifications: payload });
        console.log(`[notificaciones] ${payload.length} alertas locales programadas para los próximos 14 días.`);
      }
    } catch (err) {
      console.warn("Error en reprogramarTodo:", err);
    }
  }, 500);
}

async function dispararNotificacionInmediata(titulo, cuerpo, canal = "urgente") {
  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
  if (!LocalNotifications) return;
  try {
    const hasPerm = await LocalNotifications.checkPermissions();
    if (hasPerm.display !== "granted") {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== "granted") return;
    }
    const notifId = Math.floor(Date.now() % 2147483647);
    await LocalNotifications.schedule({
      notifications: [{
        id: notifId,
        title: titulo,
        body: cuerpo,
        channelId: canal,
        smallIcon: "ic_stat_icon",
        largeIcon: "ic_stat_logo",
        iconColor: "#294635",
        schedule: { at: new Date(Date.now() + 500) }
      }]
    });
  } catch (err) {
    console.warn("Error enviando notificación inmediata:", err);
  }
}

async function inicializarSistemaNotificaciones() {
  if (typeof esNativo === "function" && esNativo()) {
    await crearCanalesNotificacion();
    await registrarAccionesNotificacion();
    reprogramarTodo();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    reprogramarTodo,
    crearCanalesNotificacion,
    registrarAccionesNotificacion,
    inicializarSistemaNotificaciones,
    dispararNotificacionInmediata
  };
} else if (typeof window !== "undefined") {
  window.reprogramarTodo = reprogramarTodo;
  window.inicializarSistemaNotificaciones = inicializarSistemaNotificaciones;
  window.dispararNotificacionInmediata = dispararNotificacionInmediata;
}
