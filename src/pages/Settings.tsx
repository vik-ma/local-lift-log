import { useState, useEffect } from "react";
import { UserSettings, DefaultIncrementInputs } from "../typings";
import {
  GetUserSettings,
  ConvertNumberToInputString,
  ValidateAndModifyUserSettings,
} from "../helpers";
import { LoadingSpinner, SettingsList } from "../components";
import { useDefaultIncrementValues } from "../hooks";

const DEFAULT_INCREMENT_MIN_VALUE = 0;
const DEFAULT_INCREMENT_DO_NOT_ALLOW_MIN_VALUE = true;
const DEFAULT_INCREMENT_MAX_VALUE = undefined;
const DEFAULT_INCREMENT_IS_INTEGER = false;
const DEFAULT_INCREMENT_DEFAULT_INVALID_VALUE = "1";

export default function Settings() {
  const [userSettings, setUserSettings] = useState<UserSettings>();

  const defaultIncrementValuesInput = useDefaultIncrementValues();

  const {
    setDefaultIncrementInputValues,
    setDefaultIncrementOriginalValues,
    setTimeInSeconds,
  } = defaultIncrementValuesInput;

  useEffect(() => {
    const loadPage = async () => {
      const userSettings = await GetUserSettings();

      if (userSettings === undefined) return;

      ValidateAndModifyUserSettings(
        userSettings,
        new Set([
          "default_unit_weight",
          "default_unit_distance",
          "default_unit_measurement",
          "locale",
          "time_input",
          "increment_multipliers",
        ])
      );

      setUserSettings(userSettings);

      const defaultIncrementValues: DefaultIncrementInputs = {
        weight: ConvertNumberToInputString(
          userSettings.default_increment_weight,
          DEFAULT_INCREMENT_MIN_VALUE,
          DEFAULT_INCREMENT_DO_NOT_ALLOW_MIN_VALUE,
          DEFAULT_INCREMENT_MAX_VALUE,
          DEFAULT_INCREMENT_IS_INTEGER,
          DEFAULT_INCREMENT_DEFAULT_INVALID_VALUE
        ),
        distance: ConvertNumberToInputString(
          userSettings.default_increment_distance,
          DEFAULT_INCREMENT_MIN_VALUE,
          DEFAULT_INCREMENT_DO_NOT_ALLOW_MIN_VALUE,
          DEFAULT_INCREMENT_MAX_VALUE,
          DEFAULT_INCREMENT_IS_INTEGER,
          DEFAULT_INCREMENT_DEFAULT_INVALID_VALUE
        ),
        time: userSettings.default_increment_time,
        resistanceLevel: ConvertNumberToInputString(
          userSettings.default_increment_resistance_level,
          DEFAULT_INCREMENT_MIN_VALUE,
          DEFAULT_INCREMENT_DO_NOT_ALLOW_MIN_VALUE,
          DEFAULT_INCREMENT_MAX_VALUE,
          DEFAULT_INCREMENT_IS_INTEGER,
          DEFAULT_INCREMENT_DEFAULT_INVALID_VALUE
        ),
        calculationMultiplier: ConvertNumberToInputString(
          userSettings.default_increment_calculation_multiplier,
          DEFAULT_INCREMENT_MIN_VALUE,
          DEFAULT_INCREMENT_DO_NOT_ALLOW_MIN_VALUE,
          DEFAULT_INCREMENT_MAX_VALUE,
          DEFAULT_INCREMENT_IS_INTEGER,
          DEFAULT_INCREMENT_DEFAULT_INVALID_VALUE
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
      useDefaultIncrementValues={defaultIncrementValuesInput}
    />
  );
}
