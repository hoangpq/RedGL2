"use strict";
var RedDirectionalLight;
(function () {
    RedDirectionalLight = function (redGL, hex, alpha) {
        if (!(this instanceof RedDirectionalLight)) return new RedDirectionalLight(redGL, hex, alpha);
        // 유니폼 프로퍼티
        this['color'] = new Float32Array(4)
        this['intensity'] = 1.0
        // 일반 프로퍼티
        this.setColor(hex ? hex : '#fff', alpha==undefined ? 1 : alpha)
        this['x'] = 0
        this['y'] = -1
        this['z'] = 0;
        this['_UUID'] = RedGL['makeUUID']();
        console.log(this.color)
        Object.defineProperty(this, 'type', {
            configurable: false,
            writable: false,
            value: RedDirectionalLight['type']
        })
        this['debugObject'] = RedMesh(redGL, RedBox(redGL,1,1,1), RedColorMaterial(redGL))
        this['debugObject']['drawMode'] = redGL.gl.LINE_STRIP
        console.log(this)
    }
    RedDirectionalLight['type'] = 'RedDirectionalLight'
    RedGLUtil['extendsProto'](RedDirectionalLight, RedBaseLight);
    Object.freeze(RedDirectionalLight)

})()