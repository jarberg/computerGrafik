uniform sampler2D normalTexture;
uniform samplerCube textureCubeMap;

precision mediump float;
uniform mediump int isreflective;
uniform vec3 eye;
uniform mat4 modelViewMatrix;

varying vec4 v_Color;
varying vec3 R, N, P;
varying vec2 coords;
#define PI cos(0.0)

vec3 rotate_to_normal(vec3 normal, vec3 v) {
    float a = 1.0/(1.0 + normal.z);
    float b = -normal.x*normal.y*a;
    return vec3(1.0 - normal.x*normal.x*a, b, -normal.x)*v.x
    + vec3(b, 1.0 - normal.y*normal.y*a, -normal.y)*v.y
    + normal*v.z;
}

void main(){
    gl_FragColor = textureCube(textureCubeMap, R);
    if (isreflective==1){
        vec3 modelpos = P;
        vec3 incident = modelpos - eye;
        vec3 surfaceNormal = normalize(N.xyz);
        float u = 1.0 - atan(surfaceNormal.z, surfaceNormal.x)/(2.0 * PI);
        float v = acos(surfaceNormal.y)/(PI);
        vec3 mappedNormal = rotate_to_normal(surfaceNormal, texture2D(normalTexture, vec2(u, v)).xyz*2.0 - vec3(1,1,1));

        vec3 rR = reflect(incident, normalize(mappedNormal));
        gl_FragColor = textureCube(textureCubeMap, rR);
    }
    else{
        gl_FragColor = textureCube(textureCubeMap, R);
    }
}