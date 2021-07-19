/*
 *   RedGL - MIT License
 *   Copyright (c) 2018 - 2019 By RedCamel( webseon@gmail.com )
 *   https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 *   Last modification time of this file - 2019.8.7 15:42:44
 *
 */

"use strict";
var RedFilter_Invert;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedFilterInvertProgram';
	var checked;
	vSource = RedBaseFilter['baseVertexShaderSource1']
	fSource = function () {
		/* @preserve
		 precision lowp float;
		 uniform sampler2D u_diffuseTexture;

		 void main(void) {
			 vec4 finalColor = texture2D(u_diffuseTexture, gl_FragCoord.xy/vResolution);
			 if(finalColor.a == 0.0) discard;
			 finalColor.r = 1.0 - finalColor.r;
			 finalColor.g = 1.0 - finalColor.g;
			 finalColor.b = 1.0 - finalColor.b;
			 gl_FragColor = finalColor;
		 }
		 */
	};
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedFilter_Invert`,
		 description : `
			 Invert 필터

		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 extends : [
			'RedBaseFilter',
			'RedBaseMaterial'
		 ],
		 demo : '../example/filter/adjustments/RedFilter_Invert.html',

		 return : 'RedFilter_Invert Instance'
	 }
	 :DOC*/
	RedFilter_Invert = function (redGL) {
		if (!(this instanceof RedFilter_Invert)) return new RedFilter_Invert(redGL);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedFilter_Invert : RedGL Instance만 허용.', redGL);
		this['frameBuffer'] = RedFilterFrameBuffer(redGL);
		this['diffuseTexture'] = null;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['program'] = RedProgram['makeProgram'](redGL, PROGRAM_NAME, vSource, fSource);
		this['_UUID'] = RedGL.makeUUID();
		if (!checked) {
			this.checkUniformAndProperty();
			checked = true;
		}
		console.log(this);
	};
	RedFilter_Invert.prototype = new RedBaseFilter();
	RedFilter_Invert.prototype['updateTexture'] = function (lastFrameBufferTexture) {
		this['diffuseTexture'] = lastFrameBufferTexture;
	};
	RedDefinePropertyInfo.definePrototype('RedFilter_Invert', 'diffuseTexture', 'sampler2D');
	Object.freeze(RedFilter_Invert);
})();