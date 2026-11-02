# Especificación de Requerimientos y Reglas de Negocio — UNUmbral

> **Sistema Organizador Académico Universitario 100% Offline**  
> Documento técnico de especificación formal de Requerimientos Funcionales (RF), Requerimientos No Funcionales (RNF) y Reglas de Negocio (RN).

---

## 1. Introducción y Alcance

UNUmbral es un organizador académico universitario diseñado para operar bajo la arquitectura **Local-First**, garantizando soberanía de datos, disponibilidad total sin conexión a internet y cero rastreo de la actividad del estudiante. 

El sistema cubre la gestión integral del ciclo universitario regular (17 semanas lectivas), estructuración de horarios en formato 12 horas (AM/PM), seguimiento y cálculo de calificaciones vigesimales (0 a 20) con umbral de aprobación en 10.5, control preventivo de inasistencias por sesión con alertas porcentuales reglamentarias (10%, 20% y 30%), detección automática de ventanas libres entre clases con sugerencias de tareas, y transferencia óptica de horarios entre compañeros de clase mediante códigos QR comprimidos con algoritmo Deflate binario sin intervención de servidores externos.

---

## 2. Requerimientos Funcionales (RF)

### Módulo A: Gestión de Semestre y Ciclo Académico
- **RF-01: Configuración del Ciclo Lectivo:** El sistema debe permitir registrar el nombre del semestre (ej. "Ciclo 2026-II") y seleccionar la fecha de inicio del ciclo.
- **RF-02: Proyección Automática de 17 Semanas:** A partir de la fecha de inicio seleccionada, el sistema debe proyectar automáticamente la duración reglamentaria de 17 semanas continuas (119 días calendario), finalizando en domingo.
- **RF-03: Identificación de Hitos Académicos:** El sistema debe calcular y etiquetar de manera automática la **Semana 8** como período de evaluaciones parciales y la **Semana 17** como período de evaluaciones finales y cierre de actas.
- **RF-04: Excepciones Calendarias y Feriados:** El sistema debe permitir marcar días completos como feriados o suspender sesiones de clase individuales sin alterar el calendario general.

### Módulo B: Catálogo de Asignaturas y Actividades
- **RF-05: Registro de Cursos:** El sistema debe permitir registrar asignaturas con los campos: nombre de la materia, número de créditos (entero de 1 a 12), ciclo al que pertenece (I a X o electivo), grupo/sección (ej. "A", "B"), nombre del docente responsable, aula física o virtual habitual, y selección de color distintivo de una paleta accesible.
- **RF-06: Distinción de Actividades Extracurriculares y Laborales:** El sistema debe permitir registrar bloques no lectivos como prácticas preprofesionales, talleres o actividades laborales, diferenciándolos visualmente de las materias obligatorias.
- **RF-07: Edición y Eliminación en Cascada:** Al editar una asignatura, los cambios deben propagarse a todas las sesiones asociadas en el horario; al eliminar un curso, deben eliminarse en cascada sus clases asociadas, evaluaciones y registros de asistencia previa confirmación del usuario.

### Módulo C: Horario Semanal y Sesiones de Clase
- **RF-08: Gestión de Horarios en Formato 12 Horas (AM/PM):** El sistema debe permitir crear bloques de clase indicando hora de inicio y fin mediante selectores intuitivos con soporte nativo para horas de 01 a 12, minutos en múltiplos de 5 y selector meridiano AM/PM.
- **RF-09: Selección Multidía con Atajos:** El formulario de clases debe permitir asignar una materia a múltiples días de la semana con un solo guardado, incluyendo un botón de acción rápida para seleccionar automáticamente de lunes a viernes ("Lun a Vie").
- **RF-10: Vista de Horario por Parrilla Semanal:** La interfaz de horario debe presentar por defecto una parrilla semanal completa de 7 días (lunes a domingo) con selector de días estilo Apple Calendar, permitiendo desplazamiento fluido y navegación por horas.
- **RF-11: Prevención de Conflictos de Horario:** El sistema debe alertar al usuario si una nueva sesión de clase se solapa temporalmente con otra previamente registrada para el mismo día.

