import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# ==============================================================================
# 1. LIMPIEZA Y CREACIÓN DE COLECCIÓN PRINCIPAL T3RTIX
# ==============================================================================
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

col_main = bpy.data.collections.new("T3RTIX_Despiece_3D")
bpy.context.scene.collection.children.link(col_main)

def mover_a_coleccion(obj):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col_main.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(35))
    except Exception:
        bpy.ops.object.shade_smooth()
    mod = obj.modifiers.new(name="Bevel_Industrial", type='BEVEL')
    mod.width = 0.0015
    mod.segments = 2
    mod.limit_method = 'ANGLE'

# ==============================================================================
# 2. MATERIALES PBR DE ALTA CALIDAD
# ==============================================================================
def crear_mat(nombre, color, metal=0.0, rough=0.35, coat=0.0):
    m = bpy.data.materials.new(name=nombre)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        bsdf.inputs["Metallic"].default_value = metal
        bsdf.inputs["Roughness"].default_value = rough
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = coat
        elif "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = coat
    return m

M_SOLAR = crear_mat("MAT_Celda_Solar_Monocristalina", (0.012, 0.045, 0.16, 1.0), 0.3, 0.08, 1.0)
M_MARCO_ALU = crear_mat("MAT_Aluminio_Anodizado_Negro", (0.04, 0.04, 0.045, 1.0), 0.85, 0.28, 0.0)
M_ABS_NEGRO = crear_mat("MAT_ABS_Negro_IP65", (0.025, 0.025, 0.03, 1.0), 0.0, 0.42, 0.15)
M_ABS_BLANCO = crear_mat("MAT_ABS_Blanco_UV", (0.90, 0.91, 0.89, 1.0), 0.0, 0.28, 0.2)
M_INOX = crear_mat("MAT_Acero_Inoxidable", (0.72, 0.74, 0.76, 1.0), 0.95, 0.20, 0.0)
M_PCB_ESP32 = crear_mat("MAT_PCB_Negra_ESP32", (0.015, 0.015, 0.02, 1.0), 0.05, 0.22, 0.6)
M_PCB_LORA = crear_mat("MAT_PCB_Verde_LoRa32", (0.01, 0.22, 0.08, 1.0), 0.05, 0.22, 0.6)
M_PCB_MPPT = crear_mat("MAT_PCB_Naranja_CN3791", (0.78, 0.28, 0.02, 1.0), 0.05, 0.22, 0.6)
M_PCB_BME = crear_mat("MAT_PCB_Purpura_BME280", (0.18, 0.04, 0.38, 1.0), 0.05, 0.22, 0.6)
M_ORO = crear_mat("MAT_Oro_Pines_SMA", (0.96, 0.72, 0.15, 1.0), 1.0, 0.15, 0.0)
M_BAT_AZUL = crear_mat("MAT_Bateria_18650_Azul", (0.02, 0.18, 0.78, 1.0), 0.0, 0.18, 0.85)
M_CAJA_GRIS = crear_mat("MAT_Chasis_Interno", (0.22, 0.24, 0.26, 1.0), 0.4, 0.45, 0.0)

def asignar_mat(obj, mat):
    if len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat

# ==============================================================================
# 3. CONSTRUCCIÓN DE SUBCONJUNTOS 3D EN POSICIÓN DESPLEGADA
# ==============================================================================

# --- GRUPO 1: PANEL SOLAR INCLINADO + SOPORTE ---
pos_solar = Vector((0.0, 0.0, 1.55))
bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos_solar)
marco_solar = bpy.context.active_object
marco_solar.name = "01_Panel_Solar_Marco_IP66"
marco_solar.scale = (0.28, 0.22, 0.018)
marco_solar.rotation_euler = (math.radians(22), 0, 0)
asignar_mat(marco_solar, M_MARCO_ALU)
mover_a_coleccion(marco_solar)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos_solar + Vector((0, -0.003, 0.006)))
celda_solar = bpy.context.active_object
celda_solar.name = "01_Panel_Solar_Celdas_5W_10W"
celda_solar.scale = (0.26, 0.20, 0.008)
celda_solar.rotation_euler = (math.radians(22), 0, 0)
asignar_mat(celda_solar, M_SOLAR)
mover_a_coleccion(celda_solar)

