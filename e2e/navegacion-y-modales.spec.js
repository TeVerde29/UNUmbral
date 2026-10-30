const { test, expect } = require("@playwright/test");

test.describe("UNUmbral - Flujos E2E de Navegación, Modales y Accesibilidad", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      console.error("[E2E Page Error]", err);
    });

    await page.goto("/");
    // Esperar a que el contenedor principal esté presente e init() haya cargado la fecha
    await expect(page.locator("#app")).toBeVisible();
    await expect(page.locator("#view-hoy")).toBeVisible();
    await expect(page.locator("#current-date-label")).not.toContainText("Cargando fecha");
  });

  test("Navega limpiamente entre los 4 tabs principales de la aplicación", async ({ page }) => {
    // 1. Tab inicial: Hoy activo
    await expect(page.locator("#view-hoy")).toBeVisible();

    // 2. Tab Horario
    const tabHorario = page.locator('.nav-tab[data-view="view-horario"]');
    await expect(tabHorario).toBeVisible();
    await tabHorario.click();
    await expect(page.locator("#view-horario")).toBeVisible();
    await expect(page.locator("#view-hoy")).not.toBeVisible();

    // 3. Tab Cursos
    const tabCursos = page.locator('.nav-tab[data-view="view-cursos"]');
    await expect(tabCursos).toBeVisible();
    await tabCursos.click();
    await expect(page.locator("#view-cursos")).toBeVisible();
    await expect(page.locator("#view-horario")).not.toBeVisible();

    // 4. Tab Tareas
    const tabTareas = page.locator('.nav-tab[data-view="view-tareas"]');
    await expect(tabTareas).toBeVisible();
    await tabTareas.click();
    await expect(page.locator("#view-tareas")).toBeVisible();
    await expect(page.locator("#view-cursos")).not.toBeVisible();
  });

  test("Abre y cierra el modal de Tarea mediante botón de cierre y tecla Escape", async ({ page }) => {
    // Navegar a tareas
    await page.locator('.nav-tab[data-view="view-tareas"]').click();

    // Abrir modal nueva tarea
    const btnAddTask = page.locator("#btn-add-task");
    await expect(btnAddTask).toBeVisible();
    await btnAddTask.click();

    const modalBackdrop = page.locator("#modal-task-backdrop");
    await expect(modalBackdrop).toBeVisible();

    // Cerrar con Escape
    await page.keyboard.press("Escape");
    await expect(modalBackdrop).toBeHidden();

    // Abrir de nuevo y cerrar con botón de cierre
    await btnAddTask.click();
    await expect(modalBackdrop).toBeVisible();

    const btnCerrar = page.locator("#modal-task-close");
    await btnCerrar.click();
    await expect(modalBackdrop).toBeHidden();
  });

  test("Cambia el tema claro/oscuro y persiste en el DOM", async ({ page }) => {
    const btnTheme = page.locator("#btn-theme-toggle");
    await expect(btnTheme).toBeVisible();

    // Activar tema oscuro
    await btnTheme.click();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");

    // Volver a tema claro
    await btnTheme.click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });
});
