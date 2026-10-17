import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 860 }
  });
  await page.goto('http://localhost:5173/paginas/01-plataforma.html', { waitUntil: 'networkidle' });
  
  // Captura del dashboard general
  await page.screenshot({ path: 'presentacion/dashboard-01-latam.png' });

  // Click en vista Managua / País
  await page.click('#btn-view-pais');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'presentacion/dashboard-02-managua.png' });

  // Click en vista Edificio Específico
  await page.click('#btn-view-edificio');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'presentacion/dashboard-03-edificio.png' });

  await browser.close();
  console.log('Capturas del nuevo diseño generadas correctamente.');
}

run();
