#version 120

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient; // Scene ambient light

uniform struct light_t {
	vec4 position;    // Camera space
	vec3 diffuse;     // rgb
	vec3 specular;    // rgb
	vec3 attenuation; // (constant, lineal, quadratic)
	vec3 spotDir;     // Camera space
	float cosCutOff;  // cutOff cosine
	float exponent;
} theLights[4];     // MG_MAX_LIGHTS

uniform struct material_t {
	vec3  diffuse;
	vec3  specular;
	float alpha;
	float shininess;
} theMaterial;

uniform sampler2D texture0;

varying vec3 f_position;      // camera space
varying vec3 f_viewDirection; // camera space
varying vec3 f_normal;        // camera space
varying vec2 f_texCoord;


void main() {

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
	f_color = vec4(iTot, 1.0);
	texColor = texture2D(texture0,f_texCoord)
	gl_FragColor = f_color*texColor;

}