# --- GRUPO 2: ANEMÓMETRO SN-3000-FS + CONO DIFUSOR ---
pos_anemo = Vector((-0.55, 0.0, 1.32))
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.045, radius2=0.12, depth=0.14, location=pos_anemo)
cono_anemo = bpy.context.active_object
cono_anemo.name = "02_Anemometro_Cono_Difusor"
asignar_mat(cono_anemo, M_ABS_BLANCO)
mover_a_coleccion(cono_anemo)

bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=0.045, depth=0.10, location=pos_anemo + Vector((0, 0, -0.11)))
base_anemo = bpy.context.active_object
base_anemo.name = "02_Anemometro_Cuerpo_SN3000FS"
asignar_mat(base_anemo, M_ABS_BLANCO)
mover_a_coleccion(base_anemo)

bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.008, depth=0.16, location=pos_anemo + Vector((0, 0, 0.11)))
eje_anemo = bpy.context.active_object
eje_anemo.name = "02_Anemometro_Eje_Inox"
asignar_mat(eje_anemo, M_INOX)
mover_a_coleccion(eje_anemo)

for i in range(3):
    ang = math.radians(i * 120)
    dx, dy = math.cos(ang) * 0.08, math.sin(ang) * 0.08
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.004, depth=0.16, location=pos_anemo + Vector((dx/2, dy/2, 0.17)))
    brazo = bpy.context.active_object
    brazo.name = f"02_Anemometro_Brazo_{i+1}"
    brazo.rotation_euler = (0, math.radians(90), ang)
    asignar_mat(brazo, M_INOX)
    mover_a_coleccion(brazo)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.028, location=pos_anemo + Vector((dx, dy, 0.17)))
    copa = bpy.context.active_object
    copa.name = f"02_Anemometro_Copa_ABS_{i+1}"
    copa.scale = (1.0, 0.6, 1.0)
    copa.rotation_euler = (0, 0, ang)
    asignar_mat(copa, M_ABS_NEGRO)
    mover_a_coleccion(copa)

# --- GRUPO 3: ESCUDO DE RADIACIÓN SOLAR (6 PLATOS) + SENSOR BME280 ---
pos_escudo = Vector((-0.45, -0.15, 0.82))
for p in range(6):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.068, depth=0.012, location=pos_escudo + Vector((0, 0, p * 0.036)))
    plato = bpy.context.active_object
    plato.name = f"03_Escudo_Radiacion_Plato_{p+1}"
    asignar_mat(plato, M_ABS_BLANCO)
    mover_a_coleccion(plato)

for v in range(3):
    ang_v = math.radians(v * 120 + 30)
    vx, vy = math.cos(ang_v) * 0.055, math.sin(ang_v) * 0.055
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.004, depth=0.22, location=pos_escudo + Vector((vx, vy, 0.09)))
    varilla = bpy.context.active_object
    varilla.name = f"03_Escudo_Varilla_Inox_{v+1}"
    asignar_mat(varilla, M_INOX)
    mover_a_coleccion(varilla)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos_escudo + Vector((0, 0, -0.08)))
pcb_bme = bpy.context.active_object
pcb_bme.name = "03_Sensor_GY_BME280_5V"
pcb_bme.scale = (0.025, 0.020, 0.003)
asignar_mat(pcb_bme, M_PCB_BME)
mover_a_coleccion(pcb_bme)

# --- GRUPO 4: NÚCLEO ELECTRÓNICO (ESP32 + LoRa 32 V3 + MPPT CN3791) ---
pos_elec = Vector((-0.72, 0.0, 0.92))

