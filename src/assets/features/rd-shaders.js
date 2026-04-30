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
uniform vec3 u_lo, u_hi;
void main() {
  float b = texture2D(u_tex, gl_FragCoord.xy / u_res).g;
  gl_FragColor = vec4(mix(u_lo, u_hi, smoothstep(0.0, 0.5, b)), 1.0);
}
`;
