// tools/build.mjs — Ensambla paginas/ a partir de secciones/ según _sections.json
// Uso: npm run build
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SEC = join(ROOT, 'secciones');
const OUT = join(ROOT, 'paginas');

const cfg = JSON.parse(await readFile(join(SEC, '_sections.json'), 'utf8'));
const shell = await readFile(join(SEC, '_shell.html'), 'utf8');
await mkdir(OUT, { recursive: true });

const fill = (tpl, map) => {
  let out = tpl;
  for (const [k, v] of Object.entries(map)) out = out.split(`{{${k}}}`).join(v);
  return out;
};

let built = 0;
let missingTotal = 0;

for (const page of cfg.pages) {
  const parts = [];
  const styles = [];
  const faltan = [];

  for (const slug of page.sections) {
    const frag = join(SEC, slug, 'section.html');
    if (!existsSync(frag)) {
      faltan.push(slug);
      continue;
    }
    parts.push((await readFile(frag, 'utf8')).trim());
    if (existsSync(join(SEC, slug, 'section.css'))) styles.push(`../secciones/${slug}/section.css`);
  }

  const links = ['../assets/tokens.css', ...styles].map((h) => `<link rel="stylesheet" href="${h}">`).join('\n');
  const themeAttr = page.theme ? ` data-theme="${page.theme}"` : '';
  const colorScheme = page.scheme || (page.theme === 'institucional' || page.theme === 'light-min' || page.theme === 'natural' ? 'light' : 'dark');
  const html = fill(shell, { title: page.title || page.id, styles: links, content: parts.join('\n\n'), themeAttr, colorScheme });
  await writeFile(join(OUT, `${page.id}.html`), html, 'utf8');

  built++;
  missingTotal += faltan.length;
  console.log(
    `✓ paginas/${page.id}.html  ${page.sections.length - faltan.length}/${page.sections.length} secciones` +
      (faltan.length ? `  (faltan: ${faltan.join(', ')})` : ''),
  );
}

console.log(`\n${built} páginas → paginas/` + (missingTotal ? `  ·  ${missingTotal} secciones sin crear` : ''));
