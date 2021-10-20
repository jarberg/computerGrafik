
class model extends transform{
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];

    vPosition;
    vColor;
    vNormal;
    vTexCoord;

    vBuffer = null;
    cBuffer = null;
    nBuffer = null;
    tBuffer = null;

    constructor(center) {
        super(center);
        this.initBuffers()
    }

    initBuffers(){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();
    }
    initDataToBuffers(){

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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");

    }
}

class IndiceModel extends transform{
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    indices =[];

    vBuffer;
    nBuffer;
    cBuffer;
    iBuffer;

    constructor(center) {
        super(center);
        this.initBuffers()
    }

    initBuffers(){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.iBuffer = gl.createBuffer();
    }
    initDataToBuffers(){

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


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
}

class Sphere extends model{

    divisions= 4;
    vPosition;
    vColor;

    constructor(_center) {
        super(_center);
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        tetrahedron(va,vb,vc,vd, this)
        this.initDataToBuffers()
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
        tetrahedron(va,vb,vc,vd,this)

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
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.local_transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(program,"eye"), flatten(camera.eye));

        gl.uniform1i(gl.getUniformLocation(program,"isreflective"), 1)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}

class Dot extends model{
    vPosition;
    vColor;


    constructor(_center) {
        super(_center);
        this.vertexes = [vec4(0,0,0,1)];
        this.vertexColors = [vec4(255,255,255,255)];
        this.initDataToBuffers()
    }

    draw(camera){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
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

class Rectangle extends model{

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


    constructor(_center) {
        super();
        this.quad( 0, 1, 2, 3 );

        this.initDataToBuffers()
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

    draw(camera, shadow = false){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vPosition)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW)
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vNormal)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW)
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vColor)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW)
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.vTexCoord)

        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.local_transformMatrix));
        }
        gl.uniform1i(gl.getUniformLocation(program,"u_usev_col"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length)
    }

}

class backFace extends model{
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

    constructor() {
        super();
        this.quad( 0, 1, 2, 3 );
        this.initDataToBuffers()
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


    draw(camera, shadow = false){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColor);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vTexCoord);


        gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(mat4()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(mat4()));


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

class Mesh extends IndiceModel{
    use_vcol = true;

    constructor( _center, drawInfo) {
        super(_center);
        this.vertexes = drawInfo.vertices;
        this.normals = drawInfo.normals;
        this.vertexColors = drawInfo.colors;
        this.indices = drawInfo.indices;

        this.initDataToBuffers()
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
            gl.uniformMatrix4fv(gl.getUniformLocation(program,"objTransform"), false, flatten(this.local_transformMatrix));
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

function triangle(a, b, c, obj){
    var vertexArray = obj.vertexes;
    var colourArray = obj.vertexColors;
    var normalsArray = obj.normals;

    vertexArray.push(b);
    vertexArray.push(a);
    vertexArray.push(c);

    colourArray.push(b);
    colourArray.push(a);
    colourArray.push(c);

    normalsArray.push(vec4(b[0],b[1],b[2],0.0));
    normalsArray.push(vec4(a[0],a[1],a[2],0.0));
    normalsArray.push(vec4(c[0],c[1],c[2],0.0));

}

function divideTriangle(a, b, c, count, obj) {
    if (count > 0) {
        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);
        divideTriangle(a, ab, ac, count - 1, obj);
        divideTriangle(ab, b, bc, count - 1, obj);
        divideTriangle(bc, c, ac, count - 1, obj);
        divideTriangle(ab, bc, ac, count - 1, obj);
    }
    else {
        triangle(a, b, c, obj);
    }
}

function tetrahedron(a, b, c, d, obj) {
    var n = obj.divisions
    divideTriangle(a, b, c, n, obj);
    divideTriangle(d, c, b, n, obj);
    divideTriangle(a, d, b, n, obj);
    divideTriangle(a, c, d, n, obj);
}

