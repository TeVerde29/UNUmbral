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

server.listen(8092, async () => {
  console.log('Servidor iniciado en puerto 8092');
  try {
    const browser = await chromium.launch();
    // iPhone 16 Pro Max viewport: 440x956
    const context = await browser.newContext({
      viewport: { width: 440, height: 956 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8092');
    await page.waitForSelector('#app');
    await page.waitForTimeout(1000);

    // Sembrar datos de prueba si la base de datos está vacía
    await page.evaluate(async () => {
      if (window.db) {
        const count = await window.db.cursos.count();
        if (count === 0) {
          const cicloId = 'ciclo-2026-1';
          await window.db.ciclos.put({
            id: cicloId,
            nombre: '2026-I',
            fecha_inicio: '2026-03-16',
            fecha_fin: '2026-07-12',
            semanas_total: 17,
            activo: 1
          });
          const c1 = await window.db.cursos.put({
            id: 'c1',
            ciclo_id: cicloId,
            nombre: 'Cálculo Multivariable',
            codigo: 'MAT201',
            creditos: 4,
            docente: 'Dr. Vega',
            aula: 'Pabellón B - Aula 204',
            color: '#4F7256',
            ep: 15,
            ef: 16,
            pp: 14.5
          });
          const c2 = await window.db.cursos.put({
            id: 'c2',
            ciclo_id: cicloId,
            nombre: 'Estructuras de Datos',
            codigo: 'INF202',
            creditos: 4,
            docente: 'Ing. Morales',
            aula: 'Lab C-102',
            color: '#294635',
            ep: 16,
            ef: 17,
            pp: 16.5
          });
          const c3 = await window.db.cursos.put({
            id: 'c3',
            ciclo_id: cicloId,
            nombre: 'Física Universitaria',
            codigo: 'FIS103',
            creditos: 4,
            docente: 'Dra. Alarcón',
            aula: 'Pabellón A - Aula 101',
            color: '#718D68',
            ep: 14,
            ef: 15,
            pp: 13
          });

          await window.db.clases.bulkPut([
            { id: 'cl1', curso_id: 'c1', ciclo_id: cicloId, dia_semana: 1, hora_inicio: '08:00', hora_fin: '10:00', aula: 'B-204' },
            { id: 'cl2', curso_id: 'c2', ciclo_id: cicloId, dia_semana: 1, hora_inicio: '10:15', hora_fin: '12:15', aula: 'Lab C-102' },
            { id: 'cl3', curso_id: 'c3', ciclo_id: cicloId, dia_semana: 3, hora_inicio: '14:00', hora_fin: '16:00', aula: 'A-101' },
            { id: 'cl4', curso_id: 'c1', ciclo_id: cicloId, dia_semana: 5, hora_inicio: '08:00', hora_fin: '10:00', aula: 'B-204' }
          ]);

          await window.db.tareas.bulkPut([
            { id: 't1', curso_id: 'c2', titulo: 'Implementar Árbol AVL en C++', fecha_entrega: '2026-11-05', hora_entrega: '23:59', prioridad: 4, completada: 0 },
            { id: 't2', curso_id: 'c1', titulo: 'Guía de Integrales Triples', fecha_entrega: '2026-11-06', hora_entrega: '18:00', prioridad: 3, completada: 0 },
            { id: 't3', curso_id: 'c3', titulo: 'Informe de Laboratorio de Óptica', fecha_entrega: '2026-11-08', hora_entrega: '20:00', prioridad: 2, completada: 0 }
          ]);
        }
      }
    });

    await page.reload();
    await page.waitForSelector('#app');
    await page.waitForTimeout(1000);

    // 1. Captura de Vista Hoy (unumbral-hoy.png)
    await page.locator('.nav-tab[data-view="view-hoy"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-hoy.png' });
    console.log('Capturada unumbral-hoy.png [440x956]');

    // 2. Captura de Horario (unumbral-horario.png)
    await page.locator('.nav-tab[data-view="view-horario"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-horario.png' });
    console.log('Capturada unumbral-horario.png [440x956]');

    // 3. Captura de Cursos (unumbral-cursos.png)
    await page.locator('.nav-tab[data-view="view-cursos"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-cursos.png' });
    console.log('Capturada unumbral-cursos.png [440x956]');

    // 4. Captura de Tareas (unumbral-tareas.png)
    await page.locator('.nav-tab[data-view="view-tareas"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-tareas.png' });
    console.log('Capturada unumbral-tareas.png [440x956]');

    // 5. Captura de Modal QR (unumbral-qr.png)
    const btnQr = page.locator('#btn-share-schedule, #btn-export-qr, #btn-qr, [data-action="exportar-qr"]');
    if (await btnQr.count() > 0) {
      await btnQr.first().click();
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => {
        const modal = document.querySelector('#modal-qr-export, #modal-qr, #modal-qr-share, .qr-modal');
        if (modal) {
          modal.classList.add('is-active', 'active', 'open');
          modal.style.display = 'flex';
        }
      });
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'img/unumbral-qr.png' });
    console.log('Capturada unumbral-qr.png [440x956]');

    // Cerrar modales si quedaron abiertos
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 6. Captura de Panel General / Ajustes (unumbral-panel.png)
    // Abrir vista hoy o modal de ajustes
    const btnAjustes = page.locator('#btn-open-settings, #btn-settings, [data-action="settings"]');
    if (await btnAjustes.count() > 0) {
      await btnAjustes.first().click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'img/unumbral-panel.png' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } else {
      await page.locator('.nav-tab[data-view="view-hoy"]').click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'img/unumbral-panel.png' });
    }
    console.log('Capturada unumbral-panel.png [440x956]');

    // 7. unumbral-movil.png (Dark Mode vista de cursos / hoy)
    const btnTheme = page.locator('#btn-theme-toggle');
    if (await btnTheme.count() > 0) {
      await btnTheme.click();
      await page.waitForTimeout(500);
    }
    await page.locator('.nav-tab[data-view="view-hoy"]').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'img/unumbral-movil.png' });
    console.log('Capturada unumbral-movil.png [440x956]');

    console.log('Todas las capturas se generaron correctamente.');
  } catch (err) {
    console.error('Error generando capturas:', err);
  } finally {
    server.close();
  }
});
