# UNUmbral — Horario Universitario, Cursos, Notas & Tareas Offline

> Aplicación web progresiva (PWA) 100% offline para la gestión de horarios universitarios en formato de 12 horas (`AM / PM`), ciclo académico estructurado de 17 semanas, catálogo de cursos en colores pasteles, actividades no académicas, calculadora de notas en escala vigesimal (`0 a 20`, mínimo `10.5`), reporte de fin de ciclo descargable en imagen y seguimiento priorizado de tareas sin servidores ni recolección de datos.

[![Estado: Activo](https://img.shields.io/badge/Estado-Activo-294635?style=flat-square)](https://github.com/TeVerde29/unumbral)
[![PWA: Offline-First](https://img.shields.io/badge/PWA-Offline--First-AFC49A?style=flat-square&logo=pwa&logoColor=111A13)](https://teverde29.github.io/unumbral/)
[![Dexie.js: 4.4.4](https://img.shields.io/badge/Dexie.js-v4.4.4-4F7256?style=flat-square)](https://dexie.org/)
[![JavaScript: ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Tests: 51 Pass](https://img.shields.io/badge/Pruebas-51%20pass-829B78?style=flat-square)](tests/)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-829B78?style=flat-square)](LICENSE)

Los estudiantes universitarios registran sus ciclos académicos de 17 semanas, organizan su horario combinando cursos y actividades extracurriculares (prácticas, trabajo, deporte) en formato de 12 horas (`AM / PM`), llevan el control y proyección de sus calificaciones en escala vigesimal (`0 a 20`), gestionan entregas académicas por nivel de prioridad, registran asistencia con alertas automáticas de inasistencias (10%, 20%, 30%), generan un reporte gráfico descargable en imagen al finalizar el ciclo y comparten su horario mediante códigos QR o archivos JSON sin exponer notas ni tareas personales.

## Tabla de contenidos

- [Descripción](#descripción)
- [Acceso y Producción](#acceso-y-producción)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [Formatos de Intercambio JSON](#formatos-de-intercambio-json)
- [Instalación y Despliegue Local](#instalación-y-despliegue-local)
- [Compilar el APK (Android Nativo)](#compilar-el-apk-android-nativo-con-alertas-locales)
- [Pruebas Automatizadas](#pruebas-automatizadas)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Descripción

En los campus universitarios, bibliotecas y transporte público, la conectividad a Internet suele ser inestable o inexistente. **UNUmbral** resuelve esta necesidad mediante una arquitectura cliente pura (*offline-first*) empaquetada como Progressive Web App (PWA). La aplicación almacena el catálogo de cursos, sesiones de horario, actividades no académicas, registro de calificaciones, asistencias y tareas directamente en el dispositivo a través de IndexedDB (con Dexie.js v4.4.4) y un Service Worker con estrategia *Stale-While-Revalidate*.

El diseño visual aplica el sistema **Design Ricra** ("Tea Green") en combinación con los principios de Apple Human Interface Design: iconografía SVG vectorial técnica (sin emojis), materiales translúcidos (`backdrop-filter`), parrilla semanal académica con bloques continuos (`rowspan`) en tonos pasteles de alto contraste, columna de hora fija (`sticky`), ajuste automático para bloques breves (≤ 30 min) y doble tema cromático (Claro y Oscuro).

---

## Acceso y Producción

| Capa | Plataforma / Enlace | Descripción |
|---|---|---|
| Producción (Web / PWA) | [https://teverde29.github.io/unumbral/](https://teverde29.github.io/unumbral/) | Despliegue en GitHub Pages con soporte de instalación en pantalla de inicio. |
| Repositorio de Código | [https://github.com/TeVerde29/unumbral](https://github.com/TeVerde29/unumbral) | Código fuente completo, control de versiones y suite de pruebas unitarias. |

---

## Características Principales

- **Gestión de Ciclo Académico (17 Semanas):**
  - Inicia siempre en día lunes y proyecta las 17 semanas lectivas reglamentarias.
  - **Semana 8:** Destacada explícitamente para **Exámenes Parciales**.
  - **Semana 9:** Clases lectivas regulares.
  - **Semana 17:** Destacada para **Exámenes Finales** y cierre de semestre.
  - Vista de planificación integral (*Roadmap*) con avance temporal e histórico de semestres anteriores.
- **Actividades No Académicas en el Horario:**
  - Permite agendar bloques que no son materias (prácticas pre-profesionales, empleo, talleres extracurriculares, gimnasio).
  - No exigen créditos ni ponderación de notas.
  - **Modo ultracompacto (≤ 30 min):** Muestra únicamente el título limpio centrado para evitar desbordes de texto.
- **Perfil Institucional del Estudiante (UNU):**
  - Almacenamiento local del nombre completo, código universitario, DNI, facultad, escuela profesional, teléfono y correo.
- **Ficha y Feedback Académico de Fin de Ciclo:**
  - Panel resumen con horas de clase acumuladas, días de inasistencia, promedio ponderado, asignaturas aprobadas y en riesgo.
  - **Descarga directa en Imagen PNG:** Exporta un certificado/ficha visual en alta resolución renderizada con Canvas nativo 100% offline.
- **Catálogo de Cursos desacoplado del Horario:**
  - Registro de cursos con créditos académicos, profesor, aula habitual, código de asignatura, sección, ciclo relativo (I al X), condición (Obligatorio/Electivo) y color pastel.
- **Calculadora, Gráficos SVG y Simulador de Metas (0 a 20):**
  - Calcula el promedio final mediante `(Examen Parcial + Examen Final + Promedio de Prácticas) ÷ 3` con nota mínima aprobatoria de `10.5`.
  - Promedio ponderado por créditos, gráficas nativas SVG de evolución por curso y simulador de nota requerida.
- **Control de Asistencia en Tiempo Real:**
  - Proyección de todas las sesiones del semestre deduciendo feriados y cancelaciones.
  - Por defecto, las clases pasadas computan como asistidas salvo falta explícita.
  - Bloqueo de marcado presente en fechas futuras.
  - Alertas visuales inmediatas al cruzar los umbrales del 10 %, 20 % y 30 % de inasistencias.
- **Huecos Libres y Sugerencia Automática de Tareas:**
  - Detecta ventanas libres entre cursos (≥ 30 min) y sugiere tareas universitarias pendientes ordenadas por urgencia e importancia.
- **Notificaciones Locales Programadas (Android Offline):**
  - Alertas de clase (30 y 10 min antes), tareas por niveles de criticidad (1 a 5 con alarmas persistentes para exámenes), resumen matutino diario y respeto de horas de silencio.
- **Compartir Horario por Código QR Offline y Respaldo Total:**
  - Comparte horarios directamente de pantalla a cámara mediante compresión QR multiparte (sin internet, Bluetooth ni cables).
  - Exportación de horario sin notas (`UNUmbral_Horario_YYYY-MM-DD.json`) y respaldo completo (`UNUmbral_Backup_YYYY-MM-DD.json`).
- **Semestre Modelo UNU:**
  - Botón de carga rápida con un semestre universitario completo (Ciclo 2026-II, 6 asignaturas con créditos y notas, prácticas pre-profesionales OTI, gimnasio, tareas pendientes y control de faltas).

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Función en el Sistema |
|---|---|---|---|
| Lógica y Control | JavaScript (ES6+ Vanilla) | Estándar | Estado reactivo local, cálculos vigesimales, roadmap y eventos sin dependencias pesadas. |
| Persistencia Local | Dexie.js | 4.4.4 | Abstracción sobre IndexedDB con esquema relacional v5 (`UmbralDB`). |
| Presentación y UI | CSS3 Nativo | Estándar | Tokens Design Ricra, variables semánticas, backdrop-filter, temas claro/oscuro y diseño responsivo. |
| Motor Offline | Service Worker API | Cache API v5 | Estrategia *Stale-While-Revalidate* para ejecución 100% offline. |
| Distribución Móvil | Web App Manifest + Capacitor | Estándar | PWA instalable y proyecto nativo Android para notificaciones locales. |

---

## Arquitectura del Sistema

```text
unumbral/
├── app.js               # Lógica del cliente, vistas, modales, roadmap, Canvas y Dexie
├── estilos.css          # Tokens Design Ricra (Tea Green), temas claro/oscuro y componentes
├── icon.svg             # Isotipo vectorial para favicon y PWA
├── icon-192.png         # Icono PWA 192×192
├── icon-512.png         # Icono PWA 512×512
├── icon.png             # Logo principal con fondo blanco
├── index.html           # Estructura semántica accesible (WCAG), paneles de vistas y modales
├── llms.txt             # Resumen estructurado para agentes IA
├── manifest.json        # Manifiesto PWA para instalación standalone
├── robots.txt           # Reglas de rastreo y enlace a sitemap
├── sitemap.xml          # Mapa XML del sitio
├── sw.js                # Service Worker offline
├── android/             # Proyecto nativo Capacitor para compilar el APK de Android
├── lib/
│   ├── dexie.min.js     # Motor IndexedDB Dexie.js v4.4.4
│   ├── plataforma.js    # Detección de entorno (Web vs Android Capacitor)
│   ├── ajustes.js       # Sanitización y valores por defecto de configuración
│   ├── planificador.js  # Motor puro de cálculo y programación de notificaciones
│   ├── notificaciones.js# Integración con Capacitor LocalNotifications
│   ├── asistencia.js    # Proyección de sesiones del ciclo 17 semanas, feriados y faltas
│   ├── prioridad.js     # Matriz mensual y clasificación de urgencia e importancia
│   ├── rendimiento.js   # Promedio ponderado, simulador y gráficos SVG
│   ├── huecos.js        # Detección de bloques libres entre clases y sugerencias
│   ├── qrcode.min.js    # Generador offline de códigos QR
│   ├── qr.js            # Compresión y ensamble multiparte de horarios para QR
│   └── deeplink.js      # Enrutamiento de accesos directos y deep links
└── tests/               # Suite de 51 pruebas unitarias puras (node --test)
```

---

## Modelo de Datos

La base de datos IndexedDB (`UmbralDB` versión 5) almacena la estructura académica completa:

```javascript
db.version(5).stores({
  ciclos:      "id, nombre, fecha_inicio, fecha_fin, estado",
  cursos:      "id, nombre, ciclo_id",
  clases:      "id, curso_id, dia_semana, ciclo_id, tipo",
  tareas:      "id, curso_id, fecha_limite, importancia, completada, fecha_creacion, ciclo_id",
  eventos:     "id, curso_id, fecha, tipo, ciclo_id",
  asistencia:  "id, curso_id, clase_id, fecha, estado, &[clase_id+fecha]",
  excepciones: "id, fecha, tipo, clase_id",
  ajustes:     "clave"
});
```

- **`ciclos`**: `{ id, nombre, fecha_inicio, fecha_fin, estado, creado_por_usuario, fecha_creacion }`
- **`cursos`**: `{ id, ciclo_id, nombre, creditos, ciclo_curso, tipo_condicion, codigo_asignatura, grupo_seccion, profesor, aula, color, notas, evaluacion }`
- **`clases`**: `{ id, curso_id, ciclo_id, tipo, dia_semana, hora_inicio, hora_fin, aula, profesor, color }` (`tipo`: `"curso"` o `"actividad"`)
- **`tareas`**: `{ id, titulo, curso_id, ciclo_id, fecha_limite, importancia, completada, fecha_creacion, notas }`
- **`eventos`**: `{ id, titulo, tipo, curso_id, fecha, hora, aula, notas }`
- **`asistencia`**: `{ id, curso_id, clase_id, fecha, estado }` (`presente`, `falta`, `justificada`)
- **`excepciones`**: `{ id, fecha, tipo, clase_id, curso_id, motivo }` (`feriado`, `cancelada`)
- **`ajustes`**: `{ clave, valor }` (perfil del estudiante, horas de silencio, ventanas libres, etc.)

---

## Formatos de Intercambio JSON

### 1. Horario Compartido (`unumbral-horario-compartido`)

Exportado desde **Compartir → Exportar Horario (.json)**. Incluye el catálogo de cursos y los bloques de horario en formato de 12 horas y colores pasteles, **sin notas ni tareas personales**:

```json
{
  "tipo": "unumbral-horario-compartido",
  "version": 2,
  "fecha_creacion": "2026-10-27T12:00:00.000Z",
  "cursos": [
    {
      "nombre": "Inteligencia Artificial y Sistemas Expertos",
      "profesor": "Dr. Agurto",
      "aula": "Aula 1",
      "color": "#BAE6FD",
      "creditos": 4,
      "ciclo_curso": "IX",
      "tipo_condicion": "obligatorio"
    }
  ],
  "clases": [
    {
      "materia": "Inteligencia Artificial y Sistemas Expertos",
      "dia_semana": "LUNES",
      "hora_inicio": "04:30 PM",
      "hora_fin": "07:00 PM",
      "aula": "Aula 1",
      "profesor": "Dr. Agurto",
      "color": "#BAE6FD"
    }
  ]
}
```

### 2. Copia de Seguridad Total (`unumbral-backup-total`)

Exportado desde **Compartir → Crear Backup Completo**. Respalda íntegramente `ciclos`, `perfil_estudiante`, `cursos` (incluyendo evaluaciones y prácticas), `clases` académicas y actividades, `tareas` y registros de `asistencia`.

---

## Instalación y Despliegue Local

```bash
cd unumbral
npx serve .
# o con Python:
python -m http.server 8080
```

---

## Compilar el APK (Android Nativo con Alertas Locales)

UNUmbral cuenta con soporte nativo para Android mediante **Capacitor**, lo que permite programar alertas y notificaciones locales 100% offline que suenan incluso con la aplicación cerrada y sin conexión a internet.

### Requisitos previos
- **Node.js LTS** (v18 o superior).
- **Android Studio** (con SDK de Android instalado) o Android Command Line Tools con Java JDK 17+.

### Pasos de compilación:
1. Instalar dependencias y sincronizar activos web con el proyecto nativo:
   ```bash
   npm install
   npm run build:web
   npm run sync
   ```
2. Abrir el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
3. En Android Studio, seleccionar en el menú superior:  
   **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. O compilar directamente desde terminal con Gradle:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   El archivo generado se ubicará en `android/app/build/outputs/apk/debug/app-debug.apk`.
5. Transfiere e instala el APK directamente en tu teléfono Android.

---

## Pruebas Automatizadas

UNUmbral cuenta con una suite de **51 pruebas unitarias puras** que verifican la integridad de toda la lógica de negocio:

```bash
npm test
# o directamente con Node:
node --test tests/*.test.js
```

La suite cubre:
- **`tests/ciclo.test.js`**: Cálculo de 17 semanas con inicio en lunes, Semana 8 de exámenes parciales, Semana 17 de finales y asistencia por defecto.
- **`tests/asistencia.test.js`**: Proyección exacta de sesiones del ciclo, deducción de feriados/cancelaciones y disparadores de inasistencias en 10 %, 20 % y 30 %.
- **`tests/unumbral.test.js`**: Cálculo vigesimal 0–20, límites del timeline adaptativo, colocación de eventos y consistencia de IDs DOM entre JavaScript y HTML.
- **`tests/rendimiento.test.js`**: Promedio ponderado por créditos, simulador de notas y generadores de gráficos SVG.
- **`tests/huecos.test.js`**: Detección de bloques libres entre clases y algoritmo de sugerencia de tareas por prioridad.
- **`tests/prioridad.test.js`**: Fórmula de urgencia + importancia, matriz mensual y agrupación semanal.
- **`tests/planificador.test.js`**: Ventana móvil de 14 días, canales de notificación, tareas nivel 5 insistentes y respeto de horas de silencio.
- **`tests/qr.test.js`**: Codificación Base64URL, compresión v2, roundtrip exacto y ensamble multiparte.
- **`tests/deeplink.test.js`**: Parseo y enrutamiento de accesos directos de Android y URLs de esquema `unumbral://`.
- **`tests/db-v4.test.js`**: Valores por defecto y sanitización de ajustes.

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta [LICENSE](LICENSE) para más información.

---

## Autor

**Té Verde** — Estudiante de Ingeniería de Sistemas e Informática  
GitHub: [@TeVerde29](https://github.com/TeVerde29) | Email: [hikih020@gmail.com](mailto:hikih020@gmail.com)
