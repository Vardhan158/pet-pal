import React from "react";
import PetCategoryBrowser from "../components/PetCategoryBrowser";

export default function Cat() {
  return (
    <PetCategoryBrowser
      category="Cat"
      title="Cats"
      itemLabel="Cats"
      accentClass="text-rose-700"
      accentSoftClass="border-rose-200 hover:bg-rose-50"
      accentRingClass="accent-rose-600"
      summaryGradientClass="from-rose-100 to-orange-100"
      pageGradientClass="from-rose-50 via-white to-orange-50"
      buttonGradientClass="from-rose-500 to-orange-500"
    />
  );
}
