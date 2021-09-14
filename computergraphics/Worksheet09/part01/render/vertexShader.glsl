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
varying vec2 fTexCoord;
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
    v_Color = a_Color;
    gl_PointSize = 10.0;

    fTexCoord = vTexCoord;
    gl_Position = projection * modelViewMatrix * objTransform* a_Position;

}