# Image Credits

This demo uses real photography sourced from Unsplash (free to use under the
[Unsplash License](https://unsplash.com/license) — no permission needed, attribution appreciated
but not required). Credited here as good practice.

| File | Photographer | Source |
|---|---|---|
| `public/images/hero-building.jpg` | [Tobias Wilden](https://unsplash.com/@tobiasw) | https://unsplash.com/photos/4453DIQWtsQ |
| `public/images/amenity-pool.jpg` | [Christopher Farrugia](https://unsplash.com/@chrisfarr_) | https://unsplash.com/photos/B1BZ_Bz-I8c |
| `public/images/location-skyline.jpg` | [Clark Gu](https://unsplash.com/@atluminon) | https://unsplash.com/photos/x1-4c42c8k4 |

## 3D Model

`public/models/building-transformed.glb` — **House_X_XVII** by [-X-ScornGames](https://sketchfab.com/XX-XX),
licensed [CC Attribution 4.0](http://creativecommons.org/licenses/by/4.0/) (attribution required —
credited here). Source: https://sketchfab.com/3d-models/house-x-xvii-31b933fcaa454c9b9ce96ef761c9f68d

Note: this specific model is tagged "Generated with AI" (Tencent Hunyuan3D image-to-3D) by its
author — flagged here for transparency, not a defect. Compressed from a 32.6MB original download
to 4.2MB via `gltfjsx --transform` (Draco + meshopt + WebP textures). Because the model is a
single merged mesh (common for scan/AI-generated buildings, no per-floor geometry), the 3D
section uses three clickable hotspot markers (Foundation/Crown/Summit) rather than per-floor
click detection — see `r3f-3d-viewer` skill for the hotspot-marker recipe this follows.
