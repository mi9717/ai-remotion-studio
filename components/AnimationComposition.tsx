"use client";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { AnimationProject, AnimationScene } from "../lib/animation-schema";

const backgrounds: Record<AnimationProject["style"], string> = {
  futuristic: "radial-gradient(circle at 75% 25%, #342012 0%, #151515 38%, #080808 100%)",
  minimal: "linear-gradient(135deg,#202020 0%,#090909 100%)",
  editorial: "linear-gradient(120deg,#211a16 0%,#0c0c0c 65%,#17110c 100%)",
  corporate: "linear-gradient(135deg,#17212b 0%,#0b0e12 100%)",
};

const PARTICLES = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 37 + 13) % 100,
  y: (i * 61 + 19) % 100,
  size: 3 + (i % 4) * 2,
  delay: (i * 7) % 36,
}));

const CubeVisual: React.FC<{ frame: number; accent: string }> = ({ frame, accent }) => {
  const rotation = frame * 0.75;
  const face: React.CSSProperties = {
    position: "absolute", inset: 0, border: `2px solid ${accent}`,
    background: `linear-gradient(135deg, ${accent}22, #08080888)`,
    boxShadow: `inset 0 0 32px ${accent}22, 0 0 22px ${accent}18`,
    backfaceVisibility: "hidden",
  };
  return <div style={{ position: "absolute", right: "13%", top: "18%", width: "30%", height: "58%", display: "grid", placeItems: "center", perspective: 900 }}>
    <div style={{ position: "relative", width: "min(22vw,260px)", height: "min(22vw,260px)", transformStyle: "preserve-3d", transform: `rotateX(${-22 + rotation * .7}deg) rotateY(${35 + rotation}deg)` }}>
      <div style={{ ...face, transform: "translateZ(110px)" }} />
      <div style={{ ...face, transform: "rotateY(180deg) translateZ(110px)" }} />
      <div style={{ ...face, transform: "rotateY(90deg) translateZ(110px)" }} />
      <div style={{ ...face, transform: "rotateY(-90deg) translateZ(110px)" }} />
      <div style={{ ...face, transform: "rotateX(90deg) translateZ(110px)" }} />
      <div style={{ ...face, transform: "rotateX(-90deg) translateZ(110px)" }} />
      <div style={{ position: "absolute", inset: "-18%", border: `1px solid ${accent}55`, borderRadius: "50%", transform: `rotateX(70deg) rotateZ(${-frame * .5}deg)` }} />
    </div>
  </div>;
};

