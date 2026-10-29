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
  const PREFIJO_QR_Z = "UNU1:Z:";

  /**
   * Codifica Uint8Array a Base64URL seguro en Node y navegadores.
   */
  function uint8ToBase64Url(u8) {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(u8).toString("base64url");
    }
    let binary = "";
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /**
   * Decodifica Base64URL a Uint8Array de forma segura.
   */
  function base64UrlToUint8(b64url) {
    if (!b64url || typeof b64url !== "string") return new Uint8Array(0);
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(b64url, "base64url"));
    }
    let base64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function getPakoInstance() {
    if (typeof window !== "undefined" && window.pako) {
      return window.pako;
    }
    if (typeof globalThis !== "undefined" && globalThis.pako) {
      return globalThis.pako;
    }
    try {
      if (typeof require !== "undefined") {
        return require("./pako.min.js");
      }
    } catch {
      try {
        if (typeof require !== "undefined") return require("pako");
      } catch {}
    }
    return null;
  }

  function comprimirPayload(str) {
    const pako = getPakoInstance();
    if (pako && typeof pako.deflateRaw === "function") {
      try {
        const u8 = (typeof TextEncoder !== "undefined") ? new TextEncoder().encode(str) : Buffer.from(str, "utf8");
        const def = pako.deflateRaw(u8);
        return { tipo: "z", payload: uint8ToBase64Url(def) };
      } catch (err) {
        console.warn("Deflate fallback:", err);
      }
    }
    if (typeof require !== "undefined") {
      try {
        const zlib = require("zlib");
        if (zlib && zlib.deflateRawSync) {
          const def = zlib.deflateRawSync(Buffer.from(str, "utf8"));
          return { tipo: "z", payload: def.toString("base64url") };
        }
      } catch {}
    }
    return { tipo: "u", payload: utf8ToBase64Url(str) };
  }

  function descomprimirPayload(tipo, b64url) {
    if (tipo === "z") {
      const pako = getPakoInstance();
      if (pako && typeof pako.inflateRaw === "function") {
        const u8 = base64UrlToUint8(b64url);
        const inf = pako.inflateRaw(u8);
        return (typeof TextDecoder !== "undefined") ? new TextDecoder().decode(inf) : Buffer.from(inf).toString("utf8");
      }
      if (typeof require !== "undefined") {
        try {
          const zlib = require("zlib");
          if (zlib && zlib.inflateRawSync) {
            const buf = Buffer.from(b64url, "base64url");
            return zlib.inflateRawSync(buf).toString("utf8");
          }
        } catch {}
      }
    }
    return base64UrlToUtf8(b64url);
  }

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

  const DICT_WORDS = [
    "Ing. Mg. ", "Ing. ", "Dr. ", "Dra. ", "Mg. ",
    "Lab. Redes", "Lab. Software", "Laboratorio ", "Aula ",
    "Ingeniería ", "Sistemas ", "Formulación ", "Evaluación ",
    "Inteligencia ", "Artificial", "Tecnologías ", "Información",
    "Investigación", "Prácticas ", "Profesionales", "Auditoría ",
    "Seguridad ", "Informática", "Software", "Curso Universitario ",
    "Profesor ", " de ", " y ", " en "
  ];

  const PALETA_QR = [
    "#38BDF8", "#34D399", "#FBBF24", "#F87171",
    "#A78BFA", "#FB923C", "#4ADE80", "#E879F9",
    "#818CF8", "#FB7185", "#2DD4BF", "#A3E635",
    "#FACC15", "#C084FC", "#FDA4AF", "#06B6D4",
    "#EA580C", "#60A5FA", "#10B981", "#94A3B8"
  ];

  function comprimirTextoDict(str) {
    if (!str || typeof str !== "string") return "";
    let out = str;
    for (let i = 0; i < DICT_WORDS.length; i++) {
      const token = String.fromCharCode(1 + i);
      if (out.includes(DICT_WORDS[i])) {
        out = out.split(DICT_WORDS[i]).join(token);
      }
    }
    return out;
  }

  function descomprimirTextoDict(str) {
    if (!str || typeof str !== "string") return "";
    let out = str;
    for (let i = DICT_WORDS.length - 1; i >= 0; i--) {
      const token = String.fromCharCode(1 + i);
      if (out.includes(token)) {
        out = out.split(token).join(DICT_WORDS[i]);
      }
    }
    return out;
  }

  const MAPA_COLOR_NORMALIZADO = {
    "#BAE6FD": 0,  // #38BDF8
    "#BBF7D0": 1,  // #34D399
    "#FEF08A": 2,  // #FBBF24
    "#FECACA": 3,  // #F87171
    "#DDD6FE": 4,  // #A78BFA
    "#FED7AA": 5,  // #FB923C
    "#DCFCE7": 6,  // #4ADE80
    "#F5D0FE": 7,  // #E879F9
    "#C7D2FE": 8,  // #818CF8
    "#FFE4E6": 9,  // #FB7185
    "#99F6E4": 10, // #2DD4BF
    "#ECFCCB": 11, // #A3E635
    "#FEF9C3": 12, // #FACC15
    "#E9D5FF": 13, // #C084FC
    "#CFFAFE": 15, // #06B6D4
    "#FFEDD5": 16, // #EA580C
    "#DBEAFE": 17, // #60A5FA
    "#D1FAE5": 18, // #10B981
    "#F1F5F9": 19  // #94A3B8
  };

  function comprimirColorQr(color) {
    if (!color || typeof color !== "string") return "";
    const upper = color.toUpperCase();
    const idx = PALETA_QR.indexOf(upper);
    if (idx >= 0) {
      return color === upper ? idx : ~idx;
    }
    if (MAPA_COLOR_NORMALIZADO[upper] !== undefined) {
      return MAPA_COLOR_NORMALIZADO[upper];
    }
    return color;
  }

  function descomprimirColorQr(val) {
    if (typeof val === "number") {
      if (val >= 0 && val < PALETA_QR.length) return PALETA_QR[val];
      const inv = ~val;
      if (inv >= 0 && inv < PALETA_QR.length) return PALETA_QR[inv].toLowerCase();
    }
    return String(val || "");
  }

  function comprimirHoraQr(h) {
    if (!h || typeof h !== "string") return "";
    return /^(\d{2}):(\d{2})$/.test(h) ? h.replace(":", "") : h;
  }

  function descomprimirHoraQr(h) {
    if (!h || typeof h !== "string") return "";
    return /^(\d{2})(\d{2})$/.test(h) ? `${h.slice(0, 2)}:${h.slice(2, 4)}` : h;
  }

  /**
   * Comprime un horario compartido (formato v2) en una o más cadenas QR.
   *
   * @param {object} horarioCompartido - Objeto unumbral-horario-compartido { cursos, clases }
   * @param {number} [maxCharsPerQr=4000] - Límite de caracteres por QR (un solo QR normal por defecto)
   * @returns {string[]} Lista de strings listos para generar QR (ej: ["UNU1:..."])
   */
  function comprimirHorarioParaQr(horarioCompartido, maxCharsPerQr = 4000) {
    if (!horarioCompartido || typeof horarioCompartido !== "object") {
      throw new Error("Objeto de horario compartido inválido");
    }

    const cursos = Array.isArray(horarioCompartido.cursos) ? horarioCompartido.cursos : [];
    const clases = Array.isArray(horarioCompartido.clases) ? horarioCompartido.clases : [];

    const DIAS_MAP_ENCODE = {
      LUNES: "L", MARTES: "M", MIERCOLES: "X", JUEVES: "J", VIERNES: "V", SABADO: "S", DOMINGO: "D"
    };

    const idMap = new Map();
    const aulaMap = new Map();
    const cursosCompactos = cursos.map((c, idx) => {
      const origId = String(c.id || "");
      const shortId = origId.length > 6 ? idx : origId;
      idMap.set(origId, shortId);
      if (c.nombre) {
        idMap.set(String(c.nombre), shortId);
        idMap.set(String(c.nombre).trim().toLowerCase(), shortId);
      }
      aulaMap.set(origId, String(c.aula || ""));
      if (c.nombre) {
        aulaMap.set(String(c.nombre), String(c.aula || ""));
        aulaMap.set(String(c.nombre).trim().toLowerCase(), String(c.aula || ""));
      }
      const cred = Number(c.creditos) || 3;
      const tuple = [
        shortId,
        comprimirTextoDict(c.nombre || ""),
        comprimirColorQr(c.color || ""),
        comprimirTextoDict(c.aula || ""),
        comprimirTextoDict(c.profesor || "")
      ];
      let evTuple = null;
      if (c.evaluacion && (c.evaluacion.parcial !== null || c.evaluacion.final !== null || (Array.isArray(c.evaluacion.practicas) && c.evaluacion.practicas.length > 0))) {
        evTuple = [
          c.evaluacion.parcial ?? null,
          c.evaluacion.final ?? null,
          Array.isArray(c.evaluacion.practicas) ? c.evaluacion.practicas.map(p => [comprimirTextoDict(p.titulo || ""), p.nota]) : []
        ];
      }
      if (cred !== 3 || evTuple) {
        tuple.push(cred);
      }
      if (evTuple) {
        tuple.push(evTuple);
      }
      return tuple;
    });

    const clasesCompactas = clases.map(k => {
      const origCursoId = String(k.curso_id || "");
      const shortCursoId = idMap.has(origCursoId) ? idMap.get(origCursoId) : origCursoId;
      const cursoAula = aulaMap.get(origCursoId) || "";
      const claseAula = String(k.aula || "");
      const aulaCompacta = (claseAula && claseAula === cursoAula) ? "=" : comprimirTextoDict(claseAula);
      const diaRaw = String(k.dia_semana || "");
      const diaCompacto = DIAS_MAP_ENCODE[diaRaw] || diaRaw;
      const tuple = [
        shortCursoId,
        diaCompacto,
        comprimirHoraQr(k.hora_inicio || ""),
        comprimirHoraQr(k.hora_fin || "")
      ];
      if (aulaCompacta) tuple.push(aulaCompacta);
      return tuple;
    });

    // Formato ultra-compacto (soporta ciclo y notas)
    const tieneCicloOEv = !!(horarioCompartido.ciclo || horarioCompartido.version === 3);
    const compacto = {
      v: tieneCicloOEv ? 3 : (horarioCompartido.version || 2),
      c: cursosCompactos,
      k: clasesCompactas
    };
    if (horarioCompartido.ciclo) {
      compacto.ci = [
        comprimirTextoDict(horarioCompartido.ciclo.nombre || ""),
        horarioCompartido.ciclo.fecha_inicio || "",
        horarioCompartido.ciclo.fecha_fin || ""
      ];
    }
    if (Array.isArray(horarioCompartido.asistencias) && horarioCompartido.asistencias.length > 0) {
      compacto.a = horarioCompartido.asistencias.map(a => {
        const origCid = String(a.curso_id || "");
        const shortCid = idMap.has(origCid) ? idMap.get(origCid) : origCid;
        const estCode = (a.estado === "justificada" || a.estado === "j") ? "j" : "f";
        return [shortCid, String(a.fecha || ""), estCode];
      });
    }

    const jsonStr = JSON.stringify(compacto);
    const { tipo, payload } = comprimirPayload(jsonStr);
    const zTag = tipo === "z" ? "Z:" : "";

    if (payload.length <= maxCharsPerQr) {
      return [`${PREFIJO_QR}${zTag}${payload}`];
    }

    // Dividir en multiparte
    const partes = [];
    const totalPartes = Math.ceil(payload.length / maxCharsPerQr);
    for (let i = 0; i < totalPartes; i++) {
      const chunk = payload.slice(i * maxCharsPerQr, (i + 1) * maxCharsPerQr);
      partes.push(`${PREFIJO_QR}${i + 1}/${totalPartes}:${zTag}${chunk}`);
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

    // Verificar si es multiparte: "1/3:Z:contenido" o "1/3:contenido"
    const matchMulti = resto.match(/^(\d+)\/(\d+):(.*)$/s);
    if (matchMulti) {
      const parte = parseInt(matchMulti[1], 10);
      const total = parseInt(matchMulti[2], 10);
      let rawContenido = matchMulti[3];
      const esDeflate = rawContenido.startsWith("Z:");
      const contenido = esDeflate ? rawContenido.slice(2) : rawContenido;
      return {
        esMultiparte: true,
        parte,
        total,
        contenido,
        esDeflate
      };
    }

    // Es un QR único completo
    const esDeflate = resto.startsWith("Z:");
    const rawPayload = esDeflate ? resto.slice(2) : resto;

    let jsonStr = "";
    try {
      jsonStr = descomprimirPayload(esDeflate ? "z" : "u", rawPayload);
    } catch {
      throw new Error("Error decodificando el contenido comprimido del código QR");
    }

    let compacto;
    try {
      compacto = JSON.parse(jsonStr);
    } catch {
      throw new Error("Error decodificando el contenido del código QR");
    }

    if (!compacto || (compacto.v !== 2 && compacto.v !== 3) || !Array.isArray(compacto.c) || !Array.isArray(compacto.k)) {
      throw new Error("Estructura de horario en QR incompatible o corrupta");
    }

    const DIAS_MAP_DECODE = {
      L: "LUNES", M: "MARTES", X: "MIERCOLES", J: "JUEVES", V: "VIERNES", S: "SABADO", D: "DOMINGO"
    };

    const aulaPorCursoId = new Map();
    const cursosRestaurados = compacto.c.map(r => {
      const cid = String(r[0] ?? "");
      const aula = descomprimirTextoDict(String(r[3] || ""));
      aulaPorCursoId.set(cid, aula);
      let evaluacion = { parcial: null, final: null, practicas: [] };
      if (Array.isArray(r[6])) {
        const evRaw = r[6];
        evaluacion.parcial = typeof evRaw[0] === "number" ? evRaw[0] : null;
        evaluacion.final = typeof evRaw[1] === "number" ? evRaw[1] : null;
        if (Array.isArray(evRaw[2])) {
          evaluacion.practicas = evRaw[2].map((p, idx) => ({
            id: `p_${cid}_${idx + 1}`,
            titulo: descomprimirTextoDict(String(p[0] || `Práctica ${idx + 1}`)),
            nota: typeof p[1] === "number" ? p[1] : null
          }));
        }
      }
      return {
        id: cid,
        nombre: descomprimirTextoDict(String(r[1] || "")),
        color: descomprimirColorQr(r[2]),
        aula,
        profesor: descomprimirTextoDict(String(r[4] || "")),
        creditos: Number(r[5]) || 3,
        evaluacion
      };
    });

    const clasesRestauradas = compacto.k.map(r => {
      const cid = String(r[0] ?? "");
      const diaCode = String(r[1] || "");
      const aulaRaw = String(r[4] || "");
      const aulaFinal = aulaRaw === "=" ? (aulaPorCursoId.get(cid) || "") : descomprimirTextoDict(aulaRaw);
      return {
        curso_id: cid,
        dia_semana: DIAS_MAP_DECODE[diaCode] || diaCode,
        hora_inicio: descomprimirHoraQr(String(r[2] || "")),
        hora_fin: descomprimirHoraQr(String(r[3] || "")),
        aula: aulaFinal
      };
    });

    const horario = {
      tipo: "unumbral-horario-compartido",
      version: compacto.v || 2,
      exportado_el: new Date().toISOString(),
      cursos: cursosRestaurados,
      clases: clasesRestauradas
    };
    if (compacto.ci && Array.isArray(compacto.ci)) {
      horario.ciclo = {
        nombre: descomprimirTextoDict(String(compacto.ci[0] || "")),
        fecha_inicio: String(compacto.ci[1] || ""),
        fecha_fin: String(compacto.ci[2] || "")
      };
    }
    if (Array.isArray(compacto.a)) {
      horario.asistencias = compacto.a.map(a => ({
        curso_id: String(a[0] ?? ""),
        fecha: String(a[1] || ""),
        estado: a[2] === "j" ? "justificada" : "falta"
      }));
    } else {
      horario.asistencias = [];
    }

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
    let esDeflate = false;

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
        if (info.esDeflate) esDeflate = true;
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
    const pref = esDeflate ? PREFIJO_QR_Z : PREFIJO_QR;
    const resultado = descomprimirHorarioDeQr(`${pref}${payloadUnido}`);
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
