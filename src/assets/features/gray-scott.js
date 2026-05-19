/* gray-scott.js — Gray-Scott sim via WebGL ping-pong framebuffers.
 * Dependencies: ./rd-shaders.js
 * Invariants: two RGBA textures alternate as read/write targets each sim step.
 *             Sim grid is W×H, power-of-two (REPEAT wrap needs POT in WebGL1).
 *             Display pass renders at the canvas's device-pixel size.
 * Non-goals: no interaction, no context-loss recovery. Canvas is sized once
 *            at init from its laid-out box — no live resize handling.
 */
import { vert, simFrag, dispFrag } from './rd-shaders.js';

const W = 1024, H = 1024, STEPS = 6, F = 0.037, K = 0.060;

// The router swaps <main> on SPA nav, so each visit mounts a fresh canvas +
// WebGL context. Track the live one and free it on the next mount — otherwise
// contexts accumulate until the browser's ~16 limit and the sim breaks.
let live = null;

function mkShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function mkProg(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, mkShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mkShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  return p;
}

function mkTex(gl, data) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return t;
}

function mkFB(gl, tex) {
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return fb;
}

function seed() {
  const d = new Uint8Array(W * H * 4);
  for (let i = 0; i < d.length; i += 4) { d[i] = 255; d[i+3] = 255; } // A=1 everywhere
  for (let s = 0; s < 36; s++) {
    const cx = (Math.random() * W) | 0, cy = (Math.random() * H) | 0;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const idx = (((cy+dy+H)%H)*W + (cx+dx+W)%W) * 4;
      d[idx] = 0; d[idx+1] = 255; // A=0, B=1 — seeds for B to grow
    }
  }
  return d;
}

function cssColor(varName) {
  const el = document.createElement('span');
  el.style.cssText = `display:none;color:${varName}`;
  document.body.appendChild(el);
  const vals = getComputedStyle(el).color.match(/[\d.]+/g).slice(0, 3);
  el.remove();
  return vals.map(v => +v / 255);
}

export function init(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) return;
  if (live) { cancelAnimationFrame(live.raf); live.lose?.loseContext(); }
  const lose = gl.getExtension('WEBGL_lose_context');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Canvas can mount pre-layout (SPA nav) where a one-shot measure reads 0
  // and would lock the buffer at 1×1 — size from layout and on every resize.
  const size = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w !== canvas.width || h !== canvas.height) { canvas.width = w; canvas.height = h; }
  };
  new ResizeObserver(size).observe(canvas); size();

  const simProg = mkProg(gl, vert, simFrag);
  const dispProg = mkProg(gl, vert, dispFrag);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const su = {
    res: gl.getUniformLocation(simProg, 'u_res'),
    f:   gl.getUniformLocation(simProg, 'u_f'),
    k:   gl.getUniformLocation(simProg, 'u_k'),
    pos: gl.getAttribLocation(simProg, 'a_pos'),
  };
  const du = {
    res: gl.getUniformLocation(dispProg, 'u_res'),
    lo:  gl.getUniformLocation(dispProg, 'u_lo'),
    pos: gl.getAttribLocation(dispProg, 'a_pos'),
  };

  const lo = cssColor('var(--bg-sunk)');

  let texA = mkTex(gl, seed()), texB = mkTex(gl, null);
  let fbA  = mkFB(gl, texA),  fbB  = mkFB(gl, texB);
  let ping = { tex: texA, fb: fbA }, pong = { tex: texB, fb: fbB };

  function simStep(src, dstFB) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, dstFB);
    gl.viewport(0, 0, W, H);
    gl.useProgram(simProg);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform2f(su.res, W, H);
    gl.uniform1f(su.f, F);
    gl.uniform1f(su.k, K);
    gl.enableVertexAttribArray(su.pos);
    gl.vertexAttribPointer(su.pos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function render(src) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(dispProg);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform2f(du.res, canvas.width, canvas.height);
    gl.uniform3fv(du.lo, lo);
    gl.enableVertexAttribArray(du.pos);
    gl.vertexAttribPointer(du.pos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  live = { gl, lose, raf: 0 };
  (function frame() {
    for (let i = 0; i < STEPS; i++) {
      simStep(ping.tex, pong.fb);
      [ping, pong] = [pong, ping];
    }
    render(ping.tex);
    live.raf = requestAnimationFrame(frame);
  })();
}
