precision mediump float;

//varying highp vec2 texCoords;
varying vec2 texCoords;
uniform sampler2D u_texture;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

//uniform vec3 lightDir;
//uniform vec3 lightColor;

void main(){
    vec4 color = texture2D(u_texture,texCoords);

    if(color.a < 0.1){
        discard;
    }
    else{
        gl_FragColor = color;
    }
    //vec3 ambient = 0.2*lightColor * fragColor;

    //vec3 diffColor = 0.8*lightColor * fragColor;
    //vec3 lightDirNorm = normalize(-lightDir);
    //vec3 normal = normalize(fragNormal);
    //float diff = max(dot(lightDirNorm, normal), 0.0);

    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}