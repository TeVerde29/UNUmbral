/**
 * UNUmbral — lib/rendimiento.js
 * Lógica pura de cálculo de notas, promedio ponderado universitario por créditos,
 * simulador de metas de fin de ciclo y generación de gráficos SVG nativos.
 * 100% offline, sin dependencias de DOM, Dexie ni Capacitor para node --test.
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.UNUmbralRendimiento = mod;
    Object.assign(root, mod);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NOTA_APROBATORIA = 10.5;
  const NOTA_MAXIMA = 20;
  const NOTA_UMBRAL_RIESGO = 14;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calcula el promedio de un conjunto de prácticas registradas.
 * @param {Array<{ nota: number|null }>} practicas
 * @returns {number|null}
 */
function promedioPracticas(practicas = []) {
  if (!Array.isArray(practicas) || practicas.length === 0) return null;
  const validas = practicas
    .map(p => p && p.nota !== null && p.nota !== undefined ? Number(p.nota) : null)
    .filter(n => n !== null && Number.isFinite(n) && n >= 0 && n <= NOTA_MAXIMA);

  if (validas.length === 0) return null;
  const suma = validas.reduce((acc, val) => acc + val, 0);
  return round2(suma / validas.length);
}

/**
 * Calcula el rendimiento detallado de un curso en escala vigesimal (0–20).
 * Promedio = (Parcial + Final + Promedio de Prácticas) / 3
 * 
 * @param {Object} ev { parcial, final, practicas }
 * @returns {Object}
 */
function calcularRendimientoDetallado(ev = {}) {
  const parcial = (ev.parcial !== null && ev.parcial !== undefined && Number.isFinite(Number(ev.parcial)))
    ? Math.min(NOTA_MAXIMA, Math.max(0, Number(ev.parcial)))
    : null;

  const final = (ev.final !== null && ev.final !== undefined && Number.isFinite(Number(ev.final)))
    ? Math.min(NOTA_MAXIMA, Math.max(0, Number(ev.final)))
    : null;

  const pp = promedioPracticas(ev.practicas || []);

  const componentes = [
    { nombre: "Parcial", valor: parcial },
    { nombre: "Prácticas", valor: pp },
    { nombre: "Final", valor: final }
  ];

  const presentes = componentes.filter(c => c.valor !== null);
  const faltantes = componentes.filter(c => c.valor === null);

  const sumaActual = presentes.reduce((acc, c) => acc + c.valor, 0);
  const acumulado = round2(sumaActual / 3);

  const completo = faltantes.length === 0;
  const promedio = completo ? round2(sumaActual / 3) : null;

  // Para aprobar se necesita suma total de los 3 >= 31.5 (porque 31.5 / 3 = 10.5)
  const sumaMeta = 31.5;
  const faltantePuntos = Math.max(0, round2(sumaMeta - sumaActual));
  const requeridoPorComponente = faltantes.length > 0 ? round2(faltantePuntos / faltantes.length) : 0;

  let estado = "sin-notas";
  if (completo) {
    estado = promedio >= NOTA_APROBATORIA ? "aprobado" : "desaprobado";
  } else if (presentes.length > 0) {
    if (requeridoPorComponente <= 0) {
      estado = "asegurado";
    } else if (requeridoPorComponente > NOTA_MAXIMA) {
      estado = "sin-opcion";
    } else if (requeridoPorComponente > NOTA_UMBRAL_RIESGO) {
      estado = "en-riesgo";
    } else {
      estado = "en-curso";
    }
  }

  return {
    parcial,
    final,
    pp,
    notasPresentes: presentes.length,
    notasFaltantes: faltantes.length,
    acumulado,
    promedio,
    completo,
    aprobado: promedio !== null ? promedio >= NOTA_APROBATORIA : null,
    requeridoPorComponente,
    faltantePuntos,
    estado
  };
}

/**
 * Calcula el promedio ponderado semestral de los cursos matriculados según sus créditos.
 * Promedio Ponderado = Suma(Promedio_i * Creditos_i) / Suma(Creditos_i)
 * 
 * @param {Array<{ creditos: number, evaluacion: Object }>} cursos
 * @param {boolean} [soloCompletos=true] Si es true, solo toma cursos con las 3 notas cerradas.
 * @returns {number|null}
 */
