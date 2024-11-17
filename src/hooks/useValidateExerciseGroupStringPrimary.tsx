import { useMemo } from "react";
import { ValidateExerciseGroupSetStringPrimary } from "../helpers";
import { ExerciseGroupMap } from "../typings";

export const useValidateExerciseGroupStringPrimary = (
  exerciseGroupString: string,
  exerciseGroupDictionary: ExerciseGroupMap
): boolean => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetStringPrimary(
      exerciseGroupString,
      exerciseGroupDictionary
    );
  }, [exerciseGroupString, exerciseGroupDictionary]);

  return isNewExerciseGroupSetStringValid;
};
