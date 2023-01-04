precision highp float;

uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;
// Constants ----------
#define PI 3.14159265358979
#define P2 6.28318530717959

const int   MAX_TRACE_STEP = 60;
const float MAX_TRACE_DIST = 180.;
const float TRACE_PRECISION = .001;
const float FUDGE_FACTOR = .82;
const vec3  GAMMA = vec3(1./2.2);

const float GI_LENGTH = .8;
const float GI_STRENGTH = .4;
const float AO_STRENGTH = .4;
const int   MAX_SHADOW_TRACE_STEP = 10;
const float MAX_SHADOW_TRACE_DIST = 10.;
const float MIN_SHADOW_MARCHING = .2;
const float SHADOW_SHARPNESS = 4.;

const float LENS_BLUR = .01;


// Structures ----------
struct Surface {
    float d;
    vec4 kd;  // should be "kd.w=1" for ao shadow strength
};
Surface _min(Surface s,Surface t) {if(s.d<t.d)return s;return t;}

struct Ray {
    vec3 org, dir;
    float len, stp;
};
vec3 _pos(Ray r) {return r.org+r.dir*r.len;}

struct Hit {
    vec3 pos;
    Ray ray;
    Surface srf;
};

struct Camera {
    vec3 pos, tgt;
    float rol, fcs;
};
mat3 _mat3(Camera c) {
    vec3 w = normalize(c.pos-c.tgt);
    vec3 u = normalize(cross(w,vec3(sin(c.rol),cos(c.rol),0)));
    return mat3(u,normalize(cross(u,w)),w);
}

struct AmbientLight {
    vec3 dir, col;
};
vec3 _lit(vec3 n, AmbientLight l){return clamp((dot(n, l.dir)+1.)*.5,0.,1.)*l.col;}


// Grobal valiables ----------
const float bpm = 144.;
const AmbientLight amb = AmbientLight(vec3(0,1,0), vec3(.7,.7,.7));
const AmbientLight dif = AmbientLight(normalize(vec3(1,2,1)), vec3(.7,.7,.7));
float phase;


// Utilities ----------
vec3 _rgb(vec3 v) {
    return ((clamp(abs(fract(v.x+vec3(0,2./3.,1./3.))*2.-1.)*3.-1.,0.,1.)-1.)*v.y+1.)*v.z;
}

mat3 _sMat(float th, float ph) {
    float x=cos(th), y=cos(ph), z=sin(th), w=sin(ph);
    return mat3(y,w*z,-w*x,0,x,z,w,-y*z,y*x);
}


// Distance Functions ----------
float fPlane(vec3 p, vec3 n, float d) {
    return dot(p,n) + d;
}

float fBox(vec3 p, vec3 b, float r) {
    return length(max(abs(p)-b,0.)) - r;
}

vec3 repXZ(vec3 p, vec2 r){
    vec2 hr = r * .5;
    return vec3(mod(p.x+hr.x, r.x)-hr.x, p.y, mod(p.z+hr.y, r.y)-hr.y);
}

float fHex(vec3 p, vec2 h, float r) {
    vec3 q = abs(p);
    q.x = max(q.x*0.866025+q.z*0.5,q.z);
    return length(max(q.xy-h.xy,0.)) - r;
}

// World Mapping ----------
Surface map(vec3 p){
    float lv = min(1., iTime / 16.);
    float es = exp(sin(phase*.5-length(p)*.2));
    vec2  bs = vec2(.6/es,.6*es);
    vec3  hx = vec3(1.73205081,1,0)*4.;
    vec3  rp =  repXZ(p, hx.xy);
    vec3  rp2 = repXZ(p+hx.xzy*.5, hx.xy);
    vec3  col = _rgb(vec3(phase/256.,.4,.4));
    rp.y -= bs.y+.4-length(p)*.01;
    rp2.y -= bs.y+.4-length(p)*.01;

    return _min(
    Surface(fPlane(p, vec3(0,1,0), lv*3.8-3.8), vec4(col,1)),
    _min(
    Surface(fHex(rp,  bs, .4), vec4(.7,.7,.7,1)),
    Surface(fHex(rp2, bs, .4), vec4(.3,.3,.3,1))
    )
    );
}


// Lighting ----------
vec3 calcNormal(in vec3 p){
    vec3 v=vec3(.001,0,map(p).d);
    return normalize(vec3(map(p+v.xyy).d-v.z,map(p+v.yxy).d-v.z,map(p+v.yyx).d-v.z));
}

float ss(in vec3 pos, in vec3 dir) {
    float sdw=1., len=.01;
    for( int i=0; i<MAX_SHADOW_TRACE_STEP; i++ ) {
        float d = map(pos + dir*len).d;
        sdw = min(sdw, SHADOW_SHARPNESS*d/len);
        len += max(d, MIN_SHADOW_MARCHING);
        if (d<TRACE_PRECISION || len>MAX_SHADOW_TRACE_DIST) break;
    }
    return clamp(sdw, 0., 1.);
}

vec4 gi(in vec3 p, in vec3 n) {
    vec4 col = vec4(0);
    for (int i=0; i<4; i++) {
        float hr = .01 + float(i) * GI_LENGTH / 4.;
        Surface s = map(n * hr + p);
        col += s.kd * (hr - s.d);
    }
    col.rgb *= GI_STRENGTH / GI_LENGTH;
    col.w = clamp(1.-col.w * AO_STRENGTH / GI_LENGTH, 0., 1.);
    return col;
}

vec3 lighting(in Hit h) {
    vec3 n = calcNormal(h.pos);
    vec4 gin = gi(h.pos, n);
    //   lin = ([Ambient]    + [Diffuse]    * [Soft shadow])      * [A.O] + [G.I.]
    vec3 lin = (_lit(n, amb) + _lit(n, dif) * ss(h.pos, dif.dir)) * gin.w + gin.rgb;
    return  h.srf.kd.rgb * lin;
}


// Ray tracing ----------
Ray ray(in vec2 p, in Camera c) {
    return Ray(c.pos, normalize(_mat3(c) * vec3(p.xy, -c.fcs)), .0, .0);
}

Ray bray(in Ray r, Camera c, float b) {
    vec3 p = c.pos + normalize(cross(r.dir, vec3(1))) * b;
    return Ray(p, normalize(r.org + r.dir * length(c.tgt - c.pos) - p), .0, .0);
}

Hit trace(in Ray r) {
    Surface s;
    for(int i=0; i<MAX_TRACE_STEP; i++) {
        s = map(_pos(r));
        r.len += s.d * FUDGE_FACTOR;
        r.stp = float(i);
        if (s.d < TRACE_PRECISION || r.len > MAX_TRACE_DIST) break;
    }
    return Hit(_pos(r), r, s);
}

vec4 render(in Hit h){
    if (h.ray.len > MAX_TRACE_DIST) return vec4(.8,.8,.8,h.ray.len);
    return vec4(lighting(h), h.ray.len);
}

vec4 gamma(in vec4 i) {
    return vec4(pow(i.xyz, GAMMA), i.w);
}


// Entry point ----------
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    phase = iTime * bpm / 60. * P2;

    Camera c = Camera(vec3(sin(phase/32.)*20., exp(cos(phase/64.)*1.2)*40., cos(phase/32.)*20.), vec3(0), .4, 1.73205081);
    Ray    r = ray((fragCoord.xy * 2. - iResolution.xy) / iResolution.x, c);

    vec4 col = render(trace(r));
    col += render(trace(bray(r, c, LENS_BLUR)));
    col += render(trace(bray(r, c, -LENS_BLUR)));
    fragColor = gamma(col/3.);
}


void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
