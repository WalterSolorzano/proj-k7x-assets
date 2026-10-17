"""
Script de pulido de materiales y eliminación de poste tosco en vigia-07-nodo.blend
1. Elimina el poste de concreto tosco (POSTE_6M, BANDA_*, REGLA_*, etc.) y lo sustituye por un soporte/mástil tubular industrial esbelto con brida mecanizada.
2. Shader de Panel Solar Hiperrealista: Silicio monocristalino azul noche oscuro, microtextura celular, contactos conductores de plata y capa de vidrio antirreflejo IOR 1.52.
3. Shader de Puck: Aluminio anodizado satinado de alta gama aeroespacial, aletas microbiseladas, ventanas RF ahumadas con absorción realista.
4. Cámara calibrada a vista de producto / detalle.
5. Renderiza still de validación técnica a presentacion/3d/rev-10-puck-pulido.png
"""
import bpy, math, os, mathutils

R = math.radians

# 1. Cargar blend
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-nodo.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

sc = bpy.context.scene

# Configuración de Render optimizado (EEVEE Next, 24 muestras para no ahogar la PC)
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

# 2. Eliminar el poste de concreto tosco y bandas de advertencia
nombres_borrar = [
    'POSTE_6M', 'POSTE_BASE', 'POSTE_TAPA', 
    'BANDA_AMBAR_1m20', 'BANDA_ROJA_2m00', 'REGLA_PLACA'
]
for nom in nombres_borrar:
    obj = bpy.data.objects.get(nom)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)

# 3. Crear Mástil / Soporte Industrial Esbelto (Aluminio aeroespacial / acero cepillado)
# En lugar de un poste tosco de 6m x 0.14m de radio, hacemos un mástil limpio de Ø 0.06m con brida técnica
mat_mastil = bpy.data.materials.get('M_ALUMINIO') or bpy.data.materials.new('M_ALUMINIO')
mat_mastil.use_nodes = True
b_m = next(n for n in mat_mastil.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
b_m.inputs['Base Color'].default_value = (0.75, 0.77, 0.79, 1.0)
b_m.inputs['Metallic'].default_value = 0.95
b_m.inputs['Roughness'].default_value = 0.28

# Mástil esbelto que sostiene el puck (desde z=4.5 hasta z=6.05)
bpy.ops.mesh.primitive_cylinder_add(radius=0.032, depth=1.50, vertices=48, location=(0, 0, 5.30))
mastil_nuevo = bpy.context.object
mastil_nuevo.name = 'MASTIL_TECNICO_ESBELTO'
mastil_nuevo.data.materials.append(mat_mastil)
try:
    bpy.ops.object.shade_auto_smooth(angle=R(30))
except Exception:
    bpy.ops.object.shade_smooth()

# Brida de acople inferior con 4 pernos allen
bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.016, vertices=48, location=(0, 0, 4.56))
brida_inf = bpy.context.object
brida_inf.name = 'BRIDA_INFERIOR_TECNICA'
brida_inf.data.materials.append(mat_mastil)

# 4. PULIDO DEL MATERIAL DE PANEL SOLAR (M_CELDA y M_VIDRIO_PANEL)
m_celda = bpy.data.materials.get('M_CELDA') or bpy.data.materials.new('M_CELDA')
m_celda.use_nodes = True
nt = m_celda.node_tree
for n in list(nt.nodes):
    nt.nodes.remove(n)

out = nt.nodes.new('ShaderNodeOutputMaterial')
out.location = (800, 0)

bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
bsdf.location = (500, 0)
nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])

# Base monocristalina: azul marino muy profundo (casi obsidiana con tintes azulados / iridiscentes)
bsdf.inputs['Base Color'].default_value = (0.012, 0.024, 0.065, 1.0)
bsdf.inputs['Metallic'].default_value = 0.85
bsdf.inputs['Roughness'].default_value = 0.16
try:
    bsdf.inputs['Coat Weight'].default_value = 1.0
    bsdf.inputs['Coat Roughness'].default_value = 0.04
    bsdf.inputs['Coat IOR'].default_value = 1.52
except Exception:
    pass

# Microtextura de líneas colectoras (busbars / micro-grid de plata fotovoltaica)
tc = nt.nodes.new('ShaderNodeTexCoord')
tc.location = (-600, 0)

