import {
  ValidWorkoutPropertiesMap,
  IsStringEmpty,
  ValidTimePeriodPropertiesMap,
} from "..";
import { ShownPropertiesTargetType } from "../../typings";

export const ValidateShownPropertiesString = (
  str: string,
  targetType: ShownPropertiesTargetType
) => {
  if (IsStringEmpty(str)) return true;

  const properties = str.split(",");

  if (properties.length === 0) return false;

  const validPropertiesMap =
    targetType === "workout"
      ? ValidWorkoutPropertiesMap()
      : ValidTimePeriodPropertiesMap();

  for (const property of properties) {
    if (!validPropertiesMap.has(property)) return false;
  }

  return true;
};
