export const ValidWorkoutPropertiesMap = () => {
  const VALID_WORKOUT_PROPERTIES_MAP = new Map<string, string>();
  VALID_WORKOUT_PROPERTIES_MAP.set("template", "Workout Template");
  VALID_WORKOUT_PROPERTIES_MAP.set("routine", "Routine");
  VALID_WORKOUT_PROPERTIES_MAP.set("note", "Note");

  Object.freeze(VALID_WORKOUT_PROPERTIES_MAP);
  return VALID_WORKOUT_PROPERTIES_MAP;
};
