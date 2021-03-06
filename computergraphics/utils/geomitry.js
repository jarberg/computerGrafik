class baseModel extends transform{
    vertexes = [];
    vertexColors = [];
    normals = [];
    texCoordsArray = [];
    boundingBox = [vec3(0,0,0),vec3(0,0,0),vec3(0,0,0),vec3(0,0,0)]
    shader=null;
    get_b_box(){
        return this.boundingBox
    }
    getShader(){
        return this.shader
    }

    setShader(shader){
        this.shader = shader
        this.dirtyShader = true
    }

    get_vertexes(){
        return this.vertexes
    }

    get_vBuffer(){
        return this.vBuffer
    }
    bBox(p1){
        var p2 = this.boundingBox[0]
        var p3 = this.boundingBox[1]
        var p4 = this.boundingBox[2]
        var p5 = this.boundingBox[3]

        this.boundingBox[0] = vec3(Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.min(p1[2], p2[2]))
        this.boundingBox[1] = vec3(Math.max(p1[0], p3[0]), Math.min(p1[1], p3[1]), Math.min(p1[2], p3[2]))
        this.boundingBox[2] = vec3(Math.min(p1[0], p4[0]), Math.max(p1[1], p4[1]), Math.min(p1[2], p4[2]))
        this.boundingBox[3] = vec3(Math.min(p1[0], p5[0]), Math.min(p1[1], p5[1]), Math.max(p1[2], p5[2]))
    }
}

class model extends baseModel{
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
        this.dirtyShader = true;
        this.shader = program
    }

    initBuffers(){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.tBuffer = gl.createBuffer();
    }



    initDataToBuffers(){

        for (let i = 0; i < this.vertexes.length; i++) {
            this.bBox(this.vertexes[i])
        }

        this.vPosition = gl.getAttribLocation(this.shader, "a_Position");
        this.vColor = gl.getAttribLocation(this.shader, "a_Color");
        this.vNormal = gl.getAttribLocation(this.shader, "vNormal");
        this.vTexCoord = gl.getAttribLocation(this.shader, "vTexCoord");
        this.dirtyShader = false;

        if(this.vPosition>=0) {
        this.initAttributeVariable(this.vPosition, this. vBuffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
        }

        if(this.vColor>=0) {
        this.initAttributeVariable(this.vColor, this. cBuffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);
        }

        if(this.vNormal>=0) {
            this.initAttributeVariable(this.vNormal, this.nBuffer, 4, gl.FLOAT)
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
        }
        if(this.vTexCoord>=0) {
        this.initAttributeVariable(this.vTexCoord, this. tBuffer, 2, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);
        }
    }

    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }

    draw(){
        this.initAttributeVariable(this.vPosition, this.vBuffer, 4, gl.FLOAT)
        this.initAttributeVariable(this.vColor, this.cBuffer, 4, gl.FLOAT)
        this.initAttributeVariable(this.vNormal, this.nBuffer, 4, gl.FLOAT)
        this.initAttributeVariable(this.vTexCoord, this.tBuffer, 2, gl.FLOAT)
    }
}

class IndiceModel extends baseModel{

    indices =[];

    vBuffer;
    nBuffer;
    cBuffer;
    iBuffer;

    constructor(center) {
        super(center);
        this.dirtyShader = true;
        this.initBuffers()
        this.setShader(program)
    }

    initBuffers(){
        this.vBuffer = gl.createBuffer();
        this.cBuffer = gl.createBuffer();
        this.nBuffer = gl.createBuffer();
        this.iBuffer = gl.createBuffer();
    }


    initDataToBuffers(){

        this.vPosition = gl.getAttribLocation(this.shader, "a_Position");
        this.vColor = gl.getAttribLocation(this.shader, "a_Color");
        this.a_normal = gl.getAttribLocation(this.shader, "vNormal");

        this.initAttributeVariable(this.vPosition, this.vBuffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)

        this.initAttributeVariable(this.vColor, this.cBuffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW)

        this.initAttributeVariable(this.a_normal , this.nBuffer, 4, gl.FLOAT)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);


        this.dirtyShader = false

    }
    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
}

class instance extends baseModel{

    constructor(originalModel, position){
        super(position);
        this.original = originalModel
        this.vBuffer = originalModel.vBuffer
    }

    get_b_box() {
        return this.original.get_b_box();
    }

    getShader(){
        return this.original.getShader()
    }
    get_vertexes(){
        return this.original.get_vertexes()
    }
    get_vBuffer(){
        return this.original.get_vBuffer()
    }

    draw(camera){
        this.initAttributeVariable(this.original.vPosition, this.original.vBuffer, 4, gl.FLOAT)
        gl.drawArrays(gl.TRIANGLES, 0, this.original.vertexes.length);
    }

    initAttributeVariable(a_attribute, buffer, size, type) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(a_attribute, size, type, false, 0, 0);
        gl.enableVertexAttribArray(a_attribute);
    }
}

class Sphere extends model{

    divisions= 4;

    constructor(_center) {
        super(_center);
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        tetrahedron(va,vb,vc,vd, this)
        this.initDataToBuffers()
    }

