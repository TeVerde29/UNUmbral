# Observación — Pruebas profundas al código UNUmbral

**Fecha:** 2026-10-26
**Contexto:** Análisis de fallos reportados al probar la importación por QR y la exportación de horario `.json` en celular.

---

## Prompt del usuario

> Quiero que hagas unas pruebas profundas al código ya que parece que no funciona varias cosas que quiero que hagas un análisis, te contaré todo en orden:
>
> - Quiero hacer la prueba de que el QR funciona por ello generé el QR aquí (ahí ya tiene datos reales que son el json normal): https://unumbral.vercel.app/ y ahora con el código QR generado (adjuntado) lo intenté y luego de importarlo por el QR me dió los datos pero trae los datos como que duplicado creo o bueno creo que si trae pero no lo hace bien y como doble y se superponen se muestra mal, analiza todo el código detalladamente y encuentra el porque sucede eso, no toques código aún
> - ahora otra cosa, no se genera el .json en el celular, ya busqué de pies a cabeza en todo lado pero en el celular no se genera ni en registro del chrome

### Archivos adjuntos (copiados en esta carpeta)

1. `UNUmbral_Horario_2026-10-26.json` — horario exportado con datos reales correctos (formato `unumbral-horario-compartido`).
2. `UNUmbral_Horario_2026-10-26 - después.json` — horario generado después en el celular; contiene cursos numéricos `"0"` a `"7"` y clases que apuntan a esos nombres.
3. Imagen del código QR generado desde `https://unumbral.vercel.app/` (adjunta en la conversación).

### Capturas de pantalla adjuntas

- **Vista Día:** materias mostradas como `"1"`, `"4"`, `"2"` en lugar de nombres reales.
- **Parrilla Semanal:** bloques repetidos/superpuestos en varios días con materias numéricas `"1"`, `"4"`, `"7"`, `"2"`, `"3"`, `"6"`, `"8"`, `"5"`.
- **Vista Cursos:** cursos `"0"` a `"7"` sin profesor ni aula, mezclados con los cursos reales.
- **Modal de notas:** curso `"0"` sin datos.
- **Vista Cursos (correcta):** cursos reales con profesor, aula y color.
- **Buscador de archivos del celular:** sólo aparece una carpeta `UNUmbral`, no el `.json` de hoy.

---

## Respuesta del asistente

### Problema 1: Duplicación y superposición al importar por QR

#### Cómo funciona la exportación QR (`openModalQrSchedule`, línea 3244 de `app.js`)

1. Lee **todos** los cursos y clases de IndexedDB del dispositivo origen.
2. Deduplica cursos por nombre (case-insensitive).
3. Deduplica clases por la tupla `(curso_id, día, hora_inicio, hora_fin)`.
4. Construye el objeto `horarioCompartido` con:
   - `cursos`: lista de cursos con sus datos (nombre, profesor, aula, color, créditos).
   - `clases`: lista de clases con `curso_id`, día, horas y aula.
5. Lo comprime con `comprimirHorarioParaQr()` de `lib/qr.js` y genera el QR.

#### Cómo funciona la importación QR (`procesarTextoQrEscaneado` → `ejecutarImportacionHorario`, líneas 3665 y 3705)

1. Descompone el QR y obtiene el objeto `horario` con `cursos` y `clases`.
2. Llama a `convertirFormatoPlano(data.clases, [], existentes, data.cursos)`.
3. Dentro de `convertirFormatoPlano` (línea 240):
   - Procesa `cursosSueltos` (los cursos del QR) y los crea si no existen por nombre.
   - Para cada clase, si trae `curso_id`, busca si ya existe un curso con ese ID o nombre en `cursosExistentes`.
   - Si lo encuentra, usa su ID interno. Si no, crea un curso nuevo.
   - **Después inserta TODO en IndexedDB sin verificar si esas clases ya existían.**

#### Causas probables de la duplicación

