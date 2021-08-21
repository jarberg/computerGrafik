class Sphere{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    transformMatrix = mat4()
    vPosition;
    vColor;
    vBuffer2 = null;
    cBuffer2 = null;
    nBuffer2 = null;
    tBuffer2 = null;


    constructor(_center) {

        this.center = _center
        //this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
        this.transformMatrix = mult( mat4(),translate(_center[0],_center[1],_center[2]))
        this.gl = gl;
        program = shader;
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va,vb,vc,vd,4)
        this.initBuffers()
    }

    triangle(a, b, c){
        this.vertexes.push(a);
        this.vertexes.push(b);
        this.vertexes.push(c);

        this.vertexColors.push(a);
        this.vertexColors.push(b);
        this.vertexColors.push(c);

        this.normals.push(vec4(a[0],a[1],a[2],0.0));
        this.normals.push(vec4(b[0],b[1],b[2],0.0));
        this.normals.push(vec4(c[0],c[1],c[2],0.0));

    }
    divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            this.divideTriangle(a, ab, ac, count - 1);
            this.divideTriangle(ab, b, bc, count - 1);
            this.divideTriangle(bc, c, ac, count - 1);
            this.divideTriangle(ab, bc, ac, count - 1);
        }
        else {
            this.triangle(a, b, c);
        }
    }
    tetrahedron(a, b, c, d, n) {
        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);
    }


    initBuffers(){
        this.vBuffer2 = gl.createBuffer();
        this.cBuffer2 = gl.createBuffer();
        this.nBuffer2 = gl.createBuffer();
        this.tBuffer2 = gl.createBuffer();
    }

    draw(camera){
        this.vertexColors = [];
        this.vertexes = [];
        this.normals = [];
        this.texCoordsArray = [];

        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va,vb,vc,vd,4)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");

        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(mat4()));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"eye"), false, flatten(camera.eye));
        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 1)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}
class Cube{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    vertices = [
        vec4( -4, -1,  -31, 1.0 ),
        vec4( 4,  -1,  -31, 1.0 ),
        vec4( 4,  -1,  10, 1.0 ),
        vec4( -4, -1,  10, 1.0 ),
    ];
    transformMatrix = mat4()
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;
    gl =null
    shader =null

    constructor(_center,gl, shader) {
        console.log(this)
        this.center = _center
        this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
        this.transformMatrix = mult(rotateX(0), this.transformMatrix)
        this.transformMatrix = mult(rotateY(0), this.transformMatrix)
        this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
        this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
        this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)
        this.gl = gl;
        program = shader;

        this.quad( 0, 1, 2, 3 );

        this.initBuffers()
    }

    quad(a, b, c, d) {

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[b]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[1]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[d]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[3]);
    }

    initBuffers(){
        gl.useProgram(program)
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();

    }

    draw(camera){
        //gl.useProgram(program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        this.tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");

        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)

        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"eye"), false, flatten(camera.eye));
        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 1)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}
class Rectangle{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    vertices = [
        vec4( -4, -1,  -31, 1.0 ),
        vec4( 4,  -1,  -31, 1.0 ),
        vec4( 4,  -1,  10, 1.0 ),
        vec4( -4, -1,  10, 1.0 ),
    ];
    transformMatrix = mat4()
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;

    constructor(_center) {
        this.center = _center
        this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
        this.transformMatrix = mult(rotateX(0), this.transformMatrix)
        this.transformMatrix = mult(rotateY(0), this.transformMatrix)
        this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
        this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
        this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)


        this.quad( 0, 1, 2, 3 );

        this.initBuffers()
    }

    quad(a, b, c, d) {

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[b]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[1]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[d]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[3]);
    }

    initBuffers(){
        gl.useProgram(program)
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();

    }

    draw(){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        this.tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");

        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)

        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}
class backFace{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    vertices = [
        vec4(1, 1, 0.999),
        vec4(-1, 1, 0.999),
        vec4(-1, -1, 0.999),
        vec4(1, -1, 0.999)
    ];
    transformMatrix = mat4()
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;
    gl =null
    shader =null

    constructor(_center,gl, shader) {
        this.center = _center
        this.transformMatrix = mult(mat4(), translate(this.center))

        this.gl = gl;
        program = shader;

        this.quad( 0, 1, 2, 3 );

        this.initBuffers()
    }

    quad(a, b, c, d) {

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[b]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[1]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[d]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoordsArray[3]);
    }

    initBuffers(){
        gl.useProgram(program)
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);

    }



    draw(camera){
        gl.useProgram(program)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        var vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);


        gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(mat4()));

        let inverseviewMatrix = camera.mvMatrix;

        inverseviewMatrix = mat4(
            inverseviewMatrix[0][0], inverseviewMatrix[0][1], inverseviewMatrix[0][2], 0,
            inverseviewMatrix[1][0], inverseviewMatrix[1][1], inverseviewMatrix[1][2], 0,
            inverseviewMatrix[2][0], inverseviewMatrix[2][1], inverseviewMatrix[2][2], 0,
            0,                0,                0,                                        0
        );
        let textureMatrix = mult(
            inverseviewMatrix,
            inverse4(camera.pMatrix)
        );

        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(textureMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}