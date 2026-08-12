"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCallback, useState } from "react";
import { Building } from "./building";

/**
 * WebGL context loss is rare but real (GPU driver resets, too many contexts across tabs,
 * thermal throttling) — without this, a lost context leaves a permanently blank canvas.
 * three.js already calls preventDefault() internally so the browser CAN restore; we just
 * need to surface the interim state and let R3F re-render once it does.
 */
export function BuildingScene({
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
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
        camera={{ position: [7, 3, 7], fov: 42 }}
        dpr={1}
        gl={{ antialias: false, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
        onCreated={handleCreated}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={["#0b0d0c"]} />
        <fog attach="fog" args={["#0b0d0c", 10, 22]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 8, 4]} intensity={1.8} color="#f4e6d8" />
        <directionalLight position={[-6, 2, -4]} intensity={0.5} color="#c1704a" />
        <Building selectedId={selectedId} hoveredId={hoveredId} onSelect={onSelect} onHover={onHover} />
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={5}
          maxDistance={14}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 6}
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
