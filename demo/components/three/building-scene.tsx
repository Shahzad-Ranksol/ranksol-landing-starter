"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useProgress } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Model } from "./building-model";
import { tierInfo, type Tier } from "@/lib/data/floors";

/** In-canvas loading feedback while the compressed .glb fetches + Draco-decodes.
 * Without this, users stare at a blank dark box for several seconds on first load
 * with no indication anything is happening — confirmed directly in testing. */
function ModelLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-cream-dim">
        <span>Loading model… {Math.round(progress)}%</span>
      </div>
    </Html>
  );
}

const HOTSPOTS: { tier: Tier; position: [number, number, number] }[] = [
  { tier: "foundation", position: [3.6, 1.1, 0] },
  { tier: "crown", position: [3.6, 3.3, 0] },
  { tier: "summit", position: [3.6, 5.4, 0] },
];

/**
 * WebGL context loss is rare but real (GPU driver reset, too many contexts across tabs,
 * thermal throttling). three.js already calls preventDefault() internally so the browser
 * *can* restore the context — but restoration isn't guaranteed to happen on its own, so
 * waiting passively can leave a permanently blank canvas. After a few seconds without
 * automatic recovery, offer a manual retry that fully remounts the Canvas (a fresh
 * WebGL context request often succeeds even when the old one never recovers).
 */
export function BuildingScene({
  selectedTier,
  hoveredTier,
  onSelect,
  onHover,
}: {
  selectedTier: Tier | null;
  hoveredTier: Tier | null;
  onSelect: (tier: Tier | null) => void;
  onHover: (tier: Tier | null) => void;
}) {
  const [lost, setLost] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  useEffect(() => {
    if (!lost) return;
    const timer = setTimeout(() => setCanRetry(true), 2500);
    return () => clearTimeout(timer);
  }, [lost]);

  const handleCreated = useCallback(({ gl }: { gl: import("three").WebGLRenderer }) => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      setLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => {
      setLost(false);
      setCanRetry(false);
    });
  }, []);

  const retry = () => {
    setLost(false);
    setCanRetry(false);
    setCanvasKey((k) => k + 1); // forces a full remount -> fresh WebGL context request
  };

  return (
    <>
      <Canvas
        key={canvasKey}
        camera={{ position: [9, 4, 9], fov: 40 }}
        dpr={1}
        gl={{ antialias: false, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        onCreated={handleCreated}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={["#0b0d0c"]} />
        <fog attach="fog" args={["#0b0d0c", 12, 26]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 5]} intensity={2} color="#f4e6d8" />
        <directionalLight position={[-7, 3, -5]} intensity={0.6} color="#c1704a" />
        <Suspense fallback={<ModelLoader />}>
          <BuildingDrift>
            <Model scale={8} position={[0, 0, 0]} />
          </BuildingDrift>
        </Suspense>
        {HOTSPOTS.map((h) => (
          <Hotspot
            key={h.tier}
            position={h.position}
            label={tierInfo[h.tier].label.split(" ")[0]}
            active={h.tier === selectedTier || h.tier === hoveredTier}
            onClick={() => onSelect(h.tier)}
            onHover={(v) => onHover(v ? h.tier : null)}
          />
        ))}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={6}
          maxDistance={18}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 6}
          target={[0, 2.8, 0]}
        />
      </Canvas>
      {lost && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/90 font-mono text-xs uppercase tracking-widest text-cream-dim">
          <span>Reconnecting 3D view…</span>
          {canRetry && (
            <button
              onClick={retry}
              className="cursor-pointer border border-clay/60 px-4 py-2 text-clay transition-colors hover:bg-clay hover:text-ink"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </>
  );
}

/** Subtle "the scene notices the cursor" drift — see cursor-interactions skill. */
function BuildingDrift({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    target.current.x = THREE.MathUtils.lerp(target.current.x, state.pointer.x, 0.03);
    target.current.y = THREE.MathUtils.lerp(target.current.y, state.pointer.y, 0.03);
    if (groupRef.current) {
      groupRef.current.rotation.y = target.current.x * 0.12;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function Hotspot({
  position,
  label,
  active,
  onClick,
  onHover,
}: {
  position: [number, number, number];
  label: string;
  active: boolean;
  onClick: () => void;
  onHover: (v: boolean) => void;
}) {
  return (
    <group position={position}>
      {/* Visual only — the label below is the actual hit target, since its DOM
          hitbox is far larger and more forgiving than this sphere's projected size. */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={active ? "#c1704a" : "#f4eee4"} transparent opacity={active ? 1 : 0.85} />
      </mesh>
      <Html distanceFactor={12} occlude={false} zIndexRange={[10, 0]}>
        <button
          onClick={onClick}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
          className={`-translate-y-1/2 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm transition-colors ${
            active ? "border-clay bg-clay/90 text-ink" : "border-cream/30 bg-ink/70 text-cream hover:border-cream/60"
          }`}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}
