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
        }
    }
    canvas.onmouseleave = (e) => {
        if (e.button === 0) {
            rightMousePressed = false;
        }
        else if (e.button === 1) {
            middleMousePressed = false;
        }
        else if (e.button === 2) {
            leftMousePressed = false;
        }
        e.preventDefault();
    }
    canvas.onmouseup = (e) => {
        if (e.button === 0) {
            rightMousePressed = false;
        }
        else if (e.button === 1) {
            middleMousePressed = false;
        }
        else if (e.button === 2) {
            leftMousePressed = false;
        }
        e.preventDefault();
    }
    canvas.onmousemove = (e) => {
        if( middleMousePressed ) {
            if(e.altKey){
                pos = subtract(camera.eye,camera.at)
                pos[0]=camera.radius*
                    camera.move(add(camera.position, add(camera.eye, subtract(camera.eye,camera.at))))
            }
            else{
                camera.updateHorizontal(-e.movementX*-0.25);
                camera.updateVertical(e.movementY*0.25);
            }


        }
    }
    canvas.onwheel = (e) =>{
        camera.adjustDistance(e.deltaY);
        console.log(e.deltaY)
        e.preventDefault();
    }

}

var jump = false;



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

    gl.useProgram(ground.shader)
    shadows.bindTexture(1)
    gl.uniform1i(gl.getUniformLocation(ground.shader, "diffuseTexture"), 0);
    gl.uniformMatrix4fv( gl.getUniformLocation(ground.shader,"modelViewMatrix"), false, flatten(camera.mvMatrix));
    gl.uniform1i(gl.getUniformLocation(ground.shader, "u_ShadowMap"), 1);
    gl.uniformMatrix4fv( gl.getUniformLocation(ground.shader,"u_MvpMatrixFromLight"), false, flatten(mult(shadowRender.lightpMatrix,lightPersp)));
    ground.draw(camera)

    gl.depthFunc(gl.GREATER);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE_MINUS_SRC_COLOR, gl.DST_COLOR);

    if(jump){
        sinus_jump(animatedModel)
    }


    gl.disable(gl.BLEND);
    gl.depthFunc(gl.LESS);

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
        gl.uniformMatrix4fv( gl.getUniformLocation(shader,"u_MvpMatrixFromLight"), false, flatten(mult(shadowRender.lightpMatrix,lightPersp)));

        gl.uniform4fv( gl.getUniformLocation(shader,"lightPosition"),  flatten(vec4(lightpos[0],lightpos[1],lightpos[2], 1.0)));
        gl.uniform1i(gl.getUniformLocation(shader, "diffuseTexture"), 1);
        gl.uniform1i(gl.getUniformLocation(shader,"u_shadow"),0)
        gl.uniform1i(gl.getUniformLocation(shader, "u_ShadowMap"), 1);

        obj.draw(camera, false);
    }
    requestAnimFrame(render);
}

function main() {
    init()

    camera = new Camera()
    camera.move(vec3(0,1,0))
    camera.radius = 6
    camera.phi = 10.0
    camera.theta = -10
    camera.set_fovy(45)

    create_image_texture("xamp23.png", configureImageTexture, 0)

    configureTexture(generateredTextureArray(1), 1, 1)

    ground = new Rectangle(vec3(0,0,0))
    ground.vertices = [
        vec4(2,0,-5,1),
        vec4(-2,0,-5,1),
        vec4(-2,0,-1,1),
        vec4(2,0,-1,1),
    ]
    ground.texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];
    ground.clear()
    quad(0,1,2,3,ground)
    ground.move(vec3(0,0,3))

    shadows = new ShadowMapBuffer(512, 512)
    shadowRender = new ShadowRenderer(shadowShader, shadows)
    shadowObjects = [];
    light = new OrbitPointLight(vec3(0,3,0))
    lightPoint = new Dot(vec3(0,0,0));
    loadObjFile("../../models/teacup/teapot.obj", 1, false, (obj) => {

        animatedModel = new Mesh([0,0,0],obj.getDrawingInfo());
        animatedModel.setScale(vec3(0.25, 0.25, 0.25))
        animatedModel.setShader(initShaders(gl, "render/shaders/vertexShader2.glsl", "render/shaders/fragmentShader2.glsl"));
        objects.push(animatedModel);
        shadowObjects.push(animatedModel)
    });

    objects.push(lightPoint)
    shadowObjects.push(ground)


    gl.clearColor(0, 0.5843, 0.9294, 1.0)
    setupControls()
    timer = takeTime()
    render();
}

window.onload = main;
