class Sphere{
    center;
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    transformMatrix = mat4()
    divisions= 4;
    vPosition;
    vColor;
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;


    constructor(_center) {

        this.center = _center
        this.transformMatrix = translate(_center[0],_center[1],_center[2])
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va,vb,vc,vd,this.divisions)
        this.initBuffers()
    }

    triangle(a, b, c){
        this.vertexes.push(b);
        this.vertexes.push(a);
        this.vertexes.push(c);

        this.vertexColors.push(b);
        this.vertexColors.push(a);
        this.vertexColors.push(c);

        this.normals.push(vec4(b[0],b[1],b[2],0.0));
        this.normals.push(vec4(a[0],a[1],a[2],0.0));
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
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();
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
        this.tetrahedron(va,vb,vc,vd,this.divisions)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        this.vNormal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);


        gl.uniformMatrix4fv(gl.getUniformLocation(program,"normalMatrix"), false, flatten(camera.normalMatrix));

        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(program,"eye"), flatten(camera.eye));

        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 1)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}

class Dot{
    center;
    vertexes = [vec4(0,0,0,1)];
    vertexColors = [vec4(255,255,255,255)];
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
        this.transformMatrix = mat4()
        this.transformMatrix = mult( this.transformMatrix, translate(_center[0],_center[1],_center[2]))

        this.initBuffers()
    }


    initBuffers(){
        this.vBuffer2 = gl.createBuffer();
        this.cBuffer2 = gl.createBuffer();
        this.nBuffer2 = gl.createBuffer();
        this.tBuffer2 = gl.createBuffer();

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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer2);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");



    }

    draw(camera){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer2);
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer2);
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer2);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer2);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);


        gl.uniformMatrix4fv(gl.getUniformLocation(program,"normalMatrix"), false, flatten(camera.normalMatrix));
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(program,"eye"), flatten(camera.eye));

        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 1)

        gl.drawArrays(gl.POINTS, 0, this.vertexes.length);
    }

}

class Rectangle{
    center;
    position
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    vertices = [
        vec4( -4, -1,  10, 1.0 ),
        vec4( 4,  -1,  10, 1.0 ),
        vec4( 4,  -1,  -31, 1.0 ),
        vec4( -4, -1,  -31, 1.0 ),
    ];
    texCoord = [
        vec2(-1.5, 0),
        vec2(2.5, 0),
        vec2(2.5, 10),
        vec2(-1.5, 10)
    ];

    transformMatrix = mat4()
    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;

    constructor(_center) {
        this.position = _center
        this.transformMatrix = mat4()
        this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)


        this.quad( 0, 1, 2, 3 );

        this.initBuffers()
    }
    clear(){
        this.vertexes=[];
        this.vertexColors=[];
        this.texCoordsArray=[];
    }

    quad(a, b, c, d) {

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[0]);

        this.vertexes.push(this.vertices[b]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[1]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[2]);

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[0]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[2]);

        this.vertexes.push(this.vertices[d]);
        this.vertexColors.push(this.vertexColors[a]);
        this.texCoordsArray.push(this.texCoord[3]);
    }

    initBuffers(){

        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();

    }

    draw(camera, shadow = false){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)
        var vPosition = gl.getAttribLocation(program, "a_Position")
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vPosition)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW)
        var vNormal = gl.getAttribLocation(program, "vNormal")
        gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vNormal)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW)
        var vColor = gl.getAttribLocation(program, "a_Color")
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vColor)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)
        var vTexCoord = gl.getAttribLocation(program, "vTexCoord")
        gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(vTexCoord)

        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
        }
        gl.uniform1i(gl.getUniformLocation(program,"u_usev_col"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length)
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


    constructor(_center) {
        this.center = _center
        this.transformMatrix = mat4()
        this.transformMatrix = mult(this.transformMatrix, translate(this.center))

        this.quad( 0, 1, 2, 3 );

        this.initBuffers()
    }

    quad(a, b, c, d) {

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(vec4(0.5,0.5,0.8,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[b]);
        this.vertexColors.push(vec4(0.5,0.5,0.5,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[1]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(vec4(0.5,0.8,0.5,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[a]);
        this.vertexColors.push(vec4(0.5,0.5,0.8,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[0]);

        this.vertexes.push(this.vertices[c]);
        this.vertexColors.push(vec4(0.5,0.8,0.5,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[2]);

        this.vertexes.push(this.vertices[d]);
        this.vertexColors.push(vec4(0.8,0.5,0.5,1));
        this.normals.push(this.vertices[a])
        this.texCoordsArray.push(this.texCoordsArray[3]);
    }

    initBuffers(){
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



    draw(camera, shadow = false){
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


        let inverseviewMatrix = camera.mvMatrix;
        inverseviewMatrix = inverse4(inverseviewMatrix)

        let textureMatrix = mult(
            inverseviewMatrix,
            inverse4(camera.pMatrix)
        );
        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 0)
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(textureMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}


class Mesh{
    center;
    vertexes = [  ];
    vertexColors = [];
    normals =[];
    faces = [];
    indices =[];
    translate = vec4(0,0,0,1)
    transformMatrix = mat4()
    vPosition;
    vColor;
    vBuffer;
    nBuffer;
    cBuffer;
    iBuffer;
    use_vcol = true;

    constructor( _center, drawInfo) {
        this.translate = _center
        this.transformMatrix = mult(mat4(), translate(_center[0],_center[1],_center[2]))

        this.vertexes = drawInfo.vertices;
        this.normals = drawInfo.normals;
        this.vertexColors = drawInfo.colors;
        this.indices = drawInfo.indices;
        this.initBuffers()
    }

    initBuffers(){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        this.vPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        this.vColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        this.a_normal = gl.getAttribLocation(program, "vNormal");
        gl.vertexAttribPointer(this.a_normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_normal);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW)

        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    draw(camera, shadow){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.a_normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.a_normal);


        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.transformMatrix));
            if (this.use_vcol){
                var centerLoc = gl.getUniformLocation(program,"u_usev_col")
                gl.uniform1i(centerLoc, 1);
            }
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.uniform1i(gl.getUniformLocation(program,"u_usev_col"), 1);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }

}