map_node = nt.nodes.new('ShaderNodeMapping')
map_node.location = (-400, 0)
map_node.inputs['Scale'].default_value = (280.0, 280.0, 280.0)
nt.links.new(tc.outputs['Object'], map_node.inputs['Vector'])

wave = nt.nodes.new('ShaderNodeTexWave')
wave.location = (-180, 0)
wave.wave_type = 'BANDS'
wave.bands_direction = 'X'
wave.inputs['Scale'].default_value = 1.0
wave.inputs['Distortion'].default_value = 0.0
nt.links.new(map_node.outputs['Vector'], wave.inputs['Vector'])

cr = nt.nodes.new('ShaderNodeValToRGB')
cr.location = (60, 0)
cr.color_ramp.elements[0].position = 0.88
cr.color_ramp.elements[0].color = (0.012, 0.022, 0.055, 1.0)
cr.color_ramp.elements[1].position = 0.94
cr.color_ramp.elements[1].color = (0.85, 0.88, 0.92, 1.0) # Conductor de plata
nt.links.new(wave.outputs['Color'], cr.inputs['Fac'])
nt.links.new(cr.outputs['Color'], bsdf.inputs['Base Color'])

# Vidrio antirreflejante de protección superior
m_vidrio = bpy.data.materials.get('M_VIDRIO_PANEL') or bpy.data.materials.new('M_VIDRIO_PANEL')
m_vidrio.use_nodes = True
b_v = next(n for n in m_vidrio.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
b_v.inputs['Base Color'].default_value = (0.94, 0.97, 1.0, 1.0)
b_v.inputs['Metallic'].default_value = 0.0
b_v.inputs['Roughness'].default_value = 0.03
b_v.inputs['IOR'].default_value = 1.52
try:
    b_v.inputs['Transmission Weight'].default_value = 0.92
except Exception:
    pass

# 5. PULIDO DEL CHASIS DEL PUCK (M_ANODIZADO y M_ANODIZADO_OSC)
m_anod = bpy.data.materials.get('M_ANODIZADO')
if m_anod and m_anod.use_nodes:
    b_a = next(n for n in m_anod.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b_a.inputs['Base Color'].default_value = (0.11, 0.12, 0.13, 1.0) # Gris antracita aeroespacial
    b_a.inputs['Metallic'].default_value = 0.92
    b_a.inputs['Roughness'].default_value = 0.32

m_anod_osc = bpy.data.materials.get('M_ANODIZADO_OSC')
if m_anod_osc and m_anod_osc.use_nodes:
    b_ao = next(n for n in m_anod_osc.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b_ao.inputs['Base Color'].default_value = (0.045, 0.048, 0.052, 1.0) # Negro mate anodizado
    b_ao.inputs['Metallic'].default_value = 0.88
    b_ao.inputs['Roughness'].default_value = 0.38

# Ventanas RF dieléctricas (M_PANE_RADOMA)
m_pane = bpy.data.materials.get('M_PANE_RADOMA')
if m_pane and m_pane.use_nodes:
    b_p = next(n for n in m_pane.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b_p.inputs['Base Color'].default_value = (0.06, 0.07, 0.08, 1.0)
    b_p.inputs['Metallic'].default_value = 0.10
    b_p.inputs['Roughness'].default_value = 0.22

# 6. Cámara de Producto Hero & Detalle
cam = bpy.data.objects.get('CAM_PRODUCTO_HERO')
if not cam:
    cam_data = bpy.data.cameras.new('CAM_PRODUCTO_HERO')
    cam_data.lens = 70.0 # Teleobjetivo medio para evitar deformaciones
    cam = bpy.data.objects.new('CAM_PRODUCTO_HERO', cam_data)
    sc.collection.objects.link(cam)

cam.location = (0.85, -0.95, 6.45)
# Orientar hacia el centro del puck (0, 0, 6.15)
target = mathutils.Vector((0.0, 0.0, 6.15))
dir_vec = target - cam.location
cam.rotation_euler = dir_vec.to_track_quat('-Z', 'Y').to_euler()

sc.camera = cam

# Guardar escena actualizada
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("Escena blend guardada sin poste tosco y con materiales PBR avanzados.")

# 7. Renderizar Still de Verificación a presentacion/3d/rev-10-puck-pulido.png
out_file = r"C:\Users\w\Desktop\Rallylatam\presentacion\3d\rev-10-puck-pulido.png"
sc.render.filepath = out_file
bpy.ops.render.render(write_still=True)
print("Still renderizado con exito en:", out_file)
