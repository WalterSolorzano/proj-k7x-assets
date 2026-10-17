"""
INTEGRACIÓN TOTAL DE SENSORES EN EL PRODUCTO (ALL-IN-ONE COMPACTO)
Reubica y fusiona todos los subsistemas sensores directamente montados sobre el cuerpo del Puck (z = 6.10):
1. ANEMÓMETRO ULTRASÓNICO / MINI-CAZOLETAS SUPERIOR:
   - Integrado en brazo técnico superior compacto anclado al chasis (z ~ 6.25 - 6.35 m), sin cables colgando ni brazos lejanos.
2. ABRIGO / SENSOR DE HUMEDAD Y TEMPERATURA (HR/TEMP):
   - Montado directamente en la bahía lateral inferior del Puck en mini-cápsula louvered integrada (x = -0.165, y = 0, z = 6.08).
3. PLUVIÓMETRO COMPACTO INTEGRADO:
   - Embudo y sensor de precipitación montado en el hombro del Puck con soporte mecanizado CNC a ras del chasis (x = 0.165, y = 0, z = 6.10).
4. CONEXIÓN RÁPIDA / GLANDULA DE SONDA DE NIVEL:
   - Conector estanco M12 / prensaestopas directo en la base del puck con conector rápido de sonda.
5. Se eliminan abrazaderas flotantes del mástil viejo y la caja tosca separada: TODO se unifica en una sola pieza tecnológica portátil All-in-One.
6. Actualiza las cámaras orbitales para encuadrar la unidad unificada y guarda el blend.
"""
import bpy, math, mathutils

R = math.radians
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-nodo.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

sc = bpy.context.scene

# Centro del Puck
PUCK_Z = 6.10

# 1. Eliminar caja de conexiones separada que colgaba del mástil (ahora la electrónica está dentro del puck)
cajas_viejas = [
    'CAJA_CAMPOS', 'CAJA_CAMPOS_TAPA', 'CAJA_ABRAZ_A', 'CAJA_ABRAZ_B', 
    'CAJA_PG', 'CAJA_TORN_A', 'CAJA_TORN_B', 'CAJA_CABLE_DOWN', 'TXT_CAJA'
]
for nom in cajas_viejas:
    o = bpy.data.objects.get(nom)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# 2. INTEGRAR ANEMÓMETRO (Velocidad de viento) DIRECTO AL HOMBRO SUPERIOR DEL PUCK
# En lugar de colgar a z=5.44 m, se monta en un soporte vertical integrado al chasis del puck a z=6.15 -> cazoletas a z=6.28
delta_anemo_z = PUCK_Z - 5.44 + 0.12 # +0.78m
delta_anemo_x = -0.08 # mas compacto y pegado al chasis

anemo_objs = [o for o in bpy.data.objects if 'NODO_ANEMO' in o.name]
for o in anemo_objs:
    o.location.z += delta_anemo_z
    o.location.x += delta_anemo_x

# Soporte mecanizado anodizado que une el anemómetro al chasis del puck
mat_anod = bpy.data.materials.get('M_ANODIZADO')
bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.15, vertices=24, location=(0.14, 0.0, PUCK_Z + 0.04))
sop_anemo = bpy.context.object
sop_anemo.name = 'INTEGRADO_SOP_ANEMO'
sop_anemo.data.materials.append(mat_anod)

# 3. INTEGRAR SENSOR DE HUMEDAD Y TEMPERATURA (HR/TEMP)
# El abrigo de platos ahora es una cápsula compacta lateral integrada a la pared del puck (x = -0.155)
delta_hr_z = PUCK_Z - 4.76 - 0.04 # sube a z ~ 6.02
delta_hr_x = 0.11 # se acerca de x=-0.26 a x=-0.15

hr_objs = [o for o in bpy.data.objects if 'NODO_HR' in o.name]
for o in hr_objs:
    if 'ABRAZ' in o.name:
        bpy.data.objects.remove(o, do_unlink=True)
    else:
        o.location.z += delta_hr_z
        o.location.x += delta_hr_x

# Mini soporte integrado de HR
bpy.ops.mesh.primitive_cylinder_add(radius=0.010, depth=0.04, vertices=20, 
                                    location=(-0.145, 0.0, PUCK_Z - 0.02), rotation=(0, R(90), 0))
sop_hr = bpy.context.object
sop_hr.name = 'INTEGRADO_SOP_HR'
sop_hr.data.materials.append(mat_anod)

# 4. INTEGRAR PLUVIÓMETRO (Precipitación)
# El embudo se ancla en el sector frontal-lateral del puck
delta_pluv_z = PUCK_Z - 4.50 + 0.08 # sube a z ~ 6.18
delta_pluv_x = -0.06 # se compacta junto al chasis
pluv_objs = [o for o in bpy.data.objects if 'PLUV' in o.name]
for o in pluv_objs:
    if 'ABRAZ' in o.name:
        bpy.data.objects.remove(o, do_unlink=True)
    else:
        o.location.z += delta_pluv_z
        o.location.x += delta_pluv_x

# Brazo soporte mecanizado del pluviómetro al cuerpo del puck
bpy.ops.mesh.primitive_cylinder_add(radius=0.010, depth=0.05, vertices=20, 
                                    location=(0.135, 0.0, PUCK_Z - 0.03), rotation=(0, R(90), 0))
sop_pluv = bpy.context.object
sop_pluv.name = 'INTEGRADO_SOP_PLUV'
sop_pluv.data.materials.append(mat_anod)

# 5. INTEGRAR SONDA DE NIVEL
# Conector rápido hembra IP68 M12 directo en la parte baja del puck
delta_nivel_z = PUCK_Z - 3.89 - 0.50 # Sonda cuelga justo bajo el puck
nivel_objs = [o for o in bpy.data.objects if 'NIVEL' in o.name]
for o in nivel_objs:
    o.location.z += delta_nivel_z
    o.location.x += 0.03

# 6. Mástil técnico corto para producto de sobremesa / montaje en torre
mastil = bpy.data.objects.get('MASTIL_TECNICO_ESBELTO')
if mastil:
    mastil.location.z = PUCK_Z - 0.50
    mastil.scale = (1, 1, 0.40) # Mástil compacto técnico de montaje

brida = bpy.data.objects.get('BRIDA_INFERIOR_TECNICA')
if brida:
    brida.location.z = PUCK_Z - 0.98

# 7. Actualizar Cámaras para el Producto Unificado All-in-One
cam_prod = bpy.data.objects.get('CAM_ESC1_PRODUCTO_360')
if cam_prod:
    tgt = bpy.data.objects.get('TGT_CAM_ESC1_PRODUCTO_360')
    if tgt:
        tgt.location = (0.0, 0.0, PUCK_Z + 0.05)

cam_sensores = bpy.data.objects.get('CAM_ESC2_SENSORES_360')
if cam_sensores:
    tgt2 = bpy.data.objects.get('TGT_CAM_ESC2_SENSORES_360')
    if tgt2:
        tgt2.location = (0.0, 0.0, PUCK_Z + 0.05)

# Guardar escena blend unificada
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(">>> PRODUCTO ALL-IN-ONE: Todos los sensores (viento, humedad, lluvia, nivel) integrados directamente en el chasis del Puck.")
