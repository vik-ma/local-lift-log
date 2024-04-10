export type ExerciseGroupMap = Map<string, string>;

export const ExerciseGroupDictionary = () => {
  const exerciseGroupDictionary: ExerciseGroupMap = new Map<string, string>();

  exerciseGroupDictionary.set("0", "Chest");
  exerciseGroupDictionary.set("1", "Triceps");
  exerciseGroupDictionary.set("2", "Biceps");
  exerciseGroupDictionary.set("3", "Forearms");
  exerciseGroupDictionary.set("4", "Shoulders");
  exerciseGroupDictionary.set("5", "Upper Back");
  exerciseGroupDictionary.set("6", "Mid Back (Lats)");
  exerciseGroupDictionary.set("7", "Lower Back");
  exerciseGroupDictionary.set("8", "Glutes");
  exerciseGroupDictionary.set("9", "Adductors");
  exerciseGroupDictionary.set("10", "Quadriceps");
  exerciseGroupDictionary.set("11", "Hamstrings");
  exerciseGroupDictionary.set("12", "Calves");
  exerciseGroupDictionary.set("13", "Core (Abs)");
  exerciseGroupDictionary.set("14", "Grip");
  exerciseGroupDictionary.set("15", "Neck");
  exerciseGroupDictionary.set("16", "Cardio");
  exerciseGroupDictionary.set("17", "Other");

  Object.freeze(exerciseGroupDictionary);

  return exerciseGroupDictionary;
};
