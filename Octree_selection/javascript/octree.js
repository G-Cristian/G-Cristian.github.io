
var initOctree = function (meshVertices, octree, level, gl) {
    // create vertices for drawing
    octree.vertices = [
        //front
        octree.left, octree.bottom, octree.front,
        octree.right, octree.bottom, octree.front,
        octree.right, octree.top, octree.front,
        octree.left, octree.top, octree.front,
        octree.left, octree.bottom, octree.front,
        //bottom
        octree.left, octree.bottom, octree.front,
        octree.left, octree.bottom, octree.back,
        octree.right, octree.bottom, octree.back,
        octree.right, octree.bottom, octree.front,
        octree.left, octree.bottom, octree.front,
        //top
        octree.left, octree.top, octree.front,
        octree.right, octree.top, octree.front,
        octree.right, octree.top, octree.back,
        octree.left, octree.top, octree.back,
        octree.left, octree.top, octree.front,
        //back
        octree.right, octree.bottom, octree.back,
        octree.left, octree.bottom, octree.back,
        octree.left, octree.top, octree.back,
        octree.right, octree.top, octree.back,
        octree.right, octree.bottom, octree.back,
        //left
        octree.left, octree.bottom, octree.back,
        octree.left, octree.bottom, octree.front,
        octree.left, octree.top, octree.front,
        octree.left, octree.top, octree.back,
        octree.left, octree.bottom, octree.back,
        //right
        octree.right, octree.bottom, octree.front,
        octree.right, octree.bottom, octree.back,
        octree.right, octree.top, octree.back,
        octree.right, octree.top, octree.front,
        octree.right, octree.bottom, octree.front
    ];

    octree.VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, octree.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(octree.vertices), gl.STATIC_DRAW);

    octree.children = [];

    if (level > 1) {
        var c1 = {};
        c1.left = octree.left;
        c1.right = (octree.left + octree.right) / 2.0;
        c1.bottom = octree.bottom;
        c1.top = (octree.top + octree.bottom) / 2.0;
        c1.front = octree.front;
        c1.back = (octree.front + octree.back) / 2.0;
        c1.meshIndices = [];

        var c2 = {};
        c2.left = (octree.left + octree.right) / 2.0;
        c2.right = octree.right;
        c2.bottom = octree.bottom;
        c2.top = (octree.top + octree.bottom) / 2.0;
        c2.front = octree.front;
        c2.back = (octree.front + octree.back) / 2.0;
        c2.meshIndices = [];

        var c3 = {};
        c3.left = octree.left;
        c3.right = (octree.left + octree.right) / 2.0;
        c3.bottom = (octree.top + octree.bottom) / 2.0;
        c3.top = octree.top;
        c3.front = octree.front;
        c3.back = (octree.front + octree.back) / 2.0;
        c3.meshIndices = [];

        var c4 = {};
        c4.left = (octree.left + octree.right) / 2.0;
        c4.right = octree.right;
        c4.bottom = (octree.top + octree.bottom) / 2.0;
        c4.top = octree.top;
        c4.front = octree.front;
        c4.back = (octree.front + octree.back) / 2.0;
        c4.meshIndices = [];

        var c5 = {};
        c5.left = octree.left;
        c5.right = (octree.left + octree.right) / 2.0;
        c5.bottom = octree.bottom;
        c5.top = (octree.top + octree.bottom) / 2.0;
        c5.front = (octree.front + octree.back) / 2.0;
        c5.back = octree.back;
        c5.meshIndices = [];

        var c6 = {};
        c6.left = (octree.left + octree.right) / 2.0;
        c6.right = octree.right;
        c6.bottom = octree.bottom;
        c6.top = (octree.top + octree.bottom) / 2.0;
        c6.front = (octree.front + octree.back) / 2.0;
        c6.back = octree.back;
        c6.meshIndices = [];

        var c7 = {};
        c7.left = octree.left;
        c7.right = (octree.left + octree.right) / 2.0;
        c7.bottom = (octree.top + octree.bottom) / 2.0;
        c7.top = octree.top;
        c7.front = (octree.front + octree.back) / 2.0;
        c7.back = octree.back;
        c7.meshIndices = [];

        var c8 = {};
        c8.left = (octree.left + octree.right) / 2.0;
        c8.right = octree.right;
        c8.bottom = (octree.top + octree.bottom) / 2.0;
        c8.top = octree.top;
        c8.front = (octree.front + octree.back) / 2.0;
        c8.back = octree.back;
        c8.meshIndices = [];

        //octree.children = [c1, c2, c3, c4, c5, c6, c7, c8];
        var octreeChildrens = [c1, c2, c3, c4, c5, c6, c7, c8];
        for (var j = 0; j < octreeChildrens.length; j++) {
            //octree.children[j].meshIndices = [];
            octreeChildrens[j].meshIndices = [];
            //var tmpVert = [];
            for (var i = 0; i < octree.meshIndices.length; i++) {
                index = octree.meshIndices[i];
                if (octreeChildrens[j].left <= meshVertices[index * 3 + 0] && meshVertices[index * 3 + 0] <= octreeChildrens[j].right &&
                    octreeChildrens[j].bottom <= meshVertices[index * 3 + 1] && meshVertices[index * 3 + 1] <= octreeChildrens[j].top &&
                    octreeChildrens[j].back <= meshVertices[index * 3 + 2] && meshVertices[index * 3 + 2] <= octreeChildrens[j].front) {

                    //tmpVert.push(meshVertices[index * 3 + 0]);
                    //tmpVert.push(meshVertices[index * 3 + 1]);
                    //tmpVert.push(meshVertices[index * 3 + 2]);
                    //octree.children[j].meshIndices.push(index);
                    octreeChildrens[j].meshIndices.push(index);
                }
            }
            if (octreeChildrens[j].meshIndices.length > 0) {
                initOctree(meshVertices, octreeChildrens[j], level - 1, gl);
                octree.children.push(octreeChildrens[j]);
            }
        }
    }
};

