//
// start here
//

var now, elapsed_time, previous_time = 0.0;


var max_verts = 1000;
var start = [ 0 ];

var colors = [
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.5, 0.5, 1.0),
  vec3(0.5, 0.0, 1.0),
  vec3(0.0, 0.5, 1.0),
  vec3(0.1, 0.1, 0.5),
  vec3(0.1, 0.5, 1.0)];

var points = [ ]; var colorArray =[], centerArray =[];

var objects = [];


var theta = [0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

var program = null;


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
      this.wireQuad(face[0],face[1],face[2],face[3])
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

    //gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.POINTS, this.indices.length, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_BYTE, 0);
  }

}
class Camera{
  constructor() {
    this.near = 0.3;
    this.far = 100.0;
    this.radius = 8.0;
    this.theta  = 0.0;
    this.phi    = 0.0;
    this.dr = 5.0 * Math.PI/180.0;

    this.fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
    this.aspect =1;       // Viewport aspect ratio

    this.pMatrix = perspective( this.fovy,
        this.aspect,
        this.near,
        this.far);
    this.mvMatrix;
    this.eye;

    this.at = vec3(0.0, 0.0, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);
    var projectionLoc = gl.getUniformLocation(program,"projection")
    gl.uniformMatrix4fv(projectionLoc, false, flatten(this.pMatrix));
  }
  update(){
    if( this.theta < 90 || this.theta > 270 ) {
      this.up = [0, 1, 0];

    }else if(this.theta === 90 ) {
      this.up = mult(rotateY(-this.phi), [0, 0, -1, 0]).splice(0,3);
    }else {
      this.up = [0, -1, 0];
    }
    let vAngleRadians = ((-this.theta+90) / 180) * Math.PI;
    let hAngleRadians = ((this.phi+90) / 180) * Math.PI;

    // Spherical to cartesian
    this.eye = [
      -this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
      this.radius * Math.cos(vAngleRadians),
      this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
    ];

    this.mvMatrix = lookAt(this.eye, this.at , this.up);
  }

}

function init(){

  canvas = document.querySelector("#glCanvas");
  //Initialize the GL context
  gl = canvas.getContext("webgl");
}


function main() {
  init()

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  // Set clear color to black, fully opaque
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  camera1 = new Camera()


  document.getElementById("ButtonX").onclick = function() {
    theta[xAxis]+=8;
  };//axis = xAxis;};
  document.getElementById("ButtonY").onclick = function() {
    theta[yAxis]+=8
  };//axis = yAxis;};
  document.getElementById("ButtonZ").onclick = function() {
    theta[zAxis]+=8
  };//axis = zAxis;};


  objects.push(new Cube(vec4(-2,0,0,0)))
  objects.push(new Cube(vec4(0,0,0,0)))
  objects.push(new Cube(vec4(2,0,0,0)))



  objects[0].transformMatrix = mult(objects[0].transformMatrix,rotateX(0))
  objects[0].transformMatrix = mult(objects[0].transformMatrix,rotateY(35))
  objects[0].transformMatrix = mult(objects[0].transformMatrix,rotateZ(0))

  objects[1].transformMatrix = mult(objects[1].transformMatrix,rotateX(0))
  objects[1].transformMatrix = mult(objects[1].transformMatrix,rotateY(0))
  objects[1].transformMatrix = mult(objects[1].transformMatrix,rotateZ(0))

  objects[2].transformMatrix = mult(objects[2].transformMatrix,rotateX(-10))
  objects[2].transformMatrix = mult(objects[2].transformMatrix,rotateY(-20))
  objects[2].transformMatrix = mult(objects[2].transformMatrix,rotateZ(-10))


  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  render()
}

function render(){
  now = Date.now()
  elapsed_time = now - previous_time;

  const fps = (now - previous_time)/1000;
  console.log(fps.toFixed(4));

  console.log(gl.getError())
  var modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera1.phi = theta[xAxis]
  camera1.theta = theta[yAxis]

  camera1.update()

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(camera1.mvMatrix));


  objects.forEach(function(obj) {
    obj.draw();
  });

  console.log(gl.getError())
  previous_time = now;
  requestAnimFrame(render);
}

window.onload = main;
