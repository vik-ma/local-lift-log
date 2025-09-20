import { WorkoutSet } from "../../typings";
import { GetValidatedUnit, GetValidatedSetValue } from "..";

export const ValidateAndModifySet = (
  set: WorkoutSet,
  validateAllValues?: boolean
) => {
  if (set.is_tracking_weight || validateAllValues) {
    set.weight = GetValidatedSetValue(set.weight, "weight");
    set.weight_unit = GetValidatedUnit(set.weight_unit, "weight");
  }

  if (set.is_tracking_reps || validateAllValues) {
    set.reps = GetValidatedSetValue(set.reps, "reps");
  }

  if (set.is_tracking_distance || validateAllValues) {
    set.distance = GetValidatedSetValue(set.distance, "distance");
    set.distance_unit = GetValidatedUnit(set.distance_unit, "distance");
  }

  if (set.is_tracking_time || validateAllValues) {
    set.time_in_seconds = GetValidatedSetValue(set.time_in_seconds, "time");
  }

  if (set.is_tracking_rir || validateAllValues) {
    let rir = GetValidatedSetValue(set.rir, "rir");

    if (set.is_completed && rir === -1) rir = 0;

    set.rir = rir;
  }

  if (set.is_tracking_rpe || validateAllValues) {
    let rpe = GetValidatedSetValue(set.rpe, "rpe");

    if (set.is_completed && rpe === 0) rpe = 1;

    set.rpe = rpe;
  }

  if (set.is_tracking_resistance_level || validateAllValues) {
    set.resistance_level = GetValidatedSetValue(
      set.resistance_level,
      "resistance_level"
    );
  }

  if (set.is_tracking_partial_reps || validateAllValues) {
    set.partial_reps = GetValidatedSetValue(set.partial_reps, "partial_reps");
  }

  if (set.is_tracking_user_weight || validateAllValues) {
    const userWeight = GetValidatedSetValue(set.user_weight, "weight");

    set.user_weight = userWeight;
    set.user_weight_unit = GetValidatedUnit(set.user_weight_unit, "weight");

    if (set.is_completed && userWeight === 0) set.is_tracking_user_weight = 0;
  }
};
