import { useMemo } from "react";
import { ValidateExerciseGroupSetStringSecondary } from "../helpers";

export const useValidateExerciseGroupStringSecondary = (
  exerciseGroupString: string
): boolean => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetStringSecondary(exerciseGroupString);
  }, [exerciseGroupString]);

  return isNewExerciseGroupSetStringValid;
};
