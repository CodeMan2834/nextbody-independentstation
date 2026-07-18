const GALAXY_SRC = "/galaxy-particles.js?v=8";

let loadPromise: Promise<void> | null = null;

export function loadGalaxyScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.createGalaxyField) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-nextbody-galaxy="true"]'
    );
    if (existing) {
      if (window.createGalaxyField) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GALAXY_SRC;
    script.async = true;
    script.dataset.nextbodyGalaxy = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load galaxy script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
