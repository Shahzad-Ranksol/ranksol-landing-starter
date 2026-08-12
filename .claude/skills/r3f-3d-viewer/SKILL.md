---
name: r3f-3d-viewer
description: Use when adding an interactive 3D building/product viewer to a Next.js marketing page with React Three Fiber — converting a client's .glb via gltfjsx, clickable floors/units, camera fly-to transitions, OrbitControls, or performance/LOD tuning for a 3D scene embedded in a page. Companion recipe skill to interactive-landing-page.
version: 1.0
---

# R3F 3D Viewer Recipes — GLTF Loading, Interaction, Camera, Performance

## Overview

Stack: **React Three Fiber** (`@react-three/fiber`, R3F) renders Three.js declaratively inside
React; **`@react-three/drei`** supplies helpers (`OrbitControls`, `Html`, `useGLTF`,
`PerspectiveCamera`); **`gltfjsx`** (CLI) converts a client-supplied `.glb` into a typed React
component instead of hand-writing scene-graph traversal.

The 3D model is a **deliverable from the client/architect** (Blender export), not something
Claude Code generates. Get it early — everything here waits on that file.

## When to use

- Building/product viewer with clickable floors, units, or hotspots
- Camera transitions between an overview shot and a detail shot
- Any `<Canvas>` embedded in a Next.js page (App Router)

Not for: scroll-linked page choreography (see `scroll-animation`) — a 3D canvas can *also*
react to scroll, but the scroll-driving logic itself still belongs to GSAP ScrollTrigger, which
can set state/props that the R3F scene reads.

## Core pattern: `.glb` → typed component via gltfjsx

```bash
npx gltfjsx@latest ./public/models/building.glb --types --transform
```

- `--types` emits a TypeScript `GLTFResult` type for meshes/materials (autocomplete, no `any`).
- `--transform` runs Draco/meshopt compression via `gltf-transform` — do this for any model
  over a few MB; it's the single biggest perf win before you touch code.

This generates a component like:

```tsx
// components/Building.tsx (gltfjsx output, trimmed)
import { useGLTF } from '@react-three/drei'

export function Building(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/building-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Floor_1.geometry} material={materials.Concrete} />
      <mesh geometry={nodes.Floor_2.geometry} material={materials.Concrete} />
      {/* ...one mesh per node */}
    </group>
  )
}

useGLTF.preload('/models/building-transformed.glb')
```

Treat the gltfjsx output as generated code — don't hand-edit the mesh list when the model
changes, re-run the CLI.

## Core pattern: mount the Canvas without blocking first paint

3D must never block the page's initial render or SSR (Three.js touches `window`/`WebGLRenderingContext`).

```tsx
// components/BuildingViewer.tsx
'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

export function BuildingViewer() {
  return (
    <div className="h-[80vh] w-full">
      <Suspense fallback={<ViewerLoader />}>
        <Scene />
      </Suspense>
    </div>
  )
}
```

```tsx
// components/Scene.tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Building } from './Building'

export default function Scene() {
  return (
    <Canvas camera={{ position: [8, 6, 8], fov: 45 }} dpr={[1, 2]} frameloop="demand">
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <Building />
      <OrbitControls enableDamping minDistance={4} maxDistance={20} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  )
}
```

`frameloop="demand"` stops R3F from rendering every frame at 60fps when nothing is animating —
it re-renders only on state change or `invalidate()` call. Big idle-CPU/battery win for a
mostly-static viewer; skip it only if you have continuous animation (e.g. auto-rotate).

## Recipe: clickable floors/units

Raycasting is automatic on R3F — any mesh with an `onClick` gets hit-tested.

```tsx
function Floor({ id, geometry, material, onSelect }: FloorProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation() // don't let the click fall through to floors behind/below
        onSelect(id)
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={material} attach="material" />
      {hovered && (
        <meshStandardMaterial attach="material" color="#4f9dff" transparent opacity={0.35} />
      )}
    </mesh>
  )
}
```

