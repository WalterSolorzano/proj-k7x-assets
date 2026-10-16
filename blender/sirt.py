# SIRT / VIGIA-07 - libreria de modelado 3D (Blender 4.5, EEVEE Next)
# Uso desde el MCP:  exec(open(r"C:\Users\w\Desktop\Rallylatam\blender\sirt.py", encoding="utf-8").read())
#                     main('nodo')   |   main('edificio')
# Reglas: escala real en METROS. Stills de producto con fondo TRANSPARENTE.
import bpy, math, os, json, time, numpy as np, mathutils

R = lambda d: math.radians(d)
ROOT = r"C:\Users\w\Desktop\Rallylatam"
OUT = os.path.join(ROOT, "presentacion", "3d")
os.makedirs(OUT, exist_ok=True)
IMG = lambda n: bpy.data.images.get(n)

# ---------------------------------------------------------------- escena
def engine():
    sc = bpy.context.scene
    val = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    for e in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        if e in val:
            try:
                sc.render.engine = e
                return e
            except TypeError:
                pass

def reset(borrar_luces=True):
    """Borra todo menos los modelos importados de Poly Haven (prefijos SRC_/ASSET_)."""
    keep = ('SRC_', 'ASSET_')
    for o in list(bpy.data.objects):
        if o.type == 'LIGHT' and not borrar_luces:
            continue
        if not o.name.startswith(keep):
            bpy.data.objects.remove(o, do_unlink=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.length_unit = 'METERS'
    engine()

# ---------------------------------------------------------------- materiales
def sset(b, name, val, idx=None):
    try:
        if name in b.inputs:
            b.inputs[name].default_value = val
        elif idx is not None:
            b.inputs[idx].default_value = val
    except Exception:
        pass

def mat(name, color, rough=0.5, metal=0.0, emis=None, estr=0.0, spec=None, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    sset(b, 'Base Color', (color[0], color[1], color[2], 1.0), 0)
    sset(b, 'Roughness', rough, 2)
    sset(b, 'Metallic', metal, 1)
    if emis is not None:
        sset(b, 'Emission Color', (emis[0], emis[1], emis[2], 1.0))
        sset(b, 'Emission Strength', estr)
    if spec is not None:
        sset(b, 'Specular IOR Level', spec)
    if alpha < 1.0:
        for attr, val in (('blend_method', 'BLEND'), ('surface_render_method', 'BLENDED')):
            try:
                setattr(m, attr, val)
            except Exception:
                pass
        sset(b, 'Alpha', alpha, 4)
    return m

def retext(nombre, span, proj='BOX', blend=0.25, tinte=None, factor=0.66, alias=None, bump=None):
    """Toma un material de textura de Poly Haven y lo re-cablea a coordenadas de OBJETO
    (metros) con proyeccion BOX: asi funciona sin UVs y con tamaño real (1 tile = span m).
    tinte = (r,g,b) para pintarlo encima (muro pintado) sin perder el relieve de la textura."""
    m = bpy.data.materials.get(nombre)
    if m is None or not m.use_nodes:
        return None
    if alias and bpy.data.materials.get(alias) is None:
        m = m.copy()
        m.name = alias
    nt = m.node_tree
    tcs = [n for n in nt.nodes if n.type == 'TEX_COORD' and n.label == 'SIRT_OBJ']
    mp = next((n for n in nt.nodes if n.type == 'MAPPING' and n.label == 'SIRT_MAP'), None)
    if not tcs:
        tc = nt.nodes.new('ShaderNodeTexCoord'); tc.label = 'SIRT_OBJ'; tc.location = (-1100, -300)
        tcs = [tc]
    if mp is None:
        mp = nt.nodes.new('ShaderNodeMapping'); mp.label = 'SIRT_MAP'; mp.location = (-900, -300)
    tc = tcs[0]
    s = 1.0 / max(span, 0.01)
    mp.inputs['Scale'].default_value = (s, s, s)
    if not mp.inputs['Vector'].is_linked:
        nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    for n in nt.nodes:
        if n.type == 'TEX_IMAGE':
            # FORZAR el remapeo: los materiales de Poly Haven ya traen su Mapping con UVs,
            # y nuestras mallas no tienen UVs utiles -> la textura se estiraba por cara.
            nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
            try:
                n.projection = proj
                n.projection_blend = blend
            except Exception:
                pass
    if bump is not None:
        for n in nt.nodes:
            if n.type == 'BUMP' and 'Strength' in n.inputs:
                n.inputs['Strength'].default_value = bump
    # pintar encima (muro pintado conservando el relieve)
    if tinte is not None:
        b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        img = next((n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.outputs['Color'].is_linked), None)
        if b is not None and img is not None:
            target = [l for l in nt.links if l.to_socket == b.inputs['Base Color']]
            for l in target:
                nt.links.remove(l)
            mix = nt.nodes.new('ShaderNodeMixRGB')
            mix.blend_type = 'MIX'
            mix.inputs['Fac'].default_value = factor
            mix.inputs['Color2'].default_value = (tinte[0], tinte[1], tinte[2], 1.0)
            mix.location = (60, 200)
            nt.links.new(img.outputs['Color'], mix.inputs['Color1'])
            nt.links.new(mix.outputs['Color'], b.inputs['Base Color'])
    return m

def mat_concreto(nombre='M_CONCRETO_REAL', span=0.35):
    """Concreto real desde las imagenes concrete_* (proyeccion BOX por objeto).
    span = cuantos metros ocupa una repeticion de la textura (chico = grano fino)."""
    ids = [i.name for i in bpy.data.images if i.name.startswith('concrete_')]
    if not ids:
        return mat(nombre, (0.30, 0.29, 0.27), 0.95)
    m = bpy.data.materials.get(nombre) or bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (600, 0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled'); bsdf.location = (280, 0)
    nt.links.new(bsdf.outputs[0], out.inputs['Surface'])
    tc = nt.nodes.new('ShaderNodeTexCoord'); tc.location = (-900, 0)
    mp = nt.nodes.new('ShaderNodeMapping'); mp.location = (-720, 0)
    mp.inputs['Scale'].default_value = (1.0 / span, 1.0 / span, 1.0 / span)
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    def img(nm, nc=False):
        im = IMG(nm)
        if im is None:
            return None
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = im
        t.projection = 'BOX'
        t.projection_blend = 0.35
        t.location = (-500, 0)
        if nc:
            try:
                t.image.colorspace_settings.name = 'Non-Color'
            except Exception:
                pass
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
        return t
    d = img('concrete_Diffuse'); r = img('concrete_Rough')
    nr = img('concrete_nor_gl', True); dp = img('concrete_Displacement', True)
    if d:
        nt.links.new(d.outputs['Color'], bsdf.inputs['Base Color'])
    if r:
        nt.links.new(r.outputs['Color'], bsdf.inputs['Roughness'])
    if nr:
        nmn = nt.nodes.new('ShaderNodeNormalMap'); nmn.location = (-250, -300)
        nt.links.new(nr.outputs['Color'], nmn.inputs['Color'])
        nt.links.new(nmn.outputs['Normal'], bsdf.inputs['Normal'])
    if dp and not nr:
        bp = nt.nodes.new('ShaderNodeBump'); bp.location = (-250, -560)
        bp.inputs['Strength'].default_value = 0.3
        bp.inputs['Distance'].default_value = 0.02
        nt.links.new(dp.outputs['Color'], bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], bsdf.inputs['Normal'])
    return m

def mat_qr(nombre='M_QR', mods=25, seed=11):
    """Etiqueta tipo QR generada (no es un QR real, solo patron)."""
    im = IMG('TEX_QR')
    if im is None:
        im = bpy.data.images.new('TEX_QR', mods, mods)
        rng = np.random.default_rng(seed)
        a = (rng.random((mods, mods)) > 0.48).astype(float)
        def finder(r, c):
            for i in range(7):
                for j in range(7):
                    e = i in (0, 6) or j in (0, 6)
                    k = 2 <= i <= 4 and 2 <= j <= 4
                    a[r + i, c + j] = 1.0 if (e or k) else 0.0
        def clear(r, c):
            for i in range(-1, 8):
                for j in range(-1, 8):
                    y, x = r + i, c + j
                    if 0 <= y < mods and 0 <= x < mods and (i in (-1, 7) or j in (-1, 7)):
                        a[y, x] = 0.0
        finder(0, 0); clear(0, 0)
        finder(0, mods - 7); clear(0, mods - 7)
        finder(mods - 7, 0); clear(mods - 7, 0)
        px = np.zeros((mods, mods, 4), dtype=np.float32)
        for ch in range(3):
            px[..., ch] = a
        px[..., 3] = 1.0
        im.pixels.foreach_set(px.ravel())
        im.pack()
    m = bpy.data.materials.get(nombre) or bpy.data.materials.new(nombre)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial'); out.location = (400, 0)
    b = nt.nodes.new('ShaderNodeBsdfPrincipled'); b.location = (150, 0)
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    sset(b, 'Roughness', 0.55, 2)
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = im; t.location = (-150, 0)
    t.interpolation = 'Closest'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    return m

# ---------------------------------------------------------------- primitivas
PARTS = []
def _new(o, name, m, smooth=False, bevel=0.0, segs=2):
    o.name = name
    if m:
        o.data.materials.append(m)
    if bevel > 0:
        bv = o.modifiers.new('bev', 'BEVEL')
        bv.width = bevel; bv.segments = segs
        bv.limit_method = 'ANGLE'; bv.angle_limit = R(40)
    if smooth:
        try:
            bpy.ops.object.shade_auto_smooth(angle=R(32))
        except Exception:
            bpy.ops.object.shade_smooth()
    PARTS.append(name)
    return o

def box(name, sx, sy, sz, loc, rot=(0, 0, 0), m=None, bevel=0.0025, segs=2):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _new(o, name, m, bevel=bevel, segs=segs)

def cyl(name, r, h, loc, rot=(0, 0, 0), v=48, m=None, smooth=True, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=v, location=loc, rotation=rot)
    return _new(bpy.context.object, name, m, smooth=smooth, bevel=bevel)

def cone(name, r1, r2, h, loc, rot=(0, 0, 0), v=48, m=None):
    bpy.ops.mesh.primitive_cone_add(radius1=r1, radius2=r2, depth=h, vertices=v, location=loc, rotation=rot)
    return _new(bpy.context.object, name, m, smooth=True)

def sph(name, r, loc, m=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=32, ring_count=16, location=loc)
    return _new(bpy.context.object, name, m, smooth=True)

def tor(name, R_, r, loc, rot=(0, 0, 0), m=None):
    bpy.ops.mesh.primitive_torus_add(major_radius=R_, minor_radius=r, major_segments=36, minor_segments=12,
                                     location=loc, rotation=rot)
    return _new(bpy.context.object, name, m, smooth=True)

def placa(name, sx, sy, loc, rot=(0, 0, 0), m=None, bevel=0.002):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object
    o.scale = (sx, sy, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return _new(o, name, m, bevel=bevel)

def texto(name, body, size, loc, rot=(0, 0, 0), m=None, extrude=0.001, align='CENTER'):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    t = bpy.context.object
    t.name = name
    t.data.body = body
    t.data.size = size
    t.data.extrude = extrude
    t.data.align_x = align
    t.data.align_y = 'CENTER'
    if m:
        t.data.materials.append(m)
    PARTS.append(name)
    return t

# ---------------------------------------------------------------- luces / camaras
def aim(o, t):
    d = mathutils.Vector(t) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()

def area(name, size, energy, loc, tgt, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, type='AREA')
    ld.size = size; ld.energy = energy; ld.color = color
    o = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc; aim(o, tgt)
    return o

def sol(name='L_SOL', energy=3.0, elev=22.0, azim=125.0, color=(1.0, 0.94, 0.86)):
    ld = bpy.data.lights.new(name, type='SUN')
    ld.energy = energy
    ld.color = color
    ld.angle = R(1.5)
    o = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = (R(90 - elev), 0, R(azim - 180))
    return o

def camara(name, lens, loc, tgt, clip=0.05):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.clip_start = clip
    c = bpy.data.objects.new(name, cd)
    bpy.context.scene.collection.objects.link(c)
    c.location = loc; aim(c, tgt)
    return c

def mundo(nombre, strength=1.0):
    w = bpy.data.worlds.get(nombre)
    if w is None:
        return None
    bpy.context.scene.world = w
    w.use_nodes = True
    for n in w.node_tree.nodes:
        if n.type == 'BACKGROUND':
            n.inputs['Strength'].default_value = strength
    return w

def oclusion_sombra(on=True, dist=4.0):
    """Disco invisible que recibe sombra (para stills de producto)."""
    try:
        m = mat('M_SOMBRA', (0.5, 0.5, 0.5), 0.6, alpha=0.999)
        bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.002))
        p = bpy.context.object
        p.name = 'FX_SOMBRA'
        p.data.materials.append(m)
        p.is_shadow_catcher = on
        return p
    except Exception as e:
        print('sombra:', e)

# ---------------------------------------------------------------- render
def setup_render(samples=32, transparente=True):
    sc = bpy.context.scene
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.film_transparent = transparente
    sc.render.resolution_percentage = 100
    try:
        sc.eevee.taa_render_samples = samples
    except Exception:
        pass
    try:
        sc.eevee.use_raytracing = True
    except Exception:
        pass
    try:
        sc.view_settings.view_transform = 'AgX'
    except TypeError:
        pass
    try:
        sc.view_settings.look = 'AgX - Punchy'
    except Exception:
        pass

def render(cam, nombre, rx=1920, ry=1080, samples=32, transparente=True):
    sc = bpy.context.scene
    sc.render.resolution_x = rx
    sc.render.resolution_y = ry
    sc.render.film_transparent = transparente
    try:
        sc.eevee.taa_render_samples = samples
    except Exception:
        pass
    sc.camera = cam
    sc.render.filepath = os.path.join(OUT, nombre)
    bpy.ops.render.render(write_still=True)
    return os.path.join(OUT, nombre)

def guardar(nombre):
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT, 'blender', nombre))

