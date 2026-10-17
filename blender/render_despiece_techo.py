import bpy
import math

print("=== INICIANDO SCRIPT DE TECHO Y SENALES TELEFONICAS ===")

# 1. Cargar la escena
blend_path = r"c:\Users\w\Desktop\Rallylatam\blender\vigia-07-centro-comercial-anim.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'

# Ajustar color de fondo a gris neutro institucional claro/medio
if scene.world and scene.world.node_tree:
    bg = scene.world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = (0.92, 0.93, 0.95, 1.0)
        bg.inputs[1].default_value = 1.0

# 2. Localizar objetos del techo que deben elevarse y desaparecer
techo_names = [o.name for o in bpy.data.objects if any(k in o.name.upper() for k in ["TECHO", "PRETIL", "PV_", "AA_", "DUCTO", "CASETA"])]
print(f"Objetos de techo detectados: {len(techo_names)}")

# Posición del nodo receptor Vigía-07
receptor_pos = (9.0, -3.0, 11.2)

# Asegurar que el receptor y mástil sean bien visibles y destaquen
mastil = bpy.data.objects.get("MASTIL_ANTENA")
puck = bpy.data.objects.get("PUCK_CUERPO")
led = bpy.data.objects.get("PUCK_LED")

if puck:
    puck.hide_render = False
if mastil:
    mastil.hide_render = False
if led:
    led.hide_render = False

# Crear o reforzar material emisivo cian/rojo para las ondas/haces telefónicos
mat_beam = bpy.data.materials.get("MAT_BEAM_SIGNAL")
if not mat_beam:
    mat_beam = bpy.data.materials.new("MAT_BEAM_SIGNAL")
    mat_beam.use_nodes = True
nodes = mat_beam.node_tree.nodes
nodes.clear()
emit = nodes.new(type="ShaderNodeEmission")
emit.inputs['Color'].default_value = (0.05, 0.75, 1.0, 1.0) # Cian de datos vibrante
emit.inputs['Strength'].default_value = 8.0
out = nodes.new(type="ShaderNodeOutputMaterial")
mat_beam.node_tree.links.new(emit.outputs['Emission'], out.inputs['Surface'])

# Material para las personas (calor térmico / presencia detectada)
mat_heat = bpy.data.materials.get("MAT_HEAT_HUMAN")
if not mat_heat:
    mat_heat = bpy.data.materials.new("MAT_HEAT_HUMAN")
    mat_heat.use_nodes = True
hnodes = mat_heat.node_tree.nodes
hnodes.clear()
hemit = hnodes.new(type="ShaderNodeEmission")
hemit.inputs['Color'].default_value = (0.95, 0.15, 0.1, 1.0) # Rojo alerta presencia
hemit.inputs['Strength'].default_value = 6.0
hout = hnodes.new(type="ShaderNodeOutputMaterial")
mat_heat.node_tree.links.new(hemit.outputs['Emission'], hout.inputs['Surface'])

# Aplicar a las personas
for obj in bpy.data.objects:
    if "HUMAN" in obj.name.upper() or "PERSONA" in obj.name.upper():
        if obj.data and hasattr(obj.data, "materials"):
            obj.data.materials.clear()
            obj.data.materials.append(mat_heat)

# Asegurar luz interior cenital potente
l_int = bpy.data.objects.get("L_INTERIOR_TOP")
if not l_int:
    light_data = bpy.data.lights.new(name="L_INTERIOR_DATA", type='AREA')
    light_data.energy = 5000.0
    light_data.size = 25.0
    light_data.color = (1.0, 0.98, 0.95)
    l_int = bpy.data.objects.new(name="L_INTERIOR_TOP", object_data=light_data)
    bpy.context.collection.objects.link(l_int)
    l_int.location = (0, 0, 8.5)
else:
    l_int.data.energy = 6000.0
    l_int.location = (0, 0, 8.5)

