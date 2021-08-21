//
// start here
//

var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;
var division = 4;




function init(){
  canvas = document.querySelector("#glCanvas");
  //Initialize the GL context
  gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  // Set clear color to black, fully opaque
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

}

var fpsOutput;

var lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 2.0, 2.0, 2.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1, 1, 1, 1.0 );
var materialShininess = 20.0;

var ambientProduct =  mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

function setupControls(){
  document.getElementById("button_nearest_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST );
  };
  document.getElementById("button_linear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR );
  };
  document.getElementById("button_nearest_mag").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.NEAREST );
  };
  document.getElementById("button_linear_mag").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.LINEAR );
  };
  document.getElementById("button_repeat").onclick = function() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  };
  document.getElementById("button_clamp").onclick = function() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  document.getElementById("button_mm_linearLinear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR );
  };
  document.getElementById("button_mm_linearNear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_NEAREST );
  };
  document.getElementById("button_mm_nearestLinear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
  };
  document.getElementById("button_mm_nearestNear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_NEAREST );
  };
;
  fpsOutput = document.getElementById("fpsOutput")
  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
  });
}



function main() {
  init()

  objects.push(new Sphere(vec4(0,0,0,0)))
  //objects[0].transformMatrix = mult(scalem(5,5,5), objects[0].transformMatrix)
  camera = new Camera()


  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls();

  objects.push( new Sphere(vec4(0, -2, 0, 0), ) );
  objects.push( new backFace(vec4(0, 0, 0, 0)) );
  objects[0].transformMatrix = mult(scalem(3,3,3), objects[0].transformMatrix)
  objects[0].transformMatrix = mult(translate(0,3,0), objects[0].transformMatrix)
  create_cube_map(false)
  create_cube_map(false)

  render()
}

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  camera.update(takeTime())

  gl.uniform4fv( gl.getUniformLocation(program,
      "ambientProduct"),flatten(ambientProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "diffuseProduct"),flatten(diffuseProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "specularProduct"),flatten(specularProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "lightPosition"),flatten(lightPosition) );
  gl.uniform1f( gl.getUniformLocation(program,
      "shininess"),materialShininess );

  var normalMatrix = [
    vec3(camera.mvMatrix[0][0], camera.mvMatrix[0][1], camera.mvMatrix[0][2]),
    vec3(camera.mvMatrix[1][0], camera.mvMatrix[1][1], camera.mvMatrix[1][2]),
    vec3(camera.mvMatrix[2][0], camera.mvMatrix[2][1], camera.mvMatrix[2][2])
  ];
  gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
  gl.uniformMatrix3fv(gl.getUniformLocation( program, "normalMatrix" ), false, flatten(normalMatrix) );

  objects[0].draw()

  objects[1].draw()


  requestAnimFrame(render);
}

window.onload = main;
