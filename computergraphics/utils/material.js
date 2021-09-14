class Material{
    diffuse = vec3(0,0,0)
    transparency = 1.0
    shader
    constructor(_shader){
        this.shader = _shader
    }

}

class StandardMaterial extends Material{

    constructor(){
        super(initShaders(gl, "render/vertexShader.glsl", "render/fragmentShader.glsl"))
    }
}