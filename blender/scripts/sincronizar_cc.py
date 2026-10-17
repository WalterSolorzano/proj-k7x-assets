"""
SINCRONIZACIÓN DE MATERIALES Y SENSORES INTEGRADOS A vigia-07-centro-comercial.blend
Aplica al escenario del Centro Comercial:
1. Material hiperrealista de Panel Solar (M_CELDA): Silicio monocristalino azul noche oscuro con busbars de plata y vidrio templado IOR 1.52 (tanto para el puck como para el huerto solar de 10 paneles de cubierta).
2. Material de Chasis Anodizado oscuro aeroespacial (M_ANODIZADO).
3. Sensores integrados en el nodo del techo (anemómetro de viento en el hombro del puck, cápsula de humedad integrada, pluviómetro).
"""
import bpy, math

R = math.radians
blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-centro-comercial.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

# 1. Shader de Silicio Monocristalino Avanzado para Paneles Solares
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
cr.color_ramp.elements[0].color = (0.010, 0.020, 0.058, 1.0)
cr.color_ramp.elements[1].position = 0.93
cr.color_ramp.elements[1].color = (0.88, 0.90, 0.94, 1.0)
nt.links.new(wave.outputs['Color'], cr.inputs['Fac'])
nt.links.new(cr.outputs['Color'], bsdf.inputs['Base Color'])

# 2. Shader de Chasis Anodizado y Ventanas RF
m_anod = bpy.data.materials.get('M_ANODIZADO')
if m_anod and m_anod.use_nodes:
    b = next(n for n in m_anod.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.10, 0.11, 0.12, 1.0)
    b.inputs['Metallic'].default_value = 0.92
    b.inputs['Roughness'].default_value = 0.30

# 3. Incorporar los sensores directamente integrados al puck en la cubierta
# Nodo en la cubierta está en: x=9.0, y=-3.0, z = 7.6 + 0.3 + 0.24 + 2.90 + 0.135 = 11.175
puck = bpy.data.objects.get('PUCK_CUERPO')
if puck:
    PX, PY, PZ = puck.location.x, puck.location.y, puck.location.z
    mat_anod = m_anod or bpy.data.materials.get('M_ALUMINIO')
    mat_negro = bpy.data.materials.get('M_PLASTICO_NEGRO')
    mat_blanco = bpy.data.materials.get('M_BLANCO_SENSOR')
    mat_inox = bpy.data.materials.get('M_INOX')

    # Anemómetro integrado en el hombro del puck de la cubierta
    if not bpy.data.objects.get('CC_INTEGRADO_ANEMO'):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.010, depth=0.14, vertices=16, location=(PX + 0.12, PY, PZ + 0.06))
        sop_a = bpy.context.object; sop_a.name = 'CC_INTEGRADO_ANEMO'; sop_a.data.materials.append(mat_anod)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.05, vertices=16, location=(PX + 0.12, PY, PZ + 0.13))
        c_a = bpy.context.object; c_a.name = 'CC_ANEMO_HEAD'; c_a.data.materials.append(mat_blanco)
        for k in range(3):
            ang = R(k * 120.0)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.016, depth=0.024, vertices=12,
                                                location=(PX + 0.12 + 0.055*math.cos(ang), PY + 0.055*math.sin(ang), PZ + 0.15),
                                                rotation=(R(90), 0, ang))
            caz = bpy.context.object; caz.name = f'CC_ANEMO_CAZ_{k}'; caz.data.materials.append(mat_negro)

    # Sensor de Humedad y Temperatura integrado en la bahía lateral
    if not bpy.data.objects.get('CC_INTEGRADO_HR'):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.025, depth=0.06, vertices=18, location=(PX - 0.15, PY, PZ - 0.02))
        cap_hr = bpy.context.object; cap_hr.name = 'CC_INTEGRADO_HR'; cap_hr.data.materials.append(mat_blanco)

    # Pluviómetro compacto integrado en cuadrante frontal
    if not bpy.data.objects.get('CC_INTEGRADO_PLUV'):
        bpy.ops.mesh.primitive_cone_add(radius1=0.028, radius2=0.012, depth=0.05, vertices=18, location=(PX, PY - 0.15, PZ))
        c_pluv = bpy.context.object; c_pluv.name = 'CC_INTEGRADO_PLUV'; c_pluv.data.materials.append(mat_blanco)

# Guardar escena blend del centro comercial sincronizada
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print(">>> vigia-07-centro-comercial.blend sincronizado con éxito con materiales PBR y sensores All-in-One.")
