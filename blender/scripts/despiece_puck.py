"""
Render de Despiece (Exploded View) del Puck VIGÍA-07
Separa las capas del nodo a lo largo del eje Z para mostrar la ingeniería interna:
- Capa 1 (superior): Panel solar monocristalino pulido + marco
- Capa 2: Tapa ciega superior mecanizada + junta estanca
- Capa 3: PCB Superior con 4 chip-antennas a 90° (RX 360°) y blindaje RF
- Capa 4: PCB Central con procesador ESP32-S3 y microcontrolador
- Capa 5: Chasis anular disipador de aluminio aeroespacial con ventanas RF y LEDs
- Capa 6: PCB Inferior con módulo LoRa SX1276 (915 MHz) y bobina de cobre
- Capa 7: Brida inferior mecanizada y mástil de soporte técnico
"""
import bpy, math, os, mathutils

R = math.radians
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-nodo.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
try:
    sc.eevee.taa_render_samples = 24
except Exception:
    pass

sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.film_transparent = True
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.resolution_percentage = 100

# Desplazamientos en Z para vista de despiece (Exploded View)
# Panel solar y soporte suben bastante
for o in bpy.data.objects:
    if 'PUCK_PV' in o.name:
        o.location.z += 0.42
    elif 'PUCK_TAPA' in o.name:
        o.location.z += 0.28
    elif 'PUCK_PCB_2' in o.name or 'ANT_CHIP' in o.name or 'PUCK_SHIELD' in o.name:
        o.location.z += 0.16
    elif 'PUCK_PCB_1' in o.name or 'PUCK_ESP32' in o.name:
        o.location.z += 0.06
    elif 'PUCK_PCB_0' in o.name or 'PUCK_LORA' in o.name or 'PUCK_COIL' in o.name or 'PUCK_BORNERA' in o.name:
        o.location.z -= 0.10
    elif 'PUCK_BRIDA' in o.name or 'PUCK_CUELLO' in o.name or 'PUCK_FALDON' in o.name or 'PUCK_BULON' in o.name:
        o.location.z -= 0.22
    elif 'MASTIL' in o.name or 'BRIDA_INFERIOR' in o.name:
        o.location.z -= 0.32

# Cámara de Despiece (ángulo lateral elevado para ver todas las capas flotando)
cam = bpy.data.objects.get('CAM_DESPIECE')
if not cam:
    cam_data = bpy.data.cameras.new('CAM_DESPIECE')
    cam_data.lens = 65.0
    cam = bpy.data.objects.new('CAM_DESPIECE', cam_data)
    sc.collection.objects.link(cam)

cam.location = (1.45, -1.65, 6.95)
target = mathutils.Vector((0.0, 0.0, 6.20))
dir_vec = target - cam.location
cam.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()
sc.camera = cam

out_file = r"C:\Users\w\Desktop\Rallylatam\presentacion\3d\rev-11-puck-despiece.png"
sc.render.filepath = out_file
bpy.ops.render.render(write_still=True)
print("Despiece renderizado con exito en:", out_file)
