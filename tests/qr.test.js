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
