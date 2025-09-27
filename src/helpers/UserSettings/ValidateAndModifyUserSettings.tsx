import {
  GetValidatedUnit,
  ValidateAndModifyIncrementMultipliers,
  ValidateAndModifyTimeInputBehavior,
} from "..";
import {
  CALENDAR_DATE_MARKINGS_MAP,
  LOCALE_MAP,
  PAGINATION_OPTIONS_LIST_PAGE,
} from "../../constants";
import { UserSettings } from "../../typings";

type UserSettingsPropsToValidate =
  | "default_unit_weight"
  | "default_unit_distance"
  | "default_unit_measurement"
  | "locale"
  | "time_input"
  | "increment_multipliers"
  | "pagination_items"
  | "calendar_date_marking";

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
        if (!LOCALE_MAP.has(userSettings.locale)) {
          userSettings.locale = LOCALE_MAP.keys().next().value!;
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
      case "pagination_items": {
        if (
          !PAGINATION_OPTIONS_LIST_PAGE.includes(
            userSettings.num_pagination_items_list_desktop
          )
        ) {
          userSettings.num_pagination_items_list_desktop =
            PAGINATION_OPTIONS_LIST_PAGE[1];
        }

        break;
      }
      case "calendar_date_marking": {
        if (
          !CALENDAR_DATE_MARKINGS_MAP.has(userSettings.calendar_date_marking)
        ) {
          userSettings.calendar_date_marking =
            CALENDAR_DATE_MARKINGS_MAP.keys().next().value!;
        }

        break;
      }
    }
  }
};