def crear_placa_detallada(nombre_base, ubicacion, escala_pcb, mat_pcb, con_sma=False):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=ubicacion)
    pcb = bpy.context.active_object
    pcb.name = f"04_{nombre_base}_PCB"
    pcb.scale = escala_pcb
    asignar_mat(pcb, mat_pcb)
    mover_a_coleccion(pcb)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=ubicacion + Vector((-0.015, 0, escala_pcb[2] + 0.003)))
    rf = bpy.context.active_object
    rf.name = f"04_{nombre_base}_Blindaje_RF"
    rf.scale = (escala_pcb[0]*0.38, escala_pcb[1]*0.65, 0.004)
    asignar_mat(rf, M_INOX)
    mover_a_coleccion(rf)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=ubicacion + Vector((escala_pcb[0]*0.85, 0, escala_pcb[2] + 0.0025)))
    usb = bpy.context.active_object
    usb.name = f"04_{nombre_base}_Puerto_USB"
    usb.scale = (0.012, 0.014, 0.005)
    asignar_mat(usb, M_INOX)
    mover_a_coleccion(usb)

    if con_sma:
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.006, depth=0.022, location=ubicacion + Vector((-escala_pcb[0]*0.95, 0, 0)))
        sma = bpy.context.active_object
        sma.name = f"04_{nombre_base}_Conector_SMA_Oro"
        sma.rotation_euler = (0, math.radians(90), 0)
        asignar_mat(sma, M_ORO)
        mover_a_coleccion(sma)

crear_placa_detallada("ESP32_DevKit_V1", pos_elec + Vector((0, -0.06, 0.04)), (0.055, 0.028, 0.003), M_PCB_ESP32, False)
crear_placa_detallada("LoRa_32_V3_SX1262", pos_elec + Vector((0, 0.04, 0.04)), (0.052, 0.026, 0.003), M_PCB_LORA, True)
crear_placa_detallada("Cargador_MPPT_CN3791", pos_elec + Vector((0.12, -0.01, 0.04)), (0.045, 0.032, 0.003), M_PCB_MPPT, False)

# --- GRUPO 5: PACK 10x BATERÍAS INR18650-25R + SIRENA 120dB ---
pos_bat = Vector((0.18, 0.0, 0.88))
for fila in range(2):
    for col in range(5):
        bx = pos_bat.x + (col - 2) * 0.020
        by = pos_bat.y + (fila - 0.5) * 0.020
        bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.0095, depth=0.065, location=Vector((bx, by, pos_bat.z)))
        celda = bpy.context.active_object
        celda.name = f"05_Bateria_INR18650_25R_{fila*5 + col + 1:02d}"
        asignar_mat(celda, M_BAT_AZUL)
        mover_a_coleccion(celda)

for c_offset in (-0.035, 0.035):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=pos_bat + Vector((c_offset, 0, 0)))
    cinta = bpy.context.active_object
    cinta.name = "05_Bateria_Cinta_Sujecion"
    cinta.scale = (0.014, 0.023, 0.034)
    asignar_mat(cinta, M_ABS_NEGRO)
    mover_a_coleccion(cinta)

bpy.ops.mesh.primitive_cone_add(vertices=36, radius1=0.022, radius2=0.048, depth=0.055, location=pos_bat + Vector((0.16, 0, 0)))
sirena = bpy.context.active_object
sirena.name = "05_Altavoz_Sirena_120dB_IP65"
sirena.rotation_euler = (0, math.radians(90), 0)
asignar_mat(sirena, M_ABS_NEGRO)
mover_a_coleccion(sirena)

# --- GRUPO 6: RADOMO CILÍNDRICO WI-FI / BLE IP65 ---
pos_radomo = Vector((0.68, 0.0, 0.96))
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.16, depth=0.14, location=pos_radomo)
radomo = bpy.context.active_object
radomo.name = "06_Radomo_WiFi_BLE_ABS_IP65"
asignar_mat(radomo, M_ABS_NEGRO)
mover_a_coleccion(radomo)

bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.165, depth=0.02, location=pos_radomo + Vector((0, 0, 0.07)))
tapa_rad = bpy.context.active_object
tapa_rad.name = "06_Radomo_Anillo_Superior"
asignar_mat(tapa_rad, M_ABS_NEGRO)
mover_a_coleccion(tapa_rad)

