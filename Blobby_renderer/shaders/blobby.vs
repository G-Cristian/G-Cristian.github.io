precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoords;

//varying highp vec2 texCoords;
varying vec2 texCoords;
uniform sampler2D u_texture;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
	texCoords = vertTexCoords;
	gl_Position = mProj * vec4(vertPosition, 1.0);
}