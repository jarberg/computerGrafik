
var currentTime = 1;

function sinus_jump(object){
    if(object != null){
        angle = 2*Math.PI*currentTime/90
        sinAngle = Math.sin(angle)
        object.position[1] += sinAngle/4
        if (object.position[1] >= 1){
            currentTime-=1
        }
        else if (object.position[1] <= 0){
            currentTime+=1
        }
        object.move(object.position)
    }
}