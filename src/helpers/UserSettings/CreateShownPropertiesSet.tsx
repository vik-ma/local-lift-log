import { IsStringEmpty, ValidateShownPropertiesString } from "..";
import {
  VALID_TIME_PERIOD_PROPERTIES_MAP,
  VALID_WORKOUT_PROPERTIES_MAP,
} from "../../constants";
import { ShownPropertiesTargetType } from "../../typings";

export const CreateShownPropertiesSet = (
  str: string,
  targetType: ShownPropertiesTargetType
) => {
  if (!ValidateShownPropertiesString(str, targetType)) {
    const keys =
      targetType === "workout"
        ? VALID_WORKOUT_PROPERTIES_MAP.keys()
        : VALID_TIME_PERIOD_PROPERTIES_MAP.keys();

    return new Set<string>(keys);
  }

  if (IsStringEmpty(str)) return new Set<string>();

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
