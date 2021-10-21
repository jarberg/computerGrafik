class ShadowMapBuffer {
    framebuffer;
    renderbuffer;
    texture;

    width;
    height;

    unbindWidth;
    unbindHeight;

    bound= false;

    constructor(width, height) {
        this.width = width;
        this.height = height;

        if( Math.log2(this.width) % 1 !== 0 )
            throw "ShadwMap: Width must be a power of 2";
        if( Math.log2(this.height) % 1 !== 0 )
            throw "ShadwMap: Height must be a power of 2";

        // Constructs framebuffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // Create and attach render buffer for depth component
        this.renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

        // Build target texture
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512,
            0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        // I know the texture build is synchronous, so I know I can build use it here already
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw "Framebuffer creation failed: " + status.toString();
        }

        // Rebind default buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }


    bind(textureSlot) {
        if( this.bound ) return;
        this.bindTexture(textureSlot);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);

        var currentViewport = gl.getParameter(gl.VIEWPORT);
        this.unbindWidth = currentViewport[2];
        this.unbindHeight = currentViewport[3];
        gl.viewport(0, 0, this.width, this.height);
        this.bound = true;
    }


    /**
     *  Unbinds this framebuffer (and render buffer), and rebinds the default
     */
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
    }


    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

}