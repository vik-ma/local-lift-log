import { WorkoutTemplate } from "../../typings";

export const DefaultNewWorkoutTemplate = () => {
  const defaultNewWorkoutTemplate: WorkoutTemplate = {
    id: 0,
    name: "",
    exercise_order: "",
    note: "",
  };

  return defaultNewWorkoutTemplate;
};
