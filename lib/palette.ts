/* ═══════════════════════════════════════════════════════════
   PALETTE — swap this object to retheme the hero background
   and everything that blends into it.
   Each stop maps to a band in the marble's value range,
   from darkest (deep) to lightest (pale). Edge is the
   amber/accent colour used for ridge highlights.

   Lives here rather than in HeroBackground.tsx because that
   file is "use client": Server Components that import from it
   get an opaque client reference, so PALETTE.deep comes back
   undefined. Importing from here also avoids pulling three.js
   into whatever imports the palette.
   ═══════════════════════════════════════════════════════════ */
export const PALETTE = {
  deep:  "#121a22",
  dark:  "#1c2e35",
  teal:  "#2a4a47",
  slate: "#3a5560",
  mid:   "#5a7e7a",
  light: "#7fa59e",
  pale:  "#a7c4ba",
  edge:  "#a8885a",
};
