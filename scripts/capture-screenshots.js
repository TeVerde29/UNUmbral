const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const PORT = 8085;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url.split('?')[0];
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(process.cwd(), reqPath);

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(PORT, () => {
      console.log(`Servidor local corriendo en http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function capture() {
  const server = await startServer();
  const imgDir = path.join(process.cwd(), 'img');
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  try {
    // 1. Contexto de Escritorio
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 860 },
      deviceScaleFactor: 2
    });
    const page = await desktopContext.newPage();
    await page.goto(`http://localhost:${PORT}`);
    await page.waitForLoadState('networkidle');

    // Cargar semestre modelo demo
    console.log('Cargando semestre de prueba...');
    await page.evaluate(() => {
      window.confirmDialog = async () => true;
    });
    await page.click('[data-view="view-ajustes"]');
    await page.waitForTimeout(300);
    await page.click('#btn-load-demo');
    await page.waitForTimeout(800);

    // Captura 1: Vista Hoy (Dashboard principal)
    console.log('Capturando unumbral-hoy.png...');
    await page.click('[data-view="view-hoy"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(imgDir, 'unumbral-hoy.png'), fullPage: false });

    // Captura 2: Horario (Parrilla Semanal)
    console.log('Capturando unumbral-horario.png...');
    await page.click('[data-view="view-horario"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(imgDir, 'unumbral-horario.png'), fullPage: false });

    // Captura 3: Cursos (Notas y rendimiento)
    console.log('Capturando unumbral-cursos.png...');
    await page.click('[data-view="view-cursos"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(imgDir, 'unumbral-cursos.png'), fullPage: false });

    // Captura 4: Tareas (Gestión de criticidad)
    console.log('Capturando unumbral-tareas.png...');
    await page.click('[data-view="view-tareas"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(imgDir, 'unumbral-tareas.png'), fullPage: false });

    // Captura 5: Modal Compartir QR (con desglose y botón guardar)
    console.log('Capturando unumbral-qr.png...');
    await page.click('[data-view="view-ajustes"]');
    await page.waitForTimeout(300);
    await page.click('#btn-compartir-qr');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(imgDir, 'unumbral-qr.png'), fullPage: false });
    await page.click('#btn-close-qr-modal');
    await page.waitForTimeout(300);

    await desktopContext.close();

    // 2. Contexto Móvil (iPhone / Android)
    console.log('Capturando unumbral-movil.png...');
    const mobileContext = await browser.newContext({
      viewport: { width: 412, height: 892 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://localhost:${PORT}`);
    await mobilePage.waitForLoadState('networkidle');
    await mobilePage.click('[data-view="view-hoy"]');
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(imgDir, 'unumbral-movil.png'), fullPage: false });
    await mobileContext.close();

    console.log('Capturas generadas exitosamente en img/');
  } finally {
    await browser.close();
    server.close();
  }
}

capture().catch((err) => {
  console.error('Error al capturar pantallas:', err);
  process.exit(1);
});
