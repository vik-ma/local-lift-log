import { UserSettings } from "../../typings";
import {
  IsNumberNegativeOrInfinity,
  IsNumberValidBinary,
  ValidDistanceUnits,
  ValidMeasurementUnits,
  ValidTimeInputs,
  ValidWeightUnits,
  ValidateActiveMeasurementsString,
  LocaleList,
  ValidClockStyles,
  ValidTimeInputBehaviors,
  IsNumberValidAndAbove0,
} from "..";

export const ValidateUserSettings = (userSettings: UserSettings): boolean => {
  if (!IsNumberValidBinary(userSettings.show_timestamp_on_completed_set))
    return false;

  if (IsNumberNegativeOrInfinity(userSettings.active_routine_id)) return false;

  if (!ValidWeightUnits().includes(userSettings.default_unit_weight))
    return false;

  if (!ValidDistanceUnits().includes(userSettings.default_unit_distance))
    return false;

  if (!ValidTimeInputs().includes(userSettings.default_time_input))
    return false;

  if (!ValidMeasurementUnits().includes(userSettings.default_unit_measurement))
    return false;

  if (
    !ValidateActiveMeasurementsString(userSettings.active_tracking_measurements)
  )
    return false;

  if (!LocaleList().some((item) => item.code === userSettings.locale))
    return false;

  if (!ValidClockStyles().includes(userSettings.clock_style)) return false;

  if (
    !ValidTimeInputBehaviors(true).some(
      (item) => item.key === userSettings.time_input_behavior_hhmmss
    )
  )
    return false;

  if (
    !ValidTimeInputBehaviors(false).some(
      (item) => item.key === userSettings.time_input_behavior_mmss
    )
  )
    return false;

  if (!IsNumberValidBinary(userSettings.show_workout_rating)) return false;

  if (IsNumberNegativeOrInfinity(userSettings.id)) return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_weight))
    return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_distance))
    return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_time))
    return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_resistance_level))
    return false;

  return true;
};
