import HomeEffects from "@/components/home/HomeEffects";
import Hero from "@/components/home/Hero";
import Principles from "@/components/home/Principles";
import Method from "@/components/home/Method";
import Origin from "@/components/home/Origin";
import Timeline from "@/components/home/Timeline";
import Studies from "@/components/home/Studies";
import NodesSection from "@/components/home/NodesSection";
import DropReveal from "@/components/home/DropReveal";
import Suit01Reveal from "@/components/home/Suit01Reveal";

/**
 * Home — CHANGE-02. §01 Hero → §02 Principles → §03 Method → §04 Origin (+ §04.1 Our Journey) → §05 Studies
 * → §06 Nodes → §07 Drop → §08 SUIT-01 reveal → (Footer, mounted in layout).
 * The layout provides <main id="main">.
 */
export default function Home() {
  return (
    <>
      <HomeEffects />
      <Hero />
      <Principles />
      <Method />
      <Origin />
      <Timeline />
      <Studies />
      <NodesSection />
      <DropReveal />
      <Suit01Reveal />
    </>
  );
}
