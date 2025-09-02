import {
  IsNumberValid,
  IsNumberValidBinary,
  IsNumberValidInteger,
  NumNewSetsOptionList,
  ValidateActiveMeasurementsString,
  ValidateShownPropertiesString,
  ValidCalculationModalTabs,
  ValidMeasurementUnits,
  ValidTimeInputBehaviors,
  ValidWeightUnits,
  ValidateBodyFatCalculationSettingsString,
} from "..";
import {
  LOCALE_MAP,
  TIME_INPUT_MAP,
  VALID_CLOCK_STYLES,
  VALID_DISTANCE_UNITS,
} from "../../constants";
import { UserSettings } from "../../typings";

export const ValidateUserSetting = <K extends keyof UserSettings>(
  userSetting: K,
  value: UserSettings[K]
) => {
  switch (userSetting) {
    case "show_timestamp_on_completed_set":
      return IsNumberValidBinary(value as number);
    case "active_routine_id":
      return IsNumberValidInteger(value as number);
    case "default_unit_weight":
      return ValidWeightUnits().includes(value as string);
    case "default_unit_distance":
      return VALID_DISTANCE_UNITS.includes(value as string);
    case "default_time_input":
      return TIME_INPUT_MAP.has(value as string);
    case "default_unit_measurement":
      return ValidMeasurementUnits().includes(value as string);
    case "active_tracking_measurements":
      return ValidateActiveMeasurementsString(value as string);
    case "locale":
      return LOCALE_MAP.has(value as string);
    case "clock_style":
      return VALID_CLOCK_STYLES.includes(value as string);
    case "time_input_behavior_hhmmss": {
      const isHhmmss = true;
      return ValidTimeInputBehaviors(isHhmmss).has(value as string);
    }
    case "time_input_behavior_mmss": {
      const isHhmmss = false;
      return ValidTimeInputBehaviors(isHhmmss).has(value as string);
    }
    case "default_increment_weight": {
      const minValue = 0;
      const doNotAllowMinValue = true;
      return IsNumberValid(value as number, minValue, doNotAllowMinValue);
    }
    case "default_increment_distance": {
      const minValue = 0;
      const doNotAllowMinValue = true;
      return IsNumberValid(value as number, minValue, doNotAllowMinValue);
    }
    case "default_increment_time": {
      const minValue = 0;
      const doNotAllowMinValue = true;
      return IsNumberValidInteger(
        value as number,
        minValue,
        doNotAllowMinValue
      );
    }
    case "default_increment_resistance_level": {
      const minValue = 0;
      const doNotAllowMinValue = true;
      return IsNumberValid(value as number, minValue, doNotAllowMinValue);
    }
    case "save_calculation_string":
      return IsNumberValidBinary(value as number);
    case "show_calculation_buttons":
      return IsNumberValidBinary(value as number);
    case "default_increment_calculation_multiplier": {
      const minValue = 0;
      const doNotAllowMinValue = true;
      return IsNumberValid(value as number, minValue, doNotAllowMinValue);
    }
    case "default_calculation_tab":
      return ValidCalculationModalTabs().includes(value as string);
    case "shown_workout_properties":
      return ValidateShownPropertiesString(value as string, "workout");
    case "default_plate_collection_id":
      return IsNumberValidInteger(value as number);
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
    case "body_fat_calculation_settings":
      return ValidateBodyFatCalculationSettingsString(value as string);
    case "show_get_latest_body_weight_button":
      return IsNumberValidBinary(value as number);
    case "show_outdated_body_weight_message":
      return IsNumberValidBinary(value as number);
    default:
      return false;
  }
};