var createOctree = function (meshVertices, level, gl) {
    var octree = {};
    octree.left = 100;
    octree.bottom = 100;
    octree.front = -1;
    octree.right = -1;
    octree.top = -1;
    octree.back = 100;

    for (var i = 0; i < meshVertices.length; i += 3) {
        if (meshVertices[i] < octree.left) {
            octree.left = meshVertices[i];
        }
        else if (meshVertices[i] > octree.right) {
            octree.right = meshVertices[i];
        }

        if (meshVertices[i + 1] < octree.bottom) {
            octree.bottom = meshVertices[i+1];
        }
        else if (meshVertices[i + 1] > octree.top) {
            octree.top = meshVertices[i+1];
        }

        if (meshVertices[i + 2] < octree.back) {
            octree.back = meshVertices[i + 2];
        }
        else if (meshVertices[i + 2] > octree.front) {
            octree.front = meshVertices[i + 2];
        }
    }

    octree.meshIndices = [];
    for (var i = 0; i < meshVertices.length / 3; i += 1) {
        octree.meshIndices.push(i);
    }

    initOctree(meshVertices, octree, level, gl);

    return octree;
};

var drawOctree = function (octree, level, program, gl, mWorld, mView, mProj) {
    if (level < 0) {
        return;
    }

    gl.useProgram(program);

    var worldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var viewUniformLocation = gl.getUniformLocation(program, 'mView');
    var projUniformLocation = gl.getUniformLocation(program, 'mProj');

    gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, mWorld);
    gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, mView);
    gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, mProj);

    var draw = function (currentoctree, currentLevel) {
        if (currentLevel == 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, currentoctree.VBO);
            positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
            gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
            gl.enableVertexAttribArray(positionAttribLocation);

            gl.drawArrays(gl.LINE_STRIP, 0, 5);
            gl.drawArrays(gl.LINE_STRIP, 5, 5);
            gl.drawArrays(gl.LINE_STRIP, 10, 5);
            gl.drawArrays(gl.LINE_STRIP, 15, 5);
            gl.drawArrays(gl.LINE_STRIP, 20, 5);
            gl.drawArrays(gl.LINE_STRIP, 25, 5);
        }
        else {
            if (currentoctree.children) {
                for (var i = 0; i < currentoctree.children.length; i++) {
                    draw(currentoctree.children[i], currentLevel - 1);
                }
            }
        }
    };

    draw(octree, level);
};

