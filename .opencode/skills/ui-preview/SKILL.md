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

## 3. Material de rodaje (footage para el video del pitch)

El propósito **no es producir el video final**, sino el **material** que se inserta en él:
clips con movimiento y stills de alta calidad.

```sh
npm run video                          # una toma (scroll) por pantalla → presentacion/video/*.webm
npm run video -- --preset 9x16         # vertical (TikTok/Reels)
npm run video -- --motion zoom         # tomas: scroll | zoom | pan | static
npm run video -- --duration 10         # movimiento más lento
npm run video -- --stills              # además un PNG por toma
npm run video -- --guion guion.json    # varias tomas definidas a mano (ver guion.json)
npm run video:mp4                      # además convierte a .mp4
```

`tools/video.mjs` genera un índice en `presentacion/video/material.md` con cada toma y su
movimiento, para que el editor sepa qué tiene.

Presets: `16x9` (1920×1080, por defecto) · `9x16` · `4x5` · `1x1` · `wide`.

## 3b. Stills de alta calidad (para zoom/Ken Burns en edición)

```sh
npm run capture -- --preset 16x9 --scale 2 --fit viewport
```

`--scale 2` produce PNG retina (3840×2160) ideales para acercar sin que se pixele.
`--fit viewport` recorta a 16:9 en lugar de capturar la página entera.

## Requisitos

```sh
npm install
npx playwright install chromium
```

## Reglas

- No edites el código de la app desde aquí: solo sirve, captura y graba.
- Nombra las pantallas en orden (`01-`, `02-`, ...) para que capturas y videos queden ordenados.
- Devuelve solo rutas, no vuelques HTML ni imágenes en la respuesta.
