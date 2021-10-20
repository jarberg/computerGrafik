var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;
var fpsOutput;
var timer = null;
var ground;
var currentTime = 1;
var animatedModel = null;
var currentShader = null;


function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLUtils.setupWebGL(canvas, { alpha: false });
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  program = initShaders(gl, "render/vertexShader.glsl", "render/fragmentShader.glsl");
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


var uiSphere;
var uicamera;


function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  timer = takeTime()

  camera.update(timer)
  gl.useProgram(program)
  gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 0);
  ground.draw()
  gl.uniform1i(gl.getUniformLocation(program, "lightPosition"), 0);
  light.draw(camera)
  //sinus_jump(animatedModel);

  gl.depthFunc(gl.GREATER);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE_MINUS_SRC_COLOR, gl.DST_COLOR);

  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader;
    gl.useProgram(shader)
    let lightPosition = light.position;


    let modelLight = mat4();
    let d = -(lightPosition[1]-ground.position[1])-0.01;
    modelLight[3][1] = 1/d;
    modelLight[3][3] = 0;

    let translation = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);
    let translationBack = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    let shadow = mult(translationBack, mult(modelLight, mult(translation, obj.local_transformMatrix)));

    // Send color and matrix for shadow
    gl.uniformMatrix4fv( gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM),"objTransform"), false,
        flatten(shadow));
    gl.uniform1i(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM),"u_shadow"),1)
    obj.draw(camera, true);
  }

  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LESS);
  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader;
    gl.useProgram(shader)
    gl.uniform1i(gl.getUniformLocation(shader, "diffuseTexture"), 1);
    gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),0)
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(shader, "normalMatrix" ), false, camera.normalMatrix);
    obj.draw(camera, false);
  }

  //uicamera.update(timer)
  //uiSphere.draw(uicamera)

  requestAnimFrame(render);
}



function main() {
  init()
  create_image_texture("xamp23.png", configureImageTexture, 0)

  //uiSphere = new Sphere();
  //uiSphere.move(vec3(-2,0,-3))
  //uicamera = new UICamera();

  ground = new Rectangle(vec3(0,0,0));
  ground.move(vec3(-3,0,0))
  objects.push(ground)
  ground.vertices = [
    vec4(2,0,-5,1),
    vec4(-2,0,-5,1),
    vec4(-2,0,-1,1),
    vec4(2,0,-1,1),
  ]
  ground.texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ]

  ground.clear()
  ground.quad(0,1,2,3)

  camera = new OrbitCamera()
  camera.move(vec3(-3,0,-3))
  camera.radius = 12
  camera.phi = 0
  camera.theta = -45
  camera.set_fovy(45)

  loadObjFile("../../models/teacup/teapot.obj", 1, false, (obj) => {
    console.log(obj.getDrawingInfo());
    animatedModel = new Mesh([-3,0,-3],obj.getDrawingInfo());
    objects.push(animatedModel);
    animatedModel.setScale(vec3(0.2, 0.2, 0.2))
    animatedModel.setShader(initShaders(gl, "render/vertexShader2.glsl", "render/fragmentShader2.glsl"));
  });


  light =  new OrbitPointLight()
  light.translate = vec3(-3, 2, -3)

  gl.clearColor(0, 0.5843, 0.9294, 1.0)

  setupControls()

  timer = takeTime()
  render();
}

window.onload = main;
