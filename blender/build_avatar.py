"""Builds a stylised chibi bust of Nurarat and exports public/models/avatar.glb.

Run:  blender --background --python blender/build_avatar.py
The head and everything on it is parented to an Empty named "Head" (pivot at the neck),
so the website can rotate it to follow the cursor.
"""
import math, os, sys
import bpy, bmesh
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_GLB = os.path.join(ROOT, "public", "models", "avatar.glb")
OUT_BLEND = os.path.join(ROOT, "blender", "avatar.blend")
PREVIEW = os.path.join(ROOT, "blender", "preview.png")

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------- helpers ----------
def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)

def mat(name, hexcol, rough=0.55, emission=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb(hexcol)
    b.inputs["Roughness"].default_value = rough
    if emission:
        b.inputs["Emission Color"].default_value = srgb(hexcol)
        b.inputs["Emission Strength"].default_value = emission
    return m

def stripe_mat():
    # Horizontal black stripes on cream, as an image so it survives glTF export.
    w, h = 16, 256
    img = bpy.data.images.new("stripes", w, h)
    cream, ink = srgb("#F3EEE8"), srgb("#1B1B22")
    px = []
    for y in range(h):
        col = ink if (y % 16) < 5 else cream
        px.extend(list(col) * w)
    img.pixels = px
    img.pack()
    m = bpy.data.materials.new("Top_Stripes")
    m.use_nodes = True
    nt = m.node_tree
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Closest"
    b = nt.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = 0.8
    nt.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    return m

def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True

def sphere(name, loc, scale, material, segs=48, rings=24, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segs, ring_count=rings, radius=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    smooth(o)
    if parent:
        set_parent(o, parent)
    return o

def set_parent(o, parent):
    mw = o.matrix_world.copy()
    o.parent = parent
    o.matrix_world = mw

def bisect(o, co, no, keep="above"):
    """Cut the mesh exactly along a plane (world point / normal) and delete the unwanted side."""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bpy.context.view_layer.update()
    local_co = o.matrix_world.inverted() @ Vector(co)
    n = Vector(no).normalized()
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=local_co, plane_no=n)
    eps = 1e-5
    if keep == "above":
        doomed = [v for v in bm.verts if (v.co - local_co).dot(n) < -eps]
    else:
        doomed = [v for v in bm.verts if (v.co - local_co).dot(n) > eps]
    bmesh.ops.delete(bm, geom=doomed, context="VERTS")
    bm.to_mesh(o.data)
    bm.free()

def solidify(o, t=0.02):
    m = o.modifiers.new("solid", "SOLIDIFY")
    m.thickness = t
    m.offset = 1

# ---------- materials ----------
SKIN = mat("Skin", "#E9B791", 0.6)
SKIN_SHADE = mat("SkinShade", "#D99E79", 0.6)
HAIR = mat("Hair", "#17120F", 0.45)
EYE = mat("Eye", "#1A1210", 0.25)
WHITE = mat("Highlight", "#FFFFFF", 0.2, emission=0.6)
BLUSH = mat("Blush", "#F08C8C", 0.7)
MOUTH = mat("Mouth", "#8E2B2B", 0.5)
TEETH = mat("Teeth", "#FAF7F2", 0.35)
LIPS = mat("Lips", "#C4555A", 0.45)
BROW = mat("Brow", "#241A16", 0.6)
TOP = stripe_mat()

# ---------- body ----------
body = sphere("Body", (0, 0.02, 0.3), (0.72, 0.4, 0.46), TOP)
bisect(body, (0, 0, 0.0), (0, 0, 1), keep="above")
neck = sphere("Neck", (0, 0.02, 0.8), (0.12, 0.12, 0.2), SKIN, 32, 16)
collar = sphere("NeckShade", (0, -0.02, 0.74), (0.14, 0.1, 0.06), SKIN_SHADE, 32, 12)

# ---------- head rig ----------
bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0.88))
head = bpy.context.active_object
head.name = "Head"

HC = Vector((0, 0, 1.33))  # head centre
skull = sphere("Face", HC, (0.48, 0.45, 0.5), SKIN, parent=head)

