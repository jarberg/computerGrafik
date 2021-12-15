class Camera extends transform{

    constructor() {
        super(vec3(0,0,0));
        this.near = 0.1;
        this.far = 500.0;
        this.radius = 8.0;
        this.theta  = 0.0;
        this.phi    = 0.0;
        this.fovy = 90.0;     // Field-of-view in Y direction angle (in degrees)
        this.aspect = 1;       // Viewport aspect ratio

        this.pMatrix = perspective( this.fovy,
            this.aspect,
            this.near,
            this.far);

        this.mvMatrix;

        this.eye = vec3(1,1,0);
        this.up = vec3(0.0, 1.0, 0.0);
        this.at = vec3(this.position)

        this.ip_normal = normalize(subtract(this.at, this.eye));
        this.ip_x_axis = normalize(cross(this.ip_normal, this.up));
        this.ip_y_axis = normalize(cross(this.ip_x_axis, this.ip_normal))

        this.update_projection_matrix()
    }
    get_ray_direc(input){
        var step1 =  scale(input[0], this.ip_x_axis)
        var step2 =  scale(input[1], this.ip_y_axis)
        var step3 =  scale(this.aspect, this.get_position())
        var step4 =  scale(-this.near, this.ip_normal)
        return add(add(add(step1, step2), step3), step4)
    }
    move(vec){
        super.move(vec)
        this.updateEye()
    }

    get_position(){
        return add(super.get_position(), this.eye)
    }

    set_fovy(angle){
        if (this.fovy !== angle){
            this.fovy = angle;
            this.pMatrix = perspective( this.fovy,
                this.aspect,
                this.near,
                this.far);
        gl.uniformMatrix4fv(this.projectionLoc, false, flatten(this.pMatrix));
        }
    }

    update_projection_matrix(){
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM),"projection"), false, flatten(this.pMatrix));
    }

    update(frametime){

        this.mvMatrix = lookAt(this.eye, this.at , this.up);
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
        this.ip_normal = normalize(subtract(this.at, this.eye));
        this.ip_x_axis = normalize(cross(this.ip_normal, this.up));
        this.ip_y_axis = cross(this.ip_x_axis, this.ip_normal)

        this.update_projection_matrix()
    }

    updateHorizontal(input){
        this.phi+=input;
        this.updateEye()
    }

    updateVertical(input){
        this.theta+=input;
        this.updateEye()
    }

    adjustDistance(input){
        this.radius += input*0.01
        this.updateEye()
    }

    updateEye(){
        if( this.theta < 90 || this.theta > 270 ) {
            this.up = [0, 1, 0];

        }else if(this.theta === 90 ) {
            this.up = mult(rotateY(-this.phi), [0, 0, -1, 0]).splice(0,3);
        }else {
            this.up = [0, -1, 0];
        }
        let vAngleRadians = ((-this.theta+90) / 180) * Math.PI;
        let hAngleRadians = ((this.phi+90) / 180) * Math.PI;
        this.at = vec3(this.position)
        this.eye = [
            this.position[0]+-this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
            this.position[1]+-this.radius * Math.cos(vAngleRadians),
            this.position[2]+-this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
        ];
        this.ip_normal = normalize(subtract(this.at, this.eye));
        this.ip_x_axis = normalize(cross(this.ip_normal, this.up));
        this.ip_y_axis = cross(this.ip_x_axis, this.ip_normal)
    }

}


class UICamera extends transform{

    constructor() {
        super(vec3(0,0,0));
        this.eye = vec3(0,0,0);
        this.at = vec3(0.0, 0.0, 0.0);
        this.up = vec3(0.0, 1.0, 0.0);
        this.pMatrix = ortho( -3,
            3,
            -3,
            3,
            0.1,
            30);
        this.mvMatrix = mat4()
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
    }
    update_projection_matrix(){
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM),"projection"), false, flatten(this.pMatrix));
    }
    update(frametime) {
        this.update_projection_matrix()
        this.mvMatrix = mat4()
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
   }
}

class OrbitCamera extends Camera{