    draw(camera,shadow){
        this.vertexColors = [];
        this.vertexes = [];
        this.normals = [];
        this.texCoordsArray = [];

        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        tetrahedron(va,vb,vc,vd,this)

        gl.useProgram(this.shader)
        if(this.dirtyShader) this.initDataToBuffers()

        super.draw()

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW);


        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shader,"objTransform"), false, flatten(this.local_transformMatrix));
            if (this.use_vcol){
                gl.uniform1i(gl.getUniformLocation(this.shader,"u_usev_col"), 1);
            }
        }

        gl.uniformMatrix4fv( gl.getUniformLocation(this.shader,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(this.shader,"eye"), flatten(camera.eye));

        gl.uniform1i(gl.getUniformLocation(this.shader,"isreflective"), 1)

        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
    }

}

class Dot extends model{

    constructor(_center) {
        super(_center);
        this.vertexes = [vec4(0,0,0,1)];
        this.vertexColors = [vec4(255,255,255,255)];
        this.initDataToBuffers()
    }

    draw(camera){
        gl.useProgram(this.shader)
        if(this.dirtyShader) this.initDataToBuffers()
        else super.draw()

        gl.uniformMatrix3fv(gl.getUniformLocation(this.shader,"normalMatrix"), false, flatten(camera.normalMatrix));
        gl.uniformMatrix4fv(gl.getUniformLocation(this.shader,"objTransform"), false, flatten(this.local_transformMatrix));
        gl.uniformMatrix4fv( gl.getUniformLocation(this.shader,"mTex"), false, flatten(mat4()));
        gl.uniform3fv( gl.getUniformLocation(this.shader,"eye"), flatten(camera.eye));

        gl.uniform1i(gl.getUniformLocation(this.shader,"isreflective"), 0)

        gl.drawArrays(gl.POINTS, 0, this.vertexes.length);
    }

}

class Rectangle extends model{

    vertices = [
        vec4(2,0,-5,1),
        vec4(-2,0,-5,1),
        vec4(-2,0,5,1),
        vec4(2,0,5,1),
    ]
    texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];


    constructor(_center) {
        super();
        quad( 0, 1, 2, 3, this);

        this.initDataToBuffers()
    }

    clear(){
        this.vertexes=[];
        this.vertexColors=[];
        this.texCoordsArray=[];
    }

    draw(camera, shadow = false){

        gl.useProgram(this.shader)

        if(this.dirtyShader) this.initDataToBuffers()
        else super.draw()

        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shader,"objTransform"), false, flatten(this.local_transformMatrix));
        }
        gl.uniform1i(gl.getUniformLocation(this.shader,"u_usev_col"), 0);
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length)
    }

}

class backFace extends model{
    vertices = [
        vec4(1, 1, 0.999),
        vec4(-1, 1, 0.999),
        vec4(-1, -1, 0.999),
        vec4(1, -1, 0.999)
    ];
    texCoord = [
        vec2(-1.5, 0),
        vec2(2.5, 0),
        vec2(2.5, 10),
        vec2(-1.5, 10)
    ];

    constructor() {
        super();
        quad( 0, 1, 2, 3, this);
        this.initDataToBuffers()
    }



    draw(camera, shadow = false){
        super.draw()
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
    use_vcol = false;

    constructor( _center, drawInfo) {
        super(_center);
        this.vertexes = drawInfo.vertices;
        this.normals = drawInfo.normals;
        this.vertexColors = drawInfo.colors;
        this.indices = drawInfo.indices;

        this.initDataToBuffers()
    }

    draw(camera, shadow){
        gl.useProgram(this.shader)
        if(this.dirtyShader) this.initDataToBuffers()

        this.initAttributeVariable(this.vPosition, this.vBuffer, 3, gl.FLOAT)
        this.initAttributeVariable(this.vColor, this.cBuffer, 4, gl.FLOAT)
        this.initAttributeVariable(this.a_normal, this.nBuffer, 3, gl.FLOAT)

        if (!shadow){
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shader,"objTransform"), false, flatten(this.local_transformMatrix));
            if (this.use_vcol){
                gl.uniform1i(gl.getUniformLocation(this.shader,"u_usev_col"), 1);
            }
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
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

    normalsArray.push(vec4(b[0],b[1],b[2],1.0));
    normalsArray.push(vec4(a[0],a[1],a[2],1.0));
    normalsArray.push(vec4(c[0],c[1],c[2],1.0));

    obj.bBox(a)
    obj.bBox(b)
    obj.bBox(c)
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

function quad(a, b, c, d, obj) {

    obj.vertexes.push(obj.vertices[a]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[0]);

    obj.vertexes.push(obj.vertices[b]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[1]);

    obj.vertexes.push(obj.vertices[c]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[2]);

    obj.vertexes.push(obj.vertices[a]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[0]);

    obj.vertexes.push(obj.vertices[c]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[2]);

    obj.vertexes.push(obj.vertices[d]);
    obj.vertexColors.push(obj.vertexColors[a]);
    obj.texCoordsArray.push(obj.texCoord[3]);

    obj.bBox(obj.vertices[a])
    obj.bBox(obj.vertices[b])
    obj.bBox(obj.vertices[c])
    obj.bBox(obj.vertices[d])

    obj.initDataToBuffers()
}