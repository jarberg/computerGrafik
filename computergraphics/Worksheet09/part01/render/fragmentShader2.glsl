precision mediump float;

uniform int u_usev_col;
uniform int u_shadow;
varying vec4 v_Color, p;
varying vec2 fTexCoord;
varying vec3 N, L;

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
            float I = 2.0/(length(p)*length(p));

            float Kd = max( dot(N, L), 0.0 );
            gl_FragColor = vec4(0.2,0.2,0.2,1)+v_Color*Kd*I;
        }
    }

}