const test = require("node:test");
const assert = require("node:assert/strict");
const { parsearRutaDeepLink, ejecutarAccionDeepLink } = require("../lib/deeplink.js");

test("parsearRutaDeepLink reconoce URLs nativas unumbral:// y hashes web", () => {
  assert.equal(parsearRutaDeepLink("unumbral://nueva-tarea").accion, "nueva-tarea");
  assert.equal(parsearRutaDeepLink("unumbral://hoy").accion, "hoy");
  assert.equal(parsearRutaDeepLink("https://teverde29.github.io/unumbral/#nueva-tarea").accion, "nueva-tarea");
  assert.equal(parsearRutaDeepLink("#hoy").accion, "hoy");
  assert.equal(parsearRutaDeepLink("#horario").accion, "horario");
  assert.equal(parsearRutaDeepLink("unumbral://cursos").accion, "cursos");
  assert.equal(parsearRutaDeepLink("unumbral://tareas").accion, "tareas");
  assert.equal(parsearRutaDeepLink("unumbral://ajustes").accion, "ajustes");
  assert.equal(parsearRutaDeepLink("").accion, "ninguna");
  assert.equal(parsearRutaDeepLink(null).accion, "ninguna");
  assert.equal(parsearRutaDeepLink("unumbral://ruta-desconocida").accion, "ninguna");
});

test("ejecutarAccionDeepLink invoca el callback correspondiente", () => {
  let tareaAbierta = false;
  let hoyAbierto = false;

  const handlers = {
    "nueva-tarea": () => { tareaAbierta = true; },
    "hoy": () => { hoyAbierto = true; }
  };

  const ruta1 = parsearRutaDeepLink("unumbral://nueva-tarea");
  const ejecutado1 = ejecutarAccionDeepLink(ruta1, handlers);
  assert.equal(ejecutado1, true);
  assert.equal(tareaAbierta, true);
  assert.equal(hoyAbierto, false);

  const ruta2 = parsearRutaDeepLink("unumbral://hoy");
  const ejecutado2 = ejecutarAccionDeepLink(ruta2, handlers);
  assert.equal(ejecutado2, true);
  assert.equal(hoyAbierto, true);
});
