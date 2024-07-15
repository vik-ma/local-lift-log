import { WorkoutSet } from "../../typings";

export const AssignTrackingValuesIfCardio = (
  set: WorkoutSet,
  formattedGroupString: string
) => {
  if (formattedGroupString === "Cardio") {
    set = {
      ...set,
      is_tracking_weight: 0,
      is_tracking_reps: 0,
      is_tracking_distance: 1,
      is_tracking_time: 1,
    };
  } else {
    set = {
      ...set,
      is_tracking_weight: 1,
      is_tracking_reps: 1,
      is_tracking_distance: 0,
      is_tracking_time: 0,
    };
  }

  return set;
};
