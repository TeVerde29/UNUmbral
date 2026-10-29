const test = require("node:test");
const assert = require("node:assert/strict");
const {
  PREFIJO_QR,
  utf8ToBase64Url,
  base64UrlToUtf8,
  comprimirHorarioParaQr,
  descomprimirHorarioDeQr,
  ensamblarQrMultiparte
} = require("../lib/qr.js");

test("utf8ToBase64Url y base64UrlToUtf8 conservan caracteres especiales y tildes", () => {
  const original = "Cálculo Integral, Programación & Álgebra Lineal — ¡Éxito! 🚀";
  const b64 = utf8ToBase64Url(original);
  assert.ok(!b64.includes("+"));
  assert.ok(!b64.includes("/"));
  assert.ok(!b64.includes("="));
  const recovered = base64UrlToUtf8(b64);
  assert.equal(recovered, original);
});

test("comprimirHorarioParaQr y descomprimirHorarioDeQr completan roundtrip exacto", () => {
  const horario = {
    tipo: "unumbral-horario-compartido",
    version: 2,
    cursos: [
      { id: "c1", nombre: "Cálculo II", color: "#bbf7d0", aula: "Aula 302", profesor: "Dr. Pérez", creditos: 4 },
      { id: "c2", nombre: "Física Médica", color: "#fef08a", aula: "Lab 2", profesor: "Ing. Gómez", creditos: 3 }
    ],
    clases: [
      { curso_id: "c1", dia_semana: "lun", hora_inicio: "08:00", hora_fin: "10:00", aula: "Aula 302" },
      { curso_id: "c1", dia_semana: "mie", hora_inicio: "08:00", hora_fin: "10:00", aula: "Aula 302" },
      { curso_id: "c2", dia_semana: "mar", hora_inicio: "10:00", hora_fin: "12:00", aula: "Lab 2" }
    ]
  };

  const qrList = comprimirHorarioParaQr(horario);
  assert.equal(qrList.length, 1);
  assert.ok(qrList[0].startsWith(PREFIJO_QR));

  const resultado = descomprimirHorarioDeQr(qrList[0]);
  assert.equal(resultado.esMultiparte, false);
  assert.equal(resultado.horario.tipo, "unumbral-horario-compartido");
  assert.equal(resultado.horario.version, 2);
  assert.equal(resultado.horario.cursos.length, 2);
  assert.equal(resultado.horario.cursos[0].nombre, "Cálculo II");
  assert.equal(resultado.horario.cursos[0].creditos, 4);
  assert.equal(resultado.horario.clases.length, 3);
  assert.equal(resultado.horario.clases[0].hora_inicio, "08:00");
});

test("horario típico universitario de 6 cursos y 15 clases cabe en un solo QR", () => {
  const cursos = [];
  const clases = [];
  const dias = ["lun", "mar", "mie", "jue", "vie"];

  for (let i = 1; i <= 6; i++) {
    const id = `c_${i}`;
    cursos.push({
      id,
      nombre: `Curso Universitario ${i}`,
      color: "#bbf7d0",
      aula: `Aula ${100 + i}`,
      profesor: `Profesor ${i}`,
      creditos: 3 + (i % 2)
    });
    // 3 clases por curso = 18 clases en total
    for (let k = 0; k < 3; k++) {
      const dia = dias[(i + k) % 5];
      const hIni = String(8 + k * 2).padStart(2, "0") + ":00";
      const hFin = String(10 + k * 2).padStart(2, "0") + ":00";
      clases.push({
        curso_id: id,
        dia_semana: dia,
        hora_inicio: hIni,
        hora_fin: hFin,
        aula: ""
      });
    }
  }

  const horario = {
    tipo: "unumbral-horario-compartido",
    version: 2,
    cursos,
    clases
  };

  // Con límite estándar de 1600 caracteres, debe caber en 1 solo QR
  const qrList = comprimirHorarioParaQr(horario, 1600);
  assert.equal(qrList.length, 1);
  assert.ok(qrList[0].length < 1600);

  const res = descomprimirHorarioDeQr(qrList[0]);
  assert.equal(res.horario.cursos.length, 6);
  assert.equal(res.horario.clases.length, 18);
});

test("genera y ensambla QR multiparte cuando excede el límite por código", () => {
  const horario = {
    tipo: "unumbral-horario-compartido",
    version: 2,
    cursos: [
      { id: "c1", nombre: "Curso 1", color: "#bbf7d0", aula: "", profesor: "", creditos: 3 },
      { id: "c2", nombre: "Curso 2", color: "#fef08a", aula: "", profesor: "", creditos: 3 }
    ],
    clases: [
      { curso_id: "c1", dia_semana: "lun", hora_inicio: "08:00", hora_fin: "10:00", aula: "" }
    ]
  };

  // Forzar límite pequeño (40 caracteres por QR) para generar multiparte
  const partes = comprimirHorarioParaQr(horario, 40);
  assert.ok(partes.length >= 2);
  assert.ok(partes[0].startsWith("UNU1:1/"));

  // Ensamblado parcial (faltan partes)
  const parcial = ensamblarQrMultiparte([partes[0]]);
  assert.equal(parcial.completo, false);
  assert.ok(parcial.faltantes.length > 0);

  // Ensamblado completo
  const completo = ensamblarQrMultiparte(partes);
  assert.equal(completo.completo, true);
  assert.equal(completo.horario.cursos.length, 2);
  assert.equal(completo.horario.cursos[0].nombre, "Curso 1");
});

