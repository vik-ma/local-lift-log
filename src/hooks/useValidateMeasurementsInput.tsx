import { useState } from "react";
import { IsStringInvalidNumber } from "../helpers";

export const useValidateMeasurementsInput = () => {
  const [invalidMeasurementInputs, setInvalidMeasurementInputs] = useState<
    Set<number>
  >(new Set<number>());

  const validateActiveMeasurementInput = (value: string, index: number) => {
    const updatedSet = new Set(invalidMeasurementInputs);
    if (IsStringInvalidNumber(value)) {
      updatedSet.add(index);
    } else {
      updatedSet.delete(index);
    }

    setInvalidMeasurementInputs(updatedSet);
  };

  return {
    invalidMeasurementInputs,
    validateActiveMeasurementInput,
  };
};
