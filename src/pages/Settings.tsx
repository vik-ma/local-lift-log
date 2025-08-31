import { useState, useEffect } from "react";
import { UserSettings, DefaultIncrementInputs } from "../typings";
import {
  GetUserSettings,
  ConvertNumberToInputString,
  ValidateAndModifyIncrementMultipliers,
  ValidateAndModifyTimeInputBehavior,
  ValidateAndModifyUserSettings,
  ValidateAndModifyLocale,
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
  } = settingsList;

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyIncrementMultipliers(userSettings);
      ValidateAndModifyTimeInputBehavior(userSettings);
      ValidateAndModifyUserSettings(
        userSettings,
        new Set(["weight", "distance", "measurement"])
      );
      ValidateAndModifyLocale(userSettings);

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
    };

    loadPage();
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
