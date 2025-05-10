import { ChartDataExerciseCategoryBase, WorkoutSet } from "../../typings";
import {
  CalculatePaceValue,
  CalculateSpeedValue,
  ConvertDistanceValue,
  ConvertNumberToTwoDecimals,
  ConvertSecondsToMinutes,ConvertWeightValue
} from "..";

export const GetAnalyticsValuesForSetList = (
  setList: WorkoutSet[],
  loadExerciseOptions: Set<ChartDataExerciseCategoryBase>,
  weightUnit: string,
  distanceUnit: string,
  speedUnit: string,
  paceUnit: string,
  ignoreWarmups: boolean,
  ignoreMultisets: boolean
) => {
  const analyticsValuesMap = new Map<ChartDataExerciseCategoryBase, number>();
  const commentMap = new Map<number, string>();
  let includesMultiset = false;
  const workoutCommentMap = new Map<number, string>();

  // If -1 is returned for option, no tracked value was found
  let minWeight = Infinity;
  let maxWeight = -1;
  let totalWeight = -1;
  let weightVolume = -1;
  let numWeightSets = 0;

  let minDistance = Infinity;
  let maxDistance = -1;
  let totalDistance = -1;
  let numDistanceSets = 0;

  let minTime = Infinity;
  let maxTime = -1;
  let totalTime = -1;
  let numTimeSets = 0;

  let minSpeed = Infinity;
  let maxSpeed = -1;
  let totalSpeed = -1;
  let numSpeedSets = 0;

  let minPace = Infinity;
  let maxPace = -1;
  let totalPace = -1;
  let numPaceSets = 0;

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

    if (ignoreWarmups && set.is_warmup) continue;
    if (ignoreMultisets && set.multiset_id > 0) continue;

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

    if (set.is_tracking_distance) {
      numDistanceSets++;

      if (maxDistance === -1) {
        maxDistance = 0;
        totalDistance = 0;
      }

      const distance = ConvertDistanceValue(
        set.distance,
        set.distance_unit,
        distanceUnit
      );

      if (distance < minDistance) minDistance = distance;
      if (distance > maxDistance) maxDistance = distance;

      totalDistance += distance;

      if (set.is_tracking_time) {
        numSpeedSets++;
        numPaceSets++;

        if (maxSpeed === -1) {
          maxSpeed = 0;
          totalSpeed = 0;
          maxPace = 0;
          totalPace = 0;
        }

        const speed = CalculateSpeedValue(
          distance,
          distanceUnit,
          set.time_in_seconds,
          speedUnit
        );

        if (speed < minSpeed) minSpeed = speed;
        if (speed > maxSpeed) maxSpeed = speed;

        totalSpeed += speed;

        const pace = CalculatePaceValue(
          distance,
          distanceUnit,
          set.time_in_seconds,
          paceUnit
        );

        if (pace < minPace) minPace = pace;
        if (pace > maxPace) maxPace = pace;

        totalPace += pace;
      }
    }

    if (set.is_tracking_time) {
      numTimeSets++;

      if (maxTime === -1) {
        maxTime = 0;
        totalTime = 0;
      }

      const timeInMinutes = ConvertSecondsToMinutes(set.time_in_seconds);

      if (timeInMinutes < minTime) minTime = timeInMinutes;
      if (timeInMinutes > maxTime) maxTime = timeInMinutes;

      totalTime += timeInMinutes;
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

    if (set.multiset_id > 0) {
      includesMultiset = true;
    }

    if (set.workout_comment !== null) {
      workoutCommentMap.set(set.workout_id, set.workout_comment!);
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

  if (loadExerciseOptions.has("distance_min")) {
    analyticsValuesMap.set(
      "distance_min",
      minDistance === Infinity ? -1 : minDistance
    );
  }

  if (loadExerciseOptions.has("distance_max")) {
    analyticsValuesMap.set("distance_max", maxDistance);
  }

  if (loadExerciseOptions.has("distance_avg")) {
    analyticsValuesMap.set(
      "distance_avg",
      totalDistance === -1 ? -1 : Math.round(totalDistance / numDistanceSets)
    );
  }

  if (loadExerciseOptions.has("distance_total")) {
    analyticsValuesMap.set("distance_total", totalDistance);
  }

  if (loadExerciseOptions.has("time_min")) {
    analyticsValuesMap.set("time_min", minTime === Infinity ? -1 : minTime);
  }

  if (loadExerciseOptions.has("time_max")) {
    analyticsValuesMap.set("time_max", maxTime);
  }

  if (loadExerciseOptions.has("time_avg")) {
    analyticsValuesMap.set(
      "time_avg",
      totalTime === -1 ? -1 : Math.round(totalTime / numTimeSets)
    );
  }

  if (loadExerciseOptions.has("time_total")) {
    analyticsValuesMap.set("time_total", totalTime);
  }

  if (loadExerciseOptions.has("speed_min")) {
    analyticsValuesMap.set("speed_min", minSpeed === Infinity ? -1 : minSpeed);
  }

  if (loadExerciseOptions.has("speed_max")) {
    analyticsValuesMap.set("speed_max", maxSpeed);
  }

  if (loadExerciseOptions.has("speed_avg")) {
    analyticsValuesMap.set(
      "speed_avg",
      totalSpeed === -1 ? -1 : Math.round(totalSpeed / numSpeedSets)
    );
  }

  if (loadExerciseOptions.has("pace_min")) {
    analyticsValuesMap.set("pace_min", minPace === Infinity ? -1 : minPace);
  }

  if (loadExerciseOptions.has("pace_max")) {
    analyticsValuesMap.set("pace_max", maxPace);
  }

  if (loadExerciseOptions.has("pace_avg")) {
    analyticsValuesMap.set(
      "pace_avg",
      totalPace === -1 ? -1 : Math.round(totalPace / numPaceSets)
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

  return {
    analyticsValuesMap,
    commentMap,
    includesMultiset,
    workoutCommentMap,
  };
};
