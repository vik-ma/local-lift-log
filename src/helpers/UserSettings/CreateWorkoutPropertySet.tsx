import {
  ValidWorkoutPropertyKeys,
  ValidateShownWorkoutPropertiesString,
} from "..";

export const CreateWorkoutPropertySet = (str: string) => {
  if (!ValidateShownWorkoutPropertiesString(str))
    return new Set(ValidWorkoutPropertyKeys());

  const workoutPropertySet = new Set<string>(str.split(","));

  return workoutPropertySet;
};
