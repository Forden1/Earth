uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform vec3 uCloudsNightColor;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../includes/simplex3D.glsl

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    //sun
    vec3 SunDirection = normalize(uSunDirection);
    float sunOrientation=dot(SunDirection,normal);


    float dayMix = smoothstep(-0.25,0.5,sunOrientation);
    vec3 dayColor = texture(uDayTexture,vUv).rgb;
    vec3 nightColor = texture(uNightTexture,vUv).rgb;
    vec3 finalColor = mix(nightColor,dayColor,dayMix);

    //clouds
    vec3 cloudNightColor = uCloudsNightColor;      // dark gray (tweak to taste)
    vec3 cloudDayColor   = vec3(1.0);      // bright white
    vec3 cloudColor= mix(cloudNightColor,cloudDayColor,dayMix);
    vec2 specularCloudsColor=texture(uSpecularCloudsTexture,vUv).rg;
    float cloudMix= smoothstep(0.5,1.0,specularCloudsColor.g);
    finalColor=mix(finalColor,cloudColor,cloudMix);

    // atmosphere
    float atmosphereDayMix=smoothstep(-0.34,1.0,sunOrientation);
    vec3 atmosphereColor=mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
    //frensel
    float frensel=dot(viewDirection,normal)+1.0;
    frensel=min(1.0,frensel);
    frensel=pow(frensel,2.5);
    finalColor=mix(finalColor,atmosphereColor,frensel*atmosphereDayMix);

    
    //reflectio
    vec3 reflection= normalize(reflect(-SunDirection,normal)); 
    float specular=-dot(reflection,viewDirection);
    specular=max(0.0,specular);
    specular=pow(specular,32.0);
    specularCloudsColor.r=smoothstep(0.0,0.1,specularCloudsColor.r);
    specular*=specularCloudsColor.r;

    vec3 warmGlow = vec3(1.0, 0.92, 0.6);


    vec3 specularColor=mix(vec3(1.0),atmosphereColor,frensel);
vec3 cloudSpeculerMix = mix(specularColor, warmGlow, cloudMix * 5.0);
    finalColor=mix(finalColor,cloudSpeculerMix,specular);
    // Final color
    // finalColor =  ;
    gl_FragColor = vec4(vec3(finalColor), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}