### Módulo D: Panel Diario "Hoy" y Seguimiento en Vivo
- **RF-12: Saludo Contextual y Resumen Diario:** El panel principal debe mostrar un saludo dinámico según la hora del día, la fecha actual en lenguaje natural, y un contador de clases y tareas programadas para la jornada.
- **RF-13: Detección de Sesión Activa / Próxima Clase:** El sistema debe identificar la clase que se está dictando en el momento o la próxima sesión a comenzar, mostrando el tiempo restante en cuenta regresiva precisa y metadatos clave (aula, horario, docente).
- **RF-14: Exclusión de Clases Canceladas en Estado en Vivo:** Si una clase de hoy fue cancelada o el día fue declarado feriado, el estado en vivo no debe mostrarla como sesión activa ni pendiente.
- **RF-15: Acceso Rápido a Información y Marcado de Asistencia:** Al tocar una tarjeta de clase en "Hoy", debe desplegarse una hoja modal inferior con los detalles completos del curso y 4 botones directos de registro: Asistí, Falté, Justificada y Anular.

### Módulo E: Control de Inasistencias y Asistencia Reglamentaria
- **RF-16: Registro de Estado de Asistencia por Sesión:** Cada sesión de clase proyectada en el ciclo debe admitir uno de cuatro estados: Presente (Asistió), Inasistencia (Faltó), Falta Justificada, o Sesión Cancelada/Feriado.
- **RF-17: Asistencia por Defecto en Sesiones Pasadas:** Todas las sesiones del calendario cuya fecha ya transcurrió deben computarse automáticamente como asistidas a menos que exista un registro explícito de falta o justificación.
- **RF-18: Alertas Preventivas de Límite de Faltas:** El sistema debe computar el porcentaje acumulado de inasistencias sobre el total de clases programadas en el semestre y emitir advertencias visuales al alcanzar el 10%, 20% y el límite crítico del 30% (riesgo de inhabilitación según Art. 31 del Reglamento General de Estudios).

### Módulo F: Calificaciones, Rendimiento y Simulador de Notas
- **RF-19: Registro de Notas en Escala Vigesimal:** El sistema debe registrar calificaciones de Examen Parcial (EP), Promedio de Prácticas (PP) y Examen Final (EF) en el rango formal de 0.00 a 20.00 puntos con hasta 2 decimales.
- **RF-20: Cálculo Automático de Promedio Final:** El promedio de cada curso debe calcularse con la fórmula reglamentaria: $(EP + EF + PP) / 3$.
- **RF-21: Umbral de Aprobación Vigesimal:** El sistema debe considerar aprobado un curso con nota final mínima de 10.5, aplicando el criterio de redondeo favorable al número entero superior (11) para actas académicas.
- **RF-22: Promedio Ponderado General del Semestre:** El sistema debe calcular el promedio ponderado global multiplicando la nota de cada asignatura por sus créditos correspondientes y dividiendo entre la sumatoria de créditos matriculados.
- **RF-23: Simulador de Nota Requerida en Examen Final:** Cuando falte rendir el examen final, el sistema debe calcular de manera predictiva la nota exacta que el estudiante necesita obtener para alcanzar el 10.5 aprobatorio o metas voluntarias superiores (14, 16 o 18).

### Módulo G: Gestión de Tareas y Matriz de Prioridad
- **RF-24: Registro de Tareas y Entregas:** El usuario debe poder registrar tareas vinculadas o no a una asignatura, con fecha y hora límite de entrega, nivel de importancia (1 a 5), notas adicionales y enlaces web asociados.
- **RF-25: Clasificación por Urgencia e Importancia:** Las tareas deben ordenarse automáticamente combinando su fecha de vencimiento y su nivel de importancia (1 a 5).
- **RF-26: Marcado Rápido de Tareas:** Tanto en la vista Hoy como en la vista Tareas y en los Huecos Libres, debe existir un botón de un solo toque ("Lista") para completar tareas sin abrir modales.

### Módulo H: Detección de Huecos Libres
- **RF-27: Cálculo de Ventanas Libres entre Clases:** El sistema debe analizar el horario de hoy e identificar intervalos libres entre clases que tengan una duración mínima de 30 minutos dentro de la jornada lectiva.
- **RF-28: Recomendación Contextual de Tareas:** Para cada hueco libre detectado, el sistema debe sugerir 1 o 2 tareas pendientes que el estudiante pueda avanzar durante ese intervalo, evitando repetir la misma sugerencia en diferentes huecos.

