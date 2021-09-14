precision mediump float;
#define PI cos(0.0)

uniform samplerCube texture;

varying vec4 v_Color;
varying vec3 R;

void main(){

    gl_FragColor = textureCube( texture, R);
}