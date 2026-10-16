// tools/serve.mjs — Vista local: mockups, secciones (preview), páginas, capturas y videos.
// Uso: npm run serve        (PORT=5173)
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { watch, mkdirSync, existsSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT || 5173);
const DIRS = ['mockups', 'secciones', 'paginas', 'presentacion'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function walk(dir, base = '') {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(join(dir, e.name), rel)));
    else out.push(rel);
  }
  return out;
}

const RELOAD = `try{new EventSource('/__reload').onmessage=()=>location.reload()}catch(e){}`;

function cards(items) {
  if (!items.length) return '';
  return items
    .map(
      (it, i) => `<article class="card">
      <header>
        <span class="n">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(it.title)}</h3>
        ${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ''}
        <a href="${esc(it.href)}" target="_blank" rel="noopener">abrir ↗</a>
      </header>
      <div class="frame"><iframe src="${esc(it.href)}" loading="lazy" title="${esc(it.title)}"></iframe></div>
    </article>`,
    )
    .join('');
}

function group(title, items) {
  const body = items.length ? `<div class="grid screens">${cards(items)}</div>` : `<p class="empty">Nada todavía.</p>`;
  return `<h2>${esc(title)} <span class="count">${items.length}</span></h2>${body}`;
}

function page({ mockups, sections, pages, images, videos }) {
  const shots = images.length
    ? `<div class="shots">${images
        .map((f) => `<a class="shot" href="/${f}" target="_blank" rel="noopener"><img src="/${f}" loading="lazy" alt="${esc(f)}"></a>`)
        .join('')}</div>`
    : `<p class="empty">Genera capturas con <code>npm run capture</code>.</p>`;
  const vids = videos.length
    ? `<div class="vids">${videos
        .map((f) => `<figure class="vid"><video src="/${f}" controls playsinline preload="metadata"></video><figcaption>${esc(f.split('/').pop())}</figcaption></figure>`)
        .join('')}</div>`
    : `<p class="empty">Genera un video con <code>npm run video</code>.</p>`;

  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rallylatam · vista local</title>
<style>
  :root{--bg:#0b0d12;--panel:#141821;--line:#232a38;--txt:#e7ecf5;--dim:#8a94a8;--accent:#ff6b35}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif}
  header.top{position:sticky;top:0;z-index:10;display:flex;gap:16px;align-items:center;padding:14px 24px;
    background:rgba(11,13,18,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  header.top h1{margin:0;font-size:16px;letter-spacing:.3px}
  header.top .dot{width:8px;height:8px;border-radius:50%;background:#31d158}
  header.top .meta{color:var(--dim);font-size:13px;margin-left:auto}
  header.top .meta a{color:var(--accent);text-decoration:none}
  main{padding:28px 24px 80px;max-width:1400px;margin:0 auto}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.14em;color:var(--dim);margin:34px 0 16px;font-weight:600}
  h2:first-child{margin-top:0}
  h2 .count{color:var(--accent);margin-left:6px}
  .grid{display:grid;gap:22px}
  .grid.screens{grid-template-columns:repeat(auto-fill,minmax(420px,1fr))}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .card header{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}
  .card .n{font-variant-numeric:tabular-nums;font-size:11px;color:var(--accent);border:1px solid var(--line);border-radius:6px;padding:2px 6px}
  .card h3{margin:0;font-size:14px;font-weight:600}
  .card .tag{font-size:11px;color:var(--dim);border:1px solid var(--line);border-radius:6px;padding:2px 6px}
  .card a{margin-left:auto;color:var(--dim);text-decoration:none;font-size:12px}
  .card a:hover{color:var(--accent)}
  .frame{position:relative;aspect-ratio:16/10;background:#fff}
  .frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .shots{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
  .shot{display:block;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--panel)}
  .shot img{display:block;width:100%}
  .vids{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(420px,1fr))}
  .vid{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
  .vid video{display:block;width:100%}
  .vid figcaption{padding:10px 14px;font-size:12px;color:var(--dim)}
  .empty{color:var(--dim);font-size:14px}
  code{background:#1c2230;padding:1px 6px;border-radius:5px;font-size:13px}
</style></head>
<body>
<header class="top"><span class="dot"></span><h1>Rallylatam · vista local</h1>
  <span class="meta"><a href="/paginas/01-home.html" target="_blank" rel="noopener">página ensamblada ↗</a></span></header>
<main>
  ${group('Secciones (paralelo)', sections)}
  ${group('Páginas ensambladas', pages)}
  ${group('Mockups', mockups)}
  <h2>Capturas <span class="count">${images.length}</span></h2>${shots}
  <h2>Videos <span class="count">${videos.length}</span></h2>${vids}
</main>
<script>${RELOAD}</script>
</body></html>`;
}

// --- recarga en vivo ---
const clients = new Set();
for (const d of DIRS) {
  try {
    mkdirSync(join(ROOT, d), { recursive: true });
    watch(join(ROOT, d), { recursive: true }, () => {
      for (const c of clients) c.write('data: reload\n\n');
    });
  } catch {}
}

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

async function sectionPreview(slug) {
  const frag = join(ROOT, 'secciones', slug, 'section.html');
  if (!existsSync(frag)) return null;
  const shell = await readFile(join(ROOT, 'secciones', '_shell.html'), 'utf8');
  const styles = [`/assets/tokens.css`];
  if (existsSync(join(ROOT, 'secciones', slug, 'section.css'))) styles.push(`/secciones/${slug}/section.css`);
  return shell
    .split('{{title}}')
    .join(`${slug} · sección`)
    .split('{{styles}}')
    .join(styles.map((h) => `<link rel="stylesheet" href="${h}">`).join('\n'))
    .split('{{content}}')
    .join(await readFile(frag, 'utf8'));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = decodeURIComponent(url.pathname);

  if (path === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  // preview aislado de una sección: /secciones/<slug>/
  const m = path.match(/^\/secciones\/([^/]+)\/?$/);
  if (m) {
    const html = await sectionPreview(m[1]);
    if (html) return send(res, 200, html.replace('</body>', `<script>${RELOAD}</script></body>`), 'text/html; charset=utf-8');
    return send(res, 404, `Sección no encontrada: ${m[1]}`, 'text/plain');
  }

  if (path === '/' || path === '/index.html') {
    const mockups = (await walk(join(ROOT, 'mockups'))).filter((f) => f.endsWith('.html')).sort();
    const paginas = (await walk(join(ROOT, 'paginas'))).filter((f) => f.endsWith('.html')).sort();
    const secciones = (await readdir(join(ROOT, 'secciones'), { withFileTypes: true }).catch(() => []))
      .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
      .map((e) => e.name)
      .sort();
    const all = await walk(join(ROOT, 'presentacion'));
    const images = all.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).map((f) => `presentacion/${f}`);
    const videos = all.filter((f) => /\.(webm|mp4)$/i.test(f)).sort().map((f) => `presentacion/${f}`);
    return send(
      res,
      200,
      page({
        mockups: mockups.map((f) => ({ title: f.replace(/\.html$/, ''), href: `/mockups/${f}` })),
        sections: secciones
          .filter((s) => existsSync(join(ROOT, 'secciones', s, 'section.html')))
          .map((s) => ({ title: s, href: `/secciones/${s}/`, tag: 'paralelo' })),
        pages: paginas.map((f) => ({ title: f.replace(/\.html$/, ''), href: `/paginas/${f}` })),
        images,
        videos,
      }),
      'text/html; charset=utf-8',
    );
  }

  const abs = resolve(join(ROOT, path.replace(/^\/+/, '')));
  if (!abs.startsWith(ROOT + sep)) return send(res, 403, 'Forbidden', 'text/plain');

  try {
    let body = await readFile(abs);
    const type = MIME[extname(abs).toLowerCase()] || 'application/octet-stream';
    if (type.startsWith('text/html')) {
      body = body.toString('utf8').replace('</body>', `<script>${RELOAD}</script></body>`);
    }
    return send(res, 200, body, type);
  } catch {
    return send(res, 404, 'No encontrado: ' + path, 'text/plain');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Rallylatam · vista local\n  http://localhost:${PORT}\n`);
});
