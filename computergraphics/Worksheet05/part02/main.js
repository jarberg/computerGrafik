//
// start here
//

var now, elapsed_time, previous_time = 0.0;

var max_verts = 1000;

var times = [];
var fps  = 1;
var lastTime =0;

var points = [ ];
var objects = [];
var lights =[];

var theta = [0, 0, 0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var program = null;
var division = 0;

var fpsOutput;
var rotateCamera;

var lightPosition = vec4(1.0, 3.0, 5.0, 1.0 );
var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.1, 0.1, 0.1, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ambientProduct =  mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

class Mesh{
  center;
  vertexes = [  ];
  vertexColors = [];
  normals =[];
  faces = [];
  indices =[];
  transformMatrix = mat4()
  vPosition;
  vColor;
  vBuffer;
  nBuffer;
  cBuffer;
  iBuffer;

  constructor( _center, drawInfo) {
    this.center = _center
    this.transformMatrix = mult(scalem(2,2,2), this.transformMatrix)
    this.transformMatrix = mult(rotateX(0), this.transformMatrix)
    this.transformMatrix = mult(rotateY(160),this.transformMatrix)
    this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
    this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
    this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)

    this.vertexes = drawInfo.vertices;
    this.normals = drawInfo.normals;
    this.vertexColors = drawInfo.colors;
    this.indices = drawInfo.indices;
    this.initBuffers(gl,program)
  }

  initBuffers(gl, program){
    this.vBuffer = gl.createBuffer();
    this.cBuffer = gl.createBuffer();
    this.nBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    this.vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    this.vColor = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(this.vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vColor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    this.a_normal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(this.a_normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_normal);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW)

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  draw(){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    var centerLoc = gl.getUniformLocation(program,"objTransform")
    gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  }

}
class Camera{
  constructor() {
    this.near = 0.3;
    this.far = 100.0;
    this.radius = 4.0;
    this.theta  = 0.0;
    this.phi    = 0.0;
    this.dr = 5.0 * Math.PI/180.0;

    this.fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
    this.aspect =1;       // Viewport aspect ratio

    this.pMatrix = perspective( this.fovy,
        this.aspect,
        this.near,
        this.far);

    this.mvMatrix;
    this.eye = vec3(0,0,5)

    this.at = vec3(0.0, 0.0, 0.0);
    this.up = vec3(0.0, 1.0, 0.0);
    var projectionLoc = gl.getUniformLocation(program,"projection")
    gl.uniformMatrix4fv(projectionLoc, false, flatten(this.pMatrix));
  }
  update(frametime){
    if (rotateCamera.checked){
      //this.phi +=1*frametime;
      this.theta+=1*frametime;
    }
    this.eye = vec3(
        this.radius*(Math.sin(this.theta)),
        0,
        this.radius*Math.cos(this.theta));

    this.mvMatrix = lookAt(this.eye, this.at , this.up);
  }
}

function waitForMTL(obj, callback){
  if( !obj.isMTLComplete()){
    setTimeout(() => {
      waitForMTL(obj, callback);
    }, 100);
  }else{
    callback(obj);
  }
}
function loadObjFile(fileName, scale, reverse, onLoadCallback){
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if( request.readyState !== 4 ) return;

    if( request.status === 404 )
      throw "Couldn't find obj file '" + fileName + "' (HTTP status 404)";

    // @ts-ignore
    var objDoc = new OBJDoc(fileName); // Create a OBJDoc object
    var loadSuccess = objDoc.parse(request.responseText, scale, reverse);

    if (!loadSuccess)
      throw "Parsing object from '" + fileName + " failed";

    waitForMTL(objDoc, onLoadCallback);
  }
  request.open('GET', fileName, true); // Create a request to get file
  request.send(); // Send the request
}

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
  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

}



function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function setupControls(){
  document.getElementById("mat-slider-shine").oninput = function() {
    materialShininess = this.value;
  };
  let matSpecular = document.getElementById("mat-slider-specular");
  matSpecular.addEventListener('input', () =>{
    let trueValue = hexToRgb(matSpecular.value)
    materialSpecular = vec4(trueValue.r/255,trueValue.g/255,trueValue.b/255,1);
    specularProduct = mult(lightSpecular, materialSpecular);
  });
  let matAmbient = document.getElementById("mat-slider-ambient");
  matAmbient.addEventListener('input', () =>{
    let trueValue = hexToRgb(matAmbient.value)
    materialAmbient = vec4(trueValue.r/255,trueValue.g/255,trueValue.b/255,1);
    ambientProduct = mult(lightAmbient, materialAmbient);
  });

  document.getElementById("mat-slider-shine")

  fpsOutput = document.getElementById("fpsOutput")
  rotateCamera = document.getElementById("rotate_Camera")
}
function main() {

  init();
  setupControls();

  camera1 = new Camera()
  model = null;
  loadObjFile("../../models/charlie/charlie.obj", 1, false, (obj) => {
    console.log(obj.getDrawingInfo());
    model = obj;
    objects.push(new Mesh([0,0,0],obj.getDrawingInfo()));
  });


  render()
}



function render(){


  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (objects.length > 0){
  camera1.update(measurefps())


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
    vec3(camera1.mvMatrix[0][0], camera1.mvMatrix[0][1], camera1.mvMatrix[0][2]),
    vec3(camera1.mvMatrix[1][0], camera1.mvMatrix[1][1], camera1.mvMatrix[1][2]),
    vec3(camera1.mvMatrix[2][0], camera1.mvMatrix[2][1], camera1.mvMatrix[2][2])
  ];

  gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(camera1.mvMatrix));
  gl.uniformMatrix3fv(gl.getUniformLocation( program, "normalMatrix" ), false, flatten(normalMatrix) );

  objects.forEach(function(obj) {
    obj.draw();
  });
  }

  requestAnimFrame(render);
}

function measurefps(){
  var now = performance.now();
  frameRenderTime = (now-lastTime)/1000
  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  fpsOutput.textContent  = "FPS: "+fps;
  lastTime = now
  return frameRenderTime;
}

window.onload = main;