# ---------------------------------------------------------------- vegetacion / props
def arbol(nombre, x, y, h=4.5, P=None, copa=(0.055, 0.115, 0.040), tronco=(0.13, 0.095, 0.065)):
    """Arbol procedural (tronco + copa de 4 esferas). h = altura total en metros."""
    mt = mat('M_TRONCO', tronco, 0.90)
    mc = mat('M_COPA', copa, 0.85)
    t = h * 0.44
    cyl(nombre + '_TRONCO', h * 0.042, t, (x, y, t / 2.0), v=10, m=mt, smooth=True)
    for k, (dx, dy, dz, r) in enumerate(((0.00, 0.00, 1.00, 0.26), (0.42, 0.16, 0.80, 0.20),
                                         (-0.36, -0.22, 0.86, 0.18), (0.05, -0.40, 0.62, 0.15))):
        sph('%s_COPA_%d' % (nombre, k), h * r, (x + h * dx * 0.5, y + h * dy * 0.5, t * 0.92 + h * dz * 0.34), m=mc)
    return None

def barril(nombre, x, y, z=0.0, color=(0.26, 0.30, 0.26), giro=0.0):
    """Barril metalico de 200 L (Ø 0.58 x 0.88)."""
    mb = mat('M_BARRIL_%s' % nombre, color, 0.55, 0.35)
    ms = mat('M_ARO_BARRIL', (0.35, 0.36, 0.38), 0.45, 0.85)
    cyl(nombre + '_CUERPO', 0.29, 0.86, (x, y, z + 0.43), v=36, m=mb)
    cyl(nombre + '_TAPA', 0.30, 0.03, (x, y, z + 0.87), v=36, m=ms)
    for dz in (0.20, 0.66):
        tor(nombre + '_ARO_%d' % int(dz * 100), 0.294, 0.016, (x, y, z + dz), m=ms)
    return None

# ---------------------------------------------------------------- PALETA
def paleta():
    return {
        'ambar':   mat('M_BANDA_AMBAR', (0.80, 0.44, 0.04), 0.62),
        'roja':    mat('M_BANDA_ROJA', (0.62, 0.09, 0.06), 0.62),
        'regla':   mat('M_REGLA_HIDRO', (0.86, 0.855, 0.83), 0.42),
        'pintura': mat('M_PINTURA_NEGRA', (0.055, 0.055, 0.055), 0.70),
        'abs':     mat('M_ABS_RAL7035', (0.44, 0.455, 0.425), 0.48),
        'tapa':    mat('M_ABS_TAPA', (0.385, 0.40, 0.37), 0.44),
        'junta':   mat('M_JUNTA', (0.026, 0.026, 0.026), 0.88),
        'inox':    mat('M_INOX', (0.78, 0.79, 0.80), 0.32, 1.0),
        'aluminio': mat('M_ALUMINIO', (0.70, 0.715, 0.735), 0.40, 1.0),
        'galv':    mat('M_GALVANIZADO', (0.52, 0.535, 0.545), 0.55, 0.85),
        'negro':   mat('M_PLASTICO_NEGRO', (0.032, 0.033, 0.035), 0.56),
        'vidrio':  mat('M_VIDRIO_PANEL', (0.028, 0.052, 0.145), 0.10, 0.35, spec=0.7),
        'celda':   mat('M_CELDA', (0.020, 0.055, 0.150), 0.42, 0.0),
        'blanco':  mat('M_BLANCO_SENSOR', (0.84, 0.845, 0.825), 0.42),
        'etiqueta': mat('M_ETIQUETA_INOX', (0.80, 0.81, 0.82), 0.33, 0.9),
        'led_ok':  mat('M_LED_OK', (0.05, 0.35, 0.10), 0.20, emis=(0.10, 1.0, 0.35), estr=4.5),
        'led_warn': mat('M_LED_WARN', (0.4, 0.22, 0.02), 0.20, emis=(1.0, 0.55, 0.06), estr=4.5),
        'led_bad': mat('M_LED_BAD', (0.4, 0.04, 0.02), 0.20, emis=(1.0, 0.12, 0.06), estr=4.5),
        'ledbez':  mat('M_LED_BEZEL', (0.018, 0.018, 0.018), 0.35),
        'obra':    mat('M_OBRA_GRIS', (0.38, 0.375, 0.355), 0.85),
        'techo':   mat('M_TECHO_OSC', (0.10, 0.10, 0.105), 0.55),
        'vidrio_ventana': mat('M_VIDRIO_VENTANA', (0.048, 0.072, 0.092), 0.20, 0.20, spec=0.70, alpha=0.22),
        'terracota': mat('M_TERRACOTA', (0.42, 0.16, 0.10), 0.60),
        'anodizado': mat('M_ANODIZADO', (0.085, 0.090, 0.100), 0.50, 0.25),
        'anodizado_osc': mat('M_ANODIZADO_OSC', (0.030, 0.032, 0.036), 0.60, 0.0),
        'amarillo': mat('M_AMARILLO_OBRA', (0.62, 0.50, 0.09), 0.55),
        'verde_muro': mat('M_VERDE_MURO', (0.12, 0.22, 0.14), 0.65),
        'tierra':  mat('M_TIERRA_SUELTA', (0.30, 0.24, 0.17), 0.95),
        # --- internos de la corona 360
        'pcb':     mat('M_PCB_FR4', (0.055, 0.26, 0.115), 0.38, 0.0),
        'pcb2':    mat('M_PCB_FR4_B', (0.035, 0.085, 0.12), 0.38, 0.0),
        'cobre':   mat('M_COBRE', (0.72, 0.42, 0.20), 0.28, 1.0),
        'laton':   mat('M_LATON', (0.62, 0.47, 0.22), 0.35, 1.0),
        'pane':    mat('M_PANE_RADOMA', (0.055, 0.062, 0.075), 0.30, 0.0, spec=0.35, alpha=0.55),
        'chip':    mat('M_CHIP_NEGRO', (0.045, 0.045, 0.050), 0.42),
        'bornera': mat('M_BORNERA_VERDE', (0.06, 0.22, 0.09), 0.45),
    }

