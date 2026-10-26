// scripts/build-web.js
// Limpia y genera la carpeta www/ con los activos requeridos para Capacitor y la app nativa.
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "www");

console.log("[build-web] Preparando carpeta www...");

if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const filesToCopy = [
  "index.html",
  "app.js",
  "estilos.css",
  "manifest.json",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "icon.png",
  "sw.js"
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, file));
    console.log(`[build-web] Copiado: ${file}`);
  }
}

const dirsToCopy = ["lib", ".well-known"];
for (const dir of dirsToCopy) {
  const src = path.join(rootDir, dir);
  if (fs.existsSync(src)) {
    copyRecursive(src, path.join(outDir, dir));
    console.log(`[build-web] Copiado directorio: ${dir}`);
  }
}

console.log("[build-web] www/ generado exitosamente.");
