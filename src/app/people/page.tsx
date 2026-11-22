import type { Metadata } from "next";
import PeopleHero from "@/components/people/PeopleHero";
import FoundersGrid from "@/components/people/FoundersGrid";
import NameSwapStrip from "@/components/people/NameSwapStrip";
import StudioRules from "@/components/people/StudioRules";
import CrewList from "@/components/people/CrewList";
import NodesStrip from "@/components/people/NodesStrip";

export const metadata: Metadata = {
  title: "People",
  description:
    "Four designers who quit the same week in 2019 — an architect, a pattern cutter, a textile engineer and a type designer — and the crew in eight nodes who keep their rule.",
};

export default function PeoplePage() {
  return (
    <div>
      <PeopleHero />
      <FoundersGrid />
      <NameSwapStrip />
      <StudioRules />
      <CrewList />
      <NodesStrip />
    </div>
  );
}
