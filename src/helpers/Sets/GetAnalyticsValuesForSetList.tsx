import { ChartDataExerciseCategoryBase, WorkoutSet } from "../../typings";
import { ConvertNumberToTwoDecimals } from "../Numbers/ConvertNumberToTwoDecimals";
import { ConvertWeightValue } from "../Numbers/ConvertWeightValue";

export const GetAnalyticsValuesForSetList = (
  setList: WorkoutSet[],
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  weightUnit: string,
  distanceUnit: string
) => {
  const analyticsValues = new Map<ChartDataExerciseCategoryBase, number>();

  let minWeight = Infinity;
  let maxWeight = 0;
  let addedWeight = 0;
  let totalWeight = 0;

  for (const set of setList) {
    if (set.is_tracking_weight) {
      const weight = ConvertWeightValue(
        set.weight,
        set.weight_unit,
        weightUnit
      );

      if (weight < minWeight) minWeight = weight;
      if (weight > maxWeight) maxWeight = weight;

      addedWeight += weight;

      if (set.is_tracking_reps) {
        totalWeight += weight * set.reps;
      }
    }
  }

  if (loadExerciseOptions.has("weight_min")) {
    analyticsValues.set(
      "weight_min",
      minWeight === Infinity ? 0 : ConvertNumberToTwoDecimals(minWeight)
    );
  }

  if (loadExerciseOptions.has("weight_max")) {
    analyticsValues.set("weight_max", ConvertNumberToTwoDecimals(maxWeight));
  }

  if (loadExerciseOptions.has("weight_avg")) {
    analyticsValues.set(
      "weight_avg",
      ConvertNumberToTwoDecimals(addedWeight / setList.length)
    );
  }

  if (loadExerciseOptions.has("weight_total")) {
    analyticsValues.set(
      "weight_total",
      ConvertNumberToTwoDecimals(totalWeight)
    );
  }

  if (loadExerciseOptions.has("num_sets")) {
    analyticsValues.set("num_sets", setList.length);
  }

  return analyticsValues;
};