# ---------------------------------------------------------------- NODO VIGIA-07
def nodo(mx, my, mz, P=None, giro=0.0, panel=True, pluviometro=False, led='led_ok', etiqueta=True):
    """Conjunto del nodo montado sobre un mastil vertical cuyo eje pasa por (mx,my).
    mz = altura del CENTRO de la caja. La caja cuelga del lado +X del mastil."""
    P = P or paleta()
    BX, BZ, BY = mx + 0.115, mz, my
    box('CAJA_CUERPO', 0.090, 0.220, 0.160, (BX, BY, BZ), m=P['abs'], bevel=0.005, segs=3)
    box('CAJA_JUNTA', 0.004, 0.214, 0.154, (BX + 0.0445, BY, BZ), m=P['junta'], bevel=0)
    box('CAJA_TAPA', 0.012, 0.222, 0.162, (BX + 0.0515, BY, BZ), m=P['tapa'], bevel=0.004, segs=3)
    box('CAJA_BISAGRA_A', 0.014, 0.020, 0.012, (BX + 0.053, BY + 0.100, BZ + 0.070), m=P['inox'], bevel=0.002)
    box('CAJA_BISAGRA_B', 0.014, 0.020, 0.012, (BX + 0.053, BY + 0.100, BZ - 0.070), m=P['inox'], bevel=0.002)
    for sy in (0.095, -0.095):
        for sz in (0.068, -0.068):
            cyl('TORNILLO_%s%s' % ('P' if sy > 0 else 'N', 'U' if sz > 0 else 'D'), 0.0042, 0.011,
                (BX + 0.0585, BY + sy, BZ + sz), rot=(0, R(90), 0), v=20, m=P['inox'], smooth=False)
    if etiqueta:
        box('ETIQUETA_INOX', 0.0015, 0.098, 0.056, (BX + 0.0585, BY - 0.055, BZ - 0.030), m=P['etiqueta'], bevel=0)
        q = mat_qr()
        placa('ETIQUETA_QR', 0.026, 0.026, (BX + 0.0598, BY + 0.045, BZ - 0.038),
              rot=(R(90), 0, 0), m=q, bevel=0)
        texto('TXT_VIGIA07', 'VIGIA-07', 0.0105, (BX + 0.0605, BY - 0.032, BZ - 0.048),
              rot=(R(90), 0, R(90)), m=P['pintura'])
        texto('TXT_SIRT', 'SIRT', 0.0055, (BX + 0.0605, BY - 0.078, BZ - 0.014),
              rot=(R(90), 0, R(90)), m=P['pintura'])
    cyl('LED_BEZEL', 0.0075, 0.006, (BX + 0.0585, BY + 0.075, BZ + 0.050), rot=(0, R(90), 0), v=24,
        m=P['ledbez'], smooth=False)
    sph('LED_ESTADO', 0.0055, (BX + 0.0625, BY + 0.075, BZ + 0.050), m=P[led])
    cyl('PG_ENERGIA', 0.009, 0.024, (BX, BY + 0.078, BZ - 0.088), rot=(R(180), 0, 0), v=28, m=P['negro'])
    cyl('PG_SENSORES', 0.009, 0.024, (BX, BY - 0.030, BZ - 0.088), rot=(R(180), 0, 0), v=28, m=P['negro'])
    cyl('PG_CABLE_UV', 0.0055, 0.16, (BX, BY + 0.078, BZ - 0.170), v=20, m=P['negro'])
    cyl('SMA_BASE', 0.0075, 0.018, (BX, BY, BZ + 0.089), v=28, m=P['inox'])
    cyl('ANTENA_LORA', 0.0048, 0.200, (BX, BY, BZ + 0.198), v=28, m=P['negro'])
    sph('ANTENA_PUNTA', 0.0060, (BX, BY, BZ + 0.298), m=P['negro'])
    if panel:
        PZ = BZ + 0.62
        box('PANEL_MARCO', 0.014, 0.350, 0.250, (BX + 0.090, BY, PZ), rot=(0, R(30), 0), m=P['aluminio'], bevel=0.004)
        box('PANEL_CELDAS', 0.008, 0.318, 0.218, (BX + 0.101, BY, PZ + 0.015), rot=(0, R(30), 0), m=P['celda'], bevel=0.002)
        box('PANEL_VIDRIO', 0.002, 0.322, 0.222, (BX + 0.107, BY, PZ + 0.021), rot=(0, R(30), 0), m=P['vidrio'], bevel=0.001)
        box('PANEL_RIOSTRA', 0.10, 0.030, 0.012, (BX + 0.030, BY, PZ - 0.235), m=P['aluminio'], bevel=0.002)
    if pluviometro:
        cube = mat_concreto() if False else P['obra']
        cyl('PLUV_BRAZO', 0.011, 0.16, (mx + 0.115, my, mz - 2.50), rot=(0, R(90), 0), v=28, m=P['galv'])
        box('PLUV_BASE', 0.16, 0.16, 0.014, (mx + 0.185, my, mz - 2.505), m=P['blanco'], bevel=0.003)
        cyl('PLUV_CUERPO', 0.048, 0.110, (mx + 0.185, my, mz - 2.49), v=64, m=P['blanco'])
        cone('PLUV_EMBUDO', 0.032, 0.100, 0.105, (mx + 0.185, my, mz - 2.385), v=64, m=P['blanco'])
        cyl('PLUV_REJILLA', 0.092, 0.006, (mx + 0.185, my, mz - 2.338), v=64, m=P['negro'])
        cyl('PLUV_NIVEL', 0.014, 0.008, (mx + 0.185, my + 0.062, mz - 2.494), v=28, m=P['ledbez'])
    return P


# ================================================================ CORONA 360
# Rediseño del nodo: NO es una caja al costado del poste. Es una CORONA SIMETRICA
# sobre la punta del mastil: 4 antenas a 90° mirando por 4 ventanas, toda la
# electronica adentro, anillo de LED visible desde cualquier lado y panel solar
# de 360° (banda + cono). El mastil NO atraviesa el equipo: no hay metal en el
# camino de las antenas.
def mastil(nombre, mx, my, z_base, altura, r=0.035, m=None, P=None, placa=True, tapa=True):
    P = P or paleta()
    m = m or P['galv']
    cyl(nombre, r, altura, (mx, my, z_base + altura / 2.0), v=48, m=m)
    if placa:
        box(nombre + '_PLACA', 0.15, 0.15, 0.014, (mx, my, z_base + 0.007), m=m, bevel=0.003)
    if tapa:
        sph(nombre + '_TAPA', r * 1.04, (mx, my, z_base + altura), m=m)
    return z_base + altura

def nodo_corona(mx, my, z, P=None, led='led_ok', paneles=True, pluviometro=False, etiqueta=True):
    """Corona 360° centrada en (mx,my,z). z = centro del cuerpo (radio 0.118, alto 0.34).
    Recibe de todos lados: 4 chip-antennas a 90° frente a 4 ventanas + coil LoRa."""
    P = P or paleta()
    # --- cuello de acople al mastil + faldon cortagoteras
    cyl('CORONA_CUELLO', 0.062, 0.080, (mx, my, z - 0.215), v=48, m=P['galv'])
    for sx in (1, -1):
        cyl('CORONA_BULON_%s' % ('P' if sx > 0 else 'N'), 0.0055, 0.016, (mx + sx * 0.062, my, z - 0.215),
            rot=(0, R(90), 0), v=16, m=P['inox'], smooth=False)
    cone('CORONA_FALDON', 0.074, 0.131, 0.050, (mx, my, z - 0.170), v=64, m=P['techo'])
    # --- cuerpo: 2 tapas + 4 pilares + 4 ventanas
    cyl('CORONA_TAPA_BAJA', 0.118, 0.016, (mx, my, z - 0.150), v=64, m=P['techo'], bevel=0.002)
    cyl('CORONA_TAPA_ALTA', 0.118, 0.016, (mx, my, z + 0.150), v=64, m=P['techo'], bevel=0.002)
    for a in (45, 135, 225, 315):
        ra = R(a)
        box('CORONA_PILAR_%d' % a, 0.024, 0.032, 0.300,
            (mx + 0.104 * math.cos(ra), my + 0.104 * math.sin(ra), z), rot=(0, 0, ra), m=P['aluminio'], bevel=0.003)
    for a in (0, 90, 180, 270):
        ra = R(a)
        box('CORONA_VENTANA_%d' % a, 0.004, 0.140, 0.175,
            (mx + 0.116 * math.cos(ra), my + 0.116 * math.sin(ra), z + 0.0375), rot=(0, 0, ra), m=P['pane'], bevel=0)
    # --- anillo de LED de estado (visible 360°) + deflector
    tor('CORONA_LED_DEF', 0.1085, 0.0085, (mx, my, z + 0.138), m=P['ledbez'])
    tor('CORONA_LED_ANILLO', 0.1045, 0.0052, (mx, my, z + 0.133), m=P[led])
    # --- panel solar 360°: banda inferior + cono superior
    cyl('CORONA_PV_BANDA', 0.1205, 0.086, (mx, my, z - 0.108), v=64, m=P['celda'])
    tor('CORONA_PV_RIM_A', 0.1215, 0.0030, (mx, my, z - 0.150), m=P['aluminio'])
    tor('CORONA_PV_RIM_B', 0.1215, 0.0030, (mx, my, z - 0.066), m=P['aluminio'])
    if paneles:
        cone('CORONA_PV_CONO', 0.134, 0.070, 0.055, (mx, my, z + 0.186), v=64, m=P['celda'])
        tor('CORONA_PV_CONO_RIM', 0.1335, 0.0040, (mx, my, z + 0.160), m=P['aluminio'])
        cyl('CORONA_PV_TAPA', 0.070, 0.012, (mx, my, z + 0.216), v=64, m=P['aluminio'])
        sph('CORONA_DOMO', 0.028, (mx, my, z + 0.232), m=P['tapa'])
        cyl('CORONA_GORE', 0.006, 0.010, (mx + 0.030, my, z + 0.222), v=16, m=P['negro'])
    # --- internos: torre de 3 PCB + bateria + coil LoRa
    for i, (zz, mm) in enumerate(((z - 0.100, P['pcb2']), (z - 0.005, P['pcb']), (z + 0.090, P['pcb2']))):
        box('CORONA_PCB_%d' % i, 0.086, 0.086, 0.0016, (mx, my, zz), rot=(0, 0, R(45 * i)), m=mm, bevel=0.0008)
    for i, zz in enumerate((z - 0.0525, z + 0.0425)):
        for j, (dx, dy) in enumerate(((0.032, 0.032), (-0.032, 0.032), (0.032, -0.032), (-0.032, -0.032))):
            cyl('CORONA_SEP_%d_%d' % (i, j), 0.0035, 0.075, (mx + dx, my + dy, zz), v=6, m=P['laton'], smooth=False)
    # PCB superior: 4 chip-antennas a 90° (esto es lo que da los 360°)
    for a in (0, 90, 180, 270):
        ra = R(a)
        box('ANT_CHIP_%d' % a, 0.017, 0.007, 0.0022,
            (mx + 0.038 * math.cos(ra), my + 0.038 * math.sin(ra), z + 0.0925), rot=(0, 0, ra), m=P['chip'], bevel=0)
    box('CORONA_SHIELD_WIFI', 0.026, 0.020, 0.0030, (mx, my, z + 0.0925), m=P['inox'], bevel=0.001)
    # PCB medio: ESP32-S3 + USB-C
    box('CORONA_ESP32', 0.026, 0.017, 0.0030, (mx - 0.010, my + 0.008, z + 0.0020), m=P['chip'], bevel=0.001)
    box('CORONA_SHIELD_ESP', 0.020, 0.013, 0.0018, (mx - 0.010, my + 0.008, z + 0.0044), m=P['inox'], bevel=0.0008)
    box('CORONA_USBC', 0.009, 0.0075, 0.0032, (mx + 0.038, my, z, ), m=P['inox'], bevel=0.001)
    for k, (dx, dy) in enumerate(((0.026, -0.020), (0.030, 0.018))):
        cyl('CORONA_CRISTAL_%d' % k, 0.0035, 0.005, (mx + dx, my + dy, z + 0.0035), v=12, m=P['inox'], smooth=False)
    # PCB inferior: LoRa + potencia
    box('CORONA_LORA', 0.021, 0.017, 0.0032, (mx - 0.012, my - 0.010, z - 0.0975), m=P['inox'], bevel=0.001)
    for k, (dx, dy) in enumerate(((-0.030, 0.020), (0.005, 0.028))):
        cyl('CORONA_INDUCTOR_%d' % k, 0.0045, 0.006, (mx + dx, my + dy, z - 0.0955), v=16, m=P['chip'])
    for k, dy in enumerate((0.016, -0.016)):
        box('CORONA_BORNERA_%d' % k, 0.013, 0.008, 0.010, (mx + 0.030, my + dy, z - 0.0945), m=P['bornera'], bevel=0.001)
    cyl('CORONA_FUSIBLE', 0.0030, 0.010, (mx + 0.010, my - 0.026, z - 0.0955), rot=(0, R(90), 0), v=12, m=P['chip'], smooth=False)
    tor('CORONA_COIL_LORA', 0.052, 0.0025, (mx, my, z - 0.134), m=P['cobre'])
    cyl('CORONA_COAX', 0.0025, 0.022, (mx, my, z - 0.115), v=10, m=P['negro'])
    # bateria 2x 18650 + soporte
    for s in (1, -1):
        cyl('CORONA_CELDA_%s' % ('P' if s > 0 else 'N'), 0.0092, 0.066, (mx + 0.064, my + s * 0.026, z - 0.117),
            v=24, m=P['pcb2'])
    box('CORONA_PORTA_PILA', 0.024, 0.072, 0.006, (mx + 0.064, my, z - 0.152), m=P['chip'], bevel=0.001)
    cyl('CORONA_CABLE', 0.0030, 0.070, (mx, my, z - 0.185), v=10, m=P['negro'])
    # --- placa grabada (dato de credibilidad)
    if etiqueta:
        box('CORONA_PLACA', 0.002, 0.082, 0.028, (mx + 0.1195, my, z + 0.148), m=P['etiqueta'], bevel=0)
        texto('TXT_RX360', 'VIGIA-07', 0.0075, (mx + 0.1210, my, z + 0.154), rot=(R(90), 0, R(90)), m=P['pintura'])
        texto('TXT_915', 'LoRa 915 MHz - RX 360', 0.0042, (mx + 0.1210, my, z + 0.1445), rot=(R(90), 0, R(90)), m=P['pintura'])
    # --- pluviometro en brazo aparte (a 1.2 m bajo la corona)
    if pluviometro:
        zb = z - 1.20
        cyl('PLUV_BRAZO', 0.011, 0.17, (mx + 0.120, my, zb), rot=(0, R(90), 0), v=28, m=P['galv'])
        box('PLUV_BASE', 0.16, 0.16, 0.014, (mx + 0.195, my, zb - 0.005), m=P['blanco'], bevel=0.003)
        cyl('PLUV_CUERPO', 0.048, 0.110, (mx + 0.195, my, zb + 0.010), v=64, m=P['blanco'])
        cone('PLUV_EMBUDO', 0.032, 0.100, 0.105, (mx + 0.195, my, zb + 0.115), v=64, m=P['blanco'])
        cyl('PLUV_REJILLA', 0.092, 0.006, (mx + 0.195, my, zb + 0.162), v=64, m=P['negro'])
        cyl('PLUV_NIVEL', 0.014, 0.008, (mx + 0.195, my + 0.062, zb + 0.006), v=28, m=P['ledbez'])
        box('PLUV_ABRAZ', 0.022, 0.050, 0.014, (mx + 0.058, my, zb), m=P['inox'], bevel=0.002)
    return P

