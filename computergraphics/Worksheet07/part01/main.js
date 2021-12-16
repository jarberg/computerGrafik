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

  program = initShaders(gl, "render/vertexShader.glsl", "render/fragmentShader.glsl");
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

  fpsOutput = document.getElementById("fpsOutput")
  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
  });
}

var texture;
function main() {
  init()
  sphere =new Sphere(vec3(0,0,0))
  sphere.setShader(program)
  objects.push(sphere)
  camera = new OrbitCamera()
  camera.fovy = 45;
  camera.radius = 2

  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls();

  texture = create_cube_map(program, false, 0);

  render()
}

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.update(takeTime())

  var normalMatrix = [
    vec3(camera.mvMatrix[0][0], camera.mvMatrix[0][1], camera.mvMatrix[0][2]),
    vec3(camera.mvMatrix[1][0], camera.mvMatrix[1][1], camera.mvMatrix[1][2]),
    vec3(camera.mvMatrix[2][0], camera.mvMatrix[2][1], camera.mvMatrix[2][2])
  ];
  gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
  gl.uniformMatrix3fv(gl.getUniformLocation( program, "normalMatrix" ), false, flatten(normalMatrix) );
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

  objects.forEach(function(obj) {
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"objTransform"), false,
    flatten(obj.get_local_transform()));
    gl.uniform1i(gl.getUniformLocation(program,'texture'),0);
    obj.initDataToBuffers()
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"mTex"), false, flatten(mat4()));
    gl.drawArrays(gl.TRIANGLES, 0, obj.vertexes.length);
  });

  requestAnimFrame(render);
}

window.onload = main;
