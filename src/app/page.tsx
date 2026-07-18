import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { GalaxyCanvas } from "@/components/home/GalaxyCanvas";
import { HeroVideo } from "@/components/home/HeroVideo";
import { NarrativeBeats } from "@/components/home/NarrativeBeats";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { GlassCardStack } from "@/components/home/GlassCardStack";
import { WhyNextBody } from "@/components/home/WhyNextBody";
import { CustomerCases } from "@/components/home/CustomerCases";
import { IndustrySolutions } from "@/components/home/IndustrySolutions";
import { TechnologySection } from "@/components/home/TechnologySection";
import { TrustBar } from "@/components/home/TrustBar";
import { FinalCTA } from "@/components/home/FinalCTA";
import { SpotlightMask } from "@/components/shared/SpotlightMask";

export const metadata: Metadata = {
  title: "See Your Body in a New Dimension",
};

export default function HomePage() {
  return (
    <>
      <GalaxyCanvas />
      <HeroVideo />
      <SpotlightMask />
      <HeroSection />
      <NarrativeBeats />
      <ProductShowcase />
      <GlassCardStack />
      <WhyNextBody />
      <IndustrySolutions />
      <CustomerCases />
      <TechnologySection />
      <TrustBar />
      <FinalCTA />
    </>
  );
}
