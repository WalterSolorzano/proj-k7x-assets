// tools/dist.mjs — arma dist/ para publicar (Netlify, o cualquier hosting estático).
//
// Por qué existe: las páginas de paginas/ referencian `../assets/tokens.css` y
// `../secciones/<slug>/section.css`. Publicar la raíz del repo funcionaría, pero subiría
// node_modules, mockups y todo el histórico. Esto deja solo lo que el navegador necesita,
// conservando la estructura relativa para que las rutas sigan resolviendo.
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const DIST = join(ROOT, 'dist');
const cfg = JSON.parse(await readFile(join(ROOT, 'secciones', '_sections.json'), 'utf8'));

await rm(DIST, { recursive: true, force: true });
await mkdir(join(DIST, 'paginas'), { recursive: true });
await cp(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });

let css = 0;
for (const page of cfg.pages) {
  const src = join(ROOT, 'paginas', `${page.id}.html`);
  if (!existsSync(src)) throw new Error(`Falta paginas/${page.id}.html — corre \`npm run build\` antes.`);
  await cp(src, join(DIST, 'paginas', `${page.id}.html`));
  for (const slug of page.sections) {
    const from = join(ROOT, 'secciones', slug, 'section.css');
    if (!existsSync(from)) continue;
    const dir = join(DIST, 'secciones', slug);
    await mkdir(dir, { recursive: true });
    await cp(from, join(dir, 'section.css'));
    css++;
  }
}

// Índice de publicación: dos enlaces, con el mismo sistema de diseño. Nada más.
const links = cfg.pages
  .map(
    (p) =>
      `      <a class="card" href="paginas/${p.id}.html">` +
      `<span class="card__id">${p.id}</span><span class="card__t">${p.title}</span></a>`,
  )
  .join('\n');

await writeFile(
  join(DIST, 'index.html'),
  `<!doctype html>
<html lang="es" data-theme="institucional">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>SITRE · prototipo</title>
<link rel="stylesheet" href="assets/tokens.css">
<style>
  body { padding: var(--s-8) 0; }
  .r { display: grid; gap: var(--gap-block); max-width: 700px; margin: 0 auto; padding: 0 var(--s-5); }
  .h { margin: 0; font-family: var(--font-display); font-size: var(--fs-2xl); letter-spacing: -.02em; }
  .s { margin: 0 0 var(--s-5); color: var(--text-dim); }
  .card { display: block; padding: var(--pad-block) 0; border-top: var(--hairline); }
  .card__id { display: block; font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim); }
  .card__t { font-family: var(--font-display); font-size: var(--fs-xl); color: var(--text); }
  .f { margin: var(--s-6) 0 0; font-family: var(--font-mono); font-size: var(--fs-xs); color: var(--text-dim); }
</style>
</head>
<body>
  <div class="r">
    <h1 class="h">SITRE</h1>
    <p class="s">Sistema de Inteligencia Territorial para Rescates · prototipo visual</p>
${links}
    <p class="f">Conteo agregado · sin identificar personas</p>
  </div>
</body>
</html>
`,
  'utf8',
);

console.log(`dist/ listo · ${cfg.pages.length} páginas · ${css} hojas de sección`);
