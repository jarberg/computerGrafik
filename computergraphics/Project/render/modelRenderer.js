
class ModelRenderer{

    constructor(objects){
        this.objects = objects
        this.vBuffer = gl.createBuffer()
        this.tempBuffer = gl.createBuffer()
        this.bBoxShader = initShaders(gl, "render/shaders/selectionShader/vertexShader.glsl", "render/shaders/selectionShader/fragmentShader.glsl")
    }

    add_object(object){
        this.objects.push(object)
    }

    set_objects(objects){
        this.objects = objects
    }

    drawboudningbox(camera, light) {

        var lightpos = light.get_position()
        gl.useProgram( this.bBoxShader)
        for (let i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            let objtransform =obj.local_transformMatrix
            let points = obj.boundingBox

            var vertexes = []

            //face01
            vertexes.push(points[1])
            vertexes.push(points[0])
            vertexes.push(points[2])
            vertexes.push(add(points[2],subtract(points[1], points[0])))
            vertexes.push(points[1])
            vertexes.push(points[2])

            //face02
            vertexes.push(points[3])
            vertexes.push(points[2])
            vertexes.push(points[0])
            vertexes.push(points[3])
            vertexes.push(add(points[3],subtract(points[2], points[0])))
            vertexes.push(points[2])

            //face03
            vertexes.push(points[3])
            vertexes.push(points[0])
            vertexes.push(points[1])
            vertexes.push(points[3])
            vertexes.push(points[1])
            vertexes.push(add(points[3],subtract(points[1], points[0])))

            //face04
            vertexes.push(add(points[3],subtract(points[1], points[0])))
            vertexes.push(points[1])
            vertexes.push(add(points[2],subtract(points[1], points[0])))
            vertexes.push(add(points[2],subtract(points[1], points[0])))
            vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))
            vertexes.push(add(points[3],subtract(points[1], points[0])))

            //face05
            vertexes.push(add(points[2],subtract(points[1], points[0])))
            vertexes.push(points[2])
            vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))
            vertexes.push(points[2])
            vertexes.push(add(points[3],subtract(points[2], points[0])))
            vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))


            gl.uniform4fv( gl.getUniformLocation( this.bBoxShader,"lightPosition"),  flatten( vec4( lightpos[0], lightpos[1], lightpos[2], 1.0 ) ));
            gl.uniformMatrix4fv( gl.getUniformLocation( this.bBoxShader,"objTransform"), false,
                flatten(objtransform));
            gl.uniformMatrix4fv(gl.getUniformLocation( this.bBoxShader,"projection"), false, flatten(camera.pMatrix));
            gl.uniformMatrix4fv( gl.getUniformLocation( this.bBoxShader,"modelViewMatrix"), false, flatten(camera.mvMatrix));

            this.initDataToBuffers( this.bBoxShader, this.tempBuffer, vertexes, 3)

            gl.drawArrays(gl.LINE_LOOP, 0, vertexes.length)

        }
    }
    draw(camera, light, drawBouding) {
        if(drawBouding){
            this.drawboudningbox(camera, light)
        }
        var lightpos = light.get_position()

        for (let i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];
            var shader = obj.getShader();
            gl.useProgram(shader)
            shadowRender.frameBuffer.bindTexture(1)

            gl.uniform4fv( gl.getUniformLocation(shader,"lightPosition"),  flatten( vec4( lightpos[0], lightpos[1], lightpos[2], 1.0 ) ));
            gl.uniformMatrix4fv( gl.getUniformLocation(shader,"objTransform"), false,
                flatten(obj.local_transformMatrix));
            gl.uniformMatrix4fv(gl.getUniformLocation(shader,"projection"), false, flatten(camera.pMatrix));
            gl.uniformMatrix4fv( gl.getUniformLocation(shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));

            gl.uniformMatrix4fv( gl.getUniformLocation(shader,"u_MvpMatrixFromLight"), false, flatten( mult( shadowRender.lightpMatrix, lightPersp )) );
            gl.uniform1i(gl.getUniformLocation(shader, "diffuseTexture"), 1);
            gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),0)
            gl.uniform1i(gl.getUniformLocation(shader, "u_ShadowMap"), 1);

            obj.draw(camera, false);



        }
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