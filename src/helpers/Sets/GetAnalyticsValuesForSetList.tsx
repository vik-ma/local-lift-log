import { ChartDataExerciseCategoryBase, WorkoutSet } from "../../typings";
import { ConvertNumberToTwoDecimals } from "../Numbers/ConvertNumberToTwoDecimals";
import { ConvertWeightValue } from "../Numbers/ConvertWeightValue";

export const GetAnalyticsValuesForSetList = (
  setList: WorkoutSet[],
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  weightUnit: string,
  distanceUnit: string
) => {
  const analyticsValuesMap = new Map<ChartDataExerciseCategoryBase, number>();
  const commentMap = new Map<number, string>();

  // If -1 is returned for option, no tracked value was found
  let minWeight = Infinity;
  let maxWeight = -1;
  let addedWeight = -1;
  let weightVolume = -1;

  let setNum = 0;

  for (const set of setList) {
    setNum++;

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
        if (weightVolume === -1) weightVolume = 0;

        weightVolume += weight * set.reps;
      }

      if (set.comment !== null) {
        commentMap.set(setNum, set.comment);
      }
    }
  }

  if (loadExerciseOptions.has("weight_min")) {
    analyticsValuesMap.set(
      "weight_min",
      minWeight === Infinity ? -1 : ConvertNumberToTwoDecimals(minWeight)
    );
  }

  if (loadExerciseOptions.has("weight_max")) {
    analyticsValuesMap.set("weight_max", ConvertNumberToTwoDecimals(maxWeight));
  }

  if (loadExerciseOptions.has("weight_avg")) {
    analyticsValuesMap.set(
      "weight_avg",
      ConvertNumberToTwoDecimals(addedWeight / setList.length)
    );
  }

  if (loadExerciseOptions.has("weight_volume")) {
    analyticsValuesMap.set(
      "weight_volume",
      ConvertNumberToTwoDecimals(weightVolume)
    );
  }

  if (loadExerciseOptions.has("num_sets")) {
    analyticsValuesMap.set("num_sets", setList.length);
  }

  return { analyticsValuesMap, commentMap };
};
