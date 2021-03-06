//
// start here
//

var now, elapsed_time, previous_time = 0.0;

var max_verts = 100000;


var points = [ ]; var colorArray =[];
var objects = [];
var lights =[];

var theta = [0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var program = null;
var division = 4;

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

  program = initShaders(gl, "render/vertex_shader.glsl", "render/fragment_shader.glsl");
  gl.useProgram(program);
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

}

var fpsOutput;

var lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 2.0, 2.0, 2.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.3, 0.3, 0.3, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1, 1, 1, 1.0 );
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
  document.getElementById("button_nearest_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST );
  };
  document.getElementById("button_linear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR );
  };
  document.getElementById("button_nearest_mag").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.NEAREST );
  };
  document.getElementById("button_linear_mag").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
        gl.LINEAR );
  };
  document.getElementById("button_repeat").onclick = function() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  };
  document.getElementById("button_clamp").onclick = function() {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  document.getElementById("button_mm_linearLinear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR );
  };
  document.getElementById("button_mm_linearNear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_NEAREST );
  };
  document.getElementById("button_mm_nearestLinear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
  };
  document.getElementById("button_mm_nearestNear_min").onclick = function() {
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_NEAREST );
  };

  fpsOutput = document.getElementById("fpsOutput")
  let rotateCamera = document.getElementById("rotate_Camera")
  rotateCamera.addEventListener('input', () =>{
    camera.rotate = rotateCamera.checked
  });
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


function configureImageTexture(image) {
  texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
      gl.RGB, gl.UNSIGNED_BYTE, image );
  gl.generateMipmap( gl.TEXTURE_2D );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
      gl.NEAREST_MIPMAP_LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function configureTexture(image, size) {
  var texture = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, texture );
  gl.activeTexture( gl.TEXTURE0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap( gl.TEXTURE_2D );

}


function main() {
  init()

  gl.clearColor(0, 0.5843, 0.9294, 1.0);

  setupControls()

  var image = document.createElement('img');
  image.crossorigin = 'anonymous';
  image.onload = function () {
    configureImageTexture(image)
  };
  image.src = 'earth.jpg';

  sphere = new Sphere(vec3(0,0,0))
  objects.push(sphere)

  camera = new OrbitCamera()
  camera.radius = 2

  render()
}

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  camera.update(takeTime())
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

  var normalMatrix = [
    vec3(camera.mvMatrix[0][0], camera.mvMatrix[0][1], camera.mvMatrix[0][2]),
    vec3(camera.mvMatrix[1][0], camera.mvMatrix[1][1], camera.mvMatrix[1][2]),
    vec3(camera.mvMatrix[2][0], camera.mvMatrix[2][1], camera.mvMatrix[2][2])
  ];

  camera.update_projection_matrix(program)
  for (let i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var shader = obj.shader;
    gl.useProgram(shader)

    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"objTransform"), false,
        flatten(obj.local_transformMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(shader,"projection"), false, flatten(camera.pMatrix));
    gl.uniformMatrix4fv( gl.getUniformLocation(shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));

    obj.draw(camera, false);
  }

  requestAnimFrame(render);
}

window.onload = main;
