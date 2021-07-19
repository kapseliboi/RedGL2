/*
 *   RedGL - MIT License
 *   Copyright (c) 2018 - 2019 By RedCamel( webseon@gmail.com )
 *   https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 *   Last modification time of this file - 2019.8.7 15:42:44
 *
 */

"use strict";
var RedFilter_GaussianBlur;
(function () {
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedFilter_GaussianBlur`,
		 description : `
			 가우시안 블러 필터
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
		 demo : '../example/filter/blur/RedFilter_GaussianBlur.html',

		 return : 'RedFilter_GaussianBlur Instance'
	 }
	 :DOC*/
	RedFilter_GaussianBlur = function (redGL) {
		if (!(this instanceof RedFilter_GaussianBlur)) return new RedFilter_GaussianBlur(redGL);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedFilter_GaussianBlur : RedGL Instance만 허용.', redGL);
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['_UUID'] = RedGL.makeUUID();
		this['_process'] = [
			RedFilter_BlurX(redGL),
			RedFilter_BlurY(redGL)
		];
		this['radius'] = 1;
		console.log(this);
	};
	RedFilter_GaussianBlur.prototype = new RedBaseFilter();
	RedFilter_GaussianBlur.prototype['updateTexture'] = function () {
	};
	/*DOC:
	 {
	     code : 'PROPERTY',
		 title :`radius`,
		 description : `
			 가우시간 블러강도
			 기본값 : 1
			 min: 0.1
			 max: 255
		 `,
		 return : 'Number'
	 }
	 :DOC*/
	RedDefinePropertyInfo.definePrototype('RedFilter_GaussianBlur', 'radius', 'number', {
		min: 0.1, max: 255, callback: function (v) {
			this['_process'][0]['size'] = v;
			this['_process'][1]['size'] = v;
		}
	});
	Object.freeze(RedFilter_GaussianBlur);
})();