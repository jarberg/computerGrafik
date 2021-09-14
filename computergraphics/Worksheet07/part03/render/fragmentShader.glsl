    precision mediump float;

    uniform samplerCube texture;

    varying vec4 v_Color;
    varying vec3 R;
    varying vec3 N;

    void main(){
        vec4 col = v_Color;
        gl_FragColor = textureCube( texture, R);
    }