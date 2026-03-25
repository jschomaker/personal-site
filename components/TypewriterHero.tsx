"use client";

import { useEffect, useRef, useState } from "react";

const PHRASES = ["Jasper Schomaker", "Erie Development"];

const TYPING_SPEED = 72;
const DELETE_SPEED = 38;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_DELETE = 420;

export default function TypewriterHero() {
  const [displayed, setDisplayed] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting" | "waiting">("typing");
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = PHRASES[phraseIndex];

    if (phase === "typing") {
      if (displayed.length < current.length) {
        frameRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, TYPING_SPEED + Math.random() * 30 - 15);
      } else {
        frameRef.current = setTimeout(() => setPhase("pausing"), PAUSE_AFTER_TYPE);
      }
    }

    if (phase === "pausing") {
      frameRef.current = setTimeout(() => setPhase("deleting"), 0);
    }

    if (phase === "deleting") {
      if (displayed.length > 0) {
        frameRef.current = setTimeout(() => {
          setDisplayed((d) => d.slice(0, -1));
        }, DELETE_SPEED);
      } else {
        frameRef.current = setTimeout(() => {
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
          setPhase("waiting");
        }, PAUSE_AFTER_DELETE);
      }
    }

    if (phase === "waiting") {
      frameRef.current = setTimeout(() => setPhase("typing"), 0);
    }

    return () => {
      if (frameRef.current) clearTimeout(frameRef.current);
    };
  }, [displayed, phase, phraseIndex]);

  return (
    <h1 className="relative z-20 text-white text-5xl sm:text-6xl font-bold tracking-tight select-none flex items-baseline gap-0">
      <span>{displayed}</span>
      <span aria-hidden="true" className="typewriter-cursor" />
    </h1>
  );
}
