---
name: virtual-tour-360
description: Use when a real-estate/architecture landing page needs a photographic 360° virtual tour (drag to look around a real room, click a hotspot to move to the next scene) — distinct from r3f-3d-viewer (a 3D building model you orbit from outside) and scroll-image-sequence (a fixed rendered camera path). This is real interior photography, not a model or render. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# 360° Virtual Tour Recipes — Equirectangular Panorama Viewer, Scene-to-Scene Hotspots

## Overview

A virtual tour is real photography (an equirectangular panorama shot with a 360° camera or
stitched from bracketed shots), not a model — the "3D" feeling comes from being *inside* a
sphere textured with that photo, looking around by dragging. Since this repo already has
React Three Fiber installed for `r3f-3d-viewer`, build this with the same stack (a sphere with
inverted normals + the panorama as a texture) rather than pulling in a separate panorama library
like Pannellum or Marzipano — one fewer dependency, same mental model as the rest of the 3D work.

## When to use

- Client has (or will commission) real 360° photography of finished/staged interiors
- "Walk through the actual space" is the ask, not "see the building from outside"
  (`r3f-3d-viewer`) or "watch a rendered flythrough" (`scroll-image-sequence`)

Not for: exterior building views or anything without real panoramic photography — don't fake
this with a regular photo stretched onto a sphere, it looks visibly wrong (regular photos aren't
shot with the 180°×360° equirectangular projection this technique requires).

## Core pattern: panorama sphere

```bash
npm install @react-three/fiber @react-three/drei three
```

```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function Panorama({ src }: { src: string }) {
  const texture = useTexture(src)
  texture.mapping = THREE.EquirectangularReflectionMapping
  return (
    <mesh scale={[-1, 1, 1]}>
      {/* -1 X scale flips the sphere inside-out so the texture faces inward, toward the camera */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

export function VirtualTourScene({ panoramaSrc }: { panoramaSrc: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
      <Panorama src={panoramaSrc} />
      <OrbitControls
        enableZoom
        enablePan={false}
        rotateSpeed={-0.4} // negative: dragging right pans the view right, matches user expectation
        minDistance={0.1}
        maxDistance={0.1} // camera stays at center — this is look-around, not fly-through
      />
    </Canvas>
  )
}
```

The camera sits at the sphere's center (`position: [0, 0, 0.1]`, `maxDistance` pinned) —
`OrbitControls` here provides *rotation* only, not real orbit; the sphere itself never needs to
move, only what direction the camera looks.

## Recipe: hotspot navigation between scenes

Multiple panoramas (living room → kitchen → bedroom) linked by clickable markers positioned in
3D space within each sphere, same `Html`-as-hit-target pattern as `r3f-3d-viewer`'s hotspots.

```tsx
import { Html } from '@react-three/drei'

type Hotspot = { position: [number, number, number]; label: string; targetScene: string }

function SceneHotspot({ position, label, onNavigate }: Hotspot & { onNavigate: () => void }) {
  return (
    <Html position={position} center distanceFactor={8}>
      <button
        onClick={onNavigate}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/40 bg-ink/70 text-cream backdrop-blur-sm hover:border-clay"
        aria-label={`Go to ${label}`}
      >
        →
      </button>
    </Html>
  )
}
```

Position hotspots by eye (place a marker, view the scene, nudge the `position` vector until it
sits where the doorway/opening actually is in the photo) — there's no shortcut to this, it's the
same manual-placement cost as tracing floor plan room paths in `floor-plan-viewer`.

## Recipe: preload the next likely scene

A tour with several linked panoramas should preload the scene(s) reachable from hotspots on the
current one, not wait until the user clicks:

```tsx
useTexture.preload(nextScenePanoramaSrc)
```

Don't preload the *entire* tour up front — each equirectangular panorama is typically several
MB; preload one hop ahead of the current scene, not the whole graph.

## Quick reference

| Need | Approach |
|---|---|
| Look around inside a real photographed room | Panorama sphere (this skill) |
| See the building from outside, orbitable | `r3f-3d-viewer` |
| Rendered camera flythrough, not user-controlled | `scroll-image-sequence` |
| Move between rooms in the tour | `Html` hotspot markers, same pattern as `r3f-3d-viewer` |
| Avoid loading the whole tour up front | Preload only scenes reachable from the current hotspots |

## Common mistakes

- **Stretching a normal photo onto the sphere** — a regular (rectilinear) photo does not have
  the equirectangular projection this technique requires; it must be shot on a 360 camera or
  stitched specifically for this, or the result visibly warps.
- **Forgetting `side: THREE.BackSide`** (or the `-1` X-scale flip) — without one of these, the
  texture renders on the sphere's outward-facing side and the viewer sees nothing from inside.
- **Letting `OrbitControls` actually move/zoom the camera position** — this is look-around, not
  fly-through; pin `minDistance`/`maxDistance` to the same value so only rotation is possible,
  or the illusion of standing in a fixed spot breaks.
- **Preloading every panorama in the tour immediately** — each is several MB; preload one hop
  ahead of hotspots on the current scene, matching `r3f-3d-viewer`'s general asset-weight
  discipline, not the whole tour graph at once.
- **No loading state between scene transitions** — same `Suspense` requirement as
  `r3f-3d-viewer`'s model loading; a multi-MB panorama swap with zero feedback reads as frozen.
