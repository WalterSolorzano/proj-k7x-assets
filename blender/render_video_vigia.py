import bpy
import os

scene = bpy.context.scene

# Configuración del motor y calidad
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
try:
    scene.eevee.taa_render_samples = 32
except Exception:
    pass

# Formato y resolución de video broadcast 1080p
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.fps = 30
scene.frame_start = 1
scene.frame_end = 120

# Cámara activa: 360 del producto
cam_360 = bpy.data.objects.get("CAM_ESC1_PRODUCTO_360")
if cam_360:
    scene.camera = cam_360

# Configurar salida a MP4 H.264
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'HIGH'
scene.render.ffmpeg.ffmpeg_preset = 'GOOD'

out_dir = r"C:\Users\w\Desktop\Rallylatam\presentacion\video"
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "vigia_07_producto_360.mp4")
scene.render.filepath = out_file

print(f"Iniciando render de 120 frames a {out_file}...")
bpy.ops.render.render(animation=True)
print("¡Render de video publicitario 360 finalizado exitosamente!")
