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
  IsNumberValidId,
  ValidCalculationModalTabs,
  ValidateShownPropertiesString,
  NumNewSetsOptionList,
  ValidateDefaultLoadExerciseOptionsString,
  ValidateLoadExerciseOptionsCategoriesString,
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

  if (IsNumberNegativeOrInfinity(userSettings.id)) return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_weight))
    return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_distance))
    return false;

  if (
    !IsNumberValidAndAbove0(userSettings.default_increment_time) ||
    !IsNumberValidId(userSettings.default_increment_time)
  )
    return false;

  if (!IsNumberValidAndAbove0(userSettings.default_increment_resistance_level))
    return false;

  if (!IsNumberValidBinary(userSettings.save_calculation_string)) return false;

  if (!IsNumberValidBinary(userSettings.show_calculation_buttons)) return false;

  if (
    !IsNumberValidAndAbove0(
      userSettings.default_increment_calculation_multiplier
    )
  )
    return false;

  if (
    !ValidCalculationModalTabs().includes(userSettings.default_calculation_tab)
  )
    return false;

  if (
    !ValidateShownPropertiesString(
      userSettings.shown_workout_properties,
      "workout"
    )
  )
    return false;

  if (!IsNumberValidId(userSettings.default_plate_collection_id)) return false;

  if (!IsNumberValidBinary(userSettings.show_secondary_exercise_groups))
    return false;

  if (
    !IsNumberValidBinary(userSettings.automatically_update_active_measurements)
  )
    return false;

  if (!NumNewSetsOptionList().includes(userSettings.default_num_new_sets))
    return false;

  if (
    !ValidateShownPropertiesString(
      userSettings.shown_time_period_properties,
      "time-period"
    )
  )
    return false;

  if (!IsNumberValidBinary(userSettings.default_diet_log_day_is_yesterday))
    return false;

  if (
    !ValidateDefaultLoadExerciseOptionsString(
      userSettings.load_exercise_options_analytics
    )
  )
    return false;

  if (
    !ValidateDefaultLoadExerciseOptionsString(
      userSettings.load_exercise_options_exercise_details
    )
  )
    return false;

  if (!IsNumberValidBinary(userSettings.show_warmups_in_exercise_details))
    return false;

  if (!IsNumberValidBinary(userSettings.show_multisets_in_exercise_details))
    return false;

  if (
    !ValidateLoadExerciseOptionsCategoriesString(
      userSettings.load_exercise_options_categories_analytics
    )
  )
    return false;

  if (
    !ValidateLoadExerciseOptionsCategoriesString(
      userSettings.load_exercise_options_categories_exercise_details
    )
  )
    return false;

  return true;
};
