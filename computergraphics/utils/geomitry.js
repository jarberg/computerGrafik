class Sphere{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    transformMatrix = mat4()
    vPosition;
    vColor;
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;

    constructor(_center) {
        this.center = _center
        this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)


        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va,vb,vc,vd,4)
        this.initBuffers(gl,program)
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


    initBuffers(gl, program){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);

        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        this.tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);

        this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)
    }

    draw(){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        var vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        var vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        var vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);

        this.tBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vTexCoord);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)

        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));



        var centerLoc = gl.getUniformLocation(program,"objTransform")
        gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}
class Cube{
    center;
    vertexes = [
        [ 0.5, 0.5, 0.5, 1], //0
        [ 0.5,-0.5, 0.5, 1], //1
        [-0.5,-0.5, 0.5, 1], //2
        [-0.5, 0.5, 0.5, 1], //3
        [ 0.5, 0.5,-0.5, 1], //6
        [ 0.5,-0.5,-0.5, 1], //4
        [-0.5,-0.5,-0.5, 1], //7
        [-0.5, 0.5,-0.5, 1], //5
    ];
    vertexColors = [
        [ 1.0, 0.0, 0.0 ], // red
        [ 0.0, 1.0, 0.0 ],
        [ 0.0, 0.0, 1.0 ],
        [ 1.0, 1.0, 0.0 ],
        [ 1.0, 0.0, 1.0 ],
        [ 0.0, 1.0, 1.0 ],
        [ 1.0, 1.0, 1.0 ]
    ];
    faces = [
        [1, 0, 3, 2],
        [4, 5, 6, 7],
        [7, 6, 2, 3],
        [0, 1, 5, 4],
        [3, 0, 4, 7],
        [6, 5,1, 2 ]
    ];
    indices =[];
    transformMatrix = mat4()
    vPosition;
    vColor;
    vBuffer;
    cBuffer;
    iBuffer;

    constructor(_center) {
        this.center = _center
        this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
        this.transformMatrix = mult(rotateX(0), this.transformMatrix)
        this.transformMatrix = mult(rotateY(0), this.transformMatrix)
        this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
        this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
        this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)

        this.make()
        this.initBuffers(gl,program)
    }
    quad(a, b, c, d) {
        var indices = [ a,b,c, a, c, d ];
        for (var i = 0; i < indices.length; ++i) {
            this.indices.push(indices[i]);
            colorArray.push(this.vertexColors[indices[i]]);
        }
    }
    wireQuad(a,b,c,d){
        var indices = [a,b,b,c,c,d,d,a, b,d];
        for (var i = 0; i < indices.length; ++i) {
            this.indices.push(indices[i]);
            colorArray.push(this.vertexColors[indices[i]]);
        }
    }
    make() {
        for (let i = 0; i < this.faces.length; i++) {
            let face = this.faces[i]
            this.quad(face[0],face[1],face[2],face[3])
        }
    }

    initBuffers(gl, program){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);

        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
    }

    draw(){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        var centerLoc = gl.getUniformLocation(program,"objTransform")
        gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
        //gl.drawElements(gl.POINTS, this.indices.length, gl.UNSIGNED_BYTE, 0);
        //gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    }

}
class Rectangle{
    center;
    vertices = [
        vec4( -4, -1,  10, 1.0 ),
        vec4( 4,  -1,  10, 1.0 ),
        vec4( 4,  -1,  -31, 1.0 ),
        vec4( -4, -1,  -31, 1.0 ),
    ];
    vertexColors = [
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 0.0, 1.0, 0.0, 1.0 )  // green

    ];
    pointsArray = [];
    colorsArray = [];
    texCoordsArray =[];
    normalsArray = [];

    transformMatrix = mat4()

    texCoord = [
        vec2(-1.5, 0),
        vec2(2.5, 0),
        vec2(2.5, 10),
        vec2(-1.5, 10)
    ];

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
        this.initBuffers(gl,program)
    }

    quad(a, b, c, d) {

        this.pointsArray.push(this.vertices[a]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[0]);

        this.pointsArray.push(this.vertices[b]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[1]);

        this.pointsArray.push(this.vertices[c]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[2]);

        this.pointsArray.push(this.vertices[a]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[0]);

        this.pointsArray.push(this.vertices[c]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[2]);

        this.pointsArray.push(this.vertices[d]);
        this.colorsArray.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[3]);
    }

    initBuffers(gl, program){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.pointsArray), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.colorsArray), gl.STATIC_DRAW);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normalsArray), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal)

        gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)
        this.vTexCoord = gl.getAttribLocation( program, "vTexCoord");
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);

    }

    draw(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.enableVertexAttribArray(this.vPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.enableVertexAttribArray(this.vColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.enableVertexAttribArray(this.vNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.enableVertexAttribArray(this.vTexCoord);

        var centerLoc = gl.getUniformLocation(program,"objTransform")
        gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));
        gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.pointsArray.length);
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

    constructor(_center) {
        this.center = _center
        this.transformMatrix = mult(mat4(), translate(this.center))

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