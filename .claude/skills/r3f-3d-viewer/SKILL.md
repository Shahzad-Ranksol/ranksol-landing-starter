---
name: r3f-3d-viewer
description: Use when adding an interactive 3D building/product viewer to a Next.js marketing page with React Three Fiber — converting a client's .glb via gltfjsx, clickable floors/units, camera fly-to transitions, OrbitControls, day/night time-of-day lighting, minimap view-angle navigation, or performance/LOD tuning for a 3D scene embedded in a page. Companion recipe skill to interactive-landing-page.
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

## Recipe: day/night time-of-day lighting

Verified directly on a live reference (belgradearbor.rs/en/3d): a time slider relights the whole
scene — interior windows switch on and glow, the sky/environment darkens, ambient light drops —
turning a single static model into "see it at any hour," a genuinely compelling feature for a
real-estate viewer (buyers care what the building looks like in the evening, lit up). Drive it
by interpolating light intensities/colors and swapping an emissive map on window materials, keyed
to a 0-24 slider value rather than building a full physically-based day/night cycle:

```tsx
function useDayNight(hour: number) {
  // 0 = midnight, 12 = noon — smoothstep so dawn/dusk aren't linear cliffs
  const dayness = THREE.MathUtils.smoothstep(hour, 6, 18) * (1 - THREE.MathUtils.smoothstep(hour, 18, 22))
  return {
    sunIntensity: THREE.MathUtils.lerp(0.1, 2, dayness),
    ambientIntensity: THREE.MathUtils.lerp(0.15, 0.6, dayness),
    skyColor: new THREE.Color().lerpColors(new THREE.Color('#0b1220'), new THREE.Color('#bcd9f2'), dayness),
    windowEmissive: 1 - dayness, // windows glow warm as daylight fades
  }
}
```

```tsx
const { sunIntensity, ambientIntensity, skyColor, windowEmissive } = useDayNight(hour)

<color attach="background" args={[skyColor]} />
<ambientLight intensity={ambientIntensity} />
<directionalLight intensity={sunIntensity} position={[10, 15, 5]} />
<mesh geometry={windowGeometry}>
  <meshStandardMaterial emissive="#f4c97a" emissiveIntensity={windowEmissive} map={windowTexture} />
</mesh>
```

Drive `hour` from a controlled slider (`<input type="range" min={0} max={24} />`), not an
auto-playing clock, unless the brief specifically wants an ambient auto-cycle — a buyer exploring
"what does 8pm look like" wants to land exactly there, not wait for a cycle to arrive.

## Recipe: minimap navigation with view-angle presets

Also verified on the same reference: a small top-corner floor-plan-style diagram (building
footprint outline, camera position dots around it) lets users jump straight to a specific
vantage point instead of manually orbiting to find it — pairs naturally with `floor-plan-viewer`'s
SVG-hotspot pattern, just driving a camera position instead of a room-detail callout.

```tsx
const VIEW_ANGLES: { label: string; position: [number, number, number]; target: [number, number, number] }[] = [
  { label: 'Entrance', position: [0, 3, 15], target: [0, 2, 0] },
  { label: 'Aerial', position: [0, 40, 0.1], target: [0, 0, 0] },
  { label: 'Street corner', position: [18, 4, 12], target: [4, 3, 0] },
]

function MinimapButton({ angle, onSelect }: { angle: typeof VIEW_ANGLES[number]; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="absolute h-2 w-2 rounded-full bg-cream/70 hover:bg-clay"
      style={{ left: `${angle.mapX}%`, top: `${angle.mapY}%` }} // mapX/mapY: hand-placed to match the footprint diagram
      aria-label={angle.label}
    />
  )
}

// on select: reuse the camera fly-to recipe above, tweening to angle.position/target
```

The footprint diagram itself is a simple SVG/CSS drawing of the building outline (matches
`floor-plan-viewer`'s raster/SVG hotspot approach) — the minimap is not a live top-down render of
the 3D scene, it's a flat 2D map with dots, which is both cheaper to build and easier to read.

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
| "What does it look like at night" | Time-of-day slider driving light intensity + window emissive, not a full day/night cycle sim |
| Jump straight to a known vantage point | Flat 2D minimap with hand-placed dots, reusing the camera fly-to recipe |

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
- **Auto-playing the day/night cycle when a buyer wants a specific hour** — a slider they control
  is more useful than an ambient animation for "show me what it looks like at 8pm"; only
  auto-cycle if the brief specifically wants ambient motion rather than an exploration tool.
- **Making the minimap a live top-down render of the actual 3D scene** — expensive (effectively
  a second camera/render pass) for something that's just meant to be a wayfinding diagram; a flat
  SVG/CSS footprint with positioned dots reads just as clearly and costs nothing at render time.
