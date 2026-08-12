"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { floors, type Tier } from "@/lib/data/floors";

const TIER_FOOTPRINT: Record<Tier, { width: number; depth: number }> = {
  foundation: { width: 4.2, depth: 3.2 },
  crown: { width: 3.4, depth: 2.6 },
  summit: { width: 2.6, depth: 2.0 },
};

const TIER_COLOR: Record<Tier, string> = {
  foundation: "#2a231b",
  crown: "#332821",
  summit: "#3d2e22",
};

const FLOOR_HEIGHT = 0.55;
const GAP = 0.06;

export function Building({
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
  const groupRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  const meshes = useMemo(() => {
    return floors.map((floor, i) => {
      const { width, depth } = TIER_FOOTPRINT[floor.tier];
      const y = i * (FLOOR_HEIGHT + GAP);
      return { floor, width, depth, y };
    });
  }, []);

  useFrame((state) => {
    target.current.x = THREE.MathUtils.lerp(target.current.x, state.pointer.x, 0.04);
    target.current.y = THREE.MathUtils.lerp(target.current.y, state.pointer.y, 0.04);
    if (groupRef.current) {
      groupRef.current.rotation.y = target.current.x * 0.25;
      groupRef.current.rotation.x = -target.current.y * 0.06;
    }
  });

  return (
    <group ref={groupRef} position-y={-3.4}>
      {meshes.map(({ floor, width, depth, y }) => {
        const isActive = floor.id === selectedId || floor.id === hoveredId;
        return (
          <group key={floor.id}>
            <mesh
              position={[0, y, 0]}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect(floor.id);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                onHover(floor.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                onHover(null);
                document.body.style.cursor = "auto";
              }}
            >
              <boxGeometry args={[width, FLOOR_HEIGHT, depth]} />
              <meshStandardMaterial
                color={TIER_COLOR[floor.tier]}
                emissive={isActive ? "#c1704a" : "#000000"}
                emissiveIntensity={isActive ? 0.55 : 0}
                roughness={0.55}
                metalness={0.15}
              />
            </mesh>
            {/* window seams */}
            <mesh position={[0, y, 0]}>
              <boxGeometry args={[width + 0.002, FLOOR_HEIGHT * 0.94, depth + 0.002]} />
              <meshBasicMaterial color="#0b0d0c" wireframe transparent opacity={0.35} />
            </mesh>
          </group>
        );
      })}
      {/* Level label for the selected/hovered floor */}
      {meshes
        .filter(({ floor }) => floor.id === (hoveredId ?? selectedId))
        .map(({ floor, width, y }) => (
          <Text
            key={floor.id}
            position={[width / 2 + 0.35, y, 0]}
            fontSize={0.28}
            color="#f4eee4"
            anchorX="left"
            anchorY="middle"
          >
            {floor.label}
          </Text>
        ))}
    </group>
  );
}
