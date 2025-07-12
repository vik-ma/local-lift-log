import { useMemo, useState } from "react";
import { DefaultIncrementInputs, UseSettingsListReturnType } from "../typings";

export const useSettingsList = (): UseSettingsListReturnType => {
  const [timeInSeconds, setTimeInSeconds] = useState<number>(0);

  const emptyDefaultIncrementValues: DefaultIncrementInputs = useMemo(() => {
    return {
      weight: "",
      distance: "",
      time: 0,
      resistanceLevel: "",
      calculationMultiplier: "",
    };
  }, []);

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
