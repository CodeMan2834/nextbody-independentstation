"use client";

import { useEffect, useRef, useCallback } from "react";
import type { GalaxyField, GalaxyFieldOptions } from "@/lib/galaxy";
import { GALAXY_DEFAULTS } from "@/lib/galaxy";
import { useReducedMotion } from "./useReducedMotion";
import { useIsMobile } from "./useIsMobile";

export function useGalaxy(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts?: GalaxyFieldOptions
) {
  const galaxyRef = useRef<GalaxyField | null>(null);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const setScrollBlend = useCallback((v: number) => {
    galaxyRef.current?.setScrollBlend(v);
  }, []);

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    if (!window.createGalaxyField) return;

    galaxyRef.current = window.createGalaxyField(canvas, {
      ...GALAXY_DEFAULTS,
      ...opts,
    });

    return () => {
      galaxyRef.current?.destroy();
      galaxyRef.current = null;
    };
  }, [reducedMotion, isMobile]);

  return { setScrollBlend, galaxyRef };
}
