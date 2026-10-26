# Umbral — Horario Universitario & Organizador de Tareas Offline

> Aplicación web progresiva (PWA) 100% offline para la gestión de horarios universitarios, control en vivo de materias y seguimiento priorizado de tareas académicas sin servidores ni recolección de datos.

[![Estado: Activo](https://img.shields.io/badge/Estado-Activo-294635?style=flat-square)](https://github.com/TeVerde29/app-ricra)
[![PWA: Offline-First](https://img.shields.io/badge/PWA-Offline--First-AFC49A?style=flat-square&logo=pwa&logoColor=111A13)](https://teverde29.github.io/app-ricra/)
[![Dexie.js: 4.4.4](https://img.shields.io/badge/Dexie.js-v4.4.4-4F7256?style=flat-square)](https://dexie.org/)
[![JavaScript: ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-829B78?style=flat-square)](LICENSE)

Los estudiantes universitarios registran sus asignaturas semestrales con aulas, docentes y colores de referencia, consultan en tiempo real la materia en curso o siguiente con cuenta regresiva en el panel Hoy, gestionan entregas mediante una escala de importancia de 1 a 5, visualizan su distribución semanal mediante una parrilla académica fiel con bloques continuos (`rowspan`), y comparten su horario con compañeros mediante archivos JSON livianos sin exponer notas ni tareas personales.

## Tabla de contenidos

- [Descripción](#descripción)
- [Acceso y Producción](#acceso-y-producción)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [Formatos de Intercambio JSON](#formatos-de-intercambio-json)
- [Instalación y Despliegue Local](#instalación-y-despliegue-local)
- [Flujo Básico de Uso](#flujo-básico-de-uso)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Descripción

En los campus universitarios, bibliotecas y transporte público, la conectividad a Internet suele ser inestable, lenta o inexistente. Las plataformas institucionales tradicionales presentan interfaces saturadas, demandan autenticación recurrente y no responden a las necesidades inmediatas del estudiante en tránsito: saber con rapidez en qué aula se dicta la clase actual, cuántos minutos restan para que finalice o cuáles son las entregas críticas de las próximas 48 horas. Al mismo tiempo, la mayoría de aplicaciones comerciales de organización imponen cuentas en la nube, suscripciones de pago y sincronizaciones externas innecesarias para datos estrictamente personales.

Umbral resuelve esta problemática mediante una arquitectura cliente pura (offline-first) empaquetada como Progressive Web App (PWA). La aplicación almacena la totalidad del horario, los registros de aula, profesores y el inventario de tareas académicas directamente en el dispositivo a través de IndexedDB, orquestado con Dexie.js v4.4.4. Su ciclo de vida es administrado por un Service Worker que precachea los recursos esenciales, garantizando disponibilidad inmediata sin depender de servidores de aplicaciones ni conexiones de red.

El diseño visual aplica el sistema **Design Ricra** ("Tea Green") en combinación con los principios de Apple Human Interface Design. La interfaz prescinde de emojis convencionales, empleando iconografía SVG vectorial técnica, componentes translúcidos con desenfoque de fondo (`backdrop-filter`), una parrilla semanal académica con tarjetas que abarcan la duración real de cada materia (`rowspan`) y navegación lateral adaptada para dispositivos móviles mediante cabecera y columna de hora fijas (`sticky`), notificaciones contextuales y doble tema cromático (Claro y Oscuro) con persistencia en `localStorage`.

---

## Acceso y Producción

| Capa | Plataforma / Enlace | Descripción |
|---|---|---|
| Producción (Web / PWA) | [https://teverde29.github.io/app-ricra/](https://teverde29.github.io/app-ricra/) | Despliegue en GitHub Pages con soporte de instalación en pantalla de inicio. |
| Repositorio de Código | [https://github.com/TeVerde29/app-ricra](https://github.com/TeVerde29/app-ricra) | Código fuente completo, control de versiones y trazabilidad de cambios. |

---

## Características Principales

- **Dashboard en tiempo real ("Hoy"):** El componente `renderLiveStatusCard` contrasta la hora del sistema contra los bloques de clase programados. Identifica automáticamente si existe una materia en curso (desplegando aula, profesor, minutos restantes y barra de avance porcentual), calcula la cuenta regresiva hacia la siguiente materia (`en Xh Ym`) o notifica la finalización de la jornada lectiva.
- **Parrilla semanal académica con duración real (`rowspan`):** La vista matricial modela el horario universitario exacto. Cada asignatura ocupa un bloque continuo que abarca su horario completo (sin fragmentaciones artificiales ni horas en blanco intermedias), con paleta cromática de alto contraste, columna de hora fija (`sticky`), selector rápido de días para móvil y agrupación opcional de horas de receso.
- **Doble modalidad de horario:** Alterna entre una vista de agenda cronológica día a día (con selector de pestañas de Lunes a Domingo) y la parrilla matricial semanal (`renderMatrixTableHTML`).
- **Detección y prevención estricta de cruces horarios:** Durante el guardado de una clase en el formulario modal, la función `overlaps` comprueba colisiones temporales contra las asignaturas existentes en el mismo día, bloqueando el registro e indicando el nombre y horario del conflicto antes de escribir en IndexedDB.
- **Escala de criticidad de entregas (1 a 5):** Clasificación objetiva de tareas con etiquetas pedagógicas: Nivel 1 (Rutina / lecturas menores), Nivel 2 (Leve / consultas), Nivel 3 (Media / guías o cuestionarios semanales), Nivel 4 (Alta / prácticas calificadas e informes) y Nivel 5 (Crítica / exámenes parciales, finales o sustentaciones).
- **Radar de evaluaciones urgentes:** Algoritmo que filtra y prioriza automáticamente tareas pendientes con vencimiento dentro de las 48 horas o con nivel de importancia 4 o 5, posicionándolas en la cabecera de la vista principal.
- **Filtros reactivos y búsqueda instantánea:** Filtrado de tareas por chips de estado (Pendientes, Críticas Nivel 4–5, Próximas $\le 72$h, Todas, Completadas), filtro por materia mediante desplegable autogenerado y caja de búsqueda por concordancia de texto en títulos y notas.
- **Exportación selectiva para compañeros:** Genera un archivo `.json` (`umbral-horario-compartido`) que contiene únicamente la distribución de materias, horarios, aulas y docentes, omitiendo intencionalmente tareas y apuntes privados para su intercambio libre en el aula.
- **Copia de seguridad total y restauración:** Exporta un respaldo integral (`umbral-backup-total`) con todas las colecciones de la base de datos y permite su restauración con diálogo de confirmación y sanitización de estructura.
- **Conjunto de datos de demostración universitaria:** Función para inicializar un semestre modelo basado en mallas académicas reales de ingeniería de sistemas e informática (IA, Sistemas Distribuidos, Auditoría, Formulación de Proyectos, Prácticas Pre Profesionales y Tópicos Avanzados).
- **Doble tema con paleta cromática Rice/Matcha:** Soporta tema oscuro ("Apple Obsidian Matcha", fondo `#0D140F`, tarjetas `#152118`) y tema claro ("Apple Frosted Tea Green", fondo `#F4F6EE`, tarjetas blancas translúcidas), actualizando dinámicamente el color del navegador en `<meta name="theme-color">`.

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Función en el Sistema |
|---|---|---|---|
| Lógica y Control | JavaScript (ES6+ Vanilla) | Estándar | Gestión del estado global, cálculo de bloques horarios `rowspan`, validación de formularios y manipulaciones del DOM sin frameworks externos. |
| Persistencia Local | Dexie.js | 4.4.4 | Capa de abstracción sobre IndexedDB para transacciones asíncronas de almacenamiento estructurado (`UmbralDB`). |
| Presentación y UI | CSS3 Nativo | Estándar | Sistema de diseño Design Ricra, variables CSS, layout con CSS Grid / Flexbox, filtros de desenfoque (`backdrop-filter`) y media queries responsivas. |
| Motor Offline | Service Worker API | Cache API v1 | Interceptación de solicitudes de red con estrategia Cache First para garantizar ejecución offline total (`sw.js`). |
| Distribución Móvil | Web App Manifest | Estándar | Configuración para instalación PWA nativa en dispositivos móviles y de escritorio (`standalone`, orientación vertical). |
| Librerías Auxiliares | Chart.js / Editor.js | 4.5.1 / Bundled | Recursos locales empaquetados en `lib/` para futuros módulos de métricas y notas enriquecidas sin dependencias de CDN. |

---

## Arquitectura del Sistema

### Estructura del Repositorio

```text
umbral/
├── app.js               # Lógica del cliente, estado en memoria, eventos de DOM y consultas Dexie
├── estilos.css          # Tokens Design Ricra (Tea Green), temas claro/oscuro y componentes UI
├── icon.svg             # Isotipo vectorial para favicon, barra superior y lanzador PWA
├── index.html           # Estructura semántica, paneles de vistas, modales y navegación
├── LICENSE              # Licencia de distribución del proyecto (MIT)
├── manifest.json        # Manifiesto PWA para instalación standalone en escritorio y móviles
├── README.md            # Documentación técnica del sistema
├── sw.js                # Service Worker con estrategia de caché local (umbral-ricra-v1)
└── lib/
    ├── chart.min.js     # Librería Chart.js v4.5.1 empaquetada localmente
    ├── dexie.min.js     # Motor IndexedDB Dexie.js v4.4.4 empaquetado para uso 100% offline
    └── editor.min.js    # Editor.js empaquetado localmente para notas enriquecidas
```

### Decisiones de Diseño

1. **Arquitectura cliente estricta (Zero-Backend):** Todos los datos residen en el dispositivo del usuario. No se transmiten credenciales ni registros a servidores externos, eliminando costos de infraestructura, problemas de latencia y riesgos de privacidad.
2. **Single Page Application sin herramientas de compilación (No-Build SPA):** No se requiere Node.js, Webpack, Vite ni procesos de transpilación para ejecutar o modificar la aplicación. Los archivos se sirven directamente como código web estándar.
3. **Persistencia garantizada y migración automática:** En el arranque (`init()`), la aplicación solicita almacenamiento persistente mediante `navigator.storage.persist()`. Además, incluye rutina de compatibilidad hacia atrás que migra automáticamente registros desde `UniFlowDB` a `UmbralDB` si se detecta una instalación previa.
4. **Separación de responsabilidades en datos:** Las clases y las tareas se almacenan en tablas independientes dentro de IndexedDB. Las tareas se asocian a las asignaturas por concordancia textual, permitiendo que existan tareas de índole "General" sin vincularse a una materia obligatoriamente.
5. **Aislamiento de la caché de red:** El archivo `sw.js` declara un prefijo `umbral-ricra-v1`. Durante el evento `activate`, cualquier versión anterior de la caché se purga de forma atómica para evitar colisiones de archivos desactualizados tras un despliegue.

---

## Modelo de Datos

La aplicación utiliza la base de datos IndexedDB denominada `UmbralDB` configurada en `app.js` mediante Dexie.js:

```javascript
const db = new Dexie("UmbralDB");
db.version(1).stores({
  clases: "id, materia, dia_semana, hora_inicio, hora_fin, aula, profesor",
  tareas: "id, titulo, materia, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
});
```

### Tabla `clases`

| Campo | Tipo | Clave / Índice | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Primaria | Identificador único del bloque de clase (`uuid()`). |
| `materia` | String | Indexado | Nombre de la asignatura (ej. "Inteligencia Artificial y Sistemas Expertos"). |
| `dia_semana` | String | Indexado | Día en mayúsculas: `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `VIERNES`, `SABADO`, `DOMINGO`. |
| `hora_inicio` | String | Indexado | Formato `HH:MM` en 24 horas (ej. `"16:30"`). |
| `hora_fin` | String | Indexado | Formato `HH:MM` en 24 horas (ej. `"19:00"`). |
| `aula` | String | Opcional | Identificador de aula o laboratorio (ej. `"Aula 1"`). |
| `profesor` | String | Opcional | Nombre del catedrático o docente responsable (ej. `"Dr. Agurto"`). |
| `color` | String | Atributo | Código hexadecimal de color para acento en tarjetas y matriz (ej. `"#38BDF8"`). |
| `notas` | String | Atributo | Enlaces o anotaciones específicas del curso. |

### Tabla `tareas`

| Campo | Tipo | Clave / Índice | Descripción |
|---|---|---|---|
| `id` | String (UUID) | Primaria | Identificador único de la tarea (`uuid()`). |
| `titulo` | String | Indexado | Descripción concreta de la entrega o examen. |
| `materia` | String | Indexado | Asignatura relacionada o `"General"`. |
| `fecha_limite` | String | Indexado | Fecha y hora en formato ISO local (`YYYY-MM-DDTHH:MM`). |
| `importancia` | Number (1–5) | Indexado | Nivel numérico de criticidad (1: Rutina a 5: Crítica). |
| `completada` | Boolean | Indexado | Estado de finalización (`true` o `false`). |
| `fecha_creacion`| String | Atributo | Marca temporal ISO de creación del registro. |
| `notas` | String | Atributo | Instrucciones detalladas, integrantes de equipo o pautas. |

---

## Formatos de Intercambio JSON

### 1. Horario Compartido (`umbral-horario-compartido`)

Estructura generada al pulsar **Exportar Horario (.json)**. No incluye tareas, notas privadas ni estados de usuario:

```json
{
  "tipo": "umbral-horario-compartido",
  "version": 1,
  "fecha_creacion": "2026-10-26T01:30:00.000Z",
  "clases": [
    {
      "materia": "Inteligencia Artificial y Sistemas Expertos",
      "dia_semana": "LUNES",
      "hora_inicio": "16:30",
      "hora_fin": "19:00",
      "aula": "Aula 1",
      "profesor": "Dr. Agurto",
      "color": "#38BDF8",
      "notas": ""
    }
  ]
}
```

### 2. Copia de Seguridad Total (`umbral-backup-total`)

Estructura generada al pulsar **Crear Backup Completo**, empleada para respaldar o migrar de dispositivo:

```json
{
  "tipo": "umbral-backup-total",
  "version": 1,
  "fecha_creacion": "2026-10-26T01:30:00.000Z",
  "clases": [
    {
      "id": "id-1729891200-a1b2c3d",
      "materia": "Inteligencia Artificial y Sistemas Expertos",
      "dia_semana": "LUNES",
      "hora_inicio": "16:30",
      "hora_fin": "19:00",
      "aula": "Aula 1",
      "profesor": "Dr. Agurto",
      "color": "#38BDF8",
      "notas": ""
    }
  ],
  "tareas": [
    {
      "id": "id-1729891300-e4f5g6h",
      "titulo": "Entrega de Proyecto: Agente de Búsqueda Heurística",
      "materia": "Inteligencia Artificial y Sistemas Expertos",
      "fecha_limite": "2026-10-27T23:59",
      "importancia": 5,
      "completada": false,
      "fecha_creacion": "2026-10-26T01:00:00.000Z",
      "notas": "Implementación de algoritmo A* con heurística admisible."
    }
  ]
}
```

---

## Instalación y Despliegue Local

Al tratarse de una solución estática con Service Worker, se requiere servir la carpeta a través de un servidor HTTP local (las políticas de seguridad de los navegadores impiden el registro de Service Workers sobre el protocolo `file://`).

### Prerrequisitos

- Git instalado en el sistema.
- Cualquier servidor HTTP ligero (Node.js, Python o PHP).

### Pasos de Ejecución

1. **Clonar o ingresar al directorio del repositorio:**
   ```bash
   cd umbral
   ```

2. **Levantar un servidor local (seleccionar una opción):**

   - **Con Node.js (npx):**
     ```bash
     npx serve .
     ```
   - **Con Python 3:**
     ```bash
     python -m http.server 8080
     ```
   - **Con PHP:**
     ```bash
     php -S localhost:8080
     ```

3. **Abrir en el navegador:**
   Navegar a `http://localhost:8080` (o el puerto provisto por el servidor).

4. **Instalación como PWA en Celular (Opcional):**
   - En Android (Chrome / Brave): pulsar el menú de opciones (tres puntos) y seleccionar **"Añadir a la pantalla de inicio"** o **"Instalar aplicación"**.
   - En iOS (Safari): pulsar el botón Compartir y seleccionar **"Añadir a pantalla de inicio"**.

---

## Flujo Básico de Uso

1. **Carga inicial o dataset demo:** Accede a la pestaña **Compartir** en la barra inferior. Si deseas probar el sistema de inmediato, pulsa **Cargar Semestre Modelo**; si prefieres configurar tu horario desde cero, utiliza el botón **+ Nuevo** de la barra superior.
2. **Registro de materias:** Registra cada asignatura indicando día, hora de inicio, hora de fin, aula, profesor y paleta de color. El sistema validará automáticamente que no existan traslapes horarios con otras clases del mismo día.
3. **Parrilla Semanal móvil:** Dirígete a la pestaña **Horario** y selecciona **Parrilla Semanal**. Verás la distribución completa estilo horario universitario. Utiliza la barra de chips superior (`Semana`, `Lun`, `Mar`, `Mié`, etc.) para deslizarte instantáneamente al día deseado en tu teléfono, o usa el botón **Compacto** para agrupar recesos entre turnos.
4. **Administración de tareas y evaluaciones:** Ve a la pestaña **Tareas** y crea entregas asociadas a tus materias. Asígnales fecha y un nivel de importancia del 1 al 5. Emplea los chips superiores para aislar entregas pendientes, evaluaciones críticas o materias específicas.
5. **Seguimiento diario en tiempo real:** Durante tu jornada en la universidad, mantén abierta la vista **Hoy**. La tarjeta principal te informará qué clase se está dictando en ese momento, el tiempo restante para el cambio de hora y el listado de entregas inmediatas ordenadas por urgencia.
6. **Distribución de horarios:** Al finalizar de registrar tu semestre, ingresa a **Compartir** y pulsa **Exportar Horario (.json)** para enviar el archivo a tus compañeros de carrera, quienes podrán cargarlo mediante **Importar Horario** sin requerir conexión a Internet.

---

## Requisitos del Sistema

| Componente | Requisito Mínimo Verificado |
|---|---|
| Navegadores de Escritorio | Google Chrome 80+, Brave 1.0+, Mozilla Firefox 75+, Microsoft Edge 80+, Safari 13.1+ |
| Navegadores Móviles | Chrome para Android 80+, Safari en iOS 13.4+, Brave Android, Samsung Internet 12.0+ |
| Almacenamiento Local | Menos de 3 MB de espacio en disco para el app-shell y almacenamiento de datos |
| Conectividad | Requerida exclusivamente para la primera carga; posterior uso 100% autónomo offline |
| APIs Web Mandatorias | `IndexedDB`, `Service Worker API`, `Cache Storage API`, `StorageManager API` |

---

## Licencia

Este proyecto se distribuye bajo los términos de la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.

---

**Té Verde** — Estudiante de Ingeniería de Sistemas e Informática  
GitHub: [@TeVerde29](https://github.com/TeVerde29) | Email: [hikih020@gmail.com](mailto:hikih020@gmail.com)

---

Si este proyecto te resultó útil, considera darle una estrella en GitHub.
