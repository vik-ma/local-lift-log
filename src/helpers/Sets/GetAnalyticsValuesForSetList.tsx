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

  // If -1 is returned for option, no tracked value was found
  let minWeight = Infinity;
  let maxWeight = -1;
  let addedWeight = -1;
  let totalWeight = -1;

  for (const set of setList) {
    if (set.is_tracking_weight) {
      if (maxWeight === -1) {
        maxWeight = 0;
        addedWeight = 0;
      }

      const weight = ConvertWeightValue(
        set.weight,
        set.weight_unit,
        weightUnit
      );

      if (weight < minWeight) minWeight = weight;
      if (weight > maxWeight) maxWeight = weight;

      addedWeight += weight;

      if (set.is_tracking_reps) {
        if (totalWeight === -1) totalWeight = 0;

        totalWeight += weight * set.reps;
      }
    }
  }

  if (loadExerciseOptions.has("weight_min")) {
    analyticsValues.set(
      "weight_min",
      minWeight === Infinity ? -1 : ConvertNumberToTwoDecimals(minWeight)
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