//simple Ray-AABB intersection.
var intersection = function (octree, mWorld, rayOrigin, rayDirection, level) {
    if (level < 0) {
        return;
    }

    var matMul = function (v) {
        glMatrix.vec4.transformMat4(v, v, mWorld);
        return v;
    };
    //left points
    //var leftBottomFront = new Float32Array([octree.left, octree.bottom, octree.front, 1.0]);
    //leftBottomFront = matMul(leftBottomFront);

    var leftBottomBack = new Float32Array([octree.left, octree.bottom, octree.back, 1.0]);
    leftBottomBack = matMul(leftBottomBack);

    //var leftTopFront = new Float32Array([octree.left, octree.top, octree.front, 1.0]);
    //leftTopFront = matMul(leftTopFront);

    //var leftTopBack = new Float32Array([octree.left, octree.top, octree.back, 1.0]);
    //leftTopBack = matMul(leftTopBack);

    //right points
    //var rightBottomFront = new Float32Array([octree.right, octree.bottom, octree.front, 1.0]);
    //rightBottomFront = matMul(rightBottomFront);

    //var rightBottomBack = new Float32Array([octree.right, octree.bottom, octree.back, 1.0]);
    //rightBottomBack = matMul(rightBottomBack);

    var rightTopFront = new Float32Array([octree.right, octree.top, octree.front, 1.0]);
    rightTopFront = matMul(rightTopFront);

    //var rightTopBack = new Float32Array([octree.right, octree.top, octree.back, 1.0]);
    //rightTopBack = matMul(rightTopBack);

    var intersect = function (tMin, tMax) {
        for (var i = 0; i < 3; i++) {
            var dirFrac = -100000000.0;
            if (rayDirection[i] != 0.0) {
                var dirFrac = 1.0 / rayDirection[i];
            }

            var t0 = (leftBottomBack[i] - rayOrigin[i]) * dirFrac;
            var t1 = (rightTopFront[i] - rayOrigin[i]) * dirFrac;

            if (dirFrac < 0.0) {
                var tmp = t0;
                t0 = t1;
                t1 = tmp;
            }

            if (t0 > tMin) {
                tMin = t0;
            }

            if (t1 < tMax) {
                tMax = t1;
            }

            if (tMax <= tMin) {
                return { inter: false, tMin: tMin, tMax:tMax };
            }
        }

        return { inter: true, tMin: tMin, tMax: tMax};
    };

    var result = intersect(0.0, 1000000.0);
    if (result.inter) {
        if (level == 0) {
            //skip boxes with no mesh vertices inside
            if (octree.meshIndices && octree.meshIndices.length > 0) {
                return { tree: octree, t: result.tMin };
            }
        }
        else {
            if (octree.children) {
                var depth = result.tMin + 10000;
                var tree = null;
                for (var i = 0; i < octree.children.length; i++) {
                    var ret = intersection(octree.children[i], mWorld, rayOrigin, rayDirection, level - 1);
                    if (ret) {
                        if (ret.t < depth) {
                            depth = ret.t;
                            tree = ret.tree;
                        }
                    }
                }

                if (tree) {
                    return { tree: tree, t: depth };
                }
            }
        }
    }

    return null;
};