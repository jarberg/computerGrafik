//
// start here
//
var max_verts = 1000;
var start = [ 0 ];
var index = 0; var numPoints = 0;
var mode = 0;
var buffers = {vBuffer: null, cBuffer: null}
var colors = [
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.5, 0.5, 1.0),
  vec3(0.5, 0.0, 1.0),
  vec3(0.0, 0.5, 1.0),
  vec3(0.1, 0.1, 0.5),
  vec3(0.1, 0.5, 1.0)];
var colorMenu;
var clearMenu;
var clearButton ;
var counter = 0;
var points = [ ]; var triangles = [ ]; var circles = [ ];


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

  mode = document.getElementById("modeMenu")

  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  const ColorMode = {
    0: gl.POINTS,
    1: gl.TRIANGLE_STRIP,
    2: gl.TRIANGLE_FAN
  }

  colorMenu = document.getElementById("colorMenu");
  clearMenu = document.getElementById("clearMenu");
  clearButton = document.getElementById("clearButton");


  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  initBuffers(gl, program);

  //clear button event
  clearButton.addEventListener("click", function(event) {
    var bgcolor = colors[clearMenu.selectedIndex];
    index =0
    numPoints =0
    triangles = []
    points =[]
    circles =[]
    gl.clearColor(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT);
  });

  //mouseclick event
  canvas.addEventListener("click", function(ev) {
    var bBox = ev.target.getBoundingClientRect();
    var t = vec2(-1 + 2.0*((ev.clientX-bBox.left)/canvas.width),
        -1 + 2*(canvas.height-ev.clientY+bBox.top)/canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2']*index, flatten(t));
    if (mode.selectedIndex === 0){
      counter = 0;
      points.push(index)
    }
    else if(mode.selectedIndex === 1){
      if(counter >= 2){
        points.pop();
        triangles.push(points.pop())
        counter = 0;
      }
      else{
        points.push(index);
        counter++;
      }
    }
    else if(mode.selectedIndex === 2){
        if(counter >1){
          circles.push(points.pop());
          counter =0;
        }
        else{
          points.push(index);
          counter++;
        }
      }
    var t = vec4(colors[colorMenu.selectedIndex]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*index, flatten(t));
    index++;
    requestAnimationFrame(render);
  });

  render()
}

function render(){
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vBuffer)

  for (var i = 0; i < points.length; ++i) {
    console.log(i, points[i])
    gl.drawArrays(gl.POINTS, points[i], 1);
  }
  for (var i = 0; i < triangles.length; ++i) {
    console.log(i, triangles[i])
    gl.drawArrays(gl.TRIANGLE_STRIP, triangles[i], 3);
  }
  for (var i = 0; i < circles.length; ++i) {
    console.log(i, circles[i])
    gl.drawArrays(gl.TRIANGLE_FAN, circles[i], 20);
  }
}

window.onload = main;
