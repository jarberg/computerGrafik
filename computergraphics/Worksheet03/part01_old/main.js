//
// start here
//

var max_verts = 1000;
var buffers = {vBuffer: null, cBuffer: null}
var colors = [
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.5, 0.5, 1.0),
  vec3(0.5, 0.0, 1.0),
  vec3(0.0, 0.5, 1.0),
  vec3(0.1, 0.1, 0.5),
  vec3(0.1, 0.5, 1.0)];


var cubeVerts = [
  [ 0.5, 0.5, 0.5, 1], //0
  [ 0.5, 0.5,-0.5, 1], //1
  [ 0.5,-0.5, 0.5, 1], //2
  [ 0.5,-0.5,-0.5, 1], //3
  [-0.5, 0.5, 0.5, 1], //4
  [-0.5, 0.5,-0.5, 1], //5
  [-0.5,-0.5, 0.5, 1], //6
  [-0.5,-0.5,-0.5, 1], //7
];

//Look up patterns from cubeVerts for different primitive types
var cubeFaces = [
  [0,4,6,2], //front
  [1,0,2,3], //right
  [5,1,3,7], //back
  [4,5,7,6], //right
  [4,0,1,5], //top
  [6,7,3,2], //bottom
];

//Load a wire frame into points array for Vertex Data Buffer,
//and store drawing information
var points = []; //Declare empty points array
var shapes = {}; //Declare empty shapes object (associative array)

//Use FacesToWireframe something like this
shapes.wireCube = {}; //Declare wireCube as an associative array
shapes.wireCube.Start = points.length;
points = points.concat(cubeVerts);
shapes.wireCube.Vertices = points.length - shapes.wireCube.Start;

var faces = new Array(6);
for (var i = 0; i < faces.length; ++i) {
  faces[i] = new vec3();
}

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
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec3'], gl.STATIC_DRAW);


  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);


}
function main() {

  constants = init();
  const canvas = constants.canvas;
  const gl = constants.gl;
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  initBuffers(gl, program);

  requestAnimationFrame(render);
}

function render(){
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer)
}

window.onload = main;
