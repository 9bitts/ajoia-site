"use client";

import Image from "next/image";
import { useLayoutEffect, useState } from "react";

const STORAGE_KEY = "ajoia-intro-seen";
const INTRO_MS = 3200;

type Phase = "play" | "exit" | "done";

export function IntroSplash() {
  const [phase, setPhase] = useState<Phase>("play");

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const seen = sessionStorage.getItem(STORAGE_KEY);

    if (seen || reduceMotion) {
      setPhase("done");
      return;
    }

    document.documentElement.classList.add("intro-lock");

    const exitTimer = window.setTimeout(() => setPhase("exit"), INTRO_MS);
    const doneTimer = window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      document.documentElement.classList.remove("intro-lock");
      setPhase("done");
    }, INTRO_MS + 900);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      document.documentElement.classList.remove("intro-lock");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className={`intro-splash is-playing${phase === "exit" ? " is-exiting" : ""}`}
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
