import { ChartDataExerciseCategoryBase } from "../../typings";

export const ValidLoadExerciseOptionsMap = () => {
  const VALID_LOAD_EXERCISE_OPTIONS_MAP = new Map<
    ChartDataExerciseCategoryBase,
    string
  >([
    ["weight_min", "Min Weight"],
    ["weight_max", "Max Weight"],
    ["weight_average", "Average Weight"],
    ["weight_total", "Total Weight"],
    ["num_sets", "Number Of Sets"],
    ["num_reps_min", "Min Reps"],
    ["num_reps_max", "Max Reps"],
    ["num_reps_average", "Average Reps"],
    ["num_reps_total", "Total Reps"],
    ["num_reps_and_partial_reps_min", "Min Reps + Partial Reps"],
    ["num_reps_and_partial_reps_max", "Max Reps + Partial Reps"],
    ["num_reps_and_partial_reps_average", "Average Reps + Partial Reps"],
    ["num_reps_and_partial_reps_total", "Total Reps + Partial Reps"],
    ["num_partial_reps_min", "Min Partial Reps"],
    ["num_partial_reps_max", "Max Partial Reps"],
    ["num_partial_reps_average", "Average Partial Reps"],
    ["num_partial_reps_total", "Total Partial Reps"],
    ["set_body_weight", "Body Weight"],
    ["rir_min", "Min RIR"],
    ["rir_max", "Max RIR"],
    ["rir_average", "Average RIR"],
    ["rpe_min", "Min RPE"],
    ["rpe_max", "Max RPE"],
    ["rpe_average", "Average RPE"],
    ["distance_min", "Min Distance"],
    ["distance_max", "Max Distance"],
    ["distance_average", "Average Distance"],
    ["distance_total", "Total Distance"],
    ["time_min", "Min Time"],
    ["time_max", "Max Time"],
    ["time_average", "Average Time"],
    ["time_total", "Total Time"],
    ["distance_per_time_min", "Min Pace"],
    ["distance_per_time_max", "Max Pace"],
    ["distance_per_time_average", "Average Pace"],
    ["resistance_level_min", "Min Resistance Level"],
    ["resistance_level_max", "Max Resistance Level"],
    ["resistance_level_average", "Average Resistance Level"],
  ]);

  Object.freeze(VALID_LOAD_EXERCISE_OPTIONS_MAP);

  return VALID_LOAD_EXERCISE_OPTIONS_MAP;
};
