var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;

var division = 2;

var fpsOutput;




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

  camera.update_projection_matrix()
  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix" ), false, camera.normalMatrix);
    obj.draw(camera);
  }
  requestAnimFrame(render);
}



function main() {
  init()

  sphere = new Sphere(vec3(0, 0, 0) )
  objects.push( sphere );
  sphere.setScale(vec3(3,3,3))

  objects[0].divisions = 6
  objects.push( new backFace(vec3(0, 0, 0)) );

  create_cube_map(false, 0)
  create_image_texture("normalmap.png", configureNormalTexture, 1)

  camera = new OrbitCamera();

  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls();

  render();
}

window.onload = main;