function promedioPonderado(cursos = [], soloCompletos = true) {
  if (!Array.isArray(cursos) || cursos.length === 0) return null;

  let sumaProductos = 0;
  let sumaCreditos = 0;

  for (const c of cursos) {
    const cred = Math.max(1, Math.min(10, Number(c.creditos) || 3));
    const r = calcularRendimientoDetallado(c.evaluacion);

    const valorNota = soloCompletos ? r.promedio : (r.promedio !== null ? r.promedio : r.acumulado);

    if (valorNota !== null && (!soloCompletos || r.completo)) {
      sumaProductos += valorNota * cred;
      sumaCreditos += cred;
    }
  }

  if (sumaCreditos === 0) return null;
  return round2(sumaProductos / sumaCreditos);
}

/**
 * Genera el resumen global ponderado del ciclo para el estudiante.
 * 
 * @param {Array<{ id: string, nombre: string, creditos: number, evaluacion: Object }>} cursos
 * @returns {Object}
 */
function resumenPonderadoCompleto(cursos = []) {
  let creditosTotales = 0;
  let creditosAprobados = 0;
  let creditosCompletados = 0;
  let cursosAprobados = 0;
  let cursosDesaprobados = 0;
  let cursosEnCurso = 0;

  const filas = cursos.map(c => {
    const cred = Math.max(1, Math.min(10, Number(c.creditos) || 3));
    creditosTotales += cred;
    const r = calcularRendimientoDetallado(c.evaluacion);

    if (r.completo) {
      creditosCompletados += cred;
      if (r.aprobado) {
        creditosAprobados += cred;
        cursosAprobados++;
      } else {
        cursosDesaprobados++;
      }
    } else {
      if (r.estado === "asegurado") {
        creditosAprobados += cred;
        cursosAprobados++;
      } else {
        cursosEnCurso++;
      }
    }

    return {
      id: c.id,
      nombre: c.nombre,
      color: c.color,
      creditos: cred,
      rendimiento: r
    };
  });

  const pondOficial = promedioPonderado(cursos, true);
  const pondProvisional = promedioPonderado(cursos, false);

  return {
    totalCursos: cursos.length,
    creditosTotales,
    creditosAprobados,
    creditosCompletados,
    cursosAprobados,
    cursosDesaprobados,
    cursosEnCurso,
    promedioPonderadoOficial: pondOficial,
    promedioPonderadoProvisional: pondProvisional,
    filas
  };
}

/**
 * Simulador de metas: ¿Qué notas necesito en mis evaluaciones pendientes para terminar con X ponderado?
 * 
 * @param {Array<{ id: string, nombre: string, creditos: number, evaluacion: Object }>} cursos
 * @param {number} [metaPonderado=14]
 * @returns {Object}
 */
function simuladorMeta(cursos = [], metaPonderado = 14) {
  const meta = Math.min(NOTA_MAXIMA, Math.max(NOTA_APROBATORIA, Number(metaPonderado) || 14));
  let sumaCreditos = 0;
  let puntosPonderadosObjetivo = 0;
  let puntosPonderadosAsegurados = 0;
  let pesoFaltanteTotal = 0;

  const cursosSim = cursos.map(c => {
    const cred = Math.max(1, Math.min(10, Number(c.creditos) || 3));
    sumaCreditos += cred;
    const r = calcularRendimientoDetallado(c.evaluacion);

    // Cada curso contribuye con (parcial + pp + final)/3 * creditos
    // Peso de cada componente = cred / 3
    const pesoComponente = cred / 3;

    let ptsCurso = 0;
    let componentesFaltantes = 0;

    if (r.parcial !== null) ptsCurso += r.parcial * pesoComponente;
    else componentesFaltantes++;

    if (r.pp !== null) ptsCurso += r.pp * pesoComponente;
    else componentesFaltantes++;

    if (r.final !== null) ptsCurso += r.final * pesoComponente;
    else componentesFaltantes++;

    puntosPonderadosAsegurados += ptsCurso;
    pesoFaltanteTotal += componentesFaltantes * pesoComponente;

    return {
      id: c.id,
      nombre: c.nombre,
      creditos: cred,
      componentesFaltantes,
      pesoComponente,
      rendimiento: r
    };
  });

  puntosPonderadosObjetivo = meta * sumaCreditos;
  const puntosPonderadosFaltantes = Math.max(0, puntosPonderadosObjetivo - puntosPonderadosAsegurados);

  // Nota uniforme requerida en las evaluaciones pendientes
  const notaRequeridaUniforme = pesoFaltanteTotal > 0
    ? round2(puntosPonderadosFaltantes / pesoFaltanteTotal)
    : 0;

  const esFactible = notaRequeridaUniforme <= NOTA_MAXIMA;
  const yaAlcanzada = puntosPonderadosFaltantes <= 0;

  return {
    meta,
    sumaCreditos,
    puntosPonderadosObjetivo: round2(puntosPonderadosObjetivo),
    puntosPonderadosAsegurados: round2(puntosPonderadosAsegurados),
    puntosPonderadosFaltantes: round2(puntosPonderadosFaltantes),
    notaRequeridaUniforme,
    esFactible,
    yaAlcanzada,
    cursosSim
  };
}

