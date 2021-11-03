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

varying vec3 R, N, P;
varying vec4 v_Color;
#define PI cos(0.0)



void main()
{
    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);
    if(isreflective==0){
        vec3 iw=(mTex* a_Position).xyz;
        R = iw;
        v_Color = vec4(R,1.0);
    }
    P = (a_Position).xyz;
    N = vNormal.xyz;
    gl_Position = projection * modelViewMatrix *objTransform* a_Position;

}