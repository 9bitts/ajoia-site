"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Phase = "enter" | "hold" | "exit" | "done";

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const holdDelay = 50;
    const holdMs = reduceMotion ? 1400 : 3000;
    const exitMs = reduceMotion ? 450 : 900;

    document.documentElement.classList.add("intro-lock");

    // Next frame → hold so CSS transitions actually run
    const tHold = window.setTimeout(() => setPhase("hold"), holdDelay);
    const tExit = window.setTimeout(
      () => setPhase("exit"),
      holdDelay + holdMs,
    );
    const tDone = window.setTimeout(() => {
      document.documentElement.classList.remove("intro-lock");
      setPhase("done");
    }, holdDelay + holdMs + exitMs);

    return () => {
      window.clearTimeout(tHold);
      window.clearTimeout(tExit);
      window.clearTimeout(tDone);
      document.documentElement.classList.remove("intro-lock");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`intro-splash is-${phase}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="intro-splash__veil" />
      <div className="intro-splash__stage">
        <div className="intro-splash__glow" />
        <div className="intro-splash__mark">
          <Image
            src="/images/logo-ajoia.png"
            alt=""
            width={520}
            height={180}
            priority
            className="intro-splash__logo"
          />
          <div className="intro-splash__sheen" />
        </div>
        <div className="intro-splash__rule" />
      </div>
    </div>
  );
}
