import { ExerciseGroupMap } from "../../typings";

export const ExerciseGroupDictionary = () => {
  const EXERCISE_GROUP_DICTIONARY: ExerciseGroupMap = new Map<string, string>([
    ["0", "Chest"],
    ["1", "Triceps"],
    ["2", "Biceps"],
    ["3", "Forearms"],
    ["4", "Shoulders"],
    ["5", "Upper Back"],
    ["6", "Mid Back (Lats)"],
    ["7", "Lower Back"],
    ["8", "Glutes"],
    ["9", "Adductors"],
    ["10", "Quadriceps"],
    ["11", "Hamstrings"],
    ["12", "Calves"],
    ["13", "Core (Abs)"],
    ["14", "Grip"],
    ["15", "Neck"],
    ["16", "Cardio"],
    ["17", "Other"],
  ]);

  Object.freeze(EXERCISE_GROUP_DICTIONARY);

  return EXERCISE_GROUP_DICTIONARY;
};
