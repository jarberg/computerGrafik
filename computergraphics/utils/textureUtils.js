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

function generateredTextureArray(texSize){
    var myTexels = new Uint8Array(4*texSize*texSize);
    for(var i = 0; i < texSize; ++i)
        for(var j = 0; j < texSize; ++j)
        {
            var idx = 4*(i*texSize + j);
            myTexels[idx] =  255;
            myTexels[idx + 1] = 0.0
            myTexels[idx + 2] = 0.0;
            myTexels[idx + 3] = 255;
        }
    return myTexels;
}

function configureImageTexture(image, index=0) {
    texture = gl.createTexture();
    gl.useProgram(program)
    gl.activeTexture( gl.TEXTURE0+index);
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), index);
}

function configureNormalTexture(image, index) {
    var textureNormal = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0+index);
    gl.bindTexture( gl.TEXTURE_2D, textureNormal );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    var loc = gl.getUniformLocation(program, "normalTexture");
    gl.uniform1i(loc, index);
}

function configureTexture(image, size, index = 0) {
    var texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0+index);
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(gl.getUniformLocation(program, "diffuseTexture"), index);
}


function create_image_texture(imageName, callback, index){
    let image = new Image()
    image.onload = function () {
        callback(image, index)
    };

    image.src = "../../Images/"+imageName;
}

function create_cube_map(shader, invert=false, index=0){
        //console.log( location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_posx.jpg')
    var cubemapArray = [
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_posx.jpg',  // POSITIVE_X
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_negx.jpg',  // NEGATIVE_X
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_posy.jpg',  // POSITIVE_Y
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_negy.jpg',  // NEGATIVE_Y
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_posz.jpg',  // POSITIVE_Z
        location.origin+"/computerGrafik/computergraphics/"+'Images/cubeMap/cloudyhills_negz.jpg'   // NEGATIVE_Z
                        ];

    gl.activeTexture( gl.TEXTURE0+index);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, invert);
    var images =[]
    for(let i = 0; i < cubemapArray.length; ++i) {
        images.push(new Image());
        images[i].onload = function(e) {
            console.log(images[i].currentSrc)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, e.target)
        };
        images[i].src = cubemapArray[i];
    }
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    var loc = gl.getUniformLocation(shader, "texture")
    gl.uniform1i(loc, index);
    return texture
}