const SceneVisual: React.FC<{ scene: AnimationScene; frame: number }> = ({ scene, frame }) => {
  const accent = scene.accent;
  if (scene.visual === "cube") return <CubeVisual frame={frame} accent={accent} />;
  if (scene.visual === "particles") return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    {PARTICLES.map((p, i) => {
      const drift = (frame * (0.25 + (i % 4) * .08) + p.delay) % 120;
      return <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${(p.y + drift * .22) % 100}%`, width: p.size, height: p.size, borderRadius: "50%", background: accent, opacity: .2 + (i % 5) * .12, boxShadow: `0 0 18px ${accent}` }} />;
    })}
  </div>;
  if (scene.visual === "grid") return <div style={{ position: "absolute", inset: "8% 0 0 30%", opacity: .5, transform: `perspective(500px) rotateX(62deg) translateY(${Math.sin(frame / 18) * 12}px)`, transformOrigin: "center bottom", backgroundImage: `linear-gradient(${accent}55 1px, transparent 1px), linear-gradient(90deg, ${accent}55 1px, transparent 1px)`, backgroundSize: "54px 54px", maskImage: "linear-gradient(to top, black, transparent 90%)" }} />;
  if (scene.visual === "wave") return <svg viewBox="0 0 800 420" style={{ position: "absolute", right: "5%", top: "17%", width: "48%", height: "66%", overflow: "visible" }}>
    {[0, 1, 2, 3, 4].map((n) => <path key={n} d={`M 0 ${190 + n * 12} C 150 ${30 + n * 24}, 250 ${350 - n * 18}, 410 ${190 + n * 8} S 650 ${40 + n * 25}, 800 ${190 + n * 10}`} fill="none" stroke={accent} strokeWidth={n === 2 ? 4 : 1.5} opacity={.25 + n * .12} strokeDasharray="900" strokeDashoffset={-frame * (2 + n)} />)}
    )}
  </svg>;
  if (scene.visual === "rings") return <div style={{ position: "absolute", right: "8%", top: "12%", width: "42%", height: "76%", display: "grid", placeItems: "center", perspective: 700 }}>
    {[0, 1, 2, 3].map((n) => <div key={n} style={{ position: "absolute", width: `${48 + n * 15}%`, aspectRatio: "1", border: `2px solid ${accent}${n % 2 ? "55" : "99"}`, borderRadius: "50%", transform: `rotateX(68deg) rotateZ(${frame * (n % 2 ? -0.45 : .35) + n * 24}deg)`, boxShadow: `0 0 22px ${accent}22` }} />)}
  </div>;
  return <div style={{ position: "absolute", width: "42%", aspectRatio: "1", border: `1px solid ${accent}55`, borderRadius: "50%", right: "-8%", top: "-22%", transform: `scale(${1 + Math.sin(frame / 22) * .08})`, opacity: .7 }} />;
};

const SceneContent: React.FC<{ scene: AnimationScene; style: AnimationProject["style"] }> = ({ scene, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14, 110, 145], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = interpolate(frame, [0, 22], [54, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = interpolate(frame, [0, 45, 90], [.88, 1.08, .96], { extrapolateRight: "clamp" });
  const accent = scene.accent;
  return <AbsoluteFill style={{ background: backgrounds[style], color: "#f7f4ef", justifyContent: "center", padding: "9%", overflow: "hidden" }}>
    <SceneVisual scene={scene} frame={frame} />
    {scene.visual === "bars" && <div style={{ position: "absolute", right: "14%", bottom: "20%", display: "flex", alignItems: "end", gap: 14, height: "34%" }}>
      {[45, 72, 58, 92, 78].map((h, i) => <div key={i} style={{ width: 22, height: `${h}%`, background: accent, opacity: .2 + i * .13, transform: `scaleY(${interpolate(frame, [i * 5, 24 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`, transformOrigin: "bottom" }} />)}
    </div>}
    {scene.visual === "network" && <div style={{ position: "absolute", right: "12%", top: "20%", width: "34%", height: "58%", border: `1px solid ${accent}55`, borderRadius: "50%", transform: `rotate(${frame * .25}deg)` }}>
      {[["48%", "5%"], ["8%", "55%"], ["82%", "78%"], ["68%", "20%"]].map(([left, top], i) => <div key={i} style={{ position: "absolute", width: 14, height: 14, background: accent, borderRadius: "50%", left, top, boxShadow: `0 0 28px ${accent}` }} />)}
    </div>}
    <div style={{ position: "relative", zIndex: 2, maxWidth: "78%", opacity, transform: `translateY(${rise}px)` }}>
      <div style={{ color: accent, fontSize: 18, fontWeight: 700, letterSpacing: 7, marginBottom: 30 }}>MOTION / {scene.id.toUpperCase()}</div>
      <div style={{ fontSize: "clamp(48px,7.2vw,112px)", fontWeight: 700, lineHeight: .98, letterSpacing: "-.065em", textTransform: "uppercase", fontFamily: "Arial,sans-serif", overflowWrap: "anywhere" }}>{scene.title}</div>
      <div style={{ color: "#c4c0ba", fontSize: "clamp(17px,2vw,27px)", marginTop: 28 }}>{scene.subtitle}</div>
    </div>
    <div style={{ position: "absolute", right: "8%", bottom: "8%", color: "#777", fontSize: 14, letterSpacing: 4 }}>AI REMOTION STUDIO</div>
  </AbsoluteFill>;
};

export const AnimationComposition: React.FC<{ project: AnimationProject }> = ({ project }) => {
  let from = 0;
  return <AbsoluteFill style={{ background: "#090909" }}>{project.scenes.map((scene) => {
    const start = from;
    const duration = scene.durationSeconds * project.fps;
    from += duration;
    return <Sequence key={scene.id} from={start} durationInFrames={duration}><SceneContent scene={scene} style={project.style} /></Sequence>;
  })}</AbsoluteFill>;
};
