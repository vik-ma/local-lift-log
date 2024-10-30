export const ConvertExerciseGroupStringListPrimaryToString = (
  exerciseGroupSetStringList: string[]
): string => {
  const exerciseGroupSetString: string = [...exerciseGroupSetStringList].join(
    ","
  );

  return exerciseGroupSetString;
};
