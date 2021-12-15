class SelectionBuffer {
    framebuffer;
    renderbuffer;
    texture;

    width;
    height;

    unbindWidth;
    unbindHeight;
    data = null;
    bound= false;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        this.renderbuffer = gl.createRenderbuffer();
        gl.clearColor(0, 0.5843, 0.9294, 1.0)
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height,
            0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw "Framebuffer creation failed: " + status.toString();
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    bind() {
        if( this.bound ) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.depthFunc(gl.LESS )
        gl.clearColor(0, 0.5843, 0.9294, 1.0)
        var currentViewport = gl.getParameter(gl.VIEWPORT);
        this.unbindWidth = currentViewport[2];
        this.unbindHeight = currentViewport[3];
        gl.viewport(0, 0, this.width, this.height);
        this.bound = true;
    }

    unbind(){
        if( !this.bound ) return;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.viewport(0, 0, this.unbindWidth, this.unbindHeight);
        this.bound = false;
    }

    bindTexture(textureSlot) {
        gl.activeTexture(gl.TEXTURE0+textureSlot);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }

    get_pixelData(start, end){
        this.bind()
        if(end==null){
            const data = new Uint8Array(4);
            gl.readPixels(
                start[0],            // x
                start[1],            // y
                1,                 // width
                1,                 // height
                gl.RGBA,           // format
                gl.UNSIGNED_BYTE,  // type
                data);             // typed array to hold result
            const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);
            console.log(id-1)
            return id-1
        }
        this.unbind()
    }

}