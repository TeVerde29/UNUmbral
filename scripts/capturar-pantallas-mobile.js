const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  let filePath = path.join(process.cwd(), reqPath === '/' ? 'index.html' : reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }
  const ext = path.extname(filePath);
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.json': 'application/json'
  };
  res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8095, async () => {
  console.log('[Capture] Servidor iniciado en puerto 8095');
  try {
    const browser = await chromium.launch();
    // iPhone 16 Pro Max resolution: 440 x 956
    const context = await browser.newContext({
      viewport: { width: 440, height: 956 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8095');
    await page.waitForSelector('#app');
    await page.waitForTimeout(800);

    // 1. Invocar la carga del semestre modelo real llamando a loadDemoSemester()
    console.log('[Capture] Ejecutando loadDemoSemester()...');
    await page.evaluate(async () => {
      // confirmDialog suele interceptar el confirm, sobreescribir temporalmente window.confirmDialog
      window.confirmDialog = async () => true;
      if (typeof window.loadDemoSemester === 'function') {
        await window.loadDemoSemester();
      } else {
        const btn = document.querySelector('#btn-load-demo');
        if (btn) btn.click();
      }
    });

    await page.waitForTimeout(1200);

    // 2. Captura: Vista Hoy (unumbral-hoy.png)
    await page.locator('.nav-tab[data-view="view-hoy"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'img/unumbral-hoy.png' });
    console.log('[Capture] unumbral-hoy.png guardada (440x956)');

    // 3. Captura: Parrilla Horario (unumbral-horario.png)
    await page.locator('.nav-tab[data-view="view-horario"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'img/unumbral-horario.png' });
    console.log('[Capture] unumbral-horario.png guardada (440x956)');

    // 4. Captura: Cursos y Evaluaciones (unumbral-cursos.png)
    await page.locator('.nav-tab[data-view="view-cursos"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'img/unumbral-cursos.png' });
    console.log('[Capture] unumbral-cursos.png guardada (440x956)');

    // 5. Captura: Tareas por Urgencia (unumbral-tareas.png)
    await page.locator('.nav-tab[data-view="view-tareas"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'img/unumbral-tareas.png' });
    console.log('[Capture] unumbral-tareas.png guardada (440x956)');

    // 6. Captura: Modal de Compartir Horario por QR (unumbral-qr.png)
    // Se activa el modal de exportación QR
    await page.evaluate(() => {
      if (typeof window.abrirModalQrHorario === 'function') {
        window.abrirModalQrHorario();
      } else {
        const btn = document.querySelector('#btn-share-schedule');
        if (btn) btn.click();
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'img/unumbral-qr.png' });
    console.log('[Capture] unumbral-qr.png guardada (440x956)');

    // Cerrar modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 7. Captura: Panel de Ajustes / Ciclo (unumbral-panel.png)
    await page.locator('.nav-tab[data-view="view-ajustes"]').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'img/unumbral-panel.png' });
    console.log('[Capture] unumbral-panel.png guardada (440x956)');

    // 8. Captura: Modo Oscuro (unumbral-movil.png)
    const btnTheme = page.locator('#btn-theme-toggle');
    if (await btnTheme.count() > 0) {
      await btnTheme.click();
      await page.waitForTimeout(400);
    }
    // Mostrar vista cursos o hoy en tema oscuro
    await page.locator('.nav-tab[data-view="view-cursos"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-movil.png' });
    console.log('[Capture] unumbral-movil.png guardada en Modo Oscuro (440x956)');

    console.log('[Capture] Todas las capturas móviles del iPhone 16 Pro Max completadas.');
    await browser.close();
  } catch (err) {
    console.error('[Capture] Error:', err);
  } finally {
    server.close();
  }
});
