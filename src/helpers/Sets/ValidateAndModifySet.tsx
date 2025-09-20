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
    set.rir = GetValidatedSetValue(set.rir, "rir");

    if (set.is_completed && set.rir === -1) set.is_tracking_rir = 0;
  }

  if (set.is_tracking_rpe || validateAllValues) {
    set.rpe = GetValidatedSetValue(set.rpe, "rpe");

    if (set.is_completed && set.rpe === 0) set.is_tracking_rpe = 0;
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
    set.user_weight = GetValidatedSetValue(set.user_weight, "weight");
    set.user_weight_unit = GetValidatedUnit(set.user_weight_unit, "weight");

    if (set.is_completed && set.user_weight === 0)
      set.is_tracking_user_weight = 0;
  }
};