/**
 * Genera un gráfico de barras comparativas horizontal en SVG nativo.
 * Incluye línea de corte de 10.5 y colores según estado.
 * 
 * @param {Array<{ nombre: string, color?: string, promedio: number|null, acumulado: number }>} datosCursos
 * @param {number} [ancho=340]
 * @param {number} [alto=220]
 * @returns {string} Código SVG
 */
function generarSvgBarrasComparativas(datosCursos = [], ancho = 340, alto = 220) {
  let customBarHeight = null;
  if (typeof ancho === "object" && ancho !== null) {
    const opts = ancho;
    customBarHeight = Number(opts.barHeight) || null;
    alto = Number(opts.height) || 220;
    ancho = Number(opts.width) || 360;
  }
  ancho = Number(ancho) || 340;
  alto = Number(alto) || 220;

  if (!datosCursos || datosCursos.length === 0) {
    return `<svg width="${ancho}" height="60" viewBox="0 0 ${ancho} 60" xmlns="http://www.w3.org/2000/svg"><text x="${ancho / 2}" y="35" text-anchor="middle" font-size="12" fill="#888">Sin datos de cursos</text></svg>`;
  }

  const margenIzq = 118;
  const margenDer = 42;
  const margenTop = 26;
  const margenBottom = 16;

  const anchoUtil = Math.max(80, ancho - margenIzq - margenDer);
  const barHeight = customBarHeight || Math.min(22, Math.max(14, Math.floor((alto - margenTop - margenBottom) / datosCursos.length - 8)));
  const gap = 10;
  const altoReal = margenTop + datosCursos.length * (barHeight + gap) + margenBottom;

  // Coordenada X de la nota 10.5
  const x10_5 = round2(margenIzq + (NOTA_APROBATORIA / NOTA_MAXIMA) * anchoUtil);

  let barsHtml = "";

  datosCursos.forEach((c, i) => {
    const y = margenTop + i * (barHeight + gap);
    let prom = typeof c.promedio === "number" && Number.isFinite(c.promedio) ? c.promedio : null;
    let acum = typeof c.acumulado === "number" && Number.isFinite(c.acumulado) ? c.acumulado : null;
    let sinNotas = false;

    if (prom === null && acum === null && c.evaluacion) {
      const det = calcularRendimientoDetallado(c.evaluacion);
      prom = det.promedio;
      acum = det.acumulado;
      sinNotas = det.sinNotas;
    }

    const valorBruto = prom !== null ? prom : (acum !== null ? acum : 0);
    const valor = Number.isFinite(Number(valorBruto)) ? Math.max(0, Math.min(NOTA_MAXIMA, Number(valorBruto))) : 0;
    const barW = sinNotas ? 4 : Math.max(4, round2((valor / NOTA_MAXIMA) * anchoUtil));
    const nombreStr = String(c.nombre || "Curso");
    const labelCurso = nombreStr.length > 16 ? nombreStr.slice(0, 15) + "…" : nombreStr;
    const barColor = c.color || (valor >= NOTA_APROBATORIA ? "#AFC49A" : "#FCA5A5");
    const textoNota = sinNotas ? "—" : valor.toFixed(1);

    barsHtml += `
      <g class="svg-bar-row">
        <text x="${margenIzq - 8}" y="${round2(y + barHeight * 0.72)}" text-anchor="end" font-size="11" font-weight="600" fill="currentColor">${labelCurso}</text>
        <rect x="${margenIzq}" y="${y}" width="${anchoUtil}" height="${barHeight}" rx="5" fill="currentColor" opacity="0.06"></rect>
        <rect x="${margenIzq}" y="${y}" width="${barW}" height="${barHeight}" rx="5" fill="${barColor}" opacity="${sinNotas ? "0.35" : "0.92"}"></rect>
        <text x="${round2(margenIzq + barW + 6)}" y="${round2(y + barHeight * 0.72)}" font-size="10.5" font-weight="700" font-family="monospace" fill="currentColor">${textoNota}</text>
      </g>
    `;
  });

  return `
    <svg width="100%" height="${altoReal}" viewBox="0 0 ${ancho} ${altoReal}" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Guía de fondo 10.5 -->
      <line x1="${x10_5}" y1="${margenTop - 6}" x2="${x10_5}" y2="${altoReal - margenBottom + 2}" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.85"></line>
      <text x="${x10_5}" y="${margenTop - 10}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#F59E0B">10.5 Mín.</text>

      <!-- Barras -->
      ${barsHtml}
    </svg>
  `;
}

