var max_verts = 100000;
var objects = [];
var lights =[];
var program = null;

var division = 2;

var fpsOutput;
var lightPoint;
var timer = null;



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
  //gl.enable(gl.CULL_FACE)
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

  light.orbit(timer)
  lightPoint.move(light.get_position())

  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];

    if ( !(obj instanceof PointLight)){
      let lightPosition = light.get_position();

      let modelLight = mat4();
      let d = -(lightPosition[1]-ground.position[1])-0.01;
      modelLight[3][1] = 1/d;
      modelLight[3][3] = 0;

      let translation = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);
      let translationBack = translate(lightPosition[0], lightPosition[1], lightPosition[2]);
      let shadow = mult(translationBack, mult(modelLight, mult(translation, obj.local_transformMatrix)));

      gl.depthFunc(gl.GREATER);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE_MINUS_SRC_COLOR, gl.DST_COLOR);
      // Send color and matrix for shadow
      gl.uniformMatrix4fv( gl.getUniformLocation(program,"objTransform"), false,
          flatten(shadow));
      gl.uniform1i(gl.getUniformLocation(program,"u_shadow"),1)
      obj.draw(camera, true);

    }
  }
  gl.disable(gl.BLEND);
  for (let i = 1; i < objects.length; i++) {
    var obj = objects[i];
    gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 1);
    gl.depthFunc(gl.LESS);
    gl.uniform1i(gl.getUniformLocation(program,"u_shadow"),0)
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniformMatrix3fv(gl.getUniformLocation(program, "normalMatrix" ), false, camera.normalMatrix);
    obj.draw(camera);
  }
  requestAnimFrame(render);
}

var ground;

function main() {
  init()

  create_image_texture("xamp23.png", configureImageTexture, 0)
  objects.push(new Rectangle(vec3(-1,-1,1)))
  objects[0].vertices = [
    vec4(2,0,-5,1),
    vec4(-2,0,-5,1),
    vec4(-2,0,-1,1),
    vec4(2,0,-1,1),
  ]
  objects[0].texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ];

  objects[0].clear()
  quad(0,1,2,3,objects[0])

  var mytexels  = generateredTextureArray(1)
  configureTexture(mytexels, 1, 1)

  objects.push(new Rectangle(vec4(-1,0,1)))
  objects[1].vertices = [
    vec4(0.75,-0.5,-1.75,1),
    vec4(0.25,-0.5,-1.75,1),
    vec4(0.25,-0.5,-1.25,1),
    vec4(0.75,-0.5,-1.25,1),
  ]
  objects[1].move(vec3(0,1,0))
  objects[1].texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ];

  objects[1].clear()
  quad(0,1,2,3,objects[1])

  objects.push(new Rectangle(vec4(-1,0,1)))
  objects[2].move(vec3(0,1,0))
  objects[2].vertices = [
    vec4(1,0,-3,1),
    vec4(1,-1,-3,1),
    vec4(1,-1,-2.5,1),
    vec4(1,0,-2.5,1),
  ]
  objects[2].texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
  ];

  objects[2].clear()
  quad(0,1,2,3,objects[2])


  camera = new OrbitCamera()
  camera.move(vec3(1,0,-3.5))
  camera.radius = 10
  camera.phi = 90
  camera.theta = -45
  camera.set_fovy(45)


  light = new OrbitPointLight()
  light.move(vec3(-1, 2, -3))
  light.radius = 3
  lightPoint = new Dot(vec3(0,0,0));
  objects.push(lightPoint)

  light.rotate = true;

  gl.clearColor(0, 0.5843, 0.9294, 1.0)

  setupControls()

  ground = objects[0];
  timer = takeTime()
  render();
}



window.onload = main;
