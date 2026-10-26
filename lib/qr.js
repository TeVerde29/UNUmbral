/**
 * UNUmbral — lib/qr.js
 * Lógica pura para comprimir, descomprimir y ensamblar horarios compartidos
 * vía códigos QR offline (soporta QR único y QR multiparte).
 */

(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.UNUmbralQR = mod;
    Object.assign(root, mod);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PREFIJO_QR = "UNU1:";

  /**
   * Codifica texto UTF-8 a Base64URL de forma segura en Node y navegadores.
   */
  function utf8ToBase64Url(str) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf8").toString("base64url");
    }
    const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
    return btoa(utf8Bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /**
   * Decodifica Base64URL a texto UTF-8 de forma segura en Node y navegadores.
   */
  function base64UrlToUtf8(b64url) {
    if (!b64url || typeof b64url !== "string") return "";
    if (typeof Buffer !== "undefined") {
      return Buffer.from(b64url, "base64url").toString("utf8");
    }
    let base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = Array.from(binary).map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("");
    return decodeURIComponent(bytes);
  }

  /**
   * Comprime un horario compartido (formato v2) en una o más cadenas QR.
   *
   * @param {object} horarioCompartido - Objeto unumbral-horario-compartido { cursos, clases }
   * @param {number} [maxCharsPerQr=1600] - Límite de caracteres por QR (≤ 1.8 KB para lectura ágil en cámaras móviles)
   * @returns {string[]} Lista de strings listos para generar QR (ej: ["UNU1:..."] o ["UNU1:1/2:...", "UNU1:2/2:..."])
   */
  function comprimirHorarioParaQr(horarioCompartido, maxCharsPerQr = 1600) {
    if (!horarioCompartido || typeof horarioCompartido !== "object") {
      throw new Error("Objeto de horario compartido inválido");
    }

    const cursos = Array.isArray(horarioCompartido.cursos) ? horarioCompartido.cursos : [];
    const clases = Array.isArray(horarioCompartido.clases) ? horarioCompartido.clases : [];

    // Formato ultra-compacto
    const compacto = {
      v: 2,
      c: cursos.map(c => [
        c.id || "",
        c.nombre || "",
        c.color || "",
        c.aula || "",
        c.profesor || "",
        Number(c.creditos) || 3
      ]),
      k: clases.map(k => [
        k.curso_id || "",
        k.dia_semana || "",
        k.hora_inicio || "",
        k.hora_fin || "",
        k.aula || ""
      ])
    };

    const jsonStr = JSON.stringify(compacto);
    const b64Payload = utf8ToBase64Url(jsonStr);

    if (b64Payload.length <= maxCharsPerQr) {
      return [`${PREFIJO_QR}${b64Payload}`];
    }

    // Dividir en multiparte
    const partes = [];
    const totalPartes = Math.ceil(b64Payload.length / maxCharsPerQr);
    for (let i = 0; i < totalPartes; i++) {
      const chunk = b64Payload.slice(i * maxCharsPerQr, (i + 1) * maxCharsPerQr);
      partes.push(`${PREFIJO_QR}${i + 1}/${totalPartes}:${chunk}`);
    }

    return partes;
  }

  /**
   * Descomprime una lectura de QR o parte de un QR.
   *
   * @param {string} textoQr
   * @returns {{ esMultiparte: boolean, horario?: object, parte?: number, total?: number, contenido?: string }}
   */
  function descomprimirHorarioDeQr(textoQr) {
    if (!textoQr || typeof textoQr !== "string" || !textoQr.startsWith(PREFIJO_QR)) {
      throw new Error("Formato QR no reconocido: debe iniciar con el prefijo " + PREFIJO_QR);
    }

    const resto = textoQr.slice(PREFIJO_QR.length);

    // Verificar si es multiparte: "1/3:contenido"
    const matchMulti = resto.match(/^(\d+)\/(\d+):(.+)$/s);
    if (matchMulti) {
      const parte = parseInt(matchMulti[1], 10);
      const total = parseInt(matchMulti[2], 10);
      const contenido = matchMulti[3];
      return {
        esMultiparte: true,
        parte,
        total,
        contenido
      };
    }

    // Es un QR único completo
    const jsonStr = base64UrlToUtf8(resto);
    let compacto;
    try {
      compacto = JSON.parse(jsonStr);
    } catch {
      throw new Error("Error decodificando el contenido del código QR");
    }

    if (!compacto || compacto.v !== 2 || !Array.isArray(compacto.c) || !Array.isArray(compacto.k)) {
      throw new Error("Estructura de horario en QR incompatible o corrupta");
    }

    const horario = {
      tipo: "unumbral-horario-compartido",
      version: 2,
      exportado_el: new Date().toISOString(),
      cursos: compacto.c.map(r => ({
        id: String(r[0] || ""),
        nombre: String(r[1] || ""),
        color: String(r[2] || ""),
        aula: String(r[3] || ""),
        profesor: String(r[4] || ""),
        creditos: Number(r[5]) || 3
      })),
      clases: compacto.k.map(r => ({
        curso_id: String(r[0] || ""),
        dia_semana: String(r[1] || ""),
        hora_inicio: String(r[2] || ""),
        hora_fin: String(r[3] || ""),
        aula: String(r[4] || "")
      }))
    };

    return {
      esMultiparte: false,
      horario
    };
  }

  /**
   * Ensambla una lista o mapa de partes de un QR multiparte.
   *
   * @param {Array<string|object>} partes - Array de textos QR o de objetos { parte, total, contenido }
   * @returns {{ completo: boolean, horario?: object, faltantes?: number[], progreso: string }}
   */
  function ensamblarQrMultiparte(partes = []) {
    if (!Array.isArray(partes) || partes.length === 0) {
      return { completo: false, faltantes: [], progreso: "0/0" };
    }

    const mapa = new Map();
    let totalEsperado = 0;

    for (const p of partes) {
      let info;
      if (typeof p === "string") {
        try {
          info = descomprimirHorarioDeQr(p);
        } catch {
          continue;
        }
      } else if (p && typeof p === "object") {
        info = p;
      }

      if (info && info.esMultiparte && info.parte && info.total && info.contenido) {
        totalEsperado = info.total;
        mapa.set(info.parte, info.contenido);
      }
    }

    if (totalEsperado === 0) {
      return { completo: false, faltantes: [], progreso: "0/0" };
    }

    const faltantes = [];
    for (let i = 1; i <= totalEsperado; i++) {
      if (!mapa.has(i)) {
        faltantes.push(i);
      }
    }

    if (faltantes.length > 0) {
      return {
        completo: false,
        faltantes,
        progreso: `${mapa.size}/${totalEsperado}`
      };
    }

    // Unir todas las partes en orden
    let payloadUnido = "";
    for (let i = 1; i <= totalEsperado; i++) {
      payloadUnido += mapa.get(i);
    }

    // Descomprimir el payload consolidado
    const resultado = descomprimirHorarioDeQr(`${PREFIJO_QR}${payloadUnido}`);
    return {
      completo: true,
      horario: resultado.horario,
      progreso: `${totalEsperado}/${totalEsperado}`
    };
  }

  return {
    PREFIJO_QR,
    utf8ToBase64Url,
    base64UrlToUtf8,
    comprimirHorarioParaQr,
    descomprimirHorarioDeQr,
    ensamblarQrMultiparte
  };
});
