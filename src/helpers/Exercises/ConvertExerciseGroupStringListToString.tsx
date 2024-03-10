export const ConvertExerciseGroupStringListToString = (
  exerciseGroupSetStringList: string[]
): string => {
  const exerciseGroupSetString: string = [...exerciseGroupSetStringList].join(
    ","
  );

  return exerciseGroupSetString;
};
