import { ValidateShownWorkoutPropertiesString } from "./ValidateShownWorkoutPropertiesString";

export const CreateWorkoutPropertySet = (str: string) => {
  if (!ValidateShownWorkoutPropertiesString(str))
    return new Set(["template", "routine", "note"]);

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
