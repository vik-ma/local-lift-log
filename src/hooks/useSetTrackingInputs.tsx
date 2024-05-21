import { useState, useMemo } from "react";
import {
  DefaultSetInputValues,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
} from "../helpers";
import {
  SetTrackingValuesInput,
  SetTrackingValuesValidity,
  WorkoutSet,
} from "../typings";

type UseSetTrackingInputsReturnType = {
  isSetDefaultValuesInvalid: boolean;
  setInputsValidityMap: SetTrackingValuesValidity;
  setTrackingValuesInput: SetTrackingValuesInput;
  setSetTrackingValuesInput: React.Dispatch<
    React.SetStateAction<SetTrackingValuesInput>
  >;
  setIsTimeInputInvalid: React.Dispatch<React.SetStateAction<boolean>>;
  setDefaultValuesInputStrings: (set: WorkoutSet) => void;
};

export const useSetTrackingInputs = (): UseSetTrackingInputsReturnType => {
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

  const isSetDefaultValuesInvalid = useMemo((): boolean => {
    for (const value of Object.values(setInputsValidityMap)) {
      if (value === true) return true;
    }
    if (isTimeInputInvalid) return true;
    return false;
  }, [setInputsValidityMap, isTimeInputInvalid]);

  const setDefaultValuesInputStrings = (set: WorkoutSet) => {
    const newSetTrackingValuesInput = {
      weight:
        set.is_tracking_weight && set.weight !== 0 ? set.weight.toString() : "",
      reps: set.is_tracking_reps && set.reps !== 0 ? set.reps.toString() : "",
      rir: set.is_tracking_rir && set.rir !== 0 ? set.rir.toString() : "",
      rpe: set.is_tracking_rpe && set.rpe !== 0 ? set.rpe.toString() : "",
      distance:
        set.is_tracking_distance && set.distance !== 0
          ? set.distance.toString()
          : "",
      resistance_level:
        set.is_tracking_resistance_level && set.resistance_level !== 0
          ? set.resistance_level.toString()
          : "",
    };
    setSetTrackingValuesInput(newSetTrackingValuesInput);
  };

  return {
    isSetDefaultValuesInvalid,
    setInputsValidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setIsTimeInputInvalid,
    setDefaultValuesInputStrings,
  };
};

export default useSetTrackingInputs;