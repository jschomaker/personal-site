"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   PALETTE — swap this object to retheme the entire background.
   Each stop maps to a band in the marble's value range,
   from darkest (deep) to lightest (pale). Edge is the
   amber/accent colour used for ridge highlights.
   ═══════════════════════════════════════════════════════════ */
export const PALETTE = {
  deep:  "#121a22",
  dark:  "#1c2e35",
  teal:  "#2a4a47",
  slate: "#3a5560",
  mid:   "#5a7e7a",
  light: "#7fa59e",
  pale:  "#a7c4ba",
  edge:  "#a8885a",
};

/* ═══════════════════════════════════════════════════════════
   CONFIG — locked-in values from tuning session
   ═══════════════════════════════════════════════════════════ */
const DEFAULTS = {
  // Mouse interaction
  cursorRadius: 0.17,
  warpBias: 0.40,
  warpBiasDeep: 0.70,
  ghostLag: 0.150,
  ghostRadius: 0.50,
  // Simulation
  timeSpeed: 0.025,
  noiseScale: 2.6,
  contourFreq: 6.5,
  contourMix: 0.60,
  warpStrength1: 2.0,
  warpStrength2: 1.4,
  // Ripple
  rippleStrength: 0.0,
  rippleFreq: 5.0,
  rippleSpeed: 0.10,
  rippleDecay: 0.30,
  rippleDisplace: 0.0,
  // Visual
  edgeHighlight: 0.50,
  sheenStrength: 0.0,
  vignetteStrength: 0.50,
  bottomFade: 0.65,
  // Palette (from PALETTE object)
  ...PALETTE,
};

type Cfg = typeof DEFAULTS;

function hexToVec3(hex: string): THREE.Vector3 {
  const c = hex.replace("#", "");
  return new THREE.Vector3(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  );
}

