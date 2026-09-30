// Image distortion driven by pointer velocity: a local displacement around the pointer plus a small RGB split
// along the direction of travel. At rest every term is zero and the shader returns the plain image.

export const distortVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const distortFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uPlane;      // element size in px
uniform vec2 uImage;      // image size in px
uniform vec2 uMouse;      // pointer in uv space
uniform vec2 uVelocity;   // smoothed pointer velocity, roughly -1..1
uniform float uStrength;  // 0 at rest
uniform float uTime;
varying vec2 vUv;

// object-fit: cover, in the shader
vec2 coverUv(vec2 uv) {
  float planeRatio = uPlane.x / uPlane.y;
  float imageRatio = uImage.x / uImage.y;
  vec2 scale = planeRatio > imageRatio ? vec2(1.0, imageRatio / planeRatio) : vec2(planeRatio / imageRatio, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uPlane.x / uPlane.y, 1.0);
  float dist = distance(uv * aspect, uMouse * aspect);
  float falloff = smoothstep(0.55, 0.0, dist) * uStrength;

  // push pixels along the direction of travel, with a faint ripple
  uv -= uVelocity * falloff * 0.06;
  uv.x += sin(uv.y * 24.0 + uTime * 3.0) * 0.003 * falloff;

  vec2 shift = uVelocity * falloff * 0.018;
  vec2 base = coverUv(uv);
  float r = texture2D(uTexture, coverUv(uv + shift)).r;
  vec4 g = texture2D(uTexture, base);
  float b = texture2D(uTexture, coverUv(uv - shift)).b;
  gl_FragColor = vec4(r, g.g, b, 1.0);
}
`;

// Background particles: points on a loose network, pushed gently away from the pointer.
export const particlesVertex = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;      // pointer in normalized device coordinates
uniform float uScroll;
uniform float uPixelRatio;
attribute float aSize;
attribute float aSeed;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y += uScroll * (0.4 + aSeed * 0.6);
  p.x += sin(uTime * 0.15 + aSeed * 12.0) * 0.08;
  p.y += cos(uTime * 0.12 + aSeed * 7.0) * 0.08;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndc = clip.xy / clip.w;
  vec2 away = ndc - uMouse;
  float d = length(away);
  clip.xy += normalize(away + 1e-4) * smoothstep(0.35, 0.0, d) * 0.06 * clip.w;
  gl_Position = clip;
  gl_PointSize = aSize * uPixelRatio * (6.0 / -mv.z);
  vAlpha = 0.25 + aSeed * 0.55;
}
`;

export const particlesFragment = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
uniform vec3 uAccent;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  vec3 col = vAlpha > 0.78 ? uAccent : uColor;
  gl_FragColor = vec4(col, a * 0.55);
}
`;
