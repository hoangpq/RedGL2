"use strict";
var RedStandardMaterial;
(function () {
    var makeProgram;

    RedStandardMaterial = function (redGL, diffuseTexture, normalTexture, specularTexture) {
        if (!(this instanceof RedStandardMaterial)) return new RedStandardMaterial(redGL, diffuseTexture, normalTexture, specularTexture);
        if (!(redGL instanceof RedGL)) RedGLUtil.throwFunc('RedStandardMaterial : RedGL Instance만 허용됩니다.')
        if (!(diffuseTexture instanceof RedBitmapTexture)) RedGLUtil.throwFunc('RedStandardMaterial : diffuseTexture - RedBitmapTexture Instance만 허용됩니다.')
        if (normalTexture && !(normalTexture instanceof RedBitmapTexture)) RedGLUtil.throwFunc('RedStandardMaterial : normalTexture - RedBitmapTexture Instance만 허용됩니다.')
        if (specularTexture && !(specularTexture instanceof RedBitmapTexture)) RedGLUtil.throwFunc('RedStandardMaterial : specularTexture - RedBitmapTexture Instance만 허용됩니다.')
        /////////////////////////////////////////
        // 유니폼 프로퍼티
        /**DOC:
            {
                title :`diffuseTexture`,
                description : `diffuseTexture`,
                example : `// TODO:`,
                return : 'RedBitmapTexture'
            }
        :DOC*/
        this['diffuseTexture'] = diffuseTexture;
        /**DOC:
            {
                title :`normalTexture`,
                description : `normalTexture`,
                example : `// TODO:`,
                return : 'RedBitmapTexture'
            }
        :DOC*/
        this['normalTexture'] = normalTexture;
        /**DOC:
            {
                title :`specularTexture`,
                description : `specularTexture`,
                example : `// TODO:`,
                return : 'RedBitmapTexture'
            }
        :DOC*/
        this['specularTexture'] = specularTexture;
        /**DOC:
            {
                title :`shininess`,
                description : `shininess`,
                example : `// TODO:`,
                return : 'RedBitmapTexture'
            }
        :DOC*/
        this['shininess'] = 16
        /**DOC:
            {
                title :`specularPower`,
                description : `specularPower`,
                example : `// TODO:`,
                return : 'RedBitmapTexture'
            }
        :DOC*/
        this['specularPower'] = 1
        this['shadowBiasMatrix'] = mat4.create()
        mat4.identity(this['shadowBiasMatrix']);
        mat4.scale(this['shadowBiasMatrix'], this['shadowBiasMatrix'], [0.5, 0.5, 0.5]);
        mat4.translate(this['shadowBiasMatrix'], this['shadowBiasMatrix'], [1.0, 1.0, 1.0, 1.0]);
        /////////////////////////////////////////
        // 일반 프로퍼티
        /**DOC:
            {
                title :`program`,
                description : `RedProgram Instance`,
                example : `// TODO:`,
                return : 'RedProgram Instance'
            }
        :DOC*/
        this['program'] = makeProgram(redGL);
        this['_UUID'] = RedGL['makeUUID']();
        this.checkProperty()
        console.log(this)
        // Object.seal(this)
    }
    makeProgram = function (redGL) {
        var vSource, fSource;
        vSource = function () {
            /*
            varying vec4 vVertexPositionEye4;
            void main(void) {
                vTexcoord = aTexcoord;
                vVertexNormal = vec3(uNMatrix * vec4(aVertexNormal,1.0)); 
                vVertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);         
          
                gl_Position = uPMatrix * uCameraMatrix * vVertexPositionEye4;
            }
            */
        }
        fSource = function () {
            /*
            precision mediump float;
            uniform sampler2D uDiffuseTexture;
            uniform sampler2D uNormalTexture;
            uniform sampler2D uSpecularTexture;

            uniform float uShininess;
            uniform float uSpecularPower;
            
            varying vec4 vVertexPositionEye4;
       
            void main(void) {
                vec4 la = uAmbientLightColor * uAmbientLightColor.a;
                vec4 ld = vec4(0.0, 0.0, 0.0, 1.0);
                vec4 ls = vec4(0.0, 0.0, 0.0, 1.0);

                vec4 texelColor = texture2D(uDiffuseTexture, vTexcoord);
                texelColor.rgb *= texelColor.a;
                if(texelColor.a ==0.0) discard;

                vec3 N = normalize(vVertexNormal);
                N = normalize(2.0 * (N + texture2D(uNormalTexture, vTexcoord).rgb  - 0.5));

                vec4 specularLightColor = vec4(1.0, 1.0, 1.0, 1.0);
                float specularTextureValue = 1.0;
                specularTextureValue = texture2D(uSpecularTexture, vTexcoord).r;
                float specular;             

                vec3 L;
                vec3 R;
                highp float lambertTerm;
                for(int i=0; i<DIRETIONAL_MAX; i++){
                    if(i == uDirectionalLightNum) break;
                    L = normalize(-uDirectionalLightPosition[i]);
                    lambertTerm = dot(N,-L);
                    if(lambertTerm > 0.0){
                        ld += uDirectionalLightColor[i] * texelColor * lambertTerm * uDirectionalLightIntensity[i];
                        R = reflect(L, N);
                        specular = pow( max(dot(R, -L), 0.0), uShininess);
                        ls +=  specularLightColor * specular * uSpecularPower * specularTextureValue * uDirectionalLightIntensity[i];
                    }
                }         
                vec3 pointDirection;  
                highp float distanceLength;
                highp float attenuation;
                for(int i=0;i<POINT_MAX;i++){
                    if(i== uPointLightNum) break;
                    pointDirection =  -uPointLightPosition[i] + vVertexPositionEye4.xyz;
                    distanceLength = length(pointDirection);
                    if(uPointLightRadius[i]> distanceLength){
                        attenuation = 1.0 / (0.01 + 0.02 * distanceLength + 0.03 * distanceLength * distanceLength); 
                        L = normalize(pointDirection);
                        lambertTerm = dot(N,-L);
                        if(lambertTerm > 0.0){
                            ld += uPointLightColor[i] * texelColor * lambertTerm * attenuation * uPointLightIntensity[i];
                            R = reflect(L, N);
                            specular = pow( max(dot(R, -L), 0.0), uShininess);
                            ls +=  specularLightColor * specular * uSpecularPower * specularTextureValue * uPointLightIntensity[i] ;
                        }
                    }                          
                }            
                
                vec4 finalColor = la * uAmbientIntensity + ld + ls; 
                finalColor.rgb *= texelColor.a;
                finalColor.a = texelColor.a;
                gl_FragColor = finalColor;
            }
            */
        }
        vSource = RedGLUtil.getStrFromComment(vSource.toString());
        fSource = RedGLUtil.getStrFromComment(fSource.toString());
        // console.log(vSource, fSource)
        return RedProgram(
            redGL,
            'standardProgram',
            RedShader(redGL, 'standardProgramVs', RedShader.VERTEX, vSource),
            RedShader(redGL, 'standardProgramFS', RedShader.FRAGMENT, fSource)
        )
    }
    RedStandardMaterial.prototype = RedBaseMaterial.prototype
    Object.freeze(RedStandardMaterial)
})();