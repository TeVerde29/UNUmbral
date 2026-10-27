const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calcularFinCiclo17Semanas,
  proyectarSemanasCiclo,
  parsearDiaSemana,
  fechasDeSesion,
  resumenAsistencia,
  detectarUmbralCruzado
} = require('../lib/asistencia.js');

test('calcularFinCiclo17Semanas calcula exactamente 17 semanas finalizando en domingo', () => {
  // Lunes 16 de marzo de 2026
  const inicio = '2026-03-16';
  const fin = calcularFinCiclo17Semanas(inicio);

  // 17 semanas = 17 * 7 = 119 días. Del lunes día 1 al domingo día 119 hay 118 días de diferencia.
  // 16 marzo + 15 días marzo = 31 marzo (fin de semana 2 + 1 día)
  // Fin debe ser domingo 12 de julio de 2026
  assert.equal(fin, '2026-07-12');

  const dtInicio = new Date(2026, 2, 16);
  assert.equal(dtInicio.getDay(), 1, 'Inicio debe ser lunes');

  const dtFin = new Date(2026, 6, 12);
  assert.equal(dtFin.getDay(), 0, 'Fin debe ser domingo');
});

test('proyectarSemanasCiclo genera 17 semanas con Semana 8 de exámenes parciales y Semana 17 finales', () => {
  const semanas = proyectarSemanasCiclo('2026-03-16', '2026-05-06'); // hoy está en semana 8 (04 May al 10 May)
  assert.equal(semanas.length, 17);

  // Semana 1
  assert.equal(semanas[0].numero, 1);
  assert.equal(semanas[0].inicio, '2026-03-16');
  assert.equal(semanas[0].fin, '2026-03-22');
  assert.equal(semanas[0].esExamenParcial, false);

  // Semana 8 (Exámenes parciales)
  const sem8 = semanas[7];
  assert.equal(sem8.numero, 8);
  assert.equal(sem8.esExamenParcial, true);
  assert.equal(sem8.inicio, '2026-05-04');
  assert.equal(sem8.fin, '2026-05-10');
  assert.equal(sem8.esActual, true); // ya que hoy es 2026-05-06

  // Semana 17 (Exámenes finales)
  const sem17 = semanas[16];
  assert.equal(sem17.numero, 17);
  assert.equal(sem17.esExamenFinal, true);
  assert.equal(sem17.inicio, '2026-07-06');
  assert.equal(sem17.fin, '2026-07-12');
});

test('asistencia proyecta correctamente sesiones con días en texto (LUNES, VIERNES) y detecta umbrales 10%, 20%, 30%', () => {
  const clases = [
    { id: 'clase-1', curso_id: 'curso-alg', dia_semana: 'LUNES', hora_inicio: '08:00', hora_fin: '10:00' },
    { id: 'clase-2', curso_id: 'curso-alg', dia_semana: 'VIERNES', hora_inicio: '10:00', hora_fin: '12:00' }
  ];

  // Ciclo de 17 semanas: 2 clases por semana = 34 sesiones en total
  const cicloInicio = '2026-03-16';
  const cicloFin = '2026-07-12';

  const resInicial = resumenAsistencia({
    cursoId: 'curso-alg',
    clasesDelCurso: clases,
    asistencias: [],
    cicloInicio,
    cicloFin,
    excepciones: [],
    limiteFaltasPct: 30
  });

  assert.equal(resInicial.totalSesiones, 34);
  assert.equal(resInicial.faltas, 0);
  // 30% de 34 = floor(10.2) = 10 faltas permitidas
  assert.equal(resInicial.maxFaltasPermitidas, 10);
  assert.equal(resInicial.faltasRestantes, 10);

  // Simular cruce de umbral 10% (34 * 0.10 = 3.4 -> al llegar a 4 faltas cruza el 10%)
  const u10 = detectarUmbralCruzado(3, 4, 34, [10, 20, 30]);
  assert.equal(u10, 10);

  // Simular cruce de umbral 20% (34 * 0.20 = 6.8 -> al llegar a 7 faltas cruza el 20%)
  const u20 = detectarUmbralCruzado(6, 7, 34, [10, 20, 30]);
  assert.equal(u20, 20);

  // Simular cruce de umbral 30% (34 * 0.30 = 10.2 -> al llegar a 11 faltas cruza el 30%)
  const u30 = detectarUmbralCruzado(10, 11, 34, [10, 20, 30]);
  assert.equal(u30, 30);
});

test('asistencia por defecto: sesiones pasadas cuentan como asistidas salvo registro expreso de falta', () => {
  const clases = [
    { id: 'clase-bd', curso_id: 'curso-bd', dia_semana: 'MARTES', hora_inicio: '14:00', hora_fin: '17:00' }
  ];
  // 3 martes: 2026-03-17, 2026-03-24, 2026-03-31
  // Si hoy es 2026-04-02:
  // - 2026-03-17: sin registro -> asistido por defecto
  // - 2026-03-24: falta explícita -> falta
  // - 2026-03-31: sin registro -> asistido por defecto
  const res = resumenAsistencia({
    cursoId: 'curso-bd',
    clasesDelCurso: clases,
    asistencias: [
      { curso_id: 'curso-bd', fecha: '2026-03-24', estado: 'falta' }
    ],
    cicloInicio: '2026-03-16',
    cicloFin: '2026-04-30',
    limiteFaltasPct: 30,
    fechaHoy: '2026-04-02'
  });

  assert.equal(res.sesionesTranscurridas, 3);
  assert.equal(res.faltas, 1);
  assert.equal(res.presentes, 2); // 2 pasadas por defecto
});
