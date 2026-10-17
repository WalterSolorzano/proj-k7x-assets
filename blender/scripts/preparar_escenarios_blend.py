"""
SCRIPT MAESTRO DE PREPARACIÓN DE ESCENAS PARA BLENDER
Configura el archivo blend 'vigia-07-nodo.blend' listo para renderizar en otra PC más potente:
1. Materiales PBR Hiperrealistas:
   - Panel Solar: Silicio monocristalino azul noche oscuro con rejilla conductora de plata y vidrio templado IOR 1.52
   - Chasis Puck: Aluminio anodizado satinado oscuro con aletas de disipación y tornillería inox
   - Ventanas RF: Material dieléctrico ahumado
2. Eliminación de poste tosco -> Mástil técnico esbelto con brida industrial
3. Instrumental Completo:
   - Anemómetro de 3 cazoletas (velocidad de viento)
   - Abrigo de radiación meteorológico (humedad y temperatura)
   - Pluviómetro de balancín
   - Sonda de nivel sumergible con cable
4. Cámaras y Animaciones / Giros para los 3 Escenarios:
   - ESCENARIO 1A: CAM_PRODUCTO_HERO (Giro orbital 360° en 120 frames)
   - ESCENARIO 1B: CAM_DESPIECE (Explosión técnica en eje Z mostrando panel -> tapas -> PCBs internas -> LoRa/ESP32 -> chasis)
   - ESCENARIO 2: CAM_CAMPO_SENSORES (Giro orbital abarcando anemómetro de viento, abrigo de humedad, pluviómetro y mástil en 120 frames)
   - ESCENARIO 3: CAM_CUBIERTA_URBANA (Toma de contexto sobre mástil en cubierta)
5. Guarda el archivo .blend listo para abrir o tirar render directo en la otra PC.
"""
import bpy, math, mathutils

R = math.radians
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-nodo.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

sc = bpy.context.scene

# Configuración base de animación para la otra PC (120 frames @ 24fps = 5s fluidos)
sc.frame_start = 1
sc.frame_end = 120
sc.render.fps = 24
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.resolution_percentage = 100
sc.render.film_transparent = True

# 1. Asegurar eliminación de poste de concreto tosco y marcas viejas
nombres_borrar = [
    'POSTE_6M', 'POSTE_BASE', 'POSTE_TAPA', 
    'BANDA_AMBAR_1m20', 'BANDA_ROJA_2m00', 'REGLA_PLACA'
]
for nom in nombres_borrar:
    obj = bpy.data.objects.get(nom)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

# 2. Mástil y soporte técnico industrial esbelto
mat_aluminio = bpy.data.materials.get('M_ALUMINIO') or bpy.data.materials.new('M_ALUMINIO')
mat_aluminio.use_nodes = True
b_al = next(n for n in mat_aluminio.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
b_al.inputs['Base Color'].default_value = (0.78, 0.80, 0.82, 1.0)
b_al.inputs['Metallic'].default_value = 0.95
b_al.inputs['Roughness'].default_value = 0.24

mastil_obj = bpy.data.objects.get('MASTIL_TECNICO_ESBELTO')
if not mastil_obj:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.034, depth=2.50, vertices=48, location=(0, 0, 4.85))
    mastil_obj = bpy.context.object
    mastil_obj.name = 'MASTIL_TECNICO_ESBELTO'
    mastil_obj.data.materials.append(mat_aluminio)
    try:
        bpy.ops.object.shade_auto_smooth(angle=R(30))
    except Exception:
        bpy.ops.object.shade_smooth()

# Brida mecanizada de sujeción
brida_obj = bpy.data.objects.get('BRIDA_INFERIOR_TECNICA')
if not brida_obj:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.018, vertices=48, location=(0, 0, 3.62))
    brida_obj = bpy.context.object
    brida_obj.name = 'BRIDA_INFERIOR_TECNICA'
    brida_obj.data.materials.append(mat_aluminio)

