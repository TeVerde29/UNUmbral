# Política de Privacidad de UNUmbral

> **Última actualización:** 29 de octubre de 2026  
> **Compromiso principal:** UNUmbral es una aplicación 100% offline y *Local-First*. Tus datos académicos y personales nunca salen de tu dispositivo.

---

## 1. Introducción y Filosofía del Proyecto

**UNUmbral** es una herramienta de organización académica y personal diseñada para estudiantes universitarios. A diferencia de las plataformas tradicionales basadas en la nube, UNUmbral se rige por el principio de **cero recolección de datos (*Zero-Knowledge / Zero-Tracking*)**. No tenemos servidores externos, no requerimos la creación de cuentas en línea y no recopilamos información personal, académica ni de telemetría.

---

## 2. Información Procesada y Almacenamiento Local

Todos los datos introducidos o generados en UNUmbral se almacenan exclusivamente en la base de datos local **IndexedDB** (`UmbralDB`, esquema versión 5) de tu navegador web o dentro del contenedor de la aplicación nativa en Android.

Los datos gestionados son:
- **Ciclos Académicos:** Fechas de inicio y fin del semestre (proyección reglamentaria de 17 semanas) y estado del ciclo.
- **Asignaturas y Cursos:** Nombre, créditos, profesor, aula habitual, código de curso, grupo/sección, notas de comentarios y color asignado.
- **Horario y Actividades:** Sesiones semanales de clase y actividades no académicas (prácticas pre-profesionales, empleo, talleres, deporte).
- **Calificaciones y Evaluaciones:** Exámenes parciales, exámenes finales y prácticas en escala vigesimal (0 a 20).
- **Control de Asistencia:** Historial de sesiones asistidas, faltas y justificaciones.
- **Tareas y Entregas:** Títulos, fechas límite, nivel de importancia (1 a 5), enlaces y estado de culminación.
- **Perfil Estudiantil Local:** Nombre completo, código universitario, DNI, facultad, escuela profesional, teléfono y correo electrónico ingresados voluntariamente en la sección de Ajustes para personalizar la ficha académica.
- **Preferencias de la Aplicación:** Horas de silencio, ventana de detección de huecos libres y configuración de alertas.

> **Importante:** Ninguno de estos registros se transmite, sincroniza ni almacena en servidores externos o de terceros.

---

## 3. Uso de Permisos del Dispositivo

UNUmbral solicita únicamente los permisos estrictamente indispensables para su funcionamiento local:

### 3.1. Cámara (Escaneo de Horario por QR)
* **Propósito:** Permitir al usuario apuntar la cámara a la pantalla de un compañero o a una imagen para importar un horario.
* **Procesamiento:** Los fotogramas son analizados **en tiempo real y en la memoria RAM del dispositivo** mediante el motor cliente de código abierto `jsQR`.
* **Garantía:** No se toman fotografías permanentes, no se graban vídeos ni se envían imágenes a ningún servidor. Una vez detectado el código QR, el acceso a la cámara se cierra de inmediato.

### 3.2. Notificaciones Locales (Alertas de Clases y Tareas)
* **Propósito:** Recordar el inicio de clases (30 y 10 minutos antes), entregas de tareas y resumen matutino diario.
* **Procesamiento:** En Android (vía Capacitor LocalNotifications) y en navegadores compatibles (Notification API), las alertas se programan en el temporizador o gestor de alarmas nativo del sistema operativo del dispositivo.
* **Garantía:** No se utilizan servicios de mensajería push remota en la nube (sin Firebase Cloud Messaging, sin Apple Push Notification service, sin intermediarios). Las alertas se generan de forma autónoma aun cuando el dispositivo se encuentre en Modo Avión o sin conexión a internet.

---

## 4. Compartir Información y Códigos QR

UNUmbral incluye funciones para compartir el horario entre compañeros sin intermediarios de red:

1. **Transferencia Física P2P mediante Código QR:**  
   Al presionar "Compartir Horario", la aplicación comprime el catálogo de cursos y sus horas semanales mediante el algoritmo estándar Deflate (Zlib) y genera un código QR en pantalla. La transferencia ocurre ópticamente (pantalla a cámara).
2. **Privacidad por Diseño en el Horario:**  
   El código QR y el archivo `UNUmbral_Horario_YYYY-MM-DD.json` **únicamente contienen nombres de asignaturas, profesor, aula y bloques horarios**. Tus calificaciones, promedio ponderado, registro de inasistencias, tareas pendientes y datos de perfil personal **nunca se incluyen** al compartir el horario.
3. **Copias de Seguridad Completas:**  
   La opción "Crear Backup Completo" genera un archivo `UNUmbral_Backup_YYYY-MM-DD.json` que contiene tu base de datos integral. Este archivo se descarga directamente en tu carpeta local de descargas bajo tu custodia.

---

## 5. Cero Telemetría, Analítica y Publicidad

* **Sin rastreo:** No utilizamos Google Analytics, Mixpanel, Sentry ni ninguna otra librería de seguimiento.
* **Sin cookies de terceros:** El almacenamiento se limita a las bases de datos locales del usuario (`IndexedDB` y `localStorage` para la clave de tema claro/oscuro).
* **Sin publicidad:** La aplicación no incluye anuncios publicitarios, redes de afiliados ni SDKs de monetización.

---

## 6. Control, Portabilidad y Supresión de Datos (Derechos del Usuario)

En virtud de la arquitectura *Local-First*, tú eres el único propietario y custodio de tu información:

* **Acceso y Portabilidad:** Puedes inspeccionar todos tus datos en la aplicación y descargarlos íntegramente en formato abierto `.json` desde la pestaña **Compartir**.
* **Modificación:** Puedes editar cualquier curso, nota, asistencia o tarea directamente desde sus respectivos paneles.
* **Supresión Definitiva (Borrado Total):** En cualquier momento puedes eliminar toda la información almacenada presionando el botón **"Vaciar Base de Datos"** dentro de la pestaña de **Ajustes**. Esta acción destruye irreversiblemente todas las tablas locales de `IndexedDB` en tu dispositivo.

---

## 7. Seguridad de los Datos

Dado que la información se almacena localmente en tu navegador o dispositivo móvil, la seguridad depende de las medidas de protección de tu propio equipo (código de bloqueo, huella dactilar, cifrado de disco del sistema operativo). Te recomendamos no compartir copias de seguridad completas `.json` con personas no autorizadas si has registrado información confidencial en tus notas personales.

---

## 8. Código Abierto y Auditoría

UNUmbral es un proyecto de código abierto publicado bajo la licencia **MIT**. Cualquier usuario o desarrollador puede auditar el código fuente completo, verificar la ausencia de llamadas a red y confirmar la veracidad de esta política de privacidad en nuestro repositorio público:

👉 [https://github.com/TeVerde29/unumbral](https://github.com/TeVerde29/unumbral)

---

## 9. Contacto

Si tienes preguntas sobre la arquitectura de privacidad o deseas reportar una observación técnica, puedes abrir una incidencia (*Issue*) en el repositorio de GitHub o escribir al desarrollador:

* **Autor:** Té Verde  
* **GitHub:** [@TeVerde29](https://github.com/TeVerde29)  
* **Correo:** [hikih020@gmail.com](mailto:hikih020@gmail.com)
