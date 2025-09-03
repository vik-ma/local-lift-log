import { IsStringEmpty } from "..";
import {
  TIME_PERIOD_PROPERTIES_MAP,
  WORKOUT_PROPERTIES_MAP,
} from "../../constants";
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
      ? WORKOUT_PROPERTIES_MAP
      : TIME_PERIOD_PROPERTIES_MAP;

  for (const property of properties) {
    if (!validPropertiesMap.has(property)) return false;
  }

  return true;
};
