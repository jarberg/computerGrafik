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
varying vec4 v_Color;


void main()
{
    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);
    v_Color = a_Color;

    gl_PointSize = 10.0;

    vec3 light = (projection*modelViewMatrix*lightPosition).xyz;
    vec3 pos = -(modelViewMatrix * a_Position).xyz;

    L = normalize(lightPosition.xyz);
    N = normalize(a_Position.xyz);

    fTexCoord = vTexCoord;
    gl_Position = projection * modelViewMatrix * objTransform* a_Position;

}