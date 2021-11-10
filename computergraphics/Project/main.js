var max_verts = 100000;

var lights =[];
var program = null;
var fpsOutput;
var timer = null;

var lightPoint = null;

var interMan;
var modelRenderer;
var shadowRender;

class InteractionManager{

  selectionList;

  constructor() {

    this.selectionList = [];
    this.selectionRenderer = new SelectionRenderer();
    this.selecting = false;
    this.drawIDs = false

  }

  start_selection(coords){
    this.selectionRenderer.start= coords
  }

  selection_move(coords){
    this.selectionRenderer.mouse_move( coords )
  }

  single_click_selection(coords){
    this.selectionList = [];

    let id = this.selectionRenderer.draw(camera, modelRenderer.objects, coords)
    console.log(id)
    if(id > -1){
      this.set_selectionList([modelRenderer.objects[id]])
    }
  }

  selection_stop(){
    this.selectionRenderer.stop()
    this.selecting = false
    this.selectionRenderer.vertexArray = [];
  }

  set_selecting(bool){
    this.selecting = bool
  }

  set_selectionList(selection){
    this.selectionList = selection
  }

  draw(camera){
    if (this.selecting) {
      this.selectionRenderer.draw_selection_region_indicator()
    }
    if(this.selectionList.length > 0 ){
      console.log(this.selectionList)
     this.selectionRenderer.draw_selection(camera, this.selectionList)
    }
  }
}

function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
  //gl = WebGLUtils.setupWebGL(canvas, { alpha: false });
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  program = initShaders(gl, "render/shaders/vertexShader.glsl", "render/shaders/fragmentShader.glsl");
  gl.useProgram(program);
  gl.clearColor(0, 0.5843, 0.9294, 1.0)
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)
}

function setupControls(){
  fpsOutput = document.getElementById("fpsOutput")

  let rotateLight = document.getElementById("rotate_light")
  rotateLight.addEventListener('input', () =>{
    light.rotate = rotateLight.checked
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
  var lightat = add( camera.at, vec3(0.1,0.1,0.1) )
  var lightup = vec3(0.0, 1.0, 0.0)
  lightPersp = lookAt(lighteye,lightat , lightup)
  lightpos = light.get_position()
  lightPoint.move(light.get_position())


  shadowRender.render(lightPersp, 1 )

  modelRenderer.draw(camera, light)

  gl.enable(gl.BLEND);
  interMan.draw(camera)

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
  modelRenderer = new ModelRenderer([])
  shadowRender = new ShadowRenderer()

  light = new OrbitPointLight(vec3(0,3,0))

  lightPoint = new Dot(vec3(0,0,0));
  sphere1 = new Sphere(vec3(0,0,0));
  sphere1.move(vec3(-1,0,0))
  sphere2 = new Rectangle();
  sphere3 = new instance(sphere1, vec3(0,0,0))
  sphere3.move(vec3(1,0,0))

  modelRenderer.set_objects([sphere1, sphere2, sphere3, lightPoint])
  shadowRender.set_objects([sphere1, sphere2,sphere3])

  gl.clearColor(0, 0.5843, 0.9294, 1.0)
  setupControls()
  timer = takeTime()
  render();
}

window.onload = main;
