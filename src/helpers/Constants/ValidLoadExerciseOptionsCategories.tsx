import { ChartDataUnitCategoryNoUndefined } from "../../typings";

export const ValidLoadExerciseOptionsCategories = () => {
  const VALID_LOAD_EXERCISE_OPTIONS_CATEGORIES =
    new Set<ChartDataUnitCategoryNoUndefined>([
      "Weight",
      "Distance",
      "Time",
      "Speed",
      "Pace",
      "Number Of Sets",
      "Number Of Reps",
      "RIR",
      "RPE",
      "Resistance Level",
    ]);

  Object.freeze(VALID_LOAD_EXERCISE_OPTIONS_CATEGORIES);

  return VALID_LOAD_EXERCISE_OPTIONS_CATEGORIES;
};