/**
 * Genera un gráfico SVG nativo de línea de evolución para las notas de un curso.
 * 
 * @param {Object} curso { nombre, evaluacion: { parcial, final, practicas } }
 * @param {number} [ancho=320]
 * @param {number} [alto=140]
 * @returns {string} Código SVG
 */
function generarSvgEvolucionCurso(curso, ancho = 320, alto = 140) {
  if (typeof ancho === "object" && ancho !== null) {
    alto = Number(ancho.height) || 140;
    ancho = Number(ancho.width) || 320;
  }
  ancho = Number(ancho) || 320;
  alto = Number(alto) || 140;

  if (!curso || !curso.evaluacion) {
    return `<svg width="${ancho}" height="60" viewBox="0 0 ${ancho} 60"><text x="${ancho / 2}" y="35" text-anchor="middle" font-size="12" fill="#888">Sin evaluaciones</text></svg>`;
  }

  const puntos = [];
  const ev = curso.evaluacion;

  if (Array.isArray(ev.practicas)) {
    ev.practicas.forEach((p, idx) => {
      if (p.nota !== null && p.nota !== undefined && Number.isFinite(Number(p.nota))) {
        puntos.push({ label: `P${idx + 1}`, valor: Number(p.nota) });
      }
    });
  }

  if (ev.parcial !== null && ev.parcial !== undefined && Number.isFinite(Number(ev.parcial))) {
    puntos.push({ label: "Parcial", valor: Number(ev.parcial) });
  }

  if (ev.final !== null && ev.final !== undefined && Number.isFinite(Number(ev.final))) {
    puntos.push({ label: "Final", valor: Number(ev.final) });
  }

  if (puntos.length === 0) {
    return `<svg width="${ancho}" height="60" viewBox="0 0 ${ancho} 60"><text x="${ancho / 2}" y="35" text-anchor="middle" font-size="12" fill="#888">Sin notas registradas</text></svg>`;
  }

  const margenIzq = 30;
  const margenDer = 25;
  const margenTop = 20;
  const margenBottom = 26;

  const w = ancho - margenIzq - margenDer;
  const h = alto - margenTop - margenBottom;

  const getY = (val) => round2(margenTop + h - (val / NOTA_MAXIMA) * h);
  const getX = (idx) => puntos.length === 1 ? margenIzq + w / 2 : round2(margenIzq + (idx / (puntos.length - 1)) * w);

  const y10_5 = getY(NOTA_APROBATORIA);

  const polylineCoords = puntos.map((p, i) => `${getX(i)},${getY(p.valor)}`).join(" ");

  let nodesHtml = "";
  puntos.forEach((p, i) => {
    const cx = getX(i);
    const cy = getY(p.valor);
    const color = p.valor >= NOTA_APROBATORIA ? "#10B981" : "#EF4444";
    nodesHtml += `
      <g>
        <circle cx="${cx}" cy="${cy}" r="4.5" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"></circle>
        <text x="${cx}" y="${cy - 7}" text-anchor="middle" font-size="9.5" font-weight="700" font-family="monospace" fill="currentColor">${Number(p.valor).toFixed(1)}</text>
        <text x="${cx}" y="${alto - 8}" text-anchor="middle" font-size="9" font-weight="600" fill="currentColor" opacity="0.75">${p.label}</text>
      </g>
    `;
  });

  return `
    <svg width="100%" height="${alto}" viewBox="0 0 ${ancho} ${alto}" xmlns="http://www.w3.org/2000/svg" style="display:block; overflow:visible; font-family:system-ui,-apple-system,sans-serif;">
      <!-- Línea base 10.5 -->
      <line x1="${margenIzq}" y1="${y10_5}" x2="${ancho - margenDer}" y2="${y10_5}" stroke="#F59E0B" stroke-width="1" stroke-dasharray="3,3" opacity="0.7"></line>
      <text x="${ancho - margenDer + 3}" y="${y10_5 + 3}" font-size="8.5" fill="#F59E0B" font-weight="700">10.5</text>

      <!-- Línea poligonal -->
      ${puntos.length > 1 ? `<polyline points="${polylineCoords}" fill="none" stroke="var(--deep-leaf, #22432C)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"></polyline>` : ""}

      <!-- Nodos de nota -->
      ${nodesHtml}
    </svg>
  `;
}

  return {
    promedioPracticas,
    calcularRendimientoDetallado,
    promedioPonderado,
    resumenPonderadoCompleto,
    simuladorMeta,
    generarSvgBarrasComparativas,
    generarSvgEvolucionCurso
  };
});
