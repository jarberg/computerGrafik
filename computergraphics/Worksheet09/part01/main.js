var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;
var fpsOutput;
var timer = null;
var ground;
var currentTime = 1;
var animatedModel = null;
var lightPoint = null;


function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLUtils.setupWebGL(canvas, );
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


function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LESS);

  timer = takeTime()
  camera.update(timer)

  light.orbit(timer)
  gl.useProgram(lightPoint.shader)
  gl.uniformMatrix4fv( gl.getUniformLocation(lightPoint.shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
  gl.uniformMatrix3fv(gl.getUniformLocation(lightPoint.shader, "normalMatrix" ), false, camera.normalMatrix);

  lightPoint.move(light.get_position())
  lightPoint.draw(camera);

  gl.useProgram(ground.shader)
  gl.uniform1i(gl.getUniformLocation(ground.shader, "diffuseTexture"), 0);
  gl.uniformMatrix4fv( gl.getUniformLocation(ground.shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
  gl.uniformMatrix3fv(gl.getUniformLocation(ground.shader, "normalMatrix" ), false, camera.normalMatrix);

  ground.draw(camera)

  gl.depthFunc(gl.GREATER);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE_MINUS_SRC_COLOR, gl.DST_COLOR);
  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader
    gl.useProgram(shader)
    camera.update(timer)

    let lightPosition = light.get_position();

    let modelLight = mat4();
    let d = -(lightPosition[1]-ground.position[1])-0.01;
    modelLight[3][1] = 1/d;
    modelLight[3][3] = 0;

    let translation = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);
    let translationBack = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    let shadow = mult(translationBack, mult(modelLight, mult(translation, obj.local_transformMatrix)));

    // Send color and matrix for shadow
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"objTransform"), false,
        flatten(shadow));
    gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),1)
    obj.draw(camera, true);
  }
  gl.disable(gl.BLEND);
  gl.depthFunc(gl.LESS);

  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader;
    gl.useProgram(shader)

    gl.uniform1i(gl.getUniformLocation(shader, "diffuseTexture"), 1);
    gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),0)
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(shader, "normalMatrix" ), false, camera.normalMatrix);
    obj.draw(camera, false);
  }
  requestAnimFrame(render);
}



function main() {
  init()
  camera = new OrbitCamera()
  camera.move(vec3(0,0,0))
  camera.radius = 12
  camera.phi = 10.0
  camera.theta = -45
  camera.set_fovy(45)

  create_image_texture("xamp23.png", configureImageTexture, 0)
  configureTexture(generateredTextureArray(1), 1, 1)

  ground = new Rectangle(vec3(0,0,0))
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
  ];
  ground.clear()
  ground.quad(0,1,2,3)
  ground.move(vec3(0,0,3))

  light = new OrbitPointLight(vec3(0,2,0))
  lightPoint = new Dot(vec3(0,2,0));


  loadObjFile("../../models/teacup/teapot.obj", 1, false, (obj) => {
    console.log(obj.getDrawingInfo());
    animatedModel = new Mesh([0,0,0],obj.getDrawingInfo());
    animatedModel.setScale(vec3(0.2, 0.2, 0.2))
    animatedModel.setShader(initShaders(gl, "render/vertexShader2.glsl", "render/fragmentShader2.glsl"));
    objects.push(animatedModel);
  });

  gl.clearColor(0, 0.5843, 0.9294, 1.0)

  setupControls()
  timer = takeTime()
  render();
}

window.onload = main;
