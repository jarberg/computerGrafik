attribute vec4 a_Position;
attribute vec4 vNormal;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

uniform mat3 normalMatrix;

uniform vec4 a_camPos;
uniform vec4 lightPosition;

varying vec3 o_ObserverDirection;
varying vec3 N, L, E;


attribute  vec4 a_Color;
attribute  vec2 vTexCoord;

varying vec4 v_Color;
varying vec2 fTexCoord;
varying float s, t;

void main()
{
    float pi = acos(0.0);
    t = 0.5*acos(a_Position.x)/pi;
    s = 0.5*asin(a_Position.y/sqrt(1.0-a_Position.x*a_Position.x))/pi;

    vec3 light = (projection*modelViewMatrix*lightPosition).xyz;
    vec3 pos = -(modelViewMatrix * a_Position).xyz;
    o_ObserverDirection = normalize(a_camPos.xyz - pos.xyz);

    if(lightPosition.w == 0.0)  L = normalize(lightPosition.xyz);
    else  L = normalize(lightPosition.xyz) - pos;

    E = pos;
    N = normalize(vNormal.xyz);

    gl_Position = projection * modelViewMatrix *objTransform* a_Position;
    v_Color = a_Color;
    fTexCoord = vTexCoord;
}