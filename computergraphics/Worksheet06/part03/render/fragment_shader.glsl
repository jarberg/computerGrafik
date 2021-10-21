precision mediump float;
#define PI 3.1415926538


varying vec3 N, L, E;
varying vec3 o_ObserverDirection;
uniform vec4 ambientProduct;
uniform vec4 diffuseProduct;
uniform vec4 specularProduct;
uniform float shininess;
varying vec4 v_Color;
varying  vec2 fTexCoord;
varying float s, t;
uniform sampler2D texture;

void main()
{
    vec4 fColor;

    vec3 surfaceNormal = normalize(N);
    float u = 1.0 - atan(surfaceNormal.z, surfaceNormal.x)/(2.0 * PI);
    float v = acos(surfaceNormal.y)/(PI);

    vec3 directionToObserver = normalize(o_ObserverDirection);
    vec3 directionToLight = normalize(L);

    vec3 H = normalize( L + E );
    vec4 ambient = texture2D( texture, vec2(u, v))*ambientProduct;

    float Kd = max( dot(L, N), 0.0 );
    vec4  diffuse = texture2D( texture, vec2(u, v))*Kd;

    vec3 perfectReflection = normalize(2.0 * dot(directionToLight, surfaceNormal) * surfaceNormal - directionToLight);
    float Ks = pow( max(dot(perfectReflection, directionToObserver), 0.0), shininess );
    vec4  specular = Ks * specularProduct;
    if( dot(L, N) < 0.0 ) specular = vec4(0.0,  0.0, 0.0, 1.0);
    fColor = ambient + diffuse + specular;
    fColor.a = 1.0;
    gl_FragColor = fColor;
}
    