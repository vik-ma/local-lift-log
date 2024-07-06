import { useState, useMemo, useCallback } from "react";
import {
  DefaultSetInputValues,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
  IsStringInvalidIntegerOrBelowMinus1,
} from "../helpers";
import {
  SetTrackingValuesInput,
  SetTrackingValuesValidity,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
} from "../typings";

export const useSetTrackingInputs = (): UseSetTrackingInputsReturnType => {
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);

  const defaultSetTrackingValuesInput: SetTrackingValuesInput = useMemo(() => {
    return DefaultSetInputValues();
  }, []);

  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetTrackingValuesInput);

  const setInputsValidityMap = useMemo((): SetTrackingValuesValidity => {
    const values: SetTrackingValuesValidity = {
      weight: IsStringInvalidNumber(setTrackingValuesInput.weight),
      reps: IsStringInvalidInteger(setTrackingValuesInput.reps),
      rir: IsStringInvalidIntegerOrBelowMinus1(setTrackingValuesInput.rir),
      rpe: IsStringInvalidNumberOrAbove10(setTrackingValuesInput.rpe),
      distance: IsStringInvalidNumber(setTrackingValuesInput.distance),
      resistance_level: IsStringInvalidNumber(
        setTrackingValuesInput.resistance_level
      ),
      partial_reps: IsStringInvalidInteger(setTrackingValuesInput.partial_reps),
    };
    return values;
  }, [setTrackingValuesInput]);

  const isSetTrackingValuesInvalid = useMemo((): boolean => {
    for (const value of Object.values(setInputsValidityMap)) {
      if (value === true) return true;
    }
    if (isTimeInputInvalid) return true;
    return false;
  }, [setInputsValidityMap, isTimeInputInvalid]);

  const setTrackingValuesInputStrings = useCallback((set: WorkoutSet) => {
    const newSetTrackingValuesInput = {
      weight:
        set.is_tracking_weight && set.weight !== 0 ? set.weight.toString() : "",
      reps: set.is_tracking_reps && set.reps !== 0 ? set.reps.toString() : "",
      rir: set.is_tracking_rir && set.rir !== -1 ? set.rir.toString() : "",
      rpe: set.is_tracking_rpe && set.rpe !== 0 ? set.rpe.toString() : "",
      distance:
        set.is_tracking_distance && set.distance !== 0
          ? set.distance.toString()
          : "",
      resistance_level:
        set.is_tracking_resistance_level && set.resistance_level !== 0
          ? set.resistance_level.toString()
          : "",
      partial_reps:
        set.is_tracking_partial_reps && set.partial_reps !== 0
          ? set.partial_reps.toString()
          : "",
    };
    setSetTrackingValuesInput(newSetTrackingValuesInput);
  }, []);

  return {
    isSetTrackingValuesInvalid,
    setInputsValidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    setIsTimeInputInvalid,
    setTrackingValuesInputStrings,
  };
};
