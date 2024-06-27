import { WorkoutSet } from "../../typings";

export const DefaultNewSet = (isTemplate: boolean): WorkoutSet => {
  const defaultNewSet: WorkoutSet = {
    id: 0,
    workout_id: 0,
    exercise_id: 0,
    is_template: isTemplate ? 1 : 0,
    workout_template_id: 0,
    note: null,
    comment: null,
    is_completed: 0,
    time_completed: null,
    is_warmup: 0,
    weight: 0,
    reps: 0,
    rir: 0,
    rpe: 0,
    time_in_seconds: 0,
    distance: 0,
    resistance_level: 0,
    partial_reps: 0,
    is_tracking_weight: 0,
    is_tracking_reps: 0,
    is_tracking_rir: 0,
    is_tracking_rpe: 0,
    is_tracking_time: 0,
    is_tracking_distance: 0,
    is_tracking_resistance_level: 0,
    is_tracking_partial_reps: 0,
    weight_unit: "",
    distance_unit: "",
    multiset_id: 0,
  };

  return defaultNewSet;
};
