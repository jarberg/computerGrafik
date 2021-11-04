
class ShadowRenderer{

    lightpMatrix = perspective( 90,
        1,
        0.1,
        10);

    constructor(shadowShader, shadowFrameBuffer) {
        this.shader = shadowShader
        this.frameBuffer = shadowFrameBuffer
    }

    render(shadowObjects, lightPersp, shadowmapindex){
        this.frameBuffer.bind(shadowmapindex)
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);

        gl.useProgram(shadowShader)
        gl.uniformMatrix4fv( gl.getUniformLocation(shadowShader,"modelViewMatrix"), false, flatten(lightPersp));
        gl.uniformMatrix4fv(gl.getUniformLocation(shadowShader,"projection"), false, flatten(this.lightpMatrix));

        for (let i = 0; i < shadowObjects.length; i++) {
            gl.uniformMatrix4fv( gl.getUniformLocation(shadowShader,"objTransform"), false,
                flatten(shadowObjects[i].local_transformMatrix));
            this.shadowDraw( shadowObjects[i], lightPersp)
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

    get mousPos_pixel(){
        const data = new Uint8Array(4);
        gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            gl.RGBA,           // format
            gl.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
        console.log(id)
        return id
    }
}