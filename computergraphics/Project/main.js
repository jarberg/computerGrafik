var max_verts = 100000;

var lights =[];
var program = null;
var fpsOutput;
var timer = null;

var lightPoint = null;
var drawBBox = false;
var drawSBox = false;
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

  make_bBox_cube(points){
    var vertexes = []
    //face01
    vertexes.push(points[1])
    vertexes.push(points[0])
    vertexes.push(points[2])
    vertexes.push(add(points[2],subtract(points[1], points[0])))
    vertexes.push(points[1])
    vertexes.push(points[2])

    //face02
    vertexes.push(points[3])
    vertexes.push(points[2])
    vertexes.push(points[0])
    vertexes.push(points[3])
    vertexes.push(add(points[3],subtract(points[2], points[0])))
    vertexes.push(points[2])

    //face03
    vertexes.push(points[3])
    vertexes.push(points[0])
    vertexes.push(points[1])
    vertexes.push(points[3])
    vertexes.push(points[1])
    vertexes.push(add(points[3],subtract(points[1], points[0])))

    //face04
    vertexes.push(add(points[3],subtract(points[1], points[0])))
    vertexes.push(points[1])
    vertexes.push(add(points[2],subtract(points[1], points[0])))
    vertexes.push(add(points[2],subtract(points[1], points[0])))
    vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))
    vertexes.push(add(points[3],subtract(points[1], points[0])))

    //face05
    vertexes.push(add(points[2],subtract(points[1], points[0])))
    vertexes.push(points[2])
    vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))
    vertexes.push(points[2])
    vertexes.push(add(points[3],subtract(points[2], points[0])))
    vertexes.push(add(add(points[3],subtract(points[2], points[0])),subtract(points[1], points[0])))
    return vertexes
  }

  selection_move(coords){
    this.selectionRenderer.mouse_move( coords )

    let t1 = camera.get_ray_direc(this.selectionRenderer.botRight)
    let t2 = camera.get_ray_direc(this.selectionRenderer.start)
    let t3 = camera.get_ray_direc(this.selectionRenderer.end)
    let t4 = camera.get_ray_direc(this.selectionRenderer.botLeft)

    let test2 = scale(camera.far-5 ,subtract(camera.at, camera.eye))
    t4 = add(t4, test2)
    var normals = make_normals([t1,t2,t3,t4])

    this.selectionRenderer.region_vertexArray = this.make_bBox_cube([t1,t2,t3,t4])

    for( let i = 0 ; i < modelRenderer.objects.length; i++ ) {
      let realspace_pos = []
      for (let j = 0; j < modelRenderer.objects[i].boundingBox.length; j++) {
        let bBoxP = modelRenderer.objects[i].boundingBox[j]
        let newpos = mult(modelRenderer.objects[i].local_transformMatrix, vec4(bBoxP[0],bBoxP[1],bBoxP[2], 1,0))
        realspace_pos.push(vec3(newpos[0],newpos[1],newpos[2]))
      }
      if(intersects([t1,t2,t3,t4], realspace_pos, normals)){
        console.log(modelRenderer.objects[i])
      }
    }
  }

  single_click_selection(coords){
    this.selectionList = [];
    let id = this.selectionRenderer.draw(camera, modelRenderer.objects, coords)
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
    if(drawSBox && this.selectionRenderer.region_vertexArray.length >0){
      var projection = camera.pMatrix;
      var viewMatrix = camera.mvMatrix;
      gl.useProgram(this.selectionRenderer.selection_indicator_shader)
      gl.uniformMatrix4fv(gl.getUniformLocation(this.selectionRenderer.selection_indicator_shader,"projection"), false, flatten(projection));
      gl.uniformMatrix4fv(gl.getUniformLocation(this.selectionRenderer.selection_indicator_shader,"modelViewMatrix"), false, flatten(viewMatrix));
      gl.uniformMatrix4fv(gl.getUniformLocation(this.selectionRenderer.selection_indicator_shader,"objTransform"), false, flatten(mat4()));

      this.selectionRenderer.initDataToBuffers(this.selectionRenderer.selection_indicator_shader,  this.selectionRenderer.tempBuffer, this.selectionRenderer.region_vertexArray, 3)

      gl.drawArrays(gl.TRIANGLES, 0,this.selectionRenderer.region_vertexArray.length);
    }
  }
}

function init(){
  canvas = document.querySelector("#glCanvas");
  gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"));
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

  let drawBBoxx = document.getElementById("DrawBBoxes")
  drawBBoxx.addEventListener('input', () =>{
    drawBBox = drawBBoxx.checked
  });
  let drawSBoxx = document.getElementById("DrawSBoxes")
  drawSBoxx.addEventListener('input', () =>{
    drawSBox = drawSBoxx.checked
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
          var bBox = e.target.getBoundingClientRect();
          var input = vec3(-1 + 2.0*((e.clientX-bBox.left)/canvas.width),
              -1 + 2*(canvas.height-e.clientY+bBox.top)/canvas.height,
              0)
          interMan.single_click_selection(vec2(input[0], input[1]))
        }
      }
    }
    canvas.onmousemove = (e) => {
      e.preventDefault();
      if(leftMousePressed){
        interMan.set_selecting(true);
        var bBox = e.target.getBoundingClientRect();
        var input = vec3(-1 + 2.0*((e.clientX-bBox.left)/canvas.width),
            -1 + 2*(canvas.height-e.clientY+bBox.top)/canvas.height,
            0)

        interMan.selection_move(input)
      }
      else{
        interMan.selection_stop()
      }

      if( middleMousePressed ) {
        if(e.altKey){
          ''
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
  var lightat = add( camera.at, vec3(0.1, 0.1, 0.1) )
  var lightup = vec3(0.0, 1.0, 0.0)
  lightPersp = lookAt(lighteye,lightat , lightup)
  lightpos = light.get_position()
  lightPoint.move(light.get_position())

  shadowRender.render(lightPersp, 10)
  modelRenderer.draw(camera, light, drawBBox)

  interMan.draw(camera)
  requestAnimFrame(render);
}

function main() {
  init()

  camera = new Camera()
  camera.move(vec3(0, 0, 0))
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
  sphere2 = new Rectangle(vec3(0,-1,0));
  sphere2.move(vec3(0,-1,0))
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
