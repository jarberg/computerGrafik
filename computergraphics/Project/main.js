var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;
var fpsOutput;
var timer = null;
var ground;

var animatedModel = null;
var lightPoint = null;
var shadows;
var shadowShader;
var shadowRender;
var shadowObjects;
var jump = false;


var interMan;


class InteractionManager{

  selectionList;

  constructor() {

    this.selectionList = [];
    this.selectionRenderer = new SelectionRenderer();
    this.selecting = false;

  }

  start_selection(coords){
    this.selectionRenderer.start= coords
  }

  selection_move(coords){
    this.selectionRenderer.mouse_move( coords )
  }

  single_click_selection(coords){
    let id = this.selectionRenderer.single_click_selection_draw(coords, camera, objects)
    console.log(id)
  }

  selection_stop(){
    this.selectionRenderer.stop()
    this.selecting = false
  }

  set_selecting(bool){
    this.selecting = bool
  }

  save_selection(){

  }

  update_mousePos(){

  }


  Draw(camera, objects){
    this.selectionRenderer.draw(camera, objects)
  }

}

function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLUtils.setupWebGL(canvas, );
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  program = initShaders(gl, "render/shaders/vertexShader.glsl", "render/shaders/fragmentShader.glsl");
  gl.useProgram(program);
  gl.clearColor(0.8, 0.8, 0.8, 1.0);
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)
  shadowShader = initShaders(gl, "render/shaders/vertex_shadow.glsl", "render/shaders/fragment_shadow.glsl");
}

function setupControls(){
  fpsOutput = document.getElementById("fpsOutput")
  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
  });
  let rotateLight = document.getElementById("rotate_light")
  rotateLight.addEventListener('input', () =>{
    light.rotate = rotateLight.checked
  });
  let jumpteapot = document.getElementById("jump_pot")
  jumpteapot.addEventListener('input', () =>{
    jump = jumpteapot.checked
  });

  // Mouse Events
  rightMousePressed = false;
  middleMousePressed = false;
  leftMousePressed = false;

  let canvas = document.getElementById("glCanvas")
  canvas.addEventListener('contextmenu', function (e) {
    // do something here...
    e.preventDefault();
  }, false);
    canvas.onmousedown = (e) => {
      e.preventDefault();
      if (e.button === 0) {
        rightMousePressed = true;
      }
      else if (e.button === 1) {
        middleMousePressed = true;
      }
      else if (e.button === 2) {
        leftMousePressed = true;
        var bBox = e.target.getBoundingClientRect();

        interMan.start_selection(vec3(-1 + 2.0*((e.clientX-bBox.left)/canvas.width),
                                      -1 + 2*(canvas.height-e.clientY+bBox.top)/canvas.height,
                                       0))

      }
    }
    canvas.onmouseleave = (e) => {
      e.preventDefault();
      rightMousePressed = false;
      middleMousePressed = false;
      leftMousePressed = false;
    }

    canvas.onmouseup = (e) => {
      e.preventDefault();
      if (e.button === 0) {
        rightMousePressed = false;
      }
      else if (e.button === 1) {
        middleMousePressed = false;
      }
      else if (e.button === 2) {
        leftMousePressed = false;
        if(!interMan.selecting ){
          const rect = canvas.getBoundingClientRect();
          mouseX = e.clientX - rect.left;
          mouseY = e.clientY - rect.top;
          const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
          const pixelY = gl.canvas.height -  mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
          interMan.single_click_selection(vec2(pixelX, pixelY))
        }
      }
    }

    canvas.onmousemove = (e) => {
      e.preventDefault();
      if(leftMousePressed){
        interMan.set_selecting(true);
        var bBox = e.target.getBoundingClientRect();
        interMan.selection_move(
            vec3(-1 + 2.0*((e.clientX-bBox.left)/canvas.width),
                 -1 + 2*(canvas.height-e.clientY+bBox.top)/canvas.height,
                 0))
      }
      else{
        interMan.selection_stop()
      }

      if( middleMousePressed ) {
        if(e.altKey){
          pos = subtract(camera.eye,camera.at)
          camera.move(add(camera.position, add(camera.eye, subtract(camera.eye,camera.at))))
        }
      else{
        camera.updateHorizontal(e.movementX*0.25);
        camera.updateVertical(e.movementY*0.25);
      }
    }
    }

    canvas.onwheel = (e) =>{
      camera.adjustDistance(e.deltaY);
      e.preventDefault();
    }
}



function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  timer = takeTime()
  camera.update(timer)
  light.orbit(timer)


  lightpos = light.get_position()
  var lighteye = lightpos;
  var lightat = add( camera.at, vec3(0.1,0.1,0.1))
  var lightup = vec3(0.0, 1.0, 0.0)
  lightPersp = lookAt(lighteye,lightat , lightup)
  lightpos = light.get_position()

  shadowRender.render(shadowObjects, lightPersp, 1)
  lightPoint.move(light.get_position())


  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader;
    gl.useProgram(shader)
    shadows.bindTexture(1)
    lightpos = light.get_position()
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"objTransform"), false,
        flatten(obj.local_transformMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"projection"), false, flatten(camera.pMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"u_MvpMatrixFromLight"), false, flatten(mult(shadowRender.lightpMatrix, lightPersp)));

    gl.uniform4fv( gl.getUniformLocation(shader,"lightPosition"),  flatten(vec4(lightpos[0],lightpos[1],lightpos[2], 1.0)));
    gl.uniform1i(gl.getUniformLocation(shader, "diffuseTexture"), 1);
    gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),0)
    gl.uniform1i(gl.getUniformLocation(shader, "u_ShadowMap"), 1);

    obj.draw(camera, false);
  }

  if(interMan.selecting){
    interMan.Draw(camera, objects)
  }

  requestAnimFrame(render);
}

function main() {
  init()

  camera = new Camera()
  camera.move(vec3(0,0,0))
  camera.radius = 6
  camera.phi = 10.0
  camera.theta = -10
  camera.set_fovy(45)
  camera.near = -2;

  interMan = new InteractionManager();

  shadows = new ShadowMapBuffer(2048, 2048)
  shadowRender = new ShadowRenderer(shadowShader, shadows)
  shadowObjects = [];

  light = new OrbitPointLight(vec3(0,3,0))
  lightPoint = new Dot(vec3(0,0,0));

  sphere1 = new Sphere();
  sphere1.move(vec3(-1,0,0))
  objects.push(sphere1)

  sphere2 = new Rectangle();
  sphere2.move(vec3(1,0,0))
  objects.push(sphere2)

  shadowObjects.push(sphere1)
  shadowObjects.push(sphere2)

  gl.clearColor(0, 0.5843, 0.9294, 1.0)
  setupControls()
  timer = takeTime()
  render();
}

window.onload = main;
