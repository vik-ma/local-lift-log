import { Exercise } from "../../typings";

export const DefaultNewExercise = () => {
  const defaultNewExercise: Exercise = {
    id: 0,
    name: "",
    exercise_group_set_string: "",
    note: "",
    is_favorite: 0,
    calculation_string: null,
    exerciseGroupStringList: [],
    formattedGroupString: "",
  };

  return defaultNewExercise;
};
