
function sinus_jump(object){
    if(object != null){
        angle = 2*Math.PI*currentTime/90
        sinAngle = Math.sin(angle)
        object.translate[1] += sinAngle
        if (object.translate[1] >= 1){
            currentTime-=1
        }
        else if (object.translate[1] <= 0){
            currentTime+=1
        }
    }
}