nodo = nodo_corona  # el diseño de caja lateral quedo obsoleto: no recibe de todos lados


# ================================================================ PUCK DE CAMPO
# Tercer diseño, y el bueno. REGLA: NO DEBE PARECER UNA FAROLA.
# Fuera sombrero conico, fuera banda de vidrio que brilla, fuera silueta de
# lampara: ahora es un DISCO ANCHO Y BAJO (0.28 x 0.115) con aletas de
# disipacion, techo de celdas solares PLANO, 4 ventanas RF ahumadas (no vidrio
# transparente), cable que baja al poste, caja de conexiones, prensaestopas,
# venteo Gore y puerto de antena externa tapado. Aluminio anodizado = equipo,
# no decoracion.
def tubo(name, r, h, loc, rot=(0, 0, 0), v=64, m=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=v, location=loc, rotation=rot,
                                        end_fill_type='NOTHING')
    return _new(bpy.context.object, name, m, smooth=True)

def punto(name, energy, loc, color=(1, 1, 1), radius=0.03):
    ld = bpy.data.lights.new(name, type='POINT')
    ld.energy = energy
    ld.color = color
    ld.shadow_soft_size = radius
    o = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    return o

def anemometro(nombre, x, y, z, P=None, brazo=0.30):
    """Anemometro de cazoletas: da la VELOCIDAD DEL VIENTO. Eje vertical, 3 brazos a 120°
    con cazoletas; va en brazo aparte, lo mas alto y libre de la torre."""
    P = P or paleta()
    cyl(nombre + '_BRAZO', 0.011, brazo, (x - brazo / 2.0, y, z), rot=(0, R(90), 0), v=20, m=P['galv'])
    cyl(nombre + '_CUERPO', 0.023, 0.080, (x, y, z + 0.040), v=24, m=P['blanco'])
    cyl(nombre + '_EJE', 0.006, 0.120, (x, y, z + 0.135), v=16, m=P['inox'], smooth=False)
    for k in range(3):
        a = R(k * 120.0)
        box(nombre + '_VARILLA_%d' % k, 0.125, 0.0085, 0.0085,
            (x + 0.062 * math.cos(a), y + 0.062 * math.sin(a), z + 0.185), rot=(0, 0, a), m=P['inox'], bevel=0)
        cyl(nombre + '_CAZOLETA_%d' % k, 0.027, 0.036,
            (x + 0.118 * math.cos(a), y + 0.118 * math.sin(a), z + 0.185),
            rot=(R(90), 0, a), v=20, m=P['negro'], smooth=False)
    return None

def abrigo_hr(nombre, x, y, z, P=None, brazo=0.26, platos=5):
    """Abrigo de radiacion para el sensor de HUMEDAD (y temperatura): pila de platos blancos
    con el sensor en el centro. Va en brazo aparte, a la sombra y lejos del anemometro."""
    P = P or paleta()
    cyl(nombre + '_BRAZO', 0.010, brazo, (x - brazo / 2.0, y, z), rot=(0, R(90), 0), v=18, m=P['galv'])
    box(nombre + '_ABRAZ', 0.020, 0.045, 0.014, (x - brazo + 0.02, y, z), m=P['inox'], bevel=0.002)
    cyl(nombre + '_SENSOR', 0.015, 0.170, (x, y, z - 0.075), v=24, m=P['blanco'])
    cyl(nombre + '_PLATO_TOP', 0.062, 0.012, (x, y, z + 0.004), v=32, m=P['blanco'])
    for k in range(platos):
        cyl(nombre + '_PLATO_%d' % k, 0.058 - k * 0.0035, 0.010, (x, y, z - 0.028 - k * 0.030), v=32, m=P['blanco'])
    cyl(nombre + '_BASE', 0.044, 0.010, (x, y, z - 0.182), v=24, m=P['blanco'])
    cyl(nombre + '_TAPA', 0.019, 0.012, (x, y, z - 0.196), v=20, m=P['negro'])
    return None

def panel_solar(nombre, cx, cy, cz, sx=0.196, sy=0.200, tilt=22.0, m_celda=None, m_marco=None, P=None):
    """Modulo PV rectangular INCLINADO `tilt` grados mirando a -Y (donde esta el sol).
    (cx,cy,cz) = centro del plano de celdas. Los paneles nunca van planos."""
    P = P or paleta()
    mc = m_celda or P['celda']
    mm = m_marco or P['aluminio']
    t = R(tilt); ct, st = math.cos(t), math.sin(t)

    def W(lx, ly, lz):
        return (cx + lx, cy + ly * ct - lz * st, cz + ly * st + lz * ct)

    box(nombre + '_MARCO', sx + 0.016, sy + 0.016, 0.014, W(0, 0, -0.005), rot=(t, 0, 0), m=mm, bevel=0.002)
    box(nombre + '_CELDAS', sx, sy, 0.012, W(0, 0, 0.005), rot=(t, 0, 0), m=mc, bevel=0.0012)
    for k in (1, 2, 3):
        box(nombre + '_GAPX%d' % k, 0.0026, sy - 0.006, 0.003, W(-sx / 2 + k * sx / 4.0, 0, 0.011), rot=(t, 0, 0), m=mm, bevel=0)
        box(nombre + '_GAPY%d' % k, sx - 0.006, 0.0026, 0.003, W(0, -sy / 2 + k * sy / 4.0, 0.011), rot=(t, 0, 0), m=mm, bevel=0)
    return None

