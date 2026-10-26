// lib/plataforma.js
// Helpers para detección de entorno de ejecución (Capacitor nativo vs PWA / Web)

function esNativo() {
  return typeof window !== "undefined" && Boolean(window.Capacitor?.isNativePlatform?.());
}

function esAndroid() {
  return typeof window !== "undefined" && Boolean(
    window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.() === "android"
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { esNativo, esAndroid };
} else if (typeof window !== "undefined") {
  window.esNativo = esNativo;
  window.esAndroid = esAndroid;
}
