
class SelectionRenderer{
    vertexArray = [];
    colorArray = [];
    start;
    end;
    botLeft;
    botRight

    constructor() {
        this.selection_indicator_shader = initShaders(gl, "render/shaders/selectionShader/vertexShader.glsl", "render/shaders/selectionShader/fragmentShader.glsl")
        this.selection_ID_shader = initShaders(gl, "render/shaders/selectionIDShader/vertexShader.glsl", "render/shaders/selectionIDShader/fragmentShader.glsl")
        this.selectionBuffer = new SelectionBuffer(canvas.width, canvas.height)
        this.vBuffer = gl.createBuffer()
        this.tempBuffer = gl.createBuffer()
        this.region_vertexArray=[]
    }

    stop(){
        this.vertexArray = [];
        this.colorArray = [];
    }

    mouse_move(coords){
        this.end = coords
        this.botLeft= vec3(this.start[0], coords[1], 0);
        this.botRight = vec3(coords[0], this.start[1], 0);
    }

    draw(camera, objects, coords){

        if(objects == null) return;
        if(objects.length < 1) return;
        this.selectionBuffer.bind()
        gl.useProgram(this.selection_ID_shader)
        let projection = camera.pMatrix;
        let viewMatrix = camera.mvMatrix;

        for (let id = 0; id < objects.length; id++) {
            let objtransform = objects[id].get_local_transform()
            let objVertexArray = objects[id].get_vertexes()
            let realid = id+1
            let test = flatten(vec4(((realid >>  0) & 0xFF) / 0xFF,((realid >>  8) & 0xFF) / 0xFF,((realid >> 16) & 0xFF) / 0xFF,((realid >> 24) & 0xFF) / 0xFF))

            gl.uniform4fv(gl.getUniformLocation(this.selection_ID_shader,"u_id"), test);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"projection"), false, flatten(projection));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"modelViewMatrix"), false, flatten(viewMatrix));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"objTransform"), false, flatten(objtransform));

            this.initDataToBuffers(this.selection_ID_shader, this.tempBuffer, objVertexArray, 4)

            gl.drawArrays(gl.TRIANGLES, 0, objVertexArray.length);
        }
        var id = this.selectionBuffer.get_pixelData(coords)
        this.selectionBuffer.unbind()
        return id
    }

    draw_selection(camera, selection){
        gl.useProgram(this.selection_indicator_shader)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.depthMask(false)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        let projection = camera.pMatrix
        let viewMatrix = camera.mvMatrix
        let objtransform = null
        let objVertexArray = null
        for (var id = 0; id < selection.length; id++) {
            objtransform = selection[id].get_local_transform()
            objVertexArray = selection[id].get_vertexes()

            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"projection"), false, flatten(projection))
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"modelViewMatrix"), false, flatten(viewMatrix))
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"objTransform"), false, flatten(objtransform))

            this.initDataToBuffers(this.selection_indicator_shader,  selection[id].get_vBuffer(), objVertexArray, 4)
            gl.drawArrays(gl.TRIANGLES, 0, objVertexArray.length)
        }
        gl.depthMask(true)
        gl.disable(gl.BLEND)
        gl.depthFunc(gl.LESS )

    }

    draw_selection_region_indicator(){
        gl.useProgram(this.selection_indicator_shader)
        this.initDataToBuffers(this.selection_indicator_shader, this.vBuffer, [ this.start, this.botLeft, this.end, this.botRight ], 3)
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"projection"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"modelViewMatrix"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"objTransform"), false, flatten(mat4()));
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }

    initDataToBuffers(shader, buffer, vertexData, size){
        this.vPosition = gl.getAttribLocation(shader, "a_Position");
        this.initAttributeVariable(this.vPosition, buffer, size, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexData) , gl.STATIC_DRAW)
    }
    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }

}