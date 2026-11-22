# STRUCT — Credits & licences

STRUCT is a fictional brand made for a design project (see the disclosure line in the footer).

## 3D objects — all procedural
Every 3D object on the site (hero monolith cluster, load-line Möbius ribbon, striped torus, edge-lined slab, mini cluster,
dot-grid wave, the signal-orange datum) is generated in code from primitives (`BoxGeometry`, `EdgesGeometry`, `TorusGeometry`,
a custom `BufferGeometry` and a custom GLSL shader, `InstancedMesh`). **No third-party 3D model, texture or HDRI is used**
(no `.glb`/`.gltf`/`.hdr` files in `public/`). Studio lighting is built at runtime from three.js's `RoomEnvironment`
(no network fetch). The only textures are tiny canvas-drawn sprites (contact-shadow blob, slab stripes) created in the browser.

## Software
| Package | Version | Licence | Used for |
|---|---|---|---|
| [three](https://github.com/mrdoob/three.js) (incl. `examples/jsm/environments/RoomEnvironment`) | 0.187 | MIT | 3D rendering |
| [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) | 9.x | MIT | React renderer for three |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10.x | MIT | installed; not used by the scenes in `src/components/three` |
| [cobe](https://github.com/shuding/cobe) | 2.0.1 | MIT | the dotted globe in the Nodes section (its land mask derives from a Wikipedia blank world map, public domain) |
| [GSAP](https://gsap.com) (+ ScrollTrigger, SplitText, Flip, Observer, CustomEase) | 3.15 | GSAP "Standard No Charge" licence | animation |
| [Lenis](https://github.com/darkroomengineering/lenis) | 1.3 | MIT | smooth scroll |
| [zustand](https://github.com/pmndrs/zustand) | 5.x | MIT | UI state |
| [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com) | 16 / 19 / 4 | MIT | framework |

## Typefaces
Monument Extended, Bitcount Prop Single and Space Mono are loaded via the app layout; see `src/app/layout.tsx` and
`docs/BRAND.md` §6.2 for their licensing notes.

## Imagery
Studio photographs in `public/img/` are AI-generated for this project (see the footer disclosure).

## Stretch goal not taken
A CC0/CC-BY dress-form GLB was deliberately **not** added: nothing was verified against a source licence page in the time box,
and the procedural pieces already match the white-studio look. If one is added later, record title / author / URL / licence here
and keep the file under 1.5 MB in `public/models/`.
