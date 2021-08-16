//
// start here
//

var middle = vec2(0.0,0)
var vertices = make_circle_array(middle);
var colors = [
  vec3(1.0, 1.0, 1.0),
  vec3(1.0, 1.0, 1.0)];




var thetaLoc = null;
var theta = 0.0;
var bounce=-1+0.3;

// Initialize the GL context

function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl");
  now = Date.now()
  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT);


  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "a_Position");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLoc = gl.getUniformLocation(program, "theta");
  var vMiddle = gl.getUniformLocation(program, "a_Middle");

  previous_time = now;
  gl.uniform2f(vMiddle, middle[0],middle[1]);

  //var cBuffer = gl.createBuffer();
  //gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  //gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
  //var vColor = gl.getAttribLocation(program, "a_Color");
  //gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false,0, 0);
  //gl.enableVertexAttribArray(vColor);
  var velocity = vec3(0,0.1,0);
  var v_translate = vec3(0,0,0);

  render()

  function render() {
    now = Date.now();
    elapsed_time = now - previous_time;
    var trans_abs = Math.sqrt(
        Math.max(
            Math.pow(v_translate[0],2)+
                  Math.pow(v_translate[1],2)+
                  Math.pow(v_translate[2],2)
        ,0)
    )

    for (i = 0; i < velocity.length; i++){
      if(v_translate[1] >= 0.7){
        velocity = vec3(0,-0.1,0);
      }
      if(v_translate[1] <= -0.7 ){
        velocity = vec3(0,0.1,0);
      }

      const fps = (now - previous_time)/1000;
      console.log(fps.toFixed(4));

      velocity[i] *= Math.sign(1-trans_abs);
      v_translate[i] += velocity[i]*fps*10;


    }
    gl.uniform3f(vMiddle, v_translate[0],v_translate[1],v_translate[2]);

    theta+=0.01;


    gl.uniform1f(thetaLoc, theta);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
    previous_time = now;
    requestAnimFrame(render);
  }
}

function make_circle_array(){
  let n = 100;
  let r = 0.3;
  var returnArray =[];
  returnArray.push(vec2(0,0));
  for (let i = 0; i < n+1; i++) {
    let angle = 2*Math.PI*i/n
    returnArray.push(vec2((r*Math.cos(angle)), (r*Math.sin(angle))));
  }
  return returnArray;
}

window.onload = main;
