export const ConvertExerciseGroupStringMapSecondaryToString = (
  exerciseGroupStringListSecondary: string[],
  exerciseGroupStringMap: Map<string, string>
): string | null => {
  if (exerciseGroupStringMap.size === 0) return null;

  const exerciseGroupStrings: string[] = [];

  for (const group of exerciseGroupStringListSecondary) {
    if (exerciseGroupStringMap.has(group)) {
      const multiplier = exerciseGroupStringMap.get(group);
      const exerciseGroupString = `${group}x${multiplier}`;
      exerciseGroupStrings.push(exerciseGroupString);
    } else {
      // Add new Exercise Group
      const newExerciseGroupString = `${group}x0.5`;
      exerciseGroupStrings.push(newExerciseGroupString);
    }
  }

  const exerciseGroupString = exerciseGroupStrings.join(",");

  return exerciseGroupString;
};
