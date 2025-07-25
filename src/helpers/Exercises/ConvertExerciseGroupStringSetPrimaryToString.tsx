export const ConvertExerciseGroupStringSetPrimaryToString = (
  exerciseGroupSetStringSet: Set<string>
) => {
  const exerciseGroupSetString: string = Array.from(
    exerciseGroupSetStringSet
  ).join(",");

  return exerciseGroupSetString;
};
