//
// start here
//
var middle = vec2(0.0,0.0)
var vertices = make_circle_array(middle);
var colors = [
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0)];

var thetaLoc = null;
var theta = 0.0;
var bounce=-1+0.3;

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

  thetaLoc = gl.getUniformLocation(program, "theta");


  var vMiddle = gl.getUniformLocation(program, "a_Middle");
  var vBounce = gl.getUniformLocation(program, "bounce");

  gl.uniform2f(vMiddle, middle[0],middle[1]);

  //var cBuffer = gl.createBuffer();
  //gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  //gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  //var vColor = gl.getAttribLocation(program, "a_Color");
  //gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false,0, 0);
  //gl.enableVertexAttribArray(vColor);

  var cof = -1;
  var force =0.1;
  render()

  function render(){

    if(bounce >= 0.2 || bounce <= -0.7){
      if(bounce>=0.2){
        bounce=0.2
      }
      if(bounce<=-0.7){
        bounce=-0.7
      }
      cof*=-1;
    }
    if(cof>0){
      force = force/1.1;
    }
    else{
      force = force*1.1;
    }
    bounce+=force*cof;

    theta+=0.01;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(vBounce, bounce);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
    requestAnimFrame(render);
  }
}

function make_circle_array(){
  let n = 100;
  let r = 0.3;
  var returnArray =[];
  returnArray.push(vec2(0,0));
  for (let i = 0; i < n+1; i++) {
    let angle = 2*Math.PI*i/n
    returnArray.push(vec2((r*Math.cos(angle)), (r*Math.sin(angle))));
  }
  return returnArray;
}

window.onload = main;
