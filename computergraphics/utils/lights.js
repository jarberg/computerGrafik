
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
    }

    draw(camera){
        this.orbit()
        this.pointrender.transformMatrix = translate(this.position)
        this.pointrender.draw(camera);

    }

}


class OrbitPointLight extends PointLight{

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
