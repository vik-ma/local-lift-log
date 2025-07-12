import { useState, useEffect } from "react";
import { UserSettings, DefaultIncrementInputs } from "../typings";
import {
  GetUserSettings,
  CreateShownPropertiesSet,
  ConvertNumberToInputString,
  GetValidatedUnit,
  ValidateAndModifyIncrementMultipliers,
  ValidateAndModifyTimeInputBehavior,
} from "../helpers";
import { LoadingSpinner, SettingsList } from "../components";
import { useSettingsList } from "../hooks";

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const settingsList = useSettingsList();

  const {
    setDefaultIncrementInputValues,
    setDefaultIncrementOriginalValues,
    setTimeInSeconds,
    setSelectedTimePeriodProperties,
    setSelectedWorkoutProperties,
  } = settingsList;

  useEffect(() => {
    const loadUserSettings = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyIncrementMultipliers(userSettings);
      ValidateAndModifyTimeInputBehavior(userSettings);

      const weightUnit = GetValidatedUnit(
        userSettings.default_unit_weight,
        "weight"
      );
      const distanceUnit = GetValidatedUnit(
        userSettings.default_unit_distance,
        "distance"
      );
      const measurementUnit = GetValidatedUnit(
        userSettings.default_unit_measurement,
        "circumference"
      );

      userSettings.default_unit_weight = weightUnit;
      userSettings.default_unit_distance = distanceUnit;
      userSettings.default_unit_measurement = measurementUnit;

      setUserSettings(userSettings);

      const defaultIncrementValues: DefaultIncrementInputs = {
        weight: ConvertNumberToInputString(
          userSettings.default_increment_weight,
          0,
          true,
          undefined,
          false,
          "1"
        ),
        distance: ConvertNumberToInputString(
          userSettings.default_increment_distance,
          0,
          true,
          undefined,
          false,
          "1"
        ),
        time: userSettings.default_increment_time,
        resistanceLevel: ConvertNumberToInputString(
          userSettings.default_increment_resistance_level,
          0,
          true,
          undefined,
          false,
          "1"
        ),
        calculationMultiplier: ConvertNumberToInputString(
          userSettings.default_increment_calculation_multiplier,
          0,
          true,
          undefined,
          false,
          "1"
        ),
      };

      setDefaultIncrementInputValues(defaultIncrementValues);
      setDefaultIncrementOriginalValues({ ...defaultIncrementValues });
      setTimeInSeconds(userSettings.default_increment_time);

      const workoutPropertySet = CreateShownPropertiesSet(
        userSettings.shown_workout_properties,
        "workout"
      );
      setSelectedWorkoutProperties(workoutPropertySet);

      const timePeriodPropertySet = CreateShownPropertiesSet(
        userSettings.shown_time_period_properties,
        "time-period"
      );
      setSelectedTimePeriodProperties(timePeriodPropertySet);
    };

    loadUserSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (userSettings === undefined) return <LoadingSpinner />;

  return (
    <SettingsList
      userSettings={userSettings}
      setUserSettings={setUserSettings}
      useSettingsList={settingsList}
    />
  );
}
