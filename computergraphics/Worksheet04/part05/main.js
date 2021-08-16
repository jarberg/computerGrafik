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

class Sphere{
  center;
  vertexes = [];
  vertexColors = [];
  normals = [];
  transformMatrix = mat4()
  vPosition;
  vColor;

  vBuffer = null;
  cBuffer = null;
  nBuffer = null;

  constructor(_center) {
    this.center = _center
    this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
    this.transformMatrix = mult(rotateX(0), this.transformMatrix)
    this.transformMatrix = mult(rotateY(0), this.transformMatrix)
    this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
    this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
    this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)


    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    this.tetrahedron(va,vb,vc,vd,division)
    this.initBuffers(gl,program)
  }

  triangle(a, b, c){
    this.vertexes.push(a);
    this.vertexes.push(b);
    this.vertexes.push(c);

    var p1 = subtract(b,a);
    var p2 = subtract(c,a);

    p1 = normalize(p1)
    p2 = normalize(p2)

    var normal = cross(p1,p2)
    normal = normalize(normal)

    //a = normal[0];
    //b = normal[1];
    //c = normal[2];

    this.normals.push(vec4(a[0],a[1],a[2],0.0));
    this.normals.push(vec4(b[0],b[1],b[2],0.0));
    this.normals.push(vec4(c[0],c[1],c[2],0.0));

  }
  divideTriangle(a, b, c, count) {
    if (count > 0) {
      var ab = normalize(mix(a, b, 0.5), true);
      var ac = normalize(mix(a, c, 0.5), true);
      var bc = normalize(mix(b, c, 0.5), true);
      this.divideTriangle(a, ab, ac, count - 1);
      this.divideTriangle(ab, b, bc, count - 1);
      this.divideTriangle(bc, c, ac, count - 1);
      this.divideTriangle(ab, bc, ac, count - 1);
    }
    else {
      this.triangle(a, b, c);
    }
  }
  tetrahedron(a, b, c, d, n) {
    this.divideTriangle(a, b, c, n);
    this.divideTriangle(d, c, b, n);
    this.divideTriangle(a, d, b, n);
    this.divideTriangle(a, c, d, n);
  }


  initBuffers(gl, program){
    this.vBuffer = gl.createBuffer();
    this.cBuffer = gl.createBuffer();
    this.nBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,max_verts*sizeof['vec4'], gl.STATIC_DRAW);
    this.vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,max_verts*sizeof['vec4'], gl.STATIC_DRAW);
    this.vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(this.vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vNormal);

  }

  draw(){
    this.vertexColors = [];
    this.vertexes = [];
    this.normals = [];

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    this.tetrahedron(va,vb,vc,vd,division)

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

    var centerLoc = gl.getUniformLocation(program,"objTransform")
    gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, this.vertexes.length);
  }

}
class Cube{
  center;
  vertexes = [
    [ 0.5, 0.5, 0.5, 1], //0
    [ 0.5,-0.5, 0.5, 1], //1
    [-0.5,-0.5, 0.5, 1], //2
    [-0.5, 0.5, 0.5, 1], //3
    [ 0.5, 0.5,-0.5, 1], //6
    [ 0.5,-0.5,-0.5, 1], //4
    [-0.5,-0.5,-0.5, 1], //7
    [-0.5, 0.5,-0.5, 1], //5
  ];
  vertexColors = [
    [ 1.0, 0.0, 0.0 ], // red
    [ 0.0, 1.0, 0.0 ],
    [ 0.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0 ],
    [ 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 1.0 ],
    [ 1.0, 1.0, 1.0 ]
  ];
  faces = [
    [1, 0, 3, 2],
    [4, 5, 6, 7],
    [7, 6, 2, 3],
    [0, 1, 5, 4],
    [3, 0, 4, 7],
    [6, 5,1, 2 ]
  ];
  indices =[];
  transformMatrix = mat4()
  vPosition;
  vColor;
  vBuffer;
  cBuffer;
  iBuffer;

  constructor(_center) {
    this.center = _center
    this.transformMatrix = mult(scalem(1,1,1), this.transformMatrix)
    this.transformMatrix = mult(rotateX(0), this.transformMatrix)
    this.transformMatrix = mult(rotateY(0), this.transformMatrix)
    this.transformMatrix = mult(rotateZ(0), this.transformMatrix)
    this.transformMatrix = mult(translate(0,0,0), this.transformMatrix)
    this.transformMatrix = mult(translate(_center[0],_center[1],_center[2]), this.transformMatrix)

    this.make()
    this.initBuffers(gl,program)
  }
  quad(a, b, c, d) {
    var indices = [ a,b,c, a, c, d ];
    for (var i = 0; i < indices.length; ++i) {
      this.indices.push(indices[i]);
      colorArray.push(this.vertexColors[indices[i]]);
    }
  }
  wireQuad(a,b,c,d){
    var indices = [a,b,b,c,c,d,d,a, b,d];
    for (var i = 0; i < indices.length; ++i) {
      this.indices.push(indices[i]);
      colorArray.push(this.vertexColors[indices[i]]);
    }
  }
  make() {
    for (let i = 0; i < this.faces.length; i++) {
      let face = this.faces[i]
      this.quad(face[0],face[1],face[2],face[3])
    }
  }

  initBuffers(gl, program){
    this.vBuffer = gl.createBuffer();
    this.cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, max_verts*sizeof['vec4'], gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    this.vPosition = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);


    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    this.vColor = gl.getAttribLocation(program, "a_Color");
    gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexes), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(this.indices), gl.STATIC_DRAW);
  }

  draw(){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    var centerLoc = gl.getUniformLocation(program,"objTransform")
    gl.uniformMatrix4fv(centerLoc, false, flatten(this.transformMatrix));

    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
    //gl.drawElements(gl.POINTS, this.indices.length, gl.UNSIGNED_BYTE, 0);
    //gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_BYTE, 0);
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
    this.eye = vec3(0,0,-2)

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

    gl.uniformMatrix4fv(gl.getUniformLocation(program,"a_camPos"), false, flatten(this.eye));
  }

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

var fpsOutput;
var rotateCamera;

var lightPosition = vec4(0.0, 0.0, -1.0, 0.0 );
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

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function main() {
  init()

  document.getElementById("subdivisions").oninput = function() {
    division = this.value;
    document.getElementById("subdivNum").textContent = division
  };
  document.getElementById("mat-slider-shine").oninput = function() {
    materialShininess = this.value;
  };
  let matDiffuse = document.getElementById("mat-slider-diffuse");
  matDiffuse.addEventListener('input', () =>{
    let trueValue = hexToRgb(matDiffuse.value)
    materialDiffuse = vec4(trueValue.r/255,trueValue.g/255,trueValue.b/255,1);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
  });
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

  objects.push(new Sphere(vec4(0,0,0,0)))
  camera1 = new Camera()




  render()
}

var times = [];
var fps  = 1;
var lastTime =0;

function render(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var now = performance.now();
  frameRenderTime = (now-lastTime)/1000
  camera1.update(frameRenderTime)


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

  while (times.length > 0 && times[0] <= now - 1000) {
    times.shift();
  }
  times.push(now);
  fps = times.length;

  fpsOutput.textContent  = "FPS: "+fps;
  lastTime = now
  requestAnimFrame(render);
}

window.onload = main;
