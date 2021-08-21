var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;

var division = 2;

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


class Light{
  colorValue = vec3(0,0,0);
  intensity = 1.0;
}

class PointLight extends Light{
  position = vec4(0,0,0,1.0)
  constructor() {
    super();
  }
}

function init(){
  canvas = document.querySelector("#glCanvas");
  gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

}


function setupControls(){
  fpsOutput = document.getElementById("fpsOutput")
  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
  });
}


function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.update(takeTime())

  var normalMatrix = [
    vec3(camera.mvMatrix[0][0], camera.mvMatrix[0][1], camera.mvMatrix[0][2]),
    vec3(camera.mvMatrix[1][0], camera.mvMatrix[1][1], camera.mvMatrix[1][2]),
    vec3(camera.mvMatrix[2][0], camera.mvMatrix[2][1], camera.mvMatrix[2][2])
  ];

  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    camera.update_projection_matrix()
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix" ), false, flatten(normalMatrix));

    obj.draw(camera);
  }
  requestAnimFrame(render);
}



function main() {
  init()


  objects.push( new Sphere(vec4(0, -2, 0, 0) ) );
  objects.push( new backFace(vec4(0, 0, 0, 0)) );
  objects[0].transformMatrix = mult(scalem(3,3,3), objects[0].transformMatrix)
  objects[0].transformMatrix = mult(translate(0,3,0), objects[0].transformMatrix)
  create_cube_map(false)
  create_cube_map( false)

  camera = new Camera();

  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls();
  render();
}

window.onload = main;
