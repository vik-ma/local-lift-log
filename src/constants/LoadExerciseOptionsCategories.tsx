import { ChartDataUnitCategoryNoUndefined } from "../typings";

export const LOAD_EXERCISE_OPTIONS_CATEGORIES = Object.freeze(
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
  ])
);
