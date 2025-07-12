import { useMemo, useState } from "react";
import { DefaultIncrementInputs, UseSettingsListReturnType } from "../typings";

export const useSettingsList = (): UseSettingsListReturnType => {
  const [selectedWorkoutProperties, setSelectedWorkoutProperties] = useState<
    Set<string>
  >(new Set());
  const [selectedTimePeriodProperties, setSelectedTimePeriodProperties] =
    useState<Set<string>>(new Set());
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
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
    selectedWorkoutProperties,
    setSelectedWorkoutProperties,
  };
};
