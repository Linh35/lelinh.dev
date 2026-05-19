/* rd-shaders.js — GLSL source strings for the Gray-Scott diffusion sim.
 * Dependencies: none
 * Invariants: vert covers the [-1,1]² clip-space quad exactly.
 * Non-goals: no JS logic; callers own GL setup and uniform binding.
 */

export const vert = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const simFrag = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_f, u_k;
void main() {
  vec2 p = gl_FragCoord.xy / u_res;
  vec2 d = 1.0 / u_res;
  vec4 C  = texture2D(u_tex, p);
  vec4 N  = texture2D(u_tex, p + vec2(0.0,  d.y));
  vec4 S  = texture2D(u_tex, p - vec2(0.0,  d.y));
  vec4 E  = texture2D(u_tex, p + vec2(d.x,  0.0));
  vec4 W  = texture2D(u_tex, p - vec2(d.x,  0.0));
  vec4 NE = texture2D(u_tex, p + d);
  vec4 SW = texture2D(u_tex, p - d);
  vec4 NW = texture2D(u_tex, p + vec2(-d.x,  d.y));
  vec4 SE = texture2D(u_tex, p + vec2( d.x, -d.y));
  vec2 lap = -C.rg
    + 0.20 * (N.rg + S.rg + E.rg + W.rg)
    + 0.05 * (NE.rg + SW.rg + NW.rg + SE.rg);
  float a = C.r, b = C.g, r = a * b * b;
  gl_FragColor = vec4(
    clamp(a + 0.2097*lap.x - r + u_f*(1.0 - a), 0.0, 1.0),
    clamp(b + 0.105 *lap.y + r - (u_k + u_f)*b, 0.0, 1.0),
    0.0, 1.0
  );
}
`;

export const dispFrag = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform vec3 u_lo;
// Dracula accents (mirrors base.css) — keeps the sim on the site's palette.
vec3 pal(float t) {
  t = fract(t) * 5.0;
  if (t < 1.0) return vec3(0.545, 0.914, 0.992); // cyan
  if (t < 2.0) return vec3(0.314, 0.980, 0.482); // green
  if (t < 3.0) return vec3(0.741, 0.576, 0.976); // purple
  if (t < 4.0) return vec3(1.000, 0.475, 0.776); // pink
  return vec3(0.902, 0.859, 0.455);              // yellow
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec4 C = texture2D(u_tex, uv);
  // Each region owns one accent (by position + a little chemical A); drifting
  // spots shift between accents as they move. Background stays palette.
  float t = 0.6 * uv.x + 0.35 * uv.y + 0.25 * C.r;
  gl_FragColor = vec4(mix(u_lo, pal(t), smoothstep(0.0, 0.5, C.g)), 1.0);
}
`;
