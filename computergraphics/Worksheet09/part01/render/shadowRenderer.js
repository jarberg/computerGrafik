
class ShadowRenderer{


    constructor(shadowShader, shadowFrameBuffer) {
        this.shader = shadowShader
        this.frameBuffer = shadowFrameBuffer
    }

    render(shadowObjects,lightPersp,shadowmapindex){

        this.frameBuffer.bind(shadowmapindex)
        gl.useProgram(shadowShader)
        for (let i = 0; i < shadowObjects.length; i++) {
            this.shadowDraw( shadowObjects[i], lightPersp)
        }
        this.frameBuffer.unbind()
    }
    shadowDraw(obj,lightPersp){
        var oldshader=obj.shader
        obj.setShader(this.shader)
        gl.uniformMatrix4fv( gl.getUniformLocation(shadowShader,"modelViewMatrix"), false, flatten(lightPersp));
        obj.draw(camera, false)
        obj.setShader(oldshader)
    }
}