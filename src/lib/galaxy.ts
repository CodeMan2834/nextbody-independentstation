export interface GalaxyFieldOptions {
  dustCount?: number;
  armCount?: number;
  arms?: number;
  rotationSpeed?: number;
  nebulaSpeed?: number;
  colors?: string[];
  coreGlow?: string;
  nebulaA?: string;
  nebulaB?: string;
  nebulaOuter?: string;
  mouseInfluence?: number;
}

export interface GalaxyField {
  setScrollBlend: (v: number) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    createGalaxyField?: (
      canvas: HTMLCanvasElement,
      opts?: GalaxyFieldOptions
    ) => GalaxyField;
  }
}

export const GALAXY_DEFAULTS: GalaxyFieldOptions = {
  rotationSpeed: 0.00092,
  nebulaSpeed: 0.00027,
  dustCount: 3600,
  armCount: 3000,
  colors: ["#ffffff", "#e8f0ff", "#a8c8ff", "#6eb5ff", "#0066ff"],
  coreGlow: "rgba(120,175,255,0.48)",
  nebulaA: "rgba(50,90,170,0.28)",
  nebulaB: "rgba(30,0,70,0.16)",
  nebulaOuter: "rgba(3,5,16,0.95)",
  mouseInfluence: 0.04,
};
