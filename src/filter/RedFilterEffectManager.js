/*
 *   RedGL - MIT License
 *   Copyright (c) 2018 - 2019 By RedCamel( webseon@gmail.com )
 *   https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 *   Last modification time of this file - 2019.8.7 15:42:44
 *
 */

"use strict";
var RedFilterEffectManager;
(function () {
	var tRedGL;
	/*DOC:
	 {
		 constructorYn : true,
		 title :`RedFilterEffectManager`,
		 description : `
			 RedFilterEffectManager Instance 생성.
			 RedScene 생성시 내부속성으로 자동생성됨.
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 demo : '../example/RedFilters.html',
		 return : 'RedFilterEffectManager Instance'
	 }
	 :DOC*/
	RedFilterEffectManager = function (redGL) {
		if (!(this instanceof RedFilterEffectManager)) return new RedFilterEffectManager(redGL);
		redGL instanceof RedGL || RedGLUtil.throwFunc('RedFilterEffectManager : RedGL Instance만 허용.', redGL);
		/*DOC:
		 {
			title :`frameBuffer`,
			code : 'PROPERTY',
			description : `
				필터 렌더링시 사용될 프레임버퍼
			`,
			return : 'RedFrameBuffer Instance'
		}
		 :DOC*/
		Object.defineProperty(this, 'frameBuffer', {value: RedFilterFrameBuffer(redGL)});
		Object.defineProperty(this, 'finalMaterial', {value: RedFilterMaterial(redGL, this['frameBuffer']['texture'])});
		/*DOC:
		 {
			title :`filterList`,
			code : 'PROPERTY',
			description : `
				필터 리스트
			`,
			return : 'Array'
		}
		 :DOC*/
		this['filterList'] = [];
		var quadMesh = RedMesh(redGL, RedPlane(redGL, 1, 1, 1, 1, true), this['finalMaterial']);
		quadMesh.useCullFace = false;
		Object.defineProperty(this, 'children', {value: [quadMesh]});
		this['_UUID'] = RedGL.makeUUID();
		console.log(this);
	};
	RedFilterEffectManager.prototype = {
		/*DOC:
		 {
			title :`bind`,
			code : 'METHOD',
			description : `
				프레임 버퍼 바인딩.
				렌더러에서 자동호출됨.
			`,
			params : {
				gl : [
					{type:'WebGL Context'}
				]
			},
			return : 'void'
		}
		 :DOC*/
		bind: function (gl) {
			this['frameBuffer'].bind(gl);
		},
		/*DOC:
		 {
			title :`unbind`,
			code : 'METHOD',
			description : `
				프레임 버퍼 언바인딩.
				렌더러에서 자동호출됨.
			`,
			params : {
				gl : [
					{type:'WebGL Context'}
				]
			},
			return : 'void'
		}
		 :DOC*/
		unbind: function (gl) {
			this['frameBuffer'].unbind(gl);
		},
		render: (function () {
			var tQuadMesh;
			var originFrameBufferTexture, lastFrameBufferTexture;

			var drawEffect;
			var tCacheSystemUniformInfo;
			var tEffectList;
			tEffectList = [];
			drawEffect = function (redGL, effect, quadChildren, redView, tCamera, redRenderer, time, renderInfo, tMesh, depth, length) {
				var tPerspectiveMTX = [];
				var tProgram;
				var tLocationInfo;
				var tSystemUniformLocation;
				var tLocation;
				var tUUID;
				var tValueStr;
				var tParentFrameBufferTexture;
				var gl;
				var i, len;
				var tScene, tViewRect;
				var tFrameBuffer;
				gl = redGL.gl;
				tScene = redView['scene'];
				tViewRect = redView['_viewRect'];
				////////////////////////////////////////////////////////////////////////////
				if (effect['_process'] && effect['_process'].length) {
					tParentFrameBufferTexture = lastFrameBufferTexture;
					i = 0;
					len = effect['_process'].length;
					for (i; i < len; i++) {
						drawEffect(redGL, effect['_process'][i], quadChildren, redView, tCamera, redRenderer, time, renderInfo, tMesh, depth + 1);
					}
				}
				tFrameBuffer = effect['frameBuffer'];
				if (tFrameBuffer) {
					// 최종메쉬의 재질을 현재 필터로 변경
					tFrameBuffer['_width'] = parseInt(tViewRect[2]);
					tFrameBuffer['_height'] = parseInt(tViewRect[3]);
					tQuadMesh['_material'] = effect;
					// 프로그램을 변경
					tProgram = tQuadMesh['_material']['program'];
					gl.useProgram(tProgram['webglProgram']);
					// 시스템 유니폼중 업데이트 해야할 목록 처리
					tSystemUniformLocation = tProgram['systemUniformLocation'];
					// 퍼스펙티브 매트릭스 처리
					tLocationInfo = tSystemUniformLocation['uPMatrix'];
					if (tLocationInfo) {
						tLocation = tLocationInfo['location'];
						tUUID = tLocationInfo['_UUID'];
						if (tLocation) {
							if (tCamera['mode2DYn']) {
								var x, y, z;
								// mat4.ortho(
								// 	tPerspectiveMTX,
								// 	-0.5, // left
								// 	0.5, // right
								// 	-0.5, // bottom
								// 	0.5, // top,
								// 	-tCamera['farClipping'],
								// 	tCamera['farClipping']
								// );
								// mat4.translate(tPerspectiveMTX, tPerspectiveMTX, [-0.5, 0.5, 0]);
								// mat4.scale(tPerspectiveMTX, tPerspectiveMTX, [1 / parseInt(tViewRect[2]) * tRedGL.renderScale * window.devicePixelRatio, 1 / parseInt(tViewRect[3]) * tRedGL.renderScale * window.devicePixelRatio, 1])
								//ortho
								tPerspectiveMTX[0] = 2;
								tPerspectiveMTX[1] = 0;
								tPerspectiveMTX[2] = 0;
								tPerspectiveMTX[3] = 0;
								tPerspectiveMTX[4] = 0;
								tPerspectiveMTX[5] = 2;
								tPerspectiveMTX[6] = 0;
								tPerspectiveMTX[7] = 0;
								tPerspectiveMTX[8] = 0;
								tPerspectiveMTX[9] = 0;
								tPerspectiveMTX[10] = 2 * -1 / tCamera['farClipping'] * 2;
								tPerspectiveMTX[11] = 0;
								tPerspectiveMTX[12] = 0;
								tPerspectiveMTX[13] = 0;
								tPerspectiveMTX[14] = 0;
								tPerspectiveMTX[15] = 1;
								x = -0.5, y = 0.5, z = 0;
								tPerspectiveMTX[12] = tPerspectiveMTX[0] * x + tPerspectiveMTX[4] * y + tPerspectiveMTX[8] * z + tPerspectiveMTX[12];
								tPerspectiveMTX[13] = tPerspectiveMTX[1] * x + tPerspectiveMTX[5] * y + tPerspectiveMTX[9] * z + tPerspectiveMTX[13];
								tPerspectiveMTX[14] = tPerspectiveMTX[2] * x + tPerspectiveMTX[6] * y + tPerspectiveMTX[10] * z + tPerspectiveMTX[14];
								tPerspectiveMTX[15] = tPerspectiveMTX[3] * x + tPerspectiveMTX[7] * y + tPerspectiveMTX[11] * z + tPerspectiveMTX[15];
								x = 1 / parseInt(tViewRect[2]) * tRedGL.renderScale * window.devicePixelRatio;
								y = 1 / parseInt(tViewRect[3]) * tRedGL.renderScale * window.devicePixelRatio;
								z = 1;
								tPerspectiveMTX[0] = tPerspectiveMTX[0] * x;
								tPerspectiveMTX[1] = tPerspectiveMTX[1] * x;
								tPerspectiveMTX[2] = tPerspectiveMTX[2] * x;
								tPerspectiveMTX[3] = tPerspectiveMTX[3] * x;
								tPerspectiveMTX[4] = tPerspectiveMTX[4] * y;
								tPerspectiveMTX[5] = tPerspectiveMTX[5] * y;
								tPerspectiveMTX[6] = tPerspectiveMTX[6] * y;
								tPerspectiveMTX[7] = tPerspectiveMTX[7] * y;
								tPerspectiveMTX[8] = tPerspectiveMTX[8] * z;
								tPerspectiveMTX[9] = tPerspectiveMTX[9] * z;
								tPerspectiveMTX[10] = tPerspectiveMTX[10] * z;
								tPerspectiveMTX[11] = tPerspectiveMTX[11] * z;


							} else {
								tPerspectiveMTX = tCamera['perspectiveMTX']
							}
							tValueStr = JSON.stringify(tPerspectiveMTX);
							if (tCacheSystemUniformInfo[tUUID] != tValueStr) {
								gl.uniformMatrix4fv(tLocation, false, tPerspectiveMTX);
								tCacheSystemUniformInfo[tUUID] = tValueStr;
							}
						}
					}
					//////////////////////////////////////////////////////////////////////
					// if (!tCamera['mode2DYn'] || depth || length > 1) {
						gl.bindFramebuffer(gl.FRAMEBUFFER, tFrameBuffer['webglFrameBuffer']);
						gl.activeTexture(gl.TEXTURE0);
						gl.bindTexture(gl.TEXTURE_2D, tFrameBuffer['texture']['webglTexture']);

						if (tFrameBuffer['_prevWidth'] != tFrameBuffer['width'] || tFrameBuffer['_prevHeight'] != tFrameBuffer['height']) {
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tFrameBuffer['width'], tFrameBuffer['height'], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
						} else {
							gl.clear(gl.COLOR_BUFFER_BIT)
						}


						tFrameBuffer._prevWidth = tFrameBuffer['width'];
						tFrameBuffer._prevHeight = tFrameBuffer['height']
					// }
					// 해당 필터의 기본 텍스쳐를 지난 필터의 최종 텍스쳐로 업로드
					if (effect['_process'] && effect['_process'].length) {
						effect.updateTexture(
							lastFrameBufferTexture,
							tParentFrameBufferTexture
						);
					} else {
						effect['_diffuseTexture'] = lastFrameBufferTexture;
					}
					// 해당 필터를 렌더링하고
					redRenderer.sceneRender(redGL, tScene, tCamera, tCamera['mode2DYn'], quadChildren, time, renderInfo);
					// 해당 필터의 프레임 버퍼를 언바인딩한다.
					// if (!tCamera['mode2DYn'] || depth || length > 1) {
						gl.bindFramebuffer(gl.FRAMEBUFFER, null);
					// }
					// 현재 필터를 최종 텍스쳐로 기록하고 다음 필터가 있을경우 활용한다.
					lastFrameBufferTexture = tFrameBuffer['texture'];
				}
			};
			return function (redGL, gl, redRenderer, redView, time, renderInfo, tMesh) {
				var tCamera;
				var tScene;
				var tViewRect, tWorldRect;
				var minX, minY, minZ, maxX, maxY, maxZ, vx, vy, vz, t, i, len;
				var tx, ty, tz;
				var tMatrix;
				var stride;
				var currentAABB;
				var tRadius;
				var tScaleX, tScaleY, tScaleTestX, tScaleTestY;
				var prevEffect, tEffect;
				prevEffect = null;
				tScaleX = tScaleY = 0;
				tRedGL = redGL;
				tScene = redView['scene'];
				tRadius = 0;
				tCamera = redView['camera'] instanceof RedBaseController ? redView['camera']['camera'] : redView['camera'];
				tViewRect = redView['_viewRect'];
				tWorldRect = redRenderer['worldRect'];
				tCacheSystemUniformInfo = redRenderer['cacheInfo']['cacheSystemUniformInfo'];
				/////////////////////////////////////////////////////////////////////
				// 쿼드메쉬 영역 계산
				tMatrix = tMesh.matrix;
				stride = tMesh._geometry['interleaveBuffer']['stride'];
				minX = minY = minZ = maxX = maxY = maxZ = 0;
				t = tMesh._geometry['interleaveBuffer']['data'];
				i = 0;
				len = tMesh._geometry['interleaveBuffer']['pointNum'];
				for (i; i < len; i++) {
					vx = i * stride , vy = vx + 1, vz = vx + 2;
					tx = tMatrix[0] * t[vx] + tMatrix[4] * t[vy] + tMatrix[8] * t[vz];
					ty = tMatrix[1] * t[vx] + tMatrix[5] * t[vy] + tMatrix[9] * t[vz];
					tz = tMatrix[2] * t[vx] + tMatrix[6] * t[vy] + tMatrix[10] * t[vz];
					minX = tx < minX ? tx : minX;
					maxX = tx > maxX ? tx : maxX;
					minY = ty < minY ? ty : minY;
					maxY = ty > maxY ? ty : maxY;
					minZ = tz < minZ ? tz : minZ;
					maxZ = tz > maxZ ? tz : maxZ;
				}
				currentAABB = [maxX - minX, maxY - minY, maxZ - minZ];
				/////////////////////////////////////////////////////////////////////
				// 렌더링할 필터 리스트를 정리한다.
				tEffectList.length = 0;
				i = 0;
				len = this['filterList'].length;
				tQuadMesh = this['children'][0];
				for (i; i < len; i++) {
					tEffect = this['filterList'][i];

					if (prevEffect != tEffect) {
						// 최종 필터 리스트에 등록
						tEffectList[tEffectList.length] = tEffect;
						// 스케일 계산
						if (tEffect instanceof RedFilter_Blur) {
							tScaleTestX = currentAABB[0] + (tCamera['mode2DYn'] ? 5 : 0)
							tScaleTestY = currentAABB[1] + (tCamera['mode2DYn'] ? 5 : 0)
						} else if (tEffect instanceof RedFilter_BlurX || tEffect instanceof RedFilter_BlurY) {
							tScaleTestX = currentAABB[0] + tEffect['_size'] ;
							tScaleTestY = currentAABB[1] + tEffect['_size'] ;
						} else if (tEffect instanceof RedFilter_GaussianBlur) {
							tScaleTestX = currentAABB[0] + tEffect['_radius'];
							tScaleTestY = currentAABB[1] + tEffect['_radius'];
						} else if (tEffect instanceof RedFilter_Bloom) {
							tScaleTestX = currentAABB[0] + tEffect['_blur'];
							tScaleTestY = currentAABB[1] + tEffect['_blur'];
						} else {
							tScaleTestX = currentAABB[0];
							tScaleTestY = currentAABB[1]
						}

						tScaleX = tScaleX < tScaleTestX ? tScaleTestX : tScaleX;
						tScaleY = tScaleY < tScaleTestY ? tScaleTestY : tScaleY;
					}

					prevEffect = tEffect
				}

				// 쿼드메쉬 위치 설정
				tQuadMesh.x = tMesh.x;
				tQuadMesh.y = tMesh.y;
				tQuadMesh.z = tMesh.z;
				// 쿼드메쉬 영역 설정
				if (tCamera['mode2DYn']) {
					// 2D 일떄
					tQuadMesh.scaleX = tScaleX;
					tQuadMesh.scaleY = tScaleY;
					tQuadMesh.scaleZ = 1;
				} else {
					// 3D 일때
					tRadius = Math.sqrt(currentAABB[0] * currentAABB[0] + currentAABB[1] * currentAABB[1]);
					tQuadMesh.scaleY = tQuadMesh.scaleX = tQuadMesh.scaleZ = tRadius
					tQuadMesh.lookAt(tCamera.x, tCamera.y, tCamera.z)

				}
				////////////////////////////////////////////////////////////////////////////
				// 프레임 버퍼 정보를 캐싱
				lastFrameBufferTexture = originFrameBufferTexture = this['frameBuffer']['texture'];
				////////////////////////////////////////////////////////////////////////////
				// 최종결과는 RedView의 사이즈와 동일하게 한다.
				this['frameBuffer']['_width'] = tViewRect[2];
				this['frameBuffer']['_height'] = tViewRect[3];

				if (tCamera['mode2DYn']) {
					gl.scissor(
						parseInt(tMesh.x * redGL._renderScale * window.devicePixelRatio - tQuadMesh.scaleX / 2 * window.devicePixelRatio)-10,
						parseInt(tViewRect[3] - tMesh.y * redGL._renderScale * window.devicePixelRatio - tQuadMesh.scaleY / 2 * window.devicePixelRatio)-10,
						parseInt(tQuadMesh.scaleX * window.devicePixelRatio)+20,
						parseInt(tQuadMesh.scaleY * window.devicePixelRatio)+20
					);
				} else {
					var tScreen_point;
					var tScreen_distance;
					var tScreen_resultMTX;
					var tScreen_resultPosition;
					tScreen_resultPosition = {x: 0, y: 0, z: 0, w: 0};
					tScreen_resultMTX = [
						1, 0, 0, 0,
						0, 1, 0, 0,
						0, 0, 1, 0,
						0, 0, 0, 1
					];
					/////////////////////////////////////////////////////////////////////////////////
					mat4.multiply(tScreen_resultMTX, tCamera.perspectiveMTX, tCamera.matrix);
					mat4.multiply(tScreen_resultMTX, tScreen_resultMTX, tQuadMesh['matrix']);
					////////////////////////////////////////////////////////////////////////////////
					tScreen_resultPosition.x = tScreen_resultMTX[12], tScreen_resultPosition.y = tScreen_resultMTX[13], tScreen_resultPosition.z = tScreen_resultMTX[14], tScreen_resultPosition.w = tScreen_resultMTX[15];
					tScreen_resultPosition.x = tScreen_resultPosition.x * 0.5 / tScreen_resultPosition.w + 0.5;
					tScreen_resultPosition.y = tScreen_resultPosition.y * 0.5 / tScreen_resultPosition.w + 0.5;
					tScreen_point = [
						(tViewRect[0] + tScreen_resultPosition.x * tViewRect[2]) / window.devicePixelRatio,
						(tViewRect[1] + (1 - tScreen_resultPosition.y) * tViewRect[3]) / window.devicePixelRatio
					];
					tScreen_distance = vec3.distance([tCamera.x, tCamera.y, tCamera.z], [tMesh.x, tMesh.y, tMesh.z]);
					tRadius = tRadius / (tScreen_distance) * tViewRect[3]
					if (tRadius > tViewRect[3]) tRadius = tViewRect[3]
					gl.scissor(
						parseInt(tScreen_point[0] * window.devicePixelRatio - tRadius / 2),
						parseInt(tWorldRect[3] - tScreen_point[1] * window.devicePixelRatio - tRadius / 2),
						parseInt(tRadius),
						parseInt(tRadius)
					);
				}

				////////////////////////////////////////////////////////////////////////////
				// 필터 렌더
				i = 0;
				len = tEffectList.length;
				for (i; i < len; i++) drawEffect(redGL, tEffectList[i], this['children'], redView, tCamera, redRenderer, time, renderInfo, tMesh, 0, len);
				////////////////////////////////////////////////////////////////////////////
				if (redView['postEffectManager']['postEffectList'].length) {
					var tPostEffectManagerFrameBuffer = redView['postEffectManager']['frameBuffer']
					gl.bindFramebuffer(gl.FRAMEBUFFER, tPostEffectManagerFrameBuffer['webglFrameBuffer']);
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, tPostEffectManagerFrameBuffer['texture']['webglTexture']);
					// 렌더버퍼 세팅
					gl.bindRenderbuffer(gl.RENDERBUFFER, tPostEffectManagerFrameBuffer['webglRenderBuffer']);
					// 프레임버퍼 세팅
					gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tPostEffectManagerFrameBuffer['texture']['webglTexture'], 0);
					gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, tPostEffectManagerFrameBuffer['webglRenderBuffer']);
				}
				if (lastFrameBufferTexture != originFrameBufferTexture) {
					this['finalMaterial']['_diffuseTexture'] = lastFrameBufferTexture;
					tQuadMesh._material = this['finalMaterial'];
					redRenderer.sceneRender(redGL, tScene, tCamera, tCamera['mode2DYn'], this['children'], time, renderInfo);
				}
				gl.scissor(tViewRect[0], tWorldRect[3] - tViewRect[3] - tViewRect[1], tViewRect[2], tViewRect[3]);
				this['finalMaterial']['_diffuseTexture'] = this['frameBuffer']['texture'];
			}
		})()
	};
	Object.freeze(RedFilterEffectManager);
})();