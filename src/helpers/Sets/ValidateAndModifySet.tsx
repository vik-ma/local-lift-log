import { WorkoutSet } from "../../typings";
import { GetValidatedUnit, GetValidatedSetValue } from "..";

export const ValidateAndModifySet = (set: WorkoutSet) => {
  if (set.is_tracking_weight) {
    set.weight = GetValidatedSetValue(set.weight, "weight");
    set.weight_unit = GetValidatedUnit(set.weight_unit, "weight");
  }

  if (set.is_tracking_reps) {
    set.reps = GetValidatedSetValue(set.reps, "reps");
  }

  if (set.is_tracking_distance) {
    set.distance = GetValidatedSetValue(set.distance, "distance");
    set.distance_unit = GetValidatedUnit(set.distance_unit, "distance");
  }

  if (set.is_tracking_time) {
    set.time_in_seconds = GetValidatedSetValue(set.time_in_seconds, "time");
  }

  if (set.is_tracking_rir) {
    set.rir = GetValidatedSetValue(set.rir, "rir");
  }

  if (set.is_tracking_rpe) {
    set.rpe = GetValidatedSetValue(set.rpe, "rpe");
  }

  if (set.is_tracking_resistance_level) {
    set.resistance_level = GetValidatedSetValue(
      set.resistance_level,
      "resistance_level"
    );
  }

  if (set.is_tracking_partial_reps) {
    set.partial_reps = GetValidatedSetValue(set.partial_reps, "partial_reps");
  }

  if (set.is_tracking_user_weight) {
    set.user_weight = GetValidatedSetValue(set.user_weight, "weight");
    set.user_weight_unit = GetValidatedUnit(set.user_weight_unit, "weight");
  }
};
