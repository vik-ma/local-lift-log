import { ValidWorkoutPropertyKeys } from "../Constants/ValidWorkoutPropertyKeys";
import { IsStringEmpty } from "../Strings/IsStringEmpty";

export const ValidateShownWorkoutPropertiesString = (str: string) => {
  if (IsStringEmpty(str)) return false;

  const properties = str.split(",");

  if (properties.length === 0) return false;

  const validWorkoutPropertyKeys = new Set<string>(ValidWorkoutPropertyKeys());

  for (const property of properties) {
    if (!validWorkoutPropertyKeys.has(property)) return false;
  }

  return true;
};
