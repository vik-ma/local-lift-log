import { useState, useMemo } from "react";
import { IsStringInvalidNumber } from "../helpers";
import { Measurement } from "../typings";

export const useValidateMeasurementsInput = (
  activeMeasurements: Measurement[]
) => {
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

  const areActiveMeasurementsInputsEmpty = useMemo(() => {
    let isEmpty: boolean = true;

    let i = 0;
    while (isEmpty && i < activeMeasurements.length) {
      if (activeMeasurements[i].input!.trim().length !== 0) isEmpty = false;
      i++;
    }

    return isEmpty;
  }, [activeMeasurements]);

  return {
    invalidMeasurementInputs,
    validateActiveMeasurementInput,
    areActiveMeasurementsInputsEmpty,
  };
};
