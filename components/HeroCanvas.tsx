"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// three.js + R3F load in their own chunk after the page is interactive,
// instead of being parsed and hydrated before anything can respond to a tap.
const HeroBackground = dynamic(() => import("@/components/HeroBackground"), {
  ssr: false,
});

export default function HeroCanvas() {
  const [ready, setReady] = useState(false);

  // Fade in after the sim's first rendered frame rather than on mount, so the
  // shader compile never shows up as a pop.
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    import("@react-three/fiber").then(({ addAfterEffect }) => {
      if (cancelled) return;
      unsubscribe = addAfterEffect(() => {
        unsubscribe?.();
        setReady(true);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-[1400ms] ease-out motion-reduce:transition-none",
        // The sim is decorative and reads the pointer from window, so its
        // wrapper never needs to be a hit target. Left hittable, it swallows
        // every touch that starts on the hero (it sets touch-action: none) and
        // the page can't be scrolled. :last-child is the sim wrapper; the debug
        // panel renders before it and stays interactive.
        "[&>:last-child]:pointer-events-none",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <HeroBackground />
    </div>
  );
}
