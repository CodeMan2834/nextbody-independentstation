"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/useIsMobile";

/**
 * Full-bleed product video filling the hero viewport.
 * Dark vignette blends edges into the galaxy background for seamless integration.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onCanPlay = () => setReady(true);
    video.addEventListener("canplaythrough", onCanPlay, { once: true });
    const t = setTimeout(() => setReady(true), 1500);
    return () => {
      video.removeEventListener("canplaythrough", onCanPlay);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      video.style.opacity = String(Math.max(0, 1 - progress * 1.2));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isMobile || reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {/* Full-bleed video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: ready ? 0.65 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <source src="/video/f20-intro.mp4" type="video/mp4" />
      </video>

      {/* Blue accent glow — center-weighted */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 50% 48%, rgba(0,102,255,0.18) 0%, transparent 55%)",
        }}
      />

      {/* Heavy vignette — seamless edge blend into galaxy/black background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 48% at 50% 45%, transparent 25%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.75) 80%, #000 100%)",
        }}
      />
    </div>
  );
}
