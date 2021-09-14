attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

uniform mat3 normalMatrix;

uniform vec4 a_camPos;
uniform vec4 lightPosition;

varying vec3 o_ObserverDirection;
varying vec3 NN, eyePos;
varying vec3 N, L, E;
varying vec3 R;



varying vec4 v_Color;
varying vec2 fTexCoord;

void main()
{

    vec3 pos = (objTransform * a_Position).xyz;

    R = pos;

    gl_Position = projection * modelViewMatrix *objTransform* a_Position;
    v_Color = a_Color;
    fTexCoord = vTexCoord;
}