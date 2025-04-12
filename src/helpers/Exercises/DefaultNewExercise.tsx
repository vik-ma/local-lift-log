import { Exercise } from "../../typings";

export const DefaultNewExercise = () => {
  const defaultNewExercise: Exercise = {
    id: 0,
    name: "",
    exercise_group_set_string_primary: "",
    exercise_group_map_string_secondary: null,
    note: "",
    is_favorite: 0,
    calculation_string: null,
    chart_load_exercise_options: "",
    chart_load_exercise_options_categories: "",
    exerciseGroupStringSetPrimary: new Set(),
    formattedGroupStringPrimary: "",
  };

  return defaultNewExercise;
};
