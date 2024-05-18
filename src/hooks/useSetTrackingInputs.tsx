import { useState, useMemo } from "react";
import {
  DefaultSetInputValues,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
} from "../helpers";
import { SetTrackingValuesInput, SetTrackingValuesValidity } from "../typings";

export const useSetTrackingInputs = () => {
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const defaultSetTrackingValuesInput: SetTrackingValuesInput =
    DefaultSetInputValues();
  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetTrackingValuesInput);

  const setInputsValidityMap = useMemo((): SetTrackingValuesValidity => {
    const values: SetTrackingValuesValidity = {
      weight: IsStringInvalidNumber(setTrackingValuesInput.weight),
      reps: IsStringInvalidInteger(setTrackingValuesInput.reps),
      rir: IsStringInvalidInteger(setTrackingValuesInput.rir),
      rpe: IsStringInvalidNumberOrAbove10(setTrackingValuesInput.rpe),
      distance: IsStringInvalidNumber(setTrackingValuesInput.distance),
      resistance_level: IsStringInvalidNumber(
        setTrackingValuesInput.resistance_level
      ),
    };
    return values;
  }, [setTrackingValuesInput]);

  const isSetDefaultValuesInvalid = useMemo(() => {
    for (const value of Object.values(setInputsValidityMap)) {
      if (value === true) return true;
    }
    if (isTimeInputInvalid) return true;
    return false;
  }, [setInputsValidityMap, isTimeInputInvalid]);

  return {
    isSetDefaultValuesInvalid,
    setInputsValidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setIsTimeInputInvalid,
  };
};

export default useSetTrackingInputs;
