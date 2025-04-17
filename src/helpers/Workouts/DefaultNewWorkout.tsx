import { Workout } from "../../typings";

export const DefaultNewWorkout = () => {
  const defaultNewWorkout: Workout = {
    id: 0,
    workout_template_id: 0,
    date: "",
    exercise_order: "",
    comment: null,
    numSets: 0,
    numExercises: 0,
    routine_id: 0,
  };

  return defaultNewWorkout;
};
