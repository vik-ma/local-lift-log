import {
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
  ConvertExerciseGroupStringMapSecondaryToString,
  UpdateExercise,
} from "..";
import { Exercise, ExerciseGroupMap } from "../../typings";

export const UpdateExerciseValues = async (
  exercise: Exercise,
  multiplierInputMap: Map<string, string>,
  exerciseGroupDictionary: ExerciseGroupMap
): Promise<Exercise | undefined> => {
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

    updatedExercise.exercise_group_set_string_secondary =
      exerciseGroupSetString;

    if (exerciseGroupSetString !== null) {
      const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
        exerciseGroupSetString,
        exerciseGroupDictionary
      );

      updatedExercise.exerciseGroupStringMapSecondary =
        convertedValuesSecondary.map;
      updatedExercise.formattedGroupStringSecondary =
        convertedValuesSecondary.formattedString;
    }
  }

  const success = await UpdateExercise(updatedExercise);

  if (!success) return undefined;

  return updatedExercise;
};
