#version 120

uniform mat4 modelToCameraMatrix;
uniform mat4 cameraToClipMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 modelToClipMatrix;

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient;  // rgb

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

attribute vec3 v_position; // Model space
attribute vec3 v_normal;   // Model space
attribute vec2 v_texCoord;

varying vec4 f_color;
varying vec2 f_texCoord;


void main() {
	vec3 n = normalize(modelToCameraMatrix * vec4(v_normal, 0.0)).xyz;
	vec3 kamErp = (modelToCameraMatrix * vec4(v_position, 1.0)).xyz;
	gl_Position = modelToClipMatrix * vec4(v_position, 1);
	vec3 iTot=vec3(0,0,0);

	for(int i=0; i < active_lights_n; i++){
		vec3 diff=theLights[i].diffuse* theMaterial.diffuse;
		if(theLights[i].position.w == 0.0) {
			vec3 l = normalize(-theLights[i].position.xyz);
			vec3 r = 2*dot(n,l)*n-l;
			iTot += max(0, dot(n, l)) * (diff);
			
		}
		else{
			if(theLights[i].cosCutOff == 0.0){
				vec3 l = normalize(theLights[i].position.xyz-kamErp);
				vec3 r = 2*dot(n,l)*n-l;
				vec3 ahuldura = theLights[i].attenuation;	
				float dist = distance(theLights[i].position.xyz,kamErp);
				float d = 1 / (ahuldura[0] +ahuldura[1]*dist + ahuldura[2]*pow(dist,2));
				iTot += d*max(0, dot(n, l)) * (diff);
			}	
		}
	}
	iTot += scene_ambient;
	f_color = vec4(iTot, 1.0);
}
