
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);
    vec3 finalColor=vec3(color);

    //sun
    vec3 SunDirection = normalize(uSunDirection);
    float sunOrientation=dot(SunDirection,normal);



    //clouds

    // atmosphere
    float atmosphereDayMix=smoothstep(-0.34,1.0,sunOrientation);
    vec3 atmosphereColor=mix(uAtmosphereTwilightColor,uAtmosphereDayColor,atmosphereDayMix);
    finalColor+=atmosphereColor;

    //alpha
    float atmosphereAlpha=smoothstep(-0.8,0.0,sunOrientation);
    float edgeAlpha=dot(viewDirection,normal);
    edgeAlpha=smoothstep(0.0,0.5,edgeAlpha);
    
    float alpha=edgeAlpha*atmosphereAlpha;

    // Final color
    // finalColor =  ;
    gl_FragColor = vec4(vec3(finalColor), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}