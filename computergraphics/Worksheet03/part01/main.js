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
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);


}

class Cube{
  constructor() {
    this.vertexes = [
      [ 0.5, 0.5, 0.5, 1], //0
      [ 0.5,-0.5, 0.5, 1], //1
      [-0.5,-0.5, 0.5, 1], //2
      [-0.5, 0.5, 0.5, 1], //3
      [ 0.5, 0.5,-0.5, 1], //6
      [ 0.5,-0.5,-0.5, 1], //4
      [-0.5,-0.5,-0.5, 1], //7
      [-0.5, 0.5,-0.5, 1], //5
    ];
    this.vertexColors = [
      [ 1.0, 0.0, 0.0, 1.0 ], // red
      [ 0.5, 0.5, 0,0, 1.0 ], // yellow
      [ 0.0, 0.0, 1.0, 0.0 ], // yellow
      [ 0.0, 1.0, 1.0, 0.0 ], // green
      [ 0.0, 1.0, 1.0, 1.0 ], // blue
      [ 1.0, 0.0, 1.0, 1.0 ], // magenta
      [ 1.0, 1.0, 1.0, 1.0 ], // white
      [ 1.0, 1.0, 0.0, 1.0 ] // cyan
    ];
    this.faces = [
      [1, 0, 3, 2],
      [4, 5, 6, 7],
      [7, 6, 2, 3],
      [0, 1, 5, 4],
      [0, 3, 7, 4],
      [1, 2, 6, 5]
    ];
    this.indices =[];

    this.makeCube()


  }
  transformMatrix = mat4()
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
  makeCube() {
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i]
      this.wireQuad(face[0],face[1],face[2],face[3])
    }
  }
}



var cube1 = new Cube()

function main() {

  constants = init();
  const canvas = constants.canvas;
  const gl = constants.gl;

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  document.getElementById("ButtonX").onclick = function() {
    theta[xAxis]+=8;
  };//axis = xAxis;};
  document.getElementById("ButtonY").onclick = function() {
    theta[yAxis]+=8
  };//axis = yAxis;};
  document.getElementById("ButtonZ").onclick = function() {
    theta[zAxis]+=8
  };//axis = zAxis;};

  // Set clear color to black, fully opaque
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  initBuffers(gl, program)

  theta[xAxis] = 35.26;
  theta[yAxis] = 45;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cube1.vertexes), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(cube1.vertexColors), gl.STATIC_DRAW);

  var iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cube1.indices), gl.STATIC_DRAW);
  //gl.enable(gl.CULL_FACE)
  cube1.transformMatrix = mult(cube1.transformMatrix, scalem(0.5, 0.5, 0.5));
  render()
}

function render(){
  console.log(gl.getError())
  var modelViewMatrixLoc = gl.getUniformLocation(program,"modelViewMatrix");
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  var S = scalem(0.5, 0.5, 0.5);
  var T = translate(-0.5, 0, 0);
  ctm = translate(0, 0, -0);
  ctm = S //mult(ctm, S)
  ctm = mult(ctm, rotateX(theta[xAxis]))
  ctm = mult(ctm, rotateY(theta[yAxis]));
  ctm = mult(ctm, rotateZ(theta[zAxis]));
  //var c = mult(a, b); // c = a*b



  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));


  //gl.drawElements(gl.TRIANGLES, cube1.indices.length, gl.UNSIGNED_BYTE, 0);
  gl.drawElements(gl.POINTS, cube1.indices.length, gl.UNSIGNED_BYTE, 0);
  gl.drawElements(gl.LINES, cube1.indices.length, gl.UNSIGNED_BYTE, 0);

  console.log(gl.getError())
  requestAnimFrame(render);

}

window.onload = main;
