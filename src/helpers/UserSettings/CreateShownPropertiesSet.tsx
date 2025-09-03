import { IsStringEmpty, ValidateShownPropertiesString } from "..";
import {
  TIME_PERIOD_PROPERTIES_MAP,
  WORKOUT_PROPERTIES_MAP,
} from "../../constants";
import { ShownPropertiesTargetType } from "../../typings";

export const CreateShownPropertiesSet = (
  str: string,
  targetType: ShownPropertiesTargetType
) => {
  if (!ValidateShownPropertiesString(str, targetType)) {
    const keys =
      targetType === "workout"
        ? WORKOUT_PROPERTIES_MAP.keys()
        : TIME_PERIOD_PROPERTIES_MAP.keys();

    return new Set<string>(keys);
  }

  if (IsStringEmpty(str)) return new Set<string>();

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
