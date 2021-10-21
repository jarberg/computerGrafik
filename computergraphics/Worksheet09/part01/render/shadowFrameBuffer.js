class ShadowMapBuffer {

    gl;

    framebuffer;
    renderbuffer;
    texture;

    width;
    height;

    unbindWidth;
    unbindHeight;

    bound= false;

    constructor(gl, width, height) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        // Check that size is power of 2 (required fo r texture).
        // This detail caused be A LOT of headaches
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
        Util.Texture.createFromData(gl, null, width, height)


        // I know the texture build is synchronous, so I know I can build use it here already
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.getGLTexture(), 0);

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (status !== gl.FRAMEBUFFER_COMPLETE) {
            throw "Framebuffer creation failed: " + status.toString();
        }

        // Rebind default buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }


    bind(textureSlot: number) {
        if( this.bound ) return;
        this.bindTexture(textureSlot);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderbuffer);

        var currentViewport = this.gl.getParameter(this.gl.VIEWPORT);
        this.unbindWidth = currentViewport[2];
        this.unbindHeight = currentViewport[3];
        this.gl.viewport(0, 0, this.width, this.height);
        this.bound = true;
    }


    /**
     *  Unbinds this framebuffer (and render buffer), and rebinds the default
     */
    unbind(){

        if( !this.bound ) return;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.viewport(0, 0, this.unbindWidth, this.unbindHeight);
        this.bound = false;
    }

    bindTexture(textureSlot: number) {
        this.texture.bind(textureSlot);
        // this.gl.activeTexture(this.gl.TEXTURE0+textureSlot);
        // this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }


    getWidth() : number {
        return this.width;
    }

    getHeight() : number {
        return this.height;
    }

}

}