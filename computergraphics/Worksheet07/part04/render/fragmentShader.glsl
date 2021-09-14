uniform sampler2D normalTexture;
uniform samplerCube textureCubeMap;

precision mediump float;
uniform mediump int isreflective;

varying vec4 v_Color;
varying vec3 R;
varying vec3 N;
varying vec2 coords;

void main(){
    gl_FragColor = textureCube(textureCubeMap, R);

}