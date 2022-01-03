precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormals;
attribute float vertSelected;


varying vec3 fragNormal;
varying vec3 fragColor;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat3 mNormal;

void main(){
	fragNormal = mNormal * vertNormals;
	fragColor = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.0, 0.0), vertSelected);
	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}