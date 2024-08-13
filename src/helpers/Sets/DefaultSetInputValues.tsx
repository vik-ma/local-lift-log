import { SetTrackingValuesInput } from "../../typings";

export const DefaultSetInputValues = (): SetTrackingValuesInput => {
  const defaultSetInputValues: SetTrackingValuesInput = {
    weight: "",
    reps: "",
    rir: "",
    rpe: "",
    distance: "",
    resistance_level: "",
    partial_reps: "",
    user_weight: "",
  };
  return defaultSetInputValues;
};
