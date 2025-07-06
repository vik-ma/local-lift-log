import { useMemo, useState } from "react";
import { DefaultIncrementInputs, UseSettingsListReturnType } from "../typings";
import { usePresetsList } from ".";

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

  const presetsList = usePresetsList(false, false);

  const [defaultIncrementInputValues, setDefaultIncrementInputValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);
  const [defaultIncrementOriginalValues, setDefaultIncrementOriginalValues] =
    useState<DefaultIncrementInputs>(emptyDefaultIncrementValues);

  return {
    defaultIncrementInputValues,
    setDefaultIncrementInputValues,
    defaultIncrementOriginalValues,
    setDefaultIncrementOriginalValues,
    presetsList,
    timeInSeconds,
    setTimeInSeconds,
    selectedTimePeriodProperties,
    setSelectedTimePeriodProperties,
    selectedWorkoutProperties,
    setSelectedWorkoutProperties,
  };
};