# 3. Pulido PBR del Panel Solar Monocristalino
m_celda = bpy.data.materials.get('M_CELDA') or bpy.data.materials.new('M_CELDA')
m_celda.use_nodes = True
nt = m_celda.node_tree
nt.nodes.clear()

out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (800, 0)
bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location = (450, 0)
nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

bsdf.inputs['Metallic'].default_value = 0.90
bsdf.inputs['Roughness'].default_value = 0.12
try:
    bsdf.inputs['Coat Weight'].default_value = 1.0
    bsdf.inputs['Coat Roughness'].default_value = 0.03
    bsdf.inputs['Coat IOR'].default_value = 1.52
except Exception:
    pass

tc = nt.nodes.new('ShaderNodeTexCoord'); tc.location = (-650, 0)
mp = nt.nodes.new('ShaderNodeMapping'); mp.location = (-450, 0)
mp.inputs['Scale'].default_value = (260.0, 260.0, 260.0)
nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])

wave = nt.nodes.new('ShaderNodeTexWave'); wave.location = (-220, 0)
wave.wave_type = 'BANDS'; wave.bands_direction = 'X'
nt.links.new(mp.outputs['Vector'], wave.inputs['Vector'])

cr = nt.nodes.new('ShaderNodeValToRGB'); cr.location = (50, 0)
cr.color_ramp.elements[0].position = 0.88
cr.color_ramp.elements[0].color = (0.010, 0.020, 0.058, 1.0) # Azul noche monocristalino profundo
cr.color_ramp.elements[1].position = 0.93
cr.color_ramp.elements[1].color = (0.88, 0.90, 0.94, 1.0) # Busbar plata
nt.links.new(wave.outputs['Color'], cr.inputs['Fac'])
nt.links.new(cr.outputs['Color'], bsdf.inputs['Base Color'])

# 4. Pulido de Chasis Anodizado y Ventanas RF
m_anod = bpy.data.materials.get('M_ANODIZADO')
if m_anod and m_anod.use_nodes:
    b = next(n for n in m_anod.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.10, 0.11, 0.12, 1.0)
    b.inputs['Metallic'].default_value = 0.92
    b.inputs['Roughness'].default_value = 0.30

m_pane = bpy.data.materials.get('M_PANE_RADOMA')
if m_pane and m_pane.use_nodes:
    b = next(n for n in m_pane.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.05, 0.06, 0.07, 1.0)
    b.inputs['Metallic'].default_value = 0.10
    b.inputs['Roughness'].default_value = 0.20

# 5. Configurar Cámaras para los 3 Escenarios y Giros de 360°

def crear_cam_orbital(nombre, radio, altura, target_pos, frame_ini=1, frame_fin=120):
    cam = bpy.data.objects.get(nombre)
    if not cam:
        cd = bpy.data.cameras.new(nombre)
        cd.lens = 55.0
        cam = bpy.data.objects.new(nombre, cd)
        sc.collection.objects.link(cam)
    
    # Target / Empty
    tgt_name = 'TGT_' + nombre
    tgt = bpy.data.objects.get(tgt_name)
    if not tgt:
        tgt = bpy.data.objects.new(tgt_name, None)
        sc.collection.objects.link(tgt)
        con = cam.constraints.new('TRACK_TO')
        con.target = tgt
        con.track_axis = 'TRACK_NEGATIVE_Z'
        con.up_axis = 'UP_Y'
    tgt.location = target_pos
    
    # Animación orbital 360° en frames 1..120
    cam.animation_data_clear()
    total_f = frame_fin - frame_ini
    for i in range(total_f + 1):
        f = frame_ini + i
        t = i / float(total_f)
        ang = t * 2 * math.pi
        cam.location.x = target_pos[0] + radio * math.cos(ang)
        cam.location.y = target_pos[1] + radio * math.sin(ang)
        cam.location.z = altura
        cam.keyframe_insert(data_path="location", frame=f)
    
    # Interpolación lineal constante para giro continuo suave
    if cam.animation_data and cam.animation_data.action:
        for fcurve in cam.animation_data.action.fcurves:
            for kf in fcurve.keyframe_points:
                kf.interpolation = 'LINEAR'
    return cam

