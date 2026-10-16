# PROYECTO — estado

Memoria barata del proyecto. Actualízala en cada hito (o con `/checkpoint`) para poder
compactar o reiniciar la sesión sin perder contexto.

- **Proyecto:** X (Rallylatam)
- **Fase actual:** 0 — Kickoff
- **Stack:** sin decidir (web por defecto)
- **Entregable:** `presentacion/*.png` + `presentacion.md` (+ `presentacion/video/*.webm`)

## Decisiones
- Entrega = imágenes y video, no demo en vivo.
- Vista local en http://localhost:5173 con galería de mockups/capturas/videos.
- Plantilla visual base: `mockups/00-demo.html` + `mockups/tokens.css`.

## Herramientas
- `npm run serve` — galería local con recarga en vivo.
- `npm run capture` — capturas + `presentacion.md`.
- `npm run video` — video con scroll y animaciones.
- Skill `ui-preview` — detalle de parámetros.
- MCP `playwright` — navegador para el agente.

## Archivos clave
- `brief.md` — brief del producto (pendiente)
- `mockups/` — mockups HTML/CSS estáticos
- `presentacion/` — capturas y videos finales
- `tools/` — serve, capture, video, anim

## Siguiente paso
- Ejecutar `/kickoff` para definir el brief y las 3 pantallas clave.

## Dudas pendientes
- ¿Stack definitivo (framework) tras aprobar los mockups?
