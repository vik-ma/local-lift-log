import {
  GetValidatedUnit,
  LocaleMap,
  ValidateAndModifyIncrementMultipliers,
  ValidateAndModifyTimeInputBehavior,
} from "..";
import { UserSettings } from "../../typings";

type UserSettingsPropsToValidate =
  | "default_unit_weight"
  | "default_unit_distance"
  | "default_unit_measurement"
  | "locale"
  | "time_input"
  | "increment_multipliers";

export const ValidateAndModifyUserSettings = (
  userSettings: UserSettings,
  settingsToValidate: Set<UserSettingsPropsToValidate>
) => {
  for (const settings of settingsToValidate) {
    switch (settings) {
      case "default_unit_weight": {
        userSettings.default_unit_weight = GetValidatedUnit(
          userSettings.default_unit_weight,
          "weight"
        );

        break;
      }
      case "default_unit_distance": {
        userSettings.default_unit_distance = GetValidatedUnit(
          userSettings.default_unit_distance,
          "distance"
        );

        break;
      }
      case "default_unit_measurement": {
        userSettings.default_unit_measurement = GetValidatedUnit(
          userSettings.default_unit_measurement,
          "circumference"
        );

        break;
      }
      case "locale": {
        const localeMap = LocaleMap();

        if (!localeMap.has(userSettings.locale)) {
          userSettings.locale = localeMap.keys().next().value!;
        }

        break;
      }
      case "time_input": {
        ValidateAndModifyTimeInputBehavior(userSettings);
        break;
      }
      case "increment_multipliers": {
        ValidateAndModifyIncrementMultipliers(userSettings);
        break;
      }
      default:
        break;
    }
  }
};
