//
// start here
//
var vertices = [  vec2(-0.5, 0), vec2(0.0, 0.5), vec2(0, -0.5),
  vec2(0.5, 0)];
var colors = [
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 0.0,0.0),
  vec3(0.0,1.0, 0.0),
  vec3(0.0, 0.0, 1.0),
  vec3(0.0, 1.0, 1.0) ];

var thetaLoc = null;
var theta = 0.0;

// Initialize the GL context

function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);


  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);


  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  var vColor = gl.getAttribLocation(program, "a_Color");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false,12, 12);
  gl.enableVertexAttribArray(vColor);

  thetaLoc = gl.getUniformLocation(program, "theta");
  gl.uniform1f(thetaLoc, theta);


  render()

  function render()
  {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.01;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);
    requestAnimFrame(render);
  }
}

window.onload = main;
