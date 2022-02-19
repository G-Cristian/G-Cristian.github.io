var model;
var modelVertices;
var modelNormals;
var modeIndices;
var mouseX;
var mouseY;
var cameraPos = [0.0, 0.0, 0.5];
var drawingQuad;
var octreeLevel;
var octreeVisible=true;
var selectedVerticesIndices;
var camera;
var renderer;
var numberOfBlobbies = 0;
var blobbies = [];

var InitDemo = function () {
    loadTextResource("shaders/blobby.vs", function (vsErr, vsText) {
        if (vsErr) {
            alert("Fatal error getting vertex shader(see console)");
            console.log(vsErr);
        }
        else {
            loadTextResource("shaders/blobby.fs", function (fsErr, fsText) {
                if (fsErr) {
                    alert("Fatal error getting fragment shader(see console)");
                    console.log(fsErr);
                }
                else {
                    RunDemo(vsText, fsText);
                }

            });
        }
    });
};

var RunDemo = function (vertexShaderText, fragmentShaderText) {
    console.log("This is working");

    var canvas = document.getElementById('game-surface');
    //camera = new Camera(document.getElementById('game-surface'), [0.0, 0.0, 0.0,], 45.0 * Math.PI / 180.0, canvas.width / canvas.height, [0.0, 1.0, 0.0], 0.1, 1000.0, 0.6);
    camera = createCamera(document.getElementById('game-surface'), [0.0, 0.0, 0.0,], 45.0 * Math.PI / 180.0, canvas.width / canvas.height, [0.0, 1.0, 0.0], 0.1, 1000.0, 10.0);
    camera.disableMove = true;
    camera.disableRotate = true;
    camera.disableZoom = true;
    var gl = canvas.getContext('webgl');
    if (!gl) {
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert("The browser does not support WebGL");
    }

    renderer = createRenderer(gl, canvas, camera, canvas.width, canvas.height, 45.0, new Float32Array([-1, -1, -1]), new Float32Array([1, 1, 1]));

    var mWorld = new Float32Array(16);
    var mView = camera.view();
    var mProj = camera.perspective();

    glMatrix.mat4.identity(mWorld);

    var initFunc = function () {
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
    };

    var blobbyProgram;

    var initBlobbyShadersAndProgram = function () {

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

        blobbyProgram = gl.createProgram();
        gl.attachShader(blobbyProgram , vertexShader);
        gl.attachShader(blobbyProgram , fragmentShader);
        gl.linkProgram(blobbyProgram );
        if (!gl.getProgramParameter(blobbyProgram , gl.LINK_STATUS)) {
            console.log("ERROR linking program", gl.getProgramInfoLog(blobbyProgram));
            return;
        }

        gl.validateProgram(blobbyProgram );
        if (!gl.getProgramParameter(blobbyProgram , gl.VALIDATE_STATUS)) {
            console.log("ERROR validating program", gl.getProgramInfoLog(blobbyProgram ));
            return;
        }
    };

    var quadVertexBufferObject;
    var vertNormalsBufferObject;
    var quadIndexBufferObject;
    var positionAttribLocation;

    var initDrawingQuad = function () {
        drawingQuad = createDrawingQuad(gl, blobbyProgram, canvas.width, canvas.height, 45.0, -0.1);
        var mProj = camera.perspective();
        //var ret = new Float32Array(9);
        var ret = glMatrix.vec3.transformMat3([0, 0, 0, 0], [drawingQuad.vertices[0], drawingQuad.vertices[1], drawingQuad.vertices[2]], mProj);
        //console.log("ret: " + ret);
    };

    var bindDrawingQuad = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, drawingQuad.VBO);

        drawingQuad.positionAttribLocation = gl.getAttribLocation(blobbyProgram, 'vertPosition');
        //console.log("drawingQuad.positionAttribLocation: " + drawingQuad.positionAttribLocation);
        gl.vertexAttribPointer(drawingQuad.positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(drawingQuad.positionAttribLocation);

        renderer.textureLocation = gl.getAttribLocation(blobbyProgram, 'vertTexCoords');
        //console.log("renderer.textureLocation: " + renderer.textureLocation);
        gl.vertexAttribPointer(renderer.textureLocation, 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(renderer.textureLocation);

        gl.bindTexture(gl.TEXTURE_2D, renderer.textureID);
        //console.log("renderer.textureID: " + renderer.textureID);
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(gl.getUniformLocation(blobbyProgram, 'u_texture'), 0);
    };

    var drawQuad = function (mWorld, mView, mProj, mNormal) {
        gl.useProgram(blobbyProgram);

        var worldUniformLocation = gl.getUniformLocation(blobbyProgram, 'mWorld');
        var viewUniformLocation = gl.getUniformLocation(blobbyProgram, 'mView');
        var projUniformLocation = gl.getUniformLocation(blobbyProgram, 'mProj');
        var normalUniformLocation = gl.getUniformLocation(blobbyProgram, 'mNormal');

        gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, mWorld);
        gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, mView);
        gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, mProj);
        gl.uniformMatrix3fv(normalUniformLocation, gl.FALSE, mNormal);

        var lightDirUniformLocation = gl.getUniformLocation(blobbyProgram, 'lightDir');
        var lightColorUniformLocation = gl.getUniformLocation(blobbyProgram, 'lightColor');

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

        bindDrawingQuad();

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    var draw = function(){
        var angle = 0;
        mView = camera.view();
        mProj = camera.perspective();
        var mNormal = new Float32Array(9);

        glMatrix.mat4.identity(mWorld);
        //glMatrix.mat4.lookAt(mView, cameraPos, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        //glMatrix.mat4.perspective(mProj, 45.0 * Math.PI / 180.0, canvas.width / canvas.height, 0.1, 1000.0);

        glMatrix.mat3.identity(mNormal);
        glMatrix.mat3.mul(mNormal, mNormal, mWorld);
        glMatrix.mat3.transpose(mNormal, mNormal);
        glMatrix.mat3.invert(mNormal, mNormal);

        renderer.draw();

        drawQuad(mWorld, mView, mProj, mNormal);
    }

    initFunc();
    initBlobbyShadersAndProgram();
    initDrawingQuad();
    

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

    var mouseSelect = function (event) {
        getMouseXY(canvas, event);

        
    };

    canvas.addEventListener('mousedown', function (e) {
        mouseSelect(e);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key == 'v') {
            octreeVisible = !octreeVisible;
        }

        if (e.key >= '1' && e.key <= '5') {
            octreeLevel = e.key - '1';
        }
    });

    var loop = function () {

        cameraPos = camera.position;
        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        draw();
        
        //setTimeout(requestAnimationFrame(loop), 1000);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};