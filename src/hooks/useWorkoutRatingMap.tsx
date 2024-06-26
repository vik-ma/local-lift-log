import { ReactElement, useMemo } from "react";

type WorkoutRatingMap = {
  [key: number]: {
    text: string;
    span: ReactElement;
    textStyle: string;
  };
};

export const useWorkoutRatingMap = () => {
  const workoutRatingMap = useMemo(() => {
    const workoutRatingMap: WorkoutRatingMap = {
      0: { text: "No Rating", span: <span>No Rating</span>, textStyle: "" },
      1: {
        text: "Good",
        span: <span className="text-success">Good</span>,
        textStyle: "text-success",
      },
      2: {
        text: "Bad",
        span: <span className="text-danger">Bad</span>,
        textStyle: "text-danger",
      },
    };

    return workoutRatingMap;
  }, []);

  return workoutRatingMap;
};
