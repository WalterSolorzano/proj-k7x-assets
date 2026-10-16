# PROYECTO — estado

Memoria barata del proyecto. Actualízala en cada hito (o con `/checkpoint`) para poder
compactar o reiniciar la sesión sin perder contexto.

- **Proyecto:** X (Rallylatam)
- **Fase actual:** 0 — Kickoff
- **Stack:** sin decidir (web por defecto)
- **Entregable:** `presentacion/*.png` + `presentacion.md` (+ `presentacion/video/*.webm`)

## Decisiones
- **Alcance cerrado: prototipo visual, NO app funcional.** Sin backend, login, base de datos ni persistencia.
- Rally Latinoamericano de Innovación 2026: 28 h (16-17 oct). El jurado premia la **calidad de la presentación**.
- Entregables oficiales del Rally: video ≤2 min en YouTube + reporte pautado PDF + video de interacción internacional ≤1 min en TikTok.
- Entrega propia = **material de rodaje** (clips + stills) para insertar en el video. No hacemos el video.
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
