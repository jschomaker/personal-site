"use client";

import { useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Any device with a touch screen (phones, tablets, touch laptops), at any size
// or orientation. Mouse/trackpad-only devices keep normal scrolling. Matches
// the button's any-pointer-coarse: class.
const TOUCH_QUERY = "(any-pointer: coarse)";

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
    const mq = window.matchMedia(TOUCH_QUERY);
    // Locked whenever a touch device sits at the very top: on a fresh visit, and again
    // after scrolling back up. A restored scroll position stays usable until then.
    if (mq.matches && window.scrollY <= 0) lock();

    let left = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      clearTimeout(settle);
      if (window.scrollY > 0) {
        left = true;
        return;
      }
      if (!left || !mq.matches) return;
      // Wait out momentum and the top-edge bounce before locking.
      settle = setTimeout(() => {
        if (window.scrollY > 0 || !mq.matches) return;
        left = false;
        lock();
      }, 150);
    };
    // Anything that stops matching (e.g. a touch laptop resized up) hands scrolling back.
    const onChange = () => {
      if (!mq.matches) unlock();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onChange);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
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
      className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-20 hidden -translate-x-1/2 p-3 text-foreground/70 transition-opacity active:opacity-50 any-pointer-coarse:block motion-safe:animate-intro-fade motion-safe:[animation-delay:1200ms]"
    >
      <ChevronDown className="size-6" strokeWidth={1.5} />
    </button>
  );
}
