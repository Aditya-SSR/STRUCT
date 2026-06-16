"use client"

import TeamSection from "@/components/Teamsection.jsx";
import Line from "@/components/Line.jsx";

export default function Home(){


    return(
        <div>
            <TeamSection />


    <div className="w-full min-h-screen bg-[#080808] flex flex-col items-center justify-center px-12 gap-10 md:gap-16">
          <Line delay={0.3}>
              <p className="font-monument text-[#faf9f6] text-xl md:text-3xl leading-relaxed max-w-4xl text-center">
                The STRUCTS operate as architects of the human form, treating heavy textiles like concrete and steel. We do not chase seasonal fashion; we engineer permanent, modular uniforms built for strict utility and brutalist aesthetics.
              </p>
          </Line>
    </div>
        </div>
    )
}