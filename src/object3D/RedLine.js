"use strict";
var RedLine;
(function () {
    /**DOC:
        {
            constructorYn : true,
            title :`RedLine`,
            description : `
                RedLine Instance 생성기
            `,
            params : {
                geometry : [
                    {type:'RedGeometry'},
                    `geometry`
                ],
                material : [
                    {type:'RedBaseMaterial 확장 Instance'},
                    `material`
                ]
            },
            return : 'RedProgram Instance'
        }
    :DOC*/
    RedLine = function (redGL, material) {
        if (!(this instanceof RedLine)) return new RedLine(redGL, material);
        if (!(redGL instanceof RedGL)) RedGLUtil.throwFunc('RedLine : RedGL Instance만 허용됩니다.')
        if (!(material instanceof RedBaseMaterial)) RedGLUtil.throwFunc('RedLine : RedBaseMaterial 확장 Instance만 허용됩니다.')
        var tGL;
        var interleaveData, indexData
        var interleaveBuffer, indexBuffer
        interleaveData = [];
        indexData = [];

        this['_UUID'] = RedGL['makeUUID']();

        interleaveBuffer = RedBuffer(
            redGL,
            'RedLine_InterleaveBuffer_' + this['_UUID'],
            new Float32Array(interleaveData),
            RedBuffer.ARRAY_BUFFER, [
                {
                    attributeKey: 'aVertexPosition',
                    size: 3,
                    normalize: false
                }
            ]
        )

        indexBuffer = RedBuffer(
            redGL,
            'RedLine_indexBuffer_' + this['_UUID'],
            new Uint16Array(indexData),
            RedBuffer.ELEMENT_ARRAY_BUFFER
        )


        this['addPoint'] = function (x, y, z) {
            var t = interleaveData.length / 3
            interleaveData.push(x, y, z)
            indexData.push(t)
        }

        this['upload'] = function () {
            interleaveBuffer['upload'](new Float32Array(interleaveData));
            indexBuffer['upload'](new Uint16Array(indexData));
            interleaveBuffer.parseInterleaveDefineInfo();
            indexBuffer.parseInterleaveDefineInfo();
        }

        tGL = redGL.gl;
        RedBaseObject3D['build'].call(this, tGL)
        /**DOC:
		{
            title :`geometry`,
            description : `geometry`,
			return : 'RedGeometry'
		}
	    :DOC*/
        this['geometry'] = RedGeometry(interleaveBuffer, indexBuffer);
        /**DOC:
		{
            title :`material`,
            description : `material`,
            return : 'RedBaseMaterial 확장 Instance'
		}
	    :DOC*/
        this['material'] = material;
        /**DOC:
		{
            title :`drawMode`,
            description : `drawMode`,
            return : 'gl 상수'
		}
	    :DOC*/
        this['drawMode'] = tGL.LINE_STRIP
        
        // Object.seal(RedLine);
        // console.log(this);
    }
    RedGLUtil['extendsProto'](RedLine, RedBaseContainer);
    RedGLUtil['extendsProto'](RedLine, RedBaseObject3D);
    Object.freeze(RedLine);
})();