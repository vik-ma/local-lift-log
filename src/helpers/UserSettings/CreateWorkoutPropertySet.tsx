import {
  ValidWorkoutPropertiesMap,
  ValidateShownWorkoutPropertiesString,
} from "..";

export const CreateWorkoutPropertySet = (str: string) => {
  if (!ValidateShownWorkoutPropertiesString(str))
    return new Set<string>(ValidWorkoutPropertiesMap().keys());

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
