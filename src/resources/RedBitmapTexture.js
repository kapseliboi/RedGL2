"use strict";
var RedBitmapTexture;
(function () {
    var loadTexture;
    var makeWebGLTexture;
    var MAX_TEXTURE_SIZE;
    makeWebGLTexture = function (gl, texture, source, option) {
        gl.activeTexture(gl.TEXTURE0 + 0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //level,internalFormat, format, type
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, option['min'] ? option['min'] : gl.LINEAR_MIPMAP_NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, option['mag'] ? option['mag'] : gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, option['wrap_s'] ? option['wrap_s'] : gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, option['wrap_t'] ? option['wrap_t'] : gl.REPEAT);

        if (gl['glExtension']['EXT_texture_filter_anisotropic'] && option['anisotropic']) {
            gl.texParameterf(gl.TEXTURE_2D, gl['glExtension']['EXT_texture_filter_anisotropic'].TEXTURE_MAX_ANISOTROPY_EXT, option['anisotropic']);
        }
        try {
            gl.generateMipmap(gl.TEXTURE_2D);
        } catch (error) {
            console.log('밉맵을 생성할수 없음', source)
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    };
    loadTexture = (function () {
        return function (gl, self, texture, src, option, callback) {
            if (!option) option = {};
            if (window['OffscreenCanvas'] && src instanceof OffscreenCanvas || window['HTMLCanvasElement'] && src instanceof HTMLCanvasElement) {
                var tSource = RedGLUtil.makePowerOf2Source(gl, src, MAX_TEXTURE_SIZE)
                console.log('tSource', tSource)
                makeWebGLTexture(gl, texture, tSource, option);
                callback ? callback.call(self, true) : 0;
            }
            else {
                RedImageLoader(
                    src,
                    function (v) {
                        console.log(this)
                        var tSource = RedGLUtil.makePowerOf2Source(gl, this['source'], MAX_TEXTURE_SIZE)
                        makeWebGLTexture(gl, texture, tSource, option);
                        callback ? callback.call(self, true) : 0;
                    },
                    function (v) {
                        callback ? callback.call(self, false) : 0
                    }
                )
            }
        }
    })();
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedBitmapTexture`,
		 description : `
			 RedBitmapTexture Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 src : [
				 {type:'string'}
			 ],
			 option : [
				 {type:'Object'},
				 '텍스쳐 정의옵션',
				 `
				 <code>
				 {
					 min: this.gl.LINEAR_MIPMAP_NEAREST,
					 mag: this.gl.LINEAR,
					 wrap_s: this.gl.REPEAT,
					 wrap_t: this.gl.REPEAT,
					 anisotropic: 16 // 지원가능한경우에만 작동
				 }
				 </code>
				 `
			 ],
			 callBack : [
			    {type:'Function'}
			 ]
		 },
		 extends : [
		    'RedBaseTexture'
		 ],
		 demo : '../example/resources/RedBitmapTexture.html',
		 example : `
		 RedBitmapTexture( RedGL Instance,  src, {
			 min: gl.LINEAR_MIPMAP_NEAREST,
			 mag: gl.LINEAR,
			 wrap_s: gl.REPEAT,
			 wrap_t: gl.REPEAT
		 })
		 `,
		 return : 'RedBitmapTexture Instance'
	 }
     :DOC*/
    RedBitmapTexture = function (redGL, src, option, callback) {
        var tGL;
        if (!(this instanceof RedBitmapTexture)) return new RedBitmapTexture(redGL, src, option, callback);
        redGL instanceof RedGL || RedGLUtil.throwFunc('RedBitmapTexture : RedGL Instance만 허용.', redGL);
        tGL = redGL.gl;
        MAX_TEXTURE_SIZE = redGL['detect']['texture']['MAX_TEXTURE_SIZE'];

        this['webglTexture'] = tGL.createTexture();
        this['webglTexture']['gl'] = tGL
        this['_load'] = function (needEmpty) {
            RedTextureOptionChecker.check('RedBitmapTexture', option, tGL);
            if (needEmpty) this.setEmptyTexture(tGL, this['webglTexture']);
            if (this['_src']) loadTexture(tGL, this, this['webglTexture'], this['_src'], this['_option'], this['_callback']);
        }
        this['_option'] = option;
        this['callback'] = callback;
        this['src'] = src;
        this['_UUID'] = RedGL.makeUUID();
        console.log(this);
    };
    RedBitmapTexture.prototype = new RedBaseTexture();

    /**DOC:
     {
		 code:`PROPERTY`,
		 title :`src`,
		 description : `
			 src
		 `,
		 return : 'void'
	 }
     :DOC*/
    Object.defineProperty(RedBitmapTexture.prototype, 'src', {
        get: function () {
            return this['_src']
        },
        set: function (v) {
            if (window['OffscreenCanvas']) {
                this['_src'] = v;
                this._load(true)
                return
            }
            else if (v && typeof v != 'string' && !(window['HTMLCanvasElement'] && v instanceof HTMLCanvasElement)) RedGLUtil.throwFunc('RedBitmapTexture : src는 문자열 or Canvas Element만 허용.', '입력값 : ' + v);
            this['_src'] = v;
            this._load(true)
        }
    });
    /**DOC:
     {
		 code:`PROPERTY`,
		 title :`option`,
		 description : `
			 텍스쳐 옵션 정의
		 `,
		 return : 'void'
	 }
     :DOC*/
    Object.defineProperty(RedBitmapTexture.prototype, 'option', {
        get: function () {
            return this['_option']
        },
        set: function (v) {
            this['_option'] = v;
            this._load(false)
        }
    });
    Object.freeze(RedBitmapTexture);
})();