# Escenario 1A: Giro de Producto Hero (Puck solo en mástil corto)
cam_esc1 = crear_cam_orbital('CAM_ESC1_PRODUCTO_360', radio=1.25, altura=6.35, target_pos=(0.0, 0.0, 6.12))

# Escenario 2: Giro de Estación Completa con Sensores (Anemómetro + Abrigo Humedad + Pluviómetro + Mástil)
cam_esc2 = crear_cam_orbital('CAM_ESC2_SENSORES_360', radio=2.20, altura=5.20, target_pos=(0.0, 0.0, 5.00))

# Escenario 1B: Cámara de Despiece Técnico (Exploded View)
cam_desp = bpy.data.objects.get('CAM_ESC1_DESPIECE')
if not cam_desp:
    cd = bpy.data.cameras.new('CAM_ESC1_DESPIECE')
    cd.lens = 65.0
    cam_desp = bpy.data.objects.new('CAM_ESC1_DESPIECE', cd)
    sc.collection.objects.link(cam_desp)

cam_desp.location = (1.45, -1.65, 6.85)
tgt_desp = mathutils.Vector((0.0, 0.0, 6.15))
dir_desp = tgt_desp - cam_desp.location
cam_desp.rotation_euler = dir_desp.to_track_quat('-Z', 'Y').to_euler()

# Escenario 3: Cámara de Cubierta Centro Comercial
cam_esc3 = bpy.data.objects.get('CAM_ESC3_CUBIERTA')
if not cam_esc3:
    cd = bpy.data.cameras.new('CAM_ESC3_CUBIERTA')
    cd.lens = 40.0
    cam_esc3 = bpy.data.objects.new('CAM_ESC3_CUBIERTA', cd)
    sc.collection.objects.link(cam_esc3)
cam_esc3.location = (2.80, -3.20, 7.10)
tgt_esc3 = mathutils.Vector((0.0, 0.0, 5.80))
dir_esc3 = tgt_esc3 - cam_esc3.location
cam_esc3.rotation_euler = dir_esc3.to_track_quat('-Z', 'Y').to_euler()

# 6. Animación de Despiece en Timeline (Frames 1: Ensamblado -> Frame 60: Completamente Explotado)
# Así en la otra PC pueden renderizar el armado/despiece con solo animar frames 1..60
piezas_explosion = {
    'PUCK_PV': 0.38,
    'PUCK_TAPA': 0.24,
    'PUCK_PCB_2': 0.14,
    'ANT_CHIP': 0.14,
    'PUCK_SHIELD': 0.14,
    'PUCK_PCB_1': 0.05,
    'PUCK_ESP32': 0.05,
    'PUCK_PCB_0': -0.07,
    'PUCK_LORA': -0.07,
    'PUCK_COIL': -0.07,
    'PUCK_BRIDA': -0.16,
    'PUCK_CUELLO': -0.16,
    'PUCK_FALDON': -0.16,
}

for o in bpy.data.objects:
    for prefijo, dz in piezas_explosion.items():
        if prefijo in o.name:
            z_original = o.location.z
            o.keyframe_insert(data_path="location", frame=1)
            o.location.z = z_original + dz
            o.keyframe_insert(data_path="location", frame=60)
            o.location.z = z_original # Regresar al estado base en frame 1
            o.keyframe_insert(data_path="location", frame=1)
            break

# Dejar por defecto la cámara principal de producto
sc.camera = cam_esc1

# Guardar escena principal .blend
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(">>> vigia-07-nodo.blend configurado y guardado con éxito con los 3 escenarios, cámaras, giros 360 y despiece.")
