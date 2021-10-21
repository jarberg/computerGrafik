
class Light extends transform{
    colorValue = vec3(0,0,0);
    intensity = 1.0;
}

class PointLight extends Light{
    radius = 2
    theta  = 10.0;
    phi    = 0.0;
    constructor(center) {
        super(center);
    }
}


class OrbitPointLight extends PointLight{
    rotate = false;
    orbit_offset = vec3()
    constructor(center) {
        super(center);
    }
    orbit(frametime){
        if (this.rotate) {
            this.phi+=50*frametime%180;

            let vAngleRadians = -((this.theta-90) / 180) * Math.PI;
            let hAngleRadians = ((this.phi-90) / 180) * Math.PI;
            this.orbit_offset = vec3(
                -this.radius * Math.sin(vAngleRadians) * Math.cos(hAngleRadians),
                -this.radius * Math.cos(vAngleRadians),
                -this.radius * Math.sin(vAngleRadians) * Math.sin(hAngleRadians)
            );
        }
    }
    get_position(){
        return vec3(this.position[0]+this.orbit_offset[0],this.position[1]+this.orbit_offset[1],this.position[2]+this.orbit_offset[2])
    }
}
