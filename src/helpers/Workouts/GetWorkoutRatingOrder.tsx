import { ValidateWorkoutRatingsOrderString } from "..";

export const GetWorkoutRatingOrder = (
  workoutRatingOrderString: string
): number[] => {
  if (!ValidateWorkoutRatingsOrderString(workoutRatingOrderString))
    return [1, 2, 3, 4, 5, 6, 7, 8];

  return workoutRatingOrderString.split(",").map(Number);
};