| Causa | Qué ocurre |
|-------|------------|
| **Falta de deduplicación al importar** | No se verifica si una clase con el mismo curso/día/hora ya existe antes de insertar. Si importas el mismo QR dos veces, las clases se duplican. |
| **Importar en el mismo dispositivo** | Si generas el QR y lo escaneas en el **mismo celular**, las clases ya existentes se vuelven a insertar con nuevos IDs (`uuid()`), creando duplicados en la parrilla. |
| **Cursos numéricos "fantasma" en el origen** | El celular tiene cursos llamados `"0"`, `"1"`, `"2"`... sin profesor ni aula. Las clases apuntan a esos nombres. Al exportar por QR, esos nombres viajan y al importar en otro dispositivo se recrean cursos vacíos con esos nombres. |
| **`normalizarNombre` no hace match exacto** | Si hay diferencias mínimas (espacios, tildes, mayúsculas) entre el nombre del curso en el QR y el que ya existe en el destino, `obtenerCurso` crea un curso duplicado en lugar de reutilizar el existente. |

#### Evidencia en las capturas

- **Vista Día:** muestra materias `"1"`, `"4"`, `"2"` en lugar de nombres reales.
- **Parrilla Semanal:** mismas horas repetidas en varios días con materias numéricas `"1"`, `"4"`, `"7"`, `"2"`, `"3"`, `"6"`, `"8"`, `"5"`. Evidencia clara de clases duplicadas o mal asociadas.
- **Vista Cursos:** cursos `"0"` a `"7"` sin profesor ni aula, mezclados con cursos reales.

#### ¿Por qué en PC funciona y en celular no?

Es probable que en la PC la base de datos tenga los cursos bien asociados (nombres reales), mientras que en el celular la IndexedDB tiene esos cursos numéricos "fantasma" y clases mal vinculadas. Cada dispositivo tiene su propia IndexedDB independiente.

---

### Problema 2: El archivo `.json` no se genera en el celular

#### Cómo funciona `exportScheduleForFriends` (línea 3153)

1. Lee cursos y clases.
2. **Si no hay datos**, muestra toast `"No hay cursos ni horario para compartir"` y **retorna sin generar nada**.
3. Crea un `Blob` con el JSON y dispara una descarga mediante `<a>.click()`.

#### Causas probables en móvil

| Causa | Qué ocurre |
|-------|------------|
| **Sin cursos o sin clases** | En el celular puede que no haya cursos/clases registrados, o que estén asociados a cursos numéricos vacíos. La función retorna antes de generar el archivo. |
| **Bloqueo de descarga del navegador móvil** | Chrome en Android (especialmente como PWA instalada) puede bloquear descargas automáticas disparadas por `<a>.click()` sin mostrar notificación. |
| **Archivo generado pero no visible** | El archivo puede estar en la carpeta `Descargas` del sistema, pero el buscador de archivos del celular no lo muestra por filtro de tipo o porque no refresca la vista. |
| **CSP (Content Security Policy)** | El encabezado de seguridad en `index.html` restringe ciertas operaciones, aunque en este caso la descarga es local (`Blob`) y no debería verse afectada. |

#### Evidencia

- El JSON de ayer (`UNUmbral_Horario_2026-10-26.json`) sí se generó y tiene datos correctos.
- El JSON de hoy (`UNUmbral_Horario_2026-10-26 - después.json`) se generó a las 16:27 pero con cursos numéricos `"0"`, `"1"`... porque en el celular esos son los datos que están en IndexedDB.

---

### Conclusión del análisis

El problema raíz de ambos síntomas es el mismo: **la base de datos del celular tiene cursos numéricos vacíos (`"0"`, `"1"`...) y clases asociadas a ellos en lugar de a los cursos reales**. Eso hace que:

1. El QR exporte datos incorrectos (nombres numéricos).
2. Al importar, se creen cursos y clases duplicados o mal asociados.
3. La exportación JSON pueda parecer que "no genera nada" si el celular no tiene datos válidos o si el navegador bloquea la descarga silenciosa.

---

### Propuesta de corrección

1. **Deduplicación al importar:** antes de insertar una clase, verificar si ya existe una con el mismo curso/día/hora y no duplicarla.
2. **Validación de cursos al exportar QR:** advertir o filtrar cursos sin nombre válido para evitar los cursos numéricos "fantasma".
3. **Mejora en la exportación JSON para móvil:** toast más claro antes y después de la descarga, y alternativa de copiar al portapapeles si la descarga automática falla.
4. **Limpieza opcional:** función para detectar y reportar cursos sin nombre válido.
