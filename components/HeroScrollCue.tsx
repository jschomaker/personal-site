"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Phones only: narrower than Tailwind's md breakpoint and touch-first, so a
// narrow desktop window keeps normal wheel scrolling. Matches the button's
// max-md:pointer-coarse: classes.
const MOBILE_QUERY = "(width < 48rem) and (pointer: coarse)";

function unlock() {
  document.documentElement.style.overflow = "";
}

export default function HeroScrollCue({ targetId }: { targetId: string }) {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    // Only gate a fresh visit at the top; a restored scroll position stays usable.
    if (!mq.matches || window.scrollY > 0) return;
    document.documentElement.style.overflow = "hidden";
    // Rotating to landscape (or anything else that stops matching) hands scrolling back.
    const onChange = () => {
      if (!mq.matches) unlock();
    };
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      unlock();
    };
  }, []);

  const jump = () => {
    unlock();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(targetId)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={jump}
      aria-label="Scroll to content"
      className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 p-3 text-foreground/70 transition-opacity active:opacity-50 max-md:pointer-coarse:block motion-safe:animate-intro-fade motion-safe:[animation-delay:1200ms]"
    >
      <ChevronDown className="size-6" strokeWidth={1.5} />
    </button>
  );
}