def nodo_puck(mx, my, z, P=None, led='led_ok', pluviometro=True, etiqueta=True,
              caja=True, sensor_nivel=True, interna=True, con_anemo=True, con_hr=True):
    """Puck 360° sobre la punta del mastil. (mx,my) = eje del mastil, z = centro del disco."""
    P = P or paleta()
    A = 0.140        # radio del cuerpo
    HB = 0.115       # alto del cuerpo
    zb = z - HB / 2.0
    # --- acople al mastil + faldon
    cyl('PUCK_CUELLO', 0.058, 0.090, (mx, my, zb - 0.040), v=48, m=P['galv'])
    for s in (1, -1):
        cyl('PUCK_BULON_%s' % ('P' if s > 0 else 'N'), 0.0055, 0.016, (mx + s * 0.058, my, zb - 0.040),
            rot=(0, R(90), 0), v=16, m=P['inox'], smooth=False)
    cone('PUCK_FALDON', 0.078, 0.126, 0.030, (mx, my, zb - 0.012), v=32, m=P['techo'])
    # --- brida de montaje con bulones visibles (nada de base de lampara)
    cyl('PUCK_BRIDA', 0.092, 0.014, (mx, my, zb - 0.030), v=48, m=P['anodizado_osc'], bevel=0.002)
    for a in (0, 90, 180, 270):
        ra = R(a)
        cyl('PUCK_BRIDA_BULON_%d' % a, 0.0050, 0.010,
            (mx + 0.072 * math.cos(ra), my + 0.072 * math.sin(ra), zb - 0.040), v=14, m=P['inox'], smooth=False)
    # --- cuerpo (aluminio anodizado OSCURO: lee como equipo, no como cromo)
    cyl('PUCK_CUERPO', A, HB, (mx, my, z), v=64, m=P['anodizado'], bevel=0.004)
    tor('PUCK_ARO_BAJO', A + 0.002, 0.0045, (mx, my, zb + 0.012), m=P['aluminio'])
    tor('PUCK_ARO_ALTO', A + 0.002, 0.0045, (mx, my, zb + HB - 0.012), m=P['aluminio'])
    # --- aletas de disipacion: costillas VERTICALES al costado (visibles de perfil)
    for k in range(8):
        a = R(22.5 + k * 45.0)
        box('PUCK_ALETA_%02d' % k, 0.016, 0.0075, 0.100,
            (mx + (A + 0.006) * math.cos(a), my + (A + 0.006) * math.sin(a), z), rot=(0, 0, a),
            m=P['aluminio'], bevel=0.001)
    # --- techo: tapa ciega + modulo PV INCLINADO 22° (los paneles tienen que ver el sol)
    box('PUCK_TAPA', 0.212, 0.216, 0.016, (mx, my, zb + HB + 0.008), m=P['anodizado_osc'], bevel=0.002)
    cyl('PUCK_TAPA_VENT', 0.0085, 0.016, (mx + 0.078, my - 0.072, zb + HB + 0.022), v=18, m=P['laton'], smooth=False)
    panel_solar('PUCK_PV', mx, my - 0.012, zb + HB + 0.062, 0.196, 0.200, tilt=22.0, P=P)
    for s in (1, -1):
        cyl('PUCK_PV_SOP_%d' % s, 0.0055, 0.070, (mx + s * 0.072, my + 0.072, zb + HB + 0.050),
            v=12, m=P['aluminio'], smooth=False)
    box('PUCK_PV_CAJA', 0.058, 0.028, 0.026, (mx - 0.075, my + 0.020, zb + HB + 0.030), m=P['blanco'], bevel=0.002)
    # --- 4 ventanas RF ahumadas a 90° (son las que dejan pasar la senal)
    for a in (0, 90, 180, 270):
        ra = R(a)
        box('RF_BOLSILLO_%d' % a, 0.006, 0.092, 0.060,
            (mx + (A - 0.003) * math.cos(ra), my + (A - 0.003) * math.sin(ra), z + 0.004), rot=(0, 0, ra),
            m=P['anodizado_osc'], bevel=0.001)
        box('RF_VENTANA_%d' % a, 0.004, 0.084, 0.052,
            (mx + (A + 0.002) * math.cos(ra), my + (A + 0.002) * math.sin(ra), z + 0.004), rot=(0, 0, ra),
            m=P['pane'], bevel=0.002)
    # --- LEDs de estado (dos lentes chicos, en un rebaje; sin anillo, sin deslumbramiento)
    for k, (dy, mm) in enumerate(((0.030, led), (0.013, 'led_warn'))):
        cyl('PUCK_LED_ARY_%d' % k, 0.0090, 0.012, (mx + A - 0.002, my + dy, z - 0.030),
            rot=(0, R(90), 0), v=24, m=P['ledbez'], smooth=False)
        sph('PUCK_LED_%d' % k, 0.0062, (mx + A + 0.004, my + dy, z - 0.030), m=P[mm])
    # --- placas grabadas (credibilidad tecnica) sobre un rebaje mecanizado
    if etiqueta:
        for (dy, sx, sy) in ((-0.040, 0.062, 0.030), (0.088, 0.052, 0.026)):
            box('PUCK_BOSS_%.3f' % dy, 0.014, sx + 0.014, sy + 0.012,
                (mx + A - 0.014, my + dy, z - 0.030), m=P['anodizado_osc'], bevel=0.0015)
        box('PUCK_PLACA_A', 0.002, 0.062, 0.030, (mx + A - 0.009, my - 0.040, z - 0.030), m=P['etiqueta'], bevel=0)
        texto('TXT_PUCK_1', 'VIGIA-07', 0.0072, (mx + A - 0.0025, my - 0.040, z - 0.0245),
              rot=(R(90), 0, R(90)), m=P['pintura'])
        texto('TXT_PUCK_2', 'SIRT - SINAPRED', 0.0036, (mx + A - 0.0025, my - 0.040, z - 0.0350),
              rot=(R(90), 0, R(90)), m=P['pintura'])
        box('PUCK_PLACA_B', 0.002, 0.052, 0.026, (mx + A - 0.009, my + 0.088, z - 0.030), m=P['etiqueta'], bevel=0)
        texto('TXT_PUCK_3', 'LoRa 915 MHz', 0.0036, (mx + A - 0.0025, my + 0.088, z - 0.0255),
              rot=(R(90), 0, R(90)), m=P['pintura'])
        texto('TXT_PUCK_4', 'RX 360 - SIN APP', 0.0034, (mx + A - 0.0025, my + 0.088, z - 0.0345),
              rot=(R(90), 0, R(90)), m=P['pintura'])
    # --- prensaestopas, cable al poste, venteo Gore y puerto de antena externa
    cyl('PUCK_PG', 0.010, 0.026, (mx, my - 0.055, zb - 0.016), rot=(R(180), 0, 0), v=28, m=P['negro'])
    cyl('PUCK_CABLE', 0.0075, 0.95, (mx, my - 0.055, zb - 0.50), v=20, m=P['negro'])
    cyl('PUCK_GORE', 0.0055, 0.012, (mx, my + 0.104, z + 0.020), rot=(R(90), 0, 0), v=20, m=P['laton'], smooth=False)
    cyl('PUCK_ANT_BASE', 0.0080, 0.014, (mx, my + 0.104, z - 0.020), rot=(R(90), 0, 0), v=20, m=P['inox'])
    cyl('PUCK_ANT_TAPA', 0.0090, 0.008, (mx, my + 0.116, z - 0.020), rot=(R(90), 0, 0), v=20, m=P['negro'])
    if caja:
        ZK = zb - 1.00
        box('CAJA_CAMPOS', 0.115, 0.170, 0.075, (mx + 0.115, my - 0.02, ZK), m=P['abs'], bevel=0.004)
        box('CAJA_CAMPOS_TAPA', 0.006, 0.164, 0.069, (mx + 0.174, my - 0.02, ZK), m=P['tapa'], bevel=0.003)
        for sy in (0.055, -0.095):
            cyl('CAJA_TORN_%s' % ('A' if sy > 0 else 'B'), 0.0040, 0.010, (mx + 0.179, my - 0.02 + sy, ZK + 0.026),
                rot=(0, R(90), 0), v=16, m=P['inox'], smooth=False)
        texto('TXT_CAJA', 'SIRT', 0.012, (mx + 0.181, my - 0.02, ZK - 0.010), rot=(R(90), 0, R(90)), m=P['pintura'])
        cyl('CAJA_PG', 0.009, 0.022, (mx + 0.115, my - 0.02, ZK - 0.048), rot=(R(180), 0, 0), v=24, m=P['negro'])
        cyl('CAJA_CABLE_DOWN', 0.0065, 0.60, (mx + 0.115, my - 0.02, ZK - 0.34), v=18, m=P['negro'])
        box('CAJA_ABRAZ_A', 0.024, 0.056, 0.014, (mx + 0.062, my - 0.02, ZK + 0.030), m=P['inox'], bevel=0.002)
        box('CAJA_ABRAZ_B', 0.024, 0.056, 0.014, (mx + 0.062, my - 0.02, ZK - 0.030), m=P['inox'], bevel=0.002)
    # --- sensor de nivel de agua: sonda en cable + soporte
    if sensor_nivel:
        ZN = zb - 1.00
        cyl('NIVEL_CABLE', 0.0042, 1.10, (mx + 0.055, my + 0.135, ZN - 0.55), v=14, m=P['negro'])
        cyl('NIVEL_SONDA', 0.016, 0.115, (mx + 0.055, my + 0.135, ZN - 1.15), v=32, m=P['inox'])
        sph('NIVEL_PUNTA', 0.016, (mx + 0.055, my + 0.135, ZN - 1.21), m=P['negro'])
    # --- internos (solo para la toma de corte/explosion)
    if interna:
        for i, (zz, mm) in enumerate(((z - 0.030, P['pcb']), (z + 0.005, P['pcb2']), (z + 0.036, P['pcb']))):
            box('PUCK_PCB_%d' % i, 0.116, 0.116, 0.0016, (mx, my, zz), rot=(0, 0, R(0)), m=mm, bevel=0.0008)
        for a in (0, 90, 180, 270):
            ra = R(a)
            box('ANT_CHIP_%d' % a, 0.020, 0.008, 0.0024,
                (mx + 0.046 * math.cos(ra), my + 0.046 * math.sin(ra), z + 0.0385), rot=(0, 0, ra), m=P['chip'], bevel=0)
        box('PUCK_SHIELD', 0.030, 0.024, 0.0032, (mx, my, z + 0.038), m=P['inox'], bevel=0.001)
        box('PUCK_ESP32', 0.028, 0.019, 0.0030, (mx - 0.012, my + 0.010, z + 0.0075), m=P['chip'], bevel=0.001)
        box('PUCK_LORA', 0.023, 0.018, 0.0036, (mx - 0.014, my - 0.012, z - 0.0275), m=P['inox'], bevel=0.001)
        tor('PUCK_COIL', 0.038, 0.0025, (mx + 0.030, my - 0.030, z - 0.027), m=P['cobre'])
        box('PUCK_BORNERA', 0.016, 0.010, 0.011, (mx + 0.038, my + 0.030, z - 0.024), m=P['bornera'], bevel=0.001)
    # --- pluviometro de balancin, en brazo aparte (tiene que estar nivelado y libre)
    if pluviometro:
        zb2 = zb - 1.55
        cyl('PLUV_BRAZO', 0.011, 0.19, (mx + 0.125, my, zb2), rot=(0, R(90), 0), v=28, m=P['galv'])
        box('PLUV_BASE', 0.16, 0.16, 0.014, (mx + 0.205, my, zb2 - 0.005), m=P['blanco'], bevel=0.003)
        cyl('PLUV_CUERPO', 0.048, 0.110, (mx + 0.205, my, zb2 + 0.010), v=64, m=P['blanco'])
        cone('PLUV_EMBUDO', 0.032, 0.100, 0.105, (mx + 0.205, my, zb2 + 0.115), v=64, m=P['blanco'])
        cyl('PLUV_REJILLA', 0.092, 0.006, (mx + 0.205, my, zb2 + 0.162), v=64, m=P['negro'])
        cyl('PLUV_NIVEL', 0.014, 0.008, (mx + 0.205, my + 0.062, zb2 + 0.006), v=28, m=P['ledbez'])
        box('PLUV_ABRAZ', 0.022, 0.050, 0.014, (mx + 0.060, my, zb2), m=P['inox'], bevel=0.002)
    # --- anemometro de cazoletas: velocidad del viento, lo mas alto y libre
    if con_anemo:
        anemometro('NODO_ANEMO', mx + 0.30, my, z - 0.66, brazo=0.30, P=P)
    # --- abrigo de radiacion: humedad y temperatura, del lado opuesto al anemometro
    if con_hr:
        abrigo_hr('NODO_HR', mx - 0.26, my, z - 1.26, brazo=0.26, P=P)
    return P

nodo = nodo_puck  # diseño vigente: puck 360°, no farola


