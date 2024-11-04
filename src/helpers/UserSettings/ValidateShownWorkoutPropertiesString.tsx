import { ValidWorkoutPropertiesMap, IsStringEmpty } from "..";

export const ValidateShownWorkoutPropertiesString = (str: string) => {
  if (IsStringEmpty(str)) return true;

  const properties = str.split(",");

  if (properties.length === 0) return false;

  const validWorkoutPropertiesMap = ValidWorkoutPropertiesMap();

  for (const property of properties) {
    if (!validWorkoutPropertiesMap.has(property)) return false;
  }

  return true;
};