    rotate =false;

    constructor() {
        super();
        this.mvMatrix = lookAt(this.eye, this.at , this.up);
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
        this.update_projection_matrix()
    }

    update(frametime){
        this.orbit(frametime)
        this.mvMatrix = lookAt(this.eye, this.at , this.up);
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
        this.update_projection_matrix()
    }


    orbit(frametime){
        if (this.rotate) {
            this.phi+=20*frametime;
        }
        if( this.theta < 90 || this.theta > 270 ) {
            this.up = [0, 1, 0];

        }else if(this.theta === 90 ) {
            this.up = mult(rotateY(-this.phi), [0, 0, -1, 0]).splice(0,3);
        }else {
            this.up = [0, -1, 0];
        }
        let vAngleRadians = ((-this.theta+90) / 180) * Math.PI;
        let hAngleRadians = ((this.phi+90) / 180) * Math.PI;
        this.at = vec3(this.position)
        this.eye = [
            this.position[0]+-this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
            this.position[1]+-this.radius * Math.cos(vAngleRadians),
            this.position[2]+-this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
        ];
    }
}


class QuaternionCamera extends transform{

    constructor() {
        super(vec3(0,0,0));
        this.near = 0.1;
        this.far = 500.0;
        this.radius = 8.0;
        this.theta  = 0.0;
        this.phi    = 0.0;
        this.fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
        this.aspect =1;       // Viewport aspect ratio

        this.pMatrix = perspective( this.fovy,
            this.aspect,
            this.near,
            this.far);

        this.eye = vec3(1,1,1)
        let normalizedEye = normalize(subtract(this.eye, this.position));

        this.rotation = new Quaternion().make_rot_vec2vec([0,0,1], normalizedEye);
        this.up = [0,1,0];

        this.mvMatrix = lookAt(this.eye, this.position, this.up)
        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
        this.update_projection_matrix()
    }

    move(vec){
        super.move(vec)
    }

    set_fovy(angle){
        if (this.fovy !== angle){
            this.fovy = angle;
            this.pMatrix = perspective( this.fovy,
                this.aspect,
                this.near,
                this.far);
            gl.uniformMatrix4fv(this.projectionLoc, false, flatten(this.pMatrix));
        }
    }

    update_projection_matrix(){
        gl.uniformMatrix4fv(gl.getUniformLocation(gl.getParameter(gl.CURRENT_PROGRAM),"projection"), false, flatten(this.pMatrix));
    }

    update(frametime){

    }

    update_cam(){
        var up = this.rotation.apply(this.up);
        var eye = this.rotation.apply([0,0, this.radius]);
        this.mvMatrix = lookAt(eye, this.position , up);
        this.update_projection_matrix()

        this.normalMatrix = [
            vec3(this.mvMatrix[0][0], this.mvMatrix[0][1], this.mvMatrix[0][2]),
            vec3(this.mvMatrix[1][0], this.mvMatrix[1][1], this.mvMatrix[1][2]),
            vec3(this.mvMatrix[2][0], this.mvMatrix[2][1], this.mvMatrix[2][2])
        ];
    }

    adjustDistance(input){
        this.radius += input/100;
        this.update_cam()
    }

    adjustRotation(xAdjustment, yAdjustment){
        let rotationIncrement = new Quaternion().make_rot_vec2vec([0,0,1], this.projectToSphere(xAdjustment, yAdjustment));
        this.rotation = this.rotation.multiply(rotationIncrement)
        this.update_cam()

    }

    projectToSphere(screenX, screenY) {
        let x = screenX / (canvas.height/2.0);
        let y = screenY / (canvas.width/2.0);
        // Project onto sphere
        var r = this.radius;
        var d = Math.sqrt(x * x + y * y);
        var t = r * Math.sqrt(2);
        var z = 0;
        if (d < r) // Inside sphere
            z = Math.sqrt(r * r - d * d);
        else if (d < t)
            z = 0;
        else       // On hyperbola
            z = t * t / d;

        return normalize([x, y, z]);
    }

}


