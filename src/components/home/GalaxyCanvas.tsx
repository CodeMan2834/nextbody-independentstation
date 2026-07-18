"use client";

import { useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { loadGalaxyScript } from "@/lib/loadGalaxyScript";
import type { GalaxyField } from "@/lib/galaxy";

export function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobile) return;

    let cancelled = false;
    let galaxy: GalaxyField | null = null;

    loadGalaxyScript()
      .then(() => {
        if (cancelled || !window.createGalaxyField) return;
        galaxy = window.createGalaxyField(canvas, {
          rotationSpeed: 0.00092,
          nebulaSpeed: 0.00027,
          dustCount: 2800,
          armCount: 2400,
          colors: ["#ffffff", "#e8f0ff", "#a8c8ff", "#6eb5ff", "#0066ff"],
          coreGlow: "rgba(120,175,255,0.48)",
          nebulaA: "rgba(50,90,170,0.28)",
          nebulaB: "rgba(30,0,70,0.16)",
          nebulaOuter: "rgba(3,5,16,0.95)",
          mouseInfluence: 0.04,
        });
        (
          window as Window & {
            __galaxyInstance?: GalaxyField;
          }
        ).__galaxyInstance = galaxy;
      })
      .catch(() => {
        /* Galaxy is decorative — fail silently */
      });

    return () => {
      cancelled = true;
      galaxy?.destroy();
      galaxy = null;
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 size-full"
      aria-hidden="true"
    />
  );
}
