import React from "react";
import PetCategoryBrowser from "../../components/PetCategoryBrowser";

export default function Dog() {
  return (
    <PetCategoryBrowser
      category="Dog"
      title="Dogs"
      itemLabel="Dogs"
      accentClass="text-amber-700"
      accentSoftClass="border-amber-200 hover:bg-amber-50"
      accentRingClass="accent-amber-600"
      summaryGradientClass="from-amber-100 to-yellow-100"
      pageGradientClass="from-amber-50 via-white to-yellow-50"
      buttonGradientClass="from-amber-500 to-yellow-500"
    />
  );
}
