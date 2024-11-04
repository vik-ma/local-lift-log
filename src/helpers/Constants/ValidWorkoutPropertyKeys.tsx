export const ValidWorkoutPropertyKeys = (): Map<string, string> => {
  const VALID_WORKOUT_PROPERTY_KEYS: Map<string, string> = new Map();
  VALID_WORKOUT_PROPERTY_KEYS.set("template", "Workout Template");
  VALID_WORKOUT_PROPERTY_KEYS.set("routine", "Routine");
  VALID_WORKOUT_PROPERTY_KEYS.set("note", "Note");
  VALID_WORKOUT_PROPERTY_KEYS.set("details", "Details Button");

  Object.freeze(VALID_WORKOUT_PROPERTY_KEYS);
  return VALID_WORKOUT_PROPERTY_KEYS;
};
