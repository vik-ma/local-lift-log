export const ConvertExerciseGroupStringListPrimaryToString = (
  exerciseGroupSetStringSet: Set<string>
): string => {
  const exerciseGroupSetString: string = Array.from(
    exerciseGroupSetStringSet
  ).join(",");

  return exerciseGroupSetString;
};
