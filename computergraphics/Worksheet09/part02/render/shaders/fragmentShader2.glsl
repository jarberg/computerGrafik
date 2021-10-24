precision mediump float;

uniform int u_usev_col;
uniform int u_shadow;
varying vec4 v_Color, p;
varying vec2 fTexCoord;
varying vec3 N, L;


uniform sampler2D u_ShadowMap;
varying vec4 v_PositionFromLight;

float unpackDepth(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    return dot(rgbaDepth, bitShift);
}
void main()
{


    vec3 shadowCoord = 0.5*(v_PositionFromLight.xyz/v_PositionFromLight.w) + 0.5;
    vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
    float depth = rgbaDepth.r; // Retrieve the z value from R
    float visibility = (shadowCoord.z > depth + 0.005)? 0.7 : 1.0;

    float I = 3.0/(length(p)*length(p));

    float Kd = max( dot(N, L), 0.0 );
    gl_FragColor = vec4(0.2,0.2,0.2,1)+v_Color*Kd*I*visibility;


}