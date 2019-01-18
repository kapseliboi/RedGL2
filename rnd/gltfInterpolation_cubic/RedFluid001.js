"use strict";
var RedFluid001;
(function () {
    var vSource, fSource;
    var PROGRAM_NAME = 'RedFluid001Program';
    var PROGRAM_OPTION_LIST = [];
    var checked;
    vSource = function () {
        /* @preserve
          // 스키닝
          //#REDGL_DEFINE#vertexShareFunc#getSkinMatrix#

          // Sprite3D
          //#REDGL_DEFINE#vertexShareFunc#getSprite3DMatrix#

//#REDGL_DEFINE#displacementTexture# uniform sampler2D u_displacementTexture;
//#REDGL_DEFINE#displacementTexture# uniform float u_displacementPower;
//#REDGL_DEFINE#displacementTexture# uniform float u_displacementFlowSpeedX;
//#REDGL_DEFINE#displacementTexture# uniform float u_displacementFlowSpeedY;

          void main(void) {
           gl_PointSize = uPointSize;
                vTexcoord = aTexcoord;

                // normal 계산
                vVertexNormal = (uNMatrix * vec4(aVertexNormal,1.0)).xyz;

                // position 계산
                //#REDGL_DEFINE#skin#true# mat4 targetMatrix = uMMatrix *  getSkinMatrix() ;
                //#REDGL_DEFINE#skin#false# mat4 targetMatrix = uMMatrix;
                vVertexPosition =  targetMatrix *  vec4(aVertexPosition, 1.0);

                //#REDGL_DEFINE#displacementTexture# vVertexPosition.xyz += normalize(vVertexNormal) * texture2D(u_displacementTexture, vTexcoord + vec2(
                //#REDGL_DEFINE#displacementTexture#    u_displacementFlowSpeedX * (uTime/1000.0),
                //#REDGL_DEFINE#displacementTexture#    u_displacementFlowSpeedY * (uTime/1000.0)
                //#REDGL_DEFINE#displacementTexture# )).x * u_displacementPower ;

                // 최종 포지션 계산
                //#REDGL_DEFINE#sprite3D#true# gl_Position = uPMatrix * getSprite3DMatrix(uCameraMatrix , targetMatrix) *  vec4(aVertexPosition, 1.0);
                //#REDGL_DEFINE#sprite3D#true# if(!u_PerspectiveScale){
                //#REDGL_DEFINE#sprite3D#true#   gl_Position /= gl_Position.w;
                //#REDGL_DEFINE#sprite3D#true#   gl_Position.xy += aVertexPosition.xy * vec2(targetMatrix[0][0],targetMatrix[1][1] * uResolution.x/uResolution.y);
                //#REDGL_DEFINE#sprite3D#true# }
                //#REDGL_DEFINE#sprite3D#false# gl_Position = uPMatrix * uCameraMatrix * vVertexPosition;

                // 쉐도우 계산
                //#REDGL_DEFINE#directionalShadow#true# vResolution = uResolution;
                //#REDGL_DEFINE#directionalShadow#true# vShadowPos = cTexUnitConverter * uDirectionalShadowLightMatrix * vVertexPosition;
              vTexcoord = aTexcoord;
            vResolution = uResolution;
            vTime = uTime;

          }
        */
    };
    fSource = function () {
        /* @preserve
        precision mediump float;
        uniform sampler2D u_texture;

        //	Simplex 3D Noise
        //	by Ian McEwan, Ashima Arts
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
     const vec2 cC = vec2(1.0/6.0, 1.0/3.0) ;
     const vec4 cD = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
     vec3 i = floor(v + dot(v, cC.yyy) );
     vec3 x0 =  v - i + dot(i, cC.xxx) ;

    // Other corners
     vec3 g = step(x0.yzx, x0.xyz);
     vec3 l = 1.0 - g;
     vec3 i1 = min( g.xyz, l.zxy );
     vec3 i2 = max( g.xyz, l.zxy );

     // x0 = x0 - 0. + 0.0 * cC
     vec3 x1 = x0 - i1 + 1.0 * cC.xxx;
     vec3 x2 = x0 - i2 + 2.0 * cC.xxx;
     vec3 x3 = x0 - 1. + 3.0 * cC.xxx;

    // Permutations
     i = mod(i, 289.0 );
     vec4 p = permute( permute( permute(
           i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    //Gradients
     float n_ = 1.0/7.0; // N=7
     vec3 ns = n_ * cD.wyz - cD.xzx;

     vec4 j = p - 49.0 * floor(p * ns.z *ns.z); // mod(p,N*N)

     vec4 x_ = floor(j * ns.z);
     vec4 y_ = floor(j - 7.0 * x_ );  // mod(j,N)

     vec4 x = x_ *ns.x + ns.yyyy;
     vec4 y = y_ *ns.x + ns.yyyy;
     vec4 h = 1.0 - abs(x) - abs(y);

     vec4 b0 = vec4( x.xy, y.xy );
     vec4 b1 = vec4( x.zw, y.zw );

     vec4 s0 = floor(b0)*2.0 + 1.0;
     vec4 s1 = floor(b1)*2.0 + 1.0;
     vec4 sh = -step(h, vec4(0.0));

     vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
     vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

     vec3 p0 = vec3(a0.xy,h.x);
     vec3 p1 = vec3(a0.zw,h.y);
     vec3 p2 = vec3(a1.xy,h.z);
     vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
     vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
     p0 *= norm.x;
     p1 *= norm.y;
     p2 *= norm.z;
     p3 *= norm.w;

    // Mix final noise value
     vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
     m = m * m;
     return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                    dot(p2,x2), dot(p3,x3) ) );
    }
    vec3 render(vec2 p) {
     vec3 c = vec3(0.0);

     float nx = p.x * 15.0;
     float ny = p.y * 20.5;
     float nz = vTime * 0.0001 ;
     p.y += 0.2 * snoise(vec3(nx, ny, nz));

     vec4 t = texture2D(u_texture, p);

     c += vec3(vec4(texture2D(u_texture, p - 0.1)).r, t.g, t.b);

     // c *= 1.0 - length(p) * 0.2;

     c = vec3(
        smoothstep(0.0, 1.0, c.x),
        c.y,
        0.1 + 0.8 * c.z
       );

     return c;
    }
         void main(void) {

           vec2 uv = (gl_FragCoord.xy / vResolution) * 2.0 - 1.0 ;
           vec2 tuv = gl_FragCoord.xy / vResolution;
           uv += vVertexPosition.xy/vResolution;

           vec4 c = vec4(render(uv), 1.0);

           gl_FragColor = c;
         }
         */
    };
    /**DOC:
     {
		 constructorYn : true,
		 title :`RedFluid001`,
		 description : `
			 RedFluid001 Instance 생성
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ],
			 hexColor : [
				 {type:'hex'},
				 '기본값 : #ff0000'
			 ],
			 alpha : [
				 {type:'number'},
				 '기본값 : 1'
			 ]
		 },
		 extends : ['RedBaseMaterial'],
		 demo : '../example/material/RedFluid001.html',
		 example: `
		 RedFluid001(RedGL Instance, hex, alpha)
		 `,
		 return : 'RedFluid001 Instance'
	 }
     :DOC*/
    RedFluid001 = function (redGL, texture,displacementTexture) {
        if (!(this instanceof RedFluid001)) return new RedFluid001(redGL, texture,displacementTexture);
        redGL instanceof RedGL || RedGLUtil.throwFunc('RedFluid001 : RedGL Instance만 허용.', '입력값 : ' + redGL);
        this.makeProgramList(this, redGL, PROGRAM_NAME, vSource, fSource, PROGRAM_OPTION_LIST);
        /////////////////////////////////////////
        // 유니폼 프로퍼티

        /////////////////////////////////////////
        // 일반 프로퍼티
        this['texture'] = texture
        this['displacementTexture'] = displacementTexture;
        this['displacementPower'] = 10;
        this['displacementFlowSpeedX'] = 0;
        this['displacementFlowSpeedY'] = 0;
        this['_UUID'] = RedGL.makeUUID();
        if (!checked) {
            this.checkUniformAndProperty();
            checked = true;
        }
        console.log(this);
    };
    var samplerOption = {
        callback: function () {
            this._searchProgram(PROGRAM_NAME, PROGRAM_OPTION_LIST)
        }
    };
    RedFluid001.prototype = new RedBaseMaterial();
    RedDefinePropertyInfo.definePrototype('RedFluid001', 'texture', 'sampler2D', samplerOption);
    RedDefinePropertyInfo.definePrototype('RedFluid001', 'displacementTexture', 'sampler2D', samplerOption);
    RedDefinePropertyInfo.definePrototype('RedFluid001', 'displacementPower', 'number', {'min': 0});
    RedDefinePropertyInfo.definePrototype('RedFluid001', 'displacementFlowSpeedX', 'number');
    RedDefinePropertyInfo.definePrototype('RedFluid001', 'displacementFlowSpeedY', 'number');
    Object.freeze(RedFluid001);
})();