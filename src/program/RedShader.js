"use strict";
/**DOC:
    {
        constructorYn : true,
        title :`RedShader`,
        description : `
            - RedShader 인스턴스 생성자
            - <b>유일키</b>만 지원.
            - <b>단 프레그먼트/버텍스의 키는 따로 관리함.</b>
            - 쉐이더정보는 <b>Object.freeze</b> 상태로 반환됨.
        `,
        params : {
            redGL : [
                {type:'Red Instance'},
                'redGL 인스턴스'
            ],
            key : [
                {type:'String'},
                '- 등록될 키명'
            ],
            type : [
                {type:'String'},
                '- 버텍스 쉐이더(RedShader.VERTEX_SHADER)',
                '- 프레그먼트 쉐이더(RedShader.FRAGMENT_SHADER)'
            ],
            source : [
                {type:'String'},
                '- 생성할 쉐이더 소스문자열'
            ]
        },
        example : `
            var test;
            test = RedGL(Canvas Element)
            // basic이라는 이름으로 버텍스 쉐이더를 만든다. 
            test.createShaderInfo('basic', RedShader.VERTEX_SHADER, 쉐이더소스)
        `,
        return : 'RedShader Instance'
    }
:DOC*/
var RedShader;
(function () {
    var tShader, tGL;
    var makeShader, compile, parser, mergeShareSource;
    var keyMap;
    var vShareSource, fShareSource;
    vShareSource = [
        'uniform vec4 uTime',
        'uniform vec4 uTime2[10]',
        'varying vec4 vTime',
        'const vec4 uConstTest'
    ]
    fShareSource = [
        'varying vec4 vTime'
    ]
    makeShader = (function () {
        var t0;
        return function (gl, key, type) {
            switch (type) {
                case RedShader.VERTEX:
                    t0 = gl.createShader(gl.VERTEX_SHADER);
                    t0.key = key;
                    t0.type = type;
                    return t0
                case RedShader.FRAGMENT:
                    t0 = gl.createShader(gl.FRAGMENT_SHADER);
                    t0.key = key;
                    t0.type = type;
                    return t0
                default:
                    RedGL.throwFunc('RedShader : 쉐이더 타입을 확인하세요!')
                    break
            }
        }
    })();
    compile = function (gl, type, shader, source) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) RedGL.throwFunc(gl.getShaderInfoLog(shader), '쉐이더 컴파일에 실패하였습니다.')
    }
    mergeShareSource = (function () {
        var t0;
        return function (type, source) {
            switch (type) {
                case RedShader.VERTEX: t0 = vShareSource.concat(); break;
                case RedShader.FRAGMENT: t0 = fShareSource.concat(); break;
                default: RedGL.throwFunc('RedShader : 쉐이더 타입을 확인하세요!')
            }
            source.forEach(function (v) {
                v = v.replace(';', '');
                if (t0.indexOf(v) == -1) t0.push(v);
                else RedGL.throwFunc('중복된 소스 : ', v);
            })
            return t0;
        }
    })();
    parser = (function () {
        var parseData, checkList;
        return function (type, source) {
            parseData = { func: [] }
            checkList = source.match(/attribute[\s\S]+?\;|uniform[\s\S]+?\;|varying[\s\S]+?\;|precision[\s\S]+?\;/g)
            checkList = checkList ? checkList : []
            checkList = mergeShareSource(type, checkList)
            checkList.sort()
            checkList.forEach(function (v) {
                v = v.trim()
                source = source.replace(v + ';', '')
                var data;
                var tType, tName, tDataType, tArrayNum;
                data = v.split(' ')
                console.log(data)
                if (data[2]) {
                    // 정의인경우
                    tType = data[0];
                    tDataType = data[1];
                    tName = data[2].replace(';', '').split('[');
                    tArrayNum = tName.length > 1 ? +tName[1].charAt(0) : 0;
                    tName = tName[0]
                    // console.log(tType, tName)
                    switch (tType) {
                        case 'attribute':
                            if (tName.charAt(0) != 'a') RedGL.throwFunc('attribute의 첫글자는 a로 시작해야합니다.', tName)
                            break
                        case 'uniform':
                            if (tName.charAt(0) != 'u') RedGL.throwFunc('uniform의 첫글자는 u로 시작해야합니다.', tName)
                            break
                        case 'varying':
                            if (tName.charAt(0) != 'v') RedGL.throwFunc('varying의 첫글자는 v로 시작해야합니다.', tName)
                            break
                    }
                } else {
                    // 변수인경우
                    tType = 'var';
                    tDataType = data[0];
                    tName = data[1].replace(';', '').split('[');
                    tArrayNum = tName.length > 1 ? +tName[1].charAt(0) : 0;
                    tName = tName[0];

                }
                // console.log(tType, tDataType, tName, tArrayNum)

                if (!parseData[tType]) parseData[tType] = {}, parseData[tType]['list'] = [], parseData[tType]['map'] = {}, parseData[tType]['source'] = '';
                parseData[tType]['list'].push(
                    {
                        dataType: tDataType,
                        name: tName,
                        arrayNum: tArrayNum
                    }
                );
                parseData[tType]['map'][tName] = v;
                parseData[tType]['source'] += v + ';\n';
            });

            // 함수부를 찾아서 머징
            source= source.trim()
            console.log(source)
            source.match(/\;[\s\S]+\([\s\S]+?\}/g).forEach(function (v) {
                console.log('---')
                v = v.trim();
                console.log(v)
                parseData['func'].push(v)
            })

            var mergeStr;
            mergeStr = '';
            if (parseData['precision']) mergeStr += parseData['precision']['source'];
            if (parseData['attribute']) mergeStr += parseData['attribute']['source'];
            if (parseData['uniform']) mergeStr += parseData['uniform']['source'];
            if (parseData['varying']) mergeStr += parseData['varying']['source'];
            if (parseData['var']) mergeStr += parseData['var']['source'];
            mergeStr += parseData['func'].join('\n');
            parseData.lastSource = mergeStr;
            console.log(mergeStr)
            return parseData;
        }
    })()
    RedShader = function (redGL, key, type, source) {
        if (!(this instanceof RedShader)) return new RedShader(redGL, key, type, source)
        if (!(redGL instanceof RedGL)) throw 'RedShader : RedGL 인스턴스만 허용됩니다.'
        if (typeof key != 'string') throw 'RedShader : key - 문자열만 허용됩니다.'
        if (typeof type != 'string') throw 'RedShader : type - 문자열만 허용됩니다.'
        if (typeof source != 'string') throw 'RedShader : source - 문자열만 허용됩니다.'
        tGL = redGL.gl

        tShader = makeShader(tGL, key, type);
        this['parseData'] = parser(type, source);
        source = this['parseData']['lastSource'];
        compile(tGL, type, tShader, source);
        /**DOC:
        {
            title :`key`,
            description : `고유키`,
            example : `인스턴스.key`,
            return : 'String'
        }
        :DOC*/
        this['key'] = key
        /**DOC:
		{
            title :`type`,
			description : `RedShader.VERTEX_SHADER or RedShader.FRAGMENT_SHADER`,
			example : `인스턴스.type`,
			return : 'String'
		}
	    :DOC*/
        this['type'] = type
        /**DOC:
		{
            title :`shader`,
			description : `실제 쉐이더(WebGLShader instance)`,
			example : `인스턴스.shader`,
			return : 'String'
		}
	    :DOC*/
        this['webglShader'] = tShader
        this['_UUID'] = RedGL['makeUUID']();
        console.log(this);
        Object.seal(this)
        // console.log(this)
    }
    /**DOC:
		{
            title :`FRAGMENT_SHADER`,
            code: 'CONST',
			description : `
				프레그먼트 쉐이더 상수.
			`,
			example : `
				RedShader.FRAGMENT_SHADER
			`,
			return : 'String'
		}
	:DOC*/
    RedShader.FRAGMENT = 'fragmentShader'
    /**DOC:
		{
            title :`VERTEX_SHADER`,
            code: 'CONST',
			description : `
				버텍스 쉐이더 상수.
			`,
			example : `
				RedShader.FRAGMENT_SHADER
			`,
			return : 'String'
		}
	:DOC*/
    RedShader.VERTEX = 'vertexShader'
    Object.freeze(RedShader)
})();