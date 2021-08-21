class Camera{
    constructor() {
        this.near = 0.1;
        this.far = 500.0;
        this.radius = 8.0;
        this.theta  = 0.0;
        this.phi    = 30.0;
        this.fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
        this.aspect =1;       // Viewport aspect ratio

        this.pMatrix = perspective( this.fovy,
            this.aspect,
            this.near,
            this.far);


        this.mvMatrix;
        this.eye;

        this.at = vec3(0.0, 0.0, 0.0);
        this.up = vec3(0.0, 1.0, 0.0);
        this.rotate =false;
        this.projectionLoc = gl.getUniformLocation(program,"projection")
        this.update_projection_matrix()
    }
    update_projection_matrix(){

        gl.uniformMatrix4fv(this.projectionLoc, false, flatten(this.pMatrix));
    }

    update(frametime){
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

        this.eye = [
            -this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
            this.radius * Math.cos(vAngleRadians),
            this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
        ];
        this.mvMatrix = lookAt(this.eye, this.at , this.up);
    }

}
