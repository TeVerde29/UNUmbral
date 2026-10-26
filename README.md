# UNUmbral — Horario Universitario, Cursos, Notas & Tareas Offline

> Aplicación web progresiva (PWA) 100% offline para la gestión de horarios universitarios en formato de 12 horas (`AM / PM`), catálogo de cursos en colores pasteles, calculadora de notas en escala vigesimal (`0 a 20`, mínimo `10.5`) y seguimiento priorizado de tareas académicas sin servidores ni recolección de datos.

[![Estado: Activo](https://img.shields.io/badge/Estado-Activo-294635?style=flat-square)](https://github.com/TeVerde29/unumbral)
[![PWA: Offline-First](https://img.shields.io/badge/PWA-Offline--First-AFC49A?style=flat-square&logo=pwa&logoColor=111A13)](https://teverde29.github.io/unumbral/)
[![Dexie.js: 4.4.4](https://img.shields.io/badge/Dexie.js-v4.4.4-4F7256?style=flat-square)](https://dexie.org/)
[![JavaScript: ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-829B78?style=flat-square)](LICENSE)

Los estudiantes universitarios registran sus cursos una sola vez con profesor, aula habitual y color pastel, arman su horario eligiendo únicamente el curso y la hora en formato de 12 horas (`AM / PM`), llevan el control y proyección de sus calificaciones en escala vigesimal (`0 a 20`), gestionan entregas mediante una escala de importancia de 1 a 5 y comparten su horario con compañeros mediante archivos JSON livianos sin exponer notas ni tareas personales.

## Tabla de contenidos

- [Descripción](#descripción)
- [Acceso y Producción](#acceso-y-producción)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [Formatos de Intercambio JSON](#formatos-de-intercambio-json)
- [Instalación y Despliegue Local](#instalación-y-despliegue-local)
- [Pruebas Automatizadas](#pruebas-automatizadas)
- [Licencia](#licencia)
- [Autor](#autor)

---

## Descripción

En los campus universitarios, bibliotecas y transporte público, la conectividad a Internet suele ser inestable o inexistente. **UNUmbral** resuelve esta necesidad mediante una arquitectura cliente pura (*offline-first*) empaquetada como Progressive Web App (PWA). La aplicación almacena el catálogo de cursos, las sesiones del horario, el registro de notas y las tareas académicas directamente en el dispositivo a través de IndexedDB (con Dexie.js v4.4.4) y un Service Worker con estrategia *Stale-While-Revalidate*.

El diseño visual aplica el sistema **Design Ricra** ("Tea Green") en combinación con los principios de Apple Human Interface Design: iconografía SVG vectorial técnica, materiales translúcidos (`backdrop-filter`), parrilla semanal académica con bloques continuos (`rowspan`) en tonos pasteles de alto contraste, columna de hora fija (`sticky`) y doble tema cromático (Claro y Oscuro).

---

## Acceso y Producción

| Capa | Plataforma / Enlace | Descripción |
|---|---|---|
| Producción (Web / PWA) | [https://teverde29.github.io/unumbral/](https://teverde29.github.io/unumbral/) | Despliegue en GitHub Pages con soporte de instalación en pantalla de inicio. |
| Repositorio de Código | [https://github.com/TeVerde29/unumbral](https://github.com/TeVerde29/unumbral) | Código fuente completo, control de versiones y pruebas automatizadas. |

---

## Características Principales

- **Catálogo de Cursos desacoplado del Horario:** Registra cada curso una sola vez (nombre, créditos, profesor, aula habitual, color pastel y enlaces). Al agregar una clase al horario, solo eliges el curso del desplegable, el día y la hora.
- **Calculadora, Gráficos SVG y Simulador de Metas (Escala 0 a 20):** Calcula el promedio final mediante `(Examen Parcial + Examen Final + Promedio de Prácticas) ÷ 3` con nota mínima aprobatoria de `10.5`, promedio ponderado por créditos, gráficas nativas SVG comparativas y simulador de nota meta requerida.
- **Formato de 12 horas (`AM / PM`) y Paleta Pastel:** Todas las vistas, tarjetas y la parrilla semanal muestran horarios en formato `08:00 AM – 01:00 PM` sobre una paleta de 10 colores pasteles legibles en tema claro y oscuro.
- **Dashboard en tiempo real ("Hoy"):** Identifica materias en curso, cuenta regresiva, estado de asistencia rápida (`Asistí`, `Falté`, `Justif.`, `Cancelar sesión`) y detección de feriados.
- **Huecos Libres y Sugerencia de Tareas:** Detecta automáticamente los bloques libres entre clases (≥ 30 min) y sugiere tareas pendientes que caben en ese tiempo con botón para completarlas directamente.
- **Notificaciones Locales Programadas (Android Offline):** Alertas de clase (30 y 10 min antes), tareas por niveles de criticidad (1 a 5, con alarmas insistentes para exámenes), resumen matutino diario y respeto de horas de silencio, todo funcionando con la app cerrada y sin conexión.
- **Calendario Mensual y Prioridad ("Esta semana"):** Vista mensual con marcas visuales de entregas por fecha y filtro agrupado por urgencia + importancia.
- **Control de Asistencia y Ciclo:** Proyección exacta de sesiones del semestre, deducción de feriados y cancelaciones, y alertas automáticas al cruzar el 10 %, 20 % y 30 % de inasistencias.
- **Compartir Horario por Código QR Offline:** Comparte e importa horarios directamente de pantalla a cámara sin requerir internet, bluetooth ni NFC (con soporte multiparte).
- **Accesos Rápidos Nativos (Android Shortcuts):** Mantén presionado el icono de la app en Android para crear rápidamente una nueva tarea o saltar al horario de hoy.
- **Exportación de horario vs. Backup completo:** Comparte el horario con compañeros (`UNUmbral_Horario_YYYY-MM-DD.json`) sin incluir tus notas ni tareas personales, o genera un respaldo integral (`UNUmbral_Backup_YYYY-MM-DD.json`) para restaurar todos tus datos en otro dispositivo.

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Función en el Sistema |
|---|---|---|---|
| Lógica y Control | JavaScript (ES6+ Vanilla) | Estándar | Estado global, motor de cálculo de notas 0–20, parrilla `rowspan` y eventos del DOM sin frameworks externos. |
| Persistencia Local | Dexie.js | 4.4.4 | Abstracción sobre IndexedDB con migraciones automáticas v1 → v3 (`UmbralDB`). |
| Presentación y UI | CSS3 Nativo | Estándar | Tokens Design Ricra, variables semánticas de matriz, temas claro/oscuro y diseño responsivo. |
| Motor Offline | Service Worker API | Cache API v5 | Estrategia *Stale-While-Revalidate* (`unumbral-ricra-v5`) para ejecución 100% offline. |
| Distribución Móvil | Web App Manifest | Estándar | Instalación PWA nativa con iconos `192x192`, `512x512` y SVG vectorial. |

---

## Arquitectura del Sistema

```text
unumbral/
├── app.js               # Lógica del cliente, vistas, modales, deep links y Dexie
├── estilos.css          # Tokens Design Ricra (Tea Green), temas claro/oscuro y componentes
├── icon.svg             # Isotipo vectorial para favicon y PWA
├── icon-192.png         # Icono PWA 192×192
├── icon-512.png         # Icono PWA 512×512
├── index.html           # Estructura semántica accesible (WCAG), paneles de vistas y modales
├── llms.txt             # Resumen estructurado para agentes IA
├── manifest.json        # Manifiesto PWA para instalación standalone
├── robots.txt           # Reglas de rastreo y enlace a sitemap
├── sitemap.xml          # Mapa XML del sitio
├── sw.js                # Service Worker offline (unumbral-ricra-v12)
├── android/             # Proyecto nativo Capacitor para compilar el APK de Android
├── lib/
│   ├── dexie.min.js     # Motor IndexedDB Dexie.js v4.4.4
│   ├── plataforma.js    # Detección de entorno (Web vs Android Capacitor)
│   ├── ajustes.js       # Sanitización y valores por defecto de configuración
│   ├── planificador.js  # Motor puro de cálculo y programación de notificaciones
│   ├── notificaciones.js# Integración con Capacitor LocalNotifications
│   ├── asistencia.js    # Proyección de sesiones, feriados y umbrales de faltas
│   ├── prioridad.js     # Matriz mensual y clasificación de urgencia e importancia
│   ├── rendimiento.js   # Promedio ponderado, simulador y gráficos SVG
│   ├── huecos.js        # Detección de bloques libres entre clases y sugerencias
│   ├── qrcode.min.js    # Generador offline de códigos QR
│   ├── qr.js            # Compresión y ensamble multiparte de horarios para QR
│   └── deeplink.js      # Enrutamiento de accesos directos y deep links
└── tests/               # Suite de 43 pruebas unitarias puras (node --test)
```

---

## Modelo de Datos

La base de datos IndexedDB (`UmbralDB` versión 4) almacena toda la información del estudiante:

```javascript
db.version(4).stores({
  cursos: "id, nombre",
  clases: "id, curso_id, dia_semana",
  tareas: "id, curso_id, fecha_limite, importancia, completada, fecha_creacion",
  eventos: "id, curso_id, fecha, tipo",
  asistencia: "id, curso_id, fecha, estado",
  excepciones: "id, tipo, fecha, curso_id, clase_id",
  ajustes: "clave"
});
```

- **`cursos`**: `{ id, nombre, creditos, profesor, aula, color, notas, evaluacion: { parcial, final, practicas: [{ id, titulo, nota }] } }`
- **`clases`**: `{ id, curso_id, dia_semana, hora_inicio, hora_fin, aula }`
- **`tareas`**: `{ id, titulo, curso_id, fecha_limite, importancia, estimado_min, completada, fecha_creacion, notas }`
- **`eventos`**: `{ id, titulo, tipo, curso_id, fecha, hora, aula, notas }` (exámenes, entregas especiales)
- **`asistencia`**: `{ id, curso_id, clase_id, fecha, estado }` (`asistio`, `falto`, `justificada`)
- **`excepciones`**: `{ id, tipo, fecha, curso_id, clase_id, motivo }` (`feriado`, `cancelada`)
- **`ajustes`**: `{ clave, valor }` (fechas del ciclo, límites de faltas, horas de silencio, etc.)

---

## Formatos de Intercambio JSON

### 1. Horario Compartido (`unumbral-horario-compartido`)

Exportado desde **Compartir → Exportar Horario (.json)**. Incluye el catálogo de cursos y los bloques de horario en formato de 12 horas y colores pasteles, **sin notas ni tareas personales**:

```json
{
  "tipo": "unumbral-horario-compartido",
  "version": 2,
  "fecha_creacion": "2026-10-26T04:00:00.000Z",
  "cursos": [
    {
      "nombre": "Inteligencia Artificial y Sistemas Expertos",
      "profesor": "Dr. Agurto",
      "aula": "Aula 1",
      "color": "#BAE6FD",
      "notas": ""
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
      "color": "#BAE6FD",
      "notas": ""
    }
  ]
}
```

### 2. Copia de Seguridad Total (`unumbral-backup-total`)

Exportado desde **Compartir → Crear Backup Completo**. Respalda `cursos` (incluyendo notas parciales, finales y prácticas), `clases` y `tareas`.

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

> **Nota importante para el usuario:** Los datos del APK (IndexedDB en el WebView nativo) son **independientes** de la versión web PWA instalada desde Chrome. Si ya usabas la versión web antes de migrar al APK: ve a **Compartir → Crear Backup Completo** en la web, guarda el archivo `.json`, instala el APK en tu celular y pulsa **Restaurar Backup**.

### Requisitos previos
- **Node.js LTS** (v18 o superior).
- **Android Studio** (con SDK de Android instalado) o Android Command Line Tools con Java JDK 17+.

### Pasos de compilación:
1. Instalar dependencias y sincronizar activos web con el proyecto nativo:
   ```bash
   npm install
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
5. Transfiere e instala el APK directamente en tu teléfono Android. Al abrirlo, otorga los permisos de notificación para disfrutar de alarmas exactas para tus clases y entregas.

---

## Pruebas Automatizadas

UNUmbral cuenta con una suite completa de 43 pruebas unitarias puras (sin DOM, sin Dexie, sin mocks externos) que verifican la lógica de negocio:

```bash
npm test
# o directamente con Node:
node --test tests/*.test.js
```

La suite cubre:
- **`tests/unumbral.test.js`**: Cálculo vigesimal 0–20, límites del timeline adaptativo, colocación y solapamiento de eventos, consistencia de IDs DOM entre JS y HTML.
- **`tests/asistencia.test.js`**: Proyección del ciclo académico, cálculo de faltas y disparadores en 10 %, 20 % y 30 %.
- **`tests/prioridad.test.js`**: Fórmula de urgencia + importancia, matriz mensual y agrupación semanal.
- **`tests/planificador.js`**: Ventana móvil de 14 días, canales de notificación, tareas nivel 5 insistentes y respeto de horas de silencio.
- **`tests/rendimiento.test.js`**: Promedio ponderado por créditos, simulador de notas y generadores de gráficos SVG.
- **`tests/huecos.test.js`**: Detección de huecos libres y algoritmo de sugerencia de tareas por duración y prioridad.
- **`tests/qr.test.js`**: Codificación Base64URL, compresión v2, roundtrip exacto y ensamble multiparte.
- **`tests/deeplink.test.js`**: Parseo y enrutamiento de accesos directos de Android y URLs de esquema `unumbral://`.

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta [LICENSE](LICENSE) para más información.

---

## Autor

**Té Verde** — Estudiante de Ingeniería de Sistemas e Informática  
GitHub: [@TeVerde29](https://github.com/TeVerde29) | Email: [hikih020@gmail.com](mailto:hikih020@gmail.com)
