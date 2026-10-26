const test = require('node:test');
const assert = require('node:assert/strict');
const {
  fechaAString,
  parsearFechaLocal,
  esDiaFeriado,
  esClaseCancelada,
  fechasDeSesion,
  totalSesiones,
  resumenAsistencia,
  detectarUmbralCruzado
} = require('../lib/asistencia.js');

test('parsearFechaLocal and fechaAString parse and format correctly', () => {
  const d = parsearFechaLocal('2026-03-15');
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 2); // 0-indexed March
  assert.equal(d.getDate(), 15);
  assert.equal(fechaAString(d), '2026-03-15');

  assert.equal(parsearFechaLocal(null), null);
  assert.equal(parsearFechaLocal('invalid'), null);
});

test('esDiaFeriado y esClaseCancelada identifican excepciones correctamente', () => {
  const excepciones = [
    { id: 'ex-1', fecha: '2026-05-01', tipo: 'feriado', motivo: 'Día del Trabajo' },
    { id: 'ex-2', fecha: '2026-05-04', tipo: 'cancelada', clase_id: 'clase-mat', motivo: 'Profesor enfermo' },
    { id: 'ex-3', fecha: '2026-05-08', tipo: 'cancelada', curso_id: 'curso-fis', motivo: 'Huelga docente' }
  ];

  assert.equal(esDiaFeriado('2026-05-01', excepciones), true);
  assert.equal(esDiaFeriado('2026-05-02', excepciones), false);

  assert.equal(esClaseCancelada('clase-mat', 'curso-mat', '2026-05-04', excepciones), true);
  assert.equal(esClaseCancelada('otra-clase', 'curso-mat', '2026-05-04', excepciones), false);
  // Feriado cancela cualquier clase
  assert.equal(esClaseCancelada('cualquier-clase', 'cualquier-curso', '2026-05-01', excepciones), true);
  // Cancelación por curso_id sin clase_id específica
  assert.equal(esClaseCancelada('clase-fis-1', 'curso-fis', '2026-05-08', excepciones), true);
});

test('fechasDeSesion proyecta sesiones del ciclo y aplica excepciones', () => {
  // Lunes 2026-03-02 a Domingo 2026-03-15 (2 semanas)
  // Clase los lunes (dia_semana: 1) y miércoles (dia_semana: 3)
  const clases = [
    { id: 'c1', curso_id: 'curso-1', dia_semana: 1, hora_inicio: '08:00', hora_fin: '10:00' },
    { id: 'c2', curso_id: 'curso-1', dia_semana: 3, hora_inicio: '10:00', hora_fin: '12:00' }
  ];

  // Semana 1: Lun 2 Mar, Mié 4 Mar
  // Semana 2: Lun 9 Mar, Mié 11 Mar
  const excepciones = [
    { id: 'ex1', fecha: '2026-03-04', tipo: 'feriado', motivo: 'Aniversario' },
    { id: 'ex2', fecha: '2026-03-09', tipo: 'cancelada', clase_id: 'c1', motivo: 'Mantenimiento aula' }
  ];

  const sesiones = fechasDeSesion(clases, '2026-03-02', '2026-03-15', excepciones);
  assert.equal(sesiones.length, 4);

  assert.equal(sesiones[0].fecha, '2026-03-02');
  assert.equal(sesiones[0].cancelada, false);

  assert.equal(sesiones[1].fecha, '2026-03-04');
  assert.equal(sesiones[1].feriado, true);
  assert.equal(sesiones[1].cancelada, true);
  assert.equal(sesiones[1].motivo, 'Aniversario');

  assert.equal(sesiones[2].fecha, '2026-03-09');
  assert.equal(sesiones[2].feriado, false);
  assert.equal(sesiones[2].cancelada, true);
  assert.equal(sesiones[2].motivo, 'Mantenimiento aula');

  assert.equal(sesiones[3].fecha, '2026-03-11');
  assert.equal(sesiones[3].cancelada, false);

  const total = totalSesiones(clases, '2026-03-02', '2026-03-15', excepciones);
  assert.equal(total, 2); // 4 programadas - 1 feriado - 1 cancelada = 2 válidas
});

test('resumenAsistencia calcula totales, porcentajes, faltas restantes y alertas', () => {
  // Curso con 20 sesiones en el ciclo
  // 1 clase por semana durante 20 semanas (Lun 2026-01-05 a Lun 2026-05-18)
  const clases = [
    { id: 'clase-alg', curso_id: 'curso-alg', dia_semana: 1, hora_inicio: '08:00', hora_fin: '11:00' }
  ];

  const asistencias = [
    { curso_id: 'curso-alg', fecha: '2026-01-05', estado: 'presente' },
    { curso_id: 'curso-alg', fecha: '2026-01-12', estado: 'falta' },
    { curso_id: 'curso-alg', fecha: '2026-01-19', estado: 'presente' },
    { curso_id: 'curso-alg', fecha: '2026-01-26', estado: 'falta' },
    { curso_id: 'curso-alg', fecha: '2026-02-02', estado: 'justificada' }
  ];

  // Total 20 sesiones posibles, 30% límite = 6 faltas permitidas
  const res = resumenAsistencia({
    cursoId: 'curso-alg',
    clasesDelCurso: clases,
    asistencias,
    cicloInicio: '2026-01-01',
    cicloFin: '2026-05-20',
    limiteFaltasPct: 30,
    fechaHoy: '2026-02-05' // 5 sesiones transcurridas
  });

  assert.equal(res.totalSesiones, 20);
  assert.equal(res.sesionesTranscurridas, 5);
  assert.equal(res.presentes, 2);
  assert.equal(res.faltas, 2);
  assert.equal(res.justificadas, 1);
  assert.equal(res.maxFaltasPermitidas, 6);
  assert.equal(res.faltasRestantes, 4);
  assert.equal(res.enRiesgo, false);
  // 2 / 20 = 10% del ciclo
  assert.equal(res.porcentajeFaltasCiclo, 10);
  assert.equal(res.umbralActual, 10);
});

test('detectarUmbralCruzado detecta 10%, 20% y 30% exactamente al traspasar', () => {
  const totalSesiones = 20; // 10% = 2 faltas, 20% = 4 faltas, 30% = 6 faltas

  // De 1 a 2 faltas: cruza 10%
  assert.equal(detectarUmbralCruzado(1, 2, totalSesiones), 10);

  // De 2 a 3 faltas: no cruza ningún umbral nuevo
  assert.equal(detectarUmbralCruzado(2, 3, totalSesiones), null);

  // De 3 a 4 faltas: cruza 20%
  assert.equal(detectarUmbralCruzado(3, 4, totalSesiones), 20);

  // De 5 a 6 faltas: cruza 30%
  assert.equal(detectarUmbralCruzado(5, 6, totalSesiones), 30);

  // Si salta de 1 a 4 (salta 10% y 20% a la vez): devuelve el más alto (20)
  assert.equal(detectarUmbralCruzado(1, 4, totalSesiones), 20);

  // Si totalSesiones es 0 o no aumentan faltas
  assert.equal(detectarUmbralCruzado(2, 2, totalSesiones), null);
  assert.equal(detectarUmbralCruzado(0, 1, 0), null);
});
