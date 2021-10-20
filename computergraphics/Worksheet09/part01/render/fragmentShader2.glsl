precision mediump float;

uniform int u_usev_col;
uniform int u_shadow;
varying vec4 v_Color;
varying  vec2 fTexCoord;
uniform mat3 lightPosition;

uniform sampler2D diffuseTexture;

void main()
{
    if(u_shadow == 1){
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    }
    else{
        if(u_usev_col == 1){
            gl_FragColor = v_Color;
        }
        else{
            gl_FragColor = texture2D( diffuseTexture, fTexCoord );
        }
    }
}