### Módulo I: Compartir Horario por Código QR Offline
- **RF-29: Exportación de Horario vía QR Comprimido:** El sistema debe serializar la estructura del horario (materias, colores, créditos, aulas y sesiones semanales) en un formato JSON minificado versión 3, comprimido con algoritmo Zlib Deflate y codificado en Base64 URL-safe (prefijo `UNU1:Z:`).
- **RF-30: Protección de Datos Personales en QR:** La exportación QR debe excluir estrictamente notas, calificaciones parciales, registros de faltas, tareas privadas y apuntes personales.
- **RF-31: Códigos QR Multipartes para Horarios Extensos:** Si el tamaño del horario comprimido excede los 4000 caracteres, el sistema debe fragmentar automáticamente la carga en códigos QR sucesivos (`UNU1:1/2:Z:...`).
- **RF-32: Escaneo y Reconstrucción Óptica:** El sistema debe permitir importar un horario escaneando códigos QR con la cámara del dispositivo o seleccionando una imagen/captura de pantalla desde la galería.

### Módulo J: Datos de Demostración y Configuración
- **RF-33: Carga de Semestre Modelo:** El sistema debe incluir un botón de un solo toque para poblar la base de datos con un ciclo universitario realista con 5 asignaturas de ingeniería, notas parciales, tareas y horarios representativos.
- **RF-34: Vaciado Completo de Datos:** El sistema debe permitir purgar todas las tablas locales de forma inmediata previa confirmación expresa del usuario.
- **RF-35: Respaldo y Restauración en Archivo:** Debe permitir exportar la base de datos completa a un archivo JSON para respaldo local y restaurarlo posteriormente.

---

## 3. Requerimientos No Funcionales (RNF)

### Arquitectura y Persistencia
- **RNF-01: Arquitectura 100% Local-First:** El sistema no debe depender de ningún servidor remoto, API externa ni base de datos en la nube para su funcionamiento completo.
- **RNF-02: Disponibilidad y Caché Offline-First:** La aplicación debe funcionar sin conexión a internet mediante un Service Worker con estrategia de caché *Stale-While-Revalidate*, garantizando operatividad continua en sótanos, laboratorios o zonas sin cobertura móvil.
- **RNF-03: Persistencia en IndexedDB:** Todos los datos deben almacenarse en el almacenamiento local estructurado del navegador (`IndexedDB`) a través de Dexie.js v4.4+, solicitando persistencia al sistema operativo (`navigator.storage.persist()`).

### Privacidad y Seguridad
- **RNF-04: Cero Telemetría y Cero Rastreo (Zero-Tracking):** La aplicación no debe incluir scripts de análisis, píxeles de seguimiento, cookies de terceros ni enviar información de uso a ningún destino.
- **RNF-05: Prevención de Ataques XSS:** Todo dato renderizado en el DOM proveniente de entrada de usuario o de códigos QR importados debe ser sanitizado y escapado rigurosamente mediante el interpolador seguro `safeHtml`.
- **RNF-06: Sanitización de Esquemas y Colores:** Los valores importados de color deben validarse contra una lista blanca o formato hexadecimal estricto `#RRGGBB` para impedir inyecciones de CSS malicioso o enlaces `javascript:`.

### Experiencia de Usuario y Diseño Visual
- **RNF-07: Estética Móvil Apple-Inspired (Design Ricra):** La interfaz debe ajustarse a las guías de diseño de Apple (Apple Human Interface Guidelines), incorporando esquinas redondeadas continuas, efecto acrílico con `backdrop-filter`, paleta sobria universitaria "Tea Green", jerarquía visual clara y espaciado proporcional.
- **RNF-08: Exclusión de Emojis en la Interfaz:** Toda la interfaz debe emplear exclusivamente iconos vectoriales SVG limpios y consistentes, eliminando el uso de emojis que desentonen con la estética profesional de producto.
- **RNF-09: Diseño Responsive Mobile-First:** La interfaz debe estar optimizada principalmente para dispositivos móviles (desde 360px hasta 430px de ancho, con referencia de validación en iPhone 16 Pro Max de 400x956 px), adaptándose armónicamente a pantallas de escritorio sin perder ergonomía táctil.
- **RNF-10: Ergonomía de Entrada Táctil:** Los botones y objetivos de pulsación deben mantener una altura mínima de 44px o padding táctil cómodo para facilitar la interacción con una sola mano.
- **RNF-11: Modales en Hojas Inferiores (Bottom Sheets):** En dispositivos móviles, los formularios y paneles secundarios deben presentarse como hojas deslizantes desde la parte inferior con tirador superior (grab handle) y desenfoque de fondo.

