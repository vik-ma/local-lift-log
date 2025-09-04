import { DEFAULT_SET } from "../../constants";
import { WorkoutSet } from "../../typings";

export const CreateDefaultSet = (isTemplate: boolean) => {
  const defaultSet: WorkoutSet = {
    ...DEFAULT_SET,
    is_template: isTemplate ? 1 : 0,
  };

  return defaultSet;
};
