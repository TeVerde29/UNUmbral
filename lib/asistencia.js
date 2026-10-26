/**
 * UNUmbral — lib/asistencia.js
 * Lógica pura de cálculo de ciclo académico, excepciones de clase y asistencia.
 * 100% offline, sin dependencias de DOM, Dexie ni Capacitor para pruebas con node --test.
 */

/**
 * Convierte una fecha a string YYYY-MM-DD en zona horaria local.
 * @param {Date} d
 * @returns {string}
 */
function fechaAString(d) {
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Parsea YYYY-MM-DD a objeto Date a las 00:00:00 locales.
 * @param {string} str
 * @returns {Date|null}
 */
function parsearFechaLocal(str) {
  if (!str || typeof str !== 'string') return null;
  const partes = str.split('-').map(Number);
  if (partes.length !== 3 || partes.some(isNaN)) return null;
  return new Date(partes[0], partes[1] - 1, partes[2], 0, 0, 0, 0);
}

/**
 * Verifica si una fecha específica está marcada como feriado en las excepciones.
 * @param {string} fechaStr YYYY-MM-DD
 * @param {Array} excepciones
 * @returns {boolean}
 */
function esDiaFeriado(fechaStr, excepciones = []) {
  if (!fechaStr || !Array.isArray(excepciones)) return false;
  return excepciones.some(ex => ex && ex.fecha === fechaStr && ex.tipo === 'feriado');
}

/**
 * Verifica si una clase o curso específico está cancelado en una fecha dada.
 * @param {string} claseId
 * @param {string} cursoId
 * @param {string} fechaStr YYYY-MM-DD
 * @param {Array} excepciones
 * @returns {boolean}
 */
function esClaseCancelada(claseId, cursoId, fechaStr, excepciones = []) {
  if (!fechaStr || !Array.isArray(excepciones)) return false;
  return excepciones.some(ex => {
    if (!ex || ex.fecha !== fechaStr) return false;
    if (ex.tipo === 'feriado') return true;
    if (ex.tipo === 'cancelada') {
      if (claseId && ex.clase_id === claseId) return true;
      if (cursoId && ex.curso_id === cursoId && !ex.clase_id) return true;
    }
    return false;
  });
}

/**
 * Obtiene todas las fechas de sesión proyectadas para las clases de un curso
 * en el rango del ciclo académico [cicloInicio, cicloFin], anotando excepciones.
 * 
 * @param {Array} clasesDelCurso Clases del curso con { id, dia_semana, hora_inicio, hora_fin }
 * @param {string} cicloInicio YYYY-MM-DD
 * @param {string} cicloFin YYYY-MM-DD
 * @param {Array} excepciones Array de excepciones
 * @returns {Array<{ fecha: string, diaSemana: number, claseId: string, cancelada: boolean, feriado: boolean, motivo?: string }>}
 */
function fechasDeSesion(clasesDelCurso = [], cicloInicio, cicloFin, excepciones = []) {
  if (!cicloInicio || !cicloFin || !Array.isArray(clasesDelCurso) || clasesDelCurso.length === 0) {
    return [];
  }

  const dInicio = parsearFechaLocal(cicloInicio);
  const dFin = parsearFechaLocal(cicloFin);

  if (!dInicio || !dFin || dInicio > dFin) {
    return [];
  }

  // Agrupar clases por dia_semana (1 = Lunes ... 7 = Domingo)
  const clasesPorDia = new Map();
  for (const c of clasesDelCurso) {
    const dia = Number(c.dia_semana);
    if (!clasesPorDia.has(dia)) {
      clasesPorDia.set(dia, []);
    }
    clasesPorDia.get(dia).push(c);
  }

  const resultado = [];
  const actual = new Date(dInicio.getTime());

  while (actual <= dFin) {
    const fechaStr = fechaAString(actual);
    const jsDay = actual.getDay();
    const diaSemana = jsDay === 0 ? 7 : jsDay;

    const clasesHoy = clasesPorDia.get(diaSemana) || [];

    for (const c of clasesHoy) {
      const feriado = esDiaFeriado(fechaStr, excepciones);
      const exCancelada = excepciones.find(ex =>
        ex && ex.fecha === fechaStr && ex.tipo === 'cancelada' &&
        (ex.clase_id === c.id || (ex.curso_id === c.curso_id && !ex.clase_id))
      );
      const cancelada = feriado || Boolean(exCancelada);
      const motivo = feriado
        ? (excepciones.find(e => e.fecha === fechaStr && e.tipo === 'feriado')?.motivo || 'Feriado')
        : (exCancelada?.motivo || (cancelada ? 'Clase cancelada' : undefined));

      resultado.push({
        fecha: fechaStr,
        diaSemana,
        claseId: c.id,
        horaInicio: c.hora_inicio,
        horaFin: c.hora_fin,
        cancelada,
        feriado,
        motivo
      });
    }

    actual.setDate(actual.getDate() + 1);
  }

  return resultado;
}

/**
 * Calcula el número total de sesiones reales de un curso en el ciclo,
 * deduciendo feriados y clases canceladas.
 * 
 * @param {Array} clasesDelCurso
 * @param {string} cicloInicio
 * @param {string} cicloFin
 * @param {Array} excepciones
 * @returns {number}
 */
function totalSesiones(clasesDelCurso = [], cicloInicio, cicloFin, excepciones = []) {
  const sesiones = fechasDeSesion(clasesDelCurso, cicloInicio, cicloFin, excepciones);
  return sesiones.filter(s => !s.cancelada && !s.feriado).length;
}

/**
 * Calcula el resumen completo de asistencia para un curso.
 * 
 * @param {Object} params
 * @param {string} params.cursoId
 * @param {Array} params.clasesDelCurso
 * @param {Array} params.asistencias Array de registros { curso_id, fecha, estado: 'presente'|'falta'|'justificada' }
 * @param {string} params.cicloInicio
 * @param {string} params.cicloFin
 * @param {Array} params.excepciones
 * @param {number} [params.limiteFaltasPct=30]
 * @param {string} [params.fechaHoy] YYYY-MM-DD de referencia (opcional, default hoy local)
 * @returns {Object}
 */
function resumenAsistencia({
  cursoId,
  clasesDelCurso = [],
  asistencias = [],
  cicloInicio,
  cicloFin,
  excepciones = [],
  limiteFaltasPct = 30,
  fechaHoy = null
}) {
  const hoyStr = fechaHoy || fechaAString(new Date());
  const todasLasSesiones = fechasDeSesion(clasesDelCurso, cicloInicio, cicloFin, excepciones);
  const sesionesValidas = todasLasSesiones.filter(s => !s.cancelada && !s.feriado);
  const totalSes = sesionesValidas.length;

  const sesionesHastaHoy = sesionesValidas.filter(s => s.fecha <= hoyStr);
  const sesionesTranscurridas = sesionesHastaHoy.length;

  // Filtrar asistencias registradas para este curso
  const asistenciasCurso = (asistencias || []).filter(a => a && a.curso_id === cursoId);

  let presentes = 0;
  let faltas = 0;
  let justificadas = 0;

  for (const a of asistenciasCurso) {
    if (a.estado === 'presente') presentes++;
    else if (a.estado === 'falta') faltas++;
    else if (a.estado === 'justificada') justificadas++;
  }

  // Porcentaje de faltas respecto al total del ciclo
  const pctCiclo = totalSes > 0 ? (faltas / totalSes) * 100 : 0;
  // Porcentaje de faltas respecto a las transcurridas
  const pctTranscurrido = sesionesTranscurridas > 0 ? (faltas / sesionesTranscurridas) * 100 : 0;

  const limitePct = Number(limiteFaltasPct) || 30;
  const maxFaltasPermitidas = totalSes > 0 ? Math.floor(totalSes * (limitePct / 100)) : 0;
  const faltasRestantes = Math.max(0, maxFaltasPermitidas - faltas);
  const enRiesgo = totalSes > 0 && faltas >= maxFaltasPermitidas;

  let umbralActual = 0;
  if (pctCiclo >= 30) umbralActual = 30;
  else if (pctCiclo >= 20) umbralActual = 20;
  else if (pctCiclo >= 10) umbralActual = 10;

  return {
    cursoId,
    totalSesiones: totalSes,
    sesionesTranscurridas,
    presentes,
    faltas,
    justificadas,
    porcentajeFaltasCiclo: Math.round(pctCiclo * 10) / 10,
    porcentajeFaltasTranscurrido: Math.round(pctTranscurrido * 10) / 10,
    limiteFaltasPct: limitePct,
    maxFaltasPermitidas,
    faltasRestantes,
    enRiesgo,
    umbralActual,
    todasLasSesiones
  };
}

/**
 * Detecta si al sumar una falta se cruza un nuevo umbral (ej. 10%, 20%, 30%).
 * 
 * @param {number} faltasAntes
 * @param {number} faltasDespues
 * @param {number} totalSesiones
 * @param {number[]} [umbrales=[10, 20, 30]]
 * @returns {number|null} El umbral más alto cruzado o null si ninguno
 */
function detectarUmbralCruzado(faltasAntes, faltasDespues, totalSesiones, umbrales = [10, 20, 30]) {
  if (totalSesiones <= 0 || faltasDespues <= faltasAntes) return null;

  const pctAntes = (faltasAntes / totalSesiones) * 100;
  const pctDespues = (faltasDespues / totalSesiones) * 100;

  const umbralesOrdenados = [...umbrales].sort((a, b) => b - a);
  for (const u of umbralesOrdenados) {
    if (pctAntes < u && pctDespues >= u) {
      return u;
    }
  }

  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fechaAString,
    parsearFechaLocal,
    esDiaFeriado,
    esClaseCancelada,
    fechasDeSesion,
    totalSesiones,
    resumenAsistencia,
    detectarUmbralCruzado
  };
} else if (typeof window !== 'undefined') {
  window.fechaAString = fechaAString;
  window.parsearFechaLocal = parsearFechaLocal;
  window.esDiaFeriado = esDiaFeriado;
  window.esClaseCancelada = esClaseCancelada;
  window.fechasDeSesion = fechasDeSesion;
  window.totalSesiones = totalSesiones;
  window.resumenAsistencia = resumenAsistencia;
  window.detectarUmbralCruzado = detectarUmbralCruzado;
}
