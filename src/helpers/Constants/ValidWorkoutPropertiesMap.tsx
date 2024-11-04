export const ValidWorkoutPropertiesMap = (): Map<string, string> => {
  const VALID_WORKOUT_PROPERTIES_MAP: Map<string, string> = new Map<string, string>();
  VALID_WORKOUT_PROPERTIES_MAP.set("template", "Workout Template");
  VALID_WORKOUT_PROPERTIES_MAP.set("routine", "Routine");
  VALID_WORKOUT_PROPERTIES_MAP.set("note", "Note");
  VALID_WORKOUT_PROPERTIES_MAP.set("details", "Details Button");

  Object.freeze(VALID_WORKOUT_PROPERTIES_MAP);
  return VALID_WORKOUT_PROPERTIES_MAP;
};
