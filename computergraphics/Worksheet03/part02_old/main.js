//
// start here
//
var max_verts = 1000;
var start = [ 0 ];
var buffers = {vBuffer: null, cBuffer: null}
var colors = [
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.5, 0.5, 1.0),
  vec3(0.5, 0.0, 1.0),
  vec3(0.0, 0.5, 1.0),
  vec3(0.1, 0.1, 0.5),
  vec3(0.1, 0.5, 1.0)];

var points = [ ]; var colorArray =[]; var triangles = [ ]; var circles = [ ];

var theta = [0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;

var program = null;

function init(){

  canvas = document.querySelector("#glCanvas");
  //Initialize the GL context
  gl = canvas.getContext("webgl");
  return {
    canvas: document.querySelector("#glCanvas"),
    gl: gl
  }
}
function initBuffers(gl, program){
  buffers.vBuffer = gl.createBuffer();
  buffers.cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec3'], gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);


}

class Cube{
  constructor() {
    this.center =  vec4(-0.5,-1,0,-1)
    this.vertexes = [
      [ 0.5, 0.5, 0.5, 1], //0
      [ 0.5,-0.5, 0.5, 1], //1
      [-0.5,-0.5, 0.5, 1], //2
      [-0.5, 0.5, 0.5, 1], //3
      [ 0.5,-0.5,-0.5, 1], //4
      [ 0.5, 0.5,-0.5, 1], //6
      [-0.5, 0.5,-0.5, 1], //5
      [-0.5,-0.5,-0.5, 1], //7
    ];
    this.vertexColors = [
      [ 0.0, 0.0, 0.0, 1.0 ], // black
      [ 1.0, 0.0, 0.0, 0.0 ], // red
      [ 0.0, 1.0, 0.0, 0.0 ], // yellow
      [ 0.0, 0.0, 1.0, 0.0 ], // green
      [ 0.0, 1.0, 1.0, 0.0 ], // blue
      [ 1.0, 0.0, 1.0, 0.0 ], // magenta
      [ 1.0, 1.0, 1.0, 0.0 ], // white
      [ 1.0, 1.0, 0.0, 0.0 ] // cyan
    ];
    this.faces = [
      [0,1,2,3], //front
      [4,5,6,7], //back
      [5,4,1,0], //right
      [7,6,3,2], //left
      [5,0,3,6], //top
      [2,1,4,7], //bottom
    ];
    this.indices =[];
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i]
      this.indices.push(face[0])
      this.indices.push(face[1])
      this.indices.push(face[2])
      this.indices.push(face[2])
      this.indices.push(face[3])
      this.indices.push(face[0])

    }
    console.log(this.indices)
    this.makeCube()
  }

  quad(a, b, c, d) {
    var indices = [ a, b, c, a, c, d ];
    for (var i = 0; i < indices.length; ++i) {
      points.push(this.vertexes[indices[i]]+this.center);
      colorArray.push(this.vertexColors[indices[i]]);
    }
  }
  makeCube() {
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i]
      this.quad(face[0],face[1],face[2],face[3])
    }
  }
}



var cube1 = new Cube()
var modelViewMatrixLoc = null
function main() {

  constants = init();
  const canvas = constants.canvas;
  const gl = constants.gl;

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  document.getElementById("ButtonX").onclick = function() { theta[0]+=8};//axis = xAxis;};
  document.getElementById("ButtonY").onclick = function() { theta[1]+=8};//axis = yAxis;};
  document.getElementById("ButtonZ").onclick = function() { theta[2]+=8};//axis = zAxis;};

  // Set clear color to black, fully opaque
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  initBuffers(gl, program)
  gl.enable(gl.DEPTH_TEST);
  theta[0] = 10;
  theta[1] = 45;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cube1.vertexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cube1.vertexColors), gl.STATIC_DRAW);

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cube1.indices), gl.STATIC_DRAW);
  //gl.enable(gl.CULL_FACE)
  modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");
  render()
}



function render(){
  console.log(gl.getError())

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ctm = rotateX(theta[xAxis]);
  ctm = mult(ctm, rotateY(theta[yAxis]));
  ctm = mult(ctm, rotateZ(theta[zAxis]));

  width = gl.canvas.clientWidth;
  height = gl.canvas.clientHeight;
  depth = 10
  far = 400
  near = 0.1

  a = (near+far)/(near-far)
  b = (2*near*far)/(near-far)

  f=400
  r=400
  t=400
  n =-f
  l=-r
  b=-t

  beta = (r+l)/(r-l)
  alpha = -(f+n)/(f-n)

  proj = mat4((2*n)/(r-l), 0, (r+l)/(r-l), 0,
      0, (2*n)/(t-b), (t+b)/(t-b), 0,
      0, 0, alpha, beta,
      0, 0, -1, 0,)

  proj = perspective(90,16,1,100)

  matriix = mult(proj,ctm)

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(matriix));

  gl.drawElements(gl.TRIANGLES, cube1.indices.length, gl.UNSIGNED_BYTE, 0);
  gl.drawElements(gl.POINTS, cube1.indices.length, gl.UNSIGNED_BYTE, 0);
  gl.drawElements(gl.LINES, cube1.indices.length, gl.UNSIGNED_BYTE, 0);

  console.log(gl.getError())
  requestAnimFrame(render);

}

window.onload = main;
