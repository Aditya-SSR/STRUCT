import FormFollows from "@/components/FormFollows.jsx";
import Intro from "@/components/Mainintro.jsx";
import ZoomReveal from "@/components/dropreveal";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Intro />
      <FormFollows />
      <ZoomReveal />      
    </div>
  );
}