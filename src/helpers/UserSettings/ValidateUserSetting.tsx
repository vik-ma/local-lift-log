import {
  IsNumberValidAndAbove0,
  IsNumberValidBinary,
  IsNumberValidId,
  IsNumberValidIdOr0,
  LocaleList,
  NumNewSetsOptionList,
  ValidateActiveMeasurementsString,
  ValidateShownPropertiesString,
  ValidCalculationModalTabs,
  ValidClockStyles,
  ValidDistanceUnits,
  ValidMeasurementUnits,
  ValidTimeInputBehaviors,
  ValidTimeInputs,
  ValidWeightUnits,
} from "..";
import { UserSettings } from "../../typings";

export const ValidateUserSetting = <K extends keyof UserSettings>(
  userSetting: K,
  value: UserSettings[K]
) => {
  switch (userSetting) {
    case "show_timestamp_on_completed_set":
      return IsNumberValidBinary(value as number);
    case "active_routine_id":
      return IsNumberValidIdOr0(value as number);
    case "default_unit_weight":
      return ValidWeightUnits().includes(value as string);
    case "default_unit_distance":
      return ValidDistanceUnits().includes(value as string);
    case "default_time_input":
      return ValidTimeInputs().includes(value as string);
    case "default_unit_measurement":
      return ValidMeasurementUnits().includes(value as string);
    case "active_tracking_measurements":
      return ValidateActiveMeasurementsString(value as string);
    case "locale":
      return LocaleList().some((item) => item.code === value);
    case "clock_style":
      return ValidClockStyles().includes(value as string);
    case "time_input_behavior_hhmmss":
      return ValidTimeInputBehaviors(true).some((item) => item.key === value);
    case "time_input_behavior_mmss":
      return ValidTimeInputBehaviors(false).some((item) => item.key === value);
    case "default_increment_weight":
      return IsNumberValidAndAbove0(value as number);
    case "default_increment_distance":
      return IsNumberValidAndAbove0(value as number);
    case "default_increment_time":
      return IsNumberValidId(value as number);
    case "default_increment_resistance_level":
      return IsNumberValidAndAbove0(value as number);
    case "save_calculation_string":
      return IsNumberValidBinary(value as number);
    case "show_calculation_buttons":
      return IsNumberValidBinary(value as number);
    case "default_increment_calculation_multiplier":
      return IsNumberValidAndAbove0(value as number);
    case "default_calculation_tab":
      return ValidCalculationModalTabs().includes(value as string);
    case "shown_workout_properties":
      return ValidateShownPropertiesString(value as string, "workout");
    case "default_plate_collection_id":
      return IsNumberValidIdOr0(value as number);
    case "show_secondary_exercise_groups":
      return IsNumberValidBinary(value as number);
    case "automatically_update_active_measurements":
      return IsNumberValidBinary(value as number);
    case "default_num_new_sets":
      return NumNewSetsOptionList().includes(value as string);
    case "shown_time_period_properties":
      return ValidateShownPropertiesString(value as string, "time-period");
    case "default_diet_log_day_is_yesterday":
      return IsNumberValidBinary(value as number);
    case "show_warmups_in_exercise_details":
      return IsNumberValidBinary(value as number);
    case "show_multisets_in_exercise_details":
      return IsNumberValidBinary(value as number);
    case "show_pace_in_exercise_details":
      return IsNumberValidBinary(value as number);
    case "show_set_comments_in_exercise_details":
      return IsNumberValidBinary(value as number);
    case "show_workout_comments_in_exercise_details":
      return IsNumberValidBinary(value as number);
    case "never_show_delete_modal":
      return IsNumberValidBinary(value as number);
    default:
      return false;
  }
};
