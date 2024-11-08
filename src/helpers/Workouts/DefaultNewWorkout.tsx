import { Workout } from "../../typings";

export const DefaultNewWorkout = () => {
  const defaultNewWorkout: Workout = {
    id: 0,
    workout_template_id: 0,
    date: "",
    exercise_order: "",
    note: null,
    numSets: 0,
    numExercises: 0,
    rating_general: 0,
    rating_energy: 0,
    rating_injury: 0,
    rating_sleep: 0,
    rating_calories: 0,
    rating_fasting: 0,
    rating_time: 0,
    rating_stress: 0,
    routine_id: 0,
  };

  return defaultNewWorkout;
};
