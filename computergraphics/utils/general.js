var times = [];
var fps  = 1;
var lastTime =0;

function takeTime(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var now = performance.now();
    frameRenderTime = (now-lastTime)/1000
    while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
    }
    times.push(now);
    fps = times.length;
    fpsOutput.textContent  = "FPS: "+fps;
    lastTime = now
    return frameRenderTime
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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

class transform{
    position = vec3(0,0,0)
    rotation = vec3(0,0,0)
    scale = vec3(1,1,1)
    local_transformMatrix = mat4()
    rotation_order = "XYZ"



    constructor(center=vec3(0,0,0)) {
        this.position = center
        this.update_transform()
        this.parent = null;
        this.children = []
    }

    update_transform(){
        var tempMat = mult(mat4(), scalem(this.scale))
        tempMat = this.checkRotationOrder(tempMat)
        tempMat = mult(translate(this.position), tempMat)
        this.local_transformMatrix = tempMat
    }

    orderXYZ(tempMat){
        tempMat = mult( rotateZ(this.rotation[2]), tempMat)
        tempMat = mult( rotateY(this.rotation[1]), tempMat)
        tempMat = mult( rotateX(this.rotation[0]), tempMat)
        return tempMat
    }

    checkRotationOrder(tempMat) {
        if (this.rotation_order === "XYZ") return this.orderXYZ(tempMat);
    }

    move(vec){
        this.position=vec
        this.update_transform()
    }

    setScale(scale){
        this.scale = scale
        this.update_transform()
    }

    get_position(){
        return this.position
    }

}
