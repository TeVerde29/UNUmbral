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

- **Catálogo de Cursos desacoplado del Horario:** Registra cada curso una sola vez (nombre, profesor, aula habitual, color pastel y enlaces). Al agregar una clase al horario, solo eliges el curso del desplegable, el día y la hora.
- **Calculadora y Simulador de Notas (Escala 0 a 20):** Calcula el promedio final mediante `(Examen Parcial + Examen Final + Promedio de Prácticas) ÷ 3` con nota mínima aprobatoria de `10.5`, indicando en tiempo real cuánto necesitas en las evaluaciones restantes para aprobar.
- **Formato de 12 horas (`AM / PM`) y Paleta Pastel:** Todas las vistas, tarjetas y la parrilla semanal muestran horarios en formato `08:00 AM – 01:00 PM` sobre una paleta de 10 colores pasteles legibles en tema claro y oscuro.
- **Dashboard en tiempo real ("Hoy"):** Identifica automáticamente si hay una materia en curso (mostrando aula, profesor, minutos restantes y barra de progreso) o calcula la cuenta regresiva hacia la siguiente clase.
- **Parrilla semanal académica con duración real (`rowspan`):** Cada curso ocupa un bloque continuo proporcional a su duración en intervalos de 30 minutos, con cabecera y columna de horas fijas (`sticky`) y navegación rápida por día.
- **Detección estricta de cruces horarios:** Impide guardar sesiones que se solapen en el mismo día, informando el curso y rango horario en conflicto.
- **Radar de tareas y escala de criticidad (1 a 5):** Clasificación de entregas desde Nivel 1 (Rutina) hasta Nivel 5 (Crítica / Examen), con filtros por estado, asignatura y búsqueda instantánea.
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
├── app.js               # Lógica del cliente, motor de notas 0–20, vistas, modales y Dexie
├── estilos.css          # Tokens Design Ricra (Tea Green), temas claro/oscuro y parrilla semanal
├── icon.svg             # Isotipo vectorial para favicon y PWA
├── icon-192.png         # Icono PWA 192×192
├── icon-512.png         # Icono PWA 512×512
├── index.html           # Estructura semántica accesible (WCAG), paneles de vistas y modales
├── llms.txt             # Resumen estructurado para agentes IA
├── manifest.json        # Manifiesto PWA para instalación standalone
├── robots.txt           # Reglas de rastreo y enlace a sitemap
├── sitemap.xml          # Mapa XML del sitio
├── sw.js                # Service Worker offline (unumbral-ricra-v5)
├── lib/
│   └── dexie.min.js     # Motor IndexedDB Dexie.js v4.4.4 empaquetado localmente
└── tests/
    └── unumbral.test.js # Suite de pruebas unitarias (node --test)
```

---

## Modelo de Datos

La base de datos IndexedDB (`UmbralDB` versión 3) separa los cursos del horario y las tareas:

```javascript
db.version(3).stores({
  cursos: "id, nombre",
  clases: "id, curso_id, dia_semana",
  tareas: "id, curso_id, fecha_limite, importancia, completada, fecha_creacion",
  ajustes: "clave"
});
```

- **`cursos`**: `{ id, nombre, profesor, aula, color, notas, evaluacion: { parcial, final, practicas: [{ id, titulo, nota }] } }`
- **`clases`**: `{ id, curso_id, dia_semana, hora_inicio, hora_fin, aula }` (donde `aula` solo se define si esa sesión cambia respecto al aula habitual del curso).
- **`tareas`**: `{ id, titulo, curso_id, fecha_limite, importancia, completada, fecha_creacion, notas }`

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

## Pruebas Automatizadas

Ejecuta la suite de pruebas unitarias con Node.js (sin dependencias externas):

```bash
node --test tests/unumbral.test.js
```

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta [LICENSE](LICENSE) para más información.

---

## Autor

**Té Verde** — Estudiante de Ingeniería de Sistemas e Informática  
GitHub: [@TeVerde29](https://github.com/TeVerde29) | Email: [hikih020@gmail.com](mailto:hikih020@gmail.com)
