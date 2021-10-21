attribute vec4 a_Position;
uniform mat4 modelViewMatrix;
uniform mat4 projection;
uniform mat4 objTransform;
void main() {
    gl_Position = modelViewMatrix*objTransform*a_Position;
}
