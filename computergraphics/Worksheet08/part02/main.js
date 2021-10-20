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
  gl = canvas.getContext("webgl");
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


  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    if(i>0){
      gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 1);
    }
    else{
      gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 0);
    }
    if(obj.position === ground.position){
      gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), 0);
      obj.draw()
      continue;
    }

    if ( !(obj instanceof PointLight)){
      let lightPosition = light.position;

      let modelLight = mat4();
      let d = -(lightPosition[1]-ground.position[1])+0.01;
      modelLight[3][1] = 1/d;
      modelLight[3][3] = 0;

      let translation = translate(-lightPosition[0], -lightPosition[1], -lightPosition[2]);

      let translationBack = translate(lightPosition[0], lightPosition[1], lightPosition[2]);

      let shadow = mult(translationBack, mult(modelLight, mult(translation, obj.local_transformMatrix)));
      // Send color and matrix for shadow
      gl.uniformMatrix4fv( gl.getUniformLocation(program,"objTransform"), false,
          flatten(shadow));
      obj.draw(camera, true);

    }

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
  objects[0].quad(0,1,2,3)

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
  objects[1].quad(0,1,2,3)

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
  objects[2].quad(0,1,2,3)


  camera = new OrbitCamera()
  camera.move(vec3(1,0,-3.5))
  camera.radius = 10
  camera.phi = 90
  camera.theta = -45
  camera.set_fovy(45)

  objects.push(new PointLight())

  light = objects[3]
  light.translate = vec3(0, 2, -2)

  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls();

  ground = objects[0];
  timer = takeTime()
  render();
}



window.onload = main;
