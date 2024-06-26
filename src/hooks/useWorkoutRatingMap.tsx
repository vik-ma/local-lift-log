import { ReactElement, useMemo } from "react";

type WorkoutRatingMap = {
  [key: number]: {
    text: string;
    span: ReactElement;
  };
};

export const useWorkoutRatingMap = () => {
  const workoutRatingMap = useMemo(() => {
    const workoutRatingMap: WorkoutRatingMap = {
      0: { text: "No Rating", span: <span>No Rating</span> },
      1: {
        text: "Good",
        span: <span className="text-success">Good</span>,
      },
      2: { text: "Bad", span: <span className="text-danger">Bad</span> },
    };

    return workoutRatingMap;
  }, []);

  return workoutRatingMap;
};