# ================================================================ EDIFICIO MONITOREADO
def ventana(x, y, z, ancho=1.5, alto=1.3, giro=0.0, P=None, m_marco=None, m_vid=None, reja=True, nm='V'):
    """Ventana con marco, vidrio, travesaño y reja. (x,y,z) = centro. giro = rotacion Z en grados."""
    P = P or paleta()
    m_marco = m_marco or P['obra']
    m_vid = m_vid or P['vidrio_ventana']
    g = R(giro)
    c, s = math.cos(g), math.sin(g)

    def W(lx, ly, lz):
        return (x + lx * c - ly * s, y + lx * s + ly * c, z + lz)

    def bx(suf, sx, sy, sz, lx, ly, lz, mm):
        box('VEN_%s_%s' % (nm, suf), sx, sy, sz, W(lx, ly, lz), rot=(0, 0, g), m=mm, bevel=0.0015)

    bx('MARCO_IZ', 0.06, 0.07, alto + 0.12, -(ancho / 2 + 0.03), 0, 0, m_marco)
    bx('MARCO_DE', 0.06, 0.07, alto + 0.12, (ancho / 2 + 0.03), 0, 0, m_marco)
    bx('MARCO_AR', ancho + 0.12, 0.07, 0.06, 0, 0, (alto / 2 + 0.03), m_marco)
    bx('MARCO_AB', ancho + 0.12, 0.07, 0.06, 0, 0, -(alto / 2 + 0.03), m_marco)
    bx('ALFEIZAR', ancho + 0.24, 0.13, 0.06, 0, -0.03, -(alto / 2 + 0.07), m_marco)
    bx('VIDRIO', ancho, 0.012, alto, 0, -0.01, 0, m_vid)
    bx('TRAVESANO', ancho, 0.045, 0.045, 0, -0.012, 0, m_marco)
    if reja:
        for k in range(4):
            bx('BARRA_%d' % k, 0.020, 0.020, alto, -ancho / 2 + (k + 0.5) * ancho / 4.0, -0.055, 0, P['techo'])
        bx('TRAVESA_REJA', ancho, 0.020, 0.020, 0, -0.055, 0, P['techo'])

def edificio_escuela(ox=0.0, oy=0.0, P=None, con_puck=True, con_cancha=True, con_muro=True):
    """Edificio monitoreado: escuela de 2 plantas (18.4 x 9.4 m, 6.80 m de alto) con corredor,
    techo de chapa a dos aguas y mastil con el puck 360 en el techo. Aqui esta la gente."""
    P = P or paleta()
    MURO = retext('concrete_block_wall_03', 1.15, tinte=(0.76, 0.735, 0.685), factor=0.60)
    CHAPA = retext('worn_corrugated_iron', 1.1, tinte=(0.30, 0.235, 0.190), factor=0.52)
    PISO = retext('concrete_pavement_03', 2.0)
    TIERRA = retext('dirt', 5.0)
    ASFALTO = retext('asphalt_03', 4.0)
    LADRILLO = retext('brick_wall_13', 1.2)
    muro = MURO or P['obra']
    chapa = CHAPA or P['techo']
    piso = PISO or P['obra']
    AN, FO, H = 18.4, 9.4, 6.80
    # --- terreno, calle, vereda
    placa('TERRENO', 420, 420, (ox, oy, -0.02), m=TIERRA or P['tierra'])
    box('CALLE', 130, 7.0, 0.06, (ox, oy - 19.0, 0.0), m=ASFALTO or P['obra'], bevel=0)
    box('VEREDA', 24, 1.7, 0.16, (ox, oy - 8.4, 0.06), m=piso, bevel=0.01)
    # --- plinto, muros, faja entre pisos, pilastras, cornisa
    box('PLINTO', AN + 0.8, FO + 0.8, 0.45, (ox, oy, 0.225), m=piso, bevel=0.012)
    box('MURO_FRENTE', AN, 0.26, H, (ox, oy - FO / 2 + 0.13, 0.45 + H / 2), m=muro)
    box('MURO_FONDO', AN, 0.26, H, (ox, oy + FO / 2 - 0.13, 0.45 + H / 2), m=muro)
    box('MURO_IZQ', 0.26, FO - 0.5, H, (ox - AN / 2 + 0.13, oy, 0.45 + H / 2), m=muro)
    box('MURO_DER', 0.26, FO - 0.5, H, (ox + AN / 2 - 0.13, oy, 0.45 + H / 2), m=muro)
    box('FAJA_ENTREPISO', AN + 0.5, FO + 0.5, 0.24, (ox, oy, 3.45), m=P['terracota'], bevel=0.008)
    box('CORNISA', AN + 0.6, FO + 0.6, 0.28, (ox, oy, 7.05), m=piso, bevel=0.008)
    for sx in (1, -1):
        for sy in (1, -1):
            box('PILASTRA_%d%d' % (sx, sy), 0.45, 0.45, H + 0.1,
                (ox + sx * (AN / 2 - 0.02), oy + sy * (FO / 2 - 0.02), 0.45 + H / 2), m=P['obra'], bevel=0.006)
    # --- techo de chapa a dos aguas
    rl = R(10.9)
    for sy in (1, -1):
        box('CHAPA_%s' % ('F' if sy < 0 else 'B'), AN + 1.2, 5.0, 0.045,
            (ox, oy + sy * 2.35, 7.60), rot=(sy * rl, 0, 0), m=chapa, bevel=0.004)
        box('FASCIA_%s' % ('F' if sy < 0 else 'B'), AN + 1.2, 0.06, 0.26,
            (ox, oy + sy * 4.72, 6.98), m=P['techo'], bevel=0.004)
        for k, dy in enumerate((1.2, 2.4, 3.6, 4.4)):
            box('CORREA_%s%d' % ('F' if sy < 0 else 'B', k), AN + 1.2, 0.07, 0.07,
                (ox, oy + sy * dy, 8.00 - (dy / 4.7) * 0.9 - 0.10), m=P['techo'], bevel=0.003)
    box('CUMBRERA', AN + 1.3, 0.28, 0.075, (ox, oy, 8.03), m='M_TECHO_OSC' and P['techo'], bevel=0.005)
    # --- corredor (galeria) al frente: losa, columnas y techo propio
    box('CORREDOR_LOSA', AN + 0.2, 2.1, 0.22, (ox, oy - 5.65, 3.48), m=piso, bevel=0.008)
    for k, dx in enumerate((-8.4, -4.2, 0.0, 4.2, 8.4)):
        box('CORREDOR_COL_%d' % k, 0.30, 0.30, 3.40, (ox + dx, oy - 6.55, 1.70), m=piso, bevel=0.005)
    box('CORREDOR_VAINA', AN + 0.2, 0.10, 0.10, (ox, oy - 6.52, 3.36), m=piso, bevel=0.004)
    box('BARANDA_A', AN + 0.2, 0.07, 0.07, (ox, oy - 6.52, 4.55), m=P['inox'], bevel=0.003)
    box('BARANDA_B', AN + 0.2, 0.05, 0.05, (ox, oy - 6.52, 4.05), m=P['inox'], bevel=0.003)
    box('CORREDOR_TECHO', AN + 1.0, 2.7, 0.045, (ox, oy - 5.80, 3.84), rot=(R(-4), 0, 0), m=chapa, bevel=0.004)
    # --- ventanas (frente = -Y, costado = +X)
    for zz in (2.35, 5.15):
        for dx in (-6.6, -3.3, 3.3, 6.6):
            ventana(ox + dx, oy - FO / 2 - 0.01, zz, nm='F%d%d' % (int(zz), int(dx * 10)))
        for dy in (-2.6, 2.6):
            ventana(ox + AN / 2 + 0.01, oy + dy, zz, giro=90, nm='R%d%d' % (int(zz), int(dy * 10)))
    # --- puerta, escalones y rampa de acceso
    box('PUERTA', 2.0, 0.07, 2.75, (ox, oy - FO / 2 - 0.02, 1.85), m=P['techo'], bevel=0.004)
    box('PUERTA_MARCO', 2.24, 0.10, 2.95, (ox, oy - FO / 2, 1.90), m=P['obra'], bevel=0.004)
    for k in range(3):
        box('ESCALON_%d' % k, 2.6, 0.34, 0.16, (ox, oy - FO / 2 - 0.3 - k * 0.34, 0.08 + k * 0.16), m=piso, bevel=0.006)
    box('RAMPA', 3.0, 0.09, 1.5, (ox + 7.6, oy - FO / 2 - 1.1, 0.45), rot=(R(-18), 0, 0), m=piso, bevel=0.006)
    # --- letreros del edificio
    texto('TXT_ESCUELA', 'ESCUELA', 0.55, (ox - 5.0, oy - FO / 2 - 0.14, 6.40), rot=(R(90), 0, 0), m=P['pintura'])
    box('PLACA_ENCUENTRO', 3.2, 0.05, 0.62, (ox, oy - FO / 2 - 0.13, 4.22), m=P['blanco'], bevel=0.006)
    texto('TXT_ENCUENTRO', 'PUNTO DE ENCUENTRO', 0.24, (ox, oy - FO / 2 - 0.17, 4.32), rot=(R(90), 0, 0), m=P['pintura'])
    texto('TXT_ALBERGUE', 'ALBERGUE Y RESCATE', 0.17, (ox, oy - FO / 2 - 0.17, 4.06), rot=(R(90), 0, 0), m=P['terracota'])
    # --- techo: tanque de agua, tanque de gas, ducto
    cyl('TANQUE_AGUA', 0.30, 0.58, (ox - 6.9, oy + 2.5, 8.15), v=48, m=P['blanco'])
    cyl('TANQUE_AGUA_TAPA', 0.31, 0.05, (ox - 6.9, oy + 2.5, 8.46), v=48, m=P['negro'])
    cyl('TANQUE_AGUA_VALV', 0.035, 0.14, (ox - 6.9, oy + 2.18, 7.95), rot=(R(90), 0, 0), v=20, m=P['inox'])
    cyl('TANQUE_GAS', 0.19, 0.95, (ox - 8.5, oy + 0.9, 7.95), rot=(0, R(90), 0), v=32, m=P['blanco'])
    cyl('TANQUE_GAS_2', 0.19, 0.95, (ox - 8.5, oy - 0.3, 7.95), rot=(0, R(90), 0), v=32, m=P['blanco'])
    cyl('DUCTO', 0.075, 0.85, (ox + 2.4, oy + 1.9, 7.75), v=24, m=P['galv'])
    # --- cancha de basquet y muro perimetral de ladrillo
    if con_cancha:
        box('CANCHA', 13.5, 0.10, 7.6, (ox - 16.5, oy + 3.0, 0.04), m=piso, bevel=0)
        cyl('ARO_POSTE', 0.075, 3.6, (ox - 19.0, oy + 3.0, 1.80), v=24, m=P['galv'])
        box('ARO_TABLERO', 0.06, 1.80, 1.05, (ox - 18.6, oy + 3.0, 3.62), m=P['blanco'], bevel=0.004)
        tor('ARO_ANILLO', 0.23, 0.018, (ox - 18.3, oy + 3.0, 3.22), rot=(R(90), 0, 0), m=P['ambar'])
        box('ARO_RED', 0.02, 0.44, 0.42, (ox - 18.3, oy + 3.0, 2.98), m=P['blanco'], bevel=0.002)
    if con_muro:
        box('MURO_PERIM_A', 26.0, 0.24, 1.75, (ox - 4.0, oy - 14.5, 0.88), m=LADRILLO or P['obra'], bevel=0.008)
        box('MURO_PERIM_B', 0.24, 18.0, 1.75, (ox - 21.0, oy - 5.0, 0.88), m=LADRILLO or P['obra'], bevel=0.008)
        box('PORTON', 4.6, 0.10, 2.10, (ox + 3.0, oy - 14.5, 1.05), m=P['galv'], bevel=0.005)
    # --- mastil con el puck en el techo
    if con_puck:
        MX, MY = ox + 6.4, oy - 2.0
        z_techo = 8.00 - (abs(MY - oy) / 4.7) * 0.9
        mastil('MASTIL_TECHO', MX, MY, z_techo - 0.05, 2.70, r=0.040, P=P)
        for sy, dz in ((-0.30, 0.55), (0.30, 0.55)):
            box('MASTIL_RIOSTRA_%d' % int(sy * 10), 0.030, 0.60, 0.030,
                (MX, MY + sy, z_techo + dz), rot=(R(38 * (1 if sy > 0 else -1)), 0, 0), m=P['galv'], bevel=0.003)
        nodo_puck(MX, MY, z_techo - 0.05 + 2.70 + 0.135, P=P, pluviometro=True, etiqueta=True,
                  caja=True, sensor_nivel=False, interna=True)
    return P


