attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform vec4 lightPosition;

uniform mat3 normalMatrix;
uniform mat4 mTex;
uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

uniform vec3 eye;
uniform mediump int isreflective;

varying vec2 coords;
varying vec2 fTexCoord;
varying vec3 N, L;
varying vec4 v_Color, p;



void main()
{
    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);

    vec3 light = (lightPosition).xyz;
    vec3 pos = (objTransform*a_Position).xyz;
    p = lightPosition-objTransform*a_Position;
    L = normalize(light-pos);
    N = normalize(vNormal.xyz);
    fTexCoord = vTexCoord;
    v_Color = a_Color;
    gl_Position = projection * modelViewMatrix * objTransform* a_Position;

}