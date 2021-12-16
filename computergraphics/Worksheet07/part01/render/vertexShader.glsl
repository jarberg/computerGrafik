attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat4 mTex;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

uniform mat3 normalMatrix;

varying vec3 R;
varying vec4 v_Color;

void main()
{

    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);

    vec3 iw= (mTex*a_Position).xyz;

    R = iw;

    gl_Position = projection * modelViewMatrix *objTransform* a_Position;

}