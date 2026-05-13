/**
 * SoftAurora — порт @react-bits/SoftAurora на ваниль + OGL для статического Hero.
 * Параметры как у React-компонента; цвета по умолчанию под полярную палитру сайта.
 */
import { Renderer, Program, Mesh, Triangle } from "https://cdn.jsdelivr.net/npm/ogl@1.0.6/+esm";

/** Соответствие пропсов <SoftAurora … /> */
export const SOFT_AURORA_DEFAULTS = {
  speed: 0.5,
  scale: 1.5,
  brightness: 0.92,
  color1: "#e8f1ff",
  color2: "#5eead4",
  noiseFrequency: 2.5,
  noiseAmplitude: 1,
  bandHeight: 0.35,
  bandSpread: 0.7,
  octaveDecay: 0.1,
  layerOffset: 0,
  colorSpeed: 1,
  enableMouseInteraction: true,
  mouseInfluence: 0.2,
};

function hexToVec3(hex) {
  const h = String(hex).replace("#", "").trim();
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16) / 255,
      parseInt(h[1] + h[1], 16) / 255,
      parseInt(h[2] + h[2], 16) / 255,
    ];
  }
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
/* Safari / часть мобильных GPU: highp во фрагменте даёт ошибку компиляции → чёрный/пустой canvas */
precision mediump float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

