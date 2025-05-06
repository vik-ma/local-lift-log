import { useState } from "react";
import { UseBodyFatCalculationSettingsReturnType } from "../typings";

export const useBodyFatCalculationSettings =
  (): UseBodyFatCalculationSettingsReturnType => {
    const [isMale, setIsMale] = useState<boolean>(true);
    const [ageGroup, setAgeGroup] = useState<string>("20-29");

    return {
      isMale,
      setIsMale,
      ageGroup,
      setAgeGroup,
    };
  };
