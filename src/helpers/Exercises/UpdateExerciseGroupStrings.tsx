import {
  ConvertExerciseGroupSetStringPrimary,
  LoadExerciseGroupSetStringSecondary,
  ConvertExerciseGroupStringMapSecondaryToString,
} from "..";
import { Exercise, ExerciseGroupMap } from "../../typings";

export const UpdateExerciseGroupStrings = async (
  exercise: Exercise,
  multiplierInputMap: Map<string, string>,
  exerciseGroupDictionary: ExerciseGroupMap
) => {
  const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
    exercise.exercise_group_set_string_primary,
    exerciseGroupDictionary
  );

  const updatedExercise: Exercise = {
    ...exercise,
    formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
    exerciseGroupStringSetPrimary: convertedValuesPrimary.set,
  };

  if (updatedExercise.exerciseGroupStringMapSecondary !== undefined) {
    const exerciseGroupSetString =
      ConvertExerciseGroupStringMapSecondaryToString(
        updatedExercise.exerciseGroupStringMapSecondary,
        multiplierInputMap,
        exerciseGroupDictionary
      );

    updatedExercise.exercise_group_map_string_secondary =
      exerciseGroupSetString;

    LoadExerciseGroupSetStringSecondary(
      updatedExercise,
      exerciseGroupDictionary,
      convertedValuesPrimary.set
    );
  }

  return updatedExercise;
};
