import { IsNumberValid, IsNumberValidInteger } from "..";

type SetTrackingKeys =
  | "weight"
  | "reps"
  | "distance"
  | "time"
  | "rir"
  | "rpe"
  | "resistance_level"
  | "partial_reps";

export const GetValidatedSetValue = (value: number, key: SetTrackingKeys) => {
  switch (key) {
    case "weight":
      return IsNumberValid(value) ? value : 0;
    case "reps":
      return IsNumberValidInteger(value) ? value : 0;
    case "distance":
      return IsNumberValid(value) ? value : 0;
    case "time":
      return IsNumberValidInteger(value) ? value : 0;
    case "rir": {
      const minValue = -1;
      return IsNumberValidInteger(value, minValue) ? value : -1;
    }
    case "rpe": {
      const minValue = 0;
      const doNotAllowMinValue = false;
      const maxValue = 10;
      return IsNumberValidInteger(value, minValue, doNotAllowMinValue, maxValue)
        ? value
        : 0;
    }
    case "resistance_level":
      return IsNumberValid(value) ? value : 0;
    case "partial_reps":
      return IsNumberValidInteger(value) ? value : 0;
    default:
      return 0;
  }
};
