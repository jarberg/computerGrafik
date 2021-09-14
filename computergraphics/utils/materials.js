class Materials{
    diffuse = vec3(0,0,0)
    transparency = 1.0
    constructor(_shader){
        this.shader = _shader
    }

}

class StandardMaterial extends Materials{
    materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
    materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    materialSpecular = vec4( 1, 1, 1, 1.0 );
    materialShininess = 20.0;

    constructor(){
        super(initShaders(gl, "render/vertexShader.glsl", "render/fragmentShader.glsl"))
    }

    draw(camera){
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader,"normalMatrix"), false, flatten(camera.normalMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(this.shader,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(this.shader,"eye"), flatten(camera.eye));
        gl.uniform1i(gl.getUniformLocation(this.shader,"isreflective"), 1)
    }
}