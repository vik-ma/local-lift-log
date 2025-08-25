import { ExerciseFilterValues } from "../../typings";

export const DefaultExerciseFilterValues = () => {
  const DEFAULT_DIET_LOG_FILTER_VALUES: ExerciseFilterValues = {
    filterExerciseGroups: [],
    includeSecondaryGroups: false,
  };

  return DEFAULT_DIET_LOG_FILTER_VALUES;
};
