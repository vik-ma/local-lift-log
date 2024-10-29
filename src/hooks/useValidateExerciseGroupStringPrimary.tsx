import { useMemo } from "react";
import { ValidateExerciseGroupSetStringPrimary } from "../helpers";

export const useValidateExerciseGroupStringPrimary = (
  exerciseGroupString: string
): boolean => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetStringPrimary(exerciseGroupString);
  }, [exerciseGroupString]);

  return isNewExerciseGroupSetStringValid;
};
