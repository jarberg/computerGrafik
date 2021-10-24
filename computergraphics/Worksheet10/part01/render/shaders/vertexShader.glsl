attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat3 normalMatrix;
uniform mat4 mTex;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

uniform vec3 eye;
uniform mediump int isreflective;

uniform vec4 lightPosition;

varying vec2 coords;
varying vec2 fTexCoord;
varying vec3 L, N;
varying vec4 v_Color, p;

uniform mat4 u_MvpMatrixFromLight;
varying vec4 v_PositionFromLight;

void main()
{
    //v_PositionFromLight = u_MvpMatrixFromLight*objTransform*vec4(a_Position.x, 0, a_Position.y,1);
    v_PositionFromLight = u_MvpMatrixFromLight * objTransform * a_Position;

    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);
    v_Color = a_Color;

    gl_PointSize = 10.0;
    vec3 light = (lightPosition).xyz;
    vec3 pos = (objTransform*a_Position).xyz;
    p = lightPosition-objTransform*a_Position;
    L = normalize(light-pos);
    N = normalize(vNormal.xyz);

    fTexCoord = vTexCoord;
    gl_Position = projection * modelViewMatrix * objTransform* a_Position;

}