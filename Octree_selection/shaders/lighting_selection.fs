precision mediump float;

varying vec3 fragNormal;
varying vec3 fragColor;

uniform vec3 lightDir;
uniform vec3 lightColor;

void main(){
    vec3 ambient = 0.2*lightColor * fragColor;

    vec3 diffColor = 0.8*lightColor * fragColor;
    vec3 lightDirNorm = normalize(-lightDir);
    vec3 normal = normalize(fragNormal);
    float diff = max(dot(lightDirNorm, normal), 0.0);

    gl_FragColor = vec4(ambient + diffColor * diff, 1.0);
}