# hair: back volume reaching the shoulders
back = sphere("HairBack", (0, 0.1, 1.18), (0.57, 0.46, 0.66), HAIR, parent=head)
bisect(back, (0, -0.1, 1.2), (0, 1, 0.12), keep="above")  # keep only the part behind the face
# hair cap over the top of the head
cap = sphere("HairCap", HC + Vector((0, 0.015, 0.02)), (0.5, 0.475, 0.52), HAIR, parent=head)
bisect(cap, HC + Vector((0, 0, 0.12)), (0, 0.55, 1), keep="above")
# bangs: a band across the forehead, cut with a slightly wavy fringe
solidify(cap, 0.015)
bangs = sphere("Bangs", HC + Vector((0, -0.01, 0.03)), (0.497, 0.468, 0.512), HAIR, 64, 32, parent=head)
bisect(bangs, HC + Vector((0, 0, 0.19)), (0, -0.15, 1), keep="above")
solidify(bangs, 0.02)
solidify(back, 0.02)
# side strands framing the face
for side in (-1, 1):
    s = sphere(f"Strand{side}", (side * 0.42, -0.1, 1.02), (0.12, 0.14, 0.46), HAIR, 32, 16, parent=head)
    s.rotation_euler = (0, side * -0.12, 0)

# eyes: happy smiling eyes (slightly squashed), with highlights
for side in (-1, 1):
    x = side * 0.17
    e = sphere(f"Eye{side}", (x, -0.415, 1.31), (0.055, 0.03, 0.072), EYE, 32, 16, parent=head)
    sphere(f"EyeHi{side}", (x + 0.018, -0.44, 1.335), (0.016, 0.01, 0.016), WHITE, 16, 8, parent=head)
    sphere(f"Blush{side}", (side * 0.29, -0.37, 1.19), (0.075, 0.03, 0.04), BLUSH, 24, 12, parent=head)
    b = sphere(f"Brow{side}", (x, -0.43, 1.43), (0.07, 0.015, 0.014), BROW, 16, 8, parent=head)
    b.rotation_euler = (0, side * 0.12, 0)

# nose
sphere("Nose", (0, -0.47, 1.23), (0.035, 0.03, 0.028), SKIN_SHADE, 16, 8, parent=head)

# open smile: half disc + teeth strip + lip rim
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.085, depth=0.03, location=(0, -0.445, 1.14), rotation=(math.pi / 2, 0, 0))
m = bpy.context.active_object
m.name = "Mouth"
m.scale = (1.0, 0.75, 1.0)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bisect(m, (0, -0.445, 1.14), (0, 0, 1), keep="below")
m.data.materials.append(MOUTH)
set_parent(m, head)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.463, 1.127))
t = bpy.context.active_object
t.name = "Teeth"
t.scale = (0.13, 0.008, 0.022)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
t.data.materials.append(TEETH)
set_parent(t, head)

# ---------- export ----------
bpy.ops.object.select_all(action="DESELECT")
os.makedirs(os.path.dirname(OUT_GLB), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", export_apply=True, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

# ---------- preview render ----------
if "--preview" in sys.argv:
    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb("#F42A1E")
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6
    scene.world = world
    bpy.ops.object.light_add(type="AREA", location=(1.6, -2.4, 2.6))
    key = bpy.context.active_object
    key.data.energy = 600
    key.data.size = 2.5
    key.rotation_euler = (math.radians(55), 0, math.radians(32))
    bpy.ops.object.light_add(type="AREA", location=(-2, -1.5, 1.6))
    fill = bpy.context.active_object
    fill.data.energy = 200
    fill.data.size = 3
    fill.rotation_euler = (math.radians(70), 0, math.radians(-50))
    bpy.ops.object.camera_add(location=(0.9, -3.6, 1.35))
    cam = bpy.context.active_object
    cam.data.lens = 60
    d = Vector((0, 0, 0.95)) - cam.location
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT", "BLENDER_WORKBENCH"):
        try:
            scene.render.engine = eng
            break
        except TypeError:
            continue
    scene.render.resolution_x = 800
    scene.render.resolution_y = 900
    scene.render.filepath = PREVIEW
    bpy.ops.render.render(write_still=True)

print("AVATAR_DONE", OUT_GLB, scene.render.engine)