out vec4 fragColor;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y); float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;

  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    shift = (uMouse - 0.5) * uMouseInfluence;
  }

  vec3 col = vec3(0.0);
  col += 0.99 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
  col += 0.99 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  fragColor = vec4(col, alpha);
}
`;

/** @param {HTMLElement} container @param {Record<string, unknown>} [opts] */
export function initSoftAurora(container, opts = {}) {
  if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const narrow =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 820px)").matches;
  const extraNarrow =
    typeof window.matchMedia === "function" &&
    (window.matchMedia("(max-width: 720px)").matches ||
      (typeof document !== "undefined" && document.body?.classList.contains("force-mobile")));
  const cfg = {
    ...SOFT_AURORA_DEFAULTS,
    ...(narrow
      ? {
          brightness: Math.min(
            1.38,
            SOFT_AURORA_DEFAULTS.brightness + (extraNarrow ? 0.36 : 0.22)
          ),
          scale: Math.min(2.05, SOFT_AURORA_DEFAULTS.scale + (extraNarrow ? 0.55 : 0.35)),
        }
      : {}),
    ...opts,
  };

  let renderer;
  let gl;
  let program;
  let mesh;
  let raf = 0;
  const t0 = performance.now();
  const currentMouse = [0.5, 0.5];
  const targetMouse = [0.5, 0.5];
  const mouseBuf = new Float32Array([0.5, 0.5]);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (ua.includes("Macintosh") &&
      typeof navigator.maxTouchPoints === "number" &&
      navigator.maxTouchPoints > 1);
  const isDesktopSafari =
    /AppleWebKit/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|FxiOS/i.test(ua);
  /* iOS: Chrome/Firefox тоже WebKit — те же баги MSAA, что и в Safari */
  const disableWebglMsaa = isIOS || isDesktopSafari;

  try {
    renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: false,
      depth: false,
      stencil: false,
      antialias: !disableWebglMsaa,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      powerPreference: "high-performance",
    });
    gl = renderer.gl;
    if (!gl) throw new Error("No GL");
    /* Шейдеры #version 300 es — только WebGL2; иначе Program падает без понятной ошибки */
    if (!renderer.isWebgl2) {
      try {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      } catch {
        /* noop */
      }
      container.classList.add("hero__softAuroraMount--fallback");
      return () => {};
    }
  } catch {
    container.classList.add("hero__softAuroraMount--fallback");
    return () => {};
  }

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const interactionRoot =
    container.closest(".hero") || container.closest("section") || document.body;

  function setTargetFromClient(clientX, clientY) {
    const rect = interactionRoot.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    targetMouse[0] = (clientX - rect.left) / rect.width;
    targetMouse[1] = 1 - (clientY - rect.top) / rect.height;
  }

  function onMouseMove(e) {
    setTargetFromClient(e.clientX, e.clientY);
  }

  function onMouseLeave() {
    targetMouse[0] = 0.5;
    targetMouse[1] = 0.5;
  }

  function onTouchMove(e) {
    if (!e.touches || !e.touches[0]) return;
    setTargetFromClient(e.touches[0].clientX, e.touches[0].clientY);
  }

  function resize() {
    const w = Math.max(1, container.offsetWidth);
    const h = Math.max(1, container.offsetHeight);
    renderer.setSize(w, h);
    if (program) {
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    }
  }

  const ro =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => resize()) : null;
  ro?.observe(container);
  window.addEventListener("resize", resize);
  window.addEventListener(
    "load",
    () => {
      resize();
      requestAnimationFrame(resize);
    },
    { once: true }
  );

  let geometry;
  try {
    geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [1, 1, 1] },
        uSpeed: { value: cfg.speed },
        uScale: { value: cfg.scale },
        uBrightness: { value: cfg.brightness },
        uColor1: { value: hexToVec3(cfg.color1) },
        uColor2: { value: hexToVec3(cfg.color2) },
        uNoiseFreq: { value: cfg.noiseFrequency },
        uNoiseAmp: { value: cfg.noiseAmplitude },
        uBandHeight: { value: cfg.bandHeight },
        uBandSpread: { value: cfg.bandSpread },
        uOctaveDecay: { value: cfg.octaveDecay },
        uLayerOffset: { value: cfg.layerOffset },
        uColorSpeed: { value: cfg.colorSpeed },
        uMouse: { value: mouseBuf },
        uMouseInfluence: { value: cfg.mouseInfluence },
        uEnableMouse: { value: cfg.enableMouseInteraction },
      },
    });

    mesh = new Mesh(gl, { geometry, program });
    gl.canvas.className = "hero__softAuroraCanvas";
    gl.canvas.style.cssText =
      "display:block;width:100%;height:100%;vertical-align:top;touch-action:none;pointer-events:none";
    gl.canvas.setAttribute("aria-hidden", "true");
    container.appendChild(gl.canvas);
  } catch {
    container.classList.add("hero__softAuroraMount--fallback");
    try {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      /* noop */
    }
    return () => {};
  }

  resize();

  const onPageShow = () => {
    resize();
    requestAnimationFrame(resize);
  };
  window.addEventListener("pageshow", onPageShow);

  /* iOS: размер canvas часто 0×0 до reflow — два кадра после mount стабилизируют. */
  requestAnimationFrame(() => {
    resize();
    requestAnimationFrame(resize);
  });

  if (cfg.enableMouseInteraction) {
    interactionRoot.addEventListener("mousemove", onMouseMove);
    interactionRoot.addEventListener("mouseleave", onMouseLeave);
    interactionRoot.addEventListener("touchmove", onTouchMove, { passive: true });
    interactionRoot.addEventListener("touchend", onMouseLeave, { passive: true });
  }

  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (document.visibilityState !== "visible") return;

    const time = now - t0;
    program.uniforms.uTime.value = time * 0.001;

    if (cfg.enableMouseInteraction) {
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      mouseBuf[0] = currentMouse[0];
      mouseBuf[1] = currentMouse[1];
    } else {
      mouseBuf[0] = 0.5;
      mouseBuf[1] = 0.5;
    }

    renderer.render({ scene: mesh });
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    ro?.disconnect();
    window.removeEventListener("pageshow", onPageShow);
    window.removeEventListener("resize", resize);
    if (cfg.enableMouseInteraction) {
      interactionRoot.removeEventListener("mousemove", onMouseMove);
      interactionRoot.removeEventListener("mouseleave", onMouseLeave);
      interactionRoot.removeEventListener("touchmove", onTouchMove);
      interactionRoot.removeEventListener("touchend", onMouseLeave);
    }
    if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
    try {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      /* noop */
    }
  };
}

const mount = document.getElementById("heroSoftAuroraMount");
if (mount) {
  try {
    initSoftAurora(mount);
  } catch {
    mount.classList.add("hero__softAuroraMount--fallback");
  }
}
