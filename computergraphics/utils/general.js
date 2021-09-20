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

function initFramebufferObject(gl, width, height, slot)
{
    var framebuffer = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    var renderbuffer = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    var shadowMap = gl.createTexture(); gl.activeTexture(gl.TEXTURE0+slot); gl.bindTexture(gl.TEXTURE_2D, shadowMap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    framebuffer.texture = shadowMap;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowMap, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) { console.log('Framebuffer object is incomplete: ' + status.toString()); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    framebuffer.width = width; framebuffer.height = height;
    return framebuffer;
}