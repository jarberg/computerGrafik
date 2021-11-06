attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;

void main(){

    gl_PointSize = 20.0;
    gl_Position = projection * modelViewMatrix * objTransform* a_Position;
}