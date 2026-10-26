/**
 * UNUmbral — lib/prioridad.js
 * Lógica pura de puntuación de prioridad y agrupación de tareas ("Esta semana").
 * Generador de cuadrícula para calendario mensual.
 * 100% offline, sin dependencias de DOM, Dexie ni Capacitor para node --test.
 */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function fechaAString(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Calcula el componente de urgencia de una tarea según su fecha límite.
 * Vencida = 10; < 24 h = 8; < 48 h = 6; < 3 días (72h) = 4; < 7 días = 2; resto = 0.
 * 
 * @param {string|Date} fechaLimite 
 * @param {Date} [fechaRef=new Date()]
 * @returns {number}
 */
function calcularUrgencia(fechaLimite, fechaRef = new Date()) {
  if (!fechaLimite) return 0;
  const dLimite = new Date(fechaLimite);
  const dRef = new Date(fechaRef);
  if (isNaN(dLimite.getTime()) || isNaN(dRef.getTime())) return 0;

  const diffMs = dLimite.getTime() - dRef.getTime();

  if (diffMs < 0) return 10;
  if (diffMs <= 24 * 60 * 60 * 1000) return 8;
  if (diffMs <= 48 * 60 * 60 * 1000) return 6;
  if (diffMs <= 72 * 60 * 60 * 1000) return 4;
  if (diffMs <= 7 * 24 * 60 * 60 * 1000) return 2;
  return 0;
}

/**
 * Calcula el puntaje de prioridad:
 * puntaje = importancia × 2 + urgencia
 * 
 * @param {Object} tarea { importancia, fecha_limite }
 * @param {Date} [fechaRef=new Date()]
 * @returns {number}
 */
function puntajePrioridad(tarea, fechaRef = new Date()) {
  if (!tarea) return 0;
  const imp = Number(tarea.importancia) || 3;
  const urg = calcularUrgencia(tarea.fecha_limite, fechaRef);
  return imp * 2 + urg;
}

/**
 * Agrupa tareas en categorías temporales para la vista "Esta semana":
 * Vencidas · Hoy · Mañana · Resto de la semana · Más adelante · Sin fecha
 * 
 * @param {Array} tareas
 * @param {Date} [fechaRef=new Date()]
 * @returns {Object}
 */
function agruparSemana(tareas = [], fechaRef = new Date()) {
  const dRef = new Date(fechaRef);
  const hoyStr = fechaAString(dRef);

  const dManana = new Date(dRef.getTime());
  dManana.setDate(dManana.getDate() + 1);
  const mananaStr = fechaAString(dManana);

  // Fin de la semana actual (Domingo de la semana actual o hasta 7 días)
  const jsDay = dRef.getDay();
  const diaSemana = jsDay === 0 ? 7 : jsDay; // 1 = Lun ... 7 = Dom
  const diasHastaDomingo = 7 - diaSemana;
  const dFinSemana = new Date(dRef.getTime());
  dFinSemana.setDate(dFinSemana.getDate() + Math.max(diasHastaDomingo, 3)); // Mínimo 3 días de proyección
  const finSemanaStr = fechaAString(dFinSemana);

  const vencidas = [];
  const hoy = [];
  const manana = [];
  const resto = [];
  const masAdelante = [];
  const sinFecha = [];

  for (const t of tareas) {
    if (t.completada) continue;

    if (!t.fecha_limite) {
      sinFecha.push(t);
      continue;
    }

    const dLim = new Date(t.fecha_limite);
    if (isNaN(dLim.getTime())) {
      sinFecha.push(t);
      continue;
    }

    const limStr = fechaAString(dLim);

    if (limStr < hoyStr || dLim.getTime() < dRef.getTime()) {
      vencidas.push(t);
    } else if (limStr === hoyStr) {
      hoy.push(t);
    } else if (limStr === mananaStr) {
      manana.push(t);
    } else if (limStr <= finSemanaStr) {
      resto.push(t);
    } else {
      masAdelante.push(t);
    }
  }

  const comparator = (a, b) => puntajePrioridad(b, dRef) - puntajePrioridad(a, dRef);

  vencidas.sort(comparator);
  hoy.sort(comparator);
  manana.sort(comparator);
  resto.sort(comparator);
  masAdelante.sort(comparator);
  sinFecha.sort(comparator);

  return {
    vencidas,
    hoy,
    manana,
    resto,
    masAdelante,
    sinFecha,
    totalPendientes: vencidas.length + hoy.length + manana.length + resto.length + masAdelante.length + sinFecha.length
  };
}

/**
 * Genera la cuadrícula de días para un calendario mensual completo
 * (semanas de lunes a domingo, incluyendo días de relleno del mes anterior y posterior).
 * 
 * @param {number} anio Año (ej. 2026)
 * @param {number} mes Mes (1 a 12)
 * @param {Date} [fechaHoy=new Date()]
 * @returns {Array<{ fecha: string, anio: number, mes: number, dia: number, esDelMes: boolean, esHoy: boolean, diaSemana: number }>}
 */
function generarMatrizMes(anio, mes, fechaHoy = new Date()) {
  const hoyStr = fechaAString(fechaHoy);
  const primerDiaMes = new Date(anio, mes - 1, 1);
  const ultimoDiaMes = new Date(anio, mes, 0);

  // getDay(): 0=Dom, 1=Lun ... 6=Sab -> convertir a 1=Lun ... 7=Dom
  const primerJsDay = primerDiaMes.getDay();
  const primerDiaSemana = primerJsDay === 0 ? 7 : primerJsDay;

  const resultado = [];

  // Días previos del mes anterior
  const diasPrevios = primerDiaSemana - 1;
  const mesAnteriorUltimoDia = new Date(anio, mes - 1, 0).getDate();
  for (let i = diasPrevios; i > 0; i--) {
    const diaNum = mesAnteriorUltimoDia - i + 1;
    const d = new Date(anio, mes - 2, diaNum);
    resultado.push({
      fecha: fechaAString(d),
      anio: d.getFullYear(),
      mes: d.getMonth() + 1,
      dia: diaNum,
      esDelMes: false,
      esHoy: fechaAString(d) === hoyStr,
      diaSemana: d.getDay() === 0 ? 7 : d.getDay()
    });
  }

  // Días del mes actual
  const totalDiasMes = ultimoDiaMes.getDate();
  for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
    const d = new Date(anio, mes - 1, diaNum);
    resultado.push({
      fecha: fechaAString(d),
      anio,
      mes,
      dia: diaNum,
      esDelMes: true,
      esHoy: fechaAString(d) === hoyStr,
      diaSemana: d.getDay() === 0 ? 7 : d.getDay()
    });
  }

  // Días posteriores del siguiente mes para completar múltiplo de 7 (35 o 42 celdas)
  const celdasRestantes = (7 - (resultado.length % 7)) % 7;
  for (let diaNum = 1; diaNum <= celdasRestantes; diaNum++) {
    const d = new Date(anio, mes, diaNum);
    resultado.push({
      fecha: fechaAString(d),
      anio: d.getFullYear(),
      mes: d.getMonth() + 1,
      dia: diaNum,
      esDelMes: false,
      esHoy: fechaAString(d) === hoyStr,
      diaSemana: d.getDay() === 0 ? 7 : d.getDay()
    });
  }

  return resultado;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calcularUrgencia,
    puntajePrioridad,
    agruparSemana,
    generarMatrizMes
  };
} else if (typeof window !== "undefined") {
  window.calcularUrgencia = calcularUrgencia;
  window.puntajePrioridad = puntajePrioridad;
  window.agruparSemana = agruparSemana;
  window.generarMatrizMes = generarMatrizMes;
}
