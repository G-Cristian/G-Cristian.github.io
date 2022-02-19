
var CameraProto = {
    canvas: null,
    center: [0.0, 0.0, 0.0],
    fov: 0.0,
    ratio: 0.0,
    up: [0.0, 1.0, 0.0],
    near: 0.1,
    far: 1000.0,
    radius: 10.0,
    position: [0.0, 0.0, 0.0],
    phi: 0.0,
    theta: 0.0,
    cameraUp: [0.0, 1.0, 0.0],
    leftClickPressed: false,
    mouseClickPos: [0.0, 0.0],
    rightClickPressed: false,
    
    mouseDown: function () { }
};


createCamera = function (canvas, center, fov, ratio, up, near, far, radius) {
    var camera = CameraProto;
    camera.canvas = canvas;
    camera.center = center;
    camera.fov = fov;
    camera.ratio = ratio;
    camera.up = up;
    camera.near = near;
    camera.far = far;
    camera.radius = radius;
    camera.zoomScale = 1.0;
    camera.position = [0.0, 0.0, 0.0];
    camera.worldMousePos = null;

    camera.phi = Math.PI / 2.0;
    camera.theta = 0.0;
    camera.cameraUp = up;
    camera.leftClickPressed = false;
    camera.mouseClickPos = [0.0, 0.0];
    camera.rightClickPressed = false;

    camera.moveSensitivity = 0.01;
    camera.rotateSensitivity = 0.01;
    camera.zoomSensitivity = 0.001;
    camera.updateCallbacks = [];

    camera.disableMove = false;
    camera.disableRotate = false;
    camera.disableZoom = false;

    camera.getPos = function (evt) {
        var rect = camera.canvas.getClientRects()[0];

        return [evt.clientX - rect.x,
        evt.clientY - rect.y];
    };

    camera.getPosFromMouseOffset = function (evt) {
        return [evt.offsetX,
        evt.offsetY];
    };

    camera.cross = function (vec1, vec2) {
        return [vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
        ];
    };
    camera.normalizeVec = function (vec) {
        var length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        vec[0] = vec[0] / length;
        vec[1] = vec[1] / length;
        vec[2] = vec[2] / length;
    };

    camera.move = function (diffPos) {
        if (camera.disableMove) {
            return;
        }

        var front = [camera.center[0] - camera.position[0],
        camera.center[1] - camera.position[1],
        camera.center[2] - camera.position[2]];

        camera.normalizeVec(front);

        var right = camera.cross(front, camera.up);
        camera.normalizeVec(right);

        camera.cameraUp = camera.cross(right, front);
        camera.normalizeVec(camera.cameraUp);

        var rightMove = [right[0] * diffPos[0],
        right[1] * diffPos[0],
        right[2] * diffPos[0]
        ];

        var upMove = [camera.cameraUp[0] * diffPos[1],
            camera.cameraUp[1] * diffPos[1],
            camera.cameraUp[2] * diffPos[1]
        ];

        camera.center[0] = camera.center[0] + (-rightMove[0] + upMove[0]) * camera.moveSensitivity;
        camera.center[1] = camera.center[1] + (-rightMove[1] + upMove[1]) * camera.moveSensitivity;
        camera.center[2] = camera.center[2] + (-rightMove[2] + upMove[2]) * camera.moveSensitivity;
    };

    camera.rotate = function (diffPos) {
        if (camera.disableRotate) {
            return;
        }
        camera.theta= camera.theta + diffPos[0] * camera.rotateSensitivity;
        camera.phi = camera.phi + diffPos[1] * camera.rotateSensitivity;

        if (camera.phi >= Math.PI - 0.1) {
            camera.phi = Math.PI - 0.1;
        }
        else if (camera.phi <=  0.1) {
            camera.phi = 0.1;
        }
    };

    camera.getMatrix4Inverse = function (mat) {
        var invMat = new Float32Array(16);
        glMatrix.mat4.invert(invMat, mat)

        return invMat;
    };

    camera.getNDC = function (pos) {
        var xNDC = 2.0 * (pos[0] / camera.canvas.width) - 1.0;
        var yNDC = -(2.0 * (pos[1] / camera.canvas.height) - 1.0);

        return [xNDC, yNDC, 0.5];
    };

    camera.screenToWorld = function (pos) {
        var NDC = camera.getNDC(pos);

        var mProjView = new Float32Array(16);
        glMatrix.mat4.mul(mProjView, camera.perspective(), camera.view());
        var mProjViewInv = camera.getMatrix4Inverse(mProjView);

        var point = new Float32Array([NDC[0], NDC[1], NDC[2], 1.0]);
        glMatrix.vec4.transformMat4(point, point, mProjViewInv);

        point[0] = point[0] / point[3];
        point[1] = point[1] / point[3];
        point[2] = point[2] / point[3];
        point[3] = point[3] / point[3];

        return point;
    };
    camera.zoom = function (mousePos, offset) {
        if (camera.disableZoom) {
            return;
        }

        if (offset > 0) {
            camera.zoomScale = 1.0/0.95;
        }
        else if (offset < 0) {
            camera.zoomScale = 0.95;
        }

        camera.worldMousePos = camera.screenToWorld(mousePos);

        camera.update();
    };

    camera.mouseDown= function () {
        return function (evt) {
            if (evt.button == 0) {
                camera.leftClickPressed = true;
            }
            if (evt.button == 2) {
                camera.rightClickPressed = true;
            }

            camera.mouseClickPos = camera.getPos(evt);
        };
    }();

    camera.mouseUp = function () {
        return function (evt) {
            //var pos = camera.getPos(evt);
            //var diffPos = [pos[0] - camera.mouseClickPos[0],
            //    pos[1] - camera.mouseClickPos[1]];

            if (evt.button == 0 && camera.leftClickPressed) {
                //camera.rotate(diffPos);
                camera.leftClickPressed = false;
            }
            if (evt.button == 2 && camera.rightClickPressed) {
                //camera.move(diffPos);
                camera.rightClickPressed = false;
            }

            camera.update();
        };
    }();

    camera.mouseMove = function () {
        return function (evt) {
            var pos = camera.getPosFromMouseOffset(evt);

            var diffPos = [pos[0] - camera.mouseClickPos[0],
                pos[1] - camera.mouseClickPos[1]];

            if (camera.leftClickPressed) {
                camera.rotate(diffPos);
            }
            if (camera.rightClickPressed) {
                camera.move(diffPos);
            }
            camera.mouseClickPos[0] = pos[0];
            camera.mouseClickPos[1] = pos[1];

            camera.update();
        };
    }();

    camera.wheel = function () {
        return function (evt) {
            evt.preventDefault();
            var pos = camera.getPos(evt);
            camera.zoom(pos, evt.deltaY);
        };
    }();

    camera.update = function () {
        if (camera.worldMousePos) {
            var prevRadius = camera.radius;
            camera.radius = camera.radius * camera.zoomScale;
            camera.radius = Math.max(0.1, Math.min(10.0, camera.radius));

            var radiusRatio = camera.radius / prevRadius;
            var alpha = radiusRatio;
            var beta = 1.0 - radiusRatio;

            camera.center[0] = camera.center[0] * alpha + camera.worldMousePos[0] * beta;
            camera.center[1] = camera.center[1] * alpha + camera.worldMousePos[1] * beta;
            camera.center[2] = camera.center[2] * alpha + camera.worldMousePos[2] * beta;

            camera.zoomScale = 1.0;

            camera.worldMousePos = null;
        }

        camera.position = [
            camera.radius * Math.sin(camera.phi) * Math.sin(camera.theta),
            camera.radius * Math.cos(camera.phi),
            camera.radius * Math.sin(camera.phi) * Math.cos(camera.theta)];

        camera.position[0] = camera.position[0] + camera.center[0];
        camera.position[1] = camera.position[1] + camera.center[1];
        camera.position[2] = camera.position[2] + camera.center[2];

        for (var i = 0; i < camera.updateCallbacks.length; i++) {
            camera.updateCallbacks[i]();
        }
    };

    camera.addUpdateCallback = function (callback) {
        camera.updateCallbacks.push(callback);
    };

    camera.view = function () {
        var mView = new Float32Array(16);

        glMatrix.mat4.lookAt(mView, camera.position, camera.center, camera.cameraUp);

        return mView;
    };

    camera.inverseView = function () {
        return camera.getMatrix4Inverse(camera.view());
    };

    camera.perspective = function () {
        var mProj = new Float32Array(16);
        glMatrix.mat4.perspective(mProj, camera.fov, camera.ratio, camera.near, camera.far);

        return mProj;
    };

    camera.canvas.addEventListener('mousedown', camera.mouseDown);
    camera.canvas.addEventListener('mouseup', camera.mouseUp);
    camera.canvas.addEventListener('mousemove', camera.mouseMove);
    camera.canvas.addEventListener("wheel", camera.wheel, false);
    camera.canvas.addEventListener("contextmenu", e => e.preventDefault());
    camera.canvas.addEventListener("onwheel", camera.wheel, false);
    camera.canvas.addEventListener("mousewheel", camera.wheel, false);


    camera.update();

    return camera;
};

//Camera.prototype = Object.create(CameraProto);
//Camera.prototype = new Object();
//Camera.prototype.constructor = Camera;
