import { UserSettings, WorkoutSet } from "../../typings";

export const CopyWorkoutSetList = (
  setList: WorkoutSet[],
  newWorkoutId: number,
  keepSetValues: boolean,
  userSettings: UserSettings
) => {
  const newSetList = [...setList];

  for (const set of newSetList) {
    set.workout_id = newWorkoutId;
    set.comment = null;
    set.is_completed = 0;
    set.time_completed = null;

    if (!keepSetValues) {
      set.weight = 0;
      set.reps = 0;
      set.rir = -1;
      set.rpe = 0;
      set.time_in_seconds = 0;
      set.distance = 0;
      set.resistance_level = 0;
      set.partial_reps = 0;
      set.user_weight = 0;
    } else {
      set.weight_unit = userSettings.default_unit_weight;
      set.distance_unit = userSettings.default_unit_distance;
      set.user_weight_unit = userSettings.default_unit_weight;
    }
  }

  return newSetList;
};