Set `document.body.style.cursor = hovered ? 'pointer' : 'auto'` in the hover handlers (or use
drei's `<Cursor>`) so users know the mesh is interactive.

## Recipe: camera fly-to transition

Drive the camera with a tween, not by fighting `OrbitControls`' own state — disable controls
during the transition.

```tsx
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'

function useCameraFlyTo() {
  const { camera, controls } = useThree() // controls typed via drei's makeDefault
  return (target: [number, number, number], lookAt: [number, number, number]) => {
    if (controls) (controls as any).enabled = false
    gsap.to(camera.position, {
      x: target[0], y: target[1], z: target[2],
      duration: 1.4,
      ease: 'power3.inOut',
      onUpdate: () => camera.lookAt(...lookAt),
      onComplete: () => { if (controls) (controls as any).enabled = true },
    })
  }
}
```

Add `makeDefault` to `<OrbitControls makeDefault ... />` so `useThree().controls` resolves to it.

## Recipe: hotspot markers (DOM overlay pinned to 3D position)

Use this instead of per-mesh click detection whenever the model is a **single merged mesh** —
the normal case for a scanned, photogrammetry-captured, or AI-generated (e.g. Hunyuan3D,
Meshy) building: there's no separate geometry per floor/unit to attach `onClick` to, so a
handful of hand-placed hotspots is the standard technique, not a fallback.

```tsx
import { Html } from '@react-three/drei'

function Hotspot({ position, label, onSelect }: { position: [number, number, number]; label: string; onSelect: () => void }) {
  return (
    <group position={position}>
      {/* Visual only — the button below is the real hit target, see Common mistakes */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <Html distanceFactor={10} occlude={false}>
        <button onClick={onSelect} className="hotspot-marker">{label}</button>
      </Html>
    </group>
  )
}
```

`distanceFactor` scales the label down with camera distance so it doesn't dominate wide shots.
`occlude` (hides the marker when geometry is in front of it, needs `occlude={[meshRefs]}` or
`"blending"` mode — see drei docs) is worth adding once the base interaction works, but skip it
initially — it's a polish detail, not required for the marker to function.

## Recipe: WebGL context-loss recovery

Rare on a typical visit, but real — GPU driver resets, too many WebGL contexts open across a
browser session, thermal throttling. Without handling it, a lost context leaves a permanently
blank canvas with no error and no way to recover short of a full page reload. three.js's own
`WebGLRenderer` already calls `event.preventDefault()` internally on context loss (which is what
tells the browser it's allowed to attempt restoration) — the app only needs to surface the
interim state and let R3F re-render once `webglcontextrestored` fires:

```tsx
const [lost, setLost] = useState(false)

const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
  const canvas = gl.domElement
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setLost(true) })
  canvas.addEventListener('webglcontextrestored', () => setLost(false))
}, [])

// <Canvas onCreated={handleCreated}>...</Canvas>
// {lost && <div className="absolute inset-0 ...">Reconnecting 3D view…</div>}
```

Also lower baseline GPU pressure so loss is less likely in the first place: `dpr={1}` instead of
`dpr={[1, 2]}` (biggest single lever — halves framebuffer resolution on retina displays),
`gl={{ antialias: false }}` on stylized/toon-shaded scenes where MSAA isn't buying much visible
quality, and `powerPreference: 'default'` rather than `'high-performance'` on a marketing page
that doesn't need a discrete GPU forced on.

## Performance / LOD checklist

- **Compress the model**: `gltfjsx --transform` (Draco geometry + meshopt) before anything else.
- **`useGLTF.preload(url)`** at module scope so the model starts fetching as soon as the chunk
  loads, not when the component mounts.
- **`frameloop="demand"`** unless the scene has continuous motion.
- **Dispose on unmount**: `dispose={null}` on the root `<group>` (gltfjsx default) prevents R3F
  from disposing the *shared cached* geometry/material when one instance unmounts — only omit
  `dispose={null}` if you're certain the model is never reused elsewhere.
- **Merge static meshes** in Blender before export where possible — fewer draw calls beats
  micro-optimizing in code.
- **`dpr={[1, 2]}`** caps device-pixel-ratio at 2 — uncapped `dpr` on retina/4K displays tanks
  fps for no visible gain.
- **Texture size**: request ≤2K textures from the client for anything not extreme-closeup;
  4K+ textures on a marketing-page viewer is almost always wasted bandwidth.

## Quick reference

| Need | Tool/prop |
|---|---|
| `.glb` → React component | `npx gltfjsx@latest file.glb --types --transform` |
| Keep 3D out of SSR bundle | `next/dynamic(() => import(...), { ssr: false })` |
| Stop rendering when idle | `<Canvas frameloop="demand">` |
| Click a mesh | `onClick` + `e.stopPropagation()` |
| Camera move on click | tween `camera.position` with GSAP, disable controls mid-tween |
| DOM label pinned to 3D point | drei `<Html position={...}>` |
| Preload model early | `useGLTF.preload(url)` at module scope |

## Common mistakes

- **Rendering `<Canvas>` during SSR** — crashes on `window`/WebGL not existing server-side.
  Always `dynamic(..., { ssr: false })`.
- **Forgetting `e.stopPropagation()`** on click/hover handlers for stacked/overlapping meshes —
  clicks bubble through to whatever's behind, selecting the wrong floor/unit.
- **Fighting OrbitControls during a scripted camera move** — leave controls enabled while
  tweening `camera.position` and they'll snap the camera back or judder. Disable, tween,
  re-enable.
- **Uncompressed `.glb` in production** — a 40MB raw export is a common cause of a viewer that
  "hangs" on first load. Always run through `--transform` (or `gltf-transform` directly).
- **Re-running gltfjsx output through hand edits** — next model update overwrites your changes
  or drifts from the file; keep custom logic (click handlers, materials swap) in a wrapper
  component that imports the generated one, not inside the generated file.
- **No loading state** — `Suspense` fallback is required; `useGLTF` suspends while fetching, and
  without a fallback the page shows nothing (or a layout jump) until the model arrives.
- **Making a hotspot's visible label `pointer-events-none`, relying on the 3D sphere for clicks** —
  confirmed directly in testing: the sphere's *projected* screen size at typical camera distance
  is much smaller than the label text next to it, so users clicking the (visually obvious) label
  miss the actual raycast target and the click falls through to `onPointerMissed`, silently
  deselecting instead of selecting. Make the DOM label itself the `onClick` handler (plain DOM
  hit-testing, pixel-accurate) and treat the 3D mesh as decoration only — don't rely on raycasting
  a small sphere as the primary hit target.
- **No WebGL context-loss handling** — confirmed directly in testing under real (if unusual)
  browser conditions: a lost context leaves a permanently blank canvas with no console error
  explaining why. See the context-loss recovery recipe above.
