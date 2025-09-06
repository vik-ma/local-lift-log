import { useState } from "react";
import {
  DefaultIncrementInputs,
  UseDefaultIncrementValuesReturnType,
} from "../typings";
import { EMPTY_DEFAULT_INCREMENT_VALUES } from "../constants";

export const useDefaultIncrementValues =
  (): UseDefaultIncrementValuesReturnType => {
    const [timeInSeconds, setTimeInSeconds] = useState<number>(0);
    const [defaultIncrementInputValues, setDefaultIncrementInputValues] =
      useState<DefaultIncrementInputs>(EMPTY_DEFAULT_INCREMENT_VALUES);
    const [defaultIncrementOriginalValues, setDefaultIncrementOriginalValues] =
      useState<DefaultIncrementInputs>(EMPTY_DEFAULT_INCREMENT_VALUES);

    return {
      defaultIncrementInputValues,
      setDefaultIncrementInputValues,
      defaultIncrementOriginalValues,
      setDefaultIncrementOriginalValues,
      timeInSeconds,
      setTimeInSeconds,
    };
  };
