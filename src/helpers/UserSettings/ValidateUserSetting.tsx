import {
  IsNumberValid,
  IsNumberValidBinary,
  IsNumberValidInteger,
  ValidateActiveMeasurementsString,
  ValidateShownPropertiesString,
  GetValidTimeInputBehaviors,
  ValidateBodyFatCalculationSettingsString,
} from "..";
import {
  LOCALE_MAP,
  NUM_NEW_SETS_OPTIONS_LIST,
  TIME_INPUT_MAP,
  CALCULATION_MODAL_TABS,
  CLOCK_STYLES,
  DISTANCE_UNITS,
  MEASUREMENT_UNITS,
  WEIGHT_UNITS,
  PAGINATION_OPTIONS_LIST_PAGE,
  PAGINATION_OPTIONS_MODAL,
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
      return WEIGHT_UNITS.includes(value as string);
    case "default_unit_distance":
      return DISTANCE_UNITS.includes(value as string);
    case "default_time_input":
      return TIME_INPUT_MAP.has(value as string);
    case "default_unit_measurement":
      return MEASUREMENT_UNITS.includes(value as string);
    case "active_tracking_measurements":
      return ValidateActiveMeasurementsString(value as string);
    case "locale":
      return LOCALE_MAP.has(value as string);
    case "clock_style":
      return CLOCK_STYLES.includes(value as string);
    case "time_input_behavior_hhmmss": {
      const isHhmmss = true;
      return GetValidTimeInputBehaviors(isHhmmss).has(value as string);
    }
    case "time_input_behavior_mmss": {
      const isHhmmss = false;
      return GetValidTimeInputBehaviors(isHhmmss).has(value as string);
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
      return CALCULATION_MODAL_TABS.includes(value as string);
    case "shown_workout_properties":
      return ValidateShownPropertiesString(value as string, "workout");
    case "default_plate_collection_id":
      return IsNumberValidInteger(value as number);
    case "show_secondary_exercise_groups":
      return IsNumberValidBinary(value as number);
    case "automatically_update_active_measurements":
      return IsNumberValidBinary(value as number);
    case "default_num_new_sets":
      return NUM_NEW_SETS_OPTIONS_LIST.includes(value as string);
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
    case "num_pagination_items_list_desktop":
      return PAGINATION_OPTIONS_LIST_PAGE.includes(value as number);
    case "num_pagination_items_modal_desktop":
      return PAGINATION_OPTIONS_MODAL.includes(value as number);
    default:
      return false;
  }
};
