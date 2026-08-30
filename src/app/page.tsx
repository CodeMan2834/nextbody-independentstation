import type { Metadata } from "next";
import { HomeExperience } from "@/components/home/HomeExperience";

export const metadata: Metadata = {
  title: "Precision Body Assessment, Reimagined",
};

export default function HomePage() {
  return <HomeExperience />;
}
