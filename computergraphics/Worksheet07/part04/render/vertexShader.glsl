uniform sampler2D normalTexture;
uniform samplerCube textureCubeMap;

attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat4 mTex;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;


uniform vec3 eye;
uniform mediump int isreflective;

uniform mat3 normalMatrix;


varying vec2 coords;

varying vec3 R, N;
varying vec4 v_Color;
#define PI cos(0.0)

vec3 rotate_to_normal(vec3 normal, vec3 v) {
    float a = 1.0/(1.0 + normal.z);
    float b = -normal.x*normal.y*a;
    return vec3(1.0 - normal.x*normal.x*a, b, -normal.x)*v.x
    + vec3(b, 1.0 - normal.y*normal.y*a, -normal.y)*v.y
    + normal*v.z;
}


void main()
{
    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);

    if (isreflective==1){
        vec3 modelpos = (a_Position).xyz;
        vec3 incident = modelpos - eye;
        vec3 surfaceNormal = normalize(vNormal.xyz);

        float u = 1.0 - atan(surfaceNormal.z, surfaceNormal.x)/(2.0 * PI);
        float v = acos(surfaceNormal.y)/(PI);

        vec3 mappedNormal = rotate_to_normal(surfaceNormal, texture2D(normalTexture, vec2(u, v)).xyz*2.0 - vec3(1,1,1));

        vec3 rotatedScaledNormal = normalize(modelViewMatrix * vec4(mappedNormal.xyz, 0.0)).xyz;
        coords = vec2(u,v);
        R = reflect(incident, normalize(mappedNormal));

    }
    else{
        vec3 iw=(mTex* a_Position).xyz;
        R = iw;
        v_Color = vec4(R,1.0);
    }
    gl_Position = projection * modelViewMatrix *objTransform* a_Position;

}