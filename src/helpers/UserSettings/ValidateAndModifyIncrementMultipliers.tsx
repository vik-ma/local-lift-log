import { IsNumberValid, IsNumberValidInteger } from "..";
import { UserSettings } from "../../typings";

export const ValidateAndModifyIncrementMultipliers = (
  userSettings: UserSettings
) => {
  const minValue = 0;
  const doNotAllowMinValue = true;

  if (
    !IsNumberValid(
      userSettings.default_increment_weight,
      minValue,
      doNotAllowMinValue
    )
  )
    userSettings.default_increment_weight = 1;

  if (
    !IsNumberValid(
      userSettings.default_increment_distance,
      minValue,
      doNotAllowMinValue
    )
  )
    userSettings.default_increment_distance = 1;

  if (
    !IsNumberValidInteger(
      userSettings.default_increment_time,
      minValue,
      doNotAllowMinValue
    )
  )
    userSettings.default_increment_time = 60;

  if (
    !IsNumberValid(
      userSettings.default_increment_resistance_level,
      minValue,
      doNotAllowMinValue
    )
  )
    userSettings.default_increment_resistance_level = 1;

  if (
    !IsNumberValid(
      userSettings.default_increment_calculation_multiplier,
      minValue,
      doNotAllowMinValue
    )
  )
    userSettings.default_increment_calculation_multiplier = 1;
};
