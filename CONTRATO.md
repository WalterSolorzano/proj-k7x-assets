# CONTRATO — fuente única de verdad del trabajo en paralelo

Todo subagente `seccion` lee este archivo antes de escribir código. El orquestador (`rally`)
lo mantiene actualizado y es el único que lo edita.

> Estado: **plantilla**. El orquestador lo rellena en el kickoff con la información de `brief.md`.

## 1. Producto
- **Qué es:** (pendiente)
- **Para quién:** (pendiente)
- **Tono visual:** moderno, oscuro, alto contraste, un acento de color.
- **Páginas a construir:** (pendiente)

## 2. Diseño (no inventar fuera de esto)
- Tokens en `assets/tokens.css`: usar siempre `var(--...)` para color, tipografía, espacio, radios y sombras.
- Paleta: `--accent` (#ff6b35) y `--accent-2` (#7c5cff) para gradientes y foco; `--text` / `--text-dim` para texto.
- Tipografía: `var(--font)`. Escala: `--fs-xs` … `--fs-3xl`.
- Espaciado: escala `--s-1` … `--s-8`. Secciones con `padding: var(--s-8) 0`.
- Layout: contenedor `.wrap` (max `--maxw`), grid con `repeat(auto-fit, minmax(...))`.
- Bordes: `--line`. Radios: `--r-sm|md|lg|pill`. Profundidad: `--shadow` / `--shadow-soft`.
- Movimiento: `transition: … var(--dur) var(--ease)`.
- Regla de oro: **nada de valores mágicos** si existe un token.

## 3. Convenciones de composición
- Cada sección = una carpeta en `secciones/<slug>/` con `section.html` (fragmento) + `section.css`.
- El fragmento es solo `<section class="sec sec-<slug>">…</section>`. Sin `<html>`, `<head>` ni `<body>`.
- CSS con prefijo propio: `.sec-<slug>__bloque`. Nunca estilos globales de etiqueta.
- El orden y la composición de páginas se define **solo** en `secciones/_sections.json`.
- `paginas/` es generado por `npm run build`. Nadie lo edita a mano.
- Cada subagente edita **una sola carpeta**. Nadie más la toca → cero conflictos.

## 4. Inventario de secciones

| slug | página | dueño (subagente) | estado | interfaz / notas |
| --- | --- | --- | --- | --- |
| `00-nav` | todas | base | listo | barra fija, CTA a la derecha |
| `01-hero` | 01-home | base | listo | titular + lede + 2 CTA |
| `99-footer` | todas | base | listo | cierre con ruta |
| _(añadir)_ | | | pendiente | |

Estados: `pendiente` → `en curso` → `listo`.

## 5. Definición de terminado (por sección)
- [ ] `section.html` y `section.css` existen y siguen el formato.
- [ ] Usa tokens; sin valores mágicos nuevos.
- [ ] Se ve bien a 1440 px y 390 px.
- [ ] Preview en `/secciones/<slug>/` sin desbordes ni solapamientos.
- [ ] Sin JS ni lógica. Datos realistas en español.

## 6. Flujo de paralelización
1. Orquestador rellena este contrato y `secciones/_sections.json`.
2. Lanza **un subagente `seccion` por carpeta**, en paralelo (en segundo plano).
3. Los subagentes trabajan aislados; no se esperan entre sí.
4. Al terminar todos: `npm run build` → `paginas/`.
5. Revisión visual, capturas (`npm run capture`) y video (`npm run video`).

Sesiones separadas de OpenCode: usar worktrees (`tools.opencode.worktree_create`), una por
sección, y luego merge. Requiere que el repo sea git.
