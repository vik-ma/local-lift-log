import { ReactElement, useMemo } from "react";

type WorkoutRatingMap = {
  [key: number]: {
    text: string;
    span: ReactElement;
    textStyle: string;
    dropdownStyle: string;
  };
};

export const useWorkoutRatingMap = () => {
  const workoutRatingMap = useMemo(() => {
    const workoutRatingMap: WorkoutRatingMap = {
      0: {
        text: "No Rating",
        span: <span>No Rating</span>,
        textStyle: "",
        dropdownStyle: "",
      },
      1: {
        text: "Good",
        span: <span className="text-success">Good</span>,
        textStyle: "text-success",
        dropdownStyle: "group-data-[has-value=true]:text-success",
      },
      2: {
        text: "Bad",
        span: <span className="text-danger">Bad</span>,
        textStyle: "text-danger",
        dropdownStyle: "group-data-[has-value=true]:text-danger",
      },
    };

    return workoutRatingMap;
  }, []);

  return workoutRatingMap;
};
