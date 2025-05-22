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
    case "reps": {
      return IsNumberValidInteger(value) ? value : 0;
    }
    case "distance": {
      return IsNumberValid(value) ? value : 0;
    }
    case "time": {
      return IsNumberValidInteger(value) ? value : 0;
    }
    case "rir": {
      return IsNumberValidInteger(value, -1) ? value : -1;
    }
    case "rpe": {
      return IsNumberValidInteger(value, 0, false, 10) ? value : 0;
    }
    case "resistance_level": {
      return IsNumberValid(value) ? value : 0;
    }
    case "partial_reps": {
      return IsNumberValidInteger(value) ? value : 0;
    }
    default:
      return 0;
  }
};