# --- GRUPO 7: FALDÓN, BRIDA, TORNILLERÍA Y MÁSTIL VERTICAL ---
pos_brida = Vector((0.68, 0.0, 0.55))
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.15, depth=0.018, location=pos_brida)
faldon = bpy.context.active_object
faldon.name = "07_Faldon_Cierre_Inferior"
asignar_mat(faldon, M_INOX)
mover_a_coleccion(faldon)

bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.085, depth=0.045, location=pos_brida + Vector((0, 0, -0.03)))
brida = bpy.context.active_object
brida.name = "07_Brida_Acoplamiento_Mastil"
asignar_mat(brida, M_INOX)
mover_a_coleccion(brida)

pos_mastil = Vector((0.0, 0.0, 0.25))
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.042, depth=0.95, location=pos_mastil)
mastil = bpy.context.active_object
mastil.name = "08_Mastil_Vertical_Principal"
asignar_mat(mastil, M_MARCO_ALU)
mover_a_coleccion(mastil)

for a_z in (0.68, 0.74):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.006, location=Vector((0, 0, a_z)))
    aro = bpy.context.active_object
    aro.name = "08_Corona_Sujecion_Chasis"
    asignar_mat(aro, M_INOX)
    mover_a_coleccion(aro)

for t in range(6):
    ang_t = math.radians(t * 60)
    tx, ty = math.cos(ang_t) * 0.11, math.sin(ang_t) * 0.11
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.006, depth=0.09, location=Vector((tx, ty, 0.71)))
    perno = bpy.context.active_object
    perno.name = f"08_Perno_Hexagonal_M6_{t+1}"
    asignar_mat(perno, M_INOX)
    mover_a_coleccion(perno)

# ==============================================================================
# 4. CÁMARA E ILUMINACIÓN ESTUDIO + RENDER EEVEE
# ==============================================================================
scene = bpy.context.scene
# Luces de estudio (Blender 4.5 EEVEE necesita potencias en miles de Watios para escala métrica)
def crear_luz(nombre, tipo, color, energia, loc):
    ld = bpy.data.lights.new(name=nombre, type=tipo)
    ld.color = color
    ld.energy = energia
    if tipo == 'AREA':
        ld.size = 2.0
    obj = bpy.data.objects.new(name=nombre, object_data=ld)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = loc
    return obj

# Key light frontal superior
crear_luz("Luz_Key", 'AREA', (1.0, 0.98, 0.95), 3500.0, (1.8, -3.0, 2.5))
# Fill light difusa
crear_luz("Luz_Fill", 'AREA', (0.85, 0.92, 1.0), 1800.0, (-2.5, -2.5, 1.8))
# Rim light de contorno trasera
crear_luz("Luz_Rim", 'AREA', (0.7, 0.85, 1.0), 2500.0, (0.0, 2.5, 2.8))
# Luz cenital superior para panel solar
crear_luz("Luz_Top", 'AREA', (1.0, 1.0, 1.0), 2000.0, (0.0, 0.0, 3.5))

# Cámara con Track To apuntando al centro del ensamblaje
target_obj = bpy.data.objects.new("Cam_Target", None)
target_obj.location = (0.0, 0.0, 0.95)
bpy.context.scene.collection.objects.link(target_obj)

cam_data = bpy.data.cameras.new("Camara_Despiece_T3RTIX")
cam_obj = bpy.data.objects.new("Camara_Despiece_T3RTIX", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj

cam_obj.location = (1.9, -3.2, 1.7)
constraint = cam_obj.constraints.new(type='TRACK_TO')
constraint.target = target_obj
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'
cam_data.lens = 48

# Renderizar imagen fija de alta resolución
out_img = r"C:\Users\w\Desktop\Rallylatam\presentacion\3d\t3rtix-despiece-render.png"
scene.render.filepath = out_img
bpy.ops.render.render(write_still=True)

# Guardar escena en .blend
out_blend = r"C:\Users\w\Desktop\Rallylatam\blender\t3rtix_despiece.blend"
bpy.ops.wm.save_as_mainfile(filepath=out_blend)

print(f"Render generado: {out_img}")
print(f"Archivo Blender guardado: {out_blend}")
