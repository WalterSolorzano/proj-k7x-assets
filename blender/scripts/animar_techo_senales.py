import bpy, math, random

R = math.radians

blend_path = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-centro-comercial.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

scene = bpy.context.scene

scene.frame_start = 1
scene.frame_end = 90
scene.render.fps = 30
scene.render.engine = 'BLENDER_EEVEE_NEXT'
if hasattr(scene, 'eevee'):
    scene.eevee.taa_render_samples = 32

# Identificar todos los objetos del techo que deben elevarse juntos
roof_keywords = ['techo', 'losa', 'pretil', 'pv_', 'aa_', 'tanque', 'ducto', 'caseta', 'corona_clara']
roof_objs = [o for o in bpy.data.objects if any(k in o.name.lower() for k in roof_keywords) and not 'puck' in o.name.lower() and not 'mastil' in o.name.lower()]

print(f"Objetos de techo a animar: {len(roof_objs)}")

# Animar elevación de techo
for o in roof_objs:
    init_z = o.location.z
    o.keyframe_insert(data_path="location", frame=25)
    o.location.z = init_z + 20.0
    o.keyframe_insert(data_path="location", frame=65)
    o.location.z = init_z

# Material de personas (siluetas térmicas brillantes)
mat_person = bpy.data.materials.get("M_PERSONA_HEAT") or bpy.data.materials.new("M_PERSONA_HEAT")
mat_person.use_nodes = True
nodes = mat_person.node_tree.nodes
nodes.clear()
out = nodes.new('ShaderNodeOutputMaterial')
emit = nodes.new('ShaderNodeEmission')
emit.inputs['Color'].default_value = (0.98, 0.45, 0.12, 1.0)
emit.inputs['Strength'].default_value = 4.0
mat_person.node_tree.links.new(emit.outputs['Emission'], out.inputs['Surface'])

# Material de pulso de teléfono hacia el nodo
mat_pulse = bpy.data.materials.get("M_PULSE_SIGNAL") or bpy.data.materials.new("M_PULSE_SIGNAL")
mat_pulse.use_nodes = True
p_nodes = mat_pulse.node_tree.nodes
p_nodes.clear()
p_out = p_nodes.new('ShaderNodeOutputMaterial')
p_emit = p_nodes.new('ShaderNodeEmission')
p_emit.inputs['Color'].default_value = (1.0, 0.20, 0.05, 1.0)
p_emit.inputs['Strength'].default_value = 8.0
mat_pulse.node_tree.links.new(p_emit.outputs['Emission'], p_out.inputs['Surface'])

# Posición del nodo receptor Vigía-07 en el mástil
node_target = (9.0, -3.0, 11.2)

# Crear grupos de personas en el interior del centro comercial
random.seed(42)

clusters = [
    {"name": "SEC_1_ACCESO", "center": (6.0, -5.5, 1.2), "count": 28, "spread": (3.5, 2.0)},
    {"name": "SEC_2_ATRIO",  "center": (-1.0, 0.0, 1.2),  "count": 18, "spread": (4.5, 3.5)},
    {"name": "SEC_3_CARGA",  "center": (-8.5, 4.0, 1.2),  "count": 10, "spread": (2.5, 2.5)}
]

idx = 0
for cluster in clusters:
    cx, cy, cz = cluster["center"]
    sx, sy = cluster["spread"]
    for i in range(cluster["count"]):
        px = cx + random.uniform(-sx, sx)
        py = cy + random.uniform(-sy, sy)
        pz = cz
        
        # Figura humana estilizada
        bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=1.65, vertices=12, location=(px, py, pz + 0.82))
        person = bpy.context.object
        person.name = f"HUMAN_{idx}"
        person.data.materials.append(mat_person)

        # Teléfono móvil en la mano emitiendo destello
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.09, subdivisions=2, location=(px + 0.15, py - 0.1, pz + 1.25))
        phone = bpy.context.object
        phone.name = f"PHONE_{idx}"
        phone.data.materials.append(mat_pulse)

        # Haz o arco electromagnético trazado hacia el receptor Vigía-07
        if idx % 3 == 0:
            curve_data = bpy.data.curves.new(f"BEAM_DATA_{idx}", type='CURVE')
            curve_data.dimensions = '3D'
            curve_data.bevel_depth = 0.038
            curve_data.bevel_resolution = 4
            
            spline = curve_data.splines.new('BEZIER')
            spline.bezier_points.add(1)
            
            p0 = spline.bezier_points[0]
            p0.co = (px + 0.15, py - 0.1, pz + 1.25)
            p0.handle_left = (px + 0.15, py - 0.1, pz + 3.5)
            p0.handle_right = (px + 0.15, py - 0.1, pz + 3.5)

            p1 = spline.bezier_points[1]
            p1.co = node_target
            p1.handle_left = (node_target[0], node_target[1], node_target[2] - 2.5)
            p1.handle_right = (node_target[0], node_target[1], node_target[2] - 2.5)

            curve_obj = bpy.data.objects.new(f"BEAM_{idx}", curve_data)
            curve_obj.data.materials.append(mat_pulse)
            scene.collection.objects.link(curve_obj)

            # Animar la transmisión de la señal: aparece progresivamente al elevarse el techo
            curve_data.bevel_factor_end = 0.0
            curve_data.keyframe_insert(data_path="bevel_factor_end", frame=40 + (idx % 12))
            curve_data.bevel_factor_end = 1.0
            curve_data.keyframe_insert(data_path="bevel_factor_end", frame=60 + (idx % 12))

        idx += 1

# Crear Cámara de Inspección Cinemática Superior (Dron cenital angular)
cam_name = "CAM_CENITAL_DRON"
if cam_name not in bpy.data.objects:
    cam_data = bpy.data.cameras.new(cam_name)
    cam_data.lens = 38
    cam_obj = bpy.data.objects.new(cam_name, cam_data)
    scene.collection.objects.link(cam_obj)
else:
    cam_obj = bpy.data.objects[cam_name]

scene.camera = cam_obj

# Trayectoria de cámara cinemática de dron:
# Frame 1: Posición superior alta con perspectiva
cam_obj.location = (20.0, -32.0, 28.0)
cam_obj.rotation_euler = (R(50), 0, R(32))
cam_obj.keyframe_insert(data_path="location", frame=1)
cam_obj.keyframe_insert(data_path="rotation_euler", frame=1)

# Frame 90: Desplazamiento orbital suave acercándose al interior
cam_obj.location = (14.0, -22.0, 22.0)
cam_obj.rotation_euler = (R(54), 0, R(29))
cam_obj.keyframe_insert(data_path="location", frame=90)
cam_obj.keyframe_insert(data_path="rotation_euler", frame=90)

# Guardar escena blend
save_blend = r"C:\Users\w\Desktop\Rallylatam\blender\vigia-07-centro-comercial-anim.blend"
bpy.ops.wm.save_as_mainfile(filepath=save_blend)
print(">>> Escena de animación 3D guardada exitosamente:", save_blend)
