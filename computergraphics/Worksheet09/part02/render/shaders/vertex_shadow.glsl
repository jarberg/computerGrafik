attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 vNormal;
attribute vec2 vTexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;
precision mediump float;
void main() {

    gl_Position = a_Color+vNormal+vec4(vTexCoord,vTexCoord);
    gl_Position = projection*modelViewMatrix*objTransform*a_Position;
}
