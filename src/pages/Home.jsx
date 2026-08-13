import React from "react";
import PremiumHero from "../components/PremiumHero";
import BrandManifesto from "../components/BrandManifesto";
// import ScienceSection from "../components/ScienceSection";
import RitualSection from "../components/RitualSection";
import CollectionSection from "../components/CollectionSection";
import ResultsSection from "../components/ResultsSection";
// import BottleScrollAnimation from "../components/BottleScrollAnimation";
import LumiereEdit from "../components/LumiereEdit";

export default function Home() {
  return (
    <main className="w-full min-h-screen p-0 m-0 overflow-x-hidden flex flex-col items-stretch justify-start">
      <PremiumHero />
      <BrandManifesto />
      {/* <ScienceSection/> */}
      <LumiereEdit />
      <RitualSection />
      <CollectionSection />
      
      {/* Margin / Padding push avoid cheyyan section lock */}
      <div className="w-full p-0 m-0 block">
        <ResultsSection />
      </div>

      {/* <div className="w-full p-0 m-0 block relative">
        <BottleScrollAnimation />
      </div> */}
    </main>
  );
}