### Rendimiento y Calidad
- **RNF-12: Rendimiento y Latencia Ultrabaja:** El tiempo de carga inicial en frío debe ser inferior a 1.0 segundo y las transiciones entre pestañas deben resolverse en menos de 50 milisegundos sin bloqueos del hilo principal.
- **RNF-13: Verificación Automatizada Integral:** El código base debe validar continuamente su estabilidad mediante una suite de pruebas unitarias automatizadas (mínimo 68 pruebas en `node:test`) que cubran lógica de negocio, cálculos de notas, asistencia y proyecciones.
- **RNF-14: Accesibilidad Web (WCAG 2.1 AA/AAA):** Todos los elementos interactivos deben incluir atributos `aria-label`, roles semánticos y cumplir con un ratio de contraste mínimo de 4.5:1 para texto normal y 3:1 para controles gráficos.

---

## 4. Reglas de Negocio (RN)

### RN-01: Duración Estricta del Semestre Universitario
Todo semestre académico consta exactamente de **17 semanas consecutivas**, iniciando siempre en un día lunes (Semana 1) y concluyendo en el día domingo de la semana 17 (119 días calendario en total).

### RN-02: Hitos Académicos Invariables
- **Semana 8:** Corresponde reglamentariamente a la semana de Evaluaciones Parciales (Medio Término).
- **Semana 17:** Corresponde reglamentariamente a la semana de Evaluaciones Finales y cierre definitivo del acta lectiva.

### RN-03: Escala Vigesimal Oficial
Todas las calificaciones se expresan en escala numérica de **0.00 a 20.00 puntos**:
- Menor a 10.50: Desaprobado.
- De 10.50 a 13.49: Aprobado regular / en curso.
- De 13.50 a 16.49: Rendimiento bueno.
- De 16.50 a 20.00: Rendimiento sobresaliente / excelencia académica.

### RN-04: Fórmula de Promedio Final de Asignatura
El promedio final ($PF$) de cada curso con sistema tradicional se calcula promediando los tres componentes con igual peso ponderado:
$$PF = \frac{EP + PP + EF}{3}$$
Donde $EP$ es el Examen Parcial, $PP$ es el Promedio de Prácticas y $EF$ es el Examen Final.

### RN-05: Criterio de Aprobación y Redondeo Favorable
La nota mínima aprobatoria es **10.5**. En actas oficiales y reportes finales, toda fracción igual o superior a 0.5 puntos se redondea al número entero inmediato superior en beneficio del estudiante (ej. $10.50 \rightarrow 11$).

### RN-06: Promedio Ponderado Acumulado del Semestre
El Promedio Ponderado Semestral ($PPS$) se rige por la suma de los productos de la nota acumulada de cada asignatura por su número de créditos, dividida entre la suma total de créditos de las materias matriculadas:
$$PPS = \frac{\sum_{i=1}^{n} (\text{Nota}_i \times \text{Créditos}_i)}{\sum_{i=1}^{n} \text{Créditos}_i}$$

### RN-07: Inhabilitación por Límite de Inasistencias (Art. 31 RGE)
El estudiante que acumule el **30% o más** de inasistencias injustificadas sobre el total de sesiones programadas para una asignatura en las 17 semanas lectivas queda automáticamente en condición de **Inhabilitado por Faltas (DPI)**, perdiendo el derecho a rendir evaluaciones finales y desaprobando la materia.

