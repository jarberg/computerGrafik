
class ModelRenderer{

    constructor(objects){
        this.objects = objects
    }

    add_object(){

    }

    set_objects(objects){
        this.objects = objects
    }

    draw(camera, light) {

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
}