# Rallylatam — reglas del proyecto

Proyecto **X**: un **recurso visual** que se inserta dentro del video del pitch. Lenguaje y destino **aún no decididos** (escena 3D, web, visualización, app…).
Prioridad: que sea **visualmente impactante** en pantalla, no que tenga mecánica compleja.
Entregable final: **material de rodaje** — clips con movimiento + stills de alta calidad. **No** se produce el video, se produce lo que va dentro.

## Reglas de oro
1. **Mockups primero.** Ninguna línea de lógica antes de aprobar los mockups visuales.
2. **Visual > mecánica.** Datos falsos, hardcodeados o simulados son válidos y preferidos.
3. **Sin testeo excesivo.** Un solo smoke check al final (la app abre y las pantallas clave renderizan). Nada de suites, unit tests ni linters repetidos, salvo pedido explícito del usuario.
4. **Presupuesto 24 h.** Si algo no suma a lo visual, se corta.
5. **Entrega = imágenes.** Toda iteración termina en capturas dentro de `presentacion/`.

## Ahorro de tokens (obligatorio)
- No re-leas en la sesión archivos que ya leíste.
- Localiza con `grep`/`glob` antes de abrir archivos completos.
- Delega exploración al subagente `explore` (contexto fresco y barato).
- Edita en lugar de reescribir archivos completos.
- Un solo smoke check, nunca en bucle.
- Respuestas cortas: no repitas contenido de archivos ni logs largos.
- Guarda el estado en `PROYECTO.md` para poder compactar/reiniciar la sesión sin perder contexto.
- Prefiere CDN y un único archivo de tokens de diseño en vez de dependencias pesadas.
- Escribe varios archivos de una sola vez cuando sea posible.
- Antes de grandes refactors, pregunta.

## Alcance (rally de 24 h — importante)
- **No** se construye una app funcional: es un **prototipo visual**. Sin backend, sin login real, sin base de datos, sin persistencia.
- Navegación entre pantallas = links entre HTML. Nada más.
- Lo que se entrega: pantallas bonitas, **imágenes** y un **video**. No una demo de uso.
- **Regla de corte:** si algo no aparece en una captura o en el video, no se hace.
- El jurado del Rally valora sobre todo la **calidad de la presentación**. Optimiza para eso.

## Trabajo en paralelo (clave para ir rápido)
- Una **sección = una carpeta** en `secciones/<slug>/` (`section.html` + `section.css`). Un dueño, un subagente. Sin solapes → sin conflictos de merge.
- La composición de páginas vive en `secciones/_sections.json`; `paginas/` es generado (`npm run build`) y está en `.gitignore`. No lo edites a mano.
- `CONTRATO.md` es la fuente única de verdad (diseño + convenciones + inventario). Todo subagente lo lee antes de escribir.
- Reparte con subagentes `seccion` en segundo plano (o `/secciones`). Sesiones separadas: worktrees + `session_move`, luego merge.

## Fases
0. Kickoff → `brief.md` + `CONTRATO.md` (≤20 min)
1. Look de referencia → `mockups/` (una pantalla que fija el estilo)
2. Pantallas en paralelo → `secciones/` (un subagente por carpeta)
3. Ensamblado → `paginas/` (prototipo navegable por links)
4. Presentación → `presentacion/*.png` + `presentacion.md` + video + reporte

## Herramientas (ya instaladas — no las reescribas)
- `npm run serve` → galería local (secciones, páginas, mockups, capturas, videos) con recarga en vivo: http://localhost:5173
- `npm run build` → compone `paginas/` desde `secciones/`
- `npm run capture` → capturas fullpage a `presentacion/` + `presentacion.md` (stills de alta calidad con `--scale 2`)
- `npm run video` → **material de rodaje**: clips con movimiento (scroll/zoom/pan/static) + stills a `presentacion/video/`
- Detalle en la skill `ui-preview`; no la cargues si no la necesitas.
- Skill `impeccable` (`.opencode/skills/impeccable/`) → criterio de diseño + detector de anti-patrones IA. Ver abajo.

## Calidad visual — skill `impeccable` (instalada)
Evita el "look IA" (Inter por defecto, morado→azul, cards dentro de cards, gradientes en texto, easing con rebote…).
- Cárgala con la skill `impeccable` antes de diseñar o revisar UI. Comandos: `critique`, `polish`, `bolder`, `distill`, `typeset`, `colorize`, `layout`, `animate`, `audit` (detalle en `.opencode/skills/impeccable/SKILL.md`).
- **Detector sin LLM** (59 reglas deterministas) — úsalo antes de capturar, no en bucle:
  `.\.opencode\skills\impeccable\scripts\impeccable.cmd detect mockups secciones` (o un archivo/URL suelto; `--json` para CI).
- Regla del rally: el detector se corre **una vez por lote**, y las advertencias (`low-contrast`, `em-dash`, `codex-grid-background`) son consejo, no bloqueo. Lo visual manda; si una regla choca con `CONTRATO.md`, gana `CONTRATO.md` y se ignora con `impeccable ignores add-value <valor> --reason "…"`.
- Anti-patrones concretos prohibidos en este repo: ver `CONTRATO.md` §2.1.

## Referencia rápida
- Estado y decisiones: `PROYECTO.md`
- Contrato de diseño y reparto: `CONTRATO.md`
- Brief: `brief.md`
- Tokens: `assets/tokens.css`
- Secciones: `secciones/<slug>/`
- Páginas ensambladas: `paginas/` (generado)
- Capturas: `presentacion/` · Videos: `presentacion/video/`
