
class SelectionRenderer{
    vertexArray = [];
    colorArray = [];
    start;
    end;
    botLeft;
    botRight

    constructor() {
        this.selection_indicator_shader = initShaders(gl, "render/shaders/selectionShader/vertexShader.glsl", "render/shaders/selectionShader/fragmentShader.glsl")
        this.selection_ID_shader = initShaders(gl, "render/shaders/selectionIDShader/vertexShader.glsl", "render/shaders/selectionShader/fragmentShader.glsl")
        this.selectionBuffer = new SelectionBuffer(canvas.width, canvas.height)
        this.vBuffer = gl.createBuffer()
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

    draw(camera, objects){
        this.draw_selection_indicator()

    }

    draw_selection_indicator(){
        gl.useProgram(this.selection_indicator_shader)
        this.initDataToBuffers()
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"projection"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"modelViewMatrix"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.selection_indicator_shader,"objTransform"), false, flatten(mat4()));
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }

    initDataToBuffers(){

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