# Cámara cenital dron
cam_obj = bpy.data.objects.get("CAM_CENITAL_DRON")
if not cam_obj:
    cam_data = bpy.data.cameras.new(name="CAM_DATA_DRON")
    cam_obj = bpy.data.objects.new(name="CAM_CENITAL_DRON", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)

cam_obj.location = (0.0, -18.0, 30.0)
cam_obj.rotation_euler = (math.radians(52.0), 0.0, 0.0)
cam_obj.data.lens = 40.0
scene.camera = cam_obj

# Configurar render 1: TECHO CERRADO (antes del despiece)
for name in techo_names:
    o = bpy.data.objects.get(name)
    if o:
        o.hide_render = False

# Ocultar los haces de señal mientras el techo está cerrado
for o in bpy.data.objects:
    if "BEAM" in o.name.upper() or "SENAL" in o.name.upper():
        o.hide_render = True

scene.render.filepath = r"c:\Users\w\Desktop\Rallylatam\presentacion\3d\ref-42-techo-cerrado.png"
bpy.ops.render.render(write_still=True)
print("Render 1 completado: ref-42-techo-cerrado.png")

# Configurar render 2: TECHO ELEVADO / INTERIOR REVELADO CON HACES DE DATOS HACIA EL NODO
for name in techo_names:
    o = bpy.data.objects.get(name)
    if o:
        o.hide_render = True  # Desaparece para ver el interior cristalino

# Mostrar haces de señal telefónica
for o in bpy.data.objects:
    if "BEAM" in o.name.upper() or "SENAL" in o.name.upper():
        o.hide_render = False
        if o.data and hasattr(o.data, "materials"):
            o.data.materials.clear()
            o.data.materials.append(mat_beam)

# Asegurar que los haces de señal apuntan directamente a la posición del receptor
# Crear múltiples ondas/arcos parabólicos dinámicos saliendo de las personas hacia el puck
print("Generando arcos electromagnéticos parabólicos...")
beampoints = [
    (-8.0, 2.5, 1.2),
    (-7.5, 3.0, 1.2),
    (-8.5, 1.8, 1.2),
    (0.0, -0.5, 1.2),
    (1.2, 0.2, 1.2),
    (-1.0, -1.0, 1.2),
    (7.0, -2.0, 1.2),
    (8.2, -1.5, 1.2),
    (6.5, -3.5, 1.2),
    (5.0, 2.0, 1.2),
    (-4.0, -3.0, 1.2)
]

for idx, p_start in enumerate(beampoints):
    curve_data = bpy.data.curves.new(f"ARC_BEAM_CURVE_{idx}", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = 0.09 # Grosor visible
    curve_data.bevel_resolution = 4
    
    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(1) # 2 puntos en total
    
    # Punto inicio (teléfono de persona)
    p0 = spline.bezier_points[0]
    p0.co = p_start
    # Manija de salida arqueada hacia arriba
    p0.handle_right = (p_start[0], p_start[1], p_start[2] + 4.5)
    p0.handle_left = (p_start[0], p_start[1], p_start[2] - 1.0)
    
    # Punto final (nodo receptor Vigía-07 en mástil)
    p1 = spline.bezier_points[1]
    p1.co = receptor_pos
    p1.handle_left = (receptor_pos[0] - (receptor_pos[0]-p_start[0])*0.3, receptor_pos[1] - (receptor_pos[1]-p_start[1])*0.3, receptor_pos[2] + 2.0)
    p1.handle_right = receptor_pos
    
    beam_obj = bpy.data.objects.new(f"ARC_BEAM_OBJ_{idx}", curve_data)
    bpy.context.collection.objects.link(beam_obj)
    beam_obj.data.materials.append(mat_beam)

# Guardar escena actualizada
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Render 2: INTERIOR Y TRANSMISIÓN AL RECEPTOR
scene.render.filepath = r"c:\Users\w\Desktop\Rallylatam\presentacion\3d\ref-44-interior-senales.png"
bpy.ops.render.render(write_still=True)
print("Render 2 completado: ref-44-interior-senales.png")

print("=== PROCESO COMPLETADO EXITOSAMENTE ===")
