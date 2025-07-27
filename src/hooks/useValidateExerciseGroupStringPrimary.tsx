import { useMemo } from "react";
import { ValidateExerciseGroupSetStringPrimary } from "../helpers";
import { ExerciseGroupMap } from "../typings";

type UseValidateExerciseGroupStringPrimary = {
  exerciseGroupString: string;
  exerciseGroupDictionary: ExerciseGroupMap;
};

export const useValidateExerciseGroupStringPrimary = ({
  exerciseGroupString,
  exerciseGroupDictionary,
}: UseValidateExerciseGroupStringPrimary) => {
  const isNewExerciseGroupSetStringValid = useMemo(() => {
    return ValidateExerciseGroupSetStringPrimary(
      exerciseGroupString,
      exerciseGroupDictionary
    );
  }, [exerciseGroupString, exerciseGroupDictionary]);

  return isNewExerciseGroupSetStringValid;
};
