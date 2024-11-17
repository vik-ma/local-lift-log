import { useMemo } from "react";
import { ValidateExerciseGroupSetStringSecondary } from "../helpers";
import { ExerciseGroupMap } from "../typings";

export const useValidateExerciseGroupStringSecondary = (
  exerciseGroupString: string,
  exerciseGroupDictionary: ExerciseGroupMap
): boolean => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetStringSecondary(
      exerciseGroupString,
      exerciseGroupDictionary
    );
  }, [exerciseGroupString, exerciseGroupDictionary]);

  return isNewExerciseGroupSetStringValid;
};
