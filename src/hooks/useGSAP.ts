"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function useGSAP(
  callback: (ctx: gsap.Context) => void,
  deps?: unknown[]
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => callback(ctx), ctxRef);
    ctxRef.current = ctx;
    return () => ctx.revert();
  }, deps);

  return ctxRef;
}
