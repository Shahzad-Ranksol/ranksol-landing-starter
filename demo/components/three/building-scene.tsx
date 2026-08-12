"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Model } from "./building-model";
import { tierInfo, type Tier } from "@/lib/data/floors";

const HOTSPOTS: { tier: Tier; position: [number, number, number] }[] = [
  { tier: "foundation", position: [3.6, 1.1, 0] },
  { tier: "crown", position: [3.6, 3.3, 0] },
  { tier: "summit", position: [3.6, 5.4, 0] },
];

/** WebGL context loss is rare but real — surface it instead of leaving a blank canvas. */
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

  const handleCreated = useCallback(({ gl }: { gl: import("three").WebGLRenderer }) => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      setLost(true);
    });
    canvas.addEventListener("webglcontextrestored", () => setLost(false));
  }, []);

  return (
    <>
      <Canvas
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
        <BuildingDrift>
          <Model scale={8} position={[0, 0, 0]} />
        </BuildingDrift>
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
        <div className="absolute inset-0 flex items-center justify-center bg-ink/90 font-mono text-xs uppercase tracking-widest text-cream-dim">
          Reconnecting 3D view…
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
