import {
  IsStringEmpty,
  ValidTimePeriodPropertiesMap,
  ValidWorkoutPropertiesMap,
  ValidateShownPropertiesString,
} from "..";
import { ShownPropertiesTargetType } from "../../typings";

export const CreateShownPropertiesSet = (
  str: string,
  targetType: ShownPropertiesTargetType
) => {
  if (!ValidateShownPropertiesString(str, targetType)) {
    const keys =
      targetType === "workout"
        ? ValidWorkoutPropertiesMap().keys()
        : ValidTimePeriodPropertiesMap().keys();

    return new Set<string>(keys);
  }

  if (IsStringEmpty(str)) return new Set<string>();

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
