/*
 *   RedGL - MIT License
 *   Copyright (c) 2018 - 2019 By RedCamel( webseon@gmail.com )
 *   https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 *   Last modification time of this file - 2020.3.18 13:58:43
 *
 */
"use strict";
var RedPBRMaterial_System;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPBRMaterialSystemProgram';
	var PROGRAM_OPTION_LIST = [
		'diffuseTexture', 'normalTexture', 'environmentTexture', 'occlusionTexture', 'emissiveTexture', 'roughnessTexture',
		'useFlatMode', 'useMaterialDoubleSide', 'useVertexTangent', 'useVertexColor_0', 'usePreMultiply'
	];
	var checked;
	vSource = function () {
		/* @preserve
			// 스키닝
			//#REDGL_DEFINE#vertexShareFunc#getSkinMatrix#

			// Sprite3D
			//#REDGL_DEFINE#vertexShareFunc#getSprite3DMatrix#
			//#REDGL_DEFINE#useVertexColor_0# attribute vec4 aVertexColor_0;
			//#REDGL_DEFINE#useVertexColor_0# varying vec4 vVertexColor_0;
			//#REDGL_DEFINE#useVertexTangent# attribute vec4 aVertexTangent;
			//#REDGL_DEFINE#useVertexTangent# varying vec4 vVertexTangent;
			void main(void) {
				gl_PointSize = uPointSize;
				// UV설정
				vTexcoord = aTexcoord;
				vTexcoord1 = aTexcoord1;
				//#REDGL_DEFINE#useVertexColor_0# vVertexColor_0 = aVertexColor_0;
				//#REDGL_DEFINE#useVertexTangent# vVertexTangent = aVertexTangent;
				// normal 계산
			   //#REDGL_DEFINE#skin#true# vVertexNormal = (uNMatrix * getSkinMatrix() * vec4(aVertexNormal,0.0)).xyz;
			   //#REDGL_DEFINE#skin#false# vVertexNormal = (uNMatrix *  vec4(aVertexNormal,1.0)).xyz;

			   // position 계산
				//#REDGL_DEFINE#skin#true# mat4 targetMatrix = uMMatrix *  getSkinMatrix() ;
				//#REDGL_DEFINE#skin#false# mat4 targetMatrix = uMMatrix;
				vVertexPosition =  targetMatrix *  vec4(aVertexPosition, 1.0);

				// 최종 포지션 계산
				//#REDGL_DEFINE#sprite3D#true# gl_Position = uPMatrix * getSprite3DMatrix(uCameraMatrix , targetMatrix) *  vec4(aVertexPosition, 1.0);
				//#REDGL_DEFINE#sprite3D#true# if(!u_PerspectiveScale){
				//#REDGL_DEFINE#sprite3D#true#   gl_Position /= gl_Position.w;
				//#REDGL_DEFINE#sprite3D#true#   gl_Position.xy += aVertexPosition.xy * vec2((uPMatrix * targetMatrix)[0][0],(uPMatrix * targetMatrix)[1][1]);
				//#REDGL_DEFINE#sprite3D#true# }
				//#REDGL_DEFINE#sprite3D#false# gl_Position = uPMatrix * uCameraMatrix * vVertexPosition;

				// 쉐도우 계산
				//#REDGL_DEFINE#directionalShadow#true# vResolution = uResolution;
				//#REDGL_DEFINE#directionalShadow#true# vShadowPos = cTexUnitConverter * uDirectionalShadowLightMatrix * targetMatrix *  vec4(aVertexPosition, 1.0);
			}
		 */
	};
	fSource = function () {
		/* @preserve
		 precision mediump float;
		// 안개
		//#REDGL_DEFINE#fragmentShareFunc#fogFactor#
		//#REDGL_DEFINE#fragmentShareFunc#fog#

		// 그림자
		//#REDGL_DEFINE#fragmentShareFunc#decodeFloatShadow#
		//#REDGL_DEFINE#fragmentShareFunc#getShadowColor#

		// flat노말
		//#REDGL_DEFINE#fragmentShareFunc#getFlatNormal#
		//#REDGL_DEFINE#fragmentShareFunc#cotangent_frame#
		//#REDGL_DEFINE#fragmentShareFunc#perturb_normal#

		//#REDGL_DEFINE#useVertexColor_0# varying vec4 vVertexColor_0;
		//#REDGL_DEFINE#useVertexTangent# varying vec4 vVertexTangent;
		 uniform vec4 uBaseColorFactor;
		 uniform vec3 uEmissiveFactor;
		 uniform float u_cutOff;

		 //#REDGL_DEFINE#diffuseTexture# uniform sampler2D u_diffuseTexture;
		 //#REDGL_DEFINE#normalTexture# uniform sampler2D u_normalTexture;
		 //#REDGL_DEFINE#occlusionTexture# uniform sampler2D u_occlusionTexture;
		 //#REDGL_DEFINE#environmentTexture# uniform samplerCube u_environmentTexture;
		 //#REDGL_DEFINE#emissiveTexture# uniform sampler2D u_emissiveTexture;
		 //#REDGL_DEFINE#roughnessTexture# uniform sampler2D u_roughnessTexture;
		 //#REDGL_DEFINE#normalTexture# uniform float u_normalPower;


		 uniform float u_specularPower;
		 uniform float u_metallicFactor;
		 uniform float u_roughnessFactor;
		 uniform float u_occlusionPower;
		 uniform float u_alpha;



		uniform int u_diffuseTexCoordIndex;
		uniform int u_occlusionTexCoordIndex;
		uniform int u_emissiveTexCoordIndex;
		uniform int u_roughnessTexCoordIndex;
		uniform int u_normalTexCoordIndex;





		 vec4 la;
		 vec4 ld;
		 vec4 ls;
		 vec4 texelColor= vec4(0.0,0.0,0.0,0.0);
		 vec4 emissiveColor;
		 vec4 roughnessColor;
		 vec4 occlusionColor;
		 vec4 reflectionColor;
		 vec4 specularLightColor= vec4(1.0, 1.0, 1.0, 1.0);
		 vec4 finalColor;
		 vec3 N;
		 vec3 L;
		 float lambertTerm;
		 float specular;
		 float specularTextureValue;
		 float distanceLength;
		 float attenuation;

		vec2 u_diffuseTexCoord ;
		vec2 u_occlusionTexCoord;
		vec2 u_emissiveTexCoord;
		vec2 u_roughnessTexCoord;
		vec2 u_normalTexCoord;



		 void main(void) {
			la = uAmbientLightColor * uAmbientLightColor.a;
			ld = vec4(0.0, 0.0, 0.0, 1.0);
			ls = vec4(0.0, 0.0, 0.0, 1.0);

			u_diffuseTexCoord = u_diffuseTexCoordIndex==0 ? vTexcoord : vTexcoord1;
			u_normalTexCoord = u_normalTexCoordIndex==0 ? vTexcoord : vTexcoord1;
			u_occlusionTexCoord = u_occlusionTexCoordIndex==0 ? vTexcoord : vTexcoord1;
			u_emissiveTexCoord = u_emissiveTexCoordIndex==0 ? vTexcoord : vTexcoord1;
			u_roughnessTexCoord  = u_roughnessTexCoordIndex==0 ? vTexcoord : vTexcoord1;

			float tMetallicPower = u_metallicFactor;
			float tRoughnessPower = u_roughnessFactor;

			//#REDGL_DEFINE#roughnessTexture# roughnessColor = texture2D(u_roughnessTexture, u_roughnessTexCoord);
			//#REDGL_DEFINE#roughnessTexture# tMetallicPower *= roughnessColor.b; // 메탈릭 산출 roughnessColor.b
			//#REDGL_DEFINE#roughnessTexture# tRoughnessPower *= roughnessColor.g; // 거칠기 산출 roughnessColor.g

			// diffuse 색상 산출

			texelColor = uBaseColorFactor;
			//#REDGL_DEFINE#useVertexColor_0# texelColor *= clamp(vVertexColor_0,0.0,1.0) ;


			//#REDGL_DEFINE#diffuseTexture# texelColor *= texture2D(u_diffuseTexture, u_diffuseTexCoord);
			//#REDGL_DEFINE#usePreMultiply# //#REDGL_DEFINE#diffuseTexture# texelColor.rgb *= texelColor.a;


			// 노멀값 계산
			N = normalize(vVertexNormal);
			//#REDGL_DEFINE#useMaterialDoubleSide# vec3 fdx = dFdx(vVertexPosition.xyz);
			//#REDGL_DEFINE#useMaterialDoubleSide# vec3 fdy = dFdy(vVertexPosition.xyz);
			//#REDGL_DEFINE#useMaterialDoubleSide# vec3 faceNormal = normalize(cross(fdx,fdy));
			bool backFaceYn = false;
			//#REDGL_DEFINE#useMaterialDoubleSide# if (dot (vVertexNormal, faceNormal) < 0.0) { N = -N; backFaceYn = true; };


			vec4 normalColor = vec4(0.0);
			//#REDGL_DEFINE#normalTexture# normalColor = texture2D(u_normalTexture, u_normalTexCoord);
			//#REDGL_DEFINE#useFlatMode# N = getFlatNormal(vVertexPosition.xyz);
			//#REDGL_DEFINE#normalTexture# N = perturb_normal(N, vVertexPosition.xyz, backFaceYn ?  1.0 - u_normalTexCoord : u_normalTexCoord, vec3(normalColor.r, 1.0- normalColor.g, normalColor.b) );



			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 pos_dx = dFdx(vVertexPosition.xyz);
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 pos_dy = dFdy(vVertexPosition.xyz);
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 tex_dx = dFdx(vec3(u_normalTexCoord, 0.0));
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 tex_dy = dFdy(vec3(u_normalTexCoord, 0.0));
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 ng = normalize(vVertexNormal);
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# t = normalize(t - ng * dot(ng, t));
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# vec3 b = normalize(cross(ng, t));
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# mat3 tbn = mat3(t, b, ng);
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# N = normalize(tbn * ((2.0 * normalColor.rgb - 1.0) * vec3(1.0, 1.0 * vVertexTangent.w,1.0)));
			//#REDGL_DEFINE#useVertexTangent# //#REDGL_DEFINE#normalTexture# N = backFaceYn ? -N : N;



			// 환경맵 계산
			vec3 R = reflect( vVertexPosition.xyz-uCameraPosition, N);
			//#REDGL_DEFINE#environmentTexture# reflectionColor = textureCube(u_environmentTexture, R);
			//#REDGL_DEFINE#usePreMultiply# //#REDGL_DEFINE#environmentTexture# reflectionColor.rgb *= reflectionColor.a;

			// 환경맵 합성
			//#REDGL_DEFINE#environmentTexture# texelColor.rgb = mix( texelColor.rgb , reflectionColor.rgb , max(tMetallicPower-tRoughnessPower,0.1)*(1.0-tRoughnessPower));
			//#REDGL_DEFINE#environmentTexture# texelColor = mix( texelColor , vec4(0.04, 0.04, 0.04, 1.0) , tRoughnessPower * (tMetallicPower) * 0.5);

			// 컷오프 계산
			if(texelColor.a <= u_cutOff) discard;

			// 라이팅 계산
			float shininess = 128.0 ;
			specularLightColor = vec4(1.0, 1.0, 1.0, 1.0);
			specularTextureValue =  1.0 ;
			for(int i=0; i<cDIRETIONAL_MAX; i++){
				if(i == uDirectionalLightNum) break;
				L = normalize(-uDirectionalLightPositionList[i]);
				lambertTerm = dot(N,-L);
				if(lambertTerm > 0.0){
					ld += uDirectionalLightColorList[i] * texelColor * lambertTerm * uDirectionalLightIntensityList[i] * uDirectionalLightColorList[i].a;
					specular = pow( max(dot(reflect(L, N), -L), 0.0), pow(shininess, 1.0-tRoughnessPower+0.04) );
					specular *= pow(1.0-tRoughnessPower+0.04, 2.0 * (1.0-tMetallicPower)) ;
					ls +=  specularLightColor * specular * u_specularPower * specularTextureValue * uDirectionalLightIntensityList[i]* uDirectionalLightColorList[i].a * (1.0-tRoughnessPower+0.04);
				}
			}

		   for(int i=0;i<cPOINT_MAX;i++){
			  if(i== uPointLightNum) break;
			  L =  -uPointLightPositionList[i] + vVertexPosition.xyz;
			  distanceLength = abs(length(L));
			  if(uPointLightRadiusList[i]> distanceLength){
				  attenuation = 1.0 / (0.01 + 0.02 * distanceLength + 0.03 * distanceLength * distanceLength) * 0.5;
				  L = normalize(L);
				  lambertTerm = dot(N,-L);
				  if(lambertTerm > 0.0){
					 ld += uPointLightColorList[i] * texelColor * lambertTerm * attenuation * uPointLightIntensityList[i] ;
					 specular = pow( max(dot(reflect(L, N), -N), 0.0), pow(shininess, 1.0-tRoughnessPower+0.04) );
					 specular *= pow(1.0-tRoughnessPower+0.04, 2.0 * (1.0-tMetallicPower)) ;
					 ls +=  specularLightColor * specular * uPointLightIntensityList[i]  * uPointLightColorList[i].a * (1.0-tRoughnessPower+0.04) ;
				  }
			  }
		   }

			finalColor = la * uAmbientIntensity + ld + ls;
			finalColor.a = texelColor.a * u_alpha ;

			// 그림자 계산
			//#REDGL_DEFINE#directionalShadow#true# finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * getShadowColor( vShadowPos, vResolution, uDirectionalShadowTexture), 0.5);

			// 이미시브합성
			//#REDGL_DEFINE#emissiveTexture# emissiveColor = texture2D(u_emissiveTexture, u_emissiveTexCoord);
			//#REDGL_DEFINE#usePreMultiply# //#REDGL_DEFINE#emissiveTexture# emissiveColor.rgb *= emissiveColor.a;
			//#REDGL_DEFINE#emissiveTexture# emissiveColor.rgb *= uEmissiveFactor;
			//#REDGL_DEFINE#emissiveTexture# finalColor.rgb += emissiveColor.rgb;

			// 오클루젼 합성
			//#REDGL_DEFINE#occlusionTexture# occlusionColor = texture2D(u_occlusionTexture, u_occlusionTexCoord);
			//#REDGL_DEFINE#occlusionTexture# finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * occlusionColor.r, occlusionColor.r * u_occlusionPower);

			// 최종결과 산출
			//#REDGL_DEFINE#fog#false# gl_FragColor = finalColor;
			//#REDGL_DEFINE#fog#true# gl_FragColor = fog( fogFactor(u_FogDistance, u_FogDensity), uFogColor, finalColor);
		 }
		 */
	};
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedPBRMaterial_System`,
		 description : `
		     RedGLTFLoader에서 모델을 파싱할때 생성되는 PBR재질.
		     일반사용은 금지함.
			 RedPBRMaterial_System Instance 생성.
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 diffuseTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 environmentTexture : [
				 {type:'RedBitmapCubeTexture'}
			 ],
			 normalTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 occlusionTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 emissiveTexture : [
				 {type:'RedBitmapTexture'}
			 ],
			 roughnessTexture : [
				 {type:'RedBitmapTexture'}
			 ]
		 },
		 extends : ['RedBaseMaterial'],
		 demo : '../example/loader/gltf/RedGLTFLoader.html',
		 example : `
			 RedPBRMaterial_System(
				 RedGL Instance,
				 RedBitmapTexture(RedGL Instance, src), // diffuseTexture
				 RedBitmapCubeTexture(RedGL Instance, srcList),
				 RedBitmapTexture(RedGL Instance, src), // normalTexture
				 RedBitmapTexture(RedGL Instance, src), // occlusionTexture
				 RedBitmapTexture(RedGL Instance, src), // emissiveTexture
				 RedBitmapTexture(RedGL Instance, src) // roughnessTexture
			 )
		 `,
		 return : 'RedPBRMaterial_System Instance'
	 }
	 :DOC*/
	RedPBRMaterial_System = function (redGL,
	                                  diffuseTexture,
	                                  environmentTexture,
	                                  normalTexture,
	                                  occlusionTexture,
	                                  emissiveTexture,
	                                  roughnessTexture
	) {
		if (!(this instanceof RedPBRMaterial_System)) return new RedPBRMaterial_System(
			redGL,
			diffuseTexture,
			environmentTexture,
			normalTexture,
			occlusionTexture,
			emissiveTexture,
			roughnessTexture
		);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedPBRMaterial_System : RedGL Instance만 허용.', redGL);
		this.makeProgramList(this, redGL, PROGRAM_NAME, RedGLUtil.getStrFromComment(vSource.toString()), RedGLUtil.getStrFromComment(fSource.toString()), PROGRAM_OPTION_LIST);
		/////////////////////////////////////////
		// 유니폼 프로퍼티
		this['diffuseTexture'] = diffuseTexture;
		this['environmentTexture'] = environmentTexture;
		this['normalTexture'] = normalTexture;
		this['occlusionTexture'] = occlusionTexture;
		this['emissiveTexture'] = emissiveTexture;
		this['roughnessTexture'] = roughnessTexture;
		this['normalPower'] = 1;
		this['specularPower'] = 1;
		this['metallicFactor'] = 1;
		this['roughnessFactor'] = 1;
		this['diffuseTexCoordIndex'] = 0;
		this['occlusionTexCoordIndex'] = 0;
		this['emissiveTexCoordIndex'] = 0;
		this['roughnessTexCoordIndex'] = 0;
		this['normalTexCoordIndex'] = 0;
		this['occlusionPower'] = 1;
		this['baseColorFactor'] = null;
		this['emissiveFactor'] = null;
		this['alpha'] = 1;
		this['cutOff'] = 0;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['useMaterialDoubleSide'] = false;
		this['useVertexColor_0'] = false;
		this['useFlatMode'] = false;
		this['useVertexTangent'] = false;
		this['usePreMultiply'] = false;
		this['_UUID'] = RedGL.makeUUID();
		if (!checked) {
			this.checkUniformAndProperty();
			checked = true;
		}
		this['_needSearchProgram'] = null;
		console.log(this);
	};
	RedPBRMaterial_System.prototype = new RedBaseMaterial();
	var samplerOption = {
		callback: function () {
			var self = this;
			cancelAnimationFrame(this['_needSearchProgram']);
			this['_needSearchProgram'] = requestAnimationFrame(function () {
				self._searchProgram(PROGRAM_NAME, PROGRAM_OPTION_LIST);
				self['_needSearchProgram'] = null
			});
		}
	};
	RedDefinePropertyInfo.definePrototypes(
		'RedPBRMaterial_System',
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`alpha`,
			 description : `기본값 : 1`,
			 return : 'Number'
		 }
		 :DOC*/
		['alpha', 'number', {min: 0, max: 1}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`cutOff`,
			 return : 'Number'
		 }
		 :DOC*/
		['cutOff', 'number', {min: 0, max: 1}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`diffuseTexture`,
			 return : 'RedBitmapTexture'
		 }
		 :DOC*/
		['diffuseTexture', 'sampler2D', samplerOption],
		['diffuseTexCoordIndex', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`environmentTexture`,
			 return : 'RedBitmapCubeTexture'
		 }
		 :DOC*/
		['environmentTexture', 'samplerCube', {
			callback: samplerOption.callback
		}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`normalTexture`,
			 return : 'RedBitmapTexture'
		 }
		 :DOC*/
		['normalTexture', 'sampler2D', samplerOption],
		['normalTexCoordIndex', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`occlusionTexture`,
			 return : 'RedBitmapTexture'
		 }
		 :DOC*/
		['occlusionTexture', 'sampler2D', samplerOption],
		['occlusionTexCoordIndex', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`emissiveTexture`,
			 return : 'RedBitmapTexture'
		 }
		 :DOC*/
		['emissiveTexture', 'sampler2D', samplerOption],
		['emissiveTexCoordIndex', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`roughnessTexture`,
			 return : 'RedBitmapTexture'
		 }
		 :DOC*/
		['roughnessTexture', 'sampler2D', samplerOption],
		['roughnessTexCoordIndex', 'number'],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`normalPower`,
			 description : `기본값 : 1`,
			 return : 'number'
		 }
		 :DOC*/
		['normalPower', 'number', {'min': 0}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`specularPower`,
			 description : `기본값 : 1`,
			 return : 'Number'
		 }
		 :DOC*/
		['specularPower', 'number', {'min': 0}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`metallicFactor`,
			 description : `기본값 : 1`,
			 return : 'Number'
		 }
		 :DOC*/
		['metallicFactor', 'number', {'min': 0, 'max': 1}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`roughnessFactor`,
			 description : `기본값 : 1`,
			 return : 'Number'
		 }
		 :DOC*/
		['roughnessFactor', 'number', {'min': 0, 'max': 1}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`occlusionPower`,
			 description : `기본값 : 1`,
			 return : 'Number'
		 }
		 :DOC*/
		['occlusionPower', 'number', {'min': 0}],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`useFlatMode`,
			 description : `
			    flatMode 사용여부
			    기본값 : true
			 `,
			 return : 'boolean'
		 }
		 :DOC*/
		['useFlatMode', 'boolean', samplerOption],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`useMaterialDoubleSide`,
			 description : `
			    gltf 파싱에 따른 재질에서 더블사이드 사용여부
			    기본값 : false
			 `,
			 return : 'boolean'
		 }
		 :DOC*/
		['useMaterialDoubleSide', 'boolean', samplerOption],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`useVertexColor_0`,
			 description : `
			    aVertexColor_0 사용여부
			    기본값 : true
			 `,
			 return : 'boolean'
		 }
		 :DOC*/
		['useVertexColor_0', 'boolean', samplerOption],
		['useVertexTangent', 'boolean', samplerOption],
		/*DOC:
		 {
		     code : 'PROPERTY',
			 title :`usePreMultiply`,
			 description : `
			    usePreMultiply 사용여부
			    기본값 : false
			 `,
			 return : 'boolean'
		 }
		 :DOC*/
		['usePreMultiply', 'boolean', samplerOption]
	);
	Object.freeze(RedPBRMaterial_System);
})();
