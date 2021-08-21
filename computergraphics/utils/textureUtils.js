function generateCheckersTextureArray(numRows, numCols, texSize){
    var myTexels = new Uint8Array(4*texSize*texSize);
    for(var i = 0; i < texSize; ++i)
        for(var j = 0; j < texSize; ++j)
        {
            var patchx = Math.floor(i/(texSize/numRows));
            var patchy = Math.floor(j/(texSize/numCols));
            var c = (patchx%2 !== patchy%2 ? 255 : 0);
            var idx = 4*(i*texSize + j);
            myTexels[idx] = myTexels[idx + 1] = myTexels[idx + 2] = c;
            myTexels[idx + 3] = 255;
        }
    return myTexels;
}


function configureImageTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function configureTexture(image, size) {
    var texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.activeTexture( gl.TEXTURE0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
}

function fetchImageResourceFolder(){
    if(location.origin === "https://www.student.dtu.dk"){
        return "/~s185091/computergraphics"
    }
    else {
        return "/DtuWebsite/computergraphics"
    }
}


function create_image_texture(imageName){
    var image = new Image()
    image.crossorigin = 'anonymous';
    image.onload = function () {
        configureImageTexture(image)
    };
    image.src = location.origin+fetchImageResourceFolder()+"/Images/"+imageName;
}

function create_cube_map(invert=false){
    var cubemapArray = [
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_posx.jpg',  // POSITIVE_X
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_negx.jpg',  // NEGATIVE_X
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_posy.jpg',  // POSITIVE_Y
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_negy.jpg',  // NEGATIVE_Y
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_posz.jpg',  // POSITIVE_Z
        location.origin+fetchImageResourceFolder()+'/Images/cubeMap/cloudyhills_negz.jpg'   // NEGATIVE_Z
                        ];

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, invert);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    for(let i = 0; i < cubemapArray.length; ++i) {
        image = document.createElement("img");
        image.crossOrigin = "anonymous";
        image.onload = function(e) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, e.currentTarget)
        };
        image.src = cubemapArray[i];
        }

    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);
}