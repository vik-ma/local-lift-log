import { useState, useMemo } from "react";
import {
  ConvertNullToEmptyInputString,
  ConvertNumberToInputString,
  IsNumberValidInteger,
  IsStringInvalidInteger,
  IsStringInvalidNumber,
} from "../helpers";
import {
  SetTrackingValuesInput,
  SetTrackingValuesInvalidity,
  WorkoutSet,
  UseSetTrackingInputsReturnType,
} from "../typings";
import { DEFAULT_SET_VALUES_INPUT } from "../constants";

const MIN_VALUE_DEFAULT = 0;
const MIN_VALUE_RIR = -1;
const DO_NOT_ALLOW_MIN_VALUE_DEFAULT = false;
const DO_NOT_ALLOW_MIN_VALUE_RIR = true;
const DO_NOT_ALLOW_MIN_VALUE_RPE = true;
const DO_NOT_ALLOW_MIN_VALUE_USER_WEIGHT = true;
const MAX_VALUE_DEFAULT = undefined;
const MAX_VALUE_RPE = 10;
const ALLOW_EMPTY_STRING = true;
const IS_INTEGER = true;

export const useSetTrackingInputs = (): UseSetTrackingInputsReturnType => {
  const [isTimeInputInvalid, setIsTimeInputInvalid] = useState<boolean>(false);
  const [isSetEdited, setIsSetEdited] = useState<boolean>(false);
  const [uneditedSet, setUneditedSet] = useState<WorkoutSet>();
  const [isValuesAccordionExpanded, setIsValuesAccordionExpanded] =
    useState<boolean>(false);
  const [setNoteInput, setSetNoteInput] = useState<string>("");
  const [timeInSeconds, setTimeInSeconds] = useState<number>(0);
  const [setTrackingValuesInput, setSetTrackingValuesInput] =
    useState<SetTrackingValuesInput>(DEFAULT_SET_VALUES_INPUT);

  const setInputsInvalidityMap = useMemo((): SetTrackingValuesInvalidity => {
    const values: SetTrackingValuesInvalidity = {
      weight: IsStringInvalidNumber(setTrackingValuesInput.weight),
      reps: IsStringInvalidInteger(setTrackingValuesInput.reps),
      rir: IsStringInvalidInteger(setTrackingValuesInput.rir),
      rpe: IsStringInvalidInteger(
        setTrackingValuesInput.rpe,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_RPE,
        MAX_VALUE_RPE,
        ALLOW_EMPTY_STRING
      ),
      distance: IsStringInvalidNumber(setTrackingValuesInput.distance),
      resistance_level: IsStringInvalidNumber(
        setTrackingValuesInput.resistance_level
      ),
      partial_reps: IsStringInvalidInteger(setTrackingValuesInput.partial_reps),
      user_weight: IsStringInvalidNumber(
        setTrackingValuesInput.user_weight,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_USER_WEIGHT,
        MAX_VALUE_DEFAULT,
        ALLOW_EMPTY_STRING
      ),
    };
    return values;
  }, [setTrackingValuesInput]);

  const isSetTrackingValuesInvalid = useMemo(() => {
    for (const value of Object.values(setInputsInvalidityMap)) {
      if (value === true) return true;
    }
    if (isTimeInputInvalid) return true;
    return false;
  }, [setInputsInvalidityMap, isTimeInputInvalid]);

  const assignSetTrackingValuesInputs = (set: WorkoutSet) => {
    const newSetTrackingValuesInput = {
      weight: ConvertNumberToInputString(
        set.weight,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_DEFAULT,
        MAX_VALUE_DEFAULT
      ),
      reps: ConvertNumberToInputString(
        set.reps,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_DEFAULT,
        MAX_VALUE_DEFAULT,
        IS_INTEGER
      ),
      rir: ConvertNumberToInputString(
        set.rir,
        MIN_VALUE_RIR,
        DO_NOT_ALLOW_MIN_VALUE_RIR,
        MAX_VALUE_DEFAULT,
        IS_INTEGER
      ),
      rpe: ConvertNumberToInputString(
        set.rpe,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_RPE,
        MAX_VALUE_RPE,
        IS_INTEGER
      ),
      distance: ConvertNumberToInputString(
        set.distance,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_DEFAULT,
        MAX_VALUE_DEFAULT
      ),
      resistance_level: ConvertNumberToInputString(
        set.resistance_level,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_DEFAULT,
        MAX_VALUE_DEFAULT
      ),
      partial_reps: ConvertNumberToInputString(
        set.partial_reps,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_DEFAULT,
        MAX_VALUE_DEFAULT,
        IS_INTEGER
      ),
      user_weight: ConvertNumberToInputString(
        set.user_weight,
        MIN_VALUE_DEFAULT,
        DO_NOT_ALLOW_MIN_VALUE_USER_WEIGHT
      ),
    };

    setSetTrackingValuesInput(newSetTrackingValuesInput);

    const time = IsNumberValidInteger(set.time_in_seconds)
      ? set.time_in_seconds
      : 0;

    setTimeInSeconds(time);

    setSetNoteInput(ConvertNullToEmptyInputString(set.note));
  };

  const handleSetNoteInputChange = (value: string) => {
    setSetNoteInput(value);

    if (!isSetEdited) setIsSetEdited(true);
  };

  const clearSetInputValues = () => {
    setSetTrackingValuesInput(DEFAULT_SET_VALUES_INPUT);
    setTimeInSeconds(0);
  };

  const areInputsEmpty = useMemo(() => {
    return (
      setTrackingValuesInput === DEFAULT_SET_VALUES_INPUT && timeInSeconds === 0
    );
  }, [setTrackingValuesInput, timeInSeconds]);

  return {
    isSetTrackingValuesInvalid,
    setInputsInvalidityMap,
    setTrackingValuesInput,
    setSetTrackingValuesInput,
    isTimeInputInvalid,
    setIsTimeInputInvalid,
    assignSetTrackingValuesInputs,
    isSetEdited,
    setIsSetEdited,
    isValuesAccordionExpanded,
    setIsValuesAccordionExpanded,
    uneditedSet,
    setUneditedSet,
    setNoteInput,
    setSetNoteInput,
    handleSetNoteInputChange,
    clearSetInputValues,
    timeInSeconds,
    setTimeInSeconds,
    areInputsEmpty,
  };
};
