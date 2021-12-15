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

function SATtest(axis, ptSet ) {
    var minAlong=Infinity, maxAlong=-Infinity;

    var edge1 = ptSet[1]-ptSet[0]
    var edge2 = ptSet[2]-ptSet[0]
    var edge3 = ptSet[3]-ptSet[0]

    for( let i = 0 ; i < ptSet.length ; i++ ) {
        // just dot it to get the min/max along this axis.

        var dotVal = dot(ptSet[i], axis) ;
        if( dotVal < minAlong )  minAlong=dotVal;
        if( dotVal > maxAlong )  maxAlong=dotVal;
    }
    return [minAlong, maxAlong]
}

function make_normals(points){
    var result = []

    var ip_normal = subtract(points[3],points[0])
    var tt = cross(ip_normal, vec3(0,1,0))
    var ip_x_axis = normalize(tt);
    var ip_y_axis = normalize(cross(ip_x_axis, ip_normal))

    result.push(normalize(ip_x_axis))
    result.push(normalize(scale(-1, ip_x_axis)))
    result.push(normalize(ip_y_axis))
    result.push(normalize(scale(-1, ip_y_axis)))
    result.push(normalize(ip_normal))
    result.push(normalize(scale(-1, ip_normal)))

    return result
}

function intersects( shape1, shape2 , shape1_normals) {

    for( let i = 0 ; i < shape1_normals.length ; i++ ) {
        let shape1_minMax = SATtest( shape1_normals[i], shape1) ;
        let shape2_minMax = SATtest( shape1_normals[i], shape2) ;

        if( !overlaps( shape1_minMax[0], shape1_minMax[1], shape2_minMax[0], shape2_minMax[1])){
            return 0 ; // NO INTERSECTION
        }
    }
    // if overlap occurred in ALL AXES, then they do intersect
    return 1 ;
}

function overlaps( min1, max1, min2, max2 )
{
    return isBetweenOrdered( min2, min1, max1 ) || isBetweenOrdered( min1, min2, max2 ) ;
}

function isBetweenOrdered( val, lowerBound, upperBound ) {
    return lowerBound <= val && val <= upperBound ;
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
