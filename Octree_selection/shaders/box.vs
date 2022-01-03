precision mediump float;

attribute vec3 vertPosition;

varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
	fragColor = vec3(1.0, 1.0, 0.0);
	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}