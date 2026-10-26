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
    "#BAE6FD", "#BBF7D0", "#FDE68A", "#FECDD3",
    "#DDD6FE", "#FED7AA", "#A7F3D0", "#F5D0FE",
    "#E9D5FF", "#FBCFE8", "#FDE047", "#BFDBFE",
    "#C7D2FE", "#99F6E4", "#D9F99D", "#FFEDD5",
    "#FECACA", "#C5D6B8", "#DDE8C8", "#FEF08A"
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

  function comprimirColorQr(color) {
    if (!color || typeof color !== "string") return "";
    const upper = color.toUpperCase();
    const idx = PALETA_QR.indexOf(upper);
    if (idx >= 0) {
      return color === upper ? idx : ~idx;
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
      aulaMap.set(origId, String(c.aula || ""));
      const cred = Number(c.creditos) || 3;
      const tuple = [
        shortId,
        comprimirTextoDict(c.nombre || ""),
        comprimirColorQr(c.color || ""),
        comprimirTextoDict(c.aula || ""),
        comprimirTextoDict(c.profesor || "")
      ];
      if (cred !== 3) tuple.push(cred);
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

    // Formato ultra-compacto
    const compacto = {
      v: 2,
      c: cursosCompactos,
      k: clasesCompactas
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

    const DIAS_MAP_DECODE = {
      L: "LUNES", M: "MARTES", X: "MIERCOLES", J: "JUEVES", V: "VIERNES", S: "SABADO", D: "DOMINGO"
    };

    const aulaPorCursoId = new Map();
    const cursosRestaurados = compacto.c.map(r => {
      const cid = String(r[0] ?? "");
      const aula = descomprimirTextoDict(String(r[3] || ""));
      aulaPorCursoId.set(cid, aula);
      return {
        id: cid,
        nombre: descomprimirTextoDict(String(r[1] || "")),
        color: descomprimirColorQr(r[2]),
        aula,
        profesor: descomprimirTextoDict(String(r[4] || "")),
        creditos: Number(r[5]) || 3
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
      version: 2,
      exportado_el: new Date().toISOString(),
      cursos: cursosRestaurados,
      clases: clasesRestauradas
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
