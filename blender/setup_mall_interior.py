import bpy
import math

print("=== MEJORANDO INTERIOR CON TIENDAS, HEATMAP Y PERSONAS ===")

blend_path = r"c:\Users\w\Desktop\Rallylatam\blender\vigia-07-centro-comercial-anim.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)
scene = bpy.context.scene

# 1. Configurar suelo del interior blanco/gris claro reflectante para que contraste con las siluetas
mat_floor = bpy.data.materials.get("M_INTERIOR_LIGHT")
if not mat_floor:
    mat_floor = bpy.data.materials.new("M_INTERIOR_LIGHT")
    mat_floor.use_nodes = True
fnodes = mat_floor.node_tree.nodes
pbsdf = fnodes.get("Principled BSDF")
if pbsdf:
    pbsdf.inputs['Base Color'].default_value = (0.85, 0.86, 0.88, 1.0) # Suelo claro
    pbsdf.inputs['Roughness'].default_value = 0.25 # Ligeramente reflectante tipo baldosa

interior = bpy.data.objects.get("INTERIOR")
if interior and interior.data:
    interior.data.materials.clear()
    interior.data.materials.append(mat_floor)

# 2. Material para manchas de calor térmicas en el piso (Heatmap de concentración)
mat_heat_floor = bpy.data.materials.get("MAT_HEATMAP_FLOOR")
if not mat_heat_floor:
    mat_heat_floor = bpy.data.materials.new("MAT_HEATMAP_FLOOR")
    mat_heat_floor.use_nodes = True
hfnodes = mat_heat_floor.node_tree.nodes
hfnodes.clear()
hemit = hfnodes.new(type="ShaderNodeEmission")
hemit.inputs['Color'].default_value = (0.95, 0.15, 0.05, 1.0) # Rojo alerta brillante
hemit.inputs['Strength'].default_value = 4.0
hout = hfnodes.new(type="ShaderNodeOutputMaterial")
mat_heat_floor.node_tree.links.new(hemit.outputs['Emission'], hout.inputs['Surface'])

# Crear 3 discos/óvalos de concentración térmica en el suelo
clusters = [
    ("HEAT_CLUSTER_A", (7.5, -6.5, 0.85), (5.5, 4.0, 0.02)), # Sector Este (Alta aglomeración)
    ("HEAT_CLUSTER_B", (0.5, -1.0, 0.85), (4.5, 3.5, 0.02)),  # Sector Central
    ("HEAT_CLUSTER_C", (-6.5, 3.0, 0.85), (4.0, 3.5, 0.02))   # Sector Oeste
]

for name, pos, scale in clusters:
    old = bpy.data.objects.get(name)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    bpy.ops.mesh.primitive_cylinder_add(radius=1.0, depth=0.05, location=pos)
    disk = bpy.context.active_object
    disk.name = name
    disk.scale = scale
    disk.data.materials.append(mat_heat_floor)

# 3. Añadir divisiones de tiendas / pasillos interiores para que se reconozca claramente como centro comercial
mat_wall_int = bpy.data.materials.get("MAT_WALL_INT")
if not mat_wall_int:
    mat_wall_int = bpy.data.materials.new("MAT_WALL_INT")
    mat_wall_int.use_nodes = True
    mat_wall_int.node_tree.nodes["Principled BSDF"].inputs['Base Color'].default_value = (0.3, 0.32, 0.35, 1.0)

# Muros bajos de comercios (altura 2.8m)
walls = [
    ("WALL_STORE_1", (-9.0, 0.0, 2.2), (0.2, 10.0, 2.6)),
    ("WALL_STORE_2", (-4.0, 4.0, 2.2), (10.0, 0.2, 2.6)),
    ("WALL_STORE_3", (3.0, 4.0, 2.2), (0.2, 8.0, 2.6)),
    ("WALL_STORE_4", (5.0, 0.0, 2.2), (8.0, 0.2, 2.6)),
    ("WALL_STORE_5", (-2.0, -4.0, 2.2), (12.0, 0.2, 2.6))
]

for wname, wpos, wscale in walls:
    old = bpy.data.objects.get(wname)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    bpy.ops.mesh.primitive_cube_add(location=wpos)
    wobj = bpy.context.active_object
    wobj.name = wname
    wobj.scale = (wscale[0]/2.0, wscale[1]/2.0, wscale[2]/2.0)
    wobj.data.materials.append(mat_wall_int)

# 4. Asegurar que las personas destaquen: cilindros térmicos brillantes
mat_human = bpy.data.materials.get("MAT_HEAT_HUMAN")
for obj in bpy.data.objects:
    if "HUMAN_V" in obj.name:
        obj.scale = (1.4, 1.4, 2.2) # Aumentar escala para que sean perfectamente visibles desde el dron
        if obj.data and hasattr(obj.data, "materials"):
            obj.data.materials.clear()
            obj.data.materials.append(mat_human)

# 5. Guardar escena
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("Escena actualizada con éxito.")
