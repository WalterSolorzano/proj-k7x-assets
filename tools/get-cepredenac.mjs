import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('https://www.cepredenac.org', { timeout: 20000 });
    const logoSrc = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const found = imgs.find(i => (i.src || '').toLowerCase().includes('logo') || (i.alt || '').toLowerCase().includes('cepredenac'));
      return found ? found.src : null;
    });
    console.log('Found CEPREDENAC logo URL:', logoSrc);
    if (logoSrc) {
      const resp = await page.goto(logoSrc);
      writeFileSync('assets/cepredenac-logo.png', await resp.body());
      console.log('Saved assets/cepredenac-logo.png');
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  await browser.close();
}

main();
