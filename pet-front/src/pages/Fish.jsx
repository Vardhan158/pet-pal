import React from "react";
import PetCategoryBrowser from "../components/PetCategoryBrowser";

export default function Fish() {
  return (
    <PetCategoryBrowser
      category="Fish"
      title="Fish"
      itemLabel="Fish"
      accentClass="text-sky-700"
      accentSoftClass="border-sky-200 hover:bg-sky-50"
      accentRingClass="accent-sky-600"
      summaryGradientClass="from-sky-100 to-teal-100"
      pageGradientClass="from-sky-50 via-white to-teal-50"
      buttonGradientClass="from-sky-500 to-teal-500"
    />
  );
}
