//
// start here
//

var now, elapsed_time, previous_time = 0.0;

var max_verts = 1000;


var points = [ ]; var colorArray =[];
var objects = [];
var lights =[];

var theta = [0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var program = null;
var division = 0;

var times = [];
var fps  = 1;
var lastTime =0;



function init(){
  canvas = document.querySelector("#glCanvas");
  //Initialize the GL context
  gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  // Set clear color to black, fully opaque
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  //gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

}

var fpsOutput;

var lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 0.1, 0.1, 0.1, 1.0 );
var materialShininess = 20.0;

var ambientProduct =  mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


function setupControls(){
  fpsOutput = document.getElementById("fpsOutput")

  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
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

    }
  }
  canvas.onmousemove = (e) => {
    e.preventDefault();
    if(leftMousePressed){

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



function takeTime(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var now = performance.now();
  frameRenderTime = (now-lastTime)/1000
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  fpsOutput.textContent  = "FPS: "+fps;
  lastTime = now
  return frameRenderTime
}

function configureTexture(image, size) {
  var texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.activeTexture( gl.TEXTURE0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap( gl.TEXTURE_2D );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST_MIPMAP_LINEAR )

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function set_Texture_repeat(){
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
}


function main() {
  init()
  var ground = new Rectangle(vec3(0,0,0))
  ground.vertices = [
    vec4(2,0,-5,1),
    vec4(-2,0,-5,1),
    vec4(-2,0,51,1),
    vec4(2,0,51,1),
  ]
  ground.texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(20, 1),
    vec2(20, 0)
  ];
  ground.clear()
  quad(0,1,2,3,ground)
  ground.move(vec3(0,0,3))
  objects.push(ground)

  camera = new OrbitCamera()
  camera.theta = -45

  camera.radius = 1
  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls()


  var texSize = 256;
  var numRows = 8;
  var numCols = 8;

// Create a checkerboard pattern using floats
  var myTexels = new Uint8Array(4*texSize*texSize);
  for(var i = 0; i < texSize; ++i)
    for(var j = 0; j < texSize; ++j)
    {
      var patchx = Math.floor(i/(texSize/numRows));
      var patchy = Math.floor(j/(texSize/numCols));
      var c = (patchx%2 !== patchy%2 ? 255 : 0);
      var idx = 4*(i*texSize + j);
      myTexels[idx] = myTexels[idx + 1] = myTexels[idx + 2] = c;
      myTexels[idx + 3] = 255;
    }
  configureTexture(myTexels, texSize)
  render()
}

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  camera.update(takeTime())
  camera.updateEye()
  gl.uniform4fv( gl.getUniformLocation(program,
      "ambientProduct"),flatten(ambientProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "diffuseProduct"),flatten(diffuseProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "specularProduct"),flatten(specularProduct) );
  gl.uniform4fv( gl.getUniformLocation(program,
      "lightPosition"),flatten(lightPosition) );
  gl.uniform1f( gl.getUniformLocation(program,
      "shininess"),materialShininess );


  objects.forEach(function(obj) {
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"objTransform"), false,
        flatten(obj.local_transformMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"), false, flatten(camera.pMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera.mvMatrix));


    obj.draw()
  });

  requestAnimFrame(render);
}

window.onload = main;
