
class ShadowRenderer{

    lightpMatrix = perspective( 120,
        1,
        0.1,
        10);

    constructor() {
        this.shader = initShaders(gl, "render/shaders/vertex_shadow.glsl", "render/shaders/fragment_shadow.glsl");
        this.frameBuffer = new ShadowMapBuffer(512, 512)
    }

    set_objects(objects){
        this.shadowObjects = objects
    }

    render(lightPersp, shadowmapindex){
        this.frameBuffer.bind(shadowmapindex)
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);

        gl.useProgram(this.shader)
        gl.uniformMatrix4fv( gl.getUniformLocation( this.shader,"modelViewMatrix"), false, flatten(lightPersp));
        gl.uniformMatrix4fv(gl.getUniformLocation( this.shader,"projection"), false, flatten(this.lightpMatrix));

        for (let i = 0; i < this.shadowObjects.length; i++) {
            gl.uniformMatrix4fv( gl.getUniformLocation( this.shader,"objTransform"), false,
                flatten(this.shadowObjects[i].local_transformMatrix));
            this.shadowDraw( this.shadowObjects[i], lightPersp)
        }
        this.frameBuffer.unbind()
        gl.clearColor(0, 0.5843, 0.9294, 1.0)
    }
    shadowDraw(obj){

        var oldshader=obj.shader
        obj.setShader(this.shader)
        obj.draw(camera, false)
        obj.setShader(oldshader)
    }

}