### RN-08: Umbrales Preventivos de Asistencia
El sistema debe calcular proactivamente las faltas restantes y alertar en tres momentos clave:
- **10% de faltas:** Alerta preventiva leve (Notificación informativa).
- **20% de faltas:** Alerta de precaución moderada (Riesgo potencial).
- **30% de faltas:** Alerta crítica de inhabilitación inmediata.

### RN-09: Exclusión de Feriados y Clases Canceladas
Las sesiones declaradas como feriado oficial o marcadas como clase suspendida por el docente se excluyen del denominador del total de clases programadas, no contabilizándose como falta ni afectando negativamente el porcentaje de asistencia.

### RN-10: Cómputo por Defecto de Asistencia Histórica
Toda sesión de clase transcurrida en el calendario hasta la fecha y hora presente se presume asistida favorablemente por defecto, salvo que el estudiante registre explícitamente una inasistencia (falta) o justificación. Las faltas debidamente justificadas no se computan dentro del 30% sancionable.

### RN-11: Criterio de Ventana Libre (Huecos entre Clases)
Se define como *Hueco Libre* todo intervalo de tiempo sin actividades académicas programadas que cumpla simultáneamente con:
1. Tener una duración igual o mayor a **30 minutos**.
2. Estar comprendido entre dos clases programadas del mismo día lectivo.
3. No extenderse fuera de la ventana de horario activo del estudiante (por defecto 07:00 a 22:00).

### RN-12: Matriz de Prioridad y Criticidad de Tareas
El orden de prioridad de una tarea se determina según su urgencia temporal y su nivel de importancia (1 a 5):
- **Nivel 5:** Crítica / Evaluación mayor (Exámenes, entregas de proyecto final).
- **Nivel 4:** Alta / Prácticas calificadas o informes grupales.
- **Nivel 3:** Media / Tareas regulares o lecturas semanales.
- **Nivel 2:** Baja / Actividades secundarias o repasos sugeridos.
- **Nivel 1:** Informativa / Recordatorios breves.
Las tareas con vencimiento en menos de 48 horas o de importancia $\ge 4$ se clasifican automáticamente como "Próximas y Críticas".

### RN-13: Soberanía de Datos y Restricción de Transferencia QR
Al generar un código QR para compartir el horario de clases:
- **Datos incluidos:** Nombre de asignatura, créditos, profesor, aula, grupo, color distintivo, días de sesión, hora de inicio y hora de fin.
- **Datos estrictamente excluidos:** Notas parciales y finales, historial de asistencia, faltas acumuladas, tareas personales, notas de texto privadas y cualquier identificación de usuario.

---

## 5. Matriz de Trazabilidad entre Requerimientos y Reglas

| Requerimiento Funcional | Reglas de Negocio Vinculadas | Requerimientos No Funcionales |
|---|---|---|
| **RF-01 a RF-04 (Ciclo 17 semanas)** | RN-01, RN-02, RN-09 | RNF-01, RNF-02, RNF-13 |
| **RF-05 a RF-07 (Catálogo Cursos)** | RN-06 | RNF-03, RNF-05, RNF-07 |
| **RF-08 a RF-11 (Horario Semanal)** | RN-01, RN-11 | RNF-08, RNF-09, RNF-10 |
| **RF-12 a RF-15 (Vista Hoy / Sesión)** | RN-09, RN-10 | RNF-07, RNF-08, RNF-11 |
| **RF-16 a RF-18 (Control Asistencia)** | RN-07, RN-08, RN-09, RN-10 | RNF-01, RNF-04, RNF-13 |
| **RF-19 a RF-23 (Notas y Rendimiento)** | RN-03, RN-04, RN-05, RN-06 | RNF-01, RNF-05, RNF-13 |
| **RF-24 a RF-26 (Tareas y Prioridad)** | RN-12 | RNF-07, RNF-08, RNF-10 |
| **RF-27 a RF-28 (Huecos Libres)** | RN-11, RN-12 | RNF-01, RNF-07, RNF-12 |
| **RF-29 a RF-32 (Compartir por QR)** | RN-13 | RNF-04, RNF-05, RNF-06 |
| **RF-33 a RF-35 (Datos y Ajustes)** | RN-01, RN-03, RN-07 | RNF-01, RNF-02, RNF-03 |

---
*UNUmbral — Ingeniería de Software y Sistemas Académicos.*
