import React from "react";
import PetCategoryBrowser from "../components/PetCategoryBrowser";

export default function Bird() {
  return (
    <PetCategoryBrowser
      category="Bird"
      title="Birds"
      itemLabel="Birds"
      accentClass="text-cyan-700"
      accentSoftClass="border-cyan-200 hover:bg-cyan-50"
      accentRingClass="accent-cyan-600"
      summaryGradientClass="from-cyan-100 to-blue-100"
      pageGradientClass="from-blue-50 via-white to-cyan-50"
      buttonGradientClass="from-cyan-500 to-blue-600"
    />
  );
}
