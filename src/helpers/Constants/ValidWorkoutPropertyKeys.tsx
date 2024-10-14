export const ValidWorkoutPropertyKeys = (): string[] => {
  const VALID_WORKOUT_PROPERTY_KEYS: string[] = ["template", "routine", "note"];
  Object.freeze(VALID_WORKOUT_PROPERTY_KEYS);
  return VALID_WORKOUT_PROPERTY_KEYS;
};
