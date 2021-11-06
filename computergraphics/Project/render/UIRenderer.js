
class UIRenderer{
    vertexArray = [];
    colorArray = [];
    start;
    end;
    botLeft;
    botRight
    buf;

    constructor() {
        this.selection_indicator_shader = initShaders(gl, "render/shaders/selectionShader/vertexShader.glsl", "render/shaders/selectionShader/fragmentShader.glsl")
        this.selection_ID_shader = initShaders(gl, "render/shaders/selectionIDShader/vertexShader.glsl", "render/shaders/selectionIDShader/fragmentShader.glsl")
        this.selectionBuffer = new SelectionBuffer(canvas.width, canvas.height)
        this.vBuffer = gl.createBuffer()
        this.buf = gl.createBuffer()
    }


    draw(camera, objects){

        if(objects == null) return;
        if(objects.length < 1) return;

        gl.useProgram(this.selection_ID_shader)

        let projection = camera.pMatrix;
        let viewMatrix = camera.mvMatrix;

        for (let id = 0; id < objects.length; id++) {
            let objtransform = objects[id].local_transformMatrix
            let objVertexArray = objects[id].vertexes

            gl.uniform4fv(gl.getUniformLocation(this.selection_ID_shader,"u_id"), flatten(vec4(((id >>  0) & 0xFF) / 0xFF,
                                                                                                     ((id >>  8) & 0xFF) / 0xFF,
                                                                                                     ((id >> 16) & 0xFF) / 0xFF,
                                                                                                     ((id >> 24) & 0xFF) / 0xFF,)));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"projection"), false, flatten(projection));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"modelViewMatrix"), false, flatten(viewMatrix));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"objTransform"), false, flatten(objtransform));

            this.initDataToBuffers(this.selection_ID_shader, objects[id].vBuffer, objVertexArray)

            gl.drawArrays(gl.TRIANGLES, 0, objVertexArray.length);
        }
    }

    initDataToBuffers(shader, buffer, vertexData){
        let vPosition = gl.getAttribLocation(shader, "a_Position");
        this.initAttributeVariable( vPosition, buffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexData) , gl.STATIC_DRAW)
    }

    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
}