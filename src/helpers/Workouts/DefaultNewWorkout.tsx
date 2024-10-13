import { Workout } from "../../typings";

export const DefaultNewWorkout = () => {
  const defaultNewWorkout: Workout = {
    id: 0,
    workout_template_id: 0,
    date: "",
    exercise_order: "",
    note: null,
    rating: 0,
    numSets: 0,
    numExercises: 0,
    workoutTemplateName: null,
  };

  return defaultNewWorkout;
};
