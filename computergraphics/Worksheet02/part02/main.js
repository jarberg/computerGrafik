//
// start here
//
var max_verts = 1000;
var index = 0; var numPoints = 0;
var colors = [
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.5, 0.5, 1.0),
  vec3(0.5, 0.0, 1.0),
  vec3(0.0, 0.5, 1.0),
  vec3(0.1, 0.1, 0.5),
  vec3(0.1, 0.5, 1.0)];


function init(){

  canvas = document.querySelector("#glCanvas");
// Initialize the GL context
  gl = canvas.getContext("webgl");
  return {
    canvas: document.querySelector("#glCanvas"),
    gl: canvas.getContext("webgl")
  }
}

function main() {

  constants = init();
  const canvas = constants.canvas;
  const gl = constants.gl;

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  var colorMenu = document.getElementById("colorMenu");
  var clearMenu = document.getElementById("clearMenu");
  var clearButton = document.getElementById("clearButton");



  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec3'], gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  //clear button event
  clearButton.addEventListener("click", function(event) {
    var bgcolor = colors[clearMenu.selectedIndex];
    gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.deleteBuffer(vBuffer)
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec2'], gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    index =0;
    numPoints=0;
  });

  //mouseclick event
  canvas.addEventListener("click", function(ev) {

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    var bBox = ev.target.getBoundingClientRect();
    var t = vec2(-1 + 2.0*((ev.clientX-bBox.left)/canvas.width),
        -1 + 2*(canvas.height-ev.clientY+bBox.top)/canvas.height);

    console.log(t[0],t[1])
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(t));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    var t = vec4(colors[colorMenu.selectedIndex]);

    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*(index), flatten(t));

    numPoints = Math.max(numPoints, ++index);
    index %= max_verts;
    requestAnimationFrame(render);
  });

  render(gl)
}

function render(){
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, numPoints);
}

function setupEvents(gl, canvas, vBuffer, clearButton){


}

window.onload = main;