# ================================================================ CENTRO COMERCIAL (edificio monitoreado)
def auto(nombre, x, y, giro=0.0, color=(0.72, 0.73, 0.75), P=None):
    """Auto generico (no marca). Da escala humana al estacionamiento."""
    P = P or paleta()
    mc = mat('M_AUTO_%s' % nombre, color, 0.32, 0.55)
    mv = mat('M_AUTOVID_%s' % nombre, (0.03, 0.04, 0.05), 0.14, 0.40)
    g = R(giro); c, s = math.cos(g), math.sin(g)

    def W(lx, ly, lz):
        return (x + lx * c - ly * s, y + lx * s + ly * c, lz)

    box(nombre + '_CARROCERIA', 4.30, 1.80, 0.62, W(0, 0, 0.62), rot=(0, 0, g), m=mc, bevel=0.05)
    box(nombre + '_CABINA', 2.20, 1.66, 0.60, W(0.15, 0, 1.20), rot=(0, 0, g), m=mc, bevel=0.05)
    box(nombre + '_VIDRIOS', 2.24, 1.70, 0.32, W(0.15, 0, 1.22), rot=(0, 0, g), m=mv, bevel=0.02)
    for sx in (1.28, -1.28):
        for sy in (0.87, -0.87):
            cyl('%s_RUEDA_%d%d' % (nombre, int(sx), int(sy)), 0.32, 0.22, W(sx, sy, 0.32),
                rot=(R(90), 0, g), v=18, m=P['negro'])
    return None

def centro_comercial(ox=0.0, oy=0.0, P=None, con_puck=True, con_parking=True, con_autos=True, con_arboles=True):
    """Edificio monitoreado: CENTRO COMERCIAL de 32 x 20 m y 7.6 m, TECHO PLANO con equipos,
    vidriera continua con interior iluminado y estacionamiento al frente.
    Es donde se concentra la gente: por eso el nodo va en su techo."""
    P = P or paleta()
    MURO = retext('concrete', 2.8, tinte=(0.885, 0.875, 0.855), factor=0.82, bump=0.22) or P['obra']
    PISO = retext('concrete_pavement_03', 2.0) or P['obra']
    ASF = retext('asphalt_03', 4.0) or P['techo']
    TIERRA = retext('dirt', 6.0) or P['tierra']
    MED = retext('concrete_pavement_03', 1.4, tinte=(0.60, 0.60, 0.615), factor=0.70, alias='M_TECHO_MEMBRANA') or P['obra']
    INTER = mat('M_INTERIOR', (0.028, 0.030, 0.034), 0.85, emis=(1.0, 0.72, 0.42), estr=0.30)
    LUZ = mat('M_LUZ_INTERIOR', (0.95, 0.92, 0.85), 0.60, emis=(1.0, 0.95, 0.85), estr=7.0)
    AN, FO, H = 32.0, 20.0, 7.60
    ZT = 0.30 + H
    # --- terreno, estacionamiento, cordones y lineas
    placa('TERRENO', 460, 460, (ox, oy, -0.02), m=TIERRA)
    box('ASFALTO', 130, 34, 0.07, (ox, oy - 26.0, 0.0), m=ASF, bevel=0)
    box('CORDON', 34.0, 0.35, 0.22, (ox, oy - 9.4, 0.11), m=PISO, bevel=0.01)
    box('VEREDA', 34.0, 2.6, 0.16, (ox, oy - 10.5, 0.06), m=PISO, bevel=0.01)
    for k in range(13):
        box('LINEA_%02d' % k, 5.0, 0.12, 0.02, (ox - 30 + k * 5.0, oy - 14.6, 0.075), m=P['blanco'], bevel=0)
    # --- losa, muros laterales/fondo, pretil
    box('PLINTO', AN + 1.4, FO + 1.4, 0.30, (ox, oy, 0.15), m=PISO, bevel=0.012)
    box('MURO_FONDO', AN, 0.34, H, (ox, oy + FO / 2 - 0.17, 0.30 + H / 2), m=MURO)
    box('MURO_IZQ', 0.34, FO - 0.6, H, (ox - AN / 2 + 0.17, oy, 0.30 + H / 2), m=MURO)
    box('MURO_DER', 0.34, FO - 0.6, H, (ox + AN / 2 - 0.17, oy, 0.30 + H / 2), m=MURO)
    box('BASE_OSCURA', AN + 1.6, FO + 1.6, 0.66, (ox, oy, 0.63), m=P['techo'], bevel=0.008)
    box('FAJA_SOMBRA', AN + 1.55, FO + 1.55, 0.16, (ox, oy, 5.06), m=P['techo'], bevel=0.004)
    box('CORONA_CLARA', AN + 1.75, FO + 1.75, 0.34, (ox, oy, 7.58), m=MURO, bevel=0.008)
    ACC = mat('M_ACCENT', (0.05, 0.50, 0.52), 0.35, emis=(0.10, 1.0, 0.95), estr=5.0)
    # --- fachada vidriada: pilares + vidrios en dos niveles + interior iluminado
    for k in range(10):
        px = -AN / 2 + 0.30 + k * (AN - 0.6) / 9.0
        box('PILAR_%02d' % k, 0.62, 0.46, H, (ox + px, oy - FO / 2 + 0.05, 0.30 + H / 2), m=MURO, bevel=0.006)
    for k in range(9):
        px = -AN / 2 + 0.61 + (k + 0.5) * (AN - 1.22) / 9.0
        for zz, hh in ((2.05, 3.10), (5.85, 3.20)):
            box('VIDRIO_%02d_%d' % (k, int(zz * 10)), (AN - 1.22) / 9.0 - 0.30, 0.06, hh,
                (ox + px, oy - FO / 2 + 0.05, zz), m=P['vidrio_ventana'], bevel=0.008)
        box('MONTANTE_%02d' % k, 0.09, 0.14, H - 0.7, (ox + px + (AN - 1.22) / 18.0, oy - FO / 2 + 0.04, 0.30 + H / 2),
            m=P['techo'], bevel=0)
    box('DINTEL', AN, 0.50, 0.62, (ox, oy - FO / 2 + 0.05, 0.60), m=MURO, bevel=0.006)
    # --- alero horizontal partido (no cruza el volumen de acceso)
    for s in (1, -1):
        box('ALERO_%d' % s, 10.2, 1.70, 0.26, (ox + s * 11.5, oy - FO / 2 - 0.72, 4.94), m=MURO, bevel=0.008)
        box('ALERO_BORDE_%d' % s, 10.2, 0.16, 0.36, (ox + s * 11.5, oy - FO / 2 - 1.54, 4.94), m=P['techo'], bevel=0.006)
    box('INTERIOR', AN - 4.0, FO - 3.0, H - 1.4, (ox, oy + 0.4, 0.30 + H / 2 - 0.2), m=INTER)
    box('INTERIOR_VIDRIO', AN - 1.6, 0.30, 6.20, (ox, oy - FO / 2 + 1.90, 4.30), m=INTER)
    for zz in (3.35, 7.05):
        box('TIRA_LUZ_%d' % int(zz * 10), AN - 3.0, 0.34, 0.16, (ox, oy - FO / 2 + 1.55, zz), m=LUZ, bevel=0)
    # --- acceso: marquesina, puertas, cartel
    # --- volumen de acceso: caja de vidrio de doble altura que sobresale
    box('ACC_BASE', 12.4, 2.8, 0.18, (ox, oy - FO / 2 - 1.10, 0.39), m=P['techo'], bevel=0.008)
    box('ACC_LOSA', 12.4, 2.8, 0.34, (ox, oy - FO / 2 - 1.10, 7.62), m=MURO, bevel=0.008)
    for sx in (1, -1):
        box('ACC_PIL_%d' % sx, 0.48, 2.8, 7.30, (ox + sx * 5.95, oy - FO / 2 - 1.10, 4.02), m=MURO, bevel=0.006)
    box('ACC_VIDRIO_F', 11.4, 0.09, 7.00, (ox, oy - FO / 2 - 2.44, 4.02), m=P['vidrio_ventana'], bevel=0.006)
    for sx in (1, -1):
        box('ACC_VIDRIO_L%d' % sx, 0.09, 2.6, 7.00, (ox + sx * 5.98, oy - FO / 2 - 1.10, 4.02),
            m=P['vidrio_ventana'], bevel=0.006)
    for k in range(5):
        box('ACC_MONT_%d' % k, 0.10, 0.18, 7.10, (ox - 4.6 + k * 2.30, oy - FO / 2 - 2.46, 4.02), m=P['techo'], bevel=0)
    box('ACC_DINTEL', 12.4, 0.26, 0.45, (ox, oy - FO / 2 - 2.44, 7.28), m=P['techo'], bevel=0.006)
    box('ACC_LED', 12.2, 0.12, 0.12, (ox, oy - FO / 2 - 2.50, 7.06), m=ACC, bevel=0)
    for sx in (1, -1):
        box('ACC_LED_L%d' % sx, 0.12, 2.4, 0.12, (ox + sx * 6.02, oy - FO / 2 - 1.10, 7.06), m=ACC, bevel=0)
    box('PUERTAS', 7.4, 0.12, 3.30, (ox, oy - FO / 2 - 0.06, 1.95), m=P['vidrio_ventana'], bevel=0.01)
    for dx in (-3.6, -1.2, 1.2, 3.6):
        box('PUERTA_MONT_%d' % int(dx * 10), 0.10, 0.20, 3.40, (ox + dx, oy - FO / 2 - 0.06, 1.95), m=P['techo'], bevel=0)
    box('CARTEL_BANDA', 15.5, 0.20, 1.55, (ox, oy - FO / 2 - 0.10, 6.55), m=P['techo'], bevel=0.008)
    texto('TXT_CC', 'CENTRO COMERCIAL', 0.86, (ox - 0.4, oy - FO / 2 - 0.24, 6.60), rot=(R(90), 0, 0), m=P['blanco'])
    box('PLACA_ENCUENTRO', 4.6, 0.08, 0.66, (ox - 11.0, oy - FO / 2 - 0.14, 2.90), m=P['blanco'], bevel=0.006)
    texto('TXT_ENC', 'PUNTO DE ENCUENTRO', 0.24, (ox - 11.0, oy - FO / 2 - 0.19, 3.00), rot=(R(90), 0, 0), m=P['pintura'])
    texto('TXT_ENC2', 'SIRT - SINAPRED', 0.17, (ox - 11.0, oy - FO / 2 - 0.19, 2.74), rot=(R(90), 0, 0), m=P['terracota'])
    # (los carteles de locales se quitaron: sumaban ruido y no se leian)
    # --- totem luminoso de acceso (alto y fino, como corresponde)
    TX, TY = ox + 21.0, oy - 18.5
    box('TOTEM_BASE', 1.30, 1.30, 0.40, (TX, TY, 0.20), m=P['techo'], bevel=0.012)
    box('TOTEM_FUSTE', 0.76, 0.76, 8.20, (TX, TY, 4.30), m=MURO, bevel=0.008)
    box('TOTEM_BANDA', 0.86, 0.86, 1.30, (TX, TY, 7.60), m=ACC, bevel=0.008)
    texto('TXT_TOTEM_A', 'CENTRO', 0.24, (TX, TY - 0.44, 7.78), rot=(R(90), 0, 0), m=P['blanco'])
    texto('TXT_TOTEM_B', 'COMERCIAL', 0.16, (TX, TY - 0.44, 7.46), rot=(R(90), 0, 0), m=P['blanco'])
    box('TOTEM_TAPA', 0.86, 0.86, 0.16, (TX, TY, 8.42), m=P['techo'], bevel=0.008)
    box('TOTEM_LED', 0.10, 0.10, 6.10, (TX - 0.41, TY, 3.35), m=ACC, bevel=0)
    # --- techo PLANO: losa, pretil, equipos de A/A, ductos, tanque, caseta de escalera, antena
    box('TECHO_LOSA', AN + 1.0, FO + 1.0, 0.26, (ox, oy, ZT + 0.13), m=MED, bevel=0.008)
    for (sx, sy, lx, ly) in ((0, -1, AN + 1.0, 0.26), (0, 1, AN + 1.0, 0.26), (-1, 0, 0.26, FO + 1.0), (1, 0, 0.26, FO + 1.0)):
        box('PRETIL_%d%d' % (sx, sy), lx, ly, 1.15,
            (ox + sx * (AN + 1.0) / 2, oy + sy * (FO + 1.0) / 2, ZT + 1.05), m=MURO, bevel=0.008)
    bp = P['galv']
    for k, (dx, dy, g) in enumerate(((-12.5, 6.0, 0), (-9.2, 7.0, 90), (8.5, 6.2, 0), (11.4, 4.0, 90)), 0):
        box('AA_%d' % k, 2.70, 1.90, 1.15, (ox + dx, oy + dy, ZT + 0.85), rot=(0, 0, R(g)), m=bp, bevel=0.01)
        cyl('AA_FAN_%d' % k, 0.78, 0.14, (ox + dx, oy + dy, ZT + 1.48), v=28, m=P['techo'])
        tor('AA_ARO_%d' % k, 0.82, 0.040, (ox + dx, oy + dy, ZT + 1.44), m=P['inox'])
        cyl('AA_REJ_%d' % k, 0.60, 0.10, (ox + dx, oy + dy, ZT + 1.53), v=28, m=P['negro'])
    # --- huerto solar en la cubierta: 2 filas de paneles INCLINADOS (18°, mirando al sol)
    for fila, dy in enumerate((-6.2, -2.8)):
        for k in range(5):
            panel_solar('PV_TECHO_%d_%d' % (fila, k), ox - 12.0 + k * 2.15, oy + dy, ZT + 0.72,
                        1.90, 1.10, tilt=18.0, P=P)
        box('PV_RAIL_%d' % fila, 10.9, 0.09, 0.09, (ox - 8.7, oy + dy - 0.34, ZT + 0.34), m=P['galv'], bevel=0.004)
        for k in range(3):
            cyl('PV_PIE_%d_%d' % (fila, k), 0.045, 0.52, (ox - 12.0 + k * 4.3, oy + dy + 0.44, ZT + 0.52),
                v=12, m=P['galv'])
    for k, (dx, dy) in enumerate(((-2.0, 6.6), (0.6, 6.6))):
        box('DUCTO_%d' % k, 0.62, 0.62, 1.90, (ox + dx, oy + dy, ZT + 1.20), m=P['galv'], bevel=0.008)
    cyl('TANQUE_TECHO', 0.85, 1.70, (ox - 4.0, oy + 5.4, ZT + 1.80), v=40, m=P['blanco'])
    cyl('TANQUE_TECHO_T', 0.87, 0.10, (ox - 4.0, oy + 5.4, ZT + 2.68), v=40, m=P['negro'])
    box('CASETA', 5.0, 4.0, 2.90, (ox - 12.0, oy + 3.0, ZT + 1.45), m=MURO, bevel=0.01)
    box('CASETA_TAPA', 5.3, 4.3, 0.22, (ox - 12.0, oy + 3.0, ZT + 2.98), m=P['techo'], bevel=0.01)
    box('CASETA_PUERTA', 1.10, 0.10, 2.20, (ox - 12.0, oy + 1.02, ZT + 1.20), m=P['techo'], bevel=0.006)
    cone('ANTENA_PARR', 0.10, 1.15, 0.55, (ox + 3.0, oy + 5.6, ZT + 2.25), rot=(R(55), 0, 0), v=28, m=P['blanco'])
    cyl('ANTENA_PARR_M', 0.035, 1.10, (ox + 3.0, oy + 5.6, ZT + 1.30), v=16, m=P['galv'])
    # --- estacionamiento: autos y arboles
    if con_autos:
        for k, (dx, dy, g, col) in enumerate(((-25.0, -16.5, 8, (0.60, 0.61, 0.63)), (21.0, -16.5, -6, (0.26, 0.29, 0.33)))):
            auto('AUTO_%d' % k, ox + dx, oy + dy, giro=g, color=col, P=P)
    if con_arboles:
        for k, (dx, dy, h) in enumerate(((-31.0, -13.0, 5.4), (-28.0, 7.0, 4.6), (-6.0, 17.0, 4.8), (14.0, 18.0, 5.4))):
            arbol('ARBOL_%d' % k, ox + dx, oy + dy, h=h, P=P, copa=(0.030, 0.068, 0.026), tronco=(0.10, 0.075, 0.055))
    # --- mastil con el nodo 360 en el techo
    if con_puck:
        MX, MY = ox + 9.0, oy - 3.0
        mastil('MASTIL_TECHO', MX, MY, ZT + 0.24, 2.90, r=0.045, P=P)
        for sy in (-0.34, 0.34):
            box('MASTIL_RIOSTRA_%d' % int(sy * 100), 0.035, 0.70, 0.035,
                (MX, MY + sy, ZT + 0.75), rot=(R(40 * (1 if sy > 0 else -1)), 0, 0), m=P['galv'], bevel=0.003)
        nodo_puck(MX, MY, ZT + 0.24 + 2.90 + 0.135, P=P, pluviometro=True, etiqueta=True,
                  caja=True, sensor_nivel=False, interna=True)
    return P


