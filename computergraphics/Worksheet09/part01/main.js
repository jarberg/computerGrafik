var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;
var division = 2;
var fpsOutput;
var timer = null;


class Light{
  colorValue = vec3(0,0,0);
  intensity = 1.0;
}

class PointLight extends Light{
  position = vec4(0,0,0,1.0)
  translate = vec4(0,0,0,1.0)
  rotate = true;
  radius = 2
  theta  = 10.0;
  phi    = 0.0;
  at = vec3(0.0, 0.0, 0.0);
  up = vec3(0.0, 1.0, 0.0);
  constructor() {
    super();
    let vAngleRadians = ((-this.theta+90) / 180) * Math.PI;
    let hAngleRadians = ((this.phi+90) / 180) * Math.PI;

    this.position  = [
      this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
      this.radius * Math.cos(vAngleRadians),
      this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
    ];
    this.pointrender = new Dot(vec4(-1,0,-1,0));
  }

  draw(camera){
    this.orbit()
    this.pointrender.transformMatrix = translate(this.position)
    this.pointrender.draw(camera);

  }

  orbit(){
    if (this.rotate) {
      this.phi=(this.phi+50*timer)%360;
    }
    if( this.theta < 90 || this.theta > 270 ) {
      this.up = [0, 1, 0];

    }else if(this.theta === 90 ) {
      this.up = mult(rotateY(-this.phi), [0, 0, -1, 0]).splice(0,3);
    }else {
      this.up = [0, -1, 0];
    }
    let vAngleRadians = -((this.theta-90) / 180) * Math.PI;
    let hAngleRadians = ((this.phi-90) / 180) * Math.PI;

    this.position  = [
      this.translate[0]+this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
      this.translate[1]+this.radius * Math.cos(vAngleRadians),
      this.translate[2]+this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
    ];
  }
}

function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLUtils.setupWebGL(canvas, { alpha: false });
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
  timer = takeTime()
  camera.update(timer)

  gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 0);
  ground.draw()
  gl.uniform1i(gl.getUniformLocation(program, "lightPosition"), 0);
  light.draw(camera
  )
  sinus_jump(model);

  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];

    let lightPosition = light.position;

    let modelLight = mat4();
    let d = -(lightPosition[1]-ground.position[1])-0.01;
    modelLight[3][1] = 1/d;
    modelLight[3][3] = 0;

    let translation = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);
    let translationBack = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
    let shadow = mult(translationBack, mult(modelLight, mult(translation, obj.transformMatrix)));

    gl.depthFunc(gl.GREATER);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE_MINUS_SRC_COLOR, gl.DST_COLOR);
    // Send color and matrix for shadow
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"objTransform"), false,
        flatten(shadow));
    gl.uniform1i(gl.getUniformLocation(program,"u_shadow"),1)
    obj.draw(camera, true);


  }
  gl.disable(gl.BLEND);
  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];
    gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 1);
    gl.depthFunc(gl.LESS);
    gl.uniform1i(gl.getUniformLocation(program,"u_shadow"),0)
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix" ), false, camera.normalMatrix);
    obj.draw(camera, false);
  }
  requestAnimFrame(render);
}

var ground;
var currentTime = 1;
var model=null;

function main() {
  init()

  create_image_texture("xamp23.png", configureImageTexture, 0)
  ground = new Rectangle(vec4(-2,-1,1,1));
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

  camera = new Camera()
  camera.translate = vec3(0,3,0)
  camera.radius = 4
  camera.phi = 45
  camera.theta = 45
  camera.at= vec3(-1,0,-1)
  camera.set_fovy(45)

  loadObjFile("../../models/teacup/teapot.obj", 1, false, (obj) => {
    console.log(obj.getDrawingInfo());
    model = new Mesh([-4,-5,-4,1],obj.getDrawingInfo());

    model.transformMatrix = mult(scalem(1,1,1), model.transformMatrix )
    objects.push(model);
  });

  light =  new PointLight()
  light.translate = vec3(0, 2, -2)

  gl.clearColor(0, 0.5843, 0.9294, 1.0)

  setupControls()


  timer = takeTime()
  render();
}

function sinus_jump(object){
  if(object != null){
    angle = 2*Math.PI*currentTime/90
    sinAngle = Math.sin(angle)
    object.translate[1] += sinAngle

    transform = mult(translate(object.translate[0],object.translate[1],object.translate[2]), mat4())
    object.transformMatrix  = mult(scalem(0.2,0.2, 0.2),transform)
    if (object.translate[1] >= 1){
      currentTime-=1
    }
    else if (object.translate[1] <= 0){
      currentTime+=1
    }
  }
}



window.onload = main;