test("rechaza formatos corruptos o sin prefijo UNU1:", () => {
  assert.throws(() => descomprimirHorarioDeQr("OTRO_FORMATO:abc"), /prefijo UNU1:/);
  assert.throws(() => descomprimirHorarioDeQr("UNU1:contenido_invalido_no_json"), /decodificando|incompatible|corrupta/);
});

test("comprimirHorarioParaQr y descomprimirHorarioDeQr con UUIDs reales conservan vinculación de clases", () => {
  const cursos = [
    { id: "e88d1d8a-9e12-4f7b-bf38-a1489eef3bf4", nombre: "Auditoría y Seguridad", color: "#F5D0FE", aula: "Lab 1", profesor: "Ing. Ferrari", creditos: 3 },
    { id: "7c132519-7578-4bfb-92ea-2849890a8845", nombre: "Sistemas Distribuidos", color: "#FECACA", aula: "Lab 2", profesor: "Mg. Bardales", creditos: 4 }
  ];
  const clases = [
    { curso_id: "e88d1d8a-9e12-4f7b-bf38-a1489eef3bf4", dia_semana: "MIERCOLES", hora_inicio: "14:50", hora_fin: "16:30", aula: "Lab 1" },
    { curso_id: "7c132519-7578-4bfb-92ea-2849890a8845", dia_semana: "JUEVES", hora_inicio: "19:30", hora_fin: "21:10", aula: "Lab 2" }
  ];

  const qrList = comprimirHorarioParaQr({ tipo: "unumbral-horario-compartido", version: 2, cursos, clases });
  assert.equal(qrList.length, 1);

  const res = descomprimirHorarioDeQr(qrList[0]);
  assert.equal(res.horario.cursos.length, 2);
  assert.equal(res.horario.cursos[0].nombre, "Auditoría y Seguridad");
  assert.equal(res.horario.cursos[1].nombre, "Sistemas Distribuidos");
  // Los IDs asignados en descompresión son compactos ("0", "1")
  assert.equal(res.horario.cursos[0].id, "0");
  assert.equal(res.horario.cursos[1].id, "1");
  // Las clases apuntan congruentemente a "0" y "1"
  assert.equal(res.horario.clases[0].curso_id, "0");
  assert.equal(res.horario.clases[1].curso_id, "1");
});

test("comprimirHorarioParaQr v3 incluye ciclo académico y notas de evaluación", () => {
  const ciclo = {
    nombre: "Ciclo 2026-II",
    fecha_inicio: "2026-08-17",
    fecha_fin: "2026-12-13"
  };
  const cursos = [
    {
      id: "curso-sistemas-1",
      nombre: "Inteligencia Artificial",
      color: "#BAE6FD",
      aula: "Lab 4",
      profesor: "Dr. Sánchez",
      creditos: 4,
      evaluacion: {
        parcial: 15.5,
        final: null,
        practicas: [
          { id: "p1", titulo: "Práctica 1", nota: 16 },
          { id: "p2", titulo: "Práctica 2", nota: 14 }
        ]
      }
    }
  ];
  const clases = [
    {
      curso_id: "curso-sistemas-1",
      dia_semana: "LUNES",
      hora_inicio: "08:00",
      hora_fin: "10:00",
      aula: "Lab 4"
    }
  ];

  const payload = {
    tipo: "unumbral-horario-compartido",
    version: 3,
    ciclo,
    cursos,
    clases,
    asistencias: [
      { curso_id: "curso-sistemas-1", fecha: "2026-09-07", estado: "falta" },
      { curso_id: "curso-sistemas-1", fecha: "2026-09-14", estado: "justificada" }
    ]
  };

  const qrList = comprimirHorarioParaQr(payload);
  assert.equal(qrList.length, 1);

  const res = descomprimirHorarioDeQr(qrList[0]);
  assert.equal(res.horario.version, 3);
  assert.ok(res.horario.ciclo);
  assert.equal(res.horario.ciclo.nombre, "Ciclo 2026-II");
  assert.equal(res.horario.ciclo.fecha_inicio, "2026-08-17");
  assert.equal(res.horario.ciclo.fecha_fin, "2026-12-13");
  assert.equal(res.horario.cursos.length, 1);
  assert.equal(res.horario.cursos[0].nombre, "Inteligencia Artificial");
  assert.equal(res.horario.cursos[0].evaluacion.parcial, 15.5);
  assert.equal(res.horario.cursos[0].evaluacion.final, null);
  assert.equal(res.horario.cursos[0].evaluacion.practicas.length, 2);
  assert.equal(res.horario.cursos[0].evaluacion.practicas[0].nota, 16);
  assert.equal(res.horario.asistencias.length, 2);
  assert.equal(res.horario.asistencias[0].curso_id, "0");
  assert.equal(res.horario.asistencias[0].fecha, "2026-09-07");
  assert.equal(res.horario.asistencias[0].estado, "falta");
  assert.equal(res.horario.asistencias[1].estado, "justificada");
});
