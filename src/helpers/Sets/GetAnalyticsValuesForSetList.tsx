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
  let numWeightSets = 0;

  let minReps = Infinity;
  let maxReps = -1;
  let totalReps = -1;
  let numRepsSets = 0;

  let minPartialReps = Infinity;
  let maxPartialReps = -1;
  let totalPartialReps = -1;
  let numPartialRepSets = 0;

  let minRepsAndPartialReps = Infinity;
  let maxRepsAndPartialReps = -1;
  let totalRepsAndPartialReps = -1;
  let numRepsAndPartialRepsSets = 0;

  let minRir = Infinity;
  let maxRir = -1;
  let totalRir = -1;
  let numRirSets = 0;

  let minRpe = Infinity;
  let maxRpe = -1;
  let totalRpe = -1;
  let numRpeSets = 0;

  let minResistanceLevel = Infinity;
  let maxResistanceLevel = -1;
  let totalResistanceLevel = -1;
  let numResistanceLevelSets = 0;

  let bodyWeight = -1;

  for (let i = 0; i < setList.length; i++) {
    const set = setList[i];

    if (set.is_tracking_weight) {
      numWeightSets++;

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
      numRepsSets++;

      if (maxReps === -1) {
        maxReps = 0;
        totalReps = 0;
      }

      const reps = set.reps;

      if (reps < minReps) minReps = reps;
      if (reps > maxReps) maxReps = reps;

      totalReps += reps;

      if (set.is_tracking_partial_reps) {
        numRepsAndPartialRepsSets++;

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
      numPartialRepSets++;

      if (maxPartialReps === -1) {
        maxPartialReps = 0;
        totalPartialReps = 0;
      }

      const partialReps = set.partial_reps;

      if (partialReps < minPartialReps) minPartialReps = partialReps;
      if (partialReps > maxPartialReps) maxPartialReps = partialReps;

      totalPartialReps += partialReps;
    }

    if (set.is_tracking_rir) {
      numRirSets++;

      if (maxRir === -1) {
        maxRir = 0;
        totalRir = 0;
      }

      const rir = set.rir;

      if (rir < minRir) minRir = rir;
      if (rir > maxRir) maxRir = rir;

      totalRir += rir;
    }

    if (set.is_tracking_rpe) {
      numRpeSets++;

      if (maxRpe === -1) {
        maxRpe = 0;
        totalRpe = 0;
      }

      const rpe = set.rpe;

      if (rpe < minRpe) minRpe = rpe;
      if (rpe > maxRpe) maxRpe = rpe;

      totalRpe += rpe;
    }

    if (set.is_tracking_resistance_level) {
      numResistanceLevelSets++;

      if (maxResistanceLevel === -1) {
        maxResistanceLevel = 0;
        totalResistanceLevel = 0;
      }

      const resistanceLevel = set.resistance_level;

      if (resistanceLevel < minResistanceLevel)
        minResistanceLevel = resistanceLevel;
      if (resistanceLevel > maxResistanceLevel)
        maxResistanceLevel = resistanceLevel;

      totalResistanceLevel += resistanceLevel;
    }

    if (set.is_tracking_user_weight && bodyWeight === -1) {
      // Only add first value in Set List

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
        : ConvertNumberToTwoDecimals(totalWeight / numWeightSets)
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
      totalReps === -1 ? -1 : Math.round(totalReps / numRepsSets)
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
        : Math.round(totalPartialReps / numPartialRepSets)
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
        : Math.round(totalRepsAndPartialReps / numRepsAndPartialRepsSets)
    );
  }

  if (loadExerciseOptions.has("num_reps_and_partial_reps_total")) {
    analyticsValuesMap.set(
      "num_reps_and_partial_reps_total",
      totalRepsAndPartialReps
    );
  }

  if (loadExerciseOptions.has("rir_min")) {
    analyticsValuesMap.set("rir_min", minRir === Infinity ? -1 : minRir);
  }

  if (loadExerciseOptions.has("rir_max")) {
    analyticsValuesMap.set("rir_max", maxRir);
  }

  if (loadExerciseOptions.has("rir_avg")) {
    analyticsValuesMap.set(
      "rir_avg",
      totalRir === -1 ? -1 : Math.round(totalRir / numRirSets)
    );
  }

  if (loadExerciseOptions.has("rpe_min")) {
    analyticsValuesMap.set("rpe_min", minRpe === Infinity ? -1 : minRpe);
  }

  if (loadExerciseOptions.has("rpe_max")) {
    analyticsValuesMap.set("rpe_max", maxRpe);
  }

  if (loadExerciseOptions.has("rpe_avg")) {
    analyticsValuesMap.set(
      "rpe_avg",
      totalRpe === -1 ? -1 : Math.round(totalRpe / numRpeSets)
    );
  }

  if (loadExerciseOptions.has("resistance_level_min")) {
    analyticsValuesMap.set(
      "resistance_level_min",
      minResistanceLevel === Infinity ? -1 : minResistanceLevel
    );
  }

  if (loadExerciseOptions.has("resistance_level_max")) {
    analyticsValuesMap.set("resistance_level_max", maxResistanceLevel);
  }

  if (loadExerciseOptions.has("resistance_level_avg")) {
    analyticsValuesMap.set(
      "resistance_level_avg",
      totalResistanceLevel === -1
        ? -1
        : Math.round(totalResistanceLevel / numResistanceLevelSets)
    );
  }

  if (loadExerciseOptions.has("set_body_weight")) {
    analyticsValuesMap.set("set_body_weight", bodyWeight);
  }

  return { analyticsValuesMap, commentMap };
};
