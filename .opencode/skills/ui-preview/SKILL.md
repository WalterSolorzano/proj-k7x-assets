---
name: UI Preview & Video
description: Servir la vista local de mockups/capturas y grabar capturas o video de la UI desplazándose con animaciones. Úsala cuando haya que ver, capturar o grabar mockups o la app.
---

# UI Preview & Video

Herramientas del proyecto para ver, ensamblar, capturar y grabar la interfaz. No implementan lógica:
solo sirven y graban lo que ya existe en `mockups/` o la app real.

## 0. Ensamblar secciones en páginas

```sh
npm run build        # secciones/ + secciones/_sections.json -> paginas/*.html
```

Cada página se compone de las secciones listadas en `secciones/_sections.json`, en orden.
`paginas/` es generado: no lo edites a mano ni lo versiones.

## 1. Servir en localhost

```sh
npm run serve        # http://localhost:5173
```

Galería con: **secciones** (cada una en su preview aislado en `/secciones/<slug>/`),
**páginas ensambladas**, **mockups**, **capturas** y **videos**, con recarga automática.
Opciones: `PORT=8080 npm run serve`.

Cuando la app real esté lista, arranca su dev server y captura/grabra por URL (`--url`) en lugar de por archivos.

## 2. Capturas (entregable principal)

```sh
npm run capture                        # paginas/ si existe, si no mockups/ -> presentacion/NN-*.png + presentacion.md
npm run capture -- --dir mockups       # forzar origen
npm run capture -- --mobile            # añade viewport 390px
npm run capture -- --url http://localhost:3000,http://localhost:3000/precios
```

## 3. Video de la UI desplazándose con animaciones

```sh
npm run video                        # presentacion/video/NN-*.webm
npm run video -- --duration 10       # desplazamiento más lento
npm run video -- --no-anim           # sin inyectar animaciones
npm run video -- --url http://localhost:3000
npm run video:mp4                    # además convierte a .mp4 (requiere ffmpeg-static o ffmpeg)
```

`tools/video.mjs` graba cada pantalla con Playwright: hace scroll suave de arriba a abajo,
pausa al inicio y al final, y —si no lo pide `--no-anim`— inyecta `tools/anim.css` más un
IntersectionObserver que revela secciones al entrar en pantalla. Por eso **cualquier sección o
página se ve animada en el video sin tocar su código**.

Parámetros: `--dir`, `--out`, `--url`, `--width`, `--height`, `--duration`, `--pause-top`, `--pause-bottom`.

## Requisitos

```sh
npm install
npx playwright install chromium
```

## Reglas

- No edites el código de la app desde aquí: solo sirve, captura y graba.
- Nombra las pantallas en orden (`01-`, `02-`, ...) para que capturas y videos queden ordenados.
- Devuelve solo rutas, no vuelques HTML ni imágenes en la respuesta.
