import { useState } from "react";
import { DefaultIncrementInputs, UseSettingsListReturnType } from "../typings";
import { EMPTY_DEFAULT_INCREMENT_VALUES } from "../constants";

export const useSettingsList = (): UseSettingsListReturnType => {
  const [timeInSeconds, setTimeInSeconds] = useState<number>(0);

  const emptyDefaultIncrementValues = EMPTY_DEFAULT_INCREMENT_VALUES;

  const [defaultIncrementInputValues, setDefaultIncrementInputValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);
  const [defaultIncrementOriginalValues, setDefaultIncrementOriginalValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  return {
    defaultIncrementInputValues,
    setDefaultIncrementInputValues,
    defaultIncrementOriginalValues,
    setDefaultIncrementOriginalValues,
    timeInSeconds,
    setTimeInSeconds,
  };
};
