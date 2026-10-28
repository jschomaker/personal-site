"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Phones only, in either orientation: touch-first with one side shorter than
// Tailwind's md breakpoint. Tablets (both sides >= 48rem) and narrow desktop
// windows (fine pointer) keep normal scrolling. Matches the button's classes.
const MOBILE_QUERY = "(pointer: coarse) and (width < 48rem), (pointer: coarse) and (height < 48rem)";

// overflow alone still lets iOS rubber-band the page and collapse the toolbar
// on a swipe; overscroll-behavior stops that. The data attribute lets the hero
// track the live viewport height (dvh) while locked so nothing peeks below it.
function lock() {
  const html = document.documentElement;
  html.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  html.dataset.scrollLocked = "";
}

function unlock() {
  const html = document.documentElement;
  html.style.overflow = "";
  html.style.overscrollBehavior = "";
  delete html.dataset.scrollLocked;
}

export default function HeroScrollCue({ targetId }: { targetId: string }) {
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    // Only gate a fresh visit at the top; a restored scroll position stays usable.
    if (!mq.matches || window.scrollY > 0) return;
    lock();
    // Anything that stops matching (e.g. a touch laptop resized up) hands scrolling back.
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
      className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 p-3 text-foreground/70 transition-opacity active:opacity-50 max-md:pointer-coarse:block pointer-coarse:[@media(height<48rem)]:block motion-safe:animate-intro-fade motion-safe:[animation-delay:1200ms]"
    >
      <ChevronDown className="size-6" strokeWidth={1.5} />
    </button>
  );
}
