import {
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

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
