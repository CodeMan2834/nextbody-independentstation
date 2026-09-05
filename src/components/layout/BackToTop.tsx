"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 560);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 grid size-11 place-items-center border border-white/15 bg-[#071017]/90 text-[#dff8ff] shadow-[0_10px_35px_rgba(0,0,0,.32)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#76d9f4]/60 hover:text-[#76d9f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76d9f4]/60 ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
    >
      <ArrowUp className="size-4" aria-hidden="true" />
    </button>
  );
}
