export const ConvertExerciseGroupStringMapSecondaryToString = (
  exerciseGroupStringMap: Map<string, string>
): string | null => {
  if (exerciseGroupStringMap.size === 0) return null;

  const exerciseGroupStrings: string[] = [];

  for (const [group, multiplier] of exerciseGroupStringMap) {
    const exerciseGroupString = `${group}x${multiplier}`;

    exerciseGroupStrings.push(exerciseGroupString);
  }

  const exerciseGroupString = exerciseGroupStrings.join(",");

  return exerciseGroupString;
};
