import {
  ConvertExerciseGroupSetStringPrimary,
  ConvertExerciseGroupSetStringSecondary,
  ConvertExerciseGroupStringMapSecondaryToString,
  UpdateExercise,
} from "..";
import { Exercise } from "../../typings";

export const UpdateExerciseValues = async (
  exercise: Exercise,
  multiplierInputMap: Map<string, string>
): Promise<Exercise | undefined> => {
  const convertedValuesPrimary = ConvertExerciseGroupSetStringPrimary(
    exercise.exercise_group_set_string_primary
  );

  const updatedExercise: Exercise = {
    ...exercise,
    formattedGroupStringPrimary: convertedValuesPrimary.formattedString,
    exerciseGroupStringListPrimary: convertedValuesPrimary.list,
  };

  if (updatedExercise.exerciseGroupStringMapSecondary !== undefined) {
    const exerciseGroupSetString =
      ConvertExerciseGroupStringMapSecondaryToString(
        updatedExercise.exerciseGroupStringMapSecondary,
        multiplierInputMap
      );

    updatedExercise.exercise_group_set_string_secondary =
      exerciseGroupSetString;

    if (exerciseGroupSetString !== null) {
      const convertedValuesSecondary = ConvertExerciseGroupSetStringSecondary(
        exerciseGroupSetString
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
