import { useState, useMemo } from "react";
import {
  ConvertNumberToInputString,
  DefaultSetInputValues,
  IsStringEmpty,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
  IsStringInvalidNumberOrAbove10,
} from "../helpers";
import {
  SetTrackingValuesInput,
  SetTrackingValuesInvalidity,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
} from "../typings";

export const useSetTrackingInputs = (): UseSetTrackingInputsReturnType => {
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [isSetEdited, setIsSetEdited] = useState<boolean>(false);
  const [uneditedSet, setUneditedSet] = useState<WorkoutSet>();

  const defaultSetTrackingValuesInput: SetTrackingValuesInput = useMemo(() => {
    return DefaultSetInputValues();
  }, []);

  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(defaultSetTrackingValuesInput);

  const setInputsInvalidityMap = useMemo((): SetTrackingValuesInvalidity => {
    const values: SetTrackingValuesInvalidity = {
      weight:
        !IsStringEmpty(setTrackingValuesInput.weight) &&
        IsStringInvalidNumber(setTrackingValuesInput.weight),
      reps:
        !IsStringEmpty(setTrackingValuesInput.reps) &&
        IsStringInvalidInteger(setTrackingValuesInput.reps),
      rir:
        !IsStringEmpty(setTrackingValuesInput.rir) &&
        IsStringInvalidInteger(setTrackingValuesInput.rir),
      rpe:
        !IsStringEmpty(setTrackingValuesInput.rpe) &&
        IsStringInvalidNumberOrAbove10(setTrackingValuesInput.rpe),
      distance:
        !IsStringEmpty(setTrackingValuesInput.distance) &&
        IsStringInvalidNumber(setTrackingValuesInput.distance),
      resistance_level:
        !IsStringEmpty(setTrackingValuesInput.resistance_level) &&
        IsStringInvalidNumber(setTrackingValuesInput.resistance_level),
      partial_reps:
        !IsStringEmpty(setTrackingValuesInput.partial_reps) &&
        IsStringInvalidInteger(setTrackingValuesInput.partial_reps),
      user_weight:
        !IsStringEmpty(setTrackingValuesInput.user_weight) &&
        IsStringInvalidNumber(setTrackingValuesInput.user_weight),
    };
    return values;
  }, [setTrackingValuesInput]);

  const isSetTrackingValuesInvalid = useMemo((): boolean => {
    for (const value of Object.values(setInputsInvalidityMap)) {
      if (value === true) return true;
    }
    if (isTimeInputInvalid) return true;
    return false;
  }, [setInputsInvalidityMap, isTimeInputInvalid]);

  const setTrackingValuesInputStrings = (set: WorkoutSet) => {
    const newSetTrackingValuesInput = {
      weight: ConvertNumberToInputString(set.weight),
      reps: ConvertNumberToInputString(set.reps),
      rir: ConvertNumberToInputString(set.rir, true),
      rpe: ConvertNumberToInputString(set.rpe),
      distance: ConvertNumberToInputString(set.distance),
      resistance_level: ConvertNumberToInputString(set.resistance_level),
      partial_reps: ConvertNumberToInputString(set.partial_reps),
      user_weight: ConvertNumberToInputString(set.user_weight),
    };
    setSetTrackingValuesInput(newSetTrackingValuesInput);
  };

  return {
    isSetTrackingValuesInvalid,
    setInputsInvalidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    isTimeInputInvalid,
    setIsTimeInputInvalid,
    setTrackingValuesInputStrings,
    isSetEdited,
    setIsSetEdited,
    uneditedSet,
    setUneditedSet,
  };
};
