import { ExerciseGroupMap } from "../../typings";

export const ExerciseGroupDictionary = () => {
  const exerciseGroupDictionary: ExerciseGroupMap = {
    0: "Chest",
    1: "Triceps",
    2: "Biceps",
    3: "Forearms",
    4: "Shoulders",
    5: "Upper Back",
    6: "Mid Back (Lats)",
    7: "Lower Back",
    8: "Glutes",
    9: "Adductors",
    10: "Quadriceps",
    11: "Hamstrings",
    12: "Calves",
    13: "Core",
    14: "Grip",
    15: "Cardio",
    16: "Other",
    17: "Back",
    18: "Legs",
  };

  Object.freeze(exerciseGroupDictionary);

  return exerciseGroupDictionary;
};
