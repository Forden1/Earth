// Add these at the top of your shader before main()

// Hash function for simplex noise
vec3 hash33(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
}

// Simplex noise 3D
float simplex3D(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1 * 2.0);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);
    
    vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
    vec4 n = h * h * h * h * vec4(
        dot(hash33(i), d0),
        dot(hash33(i + i1), d1),
        dot(hash33(i + i2), d2),
        dot(hash33(i + 1.0), d3)
    );
    
    return 0.5 + 0.5 * (n.x + n.y + n.z + n.w) * 0.83;
}