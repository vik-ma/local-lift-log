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
  let totalWeight = -1;
  let weightVolume = -1;

  let minReps = Infinity;
  let maxReps = -1;
  let totalReps = -1;

  let minPartialReps = Infinity;
  let maxPartialReps = -1;
  let totalPartialReps = -1;

  let minRepsAndPartialReps = Infinity;
  let maxRepsAndPartialReps = -1;
  let totalRepsAndPartialReps = -1;

  let bodyWeight = -1;

  for (let i = 0; i < setList.length; i++) {
    const set = setList[i];

    if (set.is_tracking_weight) {
      if (maxWeight === -1) {
        maxWeight = 0;
        totalWeight = 0;
      }

      const weight = ConvertWeightValue(
        set.weight,
        set.weight_unit,
        weightUnit
      );

      if (weight < minWeight) minWeight = weight;
      if (weight > maxWeight) maxWeight = weight;

      totalWeight += weight;

      if (set.is_tracking_reps) {
        if (weightVolume === -1) weightVolume = 0;

        weightVolume += weight * set.reps;
      }
    }

    if (set.is_tracking_reps) {
      if (maxReps === -1) {
        maxReps = 0;
        totalReps = 0;
      }

      const reps = set.reps;

      if (reps < minReps) minReps = reps;
      if (reps > maxReps) maxReps = reps;

      totalReps += reps;

      if (set.is_tracking_partial_reps) {
        if (maxRepsAndPartialReps === -1) {
          maxRepsAndPartialReps = 0;
          totalRepsAndPartialReps = 0;
        }

        const repsAndPartialReps = set.reps + set.partial_reps;

        if (repsAndPartialReps < minRepsAndPartialReps)
          minRepsAndPartialReps = repsAndPartialReps;
        if (repsAndPartialReps > maxRepsAndPartialReps)
          maxRepsAndPartialReps = repsAndPartialReps;

        totalRepsAndPartialReps += repsAndPartialReps;
      }
    }

    if (set.is_tracking_partial_reps) {
      if (maxPartialReps === -1) {
        maxPartialReps = 0;
        totalPartialReps = 0;
      }

      const partialReps = set.partial_reps;

      if (partialReps < minPartialReps) minPartialReps = partialReps;
      if (partialReps > maxPartialReps) maxPartialReps = partialReps;

      totalPartialReps += partialReps;
    }

    if (set.is_tracking_user_weight && bodyWeight === -1) {
      // Only add first value in Set

      const userWeight = ConvertWeightValue(
        set.user_weight,
        set.user_weight_unit,
        weightUnit
      );

      bodyWeight = userWeight;
    }

    if (set.comment !== null) {
      commentMap.set(i + 1, set.comment);
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
      totalWeight === -1
        ? -1
        : ConvertNumberToTwoDecimals(totalWeight / setList.length)
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

  if (loadExerciseOptions.has("num_reps_min")) {
    analyticsValuesMap.set("num_reps_min", minReps === Infinity ? -1 : minReps);
  }

  if (loadExerciseOptions.has("num_reps_max")) {
    analyticsValuesMap.set("num_reps_max", maxReps);
  }

  if (loadExerciseOptions.has("num_reps_avg")) {
    analyticsValuesMap.set(
      "num_reps_avg",
      totalReps === -1 ? -1 : Math.round(totalReps / setList.length)
    );
  }

  if (loadExerciseOptions.has("num_reps_total")) {
    analyticsValuesMap.set("num_reps_total", totalReps);
  }

  if (loadExerciseOptions.has("num_partial_reps_min")) {
    analyticsValuesMap.set(
      "num_partial_reps_min",
      minPartialReps === Infinity ? -1 : minPartialReps
    );
  }

  if (loadExerciseOptions.has("num_partial_reps_max")) {
    analyticsValuesMap.set("num_partial_reps_max", maxPartialReps);
  }

  if (loadExerciseOptions.has("num_partial_reps_avg")) {
    analyticsValuesMap.set(
      "num_partial_reps_avg",
      totalPartialReps === -1
        ? -1
        : Math.round(totalPartialReps / setList.length)
    );
  }

  if (loadExerciseOptions.has("num_partial_reps_total")) {
    analyticsValuesMap.set("num_partial_reps_total", totalPartialReps);
  }

  if (loadExerciseOptions.has("num_reps_and_partial_reps_min")) {
    analyticsValuesMap.set(
      "num_reps_and_partial_reps_min",
      minRepsAndPartialReps === Infinity ? -1 : minRepsAndPartialReps
    );
  }

  if (loadExerciseOptions.has("num_reps_and_partial_reps_max")) {
    analyticsValuesMap.set(
      "num_reps_and_partial_reps_max",
      maxRepsAndPartialReps
    );
  }

  if (loadExerciseOptions.has("num_reps_and_partial_reps_avg")) {
    analyticsValuesMap.set(
      "num_reps_and_partial_reps_avg",
      totalRepsAndPartialReps === -1
        ? -1
        : Math.round(totalRepsAndPartialReps / setList.length)
    );
  }

  if (loadExerciseOptions.has("num_reps_and_partial_reps_total")) {
    analyticsValuesMap.set(
      "num_reps_and_partial_reps_total",
      totalRepsAndPartialReps
    );
  }

  if (loadExerciseOptions.has("set_body_weight")) {
    analyticsValuesMap.set("set_body_weight", bodyWeight);
  }

  return { analyticsValuesMap, commentMap };
};