# ================================================================ MATERIAL DE RODAJE (video)
OUTV = os.path.join(ROOT, "presentacion", "video")

def seguir(cam, centro):
    """Empty + constraint TRACK_TO: la camara mira siempre al centro aunque se mueva."""
    e = bpy.data.objects.get('TGT_' + cam.name)
    if e is None:
        e = bpy.data.objects.new('TGT_' + cam.name, None)
        bpy.context.scene.collection.objects.link(e)
        c = cam.constraints.new('TRACK_TO')
        c.target = e
        c.track_axis = 'TRACK_NEGATIVE_Z'
        c.up_axis = 'UP_Y'
    e.location = centro
    return e

def _lineal(obj):
    ad = obj.animation_data
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'

def orbita(cam, centro, radio, altura, f0, f1, a0=0.0, a1=360.0, tgt=None):
    """Orbita de camara alrededor de centro (grados a0 -> a1) con arranque/frenado suaves."""
    tgt = tgt or centro
    e = seguir(cam, tgt)
    n = float(f1 - f0)
    for k in range(int(n) + 1):
        t = k / n
        g = t * t * (3 - 2 * t)
        a = R(a0 + (a1 - a0) * g)
        cam.location = (centro[0] + radio * math.cos(a), centro[1] + radio * math.sin(a), altura)
        cam.keyframe_insert('location', frame=f0 + k)
    _lineal(cam); _lineal(e)
    return cam

def vuelo(cam, p0, p1, f0, f1, t0=None, t1=None):
    """Vuelo de camara p0 -> p1 (y opcionalmente el punto mirado t0 -> t1)."""
    t0 = t0 or p0
    t1 = t1 or p1
    e = seguir(cam, t0)
    n = float(f1 - f0)
    for k in range(int(n) + 1):
        t = k / n
        g = t * t * (3 - 2 * t)
        cam.location = tuple(p0[i] + (p1[i] - p0[i]) * g for i in range(3))
        cam.keyframe_insert('location', frame=f0 + k)
        e.location = tuple(t0[i] + (t1[i] - t0[i]) * g for i in range(3))
        e.keyframe_insert('location', frame=f0 + k)
    _lineal(cam); _lineal(e)
    return cam

def video_prep(ancho=1920, alto=1080, fps=24, muestras=24, transparente=False):
    sc = bpy.context.scene
    sc.render.fps = fps
    sc.render.resolution_x = ancho
    sc.render.resolution_y = alto
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = transparente
    sc.render.image_settings.file_format = 'FFMPEG'
    sc.render.ffmpeg.format = 'MPEG4'
    sc.render.ffmpeg.codec = 'H264'
    sc.render.ffmpeg.constant_rate_factor = 'HIGH'
    sc.render.ffmpeg.ffmpeg_preset = 'GOOD'
    sc.render.ffmpeg.gopsize = 12
    try:
        sc.eevee.taa_render_samples = muestras
    except Exception:
        pass
    return sc

def video(nombre, cam, f0, f1, muestras=24, ancho=1920, alto=1080, fps=24):
    """Renderiza la animacion f0..f1 a presentacion/video/<nombre>.mp4"""
    if not os.path.isdir(OUTV):
        os.makedirs(OUTV)
    sc = video_prep(ancho=ancho, alto=alto, fps=fps, muestras=muestras)
    sc.camera = cam
    sc.frame_start = f0
    sc.frame_end = f1
    sc.render.filepath = os.path.join(OUTV, nombre)
    t0 = time.time()
    bpy.ops.render.render(animation=True)
    return os.path.join(OUTV, nombre + '.mp4'), round(time.time() - t0, 1)
