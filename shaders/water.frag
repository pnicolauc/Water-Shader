#version 420

uniform sampler2D sky,ground,dudv,normalMap,depth; 
uniform uint frameCount;

in vec4 clipSpace;
in vec2 texCoords;
in vec3 normalV;
in vec3 eyeV;
in vec3 fromLightVector;
in vec3 toCameraVector;


out vec4 outColor;


const float waveStrength = 0.08;
const float shineDamper = 10;
const float reflectivity = 0.4;


void main() {
	vec3 lightColour = vec3(0.9,0.9,0.9);
    float fr=mod(float(frameCount)/1000.0, 100) ;
	float moveFactor = waveStrength * fr;
	vec2 ndc = ((clipSpace.xy*0.25 )/clipSpace.w)+0.25;
	vec2 refractTexCoords = vec2(ndc.x,ndc.y);
	vec2 reflectTexCoords = vec2(ndc.x,-ndc.y);

	vec2 distortionTexCoords = texture(dudv,vec2(texCoords.x+moveFactor,texCoords.y)).rg*0.05;
	distortionTexCoords= texCoords+ vec2(texCoords.x,texCoords.y+moveFactor);
	vec2 totaldistortion= (texture(dudv,distortionTexCoords).rg * 2.0 - 1.0)*waveStrength;
	refractTexCoords +=  totaldistortion;
	refractTexCoords = clamp(refractTexCoords,0.001,0.999);

	reflectTexCoords += totaldistortion;
	reflectTexCoords.x = clamp(reflectTexCoords.x,0.001,0.999);
	reflectTexCoords.y = clamp(reflectTexCoords.y,-0.999,-0.001);

	vec4 refl= texture(sky,reflectTexCoords);
	vec4 refr= texture(ground,refractTexCoords);

	vec3 viewVector= normalize(toCameraVector);
	float refractiveFactor = dot(viewVector, vec3(0.0,1.0,0.0));
	

	vec4 normalC=texture(normalMap,distortionTexCoords);
	vec3 normal= vec3(normalC.r * 2.0 - 1.0,normalC.b,normalC.g*2.0-1.0);
	normal = normalize(normal + normalV );
	
	vec3 reflectedLight= reflect(normalize(fromLightVector),normal);
	float specular = max(dot(reflectedLight,eyeV),0.0);
	specular = pow (specular,shineDamper);
	vec3 specularHighlights = lightColour * specular *reflectivity;
	refractiveFactor= refractiveFactor * ((texture(depth,texCoords).b+ 0.5f));
	outColor= mix(refl,refr,refractiveFactor);
	outColor= mix(outColor,vec4(0.0,0.3,0.5,1.0),0.2) +vec4(specularHighlights,0.0);

}