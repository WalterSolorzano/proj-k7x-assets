"""Arranca el servidor MCP de Blender al lanzar la GUI.

Uso:
    blender.exe --python blender/scripts/start_mcp.py

El addon "MCP for Blender" (scripts/addons/blender_mcp.py) expone el operador
`blendermcp.start_server`. El auto-arranque del addon no siempre se dispara, así que
esto lo garantiza y verifica que el puerto quede escuchando.
"""

import bpy
import os
import socket
import traceback

PORT = 9876
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "start_mcp.log")


def _log(message):
    line = "[start_mcp] %s" % message
    print(line)
    try:
        with open(os.path.abspath(LOG), "a", encoding="utf-8") as handle:
            handle.write(line + "\n")
    except OSError:
        pass


def _port_listening(host="127.0.0.1", port=PORT):
    probe = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    probe.settimeout(0.2)
    try:
        return probe.connect_ex((host, port)) == 0
    finally:
        probe.close()


def _start():
    _log("timer _start disparado (background=%s)" % bpy.app.background)
    if bpy.app.background:
        return None
    try:
        server = getattr(bpy.types, "blendermcp_server", None)
        if server is not None and getattr(server, "running", False):
            _log("el servidor ya estaba corriendo")
            return None

        _log("addon blender_mcp importable -> %s" % _addon_available())
        try:
            bpy.ops.blendermcp.start_server()
            _log("bpy.ops.blendermcp.start_server() OK")
        except Exception as op_exc:
            _log("operador fallo (%s); probando fallback" % op_exc)
            import blender_mcp

            server = blender_mcp.BlenderMCPServer(port=bpy.context.scene.blendermcp_port)
            bpy.types.blendermcp_server = server
            server.start()
            _log("servidor instanciado por fallback")

        _log("servidor iniciado en el puerto %s" % PORT)
    except Exception:
        _log("no se pudo iniciar el servidor:\n%s" % traceback.format_exc())
    return None


def _addon_available():
    try:
        import importlib.util

        return importlib.util.find_spec("blender_mcp") is not None
    except Exception:
        return False


def _verify():
    _log("puerto %s escuchando -> %s" % (PORT, _port_listening()))
    return None


bpy.app.timers.register(_start, first_interval=1.0)
bpy.app.timers.register(_verify, first_interval=3.0)
