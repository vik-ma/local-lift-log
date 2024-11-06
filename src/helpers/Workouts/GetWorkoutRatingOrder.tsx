import { ValidateWorkoutRatingsOrderString, WorkoutRatingsMap } from "..";

export const GetWorkoutRatingOrder = (
  workoutRatingOrderString: string
): number[] => {
  if (!ValidateWorkoutRatingsOrderString(workoutRatingOrderString))
    return Object.values(WorkoutRatingsMap()).map((item) => item.num);

  return workoutRatingOrderString.split(",").map(Number);
};
