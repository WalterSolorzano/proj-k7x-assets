# Blender + MCP — cómo se usa

Blender y el servidor MCP están instalados. Sirve para generar **modelos y escenas 3D**
(renders, turntables, stills) como material visual del pitch.

## Rutas instaladas

- Blender 4.5 LTS: `C:\Program Files\Blender Foundation\Blender 4.5\blender.exe`
- Addon MCP: `%APPDATA%\Blender Foundation\Blender\4.5\scripts\addons\blender_mcp.py`
- Servidor MCP: `C:\Users\w\.local\bin\uvx.exe mcp-for-blender` (puerto `9876`)

Lanzar Blender desde terminal:

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe"
```

## Arrancar (2 pasos)

1. **Abrir Blender.**
2. En el viewport 3D, tecla **N** → pestaña **MCP for Blender** → **Connect**.
   El addon levanta su servidor en `localhost:9876` automáticamente al abrir Blender.

El MCP ya está registrado en `opencode.json` (sección `mcp.blender`), así que el agente
tiene las herramientas disponibles sin tocar nada más. **Reinicia OpenCode** una vez para
que cargue el servidor nuevo.

## Reglas para este proyecto

- El MCP solo funciona con **Blender abierto y conectado**. Si el agente da error de
  conexión, es eso.
- **Guardar antes de ejecutar código** (el MCP puede correr Python arbitrario en Blender).
- Salida final → `presentacion/` (renders PNG) igual que el resto de entregables.
- No montar escenas pesadas: el objetivo es imagen bonita, no simulación.

## Si algo falla

- Error `spawn uvx ENOENT` → revisar que `mcp.blender.command` use la ruta absoluta
  `C:\Users\w\.local\bin\uvx.exe`.
- Actualizar servidor + addon: `uvx mcp-for-blender@latest update`
- Reinstalar addon: `uvx mcp-for-blender install-addon`
