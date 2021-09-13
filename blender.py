#use this in blender text editor
#import bpy
import bpy

path = "C:\Users\potato master\Documents\WinstonRiders21\lev0"

#my house
house = bpy.context.object.data
uv_layer = house.uv_layers.active.data

#basics
triangles = []
vertices = []
uv = []

#(the house is already split into triangles)
for i0, tri in enumerate(house.polygons):
   triangles.append([])#create a list
   for loop_index in range(tri.loop_start, tri.loop_start+tri.loop_total):
       i1 = house.loops[loop_index].vertex_index#vertex index

       triangles[i0].append(i1)#add vertex index to triangle (all I want)
       vertices.append(house.vertices[i1])#add vertex
       uv.append(uv_layer[loop_index].uv)#add uv
#new arrays
newvertices = []
newuv = []

skip = []#contain indices that should be skipped

#-1 means it should not be skipped
for i in range(len(vertices)):
   skip.append(-1)

#loop through vertices
for i, vert0 in enumerate(vertices):
   if skip[i] == -1:
       index = len(newvertices)#amount of new vertices

       skip[i] = index#this index routs to the newest vertex
       
       #create new vertex and uv
       uv0 = uv[i]
       newvertices.append(vert0)
       newuv.append(uv0)
       
       #loop through remaning vertices
       for j in range(i+1, len(vertices)):

           #create vertex2 and uv2 for testing
           vert1 = vertices[j]
           uv1 = uv[j]

           #if vertex1 is vertex2
           if vert0.co == vert1.co:
               #if both vertices have the same uv
               if uv0 == uv1:
                   #mark this index as skippable and rout it to the newest vertex
                   skip[j] = index
       
vertex_str = ""
normal_str = ""
triangle_str = ""
uv_str = ""

for vertex in newvertices:
   vertex_str += "{:1.3f},{:1.3f},{:1.3f},".format(vertex.co[0],vertex.co[1],vertex.co[2])
   normal_str += "{:1.3f},{:1.3f},{:1.3f},".format(vertex.normal[0],vertex.normal[1],vertex.normal[2])
for tri in skip:
   triangle_str += "%d,"%tri
for uv in newuv:
   uv_str += "{:1.3f},{:1.3f},".format(uv[0], uv[1])


f = open("%s/indices.txt"%path, "w")
f.write(triangle_str)
f.close()
f = open("%s/vertices.txt"%path, "w")
f.write(vertex_str)
f.close()
f = open("%s/normals.txt"%path, "w")
f.write(normal_str)
f.close()
f = open("%s/textureCoords.txt"%path, "w")
f.write(uv_str)