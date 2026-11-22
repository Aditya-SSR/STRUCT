/**
 * People hero layout, keyed to the viewport ASPECT RATIO (not width): the photo's subject sits mid-frame, so
 * landscape = the text frames the figure (headline left, lead right); portrait = the figure fills the width and the
 * text rides on a stronger ink gradient at the bottom. Injected as a <style> because the project's Turbopack CSS rule
 * runs every *.css through Tailwind, which disables CSS Modules. Classes are namespaced `ph-`.
 */
export const heroCss = `
.ph-hero{position:relative;isolation:isolate;height:100svh;min-height:34rem;overflow:hidden;background:var(--ink);color:var(--paper)}
.ph-media,.ph-zoom{position:absolute;inset:0}
.ph-media{overflow:hidden}
.ph-img{object-fit:cover;object-position:54% 40%}
@media (min-aspect-ratio:1/1){.ph-img{object-position:40% 40%}}
@media (min-aspect-ratio:4/3){.ph-img{object-position:25% 40%}}
@media (min-aspect-ratio:3/2){.ph-img{object-position:0% 40%}}
.ph-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgb(10 10 10/.8) 0%,rgb(10 10 10/.55) 30%,rgb(10 10 10/.18) 52%,rgb(10 10 10/0) 66%)}
@media (min-aspect-ratio:1/1){.ph-shade{background:linear-gradient(to top,rgb(10 10 10/.42) 0%,rgb(10 10 10/.14) 26%,rgb(10 10 10/0) 46%)}}
.ph-frame{position:absolute;inset:var(--header-h) var(--margin) var(--margin);pointer-events:none}
.ph-content{position:absolute;inset:var(--header-h) var(--margin) var(--margin);display:flex;flex-direction:column;justify-content:space-between;gap:1.25rem;padding:1.25rem 1rem 1.1rem}
.ph-main{display:flex;flex-direction:column;gap:1.25rem;align-items:flex-start}
.ph-title{font-size:min(11.4vw,6.6svh);line-height:.92;letter-spacing:-.045em;max-width:7.3em}
.ph-lead{max-width:24rem;font-size:.8125rem;line-height:1.55;letter-spacing:-.01em}
@media (min-aspect-ratio:1/1) and (min-width:700px){
.ph-content{padding:1.5rem 1.75rem}
.ph-title{font-size:min(5.4vw,11.5svh)}
.ph-lead{max-width:22rem}
}
@media (min-aspect-ratio:3/2) and (min-width:700px){
.ph-main{flex-direction:row;align-items:flex-end;justify-content:space-between;gap:2rem}
.ph-lead{width:clamp(14rem,19vw,24rem);font-size:clamp(.75rem,.95vw,.9375rem);padding-bottom:.35rem}
}
@media (max-height:520px){.ph-title{font-size:min(5.4vw,14svh)}}
`;
