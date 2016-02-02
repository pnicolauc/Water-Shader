#version 420

uniform sampler2D dudv,normalMap; 
uniform mat4 P;
uniform mat4 V;
uniform mat4 M;
uniform vec3 camWorldPos;
uniform vec4 l_dir;
uniform uint frameCount;

in vec4 position;
in vec4 normal;


const float tiling = 0.025;


out vec4 clipSpace;
out vec2 texCoords;
out vec3 normalV;
out vec3 eyeV;
out vec3 fromLightVector;
out vec3 toCameraVector;

const float waveStrength =0.08;



void main () {

	
	float fr=mod(float(frameCount)/1000.0, 100) ;
	float moveFactor = waveStrength * fr;
	float time= frameCount *0.005;
	float h = sin(0.2 * dot(vec2(1,0), position.xz) + time) * 2;
 	
    h += sin(0.1 * dot(vec2(1,1), position.xz) + time*3) * 2;

	vec4 worldPos = M *vec4(position.x,/*h*/ 0,position.z,1);

	clipSpace= P * V * worldPos;
	texCoords = vec2(position.x/2.0+0.5,position.z/2.0+0.5)*tiling;
	vec3 pos= vec3(M*position);

	eyeV =normalize(pos - camWorldPos);
	//normalV = normalize(vec3(M * texture( normalMap,texCoords)));
	fromLightVector= worldPos.xyz - l_dir.xyz;
	toCameraVector = camWorldPos - worldPos.xyz; 

	vec2 distortionTexCoords = texture(dudv,vec2(texCoords.x+moveFactor,texCoords.y)).rg*waveStrength;
	distortionTexCoords= texCoords+ vec2(texCoords.x,texCoords.y+moveFactor);
	vec2 totaldistortion= (texture(dudv,distortionTexCoords).rg * 2.0 - 1.0)*waveStrength;

	gl_Position = clipSpace;

	gl_Position.y+= length(totaldistortion)*10;
	// Gerstner Wave
	
	float A = 3;	// amplitude
	float L = 20;	// wavelength
	float w = 2*3.1416/L;
	float Q = 0.5;
	
	vec3 P0 = position.xyz;
	vec2 D = vec2(0,1);
	float dotD = dot(P0.xz, D);
	float C = cos(w*dotD + fr*3);
	float S = sin(w*dotD + fr*3);
	
	vec3 P = vec3( Q*A*C*D.x, A * S, Q*A*C*D.y);
	gl_Position.xyz+=P;
	
   	normalV =  vec3(-D.x * w*A *C ,-D.y * w*A *C,1 - Q *w*A *S );

	
}