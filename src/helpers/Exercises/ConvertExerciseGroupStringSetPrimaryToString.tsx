export const ConvertExerciseGroupStringSetPrimaryToString = (
  exerciseGroupSetStringSet: Set<string>
): string => {
  const exerciseGroupSetString: string = Array.from(
    exerciseGroupSetStringSet
  ).join(",");

  return exerciseGroupSetString;
};
