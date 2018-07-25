"use strict";
var RedPostEffect_Bloom;
(function () {
	var vSource, fSource;
	var PROGRAM_NAME = 'RedPostEffectBloomProgram';
	vSource = function () {
		/* @preserve
		 void main(void) {
		 vTexcoord = aTexcoord;
		 gl_Position = uPMatrix * uMMatrix *  vec4(aVertexPosition, 1.0);
		 }
		 */
	}
	fSource = function () {
		/* @preserve
		 precision mediump float;
		 uniform sampler2D uDiffuseTexture;
		 uniform sampler2D uBlurTexture;

		 uniform float uExposure;
		 uniform float uBloomStrength;
		 void main() {
		 vec4 finalColor = texture2D(uDiffuseTexture, vTexcoord);
		 vec4 thresholdColor = finalColor;
		 vec4 blurColor = texture2D(uBlurTexture, vTexcoord);
		 gl_FragColor = (finalColor  + blurColor * uBloomStrength) * uExposure ;
		 }
		 */
	}
	/**DOC:
	 {
		 constructorYn : true,
		 title :`RedPostEffect_Bloom`,
		 description : `
			 RedPostEffect_Bloom Instance 생성.
		 `,
		 params : {
			 redGL : [
				 {type:'RedGL'}
			 ]
		 },
		 return : 'RedPostEffect_Bloom Instance'
	 }
	 :DOC*/
	RedPostEffect_Bloom = function (redGL) {
		if ( !(this instanceof RedPostEffect_Bloom) ) return new RedPostEffect_Bloom(redGL);
		if ( !(redGL instanceof RedGL) ) RedGLUtil.throwFunc('RedPostEffect_Bloom : RedGL Instance만 허용됩니다.', redGL)
		this['frameBuffer'] = RedFrameBuffer(redGL);
		this['diffuseTexture'] = null;
		this['blurTexture'] = null;
		/////////////////////////////////////////
		// 일반 프로퍼티
		this['process'] = [
			RedPostEffect_BloomThreshold(redGL),
			RedPostEffect_BlurX(redGL),
			RedPostEffect_BlurY(redGL)
		];
		/**DOC:
		 {
			 title :`blur`,
			 description : `
				 blur 정도.
				 기본값 : 20
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		Object.defineProperty(this, 'blur', (function () {
			var _v = 1
			return {
				get: function () { return _v },
				set: function (v) {
					_v = v;
					this['process'][1]['size'] = _v;
					this['process'][2]['size'] = _v;
				}
			}
		})());
		this['blur'] = 20;
		/**DOC:
		 {
			 title :`exposure`,
			 description : `
				 확산 강도.
				 기본값 : 1
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		this['exposure'] = 1;
		/**DOC:
		 {
			 title :`bloomStrength`,
			 description : `
				 블룸 강도
				 기본값 : 1.2
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		this['bloomStrength'] = 1.2;
		/**DOC:
		 {
			 title :`threshold`,
			 description : `
				 최소 유효값
				 기본값 : 75
			 `,
			 return : 'Number'
		 }
		 :DOC*/
		Object.defineProperty(this, 'threshold', (function () {
			var _v = 100
			return {
				get: function () { return _v },
				set: function (v) { this['process'][0]['threshold'] = _v = v }
			}
		})())
		this['threshold'] = 75;
		this['program'] = RedProgram['makeProgram'](redGL, PROGRAM_NAME, vSource, fSource);
		this['_UUID'] = RedGL.makeUUID();
		this.updateTexture = function (lastFrameBufferTexture, parentFrameBufferTexture) {
			this['diffuseTexture'] = parentFrameBufferTexture;
			this['blurTexture'] = lastFrameBufferTexture;
		}
		console.log(this);
		this.checkUniformAndProperty();
	}
	RedPostEffect_Bloom.prototype = new RedBaseMaterial();
	RedPostEffect_Bloom.prototype['bind'] = RedPostEffectManager.prototype['bind'];
	RedPostEffect_Bloom.prototype['unbind'] = RedPostEffectManager.prototype['unbind'];
	RedDefinePropertyInfo.definePrototype('RedPostEffect_Bloom', 'exposure', 'number', {'min': 0});
	RedDefinePropertyInfo.definePrototype('RedPostEffect_Bloom', 'bloomStrength', 'number', {'min': 0});
	Object.freeze(RedPostEffect_Bloom);
})();