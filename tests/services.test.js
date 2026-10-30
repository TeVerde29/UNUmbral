const test = require("node:test");
const assert = require("node:assert/strict");

const TareasService = require("../lib/services/tareasService");
const CursosService = require("../lib/services/cursosService");
const AsistenciaService = require("../lib/services/asistenciaService");

function crearMockDb() {
  const tablas = {
    tareas: new Map(),
    cursos: new Map(),
    clases: new Map(),
    asistencia: new Map()
  };

  function crearStore(nombre) {
    return {
      async toArray() {
        return Array.from(tablas[nombre].values());
      },
      async get(id) {
        return tablas[nombre].get(id) || null;
      },
      async put(item) {
        tablas[nombre].set(item.id, { ...item });
        return item.id;
      },
      async update(id, cambios) {
        const item = tablas[nombre].get(id);
        if (!item) return 0;
        tablas[nombre].set(id, { ...item, ...cambios });
        return 1;
      },
      async delete(id) {
        return tablas[nombre].delete(id);
      },
      where(campo) {
        return {
          equals(valor) {
            return {
              async toArray() {
                return Array.from(tablas[nombre].values()).filter(x => x[campo] === valor);
              }
            };
          }
        };
      }
    };
  }

  return {
    tareas: crearStore("tareas"),
    cursos: crearStore("cursos"),
    clases: crearStore("clases"),
    asistencia: crearStore("asistencia")
  };
}

test("TareasService gestiona el ciclo de vida de tareas limpiamente", async () => {
  const db = crearMockDb();

  // Crear tarea
  const t = await TareasService.crear(db, {
    titulo: "  Informe Final de Tesis  ",
    materia: "Tesis II",
    importancia: 5,
    fecha_limite: "2026-11-15T23:59:00"
  });
  assert.equal(t.titulo, "Informe Final de Tesis");
  assert.equal(t.completada, false);
  assert.ok(t.id);

  // Obtener por ID
  const recuperada = await TareasService.obtenerPorId(db, t.id);
  assert.equal(recuperada.titulo, "Informe Final de Tesis");

  // Alternar estado
  const nuevoEstado = await TareasService.alternarEstado(db, t.id);
  assert.equal(nuevoEstado, true);
  const completada = await TareasService.obtenerPorId(db, t.id);
  assert.equal(completada.completada, true);

  // Contar pendientes
  const pendientes = await TareasService.contarPendientes(db);
  assert.equal(pendientes, 0);

  // Eliminar
  const eliminada = await TareasService.eliminar(db, t.id);
  assert.equal(eliminada, true);
  assert.equal(await TareasService.obtenerPorId(db, t.id), null);
});

test("CursosService gestiona cursos y elimina en cascada las clases vinculadas", async () => {
  const db = crearMockDb();

  // Crear curso
  const c = await CursosService.crear(db, {
    nombre: "Ingeniería de Software",
    creditos: 4,
    color: "#BBF7D0"
  });
  assert.equal(c.nombre, "Ingeniería de Software");
  assert.equal(c.creditos, 4);

  // Añadir una clase vinculada a ese curso
  await db.clases.put({
    id: "clase-101",
    curso_id: c.id,
    materia: c.nombre,
    dia: "LUNES",
    hora_inicio: "08:00",
    hora_fin: "10:00"
  });

  const clasesAntes = await db.clases.toArray();
  assert.equal(clasesAntes.length, 1);

  // Eliminar curso debe eliminar sus clases vinculadas
  await CursosService.eliminar(db, c.id);
  assert.equal(await CursosService.obtenerPorId(db, c.id), null);

  const clasesDespues = await db.clases.toArray();
  assert.equal(clasesDespues.length, 0);
});

test("AsistenciaService registra faltas y filtra por clase", async () => {
  const db = crearMockDb();

  const f1 = await AsistenciaService.registrarFalta(db, "clase-abc", "2026-10-15", "Salud");
  assert.equal(f1.clase_id, "clase-abc");
  assert.equal(f1.estado, "FALTA");

  const f2 = await AsistenciaService.registrarFalta(db, "clase-xyz", "2026-10-16", "");

  const faltasClaseAbc = await AsistenciaService.obtenerPorClase(db, "clase-abc");
  assert.equal(faltasClaseAbc.length, 1);
  assert.equal(faltasClaseAbc[0].id, f1.id);

  const todas = await AsistenciaService.obtenerTodas(db);
  assert.equal(todas.length, 2);

  await AsistenciaService.eliminar(db, f1.id);
  const restantes = await AsistenciaService.obtenerTodas(db);
  assert.equal(restantes.length, 1);
});
