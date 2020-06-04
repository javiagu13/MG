#version 120

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient; // Scene ambient light

struct material_t {
	vec3  diffuse;
	vec3  specular;
	float alpha;
	float shininess;
};

struct light_t {
	vec4 position;    // Camera space
	vec3 diffuse;     // rgb
	vec3 specular;    // rgb
	vec3 attenuation; // (constant, lineal, quadratic)
	vec3 spotDir;     // Camera space
	float cosCutOff;  // cutOff cosine
	float exponent;
};

uniform light_t theLights[4];
uniform material_t theMaterial;

uniform sampler2D texture0;
uniform sampler2D bumpmap;

varying vec2 f_texCoord;
varying vec3 f_viewDirection;     // tangent space
varying vec3 f_lightDirection[4]; // tangent space
varying vec3 f_spotDirection[4];  // tangent space

void main() {
	// Base color
	vec4 baseColor = texture2D(texture0, f_texCoord);
	// Decode the tangent space normal (from [0..1] to [-1..+1])
	vec3 N = texture2D(bumpmap, f_texCoord).rgb * 2.0 - 1.0;
	// Compute ambient, diffuse and specular contribution
	//...
	//vec4 kolorea = (1.0,1.0,1.0,1.0); //probatzeko
	//...
	// Final colorgl_FragColor = 
	gl_FragColor = vec4(1.0,1.0,1.0,1.0);



vec3 n = normalize(f_normal).xyz;
	vec3 v = normalize(f_viewDirection);
	vec3 iTot=vec3(0,0,0);
	vec3 iSpec=vec3(0,0,0);

	for(int i=0; i < active_lights_n; i++){
		vec3 diff=theLights[i].diffuse* theMaterial.diffuse;
		if(theLights[i].position.w == 0.0) {
			vec3 l = normalize(-theLights[i].position.xyz);
			vec3 r = 2*dot(n,l)*n-l;
			vec3 iSpec=pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular); 
			iTot += max(0, dot(n, l)) * (diff+iSpec);
			
		}
		else{
			vec3 l = normalize(theLights[i].position.xyz-f_position);
			vec3 r = 2*dot(n,l)*n-l;
			vec3 iSpec=pow(max(0, dot(r, v)), theMaterial.shininess)*(theMaterial.specular*theLights[i].specular); 

			if(theLights[i].cosCutOff == 0.0){
				vec3 ahuldura = theLights[i].attenuation;	
				iTot += max(0, dot(n, l)) * (diff+iSpec);
			}
			else{
				float spot= max(dot(-l, theLights[i].spotDir),0);			
				if (spot > theLights[i].cosCutOff){
					iTot+= spot*max(0, dot(n, l))*(diff+iSpec);
				}
			}
				
		}
	}
	iTot += scene_ambient;
	vec4 color = vec4(iTot, 1.0);
	vec4 texColor = texture2D(texture0,f_texCoord);
	gl_FragColor = color*texColor;

}
