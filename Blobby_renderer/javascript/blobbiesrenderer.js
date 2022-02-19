createRenderer = function (gl, canvas, camera, width, height, fov, lightDir, lightColor) {
    var renderer = {};
    renderer.gl = gl;
    renderer.canvas = canvas;
    renderer.camera = camera;
    renderer.width = width;
    renderer.height = height;

    renderer.lightDir = lightDir;
    renderer.lightColor = lightColor;

    renderer.mouseClickPos = [0.0, 0.0];
    renderer.numberOfBlobbies = 0;
    renderer.maxBlobbies = 100;
    renderer.mousePos = [0.0, 0.0];
    renderer.currentRadius = 0.75;
    renderer.currentBlobbiness = -1.0;
    renderer.blobbies = [createBlobby([0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0], renderer.currentRadius, renderer.currentBlobbiness)];

    renderer.fov = fov;
    renderer.fov_2_rad = toRadians(fov / 2.0);
    renderer.S = Math.sin(renderer.fov_2_rad);
    renderer.C = Math.cos(renderer.fov_2_rad);
    renderer.x_c = (renderer.canvas.width - 1.0) / 2.0;
    renderer.y_c = (renderer.canvas.height - 1.0) / 2.0;
    renderer.x_w = renderer.canvas.width / 2.0;
    renderer.y_w = -renderer.canvas.height / 2.0;

    renderer.setDataColor = function (pos, color) {
        renderer.data[pos + 0] = color[0];
        renderer.data[pos + 1] = color[1];
        renderer.data[pos + 2] = color[2];
        renderer.data[pos + 3] = color[3];
    };

    renderer.clear = function () {
        for (var j = 0; j < renderer.textureHeight; j++) {
            for (var i = 0; i < renderer.textureWidth; i++) {
                var pos = (i + j * renderer.textureWidth) * 4;
                renderer.setDataColor(pos, [0, 0, 0, 0]);
            }
        }
    };

    renderer.initTexture = function () {
        renderer.textureID = renderer.gl.createTexture();
        renderer.gl.bindTexture(renderer.gl.TEXTURE_2D, renderer.textureID);
        //renderer.gl.pixelStorei(renderer.gl.UNPACK_ALIGNMENT, 1);
        // define size and format of level 0
        const level = 0;
        const internalFormat = renderer.gl.RGBA;
        const border = 0;
        const format = renderer.gl.RGBA;
        const type = renderer.gl.UNSIGNED_BYTE;
        renderer.textureWidth = renderer.canvas.width;
        renderer.textureHeight = renderer.canvas.height;
        renderer.data = new Uint8Array(renderer.textureWidth * renderer.textureHeight * 4);

        renderer.clear();
        renderer.gl.texImage2D(renderer.gl.TEXTURE_2D, level, internalFormat,
            renderer.textureWidth, renderer.textureHeight, border,
            format, type, renderer.data);

        // set the filtering so we don't need mips
        renderer.gl.texParameteri(renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MAG_FILTER, renderer.gl.NEAREST);
        renderer.gl.texParameteri(renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_MIN_FILTER, renderer.gl.NEAREST);
        renderer.gl.texParameteri(renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_WRAP_S, renderer.gl.CLAMP_TO_EDGE);
        renderer.gl.texParameteri(renderer.gl.TEXTURE_2D, renderer.gl.TEXTURE_WRAP_T, renderer.gl.CLAMP_TO_EDGE);
    };

    renderer.fillTexture = function () {
        //console.log("renderer.textureID: " + renderer.textureID);
        renderer.gl.bindTexture(renderer.gl.TEXTURE_2D, renderer.textureID);
        renderer.gl.activeTexture(renderer.gl.TEXTURE0);
        //renderer.gl.pixelStorei(renderer.gl.UNPACK_ALIGNMENT, 1);
        // define size and format of level 0
        const level = 0;
        const internalFormat = renderer.gl.RGBA;
        const border = 0;
        const format = renderer.gl.RGBA;
        const type = renderer.gl.UNSIGNED_BYTE;
        //console.log("renderer.textureWidth: " + renderer.textureWidth);
        //console.log("renderer.textureHeight: " + renderer.textureHeight);
        renderer.gl.texImage2D(renderer.gl.TEXTURE_2D, level, internalFormat,
            renderer.textureWidth, renderer.textureHeight, border,
            format, type, renderer.data);
        //console.log("gl.GetError(): " + renderer.gl.getError());

        //renderer.gl.texImage2D(renderer.gl.TEXTURE_2D, level, internalFormat, format, type, renderer.data);
    };

    renderer.getPos = function (evt) {
        var rect = renderer.canvas.getClientRects()[0];

        return [evt.clientX - rect.x,
        evt.clientY - rect.y];
    };

    renderer.getPosFromMouseOffset = function (evt) {
        return [evt.offsetX,
        evt.offsetY];
    };

    renderer.normalizeVec = function (vec) {
        var length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
        vec[0] = vec[0] / length;
        vec[1] = vec[1] / length;
        vec[2] = vec[2] / length;
    };

    renderer.getMatrix4Inverse = function (mat) {
        var invMat = new Float32Array(16);
        glMatrix.mat4.invert(invMat, mat)

        return invMat;
    };

    renderer.getNDC = function (pos) {
        var xNDC = 2.0 * (pos[0] / renderer.canvas.width) - 1.0;
        var yNDC = -(2.0 * (pos[1] / renderer.canvas.height) - 1.0);

        return [xNDC, yNDC, 0.5];
    };

    renderer.screenToWorld = function (pos) {
        var NDC = renderer.getNDC(pos);

        var mProjView = new Float32Array(16);
        glMatrix.mat4.mul(mProjView, renderer.perspective(), renderer.view());
        var mProjViewInv = renderer.getMatrix4Inverse(mProjView);

        var point = new Float32Array([NDC[0], NDC[1], NDC[2], 1.0]);
        glMatrix.vec4.transformMat4(point, point, mProjViewInv);

        point[0] = point[0] / point[3];
        point[1] = point[1] / point[3];
        point[2] = point[2] / point[3];
        point[3] = point[3] / point[3];

        return point;
    };

    renderer.screenToViewXY = function (x, y) {
        return [
            (x - renderer.x_c) * renderer.S / (renderer.C * renderer.x_w),
            (y - renderer.y_c) * renderer.S / (renderer.C * renderer.y_w)
        ];
    };

    renderer.cameraUpdateCallback = function () {
        var cameraCenterViewSpace = new Float32Array(4);
        for (var i = 0; i < renderer.blobbies.length; i++) {
            glMatrix.vec4.transformMat4(cameraCenterViewSpace, renderer.blobbies[i].wPos, renderer.camera.view());
            renderer.blobbies[i].vPos = [cameraCenterViewSpace[0], cameraCenterViewSpace[1], -cameraCenterViewSpace[2], 1.0];
        }
    };

    renderer.moveCurrentBlobby = function () {
        if (renderer.numberOfBlobbies < renderer.maxBlobbies) {
            var viewPos = renderer.screenToViewXY(renderer.mousePos[0], renderer.mousePos[1]);
            //console.log("viewPos: " + viewPos);
            var center = renderer.camera.center;
            var cameraCenterViewSpace = new Float32Array([center[0], center[1], center[2], 1.0]);
            //var cameraCenterViewSpace = new Float32Array([0, 0, -10, 1.0]);

            glMatrix.vec4.transformMat4(cameraCenterViewSpace, cameraCenterViewSpace, renderer.camera.view());
            //console.log("cameraCenterViewSpace: " + cameraCenterViewSpace);
            var vPos = [viewPos[0] * -cameraCenterViewSpace[2], viewPos[1] * -cameraCenterViewSpace[2], -cameraCenterViewSpace[2], 1.0];
            renderer.blobbies[renderer.numberOfBlobbies].vPos = [vPos[0], vPos[1], vPos[2], vPos[3]];
            //renderer.blobbies[renderer.numberOfBlobbies].vPos = [cameraCenterViewSpace[0], cameraCenterViewSpace[1], -cameraCenterViewSpace[2], 1.0];
            //console.log("renderer.blobbies[renderer.numberOfBlobbies].vPos: " + renderer.blobbies[renderer.numberOfBlobbies].vPos);
            var cameraCenterWorldSpace = new Float32Array(4);
            glMatrix.vec4.transformMat4(cameraCenterWorldSpace, [vPos[0], vPos[1], -vPos[2], vPos[3]], renderer.camera.inverseView());
            renderer.blobbies[renderer.numberOfBlobbies].wPos = [cameraCenterWorldSpace[0], cameraCenterWorldSpace[1], cameraCenterWorldSpace[2], 1.0];
        }
    };

    renderer.pushNewCurrentBlobby = function () {
        if (renderer.numberOfBlobbies < renderer.maxBlobbies) {
            var newBlobby = createBlobby([0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 0.0, 1.0], renderer.currentRadius, renderer.currentBlobbiness);
            renderer.blobbies.push(newBlobby);
            renderer.moveCurrentBlobby();
        }
    };

    renderer.addBlobby = function () {
        if (renderer.numberOfBlobbies < renderer.maxBlobbies) {
            renderer.numberOfBlobbies++;
            renderer.pushNewCurrentBlobby();
        }
    };

    renderer.updateCurrentBlobbyRadiusBlobbiness = function () {
        if (renderer.numberOfBlobbies < renderer.maxBlobbies) {
            if (renderer.currentRadius < 0.05) {
                renderer.currentRadius = 0.05;
            }
            if (renderer.currentBlobbiness > -0.05) {
                renderer.currentBlobbiness = -0.05;
            }
            renderer.blobbies[renderer.numberOfBlobbies].radius = renderer.currentRadius;
            renderer.blobbies[renderer.numberOfBlobbies].blobbiness = renderer.currentBlobbiness;
        }
    };
    renderer.keyUp = function () {
        return function (e) {
            var keynum = null;
            if (window.event) { // IE                  
                keynum = e.keyCode;
            } else if (e.which) { // Netscape/Firefox/Opera                 
                keynum = e.which;
            }

            if (keynum) {
                var key = String.fromCharCode(keynum);
                switch (key) {
                    case ' ':
                        renderer.addBlobby();
                        break;
                    case 'R':
                        renderer.currentRadius += 0.05;
                        renderer.updateCurrentBlobbyRadiusBlobbiness();
                        break;
                    case 'F':
                        renderer.currentRadius -= 0.05;
                        renderer.updateCurrentBlobbyRadiusBlobbiness();
                        break;
                    case 'T':
                        renderer.currentBlobbiness += 0.05;
                        renderer.updateCurrentBlobbyRadiusBlobbiness();
                        break;
                    case 'G':
                        renderer.currentBlobbiness -= 0.05;
                        renderer.updateCurrentBlobbyRadiusBlobbiness();
                        break;
                };
            }
        };
    }();
    
    renderer.mouseUp = function () {
        return function (evt) {
            if (evt.button == 0) {
                renderer.addBlobby();
            }
        };
    }();
    
    renderer.mouseMove = function () {
        return function (evt) {
            var pos = renderer.getPosFromMouseOffset(evt);
            renderer.mousePos[0] = pos[0];
            renderer.mousePos[1] = pos[1];

            renderer.moveCurrentBlobby()
        };
    }();
/*
    renderer.wheel = function () {
        return function (evt) {
            evt.preventDefault();
            var pos = renderer.getPos(evt);
            renderer.zoom(pos, evt.deltaY);
        };
    }();
 */
    renderer.addVec3 = function (v1, v2) {
        return [v2[0] + v1[0],
        v2[1] + v1[1],
        v2[2] + v1[2]];
    };

    renderer.diffVec3 = function (v1, v2) {
        return [v2[0] - v1[0],
        v2[1] - v1[1],
        v2[2] - v1[2]];
    };

    renderer.dotVec3 = function (v1, v2) {
        return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    };

    renderer.vec3TimesScalar = function (v, s) {
        return [v[0] * s, v[1] * s, v[2] * s];
    };

    renderer.getSignedDistanceAndNormal = function (z, ray) {
        var D = 0.0;
        var Dp = 0.0;
        var normal = [0.0, 0.0, 0.0];
        var point = renderer.vec3TimesScalar(ray, z);
        for (var i = 0; i < renderer.blobbies.length; i++) {
            //var r = renderer.diffVec3(point, renderer.blobbies[i].vPos);

            //var RR = renderer.dotVec3(ray, ray);
            //var RPi = renderer.dotVec3(ray, renderer.blobbies[i].vPos);

            //var zmi = RPi / RR;
            //var zmi2 = zmi * zmi;
            //var Mi = renderer.diffVec3(renderer.blobbies[i].vPos,
            //    renderer.vec3TimesScalar(ray, zmi));
            //Mi = renderer.dotVec3(Mi, Mi);

            //var r2 = RR * (z - zmi2) + Mi;
            //another tried
            //var point = renderer.vec3TimesScalar(ray, z);
            var r = renderer.diffVec3(renderer.blobbies[i].vPos, point);
            r2 = renderer.dotVec3(r, r);

            var blobbiness = renderer.blobbies[i].blobbiness;
            var R2 = renderer.blobbies[i].radius * renderer.blobbies[i].radius;
            var bi = Math.exp(-blobbiness);
            var ai = -Math.log(1 / bi) / R2;

            D += Math.exp(blobbiness * r2 / R2 - blobbiness);
            //D += bi*Math.exp(-ai*r2);
            //Dp += -2 * ai * RR * (z - zmi) * Math.exp(-ai * r2 - blobbiness);
            var tmp = -2 * ai;
            var tmpExp = Math.exp(-ai * r2 - blobbiness);
            normal[0] += tmp * (point[0] - renderer.blobbies[i].vPos[0]) * tmpExp;
            normal[1] += tmp * (point[1] - renderer.blobbies[i].vPos[1]) * tmpExp;
            normal[2] += tmp * (point[2] - renderer.blobbies[i].vPos[2]) * tmpExp;
        }

        //return [D, Dp];
        return [D, normal];
    };

    renderer.getMinMaxZ = function(){
        var minMax = [1000.0, 0.0];
        //console.log("renderer.blobbies.length: " + renderer.blobbies.length);
        for (var i = 0; i < renderer.blobbies.length; i++) {
            if (renderer.blobbies[i].vPos[2] > minMax[1]) {
                minMax[1] = renderer.blobbies[i].vPos[2];
            }
            if (renderer.blobbies[i].vPos[2] - renderer.blobbies[i].radius < minMax[0]) {
                minMax[0] = renderer.blobbies[i].vPos[2] - renderer.blobbies[i].radius;
            }
        }

        return minMax;
    };

    renderer.getIntersectionZAndNormal = function (ray, zNear, zFar) {
        var DNear = renderer.getSignedDistanceAndNormal(zNear, ray)[0];
        var DFar = renderer.getSignedDistanceAndNormal(zFar, ray)[0];
        var zNew = (zNear * (DFar - 1) - zFar * (DNear - 1)) / (DFar - DNear);
        var DNormalNew = renderer.getSignedDistanceAndNormal(zNew, ray);
        var DNew = DNormalNew[0];
        var normalNew = DNormalNew[1];

        while(Math.abs(DNew - 1) > 0.01) {
            if (DNew < 1) {
                zNear = zNew;
                DNear = DNew;
            }
            else {
                zFar = zNew;
                DFar = DNew;
            }
            zNew = (zNear * (DFar - 1) - zFar * (DNear - 1)) / (DFar - DNear);
            DNormalNew = renderer.getSignedDistanceAndNormal(zNew, ray);
            DNew = DNormalNew[0];
            normalNew = DNormalNew[1];
        }

        return [zNew, normalNew];
    };

    renderer.intersect = function (ray, zNear, zFar) {

        //console.log("ray: " + ray);
        //console.log("near: " + near);
        //console.log("far: " + far);

        var DNear = renderer.getSignedDistanceAndNormal(zNear, ray)[0];
        var DFar = renderer.getSignedDistanceAndNormal(zFar, ray)[0];

        var tries = 0;
        while (tries < 7 && ((DFar - 1) * (DNear - 1)) > 0) {
            var zNew = (zNear * (DFar - 1) - zFar * (DNear - 1)) / (DFar - DNear);
            var DNew = renderer.getSignedDistanceAndNormal(zNew, ray)[0];
            if (DNew < 1) {
                zNear = zNew;
                DNear = DNew;
            }
            else {
                zFar = zNew;
                DFar = DNew;
            }

            tries++;
        }

        if ((DFar - 1) * (DNear - 1) <= 0) {
            return true;
        }
        else {
            return false;
        }
    };

    renderer.draw = function () {
        var pos = 0;
        var color = [0, 0, 0, 0];
        for (var j = 0; j < renderer.textureHeight; j++) {
            for (var i = 0; i < renderer.textureWidth; i++) {
                
                pos = (i + j * renderer.textureWidth) * 4;
                color = [0, 0, 0, 0];

                var posXY = renderer.screenToViewXY(i, j);

                var ray = [posXY[0], posXY[1], 1.0];

                var nearPoint = renderer.vec3TimesScalar(ray,0.1);
                var farPoint = renderer.vec3TimesScalar(ray, 1000.0);

                var minMax = renderer.getMinMaxZ();
                //console.log("farPoint:" + farPoint);
                //console.log("nearPoint:" + nearPoint);
                //console.log("minMax:" + minMax);
                //if (i == 120 && j == 120 && renderer.mousePos[0] < 125 && renderer.mousePos[0] > 115 && renderer.mousePos[1] < 125 && renderer.mousePos[1] > 115) {
                //    var aux = 0;
                //}
                if (minMax[0] < farPoint[2] && minMax[1] > nearPoint[2]) {
                    var intersect = renderer.intersect(ray, nearPoint[2], minMax[1]);
                    if (intersect) {
                        var intersectZAndNormal = renderer.getIntersectionZAndNormal(ray, nearPoint[2], minMax[1]);
                        var intersectZ = intersectZAndNormal[0];
                        var intersectNormal = intersectZAndNormal[1];

                        var intersectionPoint = renderer.vec3TimesScalar(ray, intersectZ);
                        //calc lighting
                        intersectNormal[2] = -intersectNormal[2]; //pass from left hand coordinates to right hand coordinates
                        renderer.camera.normalizeVec(intersectNormal);

                        var lightDir = renderer.vec3TimesScalar(renderer.lightDir, 1);
                        renderer.camera.normalizeVec(lightDir);

                        var diffComp = renderer.dotVec3(lightDir, intersectNormal);
                        if (diffComp < 0.0) {
                            diffComp = 0.0;
                        }
                        color = [0, 255 * renderer.lightColor[1], 0, 255];
                        var ambientColor = renderer.vec3TimesScalar(color, 0.2);
                        var diffuseColor = renderer.vec3TimesScalar(color, 0.8 * diffComp);

                        var colorTmp = renderer.addVec3(ambientColor, diffuseColor);
                        color = [colorTmp[0], colorTmp[1], colorTmp[2], 255];
                        //console.log("color: " + color);
                    }
                }

                renderer.setDataColor(pos, color);
            }
        }

        renderer.fillTexture();
    };
    
    //renderer.canvas.addEventListener('mousedown', renderer.mouseDown);
    //renderer.canvas.addEventListener('mouseup', renderer.mouseUp);
    //renderer.canvas.addEventListener('keyup', renderer.keyUp);
    window.addEventListener('keyup', renderer.keyUp);
    renderer.canvas.addEventListener('mousemove', renderer.mouseMove);
    //renderer.canvas.addEventListener("wheel", renderer.wheel, false);
    //renderer.canvas.addEventListener("contextmenu", e => e.preventDefault());
    //renderer.canvas.addEventListener("onwheel", renderer.wheel, false);
    //renderer.canvas.addEventListener("mousewheel", renderer.wheel, false);

    renderer.camera.addUpdateCallback(renderer.cameraUpdateCallback);

    renderer.initTexture();
    renderer.clear();

    return renderer;
};
