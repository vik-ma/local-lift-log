import { IsNumberValid, IsNumberValidInteger } from "..";
import { UserSettings } from "../../typings";

export const ValidateAndModifyIncrementMultipliers = (
  userSettings: UserSettings
) => {
  if (!IsNumberValid(userSettings.default_increment_weight, 0, true))
    userSettings.default_increment_weight = 1;

  if (!IsNumberValid(userSettings.default_increment_distance, 0, true))
    userSettings.default_increment_distance = 1;

  if (!IsNumberValidInteger(userSettings.default_increment_time, 0, true))
    userSettings.default_increment_time = 1;

  if (!IsNumberValid(userSettings.default_increment_resistance_level, 0, true))
    userSettings.default_increment_resistance_level = 1;

  if (
    !IsNumberValid(
      userSettings.default_increment_calculation_multiplier,
      0,
      true
    )
  )
    userSettings.default_increment_calculation_multiplier = 1;
};
