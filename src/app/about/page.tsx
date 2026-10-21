import type { Metadata } from "next";
import { EDITORIAL } from "@/lib/editorial";
import { EditorialHero, EditorialSections, EditorialCTA } from "@/components/shared/Editorial";
export const metadata: Metadata = { title: "About Us", description: EDITORIAL.about.intro, alternates: { canonical: "/about" } };
export default function AboutPage() { return <div className="page-shell editorial-page"><div className="container-site"><EditorialHero {...EDITORIAL.about} /><EditorialSections sections={EDITORIAL.about.sections} /><EditorialCTA /></div></div>; }
