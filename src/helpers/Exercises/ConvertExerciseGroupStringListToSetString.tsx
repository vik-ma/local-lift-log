export const ConvertExerciseGroupStringListToSetString = (
  exerciseGroupSetStringList: string[]
): string => {
  const exerciseGroupSetString: string = [...exerciseGroupSetStringList].join(
    ","
  );

  return exerciseGroupSetString;
};
