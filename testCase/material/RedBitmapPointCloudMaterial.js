/*
 * RedGL - MIT License
 * Copyright (c) 2018 - 2019 By RedCamel(webseon@gmail.com)
 * https://github.com/redcamel/RedGL2/blob/dev/LICENSE
 * Last modification time of this file - 2019.4.30 18:53
 */

"use strict";
RedGL.setDoNotPrepareProgram();
RedTest.title = "RedBitmapPointCloudMaterial TEST";
RedGL(document.createElement('canvas'), function () {
		var tRedGL = this;
		var tDiffuseTexture = RedBitmapTexture(tRedGL, RedBitmapTexture.EMPTY_BASE64);
		RedTest.testGroup(
			"RedBitmapPointCloudMaterial( redGL )",
			function () {
				RedTest.test(
					"성공테스트 : 기본 생성 테스트",
					function () {
						try {
							RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
							RedTest.run(true)
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					true
				);
				RedTest.test(
					"실패테스트 : RedGL instance만 허용.",
					function () {
						try {
							RedBitmapPointCloudMaterial(1);
							RedTest.run(true)
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					false
				)
			}
		);
		RedTest.testGroup(
			"(RedBitmapPointCloudMaterial Instance).<b>diffuseTexture</b> = value",
			function () {
				RedTest.test(
					"실패테스트  : null 세팅 허용하지 않음",
					function () {
						try {
							var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
							t0.diffuseTexture = null
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					false
				);
				RedTest.test(
					"실패테스트  : RedBitmapTexture Instance만 허용",
					function () {
						try {
							var t0 = RedBitmapPointCloudMaterial(tRedGL, 1);
							t0.diffuseTexture = null
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					false
				)
			}
		);
		RedTest.testGroup(
			"(RedBitmapPointCloudMaterial Instance).<b>alpha</b> = value",
			function () {
				RedTest.test(
					"실패테스트  : 생성인자 반영되는지 체크 : 숫자만 허용하는지",
					function () {
						try {
							var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
							t0.alpha = 'failTest'
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					false
				);
				RedTest.test(
					"성공테스트 : 0.5",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.alpha = 0.5;
						RedTest.run(t0['alpha'])
					},
					0.5
				);
				RedTest.test(
					"성공테스트 : 1이상을 입력하면 1로 치환되는지",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.alpha = 1000;
						RedTest.run(t0['alpha'])
					},
					1
				);
				RedTest.test(
					"성공테스트 : 0이하를 입력하면 0으로 치환되는지",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.alpha = -1000;
						RedTest.run(t0['alpha'])
					},
					0
				)
			}
		);
		RedTest.testGroup(
			"(RedBitmapPointCloudMaterial Instance).<b>cutOff</b> = value",
			function () {
				RedTest.test(
					"실패테스트  : 생성인자 반영되는지 체크 : 숫자만 허용하는지",
					function () {
						try {
							var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
							t0.cutOff = 'failTest'
						} catch (error) {
							RedTest.run(false, error)
						}
					},
					false
				);
				RedTest.test(
					"성공테스트 : 0.5",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.cutOff = 0.5;
						RedTest.run(t0['cutOff'])
					},
					0.5
				);
				RedTest.test(
					"성공테스트 : 1이상을 입력하면 1로 치환되는지",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.cutOff = 1000;
						RedTest.run(t0['cutOff'])
					},
					1
				);
				RedTest.test(
					"성공테스트 : 0이하를 입력하면 0으로 치환되는지",
					function () {
						var t0 = RedBitmapPointCloudMaterial(tRedGL, tDiffuseTexture);
						t0.cutOff = -1000;
						RedTest.run(t0['cutOff']);
						tRedGL.gl.getExtension('WEBGL_lose_context').loseContext();
					},
					0
				)
			}
		)
	}
);
