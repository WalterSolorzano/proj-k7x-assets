"""
Script Integral: Escenarios 3D, Cámaras con Giros, Sensores y Despiece
1. Carga vigia-07-nodo.blend
2. Ajusta mástil esbelto para que sostenga todos los sensores:
   - Anemómetro (velocidad de viento) en z ~ 5.48 m
   - Abrigo de humedad/temperatura en z ~ 4.76 m
   - Pluviómetro en z ~ 4.50 m
   - Sonda de nivel sumergible en z ~ 3.90 m
3. Configura las 3 cámaras fijas / giros:
   - CAM_ESC1_PRODUCTO: Vista 3/4 hero del puck pulido
   - CAM_ESC1_DESPIECE: Vista isométrica técnica con despiece de capas (panel, tapas, PCBs, chasis, radio)
   - CAM_ESC2_SENSORES: Encuadre vertical/lateral abarcando anemómetro de cazoletas, abrigo HR, pluviómetro y mástil industrial
4. Genera los renders en baja muestra (16 muestras EEVEE Next) para que no sature la PC:
   - rev-10-puck-pulido.png
   - rev-11-puck-despiece.png
   - rev-12-estacion-sensores.png
"""
import bpy, math, os, mathutils

R = math.radians
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-nodo.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
try:
    sc.eevee.taa_render_samples = 16  # Muy ligero y rápido para proteger la PC
except Exception:
    pass

sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.film_transparent = True
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.resolution_percentage = 100

# 1. Asegurar mástil técnico industrial estilizado que cubra desde z=3.8 hasta z=6.05
m_mastil = bpy.data.materials.get('M_ALUMINIO')
if not m_mastil:
    m_mastil = bpy.data.materials.new('M_ALUMINIO')
    m_mastil.use_nodes = True

mastil_obj = bpy.data.objects.get('MASTIL_TECNICO_ESBELTO')
if not mastil_obj:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=2.40, vertices=36, location=(0, 0, 4.90))
    mastil_obj = bpy.context.object
    mastil_obj.name = 'MASTIL_TECNICO_ESBELTO'
    mastil_obj.data.materials.append(m_mastil)
else:
    mastil_obj.location = (0, 0, 4.90)
    mastil_obj.scale = (1, 1, 1.6)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

# 2. Materiales pulidos de los sensores
m_blanco = bpy.data.materials.get('M_BLANCO_SENSOR')
if m_blanco and m_blanco.use_nodes:
    b = next(n for n in m_blanco.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.90, 0.91, 0.92, 1.0)
    b.inputs['Roughness'].default_value = 0.25

m_inox = bpy.data.materials.get('M_INOX')
if m_inox and m_inox.use_nodes:
    b = next(n for n in m_inox.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.85, 0.86, 0.88, 1.0)
    b.inputs['Metallic'].default_value = 0.98
    b.inputs['Roughness'].default_value = 0.18

# Cazoletas de anemómetro: acabado negro mate aerodinámico con biseles de polímero
m_negro = bpy.data.materials.get('M_PLASTICO_NEGRO')
if m_negro and m_negro.use_nodes:
    b = next(n for n in m_negro.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.02, 0.02, 0.025, 1.0)
    b.inputs['Roughness'].default_value = 0.35

# 3. SETUP DE CÁMARA 2: SENSORES EN EL TERRENO / ESTACIÓN COMPLETA
cam_sensores = bpy.data.objects.get('CAM_SENSORES')
if not cam_sensores:
    cd = bpy.data.cameras.new('CAM_SENSORES')
    cd.lens = 45.0
    cam_sensores = bpy.data.objects.new('CAM_SENSORES', cd)
    sc.collection.objects.link(cam_sensores)

cam_sensores.location = (1.95, -2.15, 5.25)
target_sensores = mathutils.Vector((0.0, 0.0, 5.10))
dir_sensores = target_sensores - cam_sensores.location
cam_sensores.rotation_euler = dir_sensores.to_track_quat('-Z', 'Y').to_euler()

# Renderizar Escenario 2: Estación con sensores (anemómetro, abrigo humedad, pluviómetro, etc.)
sc.camera = cam_sensores
out_sensores = r"C:\Users\w\Desktop\Rallylatam\presentacion\3d\rev-12-estacion-sensores.png"
sc.render.filepath = out_sensores
bpy.ops.render.render(write_still=True)
print("Render Estación de Sensores OK:", out_sensores)

# 4. SETUP DE CÁMARA 3: DESPIECE EXPLOTADO (Exploded View)
for o in bpy.data.objects:
    if 'PUCK_PV' in o.name:
        o.location.z += 0.35
    elif 'PUCK_TAPA' in o.name:
        o.location.z += 0.22
    elif 'PUCK_PCB_2' in o.name or 'ANT_CHIP' in o.name or 'PUCK_SHIELD' in o.name:
        o.location.z += 0.12
    elif 'PUCK_PCB_1' in o.name or 'PUCK_ESP32' in o.name:
        o.location.z += 0.04
    elif 'PUCK_PCB_0' in o.name or 'PUCK_LORA' in o.name or 'PUCK_COIL' in o.name:
        o.location.z -= 0.08
    elif 'PUCK_BRIDA' in o.name or 'PUCK_CUELLO' in o.name or 'PUCK_FALDON' in o.name:
        o.location.z -= 0.18

cam_despiece = bpy.data.objects.get('CAM_DESPIECE')
if not cam_despiece:
    cd = bpy.data.cameras.new('CAM_DESPIECE')
    cd.lens = 60.0
    cam_despiece = bpy.data.objects.new('CAM_DESPIECE', cd)
    sc.collection.objects.link(cam_despiece)

cam_despiece.location = (1.20, -1.35, 6.75)
target_despiece = mathutils.Vector((0.0, 0.0, 6.20))
dir_despiece = target_despiece - cam_despiece.location
cam_despiece.rotation_euler = dir_despiece.to_track_quat('-Z', 'Y').to_euler()

sc.camera = cam_despiece
out_despiece = r"C:\Users\w\Desktop\Rallylatam\presentacion\3d\rev-11-puck-despiece.png"
sc.render.filepath = out_despiece
bpy.ops.render.render(write_still=True)
print("Render Despiece OK:", out_despiece)

# Guardar escena blend con los ajustes definitivos
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("Escena blend guardada.")
