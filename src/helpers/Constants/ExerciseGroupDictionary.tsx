export type ExerciseGroupMap = Map<string, string>;

export const ExerciseGroupDictionary = () => {
  const EXERCISE_GROUP_DICTIONARY: ExerciseGroupMap = new Map<string, string>();

  EXERCISE_GROUP_DICTIONARY.set("0", "Chest");
  EXERCISE_GROUP_DICTIONARY.set("1", "Triceps");
  EXERCISE_GROUP_DICTIONARY.set("2", "Biceps");
  EXERCISE_GROUP_DICTIONARY.set("3", "Forearms");
  EXERCISE_GROUP_DICTIONARY.set("4", "Shoulders");
  EXERCISE_GROUP_DICTIONARY.set("5", "Upper Back");
  EXERCISE_GROUP_DICTIONARY.set("6", "Mid Back (Lats)");
  EXERCISE_GROUP_DICTIONARY.set("7", "Lower Back");
  EXERCISE_GROUP_DICTIONARY.set("8", "Glutes");
  EXERCISE_GROUP_DICTIONARY.set("9", "Adductors");
  EXERCISE_GROUP_DICTIONARY.set("10", "Quadriceps");
  EXERCISE_GROUP_DICTIONARY.set("11", "Hamstrings");
  EXERCISE_GROUP_DICTIONARY.set("12", "Calves");
  EXERCISE_GROUP_DICTIONARY.set("13", "Core (Abs)");
  EXERCISE_GROUP_DICTIONARY.set("14", "Grip");
  EXERCISE_GROUP_DICTIONARY.set("15", "Neck");
  EXERCISE_GROUP_DICTIONARY.set("16", "Cardio");
  EXERCISE_GROUP_DICTIONARY.set("17", "Other");

  Object.freeze(EXERCISE_GROUP_DICTIONARY);

  return EXERCISE_GROUP_DICTIONARY;
};
