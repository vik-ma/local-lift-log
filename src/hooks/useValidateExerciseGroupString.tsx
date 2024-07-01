import { useMemo } from "react";
import { ValidateExerciseGroupSetString } from "../helpers";

export const useValidateExerciseGroupString = (
  exerciseGroupString: string
): boolean => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetString(exerciseGroupString);
  }, [exerciseGroupString]);

  return isNewExerciseGroupSetStringValid;
};

