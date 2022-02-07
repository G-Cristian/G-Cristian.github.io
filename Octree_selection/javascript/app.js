var model;
var modelVertices;
var modelNormals;
var modeIndices;
var mouseX;
var mouseY;
var cameraPos = [0.0, 0.0, 0.5];
var octree;
var octreeLevel;
var octreeVisible=true;
var selectedVerticesIndices;
var camera;

var InitDemo = function () {
    loadTextResource("shaders/lighting_selection.vs", function (vsErr, vsText) {
        if (vsErr) {
            alert("Fatal error getting vertex shader(see console)");
            console.log(vsErr);
        }
        else {
            loadTextResource("shaders/lighting_selection.fs", function (fsErr, fsText) {
                if (fsErr) {
                    alert("Fatal error getting fragment shader(see console)");
                    console.log(fsErr);
                }
                else {
                    loadJSONResource("models/bunny.json", function (modelErr, modelObj) {
                        if (modelErr) {
                            alert("Fatal error getting model (see console)");
                            console.log(modelErr);
                        }
                        else {
                            loadTextResource("shaders/box.vs", function (vsBoxErr, vsBoxText) {
                                if (vsBoxErr) {
                                    alert("Fatal error getting box vertex shader(see console)");
                                    console.log(vsBoxErr);
                                }
                                else {
                                    loadTextResource("shaders/box.fs", function (fsBoxErr, fsBoxText) {
                                        if (fsBoxErr) {
                                            alert("Fatal error getting box fragment shader(see console)");
                                            console.log(fsBoxErr);
                                        }
                                        else {
                                            RunDemo(vsText, fsText, vsBoxText, fsBoxText, modelObj);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

var RunDemo = function (vertexShaderText, fragmentShaderText, boxVertexShaderText, boxFragmentShaderText, modelObj) {
    //console.log("This is working");
    model = modelObj;
    octreeLevel = 3;
    selectedVerticesIndices = [];

    var canvas = document.getElementById('game-surface');
    camera = createCamera(document.getElementById('game-surface'), [0.0, 0.0, 0.0,], 45.0 * Math.PI / 180.0, canvas.width / canvas.height, [0.0, 1.0, 0.0], 0.1, 1000.0, 0.6);

    var gl = canvas.getContext('webgl');
    if (!gl) {
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert("The browser does not support WebGL");
    }

    var mWorld = new Float32Array(16);
    var mView = camera.view();
    var mProj = camera.perspective();

    glMatrix.mat4.identity(mWorld);
    glMatrix.mat4.lookAt(mView, cameraPos, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    glMatrix.mat4.perspective(mProj, 45.0 * Math.PI / 180.0, canvas.width / canvas.height, 0.1, 1000.0);

    var initFunc = function () {
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
    };

    var bunnyProgram;
    var boxProgram;

    var initBunnyShadersAndProgram = function () {

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, vertexShaderText);
        gl.shaderSource(fragmentShader, fragmentShaderText);

        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log("ERROR compiling Vertex shader", gl.getShaderInfoLog(vertexShader));
            return;
        }

        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log("ERROR compiling fragment shader", gl.getShaderInfoLog(fragmentShader));
            return;
        }

        bunnyProgram = gl.createProgram();
        gl.attachShader(bunnyProgram, vertexShader);
        gl.attachShader(bunnyProgram, fragmentShader);
        gl.linkProgram(bunnyProgram);
        if (!gl.getProgramParameter(bunnyProgram, gl.LINK_STATUS)) {
            console.log("ERROR linking program", gl.getProgramInfoLog(bunnyProgram));
            return;
        }

        gl.validateProgram(bunnyProgram);
        if (!gl.getProgramParameter(bunnyProgram, gl.VALIDATE_STATUS)) {
            console.log("ERROR validating program", gl.getProgramInfoLog(bunnyProgram));
            return;
        }
    };

    var initBoxShadersAndProgram = function () {

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, boxVertexShaderText);
        gl.shaderSource(fragmentShader, boxFragmentShaderText);

        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log("ERROR compiling box Vertex shader", gl.getShaderInfoLog(vertexShader));
            return;
        }

        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log("ERROR compiling box fragment shader", gl.getShaderInfoLog(fragmentShader));
            return;
        }

        boxProgram = gl.createProgram();
        gl.attachShader(boxProgram, vertexShader);
        gl.attachShader(boxProgram, fragmentShader);
        gl.linkProgram(boxProgram);
        if (!gl.getProgramParameter(boxProgram, gl.LINK_STATUS)) {
            console.log("ERROR linking box program", gl.getProgramInfoLog(boxProgram));
            return;
        }

        gl.validateProgram(boxProgram);
        if (!gl.getProgramParameter(boxProgram, gl.VALIDATE_STATUS)) {
            console.log("ERROR validating box program", gl.getProgramInfoLog(boxProgram));
            return;
        }
    };

    var vertSelected;
    var vertSelectedBufferObject;
    var modelVertexBufferObject;
    var vertNormalsBufferObject;
    var modelIndexBufferObject;
    var positionAttribLocation;
    var vertNormalsAttribLocation;
    var vertSelectedLocation;

    var initBunnyModel = function () {
        var vertices = model.meshes[0].vertices;
        modelIndices = [].concat.apply([], model.meshes[0].faces);
        var normals = model.meshes[0].normals;

        vertSelected = new Float32Array(vertices.length / 3);
        vertSelected.fill(0);

        modelVertices = [];
        for (var i = 0; i < vertices.length; i += 3) {
            modelVertices.push(vertices[i]);
            modelVertices.push(vertices[i + 1]);
            modelVertices.push(vertices[i + 2]);

            modelVertices.push(normals[i]);
            modelVertices.push(normals[i + 1]);
            modelVertices.push(normals[i + 2]);

            modelVertices.push(vertSelected[i / 3]);
        }

        gl.useProgram(bunnyProgram);

        modelVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.DYNAMIC_DRAW);

        modelIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

        positionAttribLocation = gl.getAttribLocation(bunnyProgram, 'vertPosition');
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(positionAttribLocation);

        vertNormalsAttribLocation = gl.getAttribLocation(bunnyProgram, 'vertNormals');
        gl.vertexAttribPointer(vertNormalsAttribLocation, 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(vertNormalsAttribLocation);

        //vertSelectedBufferObject = gl.createBuffer();
        //gl.bindBuffer(gl.ARRAY_BUFFER, vertSelectedBufferObject);
        //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertSelectedBufferObject), gl.DYNAMIC_DRAW);

        vertSelectedLocation = gl.getAttribLocation(bunnyProgram, 'vertSelected');
        gl.vertexAttribPointer(vertSelectedLocation, 1, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(vertSelectedLocation);
    };

    var bindBunny = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBufferObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);

        positionAttribLocation = gl.getAttribLocation(bunnyProgram, 'vertPosition');
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(positionAttribLocation);

        vertNormalsAttribLocation = gl.getAttribLocation(bunnyProgram, 'vertNormals');
        gl.vertexAttribPointer(vertNormalsAttribLocation, 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(vertNormalsAttribLocation);

        //gl.bindBuffer(gl.ARRAY_BUFFER, vertSelectedBufferObject);
        vertSelectedLocation = gl.getAttribLocation(bunnyProgram, 'vertSelected');
        gl.vertexAttribPointer(vertSelectedLocation, 1, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(vertSelectedLocation);
    };

    var drawBunny = function (mWorld, mView, mProj, mNormal) {
        gl.useProgram(bunnyProgram);

        bindBunny();

        var worldUniformLocation = gl.getUniformLocation(bunnyProgram, 'mWorld');
        var viewUniformLocation = gl.getUniformLocation(bunnyProgram, 'mView');
        var projUniformLocation = gl.getUniformLocation(bunnyProgram, 'mProj');
        var normalUniformLocation = gl.getUniformLocation(bunnyProgram, 'mNormal');

        gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, mWorld);
        gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, mView);
        gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, mProj);
        gl.uniformMatrix3fv(normalUniformLocation, gl.FALSE, mNormal);

        var lightDirUniformLocation = gl.getUniformLocation(bunnyProgram, 'lightDir');
        var lightColorUniformLocation = gl.getUniformLocation(bunnyProgram, 'lightColor');

        gl.uniform3fv(lightDirUniformLocation, new Float32Array([-1, -1, -1]));
        gl.uniform3fv(lightColorUniformLocation, new Float32Array([1, 1, 1]));

        var identityMatrix = new Float32Array(16);
        glMatrix.mat4.identity(identityMatrix);

        var origen = new Float32Array(3);
        origen.fill(0);
        var xRotationMatrix = new Float32Array(16);
        glMatrix.mat4.translate(mWorld, identityMatrix, origen);

        var yRotationMatrix = new Float32Array(16);
        glMatrix.mat4.identity(yRotationMatrix);

        //angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
        //glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
        //glMatrix.mat4.mul(mWorld, yRotationMatrix, xRotationMatrix);

        //glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, 0, [1, 0, 0]);
        gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, mWorld);

        gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);
    };

    var draw = function(){
        var angle = 0;
        mView = camera.view();
        mProj = camera.perspective();
        var mNormal = new Float32Array(9);

        glMatrix.mat4.identity(mWorld);

        glMatrix.mat3.identity(mNormal);
        glMatrix.mat3.mul(mNormal, mNormal, mWorld);
        glMatrix.mat3.transpose(mNormal, mNormal);
        glMatrix.mat3.invert(mNormal, mNormal);

        drawBunny(mWorld, mView, mProj, mNormal);
        if (octreeVisible) {
            drawOctree(octree, octreeLevel, boxProgram, gl, mWorld, mView, mProj);
        }
    }

    initFunc();
    initBunnyShadersAndProgram();
    initBunnyModel();

    initBoxShadersAndProgram();
    octree = createOctree(model.meshes[0].vertices, 9, gl);

    var getMouseXY = function (canvas, event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left
        mouseY = event.clientY - rect.top

        //console.log("MouseX: " + mouseX + " MouseY: " + mouseY);
    };

    var screenToWorld = function (mView, mProj, x, y, zNDC, width, height) {
        var xNDC = 2.0 * (x / width) - 1.0;
        var yNDC = -(2.0 * (y / height) - 1.0);

        var mProjView = new Float32Array(16);
        glMatrix.mat4.mul(mProjView, mProj, mView);
        var mmProjViewInv = new Float32Array(16);
        glMatrix.mat4.invert(mmProjViewInv, mProjView)

        //  point = new Float32Array([x, y, nearPlane, w])
        var point = new Float32Array([xNDC, yNDC, zNDC, 1.0]);
        glMatrix.vec4.transformMat4(point, point, mmProjViewInv);

        point[0] = point[0] / point[3];
        point[1] = point[1] / point[3];
        point[2] = point[2] / point[3];
        point[3] = point[3] / point[3];

        return point;
    };

    var paintVertices = function (selectedVerticesIndices, selectedVal) {
        for (var i = 0; i < selectedVerticesIndices.length; i++) {
            var index = selectedVerticesIndices[i];
            var offset = index * 7 * Float32Array.BYTES_PER_ELEMENT;
            //point to last attribute in vertex, which is the selected attribute
            offset += 6 * Float32Array.BYTES_PER_ELEMENT;
            gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexBufferObject);
            gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array([selectedVal]));
        }
    };

    var mouseSelect = function (event) {
        getMouseXY(canvas, event);

        var rayDest = screenToWorld(mView, mProj, mouseX, mouseY, -0.1, canvas.width, canvas.height);
        var rayDir = [
            rayDest[0] - cameraPos[0],
            rayDest[1] - cameraPos[1],
            rayDest[2] - cameraPos[2]];
        var normRayDir = Math.sqrt(rayDir[0] * rayDir[0] + rayDir[1] * rayDir[1] + rayDir[2] * rayDir[2]);
        rayDir[0] = rayDir[0] / normRayDir;
        rayDir[1] = rayDir[1] / normRayDir;
        rayDir[2] = rayDir[2] / normRayDir;

        //console.log("Ray origin = " + cameraPos + " Ray dir = " + rayDir);

        //unpaint previous selected
        paintVertices(selectedVerticesIndices, 0);
        selectedVerticesIndices = [];

        var interResult = intersection(octree, mWorld, cameraPos, rayDir, octreeLevel);
        if (interResult) {
            selectedVerticesIndices = interResult.tree.meshIndices;
            paintVertices(selectedVerticesIndices, 1);
            //console.log("Intersection. t = " + interResult.t + " Box = " + interResult.tree);
            //console.log("Box.left = " + interResult.tree.left + " Box.right= " + interResult.tree.right + " Box.top = " + interResult.tree.top + " Box.bottom= " + interResult.tree.bottom);
        }
        else {
            //console.log("No intersection.");
        }
    };

    canvas.addEventListener('mousedown', function (e) {
        mouseSelect(e);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key == 'v') {
            octreeVisible = !octreeVisible;
        }

        if (e.key >= '1' && e.key <= '9') {
            octreeLevel = e.key - '1';
        }
    });

    var loop = function () {
        cameraPos = camera.position;

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        draw();
        

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};