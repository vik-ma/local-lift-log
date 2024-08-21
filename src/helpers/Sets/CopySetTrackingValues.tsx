import { WorkoutSet } from "../../typings";

export const CopySetTrackingValues = (
  oldSet: WorkoutSet,
  newSet: WorkoutSet
): WorkoutSet => {
  const updatedSet = { ...newSet };

  updatedSet.weight = oldSet.weight;
  updatedSet.reps = oldSet.reps;
  updatedSet.rir = oldSet.rir;
  updatedSet.rpe = oldSet.rpe;
  updatedSet.time_in_seconds = oldSet.time_in_seconds;
  updatedSet.distance = oldSet.distance;
  updatedSet.resistance_level = oldSet.resistance_level;
  updatedSet.partial_reps = oldSet.partial_reps;
  updatedSet.is_tracking_weight = oldSet.is_tracking_weight;
  updatedSet.is_tracking_reps = oldSet.is_tracking_reps;
  updatedSet.is_tracking_rir = oldSet.is_tracking_rir;
  updatedSet.is_tracking_rpe = oldSet.is_tracking_rpe;
  updatedSet.is_tracking_time = oldSet.is_tracking_time;
  updatedSet.is_tracking_distance = oldSet.is_tracking_distance;
  updatedSet.is_tracking_resistance_level = oldSet.is_tracking_resistance_level;
  updatedSet.is_tracking_partial_reps = oldSet.is_tracking_partial_reps;
  updatedSet.is_tracking_user_weight = oldSet.is_tracking_user_weight;
  updatedSet.weight_unit = oldSet.weight_unit;
  updatedSet.distance_unit = oldSet.distance_unit;
  updatedSet.user_weight = oldSet.user_weight;
  updatedSet.user_weight_unit = oldSet.user_weight_unit;

  return updatedSet;
};
