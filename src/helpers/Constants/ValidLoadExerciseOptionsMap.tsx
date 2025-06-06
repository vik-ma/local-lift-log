import { ChartDataExerciseCategoryBase } from "../../typings";

export const ValidLoadExerciseOptionsMap = () => {
  const VALID_LOAD_EXERCISE_OPTIONS_MAP = new Map<
    ChartDataExerciseCategoryBase,
    string
  >([
    ["weight_min", "Min Weight"],
    ["weight_max", "Max Weight"],
    ["weight_avg", "Average Weight"],
    ["weight_volume", "Weight Volume"],
    ["distance_min", "Min Distance"],
    ["distance_max", "Max Distance"],
    ["distance_avg", "Average Distance"],
    ["distance_total", "Total Distance"],
    ["time_min", "Min Time"],
    ["time_max", "Max Time"],
    ["time_avg", "Average Time"],
    ["time_total", "Total Time"],
    ["speed_min", "Min Speed"],
    ["speed_max", "Max Speed"],
    ["speed_avg", "Average Speed"],
    ["pace_min", "Min Pace"],
    ["pace_max", "Max Pace"],
    ["pace_avg", "Average Pace"],
    ["rir_min", "Min RIR"],
    ["rir_max", "Max RIR"],
    ["rir_avg", "Average RIR"],
    ["rpe_min", "Min RPE"],
    ["rpe_max", "Max RPE"],
    ["rpe_avg", "Average RPE"],
    ["num_sets", "Number Of Sets"],
    ["num_reps_min", "Min Reps"],
    ["num_reps_max", "Max Reps"],
    ["num_reps_avg", "Average Reps"],
    ["num_reps_total", "Total Reps"],
    ["num_partial_reps_min", "Min Partial Reps"],
    ["num_partial_reps_max", "Max Partial Reps"],
    ["num_partial_reps_avg", "Average Partial Reps"],
    ["num_partial_reps_total", "Total Partial Reps"],
    ["num_reps_and_partial_reps_min", "Min Reps + Partial Reps"],
    ["num_reps_and_partial_reps_max", "Max Reps + Partial Reps"],
    ["num_reps_and_partial_reps_avg", "Average Reps + Partial Reps"],
    ["num_reps_and_partial_reps_total", "Total Reps + Partial Reps"],
    ["resistance_level_min", "Min Resistance Level"],
    ["resistance_level_max", "Max Resistance Level"],
    ["resistance_level_avg", "Average Resistance Level"],
    ["set_body_weight", "Body Weight"],
  ]);

  Object.freeze(VALID_LOAD_EXERCISE_OPTIONS_MAP);

  return VALID_LOAD_EXERCISE_OPTIONS_MAP;
};
