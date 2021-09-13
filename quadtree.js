var sqrt2 = Math.sqrt(2)/2;

//add in vertices and indices of geometry
//run with Node.js

var vertices = [];
var indices = [];

function scale(a, b){
    return [a[0]*b, a[1]*b, a[2]*b];
};
function dot (a, b){
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
function subtract(a, b){
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
};
function add(a, b){
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function cross(a, b){
    return [
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0]
    ];
};

function subdivide(data, location) {
    //compute x and y position
    var w = 64, cx = 0, cy = 0, cz = 0;
    for(var i = 0; i < location.length; i ++){
        var j = location[i];
        var ix = j & 1;
        var iy = (j >> 1) & 1;
        var iz = j >> 2;
        w >>= 1;
        cx += ix*w;
        cy += iy*w;
        cz += iz*w;
    }
    var r = sqrt2*w;
    cx += w/2;
    cy += w/2;
    cz += w/2;

    var newData = [];
    for(var i = 0; i < data.length; i ++){
        var j = data[i];
        var k = j*3;

        var separated = 0;
        var nodes = [
            [
                vertices[indices[k    ]*3    ] - cx,
                vertices[indices[k    ]*3 + 1] - cy,
                vertices[indices[k    ]*3 + 2] - cz
            ],
            [
                vertices[indices[k + 1]*3    ] - cx,
                vertices[indices[k + 1]*3 + 1] - cy,
                vertices[indices[k + 1]*3 + 2] - cz
            ],
            [
                vertices[indices[k + 2]*3    ] - cx,
                vertices[indices[k + 2]*3 + 1] - cy,
                vertices[indices[k + 2]*3 + 2] - cz
            ]
        ];

        //test plane
        var normal = cross(subtract(nodes[1], nodes[0]), subtract(nodes[2], nodes[0]));
        var n = dot(nodes[0], normal);
        var d = dot(normal, normal);
        separated |= n*n > r*r*d;

        for(var a = 0, c = 2; a < 3; c = a ++){
            if(separated){
                break;
            }

            //test vertex
            var b = (a + 1)%3;
            var axis = dot(nodes[a], nodes[a]) > r*r;
            axis &= dot(subtract(nodes[b], nodes[a]), nodes[a]) > 0;
            axis &= dot(subtract(nodes[c], nodes[a]), nodes[a]) > 0;
            separated |= axis;
            if(separated){
                break;
            }

            //test edge
            var delta = subtract(nodes[c], nodes[a]);//edge
            var n = dot(delta, nodes[c]);//numerator
            var d = dot(delta, delta);//denominator
            //closest point to sphere
            var p0 = add(scale(nodes[c], d), scale(delta, -n));
            //point opposite to edge
            var p1 = subtract(scale(nodes[b], d), p0);
            //test axis
            var axis = dot(p0, p0) > d*d*r*r;
            axis &= dot(p0, p1) > 0;
            separated |= axis;
        }

        if(!separated){
            newData.push(j);
        }
    }
    if(newData.length){
        if(location.length>5){
            return {data:newData};
        }else{
            return [
                subdivide(newData, location.concat([0])),
                subdivide(newData, location.concat([1])),
                subdivide(newData, location.concat([2])),
                subdivide(newData, location.concat([3])),
                subdivide(newData, location.concat([4])),
                subdivide(newData, location.concat([5])),
                subdivide(newData, location.concat([6])),
                subdivide(newData, location.concat([7]))
            ];
        }
    }
};

var data = [];
for(var i = 0; i < indices.length/3; i ++){
    data[i] = i;
}

var quadtree = [
    subdivide(data, [0]),
    subdivide(data, [1]),
    subdivide(data, [2]),
    subdivide(data, [3]),
    subdivide(data, [4]),
    subdivide(data, [5]),
    subdivide(data, [6]),
    subdivide(data, [7])
];


/*var quadString = "";
function recursive (data){
    for(var i = 0; i < data.length; i ++){
        var cur = data[i];
        if(cur){
            if(cur.data){
                cur = cur.data;
                quadString += "g";
                for(var j = 0; j < cur.length; j ++){
                    quadString += cur[j].toString(16).padStart(3, "0");
                }
            }else{
                quadString += "h";
                recursive(cur);
            }
        }else{
            quadString += "g";
        }
    }
};
recursive(quadtree);*/

const fs = require('fs');
var data = JSON.stringify(quadtree);
fs.writeFile('quadtree.json', data, (err) => {
    if (err) {
        throw err;
    }
    console.log("JSON data is saved.");
});