/* ═══════════════════════════════════════════════════════════
   GLSL
   ═══════════════════════════════════════════════════════════ */
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x/289.)*289.;}
vec4 mod289(vec4 x){return x-floor(x/289.)*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p,int oct){float v=0.,a=.5;vec3 sh=vec3(100.);
  for(int i=0;i<6;i++){if(i>=oct)break;v+=a*snoise(p);p=p*2.+sh;a*=.5;}return v;}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const fragmentShader = /* glsl */ `
${NOISE_GLSL}
uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uSeed;
uniform vec2  uCursorPos;
uniform vec2  uGhostPos;
uniform float uCursorActive;
uniform float uGhostActive;
uniform float uRippleTime;
uniform vec2  uRippleOrigin;
uniform float uRippleStrength;
uniform float uCursorRadius;
uniform float uGhostRadius;
uniform float uWarpBias;
uniform float uWarpBiasDeep;
uniform float uTimeSpeed;
uniform float uNoiseScale;
uniform float uContourFreq;
uniform float uContourMix;
uniform float uWarpStr1;
uniform float uWarpStr2;
uniform float uRippleFreq;
uniform float uRippleSpeedV;
uniform float uRippleDecayV;
uniform float uRippleDisplace;
uniform float uEdgeHighlight;
uniform float uSheenStrength;
uniform float uVignetteStr;
uniform float uBottomFade;
uniform vec3 uColDeep, uColDark, uColTeal, uColSlate;
uniform vec3 uColMid, uColLight, uColPale, uColEdge;
varying vec2 vUv;

void main(){
  vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p   = vUv * asp;
  float t  = uTime * uTimeSpeed;

  vec2  rPos   = uRippleOrigin * asp;
  float rDist  = length(p - rPos);
  float rAge   = uTime - uRippleTime;
  float rR     = rAge * uRippleSpeedV;
  float rDecay = exp(-rAge * uRippleDecayV);
  float ripple = uRippleStrength
    * sin((rDist - rR) * uRippleFreq) * rDecay
    * smoothstep(rR + 0.2, rR, rDist) * smoothstep(0.0, 0.03, rDist);
  p += normalize(p - rPos + 0.0001) * ripple * uRippleDisplace;

  vec2  cPos   = uCursorPos * asp;
  vec2  gPos   = uGhostPos * asp;
  float cDist  = length(p - cPos);
  float gDist  = length(p - gPos);
  float liveField  = uCursorActive * exp(-cDist * cDist / (2.0 * uCursorRadius * uCursorRadius));
  float ghostField = uGhostActive  * exp(-gDist * gDist / (2.0 * uGhostRadius * uGhostRadius));
  float field = max(liveField, ghostField);

  float bias1 = field * uWarpBias;
  float bias2 = field * uWarpBiasDeep;

  vec3 q = vec3(p * uNoiseScale, t) + uSeed;
  float w1a = fbm(q + vec3(0.0, 0.0, t * 0.36), 5);
  float w1b = fbm(q + vec3(5.2, 1.3, t * 0.24), 5);
  w1a -= bias1;
  w1b -= bias1;
  float w2a = fbm(q + vec3(w1a*uWarpStr1, w1b*uWarpStr1, t*0.15), 5);
  float w2b = fbm(q + vec3(w1b*2.2+1.7, w1a*2.2+9.2, t*0.21), 5);
  w2a -= bias2;
  w2b -= bias2;
  float w3 = fbm(q + vec3(w2a*uWarpStr2, w2b*uWarpStr2, t*0.09), 6);

  float contour = sin(w3 * uContourFreq) * 0.5 + 0.5;
  float base    = w3 * 0.5 + 0.5;
  float f       = mix(base, contour, uContourMix);
  f = clamp(f, 0.0, 1.0);

  float v  = clamp(f, 0.0, 1.0);
  float cv = v * v * (3.0 - 2.0 * v);
  vec3 col;
  if      (cv < 0.14) col = mix(uColDeep,  uColDark,  cv / 0.14);
  else if (cv < 0.25) col = mix(uColDark,  uColTeal,  (cv - 0.14) / 0.11);
  else if (cv < 0.37) col = mix(uColTeal,  uColSlate, (cv - 0.25) / 0.12);
  else if (cv < 0.50) col = mix(uColSlate, uColMid,   (cv - 0.37) / 0.13);
  else if (cv < 0.64) col = mix(uColMid,   uColLight, (cv - 0.50) / 0.14);
  else if (cv < 0.80) col = mix(uColLight, uColPale,  (cv - 0.64) / 0.16);
  else                col = mix(uColPale,  uColPale * 1.06, (cv - 0.80) / 0.20);

  float edgeMag   = length(vec2(dFdx(w3), dFdy(w3)));
  float cEdgeMag  = length(vec2(dFdx(contour), dFdy(contour)));
  float edgeL     = smoothstep(0.02, 0.30, edgeMag * 11.0);
  float cEdgeL    = smoothstep(0.04, 0.45, cEdgeMag * 15.0);
  float totalEdge = max(edgeL, cEdgeL * 0.7);
  float ridgeMask = smoothstep(0.20, 0.42, cv) * smoothstep(0.82, 0.50, cv);
  col = mix(col, uColEdge, totalEdge * uEdgeHighlight * (0.4 + ridgeMask * 0.6));
  col += pow(max(cv, 0.0), 7.0) * uSheenStrength * vec3(0.82, 0.88, 0.85);
  col = mix(col, uColDeep * 0.65, smoothstep(0.22, 0.0, cv) * 0.35);
  float vig = smoothstep(0.0, 0.65, 1.0 - length((vUv - 0.5) * 1.4));
  col *= mix(uVignetteStr, 1.0, vig);
  float bF = smoothstep(0.25, 0.0, vUv.y);
  col = mix(col, uColDeep * 0.3, bF * uBottomFade);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ═══════════════════════════════════════════════════════════
   Shared pointer state
   ═══════════════════════════════════════════════════════════ */
const sharedState = {
  mouseX: 0.5, mouseY: 0.5, active: 0,
  rippleX: 0.5, rippleY: 0.5, rippleRequested: false,
  wrapperRect: null as DOMRect | null,
};

/* ═══════════════════════════════════════════════════════════
   R3F fluid mesh
   ═══════════════════════════════════════════════════════════ */
function FluidMesh({ uniforms, cfgRef }: {
  uniforms: Record<string, { value: any }>; cfgRef: React.MutableRefObject<Cfg>;
}) {
  const { size } = useThree();
  const ghostPos = useRef(new THREE.Vector2(0.5, 0.5));
  const activeSmooth = useRef(0);
  const ghostActive = useRef(0);

  useEffect(() => { uniforms.uResolution.value.set(size.width, size.height); }, [size, uniforms]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const cfg = cfgRef.current;
    uniforms.uTime.value += dt;

    uniforms.uCursorRadius.value = cfg.cursorRadius;
    uniforms.uGhostRadius.value = cfg.ghostRadius;
    uniforms.uWarpBias.value = cfg.warpBias;
    uniforms.uWarpBiasDeep.value = cfg.warpBiasDeep;
    uniforms.uTimeSpeed.value = cfg.timeSpeed;
    uniforms.uNoiseScale.value = cfg.noiseScale;
    uniforms.uContourFreq.value = cfg.contourFreq;
    uniforms.uContourMix.value = cfg.contourMix;
    uniforms.uWarpStr1.value = cfg.warpStrength1;
    uniforms.uWarpStr2.value = cfg.warpStrength2;
    uniforms.uRippleFreq.value = cfg.rippleFreq;
    uniforms.uRippleSpeedV.value = cfg.rippleSpeed;
    uniforms.uRippleDecayV.value = cfg.rippleDecay;
    uniforms.uRippleDisplace.value = cfg.rippleDisplace;
    uniforms.uEdgeHighlight.value = cfg.edgeHighlight;
    uniforms.uSheenStrength.value = cfg.sheenStrength;
    uniforms.uVignetteStr.value = cfg.vignetteStrength;
    uniforms.uBottomFade.value = cfg.bottomFade;
    uniforms.uColDeep.value.copy(hexToVec3(cfg.deep));
    uniforms.uColDark.value.copy(hexToVec3(cfg.dark));
    uniforms.uColTeal.value.copy(hexToVec3(cfg.teal));
    uniforms.uColSlate.value.copy(hexToVec3(cfg.slate));
    uniforms.uColMid.value.copy(hexToVec3(cfg.mid));
    uniforms.uColLight.value.copy(hexToVec3(cfg.light));
    uniforms.uColPale.value.copy(hexToVec3(cfg.pale));
    uniforms.uColEdge.value.copy(hexToVec3(cfg.edge));

    uniforms.uCursorPos.value.set(sharedState.mouseX, sharedState.mouseY);

    const lerpAmt = Math.min(cfg.ghostLag * dt * 60, 1.0);
    ghostPos.current.lerp(new THREE.Vector2(sharedState.mouseX, sharedState.mouseY), lerpAmt);
    uniforms.uGhostPos.value.copy(ghostPos.current);

    if (sharedState.active > 0) {
      activeSmooth.current = Math.min(activeSmooth.current + dt * 12.0, 1.0);
    } else {
      activeSmooth.current *= (1.0 - dt * 6.0);
      if (activeSmooth.current < 0.005) activeSmooth.current = 0;
    }
    uniforms.uCursorActive.value = activeSmooth.current;

    if (sharedState.active > 0) {
      ghostActive.current = Math.min(ghostActive.current + dt * 8.0, 1.0);
    } else {
      ghostActive.current *= (1.0 - dt * 0.25);
      if (ghostActive.current < 0.005) ghostActive.current = 0;
    }
    uniforms.uGhostActive.value = ghostActive.current;

    if (sharedState.rippleRequested) {
      sharedState.rippleRequested = false;
      uniforms.uRippleOrigin.value.set(sharedState.rippleX, sharedState.rippleY);
      uniforms.uRippleTime.value = uniforms.uTime.value;
      uniforms.uRippleStrength.value = cfg.rippleStrength;
    }
    const rAge = uniforms.uTime.value - uniforms.uRippleTime.value;
    if (rAge > 3) uniforms.uRippleStrength.value *= 1.0 - dt * 4.0;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader}
        uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   DEBUG PANEL — hidden by default, toggle with Ctrl+Shift+D
   ═══════════════════════════════════════════════════════════ */
const PS: Record<string, React.CSSProperties> = {
  panel: { position: "fixed", top: 10, right: 10, zIndex: 1000, width: 280, maxHeight: "calc(100vh - 20px)", overflowY: "auto", background: "rgba(8,12,16,0.93)", backdropFilter: "blur(14px)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'SF Mono','Fira Code','Consolas',monospace", fontSize: 11, color: "#9eaab0", scrollbarWidth: "thin" as const },
  head: { padding: "9px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  title: { fontWeight: 700, fontSize: 11, color: "#d4dade", letterSpacing: 0.8, textTransform: "uppercase" as const },
  sec: { borderBottom: "1px solid rgba(255,255,255,0.03)" },
  secHead: { padding: "7px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 9, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 1.2, color: "#6b7b82" },
  row: { display: "flex", alignItems: "center", padding: "2px 12px", gap: 6 },
  lbl: { flex: "0 0 82px", fontSize: 9.5, color: "#7d8e95" },
  sld: { flex: 1, height: 2, appearance: "none" as const, background: "rgba(255,255,255,0.08)", borderRadius: 1, outline: "none", cursor: "pointer" },
  val: { flex: "0 0 36px", textAlign: "right" as const, fontSize: 9.5, color: "#5d6e75", fontVariantNumeric: "tabular-nums" as const },
  cRow: { display: "flex", alignItems: "center", padding: "2px 12px", gap: 6 },
  cIn: { width: 22, height: 16, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 2, cursor: "pointer", padding: 0, background: "none" },
  rst: { margin: "6px 12px 10px", padding: "4px 8px", fontSize: 9, fontFamily: "inherit", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 3, color: "#7d8e95", cursor: "pointer" },
};

function Sl({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (<div style={PS.row}><span style={PS.lbl}>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} style={PS.sld} /><span style={PS.val}>{value.toFixed(step < 0.01 ? 3 : 2)}</span></div>);
}
function Cp({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (<div style={PS.cRow}><input type="color" value={value} onChange={e => onChange(e.target.value)} style={PS.cIn} /><span style={{ ...PS.lbl, flex: 1 }}>{label}</span><span style={{ ...PS.val, flex: "0 0 52px" }}>{value}</span></div>);
}
function Sec({ title, children, open: initOpen = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initOpen);
  return (<div style={PS.sec}><div style={PS.secHead} onClick={() => setOpen(!open)}><span>{title}</span><span>{open ? "−" : "+"}</span></div>{open && <div style={{ paddingBottom: 4 }}>{children}</div>}</div>);
}

function DebugPanel({ cfg, setCfg }: { cfg: Cfg; setCfg: (c: Cfg) => void }) {
  const [open, setOpen] = useState(true);
  const s = (k: keyof Cfg) => (v: number | string) => setCfg({ ...cfg, [k]: v });
  return (
    <div style={PS.panel} onPointerDown={e => e.stopPropagation()}>
      <div style={PS.head} onClick={() => setOpen(!open)}>
        <span style={PS.title}>Fluid Controls</span>
        <span style={{ fontSize: 13, color: "#556" }}>{open ? "▾" : "▸"}</span>
      </div>
      {open && (<div>
        <Sec title="Mouse Interaction" open={true}>
          <Sl label="Radius" value={cfg.cursorRadius} min={0.02} max={0.5} step={0.01} onChange={s("cursorRadius")} />
          <Sl label="Warp Bias" value={cfg.warpBias} min={0} max={1.5} step={0.05} onChange={s("warpBias")} />
          <Sl label="Deep Bias" value={cfg.warpBiasDeep} min={0} max={1.0} step={0.05} onChange={s("warpBiasDeep")} />
          <Sl label="Ghost Lag" value={cfg.ghostLag} min={0.005} max={0.15} step={0.005} onChange={s("ghostLag")} />
          <Sl label="Ghost Radius" value={cfg.ghostRadius} min={0.05} max={0.5} step={0.01} onChange={s("ghostRadius")} />
        </Sec>
        <Sec title="Simulation">
          <Sl label="Speed" value={cfg.timeSpeed} min={0.005} max={0.2} step={0.001} onChange={s("timeSpeed")} />
          <Sl label="Noise Scale" value={cfg.noiseScale} min={0.5} max={8} step={0.1} onChange={s("noiseScale")} />
          <Sl label="Contour Freq" value={cfg.contourFreq} min={1} max={24} step={0.5} onChange={s("contourFreq")} />
          <Sl label="Contour Mix" value={cfg.contourMix} min={0} max={1} step={0.05} onChange={s("contourMix")} />
          <Sl label="Warp 1" value={cfg.warpStrength1} min={0} max={6} step={0.1} onChange={s("warpStrength1")} />
          <Sl label="Warp 2" value={cfg.warpStrength2} min={0} max={6} step={0.1} onChange={s("warpStrength2")} />
        </Sec>
        <Sec title="Ripple">
          <Sl label="Strength" value={cfg.rippleStrength} min={0} max={2} step={0.05} onChange={s("rippleStrength")} />
          <Sl label="Frequency" value={cfg.rippleFreq} min={5} max={60} step={1} onChange={s("rippleFreq")} />
          <Sl label="Speed" value={cfg.rippleSpeed} min={0.1} max={3} step={0.05} onChange={s("rippleSpeed")} />
          <Sl label="Decay" value={cfg.rippleDecay} min={0.3} max={6} step={0.1} onChange={s("rippleDecay")} />
          <Sl label="Displace" value={cfg.rippleDisplace} min={0} max={0.25} step={0.005} onChange={s("rippleDisplace")} />
        </Sec>
        <Sec title="Visual">
          <Sl label="Edge Glow" value={cfg.edgeHighlight} min={0} max={1} step={0.05} onChange={s("edgeHighlight")} />
          <Sl label="Sheen" value={cfg.sheenStrength} min={0} max={0.5} step={0.01} onChange={s("sheenStrength")} />
          <Sl label="Vignette" value={cfg.vignetteStrength} min={0} max={1} step={0.05} onChange={s("vignetteStrength")} />
          <Sl label="Bottom Fade" value={cfg.bottomFade} min={0} max={1} step={0.05} onChange={s("bottomFade")} />
        </Sec>
        <Sec title="Palette">
          <Cp label="Deep" value={cfg.deep} onChange={s("deep")} />
          <Cp label="Dark" value={cfg.dark} onChange={s("dark")} />
          <Cp label="Teal" value={cfg.teal} onChange={s("teal")} />
          <Cp label="Slate" value={cfg.slate} onChange={s("slate")} />
          <Cp label="Mid" value={cfg.mid} onChange={s("mid")} />
          <Cp label="Light" value={cfg.light} onChange={s("light")} />
          <Cp label="Pale" value={cfg.pale} onChange={s("pale")} />
          <Cp label="Edge/Amber" value={cfg.edge} onChange={s("edge")} />
        </Sec>
        <button style={PS.rst} onClick={() => setCfg({ ...DEFAULTS })}>Reset All</button>
      </div>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXPORTED COMPONENT
   
   Usage:
     import HeroBackground from "@/components/HeroBackground";
     <HeroBackground />
   
   To swap palette, edit the PALETTE export at the top of
   this file, or pass palette props in a future version.
   
   Debug panel: press Ctrl+Shift+D to toggle.
   ═══════════════════════════════════════════════════════════ */
export default function HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [cfg, setCfg] = useState<Cfg>({ ...DEFAULTS });
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  const [showDebug, setShowDebug] = useState(false);

  const seed = useMemo(() => new THREE.Vector3(
    Math.random() * 200 - 100, Math.random() * 200 - 100, Math.random() * 200 - 100
  ), []);

  const d = DEFAULTS;
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uResolution: { value: new THREE.Vector2(1, 1) }, uSeed: { value: seed },
    uCursorPos: { value: new THREE.Vector2(0.5, 0.5) },
    uGhostPos: { value: new THREE.Vector2(0.5, 0.5) },
    uCursorActive: { value: 0 }, uGhostActive: { value: 0 },
    uRippleTime: { value: -10 }, uRippleOrigin: { value: new THREE.Vector2(0.5, 0.5) }, uRippleStrength: { value: 0 },
    uCursorRadius: { value: d.cursorRadius }, uGhostRadius: { value: d.ghostRadius },
    uWarpBias: { value: d.warpBias }, uWarpBiasDeep: { value: d.warpBiasDeep },
    uTimeSpeed: { value: d.timeSpeed }, uNoiseScale: { value: d.noiseScale },
    uContourFreq: { value: d.contourFreq }, uContourMix: { value: d.contourMix },
    uWarpStr1: { value: d.warpStrength1 }, uWarpStr2: { value: d.warpStrength2 },
    uRippleFreq: { value: d.rippleFreq }, uRippleSpeedV: { value: d.rippleSpeed },
    uRippleDecayV: { value: d.rippleDecay }, uRippleDisplace: { value: d.rippleDisplace },
    uEdgeHighlight: { value: d.edgeHighlight }, uSheenStrength: { value: d.sheenStrength },
    uVignetteStr: { value: d.vignetteStrength }, uBottomFade: { value: d.bottomFade },
    uColDeep: { value: hexToVec3(d.deep) }, uColDark: { value: hexToVec3(d.dark) },
    uColTeal: { value: hexToVec3(d.teal) }, uColSlate: { value: hexToVec3(d.slate) },
    uColMid: { value: hexToVec3(d.mid) }, uColLight: { value: hexToVec3(d.light) },
    uColPale: { value: hexToVec3(d.pale) }, uColEdge: { value: hexToVec3(d.edge) },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // Keyboard shortcut: Ctrl+Shift+D toggles debug panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setShowDebug(v => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pointer events on window
  useEffect(() => {
    const updateRect = () => {
      if (wrapperRef.current) sharedState.wrapperRect = wrapperRef.current.getBoundingClientRect();
    };
    updateRect();
    const toUV = (e: PointerEvent | MouseEvent): [number, number] | null => {
      const rect = sharedState.wrapperRect;
      if (!rect) return null;
      return [
        Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
      ];
    };
    const onMove = (e: PointerEvent) => {
      const uv = toUV(e); if (!uv) return;
      sharedState.mouseX = uv[0]; sharedState.mouseY = uv[1]; sharedState.active = 1;
    };
    const onDown = (e: PointerEvent) => {
      const uv = toUV(e); if (!uv) return;
      sharedState.rippleX = uv[0]; sharedState.rippleY = uv[1]; sharedState.rippleRequested = true;
    };
    const onLeave = () => { sharedState.active = 0; };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  return (
    <>
      {showDebug && <DebugPanel cfg={cfg} setCfg={setCfg} />}
      <div
        ref={wrapperRef}
        style={{
          position: "fixed", inset: 0, width: "100vw", height: "100vh",
          zIndex: -1, background: "#121a22", overflow: "hidden", touchAction: "none",
          willChange: "transform",
        }}
      >
        <Canvas
          frameloop="always"
          camera={{ position: [0, 0, 1], fov: 45, near: 0.1, far: 10 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference: "high-performance",
            alpha: false,
            preserveDrawingBuffer: true,
          }}
          style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <FluidMesh uniforms={uniforms} cfgRef={cfgRef} />
        </Canvas>
      </div>
    </>
  );
}
