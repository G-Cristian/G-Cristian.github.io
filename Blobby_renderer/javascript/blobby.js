
var createBlobby = function (wPos, vPos, radius, blobbiness) {
    return {
        wPos: wPos,
        vPos: vPos,
        radius: radius,
        blobbiness: blobbiness
    };
};

var toRadians = function (angle) {
    return angle * Math.PI / 180.0;
};

var getXYFromScreen = function (x, y, width, height, fov) {
    var fov_2_rad = toRadians(fov/2.0);
    var S = Math.sin(fov_2_rad);
    var C = Math.cos(fov_2_rad);
    var x_c = (width - 1.0) / 2.0;
    var y_c = (height - 1.0) / 2.0;
    var x_w = width / 2.0;
    var y_w = -height / 2.0;

    return [
        (x - x_c) * S / (C * x_w),
        (y - y_c) * S / (C * y_w),
    ];
};

var createDrawingQuad = function (gl, program, width, height, fov, nearPlane) {
    var quad = {};
    var topLeft = getXYFromScreen(0.5, 0, width, height, fov);
    var bottomLeft = getXYFromScreen(0.5, height - 0.5, width, height, fov);
    var topRight = getXYFromScreen(width - 0.5, 0, width, height, fov);
    var bottomRight = getXYFromScreen(width - 0.5, height - 0.5, width, height, fov);
    quad.vertices = [
        topLeft[0] * nearPlane, topLeft[1] * nearPlane, nearPlane, 1.0, 1.0,
        bottomLeft[0] * nearPlane, bottomLeft[1] * nearPlane, nearPlane, 1.0, 0.0,
        bottomRight[0] * nearPlane, bottomRight[1] * nearPlane, nearPlane, 0.0, 0.0,

        bottomRight[0] * nearPlane, bottomRight[1] * nearPlane, nearPlane, 0.0, 0.0,
        topRight[0] * nearPlane, topRight[1] * nearPlane, nearPlane, 0.0, 1.0,
        topLeft[0] * nearPlane, topLeft[1] * nearPlane, nearPlane, 1.0, 1.0
    ];

    gl.useProgram(program);

    quad.VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quad.vertices), gl.STATIC_DRAW);

    //quad.positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    //gl.vertexAttribPointer(quad.positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    //gl.enableVertexAttribArray(quad.positionAttribLocation);

    return quad;
};