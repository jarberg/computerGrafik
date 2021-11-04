
class SelectionRenderer{
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

    render(){

        gl.useProgram( this.selection_indicator_shader)
        this.draw()
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

    single_click_selection_draw(coords, camera, objects){
        if(objects == null) return;
        if(objects.length < 1) return;

        gl.useProgram(this.selection_ID_shader)

        let projection = camera.pMatrix;
        let viewMatrix = camera.mvMatrix;

        for (let id = 0; id < objects.length; id++) {
            let objtransform = objects[id].local_transformMatrix
            let objVertexArray = objects[id].vertexes

            gl.uniform4fv(gl.getUniformLocation(this.selection_ID_shader,"u_id"), flatten(vec4(((id+1 >>  0) & 0xFF) / 0xFF,
                ((id+1 >>  8) & 0xFF) / 0xFF,
                ((id+1 >> 16) & 0xFF) / 0xFF,
                ((id+1 >> 24) & 0xFF) / 0xFF,)));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"projection"), false, flatten(projection));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"modelViewMatrix"), false, flatten(viewMatrix));
            gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_ID_shader,"objTransform"), false, flatten(objtransform));

            this.initDataToBuffers(this.selection_ID_shader, objects[id].vBuffer, objVertexArray)

            gl.drawArrays(gl.TRIANGLES, 0, objVertexArray.length);
        }
        return this.selectionBuffer.get_pixelData(coords)
    }

    draw(camera, objects){

        this.draw_selection_indicator()

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

    draw_selection_indicator(){
        gl.useProgram(this.selection_indicator_shader)
        this.initDataToBuffers_region()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"projection"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"modelViewMatrix"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"objTransform"), false, flatten(mat4()));
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }

    initDataToBuffers(shader, buffer, vertexData){
        this.vPosition = gl.getAttribLocation(shader, "a_Position");
        this.initAttributeVariable(this.vPosition, buffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexData) , gl.STATIC_DRAW)
    }

    initDataToBuffers_region(){
        this.vPosition = gl.getAttribLocation(this.selection_indicator_shader, "a_Position");
        this.initAttributeVariable(this.vPosition, this.vBuffer, 3, gl.FLOAT)
        let data = flatten([ this.start, this.botLeft, this.end, this.botRight ]);
        gl.bufferData(gl.ARRAY_BUFFER, data , gl.STATIC_DRAW)

    }

    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
}